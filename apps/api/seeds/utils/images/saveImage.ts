import { createError } from "@seeds/utils/createError"
import { ImagesMetaDataError, ErrorCode } from "@seeds/utils/types/errors"
import { addHashToFileName, writeToDisk } from "@seeds/utils/images/index"
import { err, ok, Result } from "neverthrow"

type StringOrBuffer = string | Buffer
export type SavedImageSuccess = { success: boolean; value: string }
export const saveImage = (
  buffer: StringOrBuffer,
  fileName: string,
  dir: string
): Result<SavedImageSuccess, ImagesMetaDataError> => {
  if (!buffer) {
    return err(createError(ErrorCode.CONFIGURATION, "content is missing"))
  }

  if (!fileName) {
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
