import { writeFileSync } from "node:fs"
import { createError } from "@seeds/utils/createError"
import { AppError, ErrorCode } from "@seeds/utils/types/errors"
import { Result } from "neverthrow"

type StringOrBuffer = string | Buffer

export type WriteSuccess = {
  message: string
}
export const writeToDisk = (path: string, buffer: StringOrBuffer): Result<WriteSuccess, AppError> =>
  Result.fromThrowable(
    () => {
      writeFileSync(path, buffer)
      return { message: `Successfully saved image to ${path}` }
    },
    error =>
      createError(
        ErrorCode.WRITE,
        error instanceof Error ? error.message : "Write operation failed"
      )
  )()