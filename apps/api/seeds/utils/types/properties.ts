import { Result, ResultAsync } from "neverthrow"
import { Properties } from "@services/properties/properties.schema"
import { Amenity, PropertyType } from "@database-generated-types/knex-db"
import { DatabaseClient, DatabaseDependency } from "@seeds/utils/types/shared"
import { ApiError, DatabaseError } from "@seeds/utils/types/errors"

export interface PropertyId extends Pick<Properties, "id"> {}

export interface PropertyTypeData extends Pick<PropertyType, "id" | "name"> {}

export interface AmenityData extends Pick<Amenity, "id" | "name"> {}

export type PropertyQueryFunctions = {
  getAllPropertiesWithoutOwner: (dbClient: DatabaseClient) => Result<PropertyId[], DatabaseError>
  getFreeProperty: (dbClient: DatabaseClient) => ResultAsync<PropertyId[], DatabaseError>
}
export type PropertyGenerationResult = Result<PropertyId[], ApiError>
export type PropertyAccountDependencies = DatabaseDependency & {
  dataGenerator: PropertyDataGenerator
  propertyQueries: PropertyQueryFunctions
  getAllPropertyTypes: (dependencies) => Promise<PropertyTypeData[]>
  amenityOperations: {
    getAmenitiesById: (dependencies: DatabaseDependency) => Promise<AmenityData[]>
    addAmenities: (
      amenities: AmenityData[],
      propertyId: PropertyId,
      dependencies: DatabaseDependency
    ) => Promise<void>
  }
  propertyTypeOperations: {
    getAllPropertyTypes: (dependencies: DatabaseDependency) => Promise<PropertyTypeData[]>
  }
}

export type DefaultPropertyData = Pick<
  Properties,
  "id" | "description" | "city" | "countryCode" | "bedrooms" | "beds"
>

export type PropertyDataGenerator = {
  generateProperty: () => DefaultPropertyData
}
