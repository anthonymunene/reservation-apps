import { existsSync, mkdirSync } from "fs"
import type { ImageConfigOpts } from "@seeds/utils/types/images"
import { ImageDownloadResult } from "@seeds/utils/types/images"
import { errAsync, okAsync, ResultAsync } from "neverthrow"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"
import {
  downloadImages,
  extractImageLinks,
  getImageData,
  SavedImageSuccess,
  saveImage,
} from "@seeds/utils/images"
import { createError } from "@seeds/utils/createError"
import { checkImageCache, CacheCheckResult } from "@seeds/utils/images/checkImageCache"
import {
  getMockImageData,
  extractMockImageLinks,
  downloadMockImages,
  shouldUseMockImages,
} from "@seeds/utils/images/mockImageProvider"
import { logger } from "../../src/logger"

export const createIfNotExist = (filepath: string) => {
  if (!existsSync(filepath)) {
    mkdirSync(filepath, { recursive: true })
  }
  return `${filepath}`
}

/**
 * Whether Unsplash is still worth asking during this seed run. Once it refuses a request (most
 * often its 50-requests-an-hour limit), the rest of the run uses placeholder images instead of
 * making requests that would fail the same way.
 */
export const unsplashStatus = { available: true }

/** Lets tests start each case with Unsplash treated as available again. */
export const resetUnsplashStatus = () => {
  unsplashStatus.available = true
}

// Local placeholder images, used in tests and whenever Unsplash can't provide an image
const placeholderImages = {
  getImageData: getMockImageData,
  extractImageLinks: extractMockImageLinks,
  downloadImages: downloadMockImages,
}

/**
 * Creates the appropriate dependencies based on environment.
 * In test environment (or with MOCK_IMAGES=true), uses placeholder images and never calls Unsplash.
 */
const createDependencies = () => {
  const useMock = shouldUseMockImages()

  return {
    checkImageCache,
    getImageData: useMock ? getMockImageData : getImageData,
    extractImageLinks: useMock ? extractMockImageLinks : extractImageLinks,
    downloadImages: useMock ? downloadMockImages : downloadImages,
    saveImage,
    placeholderImages,
    logger,
    unsplashStatus,
  }
}

type ImageSource = Pick<
  ReturnType<typeof createDependencies>,
  "getImageData" | "extractImageLinks" | "downloadImages"
>

const fetchImage = (source: ImageSource, query: ImageConfigOpts["query"]) =>
  source.getImageData(query).andThen(source.extractImageLinks).andThen(source.downloadImages)

export const seedImages = (
  opts: ImageConfigOpts,
  dependencies = createDependencies()
): ResultAsync<SavedImageSuccess | SavedImageSuccess[], ImagesMetaDataError> => {
  const { query, id } = opts

  // Validate inputs
  if (!opts.query || !opts.id) {
    return errAsync(createError(ErrorCode.CONFIGURATION, "Type and ID are required parameters"))
  }

  const seedImageDir = `${process.cwd()}/seeds/images/${opts.query}`
  const relativeCacheDir = `seeds/images/${opts.query}`

  createIfNotExist(seedImageDir)

  // Check cache first to avoid unnecessary API calls
  const cacheResult = dependencies.checkImageCache(id, relativeCacheDir)

  if (cacheResult.isErr()) {
    return errAsync(createError(ErrorCode.CONFIGURATION, cacheResult.error.message))
  }

  const cacheCheck: CacheCheckResult = cacheResult.value

  // Return early if image is cached
  if (cacheCheck.exists) {
    return okAsync({ success: true, value: cacheCheck.path })
  }

  // Not in cache: get an image from Unsplash (or the mock provider), falling back to a
  // placeholder if Unsplash can't provide one. Only failures getting the image fall back; a
  // failure saving it still fails the seed, because that points to a problem on our side.
  const image = dependencies.unsplashStatus.available
    ? fetchImage(dependencies, query).orElse(error => {
        // This runs later than the check above: that one ran when the request started, this one
        // runs when its refusal comes back. Images are requested in parallel, so by now an
        // earlier refusal may already have marked Unsplash unavailable. Checking again means only
        // the first refusal logs the warning. The URL is left out because it contains the key.
        if (dependencies.unsplashStatus.available) {
          dependencies.unsplashStatus.available = false
          dependencies.logger.warn(
            `Unsplash couldn't provide an image for ${query} ${id} (${error.message}). ` +
              "Using placeholder images for the rest of this seed run.",
            { query, entityId: id, errorCode: error.context.code, details: error.context.details }
          )
        } else {
          dependencies.logger.debug(`Using a placeholder image for ${query} ${id}`)
        }
        return fetchImage(dependencies.placeholderImages, query)
      })
    : fetchImage(dependencies.placeholderImages, query).map(result => {
        dependencies.logger.debug(`Using a placeholder image for ${query} ${id}`)
        return result
      })

  return image.andThen((result: ImageDownloadResult) => {
    const { content } = result
    const fileName = `${id}`
    return dependencies.saveImage(content, fileName, seedImageDir)
  })
}
