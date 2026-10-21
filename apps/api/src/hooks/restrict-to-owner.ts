import { Forbidden } from "@feathersjs/errors"
import type { HookContext } from "../declarations"

/**
 * Only lets a logged-in user change records that belong to them; anyone else gets 403.
 *
 * `getOwnerId` returns the id of the user who owns the record the request targets. Run this after
 * the `authenticate` hook, so `params.user` is the logged-in user.
 *
 * Internal calls (seeds, other services, the users service creating a profile) have no provider
 * and are always allowed.
 */
export const restrictToOwner =
  (getOwnerId: (context: HookContext) => Promise<string | undefined>) =>
  async (context: HookContext) => {
    if (!context.params.provider) return context

    const ownerId = await getOwnerId(context)
    if (!ownerId || ownerId !== context.params.user?.id) {
      throw new Forbidden("You can only change your own records")
    }
    return context
  }

/** For the users service: a user record is owned by that user. */
export const ownUserRecord = async (context: HookContext) =>
  context.id === null || context.id === undefined ? undefined : String(context.id)

/**
 * For the profiles service: a profile is owned by its `userId`. Runs after patchProfileByUserId,
 * so `context.id` is always the profile id by then.
 */
export const ownProfileRecord = async (context: HookContext) => {
  if (context.id === null || context.id === undefined) return undefined
  const profile = await context.app
    .get("postgresqlClient")("Profile")
    .select("userId")
    .where({ id: context.id })
    .first()
  return profile?.userId
}
