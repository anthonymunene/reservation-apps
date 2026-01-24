import type { Application } from "../../src/declarations"
import type { Knex } from "knex"

/**
 * Creates a query counter that tracks database queries via Knex events
 *
 * Analogy: Like a trip counter in a car - reset it, drive, check how far you went.
 * This helps us prove that our batch loading reduces the number of database "trips".
 *
 * @example
 * const counter = createQueryCounter(app)
 * await app.service("properties").find({ query: { $limit: 5 } })
 * console.log(counter.count()) // Shows how many queries were made
 * counter.stop() // Cleanup when done
 */
export const createQueryCounter = (app: Application) => {
  const knex = app.get("postgresqlClient") as Knex
  let queryCount = 0
  let queries: string[] = []

  // Listen for query events - Knex emits this for every SQL statement
  const handler = (data: { sql: string }) => {
    queryCount++
    queries.push(data.sql)
  }

  knex.on("query", handler)

  return {
    /** Reset the counter to zero - call this before each test */
    reset: () => {
      queryCount = 0
      queries = []
    },

    /** Get current query count */
    count: () => queryCount,

    /** Get all queries executed (useful for debugging) */
    queries: () => [...queries],

    /** Stop listening - call this in after() hook to cleanup */
    stop: () => {
      knex.off("query", handler)
    },
  }
}
