import {
  type AmenityData,
  PropertyId,
  PropertyQueryFunctions,
  type PropertyTypeData,
} from "@seeds/utils/types/properties"
//@ts-ignore
import { faker } from "@faker-js/faker"
import { Table } from "@database-generated-types/knex-db"
import { UserId } from "@seeds/utils/types/users"
import { randomUUID } from "crypto"
import {
  PROPERTIES_IMAGE_DIR,
  TOTAL_AMENITIES_PER_PROPERTY,
  TOTAL_PROPERTIES,
  TOTAL_ROOMS,
} from "@seeds/utils/variables"
import { randomiseMany, randomiseOne } from "@utils/randomise"
import { PROPERTY } from "@utils/variables"
import { getMatchingFile, replacePrimaryImageForEntity, uploadToS3 } from "@seeds/utils/shared"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { err, ok, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { ErrorCode } from "@seeds/utils/types/errors"
import { getRandomElement } from "@seeds/utils/getRandomElement"

export const getRandomisedPropertyIds = (
  propertyIds: PropertyId[],
  propertyIdCount = 2,
  dependencies = { faker }
) => {
  const { faker } = dependencies
  return faker.helpers.arrayElements(propertyIds, propertyIdCount)
}

export const getAllPropertiesWithoutOwner = dbClient => {
  const getPropertiesWithoutOwner: Promise<PropertyId[]> = dbClient
    .select("id")
    .from(Table.Property)
    .whereNull("host")
  return ResultAsync.fromPromise(getPropertiesWithoutOwner, error =>
    createError(ErrorCode.NETWORK, `something went wrong ${error} `)
  ).andThen(properties =>
    properties ? ok(properties) : err(createError(ErrorCode.DATABASE, `could not get properties`))
  )
}

export const getFreeProperty: PropertyQueryFunctions["getFreeProperty"] = (
  dbClient,
  dependencies = {
    propertyQueries: { getAllPropertiesWithoutOwner },
  }
) => {
  const {
    propertyQueries: { getAllPropertiesWithoutOwner },
  } = dependencies
  return getAllPropertiesWithoutOwner(dbClient).andThen(properties => {
    return properties
      ? ok(properties)
      : err(createError(ErrorCode.DATABASE, "something went wrong"))
  })
  //getRandomElement(freeProperties.value, 2)
}

export const ownProperty = async (
  properties: PropertyId[],
  user: UserId,
  dbClient: DatabaseClient,
  max: number
) => {
  const propertiesToOwn = getRandomElement<PropertyId>(properties, max)
  if (propertiesToOwn.isOk()) {
    const propertiesToOwnPromises = await Promise.all(
      propertiesToOwn.value.map(async property => {
        const { id } = user
        console.log(`User: ${user.id} \n Properties to own: \n ${JSON.stringify(properties)} \n\n`)
        return dbClient(Table.Property)
          .where("id", (property as PropertyId)["id"])
          .update({
            host: id,
          })
          .returning("id")
      })
    )
    ok(propertiesToOwnPromises)
  } else {
    return err(
      createError(ErrorCode.DATABASE, `unable to own properties ${propertiesToOwn.error.message}`)
    )
  }
}

export const getAmenitiesById = async (dbClient: DatabaseClient): Promise<AmenityData[]> =>
  await dbClient.select("id", "name").from(Table.Amenity)

export const getAllPropertyTypes = async (dbClient: DatabaseClient): Promise<PropertyTypeData[]> =>
  await dbClient.select("id", "name").from(Table.PropertyType)

export const addAmenities = async (
  dbClient: DatabaseClient,
  amenities: AmenityData[],
  property: PropertyId
): Promise<void> => {
  const amenityRecords = amenities.map(amenity => ({
    id: randomUUID(),
    amenityId: amenity.id,
    propertyId: property.id,
  }))

  await dbClient(Table.PropertyAmenity).insert(amenityRecords)
}

export const generateProperty = () => ({
  id: randomUUID(),
  description: faker.lorem.sentences(),
  city: faker.location.city(),
  countryCode: faker.location.countryCode(),
  bedrooms: faker.helpers.arrayElement(TOTAL_ROOMS),
  beds: faker.helpers.arrayElement(TOTAL_ROOMS),
  images: {},
  // entirePlace: faker.helpers.arrayElement([true, false])
})

export const createProperties = async (
  dbClient: DatabaseClient,
  dependencies = {
    getAmenitiesById,
    getAllPropertyTypes,
  }
): Promise<PropertyId[]> => {
  const { getAmenitiesById, getAllPropertyTypes } = dependencies
  const [amenities, propertyTypes] = await Promise.all([
    getAmenitiesById(dbClient),
    getAllPropertyTypes(dbClient),
  ])
  if (!amenities.length || !propertyTypes.length) {
    throw new Error("No amenities or property types found in database")
  }
  const properties = Array.from({ length: TOTAL_PROPERTIES }, generateProperty)

  return await Promise.all(
    properties.map(async property => {
      const assignedPropertyType: PropertyTypeData = randomiseOne(propertyTypes)
      const assignedAmenities: AmenityData[] = randomiseMany(amenities, {
        count: TOTAL_AMENITIES_PER_PROPERTY,
      })
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
      return propertyId
    })
  )
}

export const createPropertyTypes = async (dbClient: DatabaseClient): Promise<void> => {
  console.log("CREATING PROPERTY TYPES.....")
  const { PROPERTY_TYPES } = PROPERTY
  const propertyTypeData = PROPERTY_TYPES.map(
    (propertyType): PropertyTypeData => ({
      id: randomUUID(),
      name: propertyType,
    })
  )

  const existingPropertyTypes = await dbClient
    .select("name")
    .from(Table.PropertyType)
    .whereIn("name", PROPERTY_TYPES)
  if (!existingPropertyTypes.length)
    await dbClient.insert(propertyTypeData, ["id"]).into(Table.PropertyType)
}

export const createAmenities = async (dbClient: DatabaseClient): Promise<void> => {
  console.log("CREATING AMENITIES.....")
  const { AMENITIES } = PROPERTY
  const amenityData = AMENITIES.map(
    (amenity): AmenityData => ({
      id: randomUUID(),
      name: amenity,
    })
  )
  const existingAmenities = await dbClient
    .select("name")
    .from(Table.Amenity)
    .whereIn("name", AMENITIES)
  if (!existingAmenities.length) await dbClient.insert(amenityData, ["id"]).into(Table.Amenity)
}

const getProperties = async (dbClient: DatabaseClient) =>
  await dbClient.select("id").from(Table.Property)

export const updatePropertyPictures = async (
  dbClient: DatabaseClient,
  dependencies = {
    getProperties,
    uploadToS3,
    getMatchingFile,
  }
) => {
  const { getProperties, uploadToS3, getMatchingFile } = dependencies
  try {
    const properties = await getProperties(dbClient)

    await Promise.all(
      properties.map(async property => {
        const matchingFile = await getMatchingFile(property.id, PROPERTIES_IMAGE_DIR)
        if (!matchingFile) return
        const [fileName, content] = matchingFile
        if (fileName && content)
          await uploadToS3(fileName, content, "properties").then(async () => {
            await replacePrimaryImageForEntity(dbClient, property.id, fileName, Table.Property)
          })
      })
    )
  } catch (error) {
    console.log(error)
  }
}
