import type { Knex } from "knex"
import { Result } from "neverthrow"
import { AmenitiesData } from "@seeds/utils/types/amenities"
import { PropertyTypesData } from "@seeds/utils/types/propertyTypes"
import { DatabaseError } from "@seeds/utils/types/errors"
import { Table } from "@database-generated-types/knex-db"
import { Profiles } from "@services/profiles/profiles.schema"
import { Properties } from "@services/properties/properties.schema"

export type AllowedTables = typeof Table.Profile | typeof Table.Property

export type TableData<T extends AllowedTables> = T extends typeof Table.Profile
  ? Profiles
  : T extends typeof Table.Property
    ? Properties
    : never

type Database = {
  query: Knex | null
}
export type DatabaseDependency = {
  database: Database
}

export type DbResult<T> = Result<T, DatabaseError>
export type DatabaseClient = Knex

export interface DatabaseOperations {
  getAmenitiesById: (db: DatabaseClient) => Promise<DbResult<AmenitiesData[]>>
  getAllPropertyTypes: (db: DatabaseClient) => Promise<DbResult<PropertyTypesData[]>>
  addAmenities: (
    db: DatabaseClient,
    amenities: AmenitiesData[],
    propertyId: string
  ) => Promise<DbResult<void>>
}

export interface EntityImageConfig {
  table: AllowedTables
  idColumn: string
}

export type EntityType = "Property" | "Profile"

export type S3Path = "users" | "properties"
