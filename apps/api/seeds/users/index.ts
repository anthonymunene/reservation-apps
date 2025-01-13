//@ts-ignore
import { faker } from "@faker-js/faker"
import {
  UserAccount,
  UserAccountDependencies,
  UserDataGenerator,
  UserId,
} from "@seeds/utils/types/users"
import { ProfilesData, ProfilesId, UserProfileDependencies } from "@seeds/utils/types/profiles"
import { Table } from "@database-generated-types/knex-db"
import { getFreeProperty, ownProperty } from "@seeds/properties/shared"
import {
  TOTAL_PROPERTIES_TO_OWN,
  TOTAL_USER_ACCOUNTS,
  USERS_IMAGE_DIR,
} from "@seeds/utils/variables"
import { getMatchingFile, updateEntityImage, uploadToS3 } from "@seeds/utils/shared"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { err, errAsync, ok, okAsync, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { DatabaseError, ErrorCode } from "@seeds/utils/types/errors"
import { Users } from "@services/users/users.schema"
import { Knex } from "knex"

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

export const getUsers = (dbClient: DatabaseClient) => {
  const query: Knex.QueryBuilder<Users, UserId[]> = dbClient.select("id").from("User")
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong ${error}`)
  ).andThen(user =>
    user?.length ? ok(user) : err(createError(ErrorCode.DATABASE, "something went wrong"))
  )
}

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
  console.log(`Creating users...`)
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
): ResultAsync<ProfilesId, DatabaseError> => {
  const deps = createUserProfileDependencies(dependencies)
  const { dataGenerator, database } = deps
  const { id } = user
  const profile: Omit<ProfilesData, "images"> = dataGenerator(id)
  const query = database.query.insert(profile).into(Table.Profile).returning("id")
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong ${error}`)
  ).andThen(profile => {
    if (!profile) {
      return err(createError(ErrorCode.DATABASE, `something went wrong creating profile`))
    } else {
      //console.log(`Returned profileId ${JSON.stringify(profile[0]?.id)}`)
      return ok(profile[0])
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
export const createUsersAndProfiles = (
  dbClient: DatabaseClient,
  dependencies = { createUserAccounts, createProfiles, getFreeProperty, ownProperty }
): ResultAsync<UserId[], DatabaseError> => {
  const { createUserAccounts, createProfiles, getFreeProperty, ownProperty } = dependencies
  const userAccounts = createUserAccounts(TOTAL_USER_ACCOUNTS)
  const users: UserId[] = []

  const processUser = (
    trx: DatabaseClient,
    userAccount: UserAccount
  ): ResultAsync<UserId, DatabaseError> =>
    createAccount(trx, userAccount).andThen(userId =>
      createProfiles(userId, { database: { query: trx } })
        .andThen(() => getFreeProperty(trx))
        .andThen(propertyToOwn => ownProperty(propertyToOwn, userId, trx, TOTAL_PROPERTIES_TO_OWN))
        .map(() => {
          users.push(userId)
          return userId
        })
    )

  const processAccounts = (trx: DatabaseClient): ResultAsync<UserId[], DatabaseError> => {
    let result = okAsync<void, DatabaseError>(undefined)

    for (const userAccount of userAccounts) {
      result = result.andThen(() =>
        processUser(trx, userAccount)
          .orElse(error => {
            console.error(`Failed to process user account:`, error)
            return okAsync(null) // Continue with next user instead of failing
          })
          .map(userId => {
            if (userId) {
              console.log(`Successfully processed user: ${userId.id}`)
            }
            return userId
          })
      )
    }

    return result.map(() => users)
  }

  const validateResults = (users: UserId[]): ResultAsync<UserId[], DatabaseError> =>
    users.length > 0
      ? okAsync(users)
      : errAsync(createError(ErrorCode.DATABASE, "No users were created during the transaction"))

  const handleTransaction = (trx: DatabaseClient): ResultAsync<UserId[], DatabaseError> =>
    processAccounts(trx)
      .andThen(validateResults)
      .map(users => {
        console.log(`Successfully processed ${users.length} users`)
        return users
      })
      .orElse(error => {
        console.error("Transaction processing failed:", error)
        return okAsync([])
      })

  return ResultAsync.fromPromise(
    dbClient.transaction(trx =>
      handleTransaction(trx).match(
        success => success,
        () => [] // Should never reach here as orElse handles all errors
      )
    ),
    error => createError(ErrorCode.DATABASE, `Transaction infrastructure failed: ${error}`)
  )
}

export const updateProfilePictures = (
  dbClient: DatabaseClient,
  dependencies = {
    getUsers,
    uploadToS3,
    getMatchingFile,
  }
) => {
  const { getUsers, uploadToS3, getMatchingFile } = dependencies
  return getUsers(dbClient).andThen(user => {
    const operations = user.map(user => {
      return getMatchingFile(user.id, USERS_IMAGE_DIR).andThen(files => {
        const operations = files.map(({ name, content }) =>
          uploadToS3(name, content, "users").andThen(({ fileName }) => {
            return updateEntityImage(dbClient, user.id, fileName, Table.Profile)
          })
        )
        return ResultAsync.combine(operations)
      })
    })
    return ResultAsync.combine(operations)
  })
}
