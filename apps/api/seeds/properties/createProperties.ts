import { DatabaseClient } from "@seeds/utils/types/shared"
import { getRandomElement } from "@seeds/utils/getRandomElement"
import { PropertyTypesData } from "@seeds/utils/types/propertyTypes"
//@ts-ignore
import { faker } from "@faker-js/faker"
import { AmenitiesId } from "@seeds/utils/types/amenities"
import { TOTAL_AMENITIES_PER_PROPERTY, TOTAL_PROPERTIES } from "@seeds/utils/variables"
import {
  addAmenities,
  generateProperty,
  getAllPropertyTypes,
  getAmenitiesById,
} from "@seeds/properties/shared"
import { ok, okAsync, ResultAsync } from "neverthrow"
import { DefaultPropertyData, PropertyId, PropertyInsertData } from "@seeds/utils/types/properties"
import { DatabaseError, ErrorCode } from "@seeds/utils/types/errors"
import { Table } from "@database-generated-types/knex-db"
import { createError } from "@seeds/utils/createError"

const addProperty = (
  dbClient: DatabaseClient,
  propertyData: PropertyInsertData
): ResultAsync<PropertyId[], DatabaseError> => {
  const query = dbClient(Table.Property).insert(propertyData).returning("id")
  return ResultAsync.fromPromise(query, error =>
    createError(ErrorCode.DATABASE, `"something went wrong ${error}`)
  )
}

const withRandomPropertyTypeAndTitle = (propertyTypes: PropertyTypesData[]) => {
  return getRandomElement(propertyTypes).andThen(result => {
    const title = `${faker.word.adjective(7)} ${result[0].name}`
    const id = result[0].id
    return ok({ title, id })
  })
}

const withRandomAmenities = (amenities: AmenitiesId[], amount: number) =>
  getRandomElement(amenities, amount)

// Separate function for creating a single property
export const createSingleProperty = (
  dbClient: DatabaseClient,
  property: DefaultPropertyData,
  amenities: AmenitiesId[],
  propertyTypes: PropertyTypesData[],
  dependencies = {
    withRandomPropertyTypeAndTitle,
    withRandomAmenities,
    addProperty,
    addAmenities,
  }
) => {
  const { withRandomPropertyTypeAndTitle, withRandomAmenities, addProperty, addAmenities } =
    dependencies

  return okAsync(withRandomPropertyTypeAndTitle(propertyTypes))
    .andThen(propertyTypeResult =>
      propertyTypeResult.andThen(selectedPropertyType =>
        withRandomAmenities(amenities, TOTAL_AMENITIES_PER_PROPERTY).map(selectedAmenities => ({
          selectedPropertyType,
          selectedAmenities,
        }))
      )
    )
    .andThen(({ selectedPropertyType, selectedAmenities }) => {
      const propertyInsertData = {
        title: selectedPropertyType.title,
        ...Object.assign(property, { propertyTypeId: selectedPropertyType.id }),
      }

      return addProperty(dbClient, propertyInsertData).andThen(createdPropertyIds =>
        addAmenities(dbClient, selectedAmenities, createdPropertyIds[0]).map(
          () => createdPropertyIds[0]
        )
      )
    })
}

const createAllProperties = (
  dbClient: DatabaseClient,
  [amenities, propertyTypes]: [AmenitiesId[], PropertyTypesData[]],
  dependencies = { createSingleProperty }
) => {
  const { createSingleProperty } = dependencies
  const properties = Array.from({ length: TOTAL_PROPERTIES }, generateProperty)

  return ResultAsync.combine(
    properties.map(property => createSingleProperty(dbClient, property, amenities, propertyTypes))
  ).map(propertyIds => propertyIds)
}

export const createProperties = (
  dbClient: DatabaseClient,
  dependencies = {
    getAmenitiesById,
    getAllPropertyTypes,
    addAmenities,
    addProperty,
    createAllProperties,
  }
) => {
  const { getAmenitiesById, getAllPropertyTypes, createAllProperties } = dependencies

  return ResultAsync.combine([getAmenitiesById(dbClient), getAllPropertyTypes(dbClient)]).andThen(
    results => createAllProperties(dbClient, results)
  )
}
