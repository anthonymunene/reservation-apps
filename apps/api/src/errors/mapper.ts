/**
 * Error Mapper - The Translator
 *
 * Think of this as the translator between the kitchen (internal system)
 * and the customers (API consumers).
 *
 * The kitchen might say "the grill is broken" (FeathersJS GeneralError),
 * but we translate this to a standardized customer-friendly format:
 * { success: false, error: { code: "INTERNAL_ERROR", message: "..." } }
 *
 * This ensures consistency - no matter what goes wrong internally,
 * the customer always gets a response in the same predictable format.
 */

import { FeathersError } from "@feathersjs/errors"
import { ErrorCodes, ErrorCode, ApiErrorResponse } from "./types"

/**
 * Maps FeathersJS error class names to our standardized error codes.
 *
 * This is the translation dictionary:
 * - FeathersJS uses class names like "BadRequest", "NotFound"
 * - We convert these to UPPER_SNAKE_CASE codes like "BAD_REQUEST", "NOT_FOUND"
 *
 * Why this mapping?
 * - Decouples our API contract from FeathersJS internals
 * - Allows us to change frameworks without breaking API consumers
 * - Provides a clear, documented set of error codes
 */
const errorCodeMap: Record<string, ErrorCode> = {
  // Client errors (4xx) - problems with the request
  BadRequest: ErrorCodes.BAD_REQUEST,
  NotAuthenticated: ErrorCodes.NOT_AUTHENTICATED,
  Forbidden: ErrorCodes.FORBIDDEN,
  NotFound: ErrorCodes.NOT_FOUND,
  MethodNotAllowed: ErrorCodes.METHOD_NOT_ALLOWED,
  Conflict: ErrorCodes.CONFLICT,

  // Validation is a special case of BadRequest but gets its own code
  // because it's so common and has specific handling needs
  Unprocessable: ErrorCodes.VALIDATION_ERROR,

  // Rate limiting
  TooManyRequests: ErrorCodes.TOO_MANY_REQUESTS,

  // Server errors (5xx) - problems on our end
  GeneralError: ErrorCodes.INTERNAL_ERROR,
  Unavailable: ErrorCodes.SERVICE_UNAVAILABLE,
  NotImplemented: ErrorCodes.INTERNAL_ERROR,
  BadGateway: ErrorCodes.SERVICE_UNAVAILABLE,
}

/**
 * Maps any error to our standardized error code.
 *
 * @param error - Any error (FeathersJS or native JavaScript)
 * @returns The appropriate ErrorCode
 *
 * @example
 * // FeathersJS error
 * mapErrorToCode(new NotFound('User not found')) // Returns 'NOT_FOUND'
 *
 * // Unknown error
 * mapErrorToCode(new Error('Something broke')) // Returns 'INTERNAL_ERROR'
 */
export function mapErrorToCode(error: Error): ErrorCode {
  // FeathersJS errors have a 'name' property matching our map
  if (error instanceof FeathersError) {
    return errorCodeMap[error.name] || ErrorCodes.INTERNAL_ERROR
  }

  // Non-FeathersJS errors are treated as internal errors
  // This is the safe default - we don't expose internal details
  return ErrorCodes.INTERNAL_ERROR
}

/**
 * Extracts error details (validation errors, etc.) from an error.
 *
 * FeathersJS errors can have:
 * - `errors`: Array of validation errors (from schema validation)
 * - `data`: Additional error data
 *
 * @param error - The error to extract details from
 * @returns Array of error details, or empty array if none
 */
function extractErrorDetails(error: Error): unknown[] {
  if (!(error instanceof FeathersError)) {
    return []
  }

  // Prefer 'errors' (standard FeathersJS validation errors)
  if (error.errors && Array.isArray(error.errors)) {
    return error.errors
  }

  // Fall back to 'data' if it's an array
  if (error.data && Array.isArray(error.data)) {
    return error.data
  }

  // If data is an object with useful info, wrap it in an array
  if (error.data && typeof error.data === "object") {
    return [error.data]
  }

  return []
}

/**
 * Formats any error into our standardized API error response.
 *
 * This is the main function that transforms raw errors into the
 * consistent format our API consumers expect.
 *
 * @param error - Any error to format
 * @returns A standardized ApiErrorResponse
 *
 * @example
 * // Input: FeathersJS BadRequest with validation errors
 * formatErrorResponse(new BadRequest('Invalid email', { errors: [{field: 'email'}] }))
 *
 * // Output:
 * // {
 * //   success: false,
 * //   error: {
 * //     code: "BAD_REQUEST",
 * //     message: "Invalid email",
 * //     details: [{field: 'email'}],
 * //     timestamp: "2025-01-24T10:00:00.000Z"
 * //   }
 * // }
 */
export function formatErrorResponse(error: Error): ApiErrorResponse {
  return {
    success: false,
    error: {
      code: mapErrorToCode(error),
      message: error.message || "An unexpected error occurred",
      details: extractErrorDetails(error),
      timestamp: new Date().toISOString(),
    },
  }
}

/**
 * Gets the HTTP status code for an error.
 *
 * FeathersJS errors have a 'code' property with the HTTP status.
 * For non-FeathersJS errors, we default to 500 (Internal Server Error).
 *
 * @param error - The error to get status code for
 * @returns HTTP status code (e.g., 400, 404, 500)
 */
export function getHttpStatusCode(error: Error): number {
  if (error instanceof FeathersError) {
    return error.code
  }
  return 500
}
