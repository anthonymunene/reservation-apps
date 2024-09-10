import knex from "knex"
import { updateTypes } from "knex-types"
import { app } from "./src/app"

const config = app.get("postgresql")

const db = knex({ ...config, debug: true })
// @ts-ignore
updateTypes(db, {
  output: "./src/types.ts",
  exclude: ["knex_migrations", "knex_migrations_lock"],
}).catch(err => {
  console.error(err)
  process.exit(1)
})
