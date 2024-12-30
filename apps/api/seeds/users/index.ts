//@ts-ignore
import { faker } from "@faker-js/faker"
import {
  UserAccount,
  UserAccountDependencies,
  UserDataGenerator,
  UserId,
} from "@seeds/utils/types/users"
import { ProfilesData, UserProfileDependencies } from "@seeds/utils/types/profiles"
import { Table } from "@database-generated-types/knex-db"
import { getFreeProperty, ownProperty } from "@seeds/properties"
import {
  TOTAL_PROPERTIES_TO_OWN,
  TOTAL_USER_ACCOUNTS,
  USERS_IMAGE_DIR,
} from "@seeds/utils/variables"
import { getMatchingFile, replacePrimaryImageForEntity, uploadToS3 } from "@seeds/utils/shared"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { err, ok, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { DatabaseError, ErrorCode } from "@seeds/utils/types/errors"
import { Users } from "@services/users/users.schema"
import { Knex } from "knex"
import { Profiles } from "@services/profiles/profiles.schema"

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

export const createProfiles = (
  user: UserId,
  dependencies: Partial<UserProfileDependencies> = {}
): ResultAsync<ProfilesData, DatabaseError> => {
  const deps = createUserProfileDependencies(dependencies)
  const { dataGenerator, database } = deps
  const { id } = user
  const profile: Omit<ProfilesData, "defaultPic"> = dataGenerator(id)
  const query: Knex.QueryBuilder<Profiles, ProfilesData[]> = database.query
    .insert(profile)
    .into(Table.Profile)
    .returning("id")

  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong ${error}`)
  ).andThen(profile => {
    if (profile) {
      console.log(`Returned profileId ${JSON.stringify(profile[0]?.id)}`)
      ok(profile[0])
    } else {
      return err(createError(ErrorCode.DATABASE, `something went wrong creating profile`))
    }
  })
}

export const createAccount = (
  dbClient: DatabaseClient,
  userAccount: UserAccount
): ResultAsync<UserId, DatabaseError> => {
  const query: Knex.QueryBuilder<Users, UserId[]> = dbClient
    .insert(userAccount, ["id"])
    .into(Table.User)
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `could not create user ${error}`)
  ).andThen(user => {
    return user?.length ? ok(user[0]) : err(createError(ErrorCode.DATABASE, `something went wrong`))
  })
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
    const user = await createAccount(dbClient, userAccount)
    if (user.isOk()) {
      await createProfiles(user.value, { database: { query: dbClient } })

      const propertyToOwn = await getFreeProperty(dbClient)

      if (propertyToOwn.isOk() && propertyToOwn.value.length) {
        await ownProperty(propertyToOwn.value, user.value, dbClient, TOTAL_PROPERTIES_TO_OWN)
      }

      users.push(user.value)
    }
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
