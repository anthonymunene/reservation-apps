// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { generateImages } from "@seeds/utils/shared"
import { createUsersAndProfiles, updateProfilePictures } from "@seeds/users"
import { createReviews } from "@seeds/reviews"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { ResultAsync } from "neverthrow"

export async function seed(dbClient: DatabaseClient) {
  const result = await createUsersAndProfiles(dbClient).andThen(users => {
    return ResultAsync.combine([
      createReviews(dbClient),
      // Only the users created in this run have cached pictures to attach
      generateImages(users, "users").andThen(() => {
        return updateProfilePictures(dbClient, users)
      }),
    ])
  })

  // Fail the seed run on an error, as 01-properties does, instead of carrying on silently
  if (result.isErr()) {
    throw new Error((result.error as Error).message)
  }
}
