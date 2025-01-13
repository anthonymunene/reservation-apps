import {
  PropertyId,
  PropertyInsertData,
  PropertyQueryFunctions,
} from "@seeds/utils/types/properties"
import { PropertyTypesData } from "@seeds/utils/types/propertyTypes"
import { AmenitiesData, AmenitiesId } from "@seeds/utils/types/amenities"
//@ts-ignore
import { faker } from "@faker-js/faker"
import { Table } from "@database-generated-types/knex-db"
import { UserId } from "@seeds/utils/types/users"
import { randomUUID } from "crypto"
import { PROPERTIES_IMAGE_DIR, TOTAL_ROOMS } from "@seeds/utils/variables"
import { PROPERTY } from "@utils/variables"
import { getMatchingFile, updateEntityImage, uploadToS3 } from "@seeds/utils/shared"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { err, ok, okAsync, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { DatabaseError, ErrorCode } from "@seeds/utils/types/errors"
import { getRandomElement as getRandomProperties } from "@seeds/utils/getRandomElement"
import { Knex } from "knex"
import { Properties } from "@services/properties/properties.schema"

export const getAllPropertiesWithoutOwner: PropertyQueryFunctions["getAllPropertiesWithoutOwner"] =
  dbClient => {
    const getPropertiesWithoutOwner: Knex.QueryBuilder<Properties, PropertyId[]> = dbClient
      .select("id")
      .from(Table.Property)
      .whereNull("host")
      .returning("id")
    return ResultAsync.fromPromise(getPropertiesWithoutOwner, error =>
      createError(ErrorCode.NETWORK, `something went wrong ${error} `)
    ).andThen(properties => {
      console.log(`properties without owner ${properties.length}`)
      return properties
        ? ok(properties)
        : err(createError(ErrorCode.DATABASE, `could not get properties`))
    })
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
}

const updatePropertyOwnership = (property: PropertyId, user: UserId, dbClient: DatabaseClient) => {
  const query: Knex.QueryBuilder<Properties, PropertyId[]> = dbClient(Table.Property)
    .where("id", (property as PropertyId)["id"])
    .update({
      host: user.id,
    })
    .returning("id")
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong updating property ownership ${error}`)
  ).map(ids => {
    console.log(`updated property id ${property.id} with host id of ${user.id}`)
    return ids[0]
  })
}

export const ownProperty = (
  properties: PropertyId[],
  user: UserId,
  dbClient: DatabaseClient,
  maxProperties: number
) => {
  return getRandomProperties<PropertyId>(properties, maxProperties).asyncAndThen(properties => {
    const operations = properties.map(property => {
      //console.log(`User: ${user.id} \n Property to own: \n ${JSON.stringify(property)} \n\n`)
      return updatePropertyOwnership(property, user, dbClient)
    })
    return ResultAsync.combine(operations).map(properties => {
      console.log(`properties owned by ${user.id} = ${JSON.stringify(properties)}`)
      return { user, properties }
    })
  })
}

export const getAmenitiesById = (
  dbClient: DatabaseClient
): ResultAsync<AmenitiesId[], DatabaseError> => {
  const query = dbClient.select("id").from(Table.Amenity).returning("id")
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong ${error}`)
  )
}

export const getAllPropertyTypes = (
  dbClient: DatabaseClient
): ResultAsync<PropertyTypesData[], DatabaseError> => {
  const query = dbClient.select("id", "name").from(Table.PropertyType)
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong ${error}`)
  )
}

export const addAmenities = (
  dbClient: DatabaseClient,
  amenities: AmenitiesId[],
  property: PropertyId
): ResultAsync<AmenitiesId[], DatabaseError> => {
  const amenityRecords = amenities.map(amenity => ({
    id: randomUUID(),
    amenityId: amenity.id,
    propertyId: property.id,
  }))
  const query = dbClient(Table.PropertyAmenity).insert(amenityRecords).returning("id")
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong ${error}`)
  )
}

export const generateProperty = (): Omit<
  PropertyInsertData,
  "title" | "images" | "propertyTypeId"
> => ({
  id: randomUUID(),
  description: faker.lorem.sentences(),
  city: faker.location.city(),
  countryCode: faker.location.countryCode(),
  bedrooms: faker.helpers.arrayElement(TOTAL_ROOMS),
  beds: faker.helpers.arrayElement(TOTAL_ROOMS),
})

export const createPropertyTypes = (dbClient: DatabaseClient) => {
  console.log("CREATING PROPERTY TYPES.....")
  const { PROPERTY_TYPES } = PROPERTY
  const propertyTypeData = PROPERTY_TYPES.map(
    (propertyType): PropertyTypesData => ({
      id: randomUUID(),
      name: propertyType,
    })
  )

  const selectExistingPropertyTypesQuery = dbClient
    .select("name")
    .from(Table.PropertyType)
    .whereIn("name", PROPERTY_TYPES)

  const insertPropertyTypesQuery = dbClient
    .insert(propertyTypeData, ["id"])
    .into(Table.PropertyType)

  return ResultAsync.fromPromise(selectExistingPropertyTypesQuery, error =>
    createError(ErrorCode.DATABASE, `Failed to check existing property types: ${error}`)
  ).andThen(existingTypes => {
    if (!existingTypes.length) {
      return ResultAsync.fromPromise(insertPropertyTypesQuery, error =>
        createError(ErrorCode.DATABASE, `Failed to insert property types: ${error}`)
      )
    }
    return ok(existingTypes)
  })
}

export const createAmenities = (dbClient: DatabaseClient) => {
  console.log("CREATING AMENITIES.....")
  const { AMENITIES } = PROPERTY
  const amenityData = AMENITIES.map(
    (amenity): AmenitiesData => ({
      id: randomUUID(),
      name: amenity,
    })
  )
  const existingAmenitiesQuery = dbClient
    .select("name")
    .from(Table.Amenity)
    .whereIn("name", AMENITIES)
  return ResultAsync.fromPromise(existingAmenitiesQuery, error =>
    createError(ErrorCode.DATABASE, `could not complete action ${error}`)
  ).andThen(existingAmenities => {
    if (!existingAmenities.length) {
      const insertAmenitiesQuery = dbClient.insert(amenityData, ["id"]).into(Table.Amenity)
      return ResultAsync.fromPromise(insertAmenitiesQuery, error =>
        createError(ErrorCode.DATABASE, `something went wrong ${error}`)
      )
    } else {
      return okAsync(existingAmenities)
    }
  })
}

const getProperties = (dbClient: DatabaseClient) => {
  const query: Knex.QueryBuilder<Properties, PropertyId[]> = dbClient
    .select("id")
    .from(Table.Property)

  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `something went wrong ${error}`)
  )
}

export const updatePropertyPictures = (
  dbClient: DatabaseClient,
  dependencies = {
    getProperties,
    uploadToS3,
    getMatchingFile,
  }
) => {
  const { getProperties, uploadToS3, getMatchingFile } = dependencies
  return getProperties(dbClient).andThen(properties => {
    const operations = properties.map(property => {
      return getMatchingFile(property.id, PROPERTIES_IMAGE_DIR).andThen(files => {
        const matchingFiles = files.map(({ name, content }) => {
          return uploadToS3(name, content, "properties").andThen(({ fileName }) =>
            updateEntityImage(dbClient, property.id, fileName, Table.Property)
          )
        })
        return ResultAsync.combine(matchingFiles)
      })
    })

    return ResultAsync.combine(operations)
  })
}
