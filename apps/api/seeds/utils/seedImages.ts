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

export const createIfNotExist = (filepath: string) => {
  if (!existsSync(filepath)) {
    mkdirSync(filepath, { recursive: true })
  }
  return `${filepath}`
}

/**
 * Creates the appropriate dependencies based on environment.
 * In test environment, uses mock providers to avoid Unsplash API calls.
 */
const createDependencies = () => {
  const useMock = shouldUseMockImages()

  return {
    checkImageCache,
    getImageData: useMock ? getMockImageData : getImageData,
    extractImageLinks: useMock ? extractMockImageLinks : extractImageLinks,
    downloadImages: useMock ? downloadMockImages : downloadImages,
    saveImage,
  }
}

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

  // Not in cache - download image (from Unsplash or mock provider)
  return dependencies
    .getImageData(query)
    .andThen(dependencies.extractImageLinks)
    .andThen(dependencies.downloadImages)
    .andThen((result: ImageDownloadResult) => {
      const { content } = result
      const fileName = `${id}`
      return dependencies.saveImage(content, fileName, seedImageDir)
    })
}
