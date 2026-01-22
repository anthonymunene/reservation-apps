# FeathersJS Service Patterns

## Overview

This project uses FeathersJS v5 with Koa as the HTTP framework. Services follow a consistent file structure pattern with TypeBox validation, hooks, and resolvers.

## Service File Structure

Each service in `apps/api/src/services/[name]/` consists of:

```
[name]/
├── [name].ts           # Service registration and hooks configuration
├── [name].class.ts     # Service class extending KnexService
├── [name].schema.ts    # TypeBox schemas, validators, and resolvers
├── [name].shared.ts    # Shared path and method exports
└── [name].hooks.ts     # Custom hooks (optional)
```

## Service Registration Pattern

```typescript
// [name].ts - Service registration
import { hooks as schemaHooks } from "@feathersjs/schema"
import type { Application } from "../../declarations"
import { getOptions, MyService } from "./[name].class"
import { myPath, myMethods } from "./[name].shared"

export const myService = (app: Application) => {
  app.use(myPath, new MyService(getOptions(app)), {
    methods: myMethods,
    events: [],
  })

  app.service(myPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(externalResolver),
        schemaHooks.resolveResult(resultResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(queryValidator),
        schemaHooks.resolveQuery(queryResolver),
      ],
      create: [
        schemaHooks.validateData(dataValidator),
        schemaHooks.resolveData(dataResolver),
      ],
      patch: [
        schemaHooks.validateData(patchValidator),
        schemaHooks.resolveData(patchResolver),
      ],
    },
    after: { all: [] },
    error: { all: [] },
  })
}

// Module augmentation for type safety
declare module "../../declarations" {
  interface ServiceTypes {
    [myPath]: MyService
  }
}
```

## Service Class Pattern

```typescript
// [name].class.ts
import type { Params } from "@feathersjs/feathers"
import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex"
import { KnexService } from "@feathersjs/knex"
import type { Application } from "../../declarations"
import { MyEntity, MyData, MyPatch, MyQuery } from "./[name].schema"

export interface MyParams extends KnexAdapterParams<MyQuery> {}

export class MyService<ServiceParams extends Params = MyParams> extends KnexService<
  MyEntity,
  MyData,
  ServiceParams,
  MyPatch
> {
  // Override methods for custom behavior
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "TableName",  // Database table name
    multi: true,        // Enable multi-record operations
  }
}
```

## Hook Lifecycle

Hooks execute in this order:
1. `around.all` (wraps everything)
2. `before.all` → `before.[method]`
3. Service method executes
4. `after.[method]` → `after.all`
5. `around.all` completes

### Custom Hook Pattern

```typescript
// hooks/myHook.ts
import { HookContext } from "../declarations"

export const myHook = async (context: HookContext) => {
  console.log(`Running on ${context.path}.${context.method}`)

  // Modify context.data (before hooks)
  // Modify context.result (after hooks)

  return context
}
```

## Virtual Resolvers

Use virtual resolvers to compute fields from related data:

```typescript
export const myResolver = resolve<MyEntity, HookContext>({
  computedField: virtual(async (entity, context) => {
    const related = await context.app.service("related").find({
      query: { id: entity.relatedId },
      paginate: false,
    })
    return related[0].name
  }),
})
```

## External Resolvers

Hide internal fields from API responses:

```typescript
export const myExternalResolver = resolve<MyEntity, HookContext>({
  internalField: async () => undefined,
  sensitiveData: async () => undefined,
})
```

## Existing Services

| Service | Table | Path | Purpose |
|---------|-------|------|---------|
| users | User | `/users` | User accounts |
| profiles | Profile | `/profiles` | User profiles |
| properties | Property | `/properties` | Property listings |
| propertytypes | PropertyType | `/propertytypes` | Property categories |
| amenities | Amenity | `/amenities` | Amenity definitions |
| propertyamenities | PropertyAmenity | `/propertyamenities` | Property-amenity links |
| reviews | Review | `/reviews` | Property reviews |
| presignurl | - | `/presignurl` | S3 presigned URLs |

## Path Aliases

Use these imports in service files:
- `@services/*` → `src/services/*`
- `@utils/*` → `src/utils/*`
- `@database-generated-types/*` → `src/database-generated-types/*`
