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
│   ├── users.ts
│   ├── properties.ts
│   └── utils/                 # Seed utilities
└── src/database-generated-types/  # Generated types
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
cd apps/api
pnpm migrate:make migration_name
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

```bash
cd apps/api

# Run pending migrations
pnpm migrate

# Create new migration
pnpm migrate:make add_new_table

# Rollback last migration
npx knex migrate:rollback

# Run seeds
pnpm seed

# Reset everything (Docker + migrate + seed)
pnpm dev:reset
```

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
pnpm docker:dev

# Start fresh (reset)
pnpm dev:reset
```

Docker compose in `apps/api/docker-compose.yml` handles PostgreSQL setup.

## Type Generation

Generate TypeScript types from database schema:

```bash
cd apps/api
pnpm generate-types
```

Generated types go to `src/database-generated-types/`.

## Best Practices

1. **UUIDs**: Use `randomUUID()` for all primary keys
2. **Timestamps**: Always include `table.timestamps(false, true, true)`
3. **Cascade Deletes**: Use `.onDelete("cascade")` for foreign keys
4. **JSONB**: Use for flexible schema fields (images, metadata)
5. **Rollback Safety**: Always implement `down()` migrations
