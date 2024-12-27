import { Result } from "neverthrow"
import { Properties } from "@services/properties/properties.schema"
import { Amenity, PropertyType } from "@database-generated-types/knex-db"
import { DatabaseDependency } from "@seeds/utils/types/shared"
import { ApiError } from "@seeds/utils/types/errors"

export interface PropertyId extends Pick<Properties, "id"> {}

export interface PropertyTypeData extends Pick<PropertyType, "id" | "name"> {}

export interface AmenityData extends Pick<Amenity, "id" | "name"> {}

export type PropertyGenerationResult = Result<PropertyId[], ApiError>
export type PropertyAccountDependencies = DatabaseDependency & {
  dataGenerator: PropertyDataGenerator
  getAmenitiesById: (dependencies) => Promise<AmenityData[]>
  getAllPropertyTypes: (dependencies) => Promise<PropertyTypeData[]>
  addAmenities: (amenities: AmenityData[], propertyId: PropertyId, dependencies) => Promise<void>
}

export type DefaultPropertyData = Pick<
  Properties,
  "id" | "description" | "city" | "countryCode" | "bedrooms" | "beds"
>

export type PropertyDataGenerator = {
  generateProperty: () => DefaultPropertyData
}
