// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getDataValidator, getValidator, querySyntax, Type } from "@feathersjs/typebox"

import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { randomUUID } from "crypto" // Main data model schema

// Main data model schema
export const profilesSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    bio: Type.String({ maxLength: 1000 }),
    firstName: Type.String({ minLength: 1, maxLength: 100 }),
    surname: Type.String({ minLength: 1, maxLength: 100 }),
    isSuperHost: Type.Boolean({ default: false }),
    images: Type.Array(
      Type.Object({
        id: Type.String(),
        url: Type.String(),
        metadata: Type.Object({
          status: Type.Union([
            Type.Literal("pending"),
            Type.Literal("active"),
            Type.Literal("deleted"),
          ]),
          uploadedAt: Type.String(),
          displayOrder: Type.Number(),
          isPrimaryImage: Type.Boolean(),
        }),
        updatedAt: Type.String(),
        version: Type.Number(),
      })
    ),
    userId: Type.String({ format: "uuid" }),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    updatedBy: Type.Union([Type.String({ format: "uuid" }), Type.Null()]),
  },
  { $id: "Profiles", additionalProperties: false }
)
export type Profiles = Static<typeof profilesSchema>
export const profilesResolver = resolve<Profiles, HookContext>({})

export const profilesExternalResolver = resolve<Profiles, HookContext>({
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
  id: async () => undefined,
  userId: async () => undefined,
})

// Schema for creating new entries
export const profilesDataSchema = Type.Pick(profilesSchema, ["bio", "userId"], {
  $id: "ProfilesData",
})
export type ProfilesData = Static<typeof profilesDataSchema>
export const profilesDataValidator = getDataValidator(profilesDataSchema, dataValidator)
export const profilesDataResolver = resolve<Profiles, HookContext>({
  id: async () => {
    return randomUUID()
  },
  createdAt: async () => {
    return new Date().toISOString()
  },
})

// Schema for updating existing entries
export const profilesPatchSchema = Type.Partial(profilesSchema, {
  $id: "ProfilesPatch",
})
export type ProfilesPatch = Static<typeof profilesPatchSchema>
export const profilesPatchValidator = getDataValidator(profilesPatchSchema, dataValidator)
export const profilesPatchResolver = resolve<Profiles, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString()
  },
  // Who made the change. Internal calls (seeds, other services) have no user and leave it unset.
  updatedBy: async (_value, _document, context: HookContext) => context.params.user?.id,
  // images is a jsonb column. node-postgres sends a JavaScript array as a Postgres array, which
  // jsonb rejects, so send it as a JSON string instead.
  images: async value =>
    value === undefined ? undefined : (JSON.stringify(value) as unknown as Profiles["images"]),
})

// Schema for allowed query properties
export const profilesQueryProperties = Type.Pick(profilesSchema, ["id", "userId"])
export const profilesQuerySchema = Type.Intersect(
  [
    querySyntax(profilesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
)
export type ProfilesQuery = Static<typeof profilesQuerySchema>
export const profilesQueryValidator = getValidator(profilesQuerySchema, queryValidator)
export const profilesQueryResolver = resolve<ProfilesQuery, HookContext>({})
