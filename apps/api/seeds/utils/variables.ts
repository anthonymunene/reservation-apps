import { EntityImageConfig, EntityType } from "@seeds/utils/types/shared"
import { Images } from "@seeds/utils/types/images"
import { Table } from "../../src/types"

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
export const IMAGE_URL = "https://api.unsplash.com/search/photos"
export const DEFAULT_IMAGES_JSON: Images = {
  version: 1,
  updatedAt: new Date().toISOString(),
  images: [],
}
export const TOTAL_USER_ACCOUNTS = 10
export const IMAGE_DIR = "seeds/images"
export const USERS_IMAGE_DIR = `${IMAGE_DIR}/users`
export const PROPERTIES_IMAGE_DIR = `${IMAGE_DIR}/properties`

export const TOTAL_ROOMS = [1, 2, 3] as const
export const TOTAL_PROPERTIES = 10
export const TOTAL_AMENITIES_PER_PROPERTY = 3
export const ENTITY_CONFIG: Record<EntityType, EntityImageConfig> = {
  Property: {
    table: Table.Property,
    idColumn: "id",
  },
  Profile: {
    table: Table.Profile,
    idColumn: "userId",
  },
}
