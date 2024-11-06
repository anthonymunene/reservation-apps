// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getDataValidator, getValidator, querySyntax, Type } from "@feathersjs/typebox"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { randomUUID } from "crypto"

// Main data model schema
export const propertiesSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    title: Type.String(),
    description: Type.String(),
    city: Type.String(),
    countryCode: Type.String(),
    bedrooms: Type.Number(),
    beds: Type.Number(),
    images: Type.Array(Type.Object({ image: Type.String() })),
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
export const propertiesResolver = resolve<Properties, HookContext>({
  ownedBy: virtual(async (property, context) => {
    const { data } = await context.app.service("profiles").find({
      query: {
        userId: property.host,
      },
    })

    const profile = data.map(result => `${result.firstName} ${result.surname}`)
    return profile.toString()
  }),

  propertyType: virtual(async (property, context) => {
    const propertyType = await context.app
      .service("propertytypes")
      .find({
        paginate: false,
        query: {
          id: property.propertyTypeId,
        },
      })
      .then(data => data[0].name)

    return propertyType
  }),
  amenities: virtual(async (property, context) => {
    const propertyAmenities = await context.app.service("propertyamenities").find({
      paginate: false,
      query: {
        propertyId: property.id,
        $select: ["amenityId"],
      },
    })

    const propertyAmenityIds = propertyAmenities.map(propertyAmenity => propertyAmenity.amenityId)
    const amenities = await context.app.service("amenities").find({ query: { id: { $in: propertyAmenityIds } } })

    return amenities.data.map(amenity => amenity.name)
  }),
})

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
