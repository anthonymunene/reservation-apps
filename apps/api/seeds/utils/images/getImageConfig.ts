import { ConfigurationError, ErrorCode } from "@seeds/utils/types/errors"
import { err, ok, Result } from "neverthrow"
import { createError } from "@seeds/utils/createError"

export const imageConfig = {
  properties: { imageCount: 5, query: "modern house", size: "regular" },
  users: { imageCount: 1, query: "headshot", size: "regular" },
} as const

export type ImageConfig = (typeof imageConfig)[keyof typeof imageConfig]

export const getImageConfig = (
  type: keyof typeof imageConfig
): Result<ImageConfig, ConfigurationError> => {
  const config = imageConfig[type]
  if (!config) {
    return err(createError(ErrorCode.CONFIGURATION, `Invalid config type: ${type}`))
  } else {
    return ok(config)
  }
}
