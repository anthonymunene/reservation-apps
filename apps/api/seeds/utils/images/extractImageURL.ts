import { ImagedataResponse } from "@seeds/utils/types/images"
import { err, ok, Result } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { ImagesMetaDataError, ErrorCode } from "@seeds/utils/types/errors"

export const extractImageURL = (data: ImagedataResponse): Result<string, ImagesMetaDataError> => {
  const { options, result } = data
  if (!result?.urls) {
    return err(createError(ErrorCode.CONFIGURATION, `URL not found`))
  }
  if (!options?.size) {
    return err(createError(ErrorCode.CONFIGURATION, `Missing size option`))
  }
  const size = options.size
  return ok(result.urls[size])
}
