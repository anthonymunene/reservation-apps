//@ts-nocheck
import { existsSync, mkdirSync } from "fs"
import type { SeederOpts } from "@seeds/utils/types/shared"
import { errAsync } from "neverthrow"
import { ErrorCode } from "@seeds/utils/types/errors"
import { downloadImage, extractImageURL, getImageData, saveImage } from "@seeds/utils/images"
import { createError } from "@seeds/utils/createError"

export const createIfNotExist = (filepath: string) => {
  if (!existsSync(filepath)) {
    mkdirSync(filepath, { recursive: true })
  }
  return `${filepath}`
}

export const seedImages = (opts: SeederOpts) => {
  const { type, id, imageCount = 3 } = opts

  // Validate inputs
  if (!type || !id) {
    return errAsync(createError(ErrorCode.CONFIGURATION, "Type and ID are required parameters"))
  }

  const seedImageDir = `${process.cwd()}/seeds/images/${type}`
  const images: string[] = []
  // const removePath = (imagePath: string) => imagePath?.split(`${seedImageDir}/`)[1]

  createIfNotExist(seedImageDir)

  // TODO: consolidate duplicates
  // const downloadPromises = Array.from({ length: imageCount }, async () => {

  return getImageData(type)
    .andThen(extractImageURL)
    .andThen(downloadImage)
    .andThen((buffer: Buffer) => saveImage(buffer, id, seedImageDir))
  // const results = await Promise.all(downloadPromises)
  // images.push(...results.filter(Boolean))
  //
  // if (images.length === 0) {
  //   throw new Error("Failed to generate any valid images")
  // }

  // return imageCount > 1 ? images : images[0]
}
