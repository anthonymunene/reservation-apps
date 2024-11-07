// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import * as fs from "node:fs/promises"
import { type Knex } from "knex"
import { type Users } from "../src/services/users/users.schema"
import { type Properties } from "../src/services/properties/properties.schema"
import { type Profiles } from "../src/services/profiles/profiles.schema"
import { randomUUID } from "crypto"

import { randomiseInt } from "../src/utils/randomise"
import * as reviews from "./data/reviews.json"
import { getFiles, getPresignedUrl, USERS_IMAGE_DIR } from "./utils/shared"
//@ts-ignore
import { faker } from "@faker-js/faker"
import { imageSeeder } from "./utils/seedImages"

// Type definitions
// TODO: move to shared
type PropertyId = Pick<Properties, "id">
type UserId = Pick<Users, "id">
type ProfileData = Pick<Profiles, "id" | "userId" | "firstName" | "surname" | "bio" | "defaultPic">

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
  const propertiesById: PropertyId[] = await knex.select("id").from("Property").whereNull("host")
  console.log(`Properties without owners by Id ${JSON.stringify(propertiesById)}`)
  return propertiesById
}

const getMatchingFile = async (userId: string, getUserPics = getFiles): Promise<[string, Buffer] | undefined> => {
  const filesNames = getUserPics("seeds/images/users")
  if (!filesNames.length || !userId) return undefined

  const matchingFile = filesNames.find(fileName => fileName.includes(userId))
  if (!matchingFile) return undefined

  const content = await fs.readFile(`${process.cwd()}/${USERS_IMAGE_DIR}/${matchingFile}`)
  return [matchingFile, content]
}
const createProfilePictures = async (users: UserId[], { getImages = imageSeeder } = {}): Promise<undefined | Error> => {
  try {
    if (!users) return new Error("users missing")

    const seedImages = await getImages()
    await Promise.all(users.map(({ id }) => seedImages({ type: "users", id })))
  } catch (e) {
    return new Error(e)
  }
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

  const userProfile = await knex.insert(profile).into("Profile").returning(["id"])

  console.log(`Returned profileId ${JSON.stringify(userProfile[0]?.id)}`)
  return userProfile[0]
}

const getUsers = async (knex: Knex) => await knex.select("id").from("User")

const upload = async (fileName: string, fileData: Buffer, dependencies = { getPresignedUrl }) => {
  try {
    const { getPresignedUrl } = dependencies
    const presignedUrl = await getPresignedUrl(fileName, "users")
    return await fetch(presignedUrl, {
      method: "PUT",
      body: fileData,
    })
  } catch (e) {
    return new Error(e)
  }
}

const ownProperty = async (properties: PropertyId[], user: UserId, dbClient: Knex) => {
  await Promise.all(
    properties.map(async property => {
      const { id } = user
      console.log(`User: ${user.id} \n Properties to own: \n ${JSON.stringify(properties)} \n\n`)
      await dbClient("Property")
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
    const [user]: UserId[] = await knex.insert(userAccount, ["id"]).into("User")
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
    dbClient.select("id").from("User"),
    dbClient.select("id").from("Property"),
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
        .into("Review")
    })
  )
}

const updateDefaultPic = async (dbClient: Knex, id: string, fileName: string) => {
  try {
    await dbClient("Profile")
      .where("userId", id)
      .update({
        defaultPic: JSON.stringify({
          url: fileName,
        }),
      })
      .update({ updatedAt: dbClient.fn.now() })
  } catch (e) {
    console.log(e)
  }
}
const updateDefaultProfilePictures = async (
  dbClient: Knex,
  dependencies = { getUsers, upload, getMatchingFile: getMatchingFile }
) => {
  const { getUsers, upload, getMatchingFile } = dependencies
  try {
    const users = await getUsers(dbClient)

    await Promise.all(
      users.map(async user => {
        const matchingFile = await getMatchingFile(user.id)
        if (!matchingFile) return
        const [name, content] = matchingFile
        if (name && content)
          await upload(name, content).then(async () => {
            await updateDefaultPic(dbClient, user.id, name)
          })
      })
    )
  } catch (error) {
    console.log(error)
  }
}

export async function seed(knex: Knex): Promise<void> {
  try {
    const users = await createUsersAndProfiles(knex)
    await createProfilePictures(users)
    await updateDefaultProfilePictures(knex)
    await createReviews(knex)
  } catch (e) {
    console.log(e)
  }
}
