import { generateImages } from "@seeds/utils/shared"
import {
  createAmenities,
  createProperties,
  createPropertyTypes,
  updatePropertyPictures,
} from "@seeds/properties"
import { DatabaseClient } from "@seeds/utils/types/shared"

export async function seed(dbClient: DatabaseClient): Promise<void> {
  try {
    await createAmenities(dbClient)
    await createPropertyTypes(dbClient)
    const propertyData = await createProperties(dbClient)
    await generateImages(propertyData, "properties").then(async result => {
      if (result.isOk()) {
        await updatePropertyPictures(dbClient)
      } else {
        console.log(result.error)
      }
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
