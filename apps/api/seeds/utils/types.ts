import type { Properties } from "../../src/services/properties/properties.schema"
import type { Users } from "../../src/services/users/users.schema"
import type { Profiles } from "../../src/services/profiles/profiles.schema"
import { PROPERTIES_IMAGE_DIR, USERS_IMAGE_DIR } from "./variables"
import { Table } from "../../src/types"

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
