// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { type Knex } from "knex"
import { type Users } from "../src/services/users/users.schema"
import { randomUUID } from "crypto"
import { Table } from "@database-generated-types"

import { randomiseInt } from "@utils/randomise"
import * as reviews from "@seeds/data/reviews.json"
import { generateImages, getMatchingFile, replacePrimaryImageForEntity, uploadToS3 } from "@seeds/utils/shared"
import {
  ProfileData,
  PropertyId,
  UserAccountDependencies,
  UserDataGenerator,
  UserId,
  UserProfileDependencies,
} from "@seeds/utils/types"
//@ts-ignore
import { faker } from "@faker-js/faker"
import { USERS_IMAGE_DIR } from "@seeds/utils/variables"

const generateUserAccounts = (
  userCount: number = 1,
  { dataGenerator = faker, generateRandomId = randomUUID } = {}
): Array<Pick<Users, "id" | "email" | "password">> =>
  Array.from({ length: userCount }, () => ({
    id: generateRandomId(),
    email: dataGenerator.internet.email(),
    password: dataGenerator.internet.password(),
  }))

const getRandomisedPropertyIds = (propertyIds: PropertyId[], propertyIdCount = 2, dependencies = { faker }) => {
  const { faker } = dependencies
  return faker.helpers.arrayElements(propertyIds, propertyIdCount)
}

const getAllPropertiesWithoutOwner = async (knex: Knex): Promise<PropertyId[]> => {
  const propertiesById: PropertyId[] = await knex.select("id").from(Table.Property).whereNull("host")
  console.log(`Properties without owners by Id ${JSON.stringify(propertiesById)}`)
  return propertiesById
}

const getFreeProperty = async (dbClient: Knex, { fetchUnownedProperties = getAllPropertiesWithoutOwner } = {}) => {
  const unownedProperties = await fetchUnownedProperties(dbClient)
  return getRandomisedPropertyIds(unownedProperties)
}

const createProfiles = async (user: UserId, knex: Knex) => {
  const { id } = user
  const profile: Omit<ProfileData, "defaultPic"> = {
    id: randomUUID(),
    firstName: faker.person.firstName(),
    surname: faker.person.lastName(),
    bio: faker.lorem.sentences(),
    userId: id,
  }

  const userProfile = await knex.insert(profile).into(Table.Profile).returning(["id"])

  console.log(`Returned profileId ${JSON.stringify(userProfile[0]?.id)}`)
  return userProfile[0]
}

const getUsers = async (knex: Knex) => await knex.select("id").from("User")

const ownProperty = async (properties: PropertyId[], user: UserId, dbClient: Knex) => {
  await Promise.all(
    properties.map(async property => {
      const { id } = user
      console.log(`User: ${user.id} \n Properties to own: \n ${JSON.stringify(properties)} \n\n`)
      await dbClient(Table.Property)
        .where("id", (property as PropertyId)["id"])
        .update({
          host: id,
        })
    })
  )
}

const createUsersAndProfiles = async (
  knex: Knex,
  dependencies = { generateUserAccounts, createProfiles, getFreeProperty, ownProperty }
): Promise<UserId[]> => {
  console.log(`Creating users...`)
  const { generateUserAccounts, createProfiles, getFreeProperty, ownProperty } = dependencies
  const userAccounts = generateUserAccounts(10)
  const users: UserId[] = []
  // await clearImageFolder(`${seedUserImageDir}/*.png`)
  //   .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))

  //   .catch(error => console.log(`something went wrong deleting files:\n${error}`));

  for (const userAccount of userAccounts) {
    const [user]: UserId[] = await knex.insert(userAccount, ["id"]).into(Table.User)
    if (!user) continue
    await createProfiles(user, knex)

    const propertyToOwn = await getFreeProperty(knex)

    if (propertyToOwn.length) await ownProperty(propertyToOwn, user, knex)

    users.push(user)
  }

  return users
}

const getRandomReview = (reviews: string[], dependencies = { randomiseInt }) => {
  const { randomiseInt } = dependencies
  return reviews[randomiseInt(reviews.length)]
}
const createReviews = async (dbClient: Knex): Promise<void> => {
  console.log(`Creating reviews...`)
  const [users, properties] = await Promise.all([
    dbClient.select("id").from(Table.User),
    dbClient.select("id").from(Table.Property),
  ])
  const allReviews = [...reviews.positive, ...reviews.negative, ...reviews.mixed]
  await Promise.all(
    properties.map(property => {
      const { id }: UserId = users[randomiseInt(users.length)]

      const review = getRandomReview(allReviews)
      return dbClient
        .insert({
          id: randomUUID(),
          propertyId: property.id,
          userId: id,
          comment: review,
        })
        .into(Table.Review)
    })
  )
}

const updateProfilePictures = async (
  dbClient: Knex,
  dependencies = {
    getUsers,
    uploadToS3,
    getMatchingFile,
  }
) => {
  const { getUsers, uploadToS3, getMatchingFile } = dependencies
  try {
    const users = await getUsers(dbClient)

    await Promise.all(
      users.map(async user => {
        const matchingFile = await getMatchingFile(user.id, USERS_IMAGE_DIR)
        if (!matchingFile) return
        const [fileName, content] = matchingFile
        if (fileName && content)
          await uploadToS3(fileName, content, "users").then(async () => {
            await replacePrimaryImageForEntity(dbClient, user.id, fileName, Table.Profile)
          })
      })
    )
  } catch (error) {
    console.log(error)
  }
}

export async function seed(knex: Knex): Promise<void> {
  try {
    const userData = await createUsersAndProfiles(knex)
    await generateImages(userData, "users")
    await updateProfilePictures(knex)
    await createReviews(knex)
  } catch (e) {
    console.log(e)
  }
}
