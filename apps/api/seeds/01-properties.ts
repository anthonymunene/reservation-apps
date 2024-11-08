// 👇️ ts-nocheck disables type checking for entire file
// eslint-disable-next-line @typescript-eslint/ban-ts-comment

//@ts-ignore
import { faker } from "@faker-js/faker"
import { Knex } from "knex"
import { PROPERTY } from "../src/utils/variables"
import { randomiseArray } from "../src/utils/randomise"
// import { createIfNotExist, seedImages, clearImageFolder } from '../utils/seedImages';
import { Properties } from "../src/services/properties/properties.schema"
import { Amenity, PropertyType, Table } from "../src/types"
import { randomUUID } from "crypto"

interface PropertyId extends Pick<Properties, "id"> {}

interface PropertyTypeData extends Pick<PropertyType, "id" | "name"> {}

interface AmenityData extends Pick<Amenity, "id" | "name"> {}

const ROOMS_RANGE = [1, 2, 3] as const
const NUM_PROPERTIES = 10
const NUM_AMENITIES_PER_PROPERTY = 3
//TYPES-TO-COLLATE:

export const getAmenitiesById = async (dbClient: Knex): Promise<AmenityData[]> =>
  await dbClient.select("id", "name").from(Table.Amenity)

export const getAllPropertyTypes = async (dbClient: Knex): Promise<PropertyTypeData[]> =>
  await dbClient.select("id", "name").from(Table.PropertyType)

const addAmenities = async (dbClient: Knex, amenities: AmenityData[], property: PropertyId): Promise<void> => {
  const amenityRecords = amenities.map(amenity => ({
    id: randomUUID(),
    amenityId: amenity.id,
    propertyId: property.id,
  }))

  await dbClient(Table.PropertyAmenity).insert(amenityRecords)
}

const generateProperty = () => ({
  id: randomUUID(),
  description: faker.lorem.sentences(),
  city: faker.location.city(),
  countryCode: faker.location.countryCode(),
  bedrooms: faker.helpers.arrayElement(ROOMS_RANGE),
  beds: faker.helpers.arrayElement(ROOMS_RANGE),
  images: {},
  // entirePlace: faker.helpers.arrayElement([true, false])
})
export const createProperties = async (
  dbClient: Knex,
  dependencies = {
    getAmenitiesById,
    getAllPropertyTypes,
  }
): Promise<void> => {
  const { getAmenitiesById, getAllPropertyTypes } = dependencies
  const [amenities, propertyTypes] = await Promise.all([getAmenitiesById(dbClient), getAllPropertyTypes(dbClient)])
  if (!amenities.length || !propertyTypes.length) {
    throw new Error("No amenities or property types found in database")
  }
  const properties = Array.from({ length: NUM_PROPERTIES }, generateProperty)

  await Promise.all(
    properties.map(async property => {
      const assignedPropertyType: PropertyTypeData = randomiseArray(propertyTypes)
      const assignedAmenities: AmenityData[] = randomiseArray(amenities, NUM_AMENITIES_PER_PROPERTY)
      const title = `${faker.word.adjective(7)} ${assignedPropertyType.name}`

      const [propertyId]: PropertyId[] = await dbClient(Table.Property).insert(
        {
          id: randomUUID(),
          title,
          ...property,
          propertyTypeId: assignedPropertyType.id,
        },
        ["id"]
      )

      await addAmenities(dbClient, assignedAmenities, propertyId)
    })
  )
}

export const createPropertyTypes = async (dbClient: Knex): Promise<void> => {
  console.log("CREATING PROPERTY TYPES.....")
  const { PROPERTY_TYPES } = PROPERTY
  const propertyTypeData = PROPERTY_TYPES.map(
    (propertyType): PropertyTypeData => ({
      id: randomUUID(),
      name: propertyType,
    })
  )

  const existingPropertyTypes = await dbClient(Table.PropertyType).whereIn("name", PROPERTY_TYPES)
  if (!existingPropertyTypes.length) await dbClient.insert(propertyTypeData, ["id"]).into(Table.PropertyType)
}

export const createAmenities = async (dbClient: Knex): Promise<void> => {
  console.log("CREATING AMENITIES.....")
  const { AMENITIES } = PROPERTY
  const amenityData = AMENITIES.map(
    (amenity): AmenityData => ({
      id: randomUUID(),
      name: amenity,
    })
  )
  const existingAmenities = await dbClient(Table.Amenity).whereIn("name", AMENITIES)
  if (!existingAmenities.length) await dbClient.insert(amenityData, ["id"]).into(Table.Amenity)
}

export async function seed(knex: Knex): Promise<void> {
  try {
    await createAmenities(knex)
    await createPropertyTypes(knex)
    await createProperties(knex)
  } catch (error) {
    console.error("Error seeding database:", error)
    throw error
  }
}
