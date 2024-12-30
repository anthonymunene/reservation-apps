// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { generateImages } from "@seeds/utils/shared"
import { createUsersAndProfiles, updateProfilePictures } from "@seeds/users"
import { createReviews } from "@seeds/reviews"
import { DatabaseClient } from "@seeds/utils/types/shared"

export async function seed(dbClient: DatabaseClient): Promise<void> {
  try {
    const userData = await createUsersAndProfiles(dbClient)
    await generateImages(userData, "users").then(async result => {
      if (result.isOk()) {
        await updateProfilePictures(dbClient)
      } else {
        console.log(result.error)
      }
    })
    await createReviews(dbClient)
  } catch (e) {
    console.log(e)
  }
}
