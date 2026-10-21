# Knex Database Patterns

## Overview

This project uses Knex.js v3 as the query builder with PostgreSQL. Database operations are managed through migrations and seeds.

## Directory Structure

```
apps/api/
├── knexfile.ts                # Knex configuration
├── migrations/                # Schema migrations
│   └── 20230227153741_create_initial_reservation.ts
├── seeds/                     # Seed data
│   ├── 01-properties.ts
│   ├── 02-users.ts
│   └── utils/                 # Seed utilities
└── src/types/knex-db.ts       # Generated types (@database-generated-types/knex-db)
```

## Configuration

The knexfile loads configuration from the Feathers app:

```typescript
// knexfile.ts
import { app } from "./src/app"
const config = app.get("postgresql")
module.exports = config
```

Configuration in `config/default.json`:
```json
{
  "postgresql": {
    "client": "pg",
    "connection": "postgres://user:pass@localhost:5432/reservation",
    "migrations": { "tableName": "knex_migrations" },
    "seeds": { "directory": "./seeds" }
  }
}
```

## Migration Pattern

### Creating Migrations

```bash
npm run migrate:make -w api -- migration_name
```

### Migration Structure

```typescript
import { Knex } from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("TableName", table => {
    // Primary key (UUID)
    table.uuid("id").unique().primary().notNullable()

    // String fields
    table.string("name").notNullable()
    table.string("email").notNullable().unique()

    // Text for long content
    table.text("description")

    // Numbers
    table.integer("count").unsigned()

    // Booleans with defaults
    table.boolean("isActive").notNullable().defaultTo(false)

    // JSON/JSONB for complex data
    table.jsonb("metadata").nullable().defaultTo("[]")

    // Foreign keys
    table.uuid("userId")
      .unsigned()
      .references("id")
      .inTable("User")
      .onDelete("cascade")

    // Timestamps (created_at, updated_at)
    table.timestamps(false, true, true)
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw('DROP TABLE IF EXISTS "TableName" CASCADE')
}
```

## Database Schema

Current tables:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| User | User accounts | id, email, password |
| Profile | User profiles | id, firstName, surname, userId |
| Property | Property listings | id, title, description, host |
| PropertyType | Property categories | id, name |
| Amenity | Amenity definitions | id, name |
| PropertyAmenity | Property-amenity links | propertyId, amenityId |
| Review | Property reviews | propertyId, userId, comment |

## Seed Pattern

```typescript
// seeds/users.ts
import { Knex } from "knex"
import { randomUUID } from "crypto"

export async function seed(knex: Knex): Promise<void> {
  // Clear existing data
  await knex("User").del()

  // Insert seed data
  await knex("User").insert([
    {
      id: randomUUID(),
      email: "admin@example.com",
      password: await hashPassword("password123"),
      created_at: new Date(),
      updated_at: new Date(),
    },
  ])
}
```

## Running Migrations & Seeds

The database connection comes from Infisical secrets. `seed` and `dev:reset` load them
themselves; the other commands need wrapping in `infisical run`:

```bash
# Run pending migrations (also regenerates types and runs Prettier)
infisical run --env=dev --path=/Apps/reservation-apps/api -- npm run migrate -w api

# Create new migration (no database needed)
npm run migrate:make -w api -- add_new_table

# See which migrations have run
infisical run --env=dev --path=/Apps/reservation-apps/api -- npm run migrate:list -w api

# Undo the last migration
infisical run --env=dev --path=/Apps/reservation-apps/api -- npm run migrate:down -w api

# Run seeds
npm run seed -w api

# Reset everything (Docker + migrate + seed), then start the API
npm run dev:reset -w api
```

Seeding a database that already has records the seeds didn't create can fail; see #64.

## Query Building in Services

FeathersJS uses Knex through the KnexService adapter:

```typescript
// In service class
export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "TableName",  // Database table name
    multi: true,
  }
}
```

### Custom Queries

```typescript
// In hooks or custom service methods
const knex = app.get("postgresqlClient")

// Raw query
const results = await knex("Property")
  .where("city", "London")
  .orderBy("created_at", "desc")

// Join query
const withRelations = await knex("Property")
  .join("PropertyType", "Property.propertyTypeId", "PropertyType.id")
  .select("Property.*", "PropertyType.name as typeName")
```

## Docker Database

Development uses Docker for PostgreSQL:

```bash
# Start database
npm run docker:dev -w api -- dev

# Start fresh (reset)
npm run dev:reset -w api
```

Docker compose in `apps/api/docker-compose.yml` handles PostgreSQL setup.

## Type Generation

Generate TypeScript types from database schema:

```bash
infisical run --env=dev --path=/Apps/reservation-apps/api -- npm run generate:types -w api
```

`npm run migrate` does this for you after migrating. Either way the types are written to
`src/types/knex-db.ts` and formatted with Prettier, so regenerating against an up-to-date
database leaves no changes. Import them with `@database-generated-types/knex-db` (as a type
import in `src`). Don't edit the file by hand; the next migration overwrites it.

## Best Practices

1. **UUIDs**: Use `randomUUID()` for all primary keys
2. **Timestamps**: Always include `table.timestamps(false, true, true)`
3. **Cascade Deletes**: Use `.onDelete("cascade")` for foreign keys
4. **JSONB**: Use for flexible schema fields (images, metadata)
5. **Rollback Safety**: Always implement `down()` migrations
