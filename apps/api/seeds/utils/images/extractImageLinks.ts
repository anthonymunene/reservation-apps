import { ImagedataResponse } from "@seeds/utils/types/images"
import { err, ok, Result } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"

export const extractImageLinks = (
  data: ImagedataResponse
): Result<string[], ImagesMetaDataError> => {
  const { options, result } = data
  const hasUrls = result.filter(result => {
    return !!result.urls
  })
  if (!hasUrls) {
    return err(createError(ErrorCode.CONFIGURATION, `URL not found`))
  }
  if (!options?.size) {
    return err(createError(ErrorCode.CONFIGURATION, `Missing size option`))
  }
  const size = options.size

  const images = result.map(results => {
    return results.urls[size]
  })
  return ok(images)
}
