import { faker } from "@faker-js/faker"
import { Table } from "@database-generated-types/knex-db"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { UserAccount } from "@seeds/utils/types/users"

/**
 * A user with a known email and password, so you can log in to a dev or test database. The other
 * seeded users get random passwords that aren't recorded anywhere.
 *
 * Override the defaults with DEMO_USER_EMAIL and DEMO_USER_PASSWORD (for example in Infisical).
 * The password must be at least 8 characters, like any other.
 */
export const DEMO_USER_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@example.test"
export const DEMO_USER_PASSWORD = process.env.DEMO_USER_PASSWORD ?? "demo-password"

/**
 * The demo account to add to this seed run, or null when it shouldn't be added:
 * - never in production, where an account with a known password would be a way in
 * - not when it already exists, so running the seeds again doesn't fail on the unique email
 */
export const getDemoAccount = async (
  dbClient: DatabaseClient,
  environment = process.env.NODE_ENV
): Promise<UserAccount | null> => {
  if (environment === "production") return null

  const existing = await dbClient(Table.User).where({ email: DEMO_USER_EMAIL }).first()
  if (existing) return null

  return { id: faker.string.uuid(), email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD }
}
