//@ts-ignore
import { faker } from "@faker-js/faker"
import { UserAccountDependencies, UserDataGenerator, UserId } from "@seeds/utils/types/users"
import { Knex } from "knex"
import { ProfileData, UserProfileDependencies } from "@seeds/utils/types/profiles"
import { Table } from "@database-generated-types/knex-db"
import { getFreeProperty, ownProperty } from "@seeds/properties"
import { TOTAL_USER_ACCOUNTS, USERS_IMAGE_DIR } from "@seeds/utils/variables"
import { getMatchingFile, replacePrimaryImageForEntity, uploadToS3 } from "@seeds/utils/shared"

export const createDefaultUserDataGenerator: UserDataGenerator = {
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

export const getUsers = async (dbClient: DatabaseClient) => await dbClient.select("id").from("User")

export const createUserAccountDependencies = (
  overrides: Partial<UserAccountDependencies> = {}
): UserAccountDependencies => ({
  database: overrides.database || { query: null },
  dataGenerator: overrides.dataGenerator || createDefaultUserDataGenerator.generateUserAccount,
})
export const createUserAccounts = (
  userCount: number = 1,
  dependencies: Partial<UserAccountDependencies> = {}
) => {
  const deps = createUserAccountDependencies(dependencies)
  const { dataGenerator } = deps
  return Array.from({ length: userCount }, () => dataGenerator())
}

export const createUserProfileDependencies = (
  overrides: Partial<UserProfileDependencies> = {}
): UserProfileDependencies => ({
  database: overrides.database || { query: null },
  dataGenerator: overrides.dataGenerator || createDefaultUserDataGenerator.generateProfile,
})

export const createProfiles = async (
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

export const createUsersAndProfiles = async (
  dbClient: DatabaseClient,
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

      const propertyToOwn = await getFreeProperty(dbClient)

    if (propertyToOwn.length) await ownProperty(propertyToOwn, user, knex)

    users.push(user)
  }

  return users
}

export const updateProfilePictures = async (
  dbClient: DatabaseClient,
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
