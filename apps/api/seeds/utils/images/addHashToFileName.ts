import { BinaryLike, createHash } from "crypto"
import { createError } from "@seeds/utils/createError"
import { AppError, ErrorCode } from "@seeds/utils/types/errors"
import { err, ok, Result } from "neverthrow"

type StringOrBuffer = string | Buffer
const generateHash = (fileName: string, content: BinaryLike): Result<string, AppError> => {
  return Result.fromThrowable(
    (fileName: string, content: BinaryLike) => {
      const hash = createHash("md5").update(content).digest("hex").slice(0, 8)
      return `${fileName.toLowerCase().replace(/ /g, "-")}-${hash}.png`
    },
    () => createError(ErrorCode.HASHING, "Failed to generate hashed filename")
  )(fileName, content)
}

export const addHashToFileName = (
  fileName: string,
  content: BinaryLike
): Result<string, AppError> => {
  if (!fileName) {
    return err(createError(ErrorCode.API, "Filename is required"))
  }

  if (!content) {
    return err(createError(ErrorCode.API, "Content is required for hashing"))
  }
  const hashedFileName = generateHash(fileName, content)
  if (hashedFileName.isOk()) {
    return ok(hashedFileName.value)
  } else {
    return err(createError(ErrorCode.HASHING, `${hashedFileName.error}`))
  }
}
