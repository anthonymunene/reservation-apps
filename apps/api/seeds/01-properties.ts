import { generateImages } from "@seeds/utils/shared"
import {
  createAmenities,
  createProperties,
  createPropertyTypes,
  updatePropertyPictures,
} from "@seeds/properties"
import { DatabaseClient } from "@seeds/utils/types/shared"

export async function seed(dbClient: DatabaseClient) {
  await createAmenities(dbClient)
    .andThen(() => createPropertyTypes(dbClient))
    .andThen(() => createProperties(dbClient))
    .andThen(propertyData =>
      generateImages(propertyData, "properties")
        .andThen(() => {
          return updatePropertyPictures(dbClient)
        })
        .map(result => console.log(result))
        .mapErr(error => {
          console.log(error)
          return error
        })
    )
    .mapErr(error => {
      console.error("Error during seeding:", error)
      return error
    })
}
