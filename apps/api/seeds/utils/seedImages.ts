import { existsSync, mkdirSync } from "fs"
import type { ImageConfigOpts } from "@seeds/utils/types/images"
import { ImageDownloadResult } from "@seeds/utils/types/images"
import { errAsync, ResultAsync } from "neverthrow"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"
import {
  downloadImages,
  extractImageLinks,
  getImageData,
  SavedImageSuccess,
  saveImage,
} from "@seeds/utils/images"
import { createError } from "@seeds/utils/createError"

export const createIfNotExist = (filepath: string) => {
  if (!existsSync(filepath)) {
    mkdirSync(filepath, { recursive: true })
  }
  return `${filepath}`
}

export const seedImages = (
  opts: ImageConfigOpts
): ResultAsync<SavedImageSuccess | SavedImageSuccess[], ImagesMetaDataError> => {
  const { query, id } = opts

  // Validate inputs
  if (!opts.query || !opts.id) {
    return errAsync(createError(ErrorCode.CONFIGURATION, "Type and ID are required parameters"))
  }

  const seedImageDir = `${process.cwd()}/seeds/images/${opts.query}`

  createIfNotExist(seedImageDir)

  return getImageData(query)
    .andThen(extractImageLinks)
    .andThen(downloadImages)
    .andThen((result: ImageDownloadResult) => {
      const { content } = result
      const fileName = `${id}`
      return saveImage(content, fileName, seedImageDir)
    })
}
