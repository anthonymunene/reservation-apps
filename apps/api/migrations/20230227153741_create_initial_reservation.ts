import { Knex } from "knex"
import { ImageDefaults } from "../seeds/utils/imageDefaults"

export async function up(knex: Knex): Promise<void> {
  await knex.schema
    .createTable("User", table => {
      table.uuid("id").unique().primary().notNullable()
      table.string("email").notNullable().unique()
      table.string("password").notNullable()
      table.timestamps(false, true, true)
      table.timestamp("lastLogin")
    })
    .createTable("Profile", table => {
      table.uuid("id").unique().primary().notNullable()
      table.string("firstName")
      table.string("surname")
      table.string("otherNames")
      table.text("bio")
      table.boolean("isSuperHost").notNullable().defaultTo(false) // should belong in property rentaltable
      table.jsonb("images").nullable().defaultTo("[]")
      table.uuid("userId").unsigned().references("id").inTable("User").onDelete("cascade")
      table.timestamps(false, true, true)
    })
    .createTable("PropertyType", table => {
      table.uuid("id").unique().primary().notNullable()
      table.string("name").notNullable()
      table.timestamps(false, true, true)
    })
    .createTable("Property", table => {
      table.uuid("id").unique().primary().notNullable()
      table.string("title").notNullable()
      table.text("description")
      table.string("city")
      table.string("countryCode")
      table.integer("bedrooms").unsigned()
      table.integer("beds").unsigned()
      table.jsonb("images").nullable().defaultTo(ImageDefaults.createDefaultJson())
      table.uuid("host").unsigned().references("id").inTable("User").onDelete("cascade")
      table.uuid("propertyTypeId").unsigned().references("PropertyType.id").onDelete("cascade")
      table.timestamps(false, true, true)
    })
    .createTable("Amenity", table => {
      table.uuid("id").unique().primary().notNullable()
      table.string("name").unique()
      table.timestamps(false, true, true)
    })
    .createTable("PropertyAmenity", function (table) {
      table.uuid("id").unique().primary().notNullable()
      table.uuid("propertyId").unsigned().references("Property.id").onDelete("cascade")
      table.uuid("amenityId").unsigned().references("Amenity.id").onDelete("cascade")
      table.timestamps(false, true, true)
    })
    .createTable("Review", table => {
      table.uuid("id").unique().primary().notNullable()
      table.uuid("propertyId").unsigned().references("Property.id").onDelete("cascade")
      table.uuid("userId").unsigned().references("User.id").onDelete("cascade")
      table.text("comment")
      table.timestamps(false, true, true)
    })
}

const tables = [
  "User",
  "Amenity",
  "Profile",
  "Review",
  "PropertyType",
  "Property",
  "PropertyAmenity",
]

export async function down(knex: Knex): Promise<void[]> {
  return Promise.all(
    tables.map(async function (table) {
      try {
        console.log(table, "down start")
        await knex.raw(`DROP TABLE IF EXISTS "${table}" CASCADE`)
        console.log(table, "down finish")
      } catch (err: any) {
        console.error(err.detail)
      }
    })
  )
}
