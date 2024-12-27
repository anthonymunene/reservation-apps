// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { Knex } from "knex"
import { randomUUID } from "crypto"
import { Table } from "@database-generated-types/knex-db"

import { randomiseInt } from "@utils/randomise"
import reviewsSeedData from "@seeds/data/reviews.json"
import type { Reviews } from "@seeds/utils/types/reviews"
import {
  generateImages,
  getMatchingFile,
  replacePrimaryImageForEntity,
  uploadToS3,
} from "@seeds/utils/shared"
import { PropertyId } from "@seeds/utils/types/properties"
import { UserAccountDependencies, UserDataGenerator, UserId } from "@seeds/utils/types/users"
import { ProfileData, UserProfileDependencies } from "@seeds/utils/types/profiles"
//@ts-ignore
import { faker } from "@faker-js/faker"
import { TOTAL_USER_ACCOUNTS, USERS_IMAGE_DIR } from "@seeds/utils/variables"

const createDefaultUserDataGenerator: UserDataGenerator = {
  generateUserAccount: () => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }),
  generateProfile: userId => ({
    id: faker.string.uuid(),
    firstName: faker.person.firstName(),
    surname: faker.person.lastName(),
    bio: faker.lorem.sentences(),
    userId,
  }),
}

const createUserAccountDependencies = (
  overrides: Partial<UserAccountDependencies> = {}
): UserAccountDependencies => ({
  database: overrides.database || { query: null },
  dataGenerator: overrides.dataGenerator || createDefaultUserDataGenerator.generateUserAccount,
})
const createUserAccounts = (
  userCount: number = 1,
  dependencies: Partial<UserAccountDependencies> = {}
) => {
  const deps = createUserAccountDependencies(dependencies)
  const { dataGenerator } = deps
  return Array.from({ length: userCount }, () => dataGenerator())
}
const getRandomisedPropertyIds = (
  propertyIds: PropertyId[],
  propertyIdCount = 2,
  dependencies = { faker }
) => {
  const { faker } = dependencies
  return faker.helpers.arrayElements(propertyIds, propertyIdCount)
}

const getAllPropertiesWithoutOwner = async (knex: Knex): Promise<PropertyId[]> => {
  const propertiesById: PropertyId[] = await knex
    .select("id")
    .from(Table.Property)
    .whereNull("host")
  console.log(`Properties without owners by Id ${JSON.stringify(propertiesById)}`)
  return propertiesById
}

const getFreeProperty = async (
  dbClient: Knex,
  { fetchUnownedProperties = getAllPropertiesWithoutOwner } = {}
) => {
  const unownedProperties = await fetchUnownedProperties(dbClient)
  return getRandomisedPropertyIds(unownedProperties)
}

const createUserProfileDependencies = (
  overrides: Partial<UserProfileDependencies> = {}
): UserProfileDependencies => ({
  database: overrides.database || { query: null },
  dataGenerator: overrides.dataGenerator || createDefaultUserDataGenerator.generateProfile,
})
const createProfiles = async (
  user: UserId,
  dependencies: Partial<UserProfileDependencies> = {}
) => {
  const deps = createUserProfileDependencies(dependencies)
  const { dataGenerator, database } = deps
  const { id } = user
  const profile: Omit<ProfileData, "defaultPic"> = dataGenerator(id)
  const userProfile = await database.query.insert(profile).into(Table.Profile).returning(["id"])

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
  dependencies = { createUserAccounts, createProfiles, getFreeProperty, ownProperty }
): Promise<UserId[]> => {
  console.log(`Creating users...`)
  const { createUserAccounts, createProfiles, getFreeProperty, ownProperty } = dependencies
  const userAccounts = createUserAccounts(TOTAL_USER_ACCOUNTS)
  const users: UserId[] = []
  // await clearImageFolder(`${seedUserImageDir}/*.png`)
  //   .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))

  //   .catch(error => console.log(`something went wrong deleting files:\n${error}`));

  for (const userAccount of userAccounts) {
    const [user]: UserId[] = await knex.insert(userAccount, ["id"]).into(Table.User)
    if (!user) continue
    await createProfiles(user, { database: { query: knex } })

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
  const reviews = reviewsSeedData as Reviews
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
    await generateImages(userData, "users").then(async result => {
      if (result.isOk()) {
        await updateProfilePictures(knex)
      } else {
        console.log(result.error)
      }
    })
    await createReviews(knex)
  } catch (e) {
    console.log(e)
  }
}
