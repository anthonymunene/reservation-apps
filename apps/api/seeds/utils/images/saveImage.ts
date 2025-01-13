import { createError } from "@seeds/utils/createError"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"
import { addHashToFileName, writeToDisk } from "@seeds/utils/images/index"
import { err, ok, Result } from "neverthrow"
import { ImageDownloadResult } from "@seeds/utils/types/images"

export type SavedImageSuccess = { success: boolean; value: string }
export const saveImage = (
  content: ImageDownloadResult["content"],
  name: string,
  dir: string
): Result<SavedImageSuccess, ImagesMetaDataError> => {
  if (!content) {
    return err(createError(ErrorCode.CONFIGURATION, "content is missing"))
  }

  if (!name) {
    return err(createError(ErrorCode.CONFIGURATION, "filename is missing"))
  }

  if (!dir) {
    return err(createError(ErrorCode.CONFIGURATION, "directory is missing"))
  }

  return addHashToFileName(name, content)
    .andThen(fileName => {
      const path = `${dir}/${fileName}`
      return writeToDisk(path, content)
    })
    .map(savedImage => ({ success: true, value: savedImage.message }))
    .mapErr(error => {
      console.error(error.message)
      return createError(ErrorCode.WRITE, error.message)
    })
    .match(
      success => ok(success),
      error => err(error)
    )
}
