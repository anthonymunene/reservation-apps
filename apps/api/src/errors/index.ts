/**
 * Errors Module - Central Export
 *
 * This file re-exports everything from the errors module,
 * allowing clean imports elsewhere in the codebase:
 *
 * @example
 * // Instead of:
 * import { ErrorCodes } from './errors/types'
 * import { formatErrorResponse } from './errors/mapper'
 *
 * // You can do:
 * import { ErrorCodes, formatErrorResponse } from './errors'
 */

export * from "./types"
export * from "./mapper"
