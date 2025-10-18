import { ImageQueryOptions, ImagesMetaDataResponse } from "@seeds/utils/types/images"
import { IMAGE_URL, UNSPLASH_ACCESS_KEY } from "@seeds/utils/variables"
import { err, ok, Result, ResultAsync } from "neverthrow"
import { fetchImageData } from "@seeds/utils/images/fetchImageData"
import { ConfigurationError, ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"
import { createError } from "@seeds/utils/createError"

/**
 * Constructs the Unsplash API URL with the provided parameters
 * @param options Search options including query and count
 * @param accessKey Unsplash API access key
 * @returns Constructed URL for the Unsplash API
 */
const getQuery = (options: ImageQueryOptions, accessKey: string): string => {
  const { query, imageCount = 1 } = options
  return `${IMAGE_URL}?client_id=${accessKey}&query=${encodeURIComponent(query)}&per_page=${imageCount}`
}
/**
 * Validates the configuration required for Unsplash API
 * @returns UnsplashConfigurationError if the access key is missing
 */

const getAccess = (): Result<string, ConfigurationError> => {
  if (!UNSPLASH_ACCESS_KEY) {
    return err(createError(ErrorCode.CONFIGURATION, "Missing Unsplash access key"))
  }
  return ok(UNSPLASH_ACCESS_KEY)
}

/**
 * Main function to fetch images from Unsplash
 * @param options Search options including query, size, and count
 * @returns ResultAsync containing array of image URLs or an error
 */

export const getImageMetaData = (
  options: ImageQueryOptions
): ResultAsync<ImagesMetaDataResponse, ImagesMetaDataError> => {
  const access = getAccess()

  if (access.isErr()) {
    return ResultAsync.fromPromise(Promise.reject(access.error), error =>
      createError(ErrorCode.CONFIGURATION, `${error}`)
    )
  }
  const url = getQuery(options, access.value)

  return fetchImageData(url).map(imageData => ({ ...options, ...imageData }))
}
