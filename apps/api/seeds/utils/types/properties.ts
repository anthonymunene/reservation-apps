import { Result, ResultAsync } from "neverthrow"
import { Properties } from "@services/properties/properties.schema"
import { DatabaseClient, DatabaseDependency } from "@seeds/utils/types/shared"
import { ApiError, DatabaseError, NetworkError } from "@seeds/utils/types/errors"
import { AmenitiesData } from "@seeds/utils/types/amenities"
import { PropertyTypesData } from "@seeds/utils/types/propertyTypes"

export interface PropertyId extends Pick<Properties, "id"> {}

export type PropertyQueryFunctions = {
  getAllPropertiesWithoutOwner: (
    dbClient: DatabaseClient
  ) => ResultAsync<PropertyId[], NetworkError | DatabaseError>
  getFreeProperty: (dbClient: DatabaseClient) => ResultAsync<PropertyId[], DatabaseError>
}
export type PropertyGenerationResult = Result<PropertyId[], ApiError>
export type PropertyAccountDependencies = DatabaseDependency & {
  dataGenerator: PropertyDataGenerator
  propertyQueries: PropertyQueryFunctions
  getAllPropertyTypes: (dependencies) => Promise<PropertyTypesData[]>
  amenityOperations: {
    getAmenitiesById: (dependencies: DatabaseDependency) => Promise<AmenitiesData[]>
    addAmenities: (
      amenities: AmenitiesData[],
      propertyId: PropertyId,
      dependencies: DatabaseDependency
    ) => Promise<void>
  }
  propertyTypeOperations: {
    getAllPropertyTypes: (dependencies: DatabaseDependency) => Promise<PropertyTypesData[]>
  }
}

export type DefaultPropertyData = Pick<
  Properties,
  "id" | "description" | "city" | "countryCode" | "bedrooms" | "beds"
>

export type PropertyDataGenerator = {
  generateProperty: () => DefaultPropertyData
}

export type PropertyInsertData = Pick<
  Properties,
  "id" | "title" | "description" | "city" | "countryCode" | "bedrooms" | "beds" | "propertyTypeId"
>
