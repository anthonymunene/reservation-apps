import { ImagedataResponse, ImageResponse } from "@seeds/utils/types/images"
import { ImagesMetaDataError, ErrorCode } from "@seeds/utils/types/errors"
import { getImageMetaData } from "@seeds/utils/images/getImageMetaData"
import { getImageConfig, imageConfig } from "@seeds/utils/images/getImageConfig"
import { createError } from "@seeds/utils/createError"
import { getRandomElement } from "@seeds/utils/getRandomElement"
import { err, ok, ResultAsync } from "neverthrow"

export const getImageData = (
  config: keyof typeof imageConfig,
  dependencies = { getRandomElement }
): ResultAsync<ImagedataResponse, ImagesMetaDataError> => {
  const { getRandomElement } = dependencies
  return getImageConfig(config)
    .asyncAndThen(getImageMetaData)
    .andThen(imageData => {
      const randomisedResult = getRandomElement<ImageResponse>(imageData.results)
      if (randomisedResult.isOk()) {
        const combineWithOptions = {
          options: imageData.options,
          result: randomisedResult.value,
        }
        return ok(combineWithOptions)
      } else {
        return err(createError(ErrorCode.CONFIGURATION, `${randomisedResult.error}`))
      }
    })
}
