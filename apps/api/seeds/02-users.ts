// eslint-disable-next-line @typescript-eslint/ban-ts-comment
import { Knex } from "knex"
import { generateImages } from "@seeds/utils/shared"
import { createUsersAndProfiles, updateProfilePictures } from "@seeds/users"
import { createReviews } from "@seeds/reviews"

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
