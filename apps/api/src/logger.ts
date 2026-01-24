/**
 * Winston Logger Configuration - The Incident Report System
 *
 * Think of this as a restaurant's incident report system:
 * - In a busy restaurant (production), you record key facts only
 * - During training (development), you record everything for learning
 *
 * This logger is environment-aware:
 * - Development: Verbose, human-readable logs with full details
 * - Production: Concise, JSON-formatted logs for log aggregation tools
 *
 * For more information about this file see https://dove.feathersjs.com/guides/cli/logging.html
 */

import { createLogger, format, transports } from "winston"
import type { ErrorContext } from "./errors/types"

/**
 * Check if we're in production mode.
 * This affects log verbosity and format.
 */
const isProduction = process.env.NODE_ENV === "production"

/**
 * Custom format for development - human-readable output.
 *
 * Format: "2025-01-24 10:30:00 [users.create] error: User email already exists"
 *
 * The context (service.method) is included when available,
 * making it easy to trace where errors originated.
 */
const developmentFormat = format.printf(({ level, message, timestamp, ...meta }) => {
  const context = meta.context as ErrorContext | undefined
  const contextStr = context ? ` [${context.service}.${context.method}]` : ""
  return `${timestamp}${contextStr} ${level}: ${message}`
})

/**
 * The main Winston logger instance.
 *
 * Configuration by environment:
 * - Production: warn level, JSON format (for log aggregation)
 * - Development: debug level, human-readable format
 */
export const logger = createLogger({
  // Production only logs warnings and errors (less noise)
  // Development logs everything (debug, info, warn, error)
  level: isProduction ? "warn" : "debug",

  format: format.combine(
    // Add timestamp to all log entries
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    // Enable string interpolation (e.g., logger.info('User %s created', userId))
    format.splat(),
    // Use JSON in production for machine parsing, human-readable in dev
    isProduction ? format.json() : developmentFormat
  ),

  transports: [new transports.Console()],
})

/**
 * Logs an error with full context - The Incident Report
 *
 * This is like filling out a detailed incident report at a restaurant:
 * - Which table (service)?
 * - What did they order (method)?
 * - Who was the waiter (user)?
 * - What exactly happened (error details)?
 *
 * @param error - The error that occurred
 * @param context - Contextual information about where/how the error happened
 * @param includeStack - Whether to include the full stack trace (default: true in dev, false in prod)
 *
 * @example
 * logErrorWithContext(
 *   new NotFound('User not found'),
 *   { service: 'users', method: 'get', path: 'users', userId: 123 },
 *   true
 * )
 *
 * // Development output:
 * // 2025-01-24 10:30:00 [users.get] error: User not found
 * // Stack: NotFound: User not found at ...
 *
 * // Production output (JSON):
 * // {"timestamp":"2025-01-24 10:30:00","level":"error","message":"User not found","context":{"service":"users","method":"get",...}}
 */
export function logErrorWithContext(
  error: Error,
  context: ErrorContext,
  includeStack = !isProduction
): void {
  // Build the log data object
  const logData: Record<string, unknown> = {
    context,
    errorName: error.name,
    errorMessage: error.message,
  }

  // Include stack trace:
  // - Always in development (helps debugging)
  // - Only for 5xx errors in production (indicates bugs we need to fix)
  if (includeStack) {
    logData.stack = error.stack
  }

  // Include FeathersJS error data if present
  // This often contains validation errors or other useful details
  if ("data" in error && error.data) {
    logData.data = error.data
  }

  // Include FeathersJS errors array if present
  // This is common with validation failures
  if ("errors" in error && error.errors) {
    logData.errors = error.errors
  }

  // Log the error with all context
  logger.error(error.message, logData)
}
