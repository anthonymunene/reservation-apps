import { readFileSync, existsSync } from "fs"
import { ok, Result, ResultAsync, okAsync, errAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"
import { ImageDownloadResult, ImageMetadataWithQueryOptions } from "@seeds/utils/types/images"
import { imageConfig } from "@seeds/utils/images/getImageConfig"

const PLACEHOLDER_DIR = `${process.cwd()}/seeds/test-fixtures/placeholder-images`

const PLACEHOLDER_IMAGES = {
  properties: "placeholder-property.png",
  users: "placeholder-user.png",
}

/**
 * Check if we should use mock images based on environment.
 * Mock images are used in test environment or when MOCK_IMAGES env var is set.
 */
export const shouldUseMockImages = (): boolean => {
  return process.env.NODE_ENV === "test" || process.env.MOCK_IMAGES === "true"
}

/**
 * Mock implementation of getImageData that returns local placeholder metadata.
 * Avoids Unsplash API calls entirely in test environment.
 */
export const getMockImageData = (
  config: keyof typeof imageConfig
): ResultAsync<ImageMetadataWithQueryOptions, ImagesMetaDataError> => {
  const configData = imageConfig[config]
  if (!configData) {
    return errAsync(createError(ErrorCode.CONFIGURATION, `Invalid config type: ${config}`))
  }

  const placeholderFile = PLACEHOLDER_IMAGES[config] || "placeholder-property.png"
  const placeholderPath = `file://${PLACEHOLDER_DIR}/${placeholderFile}`

  return okAsync({
    ...configData,
    urls: {
      raw: placeholderPath,
      full: placeholderPath,
      regular: placeholderPath,
      small: placeholderPath,
      thumb: placeholderPath,
      small_s3: placeholderPath,
    },
  } as ImageMetadataWithQueryOptions)
}

/**
 * Mock implementation of extractImageLinks for use with mock data.
 */
export const extractMockImageLinks = (
  data: ImageMetadataWithQueryOptions
): Result<string, ImagesMetaDataError> => {
  const { size, urls } = data
  if (!urls) {
    return ok(`file://${PLACEHOLDER_DIR}/placeholder-property.png`)
  }
  if (!size) {
    return ok(urls.regular || `file://${PLACEHOLDER_DIR}/placeholder-property.png`)
  }
  return ok(urls[size] || urls.regular)
}

/**
 * Mock implementation of downloadImages that reads from local placeholder files.
 * Returns buffer from local file instead of fetching from network.
 */
export const downloadMockImages = (
  link: string
): ResultAsync<ImageDownloadResult, ImagesMetaDataError> => {
  // Extract file path from file:// URL or use default
  const filePath = link.startsWith("file://")
    ? link.replace("file://", "")
    : `${PLACEHOLDER_DIR}/placeholder-property.png`

  if (!existsSync(filePath)) {
    return errAsync(
      createError(ErrorCode.FILE_SYSTEM, `Placeholder image not found: ${filePath}`)
    )
  }

  try {
    const content = readFileSync(filePath)
    return okAsync({ url: link, content: Buffer.from(content) })
  } catch (error) {
    return errAsync(
      createError(
        ErrorCode.FILE_SYSTEM,
        `Failed to read placeholder image: ${error instanceof Error ? error.message : error}`
      )
    )
  }
}
