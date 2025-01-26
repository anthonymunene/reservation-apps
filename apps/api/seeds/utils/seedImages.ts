//@ts-nocheck
import { existsSync, mkdirSync } from "fs"
import type { ImageConfigOpts } from "@seeds/utils/types/shared"
import { errAsync, Result } from "neverthrow"
import { ErrorCode } from "@seeds/utils/types/errors"
import { downloadImages, extractImageLinks, getImageData, saveImage } from "@seeds/utils/images"
import { createError } from "@seeds/utils/createError"
import { ImageDownloadResult } from "@seeds/utils/types/images"

export const createIfNotExist = (filepath: string) => {
  if (!existsSync(filepath)) {
    mkdirSync(filepath, { recursive: true })
  }
  return `${filepath}`
}

export const seedImages = (opts: ImageConfigOpts) => {
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
    .andThen((files: ImageDownloadResult[]) => {
      const file = files.map(file => {
        const { content } = file
        const fileName = `${id}`
        return saveImage(content, fileName, seedImageDir)
      })
      return Result.combine(file)
    })
}
