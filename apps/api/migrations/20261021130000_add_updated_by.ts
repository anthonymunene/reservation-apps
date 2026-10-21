import { Knex } from "knex"

// Every service's patch resolver records who made the change in `updatedBy`, but no table had the
// column, so every patch failed in the database. This adds it: the id of the user who last
// changed the row. It's empty for rows nobody has changed through the API, and is cleared if
// that user is deleted.
const TABLES = [
  "User",
  "Profile",
  "Property",
  "Review",
  "Amenity",
  "PropertyType",
  "PropertyAmenity",
]

export async function up(knex: Knex): Promise<void> {
  for (const table of TABLES) {
    await knex.schema.alterTable(table, builder => {
      builder.uuid("updatedBy").nullable().references("id").inTable("User").onDelete("SET NULL")
    })
  }
}

export async function down(knex: Knex): Promise<void> {
  for (const table of TABLES) {
    await knex.schema.alterTable(table, builder => {
      builder.dropColumn("updatedBy")
    })
  }
}
