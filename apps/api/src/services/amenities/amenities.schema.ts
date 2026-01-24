// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getValidator, querySyntax, Type } from "@feathersjs/typebox"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { randomUUID } from "crypto"

// Main data model schema
export const amenitiesSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    name: Type.String({ minLength: 1, maxLength: 100 }),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    updatedBy: Type.String({ format: "date-time" }),
  },
  { $id: "Amenities", additionalProperties: false }
)
export type Amenities = Static<typeof amenitiesSchema>
export const amenitiesValidator = getValidator(amenitiesSchema, dataValidator)
export const amenitiesResolver = resolve<Amenities, HookContext>({})

export const amenitiesExternalResolver = resolve<Amenities, HookContext>({
  id: async () => undefined,
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
})

// Schema for creating new entries
export const amenitiesDataSchema = Type.Pick(amenitiesSchema, ["name"], {
  $id: "AmenitiesData",
})
export type AmenitiesData = Static<typeof amenitiesDataSchema>
export const amenitiesDataValidator = getValidator(amenitiesDataSchema, dataValidator)
export const amenitiesDataResolver = resolve<Amenities, HookContext>({
  id: async () => {
    return randomUUID()
  },
  createdAt: async () => {
    return new Date().toISOString()
  },
})

// Schema for updating existing entries
export const amenitiesPatchSchema = Type.Partial(amenitiesSchema, {
  $id: "AmenitiesPatch",
})
export type AmenitiesPatch = Static<typeof amenitiesPatchSchema>
export const amenitiesPatchValidator = getValidator(amenitiesPatchSchema, dataValidator)
export const amenitiesPatchResolver = resolve<Amenities, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString()
  },
  updatedBy: async (_value, _document, context: HookContext) => context.params.user.id,
})

// Schema for allowed query properties
export const amenitiesQueryProperties = Type.Pick(amenitiesSchema, ["id"])
export const amenitiesQuerySchema = Type.Intersect(
  [
    querySyntax(amenitiesQueryProperties),
    Type.Object(
      {
        id: Type.Object(
          {
            $in: Type.Array(Type.String()),
          },
          { additionalProperties: false }
        ),
      },
      { additionalProperties: false }
    ),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { $id: "amenitiesQuery", additionalProperties: false }
)
export type AmenitiesQuery = Static<typeof amenitiesQuerySchema>
export const amenitiesQueryValidator = getValidator(amenitiesQuerySchema, queryValidator)
export const amenitiesQueryResolver = resolve<AmenitiesQuery, HookContext>({})
