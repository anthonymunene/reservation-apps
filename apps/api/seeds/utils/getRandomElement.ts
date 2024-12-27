import { err, ok, Result } from "neverthrow"
//@ts-ignore
import { faker } from "@faker-js/faker"
import { createError } from "@seeds/utils/createError"
import { ConfigurationError, ErrorCode, ParseError } from "@seeds/utils/types/errors"

export function getRandomElement<T>(array: T[]): Result<T, ConfigurationError | ParseError> {
  if (!array || array.length === 0) {
    return err(createError(ErrorCode.CONFIGURATION, "Array is empty or undefined"))
  }

  if (!Array.isArray(array)) {
    return err(createError(ErrorCode.PARSE, "argument is not an Array"))
  }
  const element = faker.helpers.arrayElement(array)
  return ok(element)
}
