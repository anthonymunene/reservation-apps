import { generateImages } from "@seeds/utils/shared"
import {
  createAmenities,
  createProperties,
  createPropertyTypes,
  updatePropertyPictures,
} from "@seeds/properties"
import { DatabaseClient } from "@seeds/utils/types/shared"

export async function seed(dbClient: DatabaseClient) {
  const result = await createAmenities(dbClient)
    .andThen(() => createPropertyTypes(dbClient))
    .andThen(() => createProperties(dbClient))
    // Only the properties created in this run have cached pictures to attach
    .andThen(propertyData =>
      generateImages(propertyData, "properties").andThen(() =>
        updatePropertyPictures(dbClient, propertyData)
      )
    )

  if (result.isErr()) {
    throw new Error((result.error as Error).message)
  }
}
