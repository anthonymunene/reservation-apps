// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getValidator, querySyntax, Type } from "@feathersjs/typebox"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { randomUUID } from "crypto" // Main data model schema

// Main data model schema
export const propertyAmenitiesSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    propertyId: Type.String({ format: "uuid" }),
    amenityId: Type.String({ format: "uuid" }),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    updatedBy: Type.String({ format: "date-time" }),
  },
  { $id: "PropertyAmenities", additionalProperties: false }
)
export type PropertyAmenities = Static<typeof propertyAmenitiesSchema>
export const propertyAmenitiesValidator = getValidator(propertyAmenitiesSchema, dataValidator)
export const propertyAmenitiesResolver = resolve<PropertyAmenities, HookContext>({})

export const propertyAmenitiesExternalResolver = resolve<PropertyAmenities, HookContext>({
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
})

// Schema for creating new entries
export const propertyAmenitiesDataSchema = Type.Pick(propertyAmenitiesSchema, ["propertyId", "amenityId"], {
  $id: "PropertyAmenitiesData",
})
export type PropertyAmenitiesData = Static<typeof propertyAmenitiesDataSchema>
export const propertyAmenitiesDataValidator = getValidator(propertyAmenitiesDataSchema, dataValidator)
export const propertyAmenitiesDataResolver = resolve<PropertyAmenities, HookContext>({
  id: async () => {
    return randomUUID()
  },
  createdAt: async () => {
    return new Date().toISOString()
  },
})

// Schema for updating existing entries
export const propertyAmenitiesPatchSchema = Type.Partial(propertyAmenitiesSchema, {
  $id: "PropertyAmenitiesPatch",
})
export type PropertyAmenitiesPatch = Static<typeof propertyAmenitiesPatchSchema>
export const propertyAmenitiesPatchValidator = getValidator(propertyAmenitiesPatchSchema, dataValidator)
export const propertyAmenitiesPatchResolver = resolve<PropertyAmenities, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString()
  },
  updatedBy: async (_value, _document, context: HookContext) => context.params.user.id,
})

// Schema for allowed query properties
export const propertyAmenitiesQueryProperties = Type.Pick(propertyAmenitiesSchema, ["propertyId", "amenityId"])
export const propertyAmenitiesQuerySchema = Type.Intersect(
  [
    querySyntax(propertyAmenitiesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
)
export type PropertyAmenitiesQuery = Static<typeof propertyAmenitiesQuerySchema>
export const propertyAmenitiesQueryValidator = getValidator(propertyAmenitiesQuerySchema, queryValidator)
export const propertyAmenitiesQueryResolver = resolve<PropertyAmenitiesQuery, HookContext>({})
