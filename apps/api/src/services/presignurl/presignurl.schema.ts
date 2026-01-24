// @ts-nocheck
// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from "@feathersjs/schema"
import { Type, getValidator } from "@feathersjs/typebox"
import type { Static } from "@feathersjs/typebox"

import type { HookContext } from "../../declarations"
import { dataValidator } from "../../validators"
import type { PresignurlService } from "./presignurl.class"

// Main data model schema
export const presignurlSchema = Type.Object(
  {
    id: Type.String({ minLength: 1, maxLength: 255 }),
    path: Type.String({ minLength: 1, maxLength: 500 }),
  },
  { $id: "Presignurl", additionalProperties: false }
)
export type Presignurl = Static<typeof presignurlSchema>
export const presignurlValidator = getValidator(presignurlSchema, dataValidator)
export const presignurlResolver = resolve<Presignurl, HookContext<PresignurlService>>({})

export const presignurlExternalResolver = resolve<Presignurl, HookContext<PresignurlService>>({})

// Schema for creating new entries
export const presignurlDataSchema = Type.Pick(presignurlSchema, ["id", "path"], {
  $id: "PresignurlData",
})
export type PresignurlData = Static<typeof presignurlDataSchema>
export const presignurlDataValidator = getValidator(presignurlDataSchema, dataValidator)
export const presignurlDataResolver = resolve<Presignurl, HookContext<PresignurlService>>({})
