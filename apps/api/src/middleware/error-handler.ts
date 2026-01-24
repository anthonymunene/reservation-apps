/**
 * Custom Koa Error Handler - The Front-of-House Manager
 *
 * Think of this as the front-of-house manager at a restaurant:
 * - Sits at the entrance, catches all problems before they reach customers
 * - Ensures every problem is communicated consistently
 * - Customers always get a response in the same format, whether it's
 *   a billing issue or a kitchen fire
 *
 * This middleware sits early in the Koa stack and:
 * 1. Wraps all downstream middleware in a try-catch
 * 2. Catches any errors that bubble up
 * 3. Transforms them into our standardized API response format
 *
 * The Assembly Line Analogy:
 * ```
 * Request → [Error Handler] → [Auth] → [Body Parser] → [Service] → Response
 *                 ↑              ↓           ↓              ↓
 *                 └──────── Errors flow back and get caught here
 * ```
 */

import type { Context, Next } from "koa"
import { NotFound } from "@feathersjs/errors"
import { formatErrorResponse, getHttpStatusCode } from "../errors"

/**
 * Creates the custom error handler middleware.
 *
 * Why is this a factory function that returns middleware?
 * - Follows Koa middleware convention
 * - Allows for future configuration options (e.g., custom handlers)
 * - Matches the pattern used by FeathersJS's errorHandler()
 *
 * @returns Koa middleware function
 *
 * @example
 * // In app.ts:
 * app.use(customErrorHandler())
 */
export const customErrorHandler = () => async (ctx: Context, next: Next) => {
  try {
    // Let the request flow through all downstream middleware
    await next()

    // Handle 404 for routes that didn't match anything
    // If we get here and ctx.body is undefined, no route handled the request
    if (ctx.body === undefined) {
      // Create a proper NotFound error so it gets formatted correctly
      throw new NotFound(`Path ${ctx.path} not found`)
    }
  } catch (error: unknown) {
    // Safety check: ensure we have an Error object
    // In rare cases, non-Error values can be thrown
    if (!(error instanceof Error)) {
      ctx.status = 500
      ctx.body = formatErrorResponse(new Error("Unknown error occurred"))
      return
    }

    // Set the HTTP status code
    // FeathersJS errors have a 'code' property with the correct status
    // Regular errors default to 500 (Internal Server Error)
    ctx.status = getHttpStatusCode(error)

    // Transform the error into our standardized response format
    // This is where the "translation" happens - internal error details
    // become a clean, documented API response
    ctx.body = formatErrorResponse(error)

    // Set the content type to JSON
    ctx.type = "application/json"
  }
}
