// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { generateImages } from "@seeds/utils/shared"
import { createUsersAndProfiles, updateProfilePictures } from "@seeds/users"
import { createReviews } from "@seeds/reviews"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { ResultAsync } from "neverthrow"

export async function seed(dbClient: DatabaseClient) {
  await createUsersAndProfiles(dbClient).andThen(users => {
    return ResultAsync.combine([
      createReviews(dbClient),
      generateImages(users, "users").andThen(() => {
        return updateProfilePictures(dbClient)
      }),
    ])
  })
}
