import { BadRequest, NotFound } from "@feathersjs/errors"
import type { HookContext } from "../declarations"

/**
 * Lets a client patch a profile by its owner's userId, e.g. PATCH /profiles?userId=...
 *
 * Profile ids are hidden from clients, so the frontend only knows the user's id. This looks up
 * that user's profile and turns the request into a patch of that one profile.
 *
 * A patch with no profile id must name a userId. Without this check, PATCH /profiles with an
 * empty query would try to update every profile at once.
 */
export const patchProfileByUserId = async (context: HookContext) => {
  if (context.id !== null && context.id !== undefined) return context

  const userId = context.params.query?.userId
  if (!userId) {
    throw new BadRequest("Patching a profile needs a profile id or a userId query")
  }

  const db = context.app.get("postgresqlClient")
  const profile = await db("Profile").select("id").where({ userId }).first()
  if (!profile) {
    throw new NotFound(`No profile found for user ${userId}`)
  }

  // Patch exactly this profile, and drop the userId filter now that it has been used
  const remainingQuery = { ...context.params.query }
  delete remainingQuery.userId
  context.id = profile.id
  context.params = { ...context.params, query: remainingQuery }
  return context
}
