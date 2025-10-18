import { ImageMetadataWithQueryOptions } from "@seeds/utils/types/images"
import { err, ok, Result } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"

export const extractImageLinks = (
  data: ImageMetadataWithQueryOptions
): Result<string, ImagesMetaDataError> => {
  const { size, urls } = data

  if (!urls) {
    return err(createError(ErrorCode.CONFIGURATION, `URL not found`))
  }
  if (!size) {
    return err(createError(ErrorCode.CONFIGURATION, `Missing size option`))
  }

  const images = urls[size]
  return ok(images)
}
