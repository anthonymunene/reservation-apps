/**
 * Error Types and Interfaces
 *
 * Think of this as our "Problem Category Menu" - just like a restaurant
 * categorizes issues (kitchen problems, billing issues, out-of-stock items),
 * we define standardized categories for all API errors.
 *
 * This ensures every error response follows the same format, making it
 * easier for API consumers to handle errors consistently.
 */

/**
 * Standardized error codes for the API.
 * These map to FeathersJS error types but use a consistent UPPER_SNAKE_CASE format.
 *
 * Why a const object instead of an enum?
 * - Better tree-shaking (smaller bundle size)
 * - Works better with TypeScript's type inference
 * - Can be used as both values and types
 */
export const ErrorCodes = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_AUTHENTICATED: "NOT_AUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
  CONFLICT: "CONFLICT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
} as const

/**
 * Type derived from ErrorCodes - ensures only valid codes can be used.
 * This is TypeScript magic: it extracts the union of all values from ErrorCodes.
 */
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * The standardized API error response format.
 * Every error response from our API will follow this exact structure.
 *
 * This is like a restaurant's standard complaint form - every issue
 * gets documented the same way, making it easy for management (API consumers)
 * to process and handle problems.
 */
export interface ApiErrorResponse {
  success: false
  error: {
    /** Categorized error code (e.g., "VALIDATION_ERROR", "NOT_FOUND") */
    code: ErrorCode
    /** Human-readable error message */
    message: string
    /** Additional details (validation errors, field-specific issues, etc.) */
    details: unknown[]
    /** ISO timestamp when the error occurred */
    timestamp: string
  }
}

/**
 * Context information for error logging.
 * This is our "Incident Report" - captures all the details needed
 * to understand and debug what went wrong.
 *
 * Like a restaurant manager's incident report:
 * - Which table (service)?
 * - What did they order (method)?
 * - Who was the waiter (user)?
 * - What were the special requests (params)?
 */
export interface ErrorContext {
  /** The service path (e.g., "users", "properties") */
  service: string
  /** The service method (e.g., "find", "create", "patch") */
  method: string
  /** The full request path */
  path: string
  /** Optional request ID for distributed tracing */
  requestId?: string
  /** The authenticated user's ID, if available */
  userId?: string | number
  /** Query parameters (only included in development for debugging) */
  params?: Record<string, unknown>
}
