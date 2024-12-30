import type { Knex } from "knex"
import { Result } from "neverthrow"
import { AmenityData, PropertyTypeData } from "@seeds/utils/types/properties"
import { DatabaseError } from "@seeds/utils/types/errors"
import { Table } from "@database-generated-types/knex-db"

export type AllowedTables = typeof Table.Profile | typeof Table.Property
type Database = {
  query: Knex | null
}
export type DatabaseDependency = {
  database: Database
}

export type DbResult<T> = Result<T, DatabaseError>
export type DatabaseClient = Knex

export interface DatabaseOperations {
  getAmenitiesById: (db: DatabaseClient) => Promise<DbResult<AmenityData[]>>
  getAllPropertyTypes: (db: DatabaseClient) => Promise<DbResult<PropertyTypeData[]>>
  addAmenities: (
    db: DatabaseClient,
    amenities: AmenityData[],
    propertyId: string
  ) => Promise<DbResult<void>>
}

export interface EntityImageConfig {
  table: AllowedTables
  idColumn: string
}

export type EntityType = "Property" | "Profile"

export type S3Path = "users" | "properties"

export type SeederOpts = {
  type: "users" | "properties"
  id: string
  imageCount?: number
}
