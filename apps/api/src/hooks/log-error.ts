/**
 * Log Error Hook - The Quality Control Inspector
 *
 * Think of this as a quality control inspector watching every order:
 * - Watches every service method call as it's processed
 * - If something goes wrong, captures the full context:
 *   "Table 5, ordered the salmon, waiter was John, problem occurred at 7:45pm"
 *
 * This hook wraps service methods (not Koa middleware), so it has access to
 * rich FeathersJS context: which service, what method, who's the user, etc.
 *
 * The Koa error handler catches errors at the HTTP level.
 * This hook catches errors at the SERVICE level, with more context.
 *
 * Both work together:
 * 1. Service error occurs
 * 2. This hook logs it with full context
 * 3. Error bubbles up to Koa error handler
 * 4. Koa handler formats the HTTP response
 *
 * For more information about this file see https://dove.feathersjs.com/guides/cli/log-error.html
 */

import type { HookContext, NextFunction } from "../declarations"
import { logErrorWithContext } from "../logger"
import type { ErrorContext } from "../errors/types"

/**
 * Check if we're in production mode.
 * This affects how much detail we log.
 */
const isProduction = process.env.NODE_ENV === "production"

/**
 * Error logging hook that wraps all service methods.
 *
 * This is an "around" hook - it wraps the entire service method execution:
 * 1. Code before `await next()` runs BEFORE the method
 * 2. `await next()` executes the actual service method
 * 3. Code after `await next()` runs AFTER the method
 * 4. The catch block handles any errors thrown during execution
 *
 * @param context - FeathersJS hook context with service, method, params, etc.
 * @param next - Function to call the next hook or the service method
 *
 * @example
 * // When a user calls userService.get(123):
 * // context.path = 'users'
 * // context.method = 'get'
 * // context.id = 123
 * // context.params.user = { id: 456, email: 'john@example.com' }
 */
export const logError = async (context: HookContext, next: NextFunction) => {
  try {
    // Execute the service method (and any other hooks in the chain)
    await next()
  } catch (error: unknown) {
    // Safety check: only process Error objects
    if (!(error instanceof Error)) {
      throw error
    }

    // Build the "incident report" - structured error context
    // This captures all the details we need to understand what happened
    const errorContext: ErrorContext = {
      // Which service? (e.g., "users", "properties")
      service: context.path,
      // What operation? (e.g., "find", "get", "create", "patch", "remove")
      method: context.method,
      // The full path (same as service for standard FeathersJS services)
      path: context.path,
      // Who was logged in when this happened?
      // The user object is added by authentication hooks
      userId: context.params?.user?.id,
    }

    // In development, include query params for easier debugging
    // In production, we omit these to avoid logging sensitive data
    if (!isProduction && context.params?.query) {
      errorContext.params = context.params.query as Record<string, unknown>
    }

    // Determine whether to include the stack trace
    // Stack traces are always useful for 5xx errors (server bugs)
    // For 4xx errors, they're only useful in development
    const is5xxError = !("code" in error) || (error as { code: number }).code >= 500
    const includeStack = is5xxError || !isProduction

    // Log the error with full context
    // This creates a detailed "incident report" in the logs
    logErrorWithContext(error, errorContext, includeStack)

    // Re-throw the error so it continues up the chain
    // The Koa error handler will catch this and format the HTTP response
    throw error
  }
}
