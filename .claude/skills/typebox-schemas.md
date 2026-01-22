# TypeBox Schema Patterns

## Overview

This project uses TypeBox for runtime schema validation in FeathersJS services. TypeBox provides JSON Schema compatible validation with TypeScript type inference.

## Schema File Structure

Each service has schemas in `[name].schema.ts`:

```typescript
import { resolve, virtual } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getDataValidator, getValidator, querySyntax, Type } from "@feathersjs/typebox"
import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
```

## Main Schema Pattern

```typescript
// Main data model schema
export const mySchema = Type.Object(
  {
    // UUID primary key
    id: Type.String({ format: "uuid" }),

    // Required string
    name: Type.String(),

    // Optional string
    description: Type.Optional(Type.String()),

    // Number
    count: Type.Number(),

    // Boolean
    isActive: Type.Boolean(),

    // Enum
    status: Type.Union([
      Type.Literal("pending"),
      Type.Literal("active"),
      Type.Literal("completed"),
    ]),

    // Array of strings
    tags: Type.Array(Type.String()),

    // Nested object
    metadata: Type.Object({
      key: Type.String(),
      value: Type.String(),
    }),

    // Array of objects
    images: Type.Array(
      Type.Object({
        url: Type.String(),
        metadata: Type.Object({
          status: Type.String(),
          uploadedAt: Type.String({ format: "date-time" }),
          displayOrder: Type.Number(),
          isPrimaryImage: Type.Boolean(),
        }),
      })
    ),

    // Foreign key
    userId: Type.String({ format: "uuid" }),

    // Timestamps
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
  },
  { $id: "MyEntity", additionalProperties: true }
)

// Infer TypeScript type from schema
export type MyEntity = Static<typeof mySchema>
```

## Schema Variations

### Data Schema (for create)

Pick only the fields required for creation:

```typescript
export const myDataSchema = Type.Pick(
  mySchema,
  ["name", "description", "userId"],
  { $id: "MyData" }
)
export type MyData = Static<typeof myDataSchema>
export const myDataValidator = getDataValidator(myDataSchema, dataValidator)
```

### Patch Schema (for update)

Make all fields optional:

```typescript
export const myPatchSchema = Type.Partial(mySchema, {
  $id: "MyPatch",
})
export type MyPatch = Static<typeof myPatchSchema>
export const myPatchValidator = getDataValidator(myPatchSchema, dataValidator)
```

### Query Schema

Define queryable fields with query syntax:

```typescript
export const myQueryProperties = Type.Pick(mySchema, ["id", "name", "status"])
export const myQuerySchema = Type.Intersect(
  [querySyntax(myQueryProperties)],
  { additionalProperties: false }
)
export type MyQuery = Static<typeof myQuerySchema>
export const myQueryValidator = getValidator(myQuerySchema, queryValidator)
```

## Resolvers

### Result Resolver (computed fields)

```typescript
export const myResolver = resolve<MyEntity, HookContext>({
  // Virtual field computed from related data
  ownerName: virtual(async (entity, context) => {
    const user = await context.app.service("users").get(entity.userId)
    return user.name
  }),

  // Virtual field from join
  categoryName: virtual(async (entity, context) => {
    const results = await context.app.service("categories").find({
      paginate: false,
      query: { id: entity.categoryId },
    })
    return results[0]?.name
  }),
})
```

### Data Resolver (auto-populate on create)

```typescript
export const myDataResolver = resolve<MyEntity, HookContext>({
  // Generate UUID
  id: async () => randomUUID(),

  // Set creation timestamp
  createdAt: async () => new Date().toISOString(),
})
```

### Patch Resolver (auto-update on patch)

```typescript
export const myPatchResolver = resolve<MyEntity, HookContext>({
  // Update timestamp
  updatedAt: async () => new Date().toISOString(),

  // Track who made the change
  updatedBy: async (_value, _doc, context) => context.params.user?.id,
})
```

### External Resolver (hide fields)

```typescript
export const myExternalResolver = resolve<MyEntity, HookContext>({
  // Hide internal fields from API response
  password: async () => undefined,
  internalNotes: async () => undefined,
  createdAt: async () => undefined,
})
```

## Query Resolver

```typescript
export const myQueryResolver = resolve<MyQuery, HookContext>({
  // Filter by current user
  userId: async (_value, _query, context) => {
    if (context.params.user) {
      return context.params.user.id
    }
    return _value
  },
})
```

## Common TypeBox Types

| TypeBox | TypeScript | JSON Schema |
|---------|-----------|-------------|
| `Type.String()` | `string` | `{ type: "string" }` |
| `Type.Number()` | `number` | `{ type: "number" }` |
| `Type.Boolean()` | `boolean` | `{ type: "boolean" }` |
| `Type.Array(T)` | `T[]` | `{ type: "array" }` |
| `Type.Object({})` | `{}` | `{ type: "object" }` |
| `Type.Optional(T)` | `T \| undefined` | Optional field |
| `Type.Partial(T)` | `Partial<T>` | All fields optional |
| `Type.Pick(T, [...])` | `Pick<T, ...>` | Subset of fields |
| `Type.Union([...])` | `A \| B` | oneOf |
| `Type.Literal("x")` | `"x"` | Enum value |

## Format Validators

```typescript
Type.String({ format: "uuid" })       // UUID format
Type.String({ format: "email" })      // Email format
Type.String({ format: "date-time" })  // ISO datetime
Type.String({ format: "uri" })        // URL format
```

## Global Validators

Located in `src/validators.ts`:

```typescript
import { Ajv, addFormats } from "@feathersjs/schema"

export const dataValidator = addFormats(new Ajv({}), ["date-time", "uuid", "email"])
export const queryValidator = addFormats(new Ajv({ coerceTypes: true }), ["date-time", "uuid"])
```
