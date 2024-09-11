// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from "@feathersjs/schema"
import type { Static } from "@feathersjs/typebox"
import { getDataValidator, getValidator, querySyntax, Type } from "@feathersjs/typebox"
import type { HookContext } from "../../declarations"
import { dataValidator, queryValidator } from "../../validators"
import { profilesSchema } from "../profiles/profiles.schema"
import { randomUUID } from "crypto"

// Main data model schema
export const usersSchema = Type.Object(
  {
    id: Type.String({ format: "uuid" }),
    email: Type.String({ format: "email" }),
    password: Type.String(),
    lastLogin: Type.String({ format: "date-time" }),
    profileId: Type.String({ format: "uuid" }),
    createdAt: Type.String({ format: "date-time" }),
    updatedAt: Type.String({ format: "date-time" }),
    updatedBy: Type.String({ format: "date-time" }),
    profile: profilesSchema,
  },
  { $id: "User", additionalProperties: false }
)
export type Users = Static<typeof usersSchema>
export const usersResolver = resolve<Users, HookContext>({
  profile: virtual(async (user, context) => {
    const data = await context.app.service("profiles").find({
      paginate: false,
      query: {
        userId: user.id,
      },
    })
    const [profile] = data.map(profile => profile)
    return profile
  }),
})

export const usersExternalResolver = resolve<Users, HookContext>({
  profileId: async () => undefined,
  password: async () => undefined,
  lastLogin: async () => undefined,
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
})

// Schema for creating new entries
export const usersDataSchema = Type.Pick(usersSchema, ["email", "password"], {
  $id: "UsersData",
})
export type UsersData = Static<typeof usersDataSchema>
export const usersDataValidator = getDataValidator(usersDataSchema, dataValidator)
export const usersDataResolver = resolve<Users, HookContext>({
  id: async () => {
    return randomUUID()
  },
  createdAt: async () => {
    return new Date().toISOString()
  },
})

// Schema for updating existing entries
export const usersPatchSchema = Type.Partial(usersSchema, {
  $id: "UsersPatch",
})
export type UsersPatch = Static<typeof usersPatchSchema>
export const usersPatchValidator = getDataValidator(usersPatchSchema, dataValidator)
export const usersPatchResolver = resolve<Users, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString()
  },
  updatedBy: async (_value, _document, context: HookContext) => context.params.user.id,
})

// Schema for allowed query properties
export const usersQueryProperties = Type.Pick(usersSchema, ["id", "email"])
export const usersQuerySchema = Type.Intersect(
  [
    querySyntax(usersQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
)
export type UsersQuery = Static<typeof usersQuerySchema>
export const usersQueryValidator = getValidator(usersQuerySchema, queryValidator)
export const usersQueryResolver = resolve<UsersQuery, HookContext>({})
