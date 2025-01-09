import {
  ApiError,
  ConfigurationError,
  ErrorCode,
  HashingError,
  NetworkError,
  NotFoundError,
  ParseError,
  FileSystemError,
  UnknownError,
} from "@seeds/utils/types/errors"

export const createError = (
  code: ErrorCode,
  message: string,
  status?: number,
  details?: Record<string, unknown>,
  cause?: Error
) => {
  switch (code) {
    case ErrorCode.CONFIGURATION:
      return new ConfigurationError(message, details, cause)
    case ErrorCode.NETWORK:
      return new NetworkError(message, details, cause)
    case ErrorCode.PARSE:
      return new ParseError(message, details, cause)
    case ErrorCode.NOT_FOUND:
      return new NotFoundError(message, details, cause)
    case ErrorCode.HASHING:
      return new HashingError(message, details, cause)
    case ErrorCode.API:
      return new ApiError(message, status, details, cause)
    case ErrorCode.FILE_SYSTEM:
      return new FileSystemError(message, details, cause)
    default:
      return new UnknownError(message, details, cause)
  }
}
