import { Knex } from "knex"
import bcrypt from "bcryptjs"

// Until #14, passwords were stored as plain text. Login now compares against a bcrypt hash, so
// this hashes every password that isn't one yet. Running it again changes nothing.
//
// 10 rounds matches the default the Feathers local strategy uses when it hashes new passwords.
const HASH_ROUNDS = 10
const BCRYPT_HASH = /^\$2[aby]\$/

export async function up(knex: Knex): Promise<void> {
  const users: { id: string; password: string }[] = await knex("User").select("id", "password")
  const plainText = users.filter(user => !BCRYPT_HASH.test(user.password))

  for (const user of plainText) {
    const hash = await bcrypt.hash(user.password, HASH_ROUNDS)
    await knex("User").where({ id: user.id }).update({ password: hash })
  }
}

// The original passwords can't be recovered from their hashes, so there is nothing to undo.
export async function down(): Promise<void> {}
