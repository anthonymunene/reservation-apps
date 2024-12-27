export enum ErrorCode {
  CONFIGURATION = "CONFIGURATION_ERROR",
  NETWORK = "NETWORK_ERROR",
  PARSE = "PARSE_ERROR",
  WRITE = "WRITE_ERROR",
  API = "API_ERROR",
  NOT_FOUND = "NOT_FOUND",
  HASHING = "HASHING_ERROR",
  DATABASE = "DATABASE_ERROR",
  UNKNOWN = "UNKNOWN_ERROR",
}

export interface ErrorContext {
  code: ErrorCode
  timestamp: Date
  details?: Record<string, unknown>
  stack?: string
  cause?: Error
}

export class AppError extends Error {
  public readonly context: ErrorContext

  constructor(message: string, code: ErrorCode, details?: Record<string, unknown>, cause?: Error) {
    super(message)

    this.name = code
    this.context = {
      code,
      timestamp: new Date(),
      details,
      stack: this.stack,
      cause,
    }
    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype)
  }

  public toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      context: this.context,
    }
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.CONFIGURATION, details, cause)
  }
}

export class NetworkError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.NETWORK, details, cause)
  }
}

export class ParseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.PARSE, details, cause)
  }
}

export class WriteError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.WRITE, details, cause)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.DATABASE, details, cause)
  }
}

export class ApiError extends AppError {
  constructor(
    message: string,
    public readonly status: number,
    details?: Record<string, unknown>,
    cause?: Error
  ) {
    super(message, ErrorCode.API, { ...details, status }, cause)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.NOT_FOUND, details, cause)
  }
}

export class HashingError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.HASHING, details, cause)
  }
}

export class UnknownError extends AppError {
  constructor(message: string, details?: Record<string, unknown>, cause?: Error) {
    super(message, ErrorCode.UNKNOWN, details, cause)
  }
}

export type ImagesMetaDataError = ConfigurationError | ParseError | NetworkError
