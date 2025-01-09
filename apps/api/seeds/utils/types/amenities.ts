import { Amenity } from "@database-generated-types/knex-db"

export interface AmenitiesData extends Pick<Amenity, "id" | "name"> {}

export type AmenitiesId = Pick<AmenitiesData, "id">
