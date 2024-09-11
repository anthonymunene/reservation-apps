// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getDataValidator, getValidator, querySyntax, Type } from "@feathersjs/typebox"
import { randomUUID } from "crypto"
import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { usersSchema } from "../users/users.schema"

const reviewUserSchema = Type.Pick(usersSchema, ["id"])
// Main data model schema
export const reviewsSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    comment: Type.String(),
    propertyTypeId: Type.String(),
    userId: reviewUserSchema,
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    updatedBy: Type.String({ format: "date-time" }),
  },
  { $id: "Reviews", additionalProperties: false }
)
export type Reviews = Static<typeof reviewsSchema>
export const reviewsResolver = resolve<Reviews, HookContext>({})

export const reviewsExternalResolver = resolve<Reviews, HookContext>({
  propertyTypeId: async () => undefined,
  userId: async () => undefined,
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
})

// Schema for creating new entries
export const reviewsDataSchema = Type.Pick(reviewsSchema, ["comment", "propertyTypeId", "userId"], {
  $id: "ReviewsData",
})
export type ReviewsData = Static<typeof reviewsDataSchema>
export const reviewsDataValidator = getDataValidator(reviewsDataSchema, dataValidator)
export const reviewsDataResolver = resolve<Reviews, HookContext>({
  id: async () => {
    return randomUUID()
  },
  createdAt: async () => {
    return new Date().toISOString()
  },
})

// Schema for updating existing entries
export const reviewsPatchSchema = Type.Partial(reviewsSchema, {
  $id: "ReviewsPatch",
})
export type ReviewsPatch = Static<typeof reviewsPatchSchema>
export const reviewsPatchValidator = getDataValidator(reviewsPatchSchema, dataValidator)
export const reviewsPatchResolver = resolve<Reviews, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString()
  },
  updatedBy: async (_value, _document, context: HookContext) => context.params.user.id,
})

// Schema for allowed query properties
export const reviewsQueryProperties = Type.Pick(reviewsSchema, ["id"])
export const reviewsQuerySchema = Type.Intersect(
  [
    querySyntax(reviewsQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
)
export type ReviewsQuery = Static<typeof reviewsQuerySchema>
export const reviewsQueryValidator = getValidator(reviewsQuerySchema, queryValidator)
export const reviewsQueryResolver = resolve<ReviewsQuery, HookContext>({})
