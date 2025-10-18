import { ImageMetadataWithQueryOptions } from "@seeds/utils/types/images"
import { ImagesMetaDataError } from "@seeds/utils/types/errors"
import { getImageMetaData } from "@seeds/utils/images/getImageMetaData"
import { getImageConfig, imageConfig } from "@seeds/utils/images/getImageConfig"
import { ResultAsync } from "neverthrow"

export const getImageData = (
  config: keyof typeof imageConfig
): ResultAsync<ImageMetadataWithQueryOptions, ImagesMetaDataError> => {
  return getImageConfig(config).asyncAndThen(getImageMetaData)
}
