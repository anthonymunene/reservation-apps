import { Conflict, FeathersError, GeneralError } from "@feathersjs/errors"
import type { HookContext, NextFunction } from "../declarations"

// Feathers' knex adapter keeps the original database error on the error it throws, under this
// symbol. That's how we know an error came from the database.
const DATABASE_ERROR = Symbol.for("@feathersjs/knex/error")

// Postgres error code for "a unique value already exists"
const UNIQUE_VIOLATION = "23505"

// Clear messages for duplicate values, by the name of the unique constraint that was broken.
//
// Telling someone an email is already registered does reveal that it has an account. We accept
// that for sign-up, as most sites do: without it, people can't tell why sign-up failed. Login
// stays generic ("Invalid login" for an unknown email and a wrong password alike), so it can't be
// used to check emails without also trying to sign up.
const DUPLICATE_MESSAGES: Record<string, string> = {
  user_email_unique: "An account with this email already exists",
}
const DEFAULT_DUPLICATE_MESSAGE = "A record with these details already exists"

export const GENERIC_DATABASE_MESSAGE = "The request could not be completed."

type DatabaseError = { code?: string; constraint?: string }

/**
 * Stops database error messages reaching clients.
 *
 * Postgres error messages include the SQL statement, with table, column and constraint names,
 * and Feathers' knex adapter passes them on unchanged. For requests from outside (REST or
 * socket.io), this replaces them:
 * - a duplicate value (e.g. an email that's already registered) becomes 409 Conflict with a clear
 *   message
 * - any other database error keeps its status but gets a generic message
 *
 * Register it outside logError in the app's around hooks, so logError still logs the full error
 * with its SQL on the server first. Internal calls keep the full message for debugging.
 */
export const hideDatabaseErrors = async (context: HookContext, next: NextFunction) => {
  try {
    await next()
  } catch (error: unknown) {
    const databaseError = (error as Record<symbol, DatabaseError> | null)?.[DATABASE_ERROR]
    if (!context.params.provider || !databaseError) throw error

    if (databaseError.code === UNIQUE_VIOLATION) {
      const constraint = databaseError.constraint ?? ""
      throw new Conflict(DUPLICATE_MESSAGES[constraint] ?? DEFAULT_DUPLICATE_MESSAGE)
    }

    // Keep the same kind of error (and so the same status code), with a safe message
    const SameKindOfError = error instanceof FeathersError ? error.constructor : GeneralError
    throw new (SameKindOfError as typeof GeneralError)(GENERIC_DATABASE_MESSAGE)
  }
}
