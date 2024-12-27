import { PropertyId } from "@seeds/utils/types/properties"
import { SeederOpts } from "@seeds/utils/types/shared"
import { PROPERTIES_IMAGE_DIR, USERS_IMAGE_DIR } from "@seeds/utils/variables"

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

export type ImageUrls = {
  raw: string
  full: string
  regular: string
  small: string
  thumb: string
  small_s3: string
}

export type ImageResponse = {
  id: string
  urls: ImageUrls
  alt_description: string | null
}

export type ImageMetadataResponse = {
  options: ImageOptions
  results: UnsplashSearchResponse["results"]
}
export type ImagedataResponse = {
  options: ImageOptions
  result: ImageResponse
}
export type UnsplashSearchResponse = {
  total: number
  total_pages: number
  results: ImageResponse[]
}

export type ImageSize = keyof ImageUrls

export type ImageOptions = {
  query: string
  size: ImageSize
  imagesCount?: number
}
export type ImageType = SeederOpts["type"]

export type ImageFolders = typeof USERS_IMAGE_DIR | typeof PROPERTIES_IMAGE_DIR

export interface ImageHandler {
  generateImages: (properties: PropertyId[], type: string) => Promise<void>
  uploadToS3: (fileName: string, content: Buffer, folder: string) => Promise<unknown>
  getMatchingFile: (id: string, directory: string) => Promise<[string, Buffer] | null>
}
