import type { Properties } from "@services/properties/properties.schema"
import type { Users } from "@services/users/users.schema"
import type { Profiles } from "@services/profiles/profiles.schema"
import { PROPERTIES_IMAGE_DIR, USERS_IMAGE_DIR } from "@seeds/utils/variables"
import { Table } from "@database-generated-types"
import { type Knex } from "knex"

export type PropertyId = Pick<Properties, "id">
export type UserId = Pick<Users, "id">
export type ProfileData = Pick<Profiles, "id" | "userId" | "firstName" | "surname" | "bio" | "defaultPic">

export interface ImageMetadata {
  uploadedAt: string
  status: "pending" | "active" | "deleted"
  mimeType?: string
  isPrimaryImage: boolean
  displayOrder: number
}

export interface Image {
  id: string
  url: string
  caption?: string
  altText?: string
  metadata: ImageMetadata
}

export interface Images {
  version: number
  updatedAt: string
  images: Image[]
}

export type ImageFolders = typeof USERS_IMAGE_DIR | typeof PROPERTIES_IMAGE_DIR
export type AllowedTables = typeof Table.Profile | typeof Table.Property

export type EntityType = "Property" | "Profile"

export type S3Path = "users" | "properties"

export interface EntityImageConfig {
  table: AllowedTables
  idColumn: string
}

export type SeederOpts = {
  type: "users" | "properties"
  id: string
  imageCount?: number
}
export type ImageType = SeederOpts["type"]

export type UserDataGenerator = {
  generateUserAccount: () => Pick<Users, "id" | "email" | "password">
  generateProfile: (userId: string) => Omit<ProfileData, "defaultPic">
}

type Database = {
  query: Knex | null
}
type DatabaseDependency = {
  database: Database
}

export type UserProfileDependencies = DatabaseDependency & {
  dataGenerator: UserDataGenerator["generateProfile"]
}

export type UserAccountDependencies = DatabaseDependency & {
  dataGenerator: UserDataGenerator["generateUserAccount"]
}
