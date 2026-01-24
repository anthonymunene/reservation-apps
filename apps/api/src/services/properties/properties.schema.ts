// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getDataValidator, getValidator, querySyntax, Type } from "@feathersjs/typebox"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { randomUUID } from "crypto"

// Main data model schema
export const propertiesSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    title: Type.String({ minLength: 1, maxLength: 200 }),
    description: Type.String({ maxLength: 5000 }),
    city: Type.String({ minLength: 1, maxLength: 100 }),
    // ISO 3166-1 alpha-2: exactly 2 uppercase letters (US, GB, KE)
    countryCode: Type.String({ minLength: 2, maxLength: 2, pattern: "^[A-Z]{2}$" }),
    bedrooms: Type.Number({ minimum: 0, maximum: 50 }),
    beds: Type.Number({ minimum: 0, maximum: 100 }),
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
    host: Type.String({ format: "uuid" }),
    propertyTypeId: Type.String(),
    propertyType: Type.String(),
    ownedBy: Type.String(),
    amenities: Type.Array(Type.String()),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    updatedBy: Type.String({ format: "date-time" }),
  },
  { $id: "Properties", additionalProperties: true }
)
export type Properties = Static<typeof propertiesSchema>
// Note: Virtual resolvers removed to fix N+1 query problem.
// Relations (ownedBy, propertyType, amenities) are now populated by the
// batchLoadPropertyRelations hook in properties.ts for better performance.
// See: src/hooks/batch-load-property-relations.ts
export const propertiesResolver = resolve<Properties, HookContext>({})

export const propertiesExternalResolver = resolve<Properties, HookContext>({
  host: async () => undefined,
  propertyTypeId: async () => undefined,
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
})

// Schema for creating new entries
export const propertiesDataSchema = Type.Pick(
  propertiesSchema,
  ["title", "description", "city", "countryCode", "propertyTypeId", "host"],
  {
    $id: "PropertiesData",
  }
)

export type PropertiesData = Static<typeof propertiesDataSchema>
export const propertiesDataValidator = getDataValidator(propertiesDataSchema, dataValidator)
export const propertiesDataResolver = resolve<Properties, HookContext>({
  id: async () => {
    return randomUUID()
  },
  createdAt: async () => {
    return new Date().toISOString()
  },
})
// Schema for updating existing entries
export const propertiesPatchSchema = Type.Partial(propertiesSchema, {
  $id: "PropertiesPatch",
})
export type PropertiesPatch = Static<typeof propertiesPatchSchema>
export const propertiesPatchValidator = getDataValidator(propertiesPatchSchema, dataValidator)
export const propertiesPatchResolver = resolve<Properties, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString()
  },

  updatedBy: async (_value, _document, context: HookContext) => context.params.user.id,
})

// Schema for allowed query properties
export const propertiesQueryProperties = Type.Pick(propertiesSchema, ["id"])
export const propertiesQuerySchema = Type.Intersect([querySyntax(propertiesQueryProperties)], {
  additionalProperties: false,
})
export type PropertiesQuery = Static<typeof propertiesQuerySchema>
export const propertiesQueryValidator = getValidator(propertiesQuerySchema, queryValidator)
export const propertiesQueryResolver = resolve<PropertiesQuery, HookContext>({})

// Resolver for the data that is being returned
export const propertiesResultResolver = resolve<Properties, HookContext>({})
