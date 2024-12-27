import { Knex } from "knex"
import { generateImages } from "@seeds/utils/shared"
import {
  createAmenities,
  createProperties,
  createPropertyTypes,
  updatePropertyPictures,
} from "@seeds/properties"

export async function seed(knex: Knex): Promise<void> {
  try {
    await createAmenities(knex)
    await createPropertyTypes(knex)
    const propertyData = await createProperties(knex)
    await generateImages(propertyData, "properties").then(async result => {
      if (result.isOk()) {
        await updatePropertyPictures(knex)
      } else {
        console.log(result.error)
      }
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
