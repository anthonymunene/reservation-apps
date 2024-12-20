import type { Static } from "@feathersjs/typebox"
import { defaultAppConfiguration, getValidator, Type } from "@feathersjs/typebox"

import { dataValidator } from "./validators"

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),
    // storage: Type.Object({
    //   s3: Type.Object({
    //     s3Client: Type.Object({
    //       credentials: Type.Object({
    //         accessKeyId: Type.String(),
    //         secretAccessKey: Type.String(),
    //       }),
    //       region: Type.String(),
    //       signatureVersion: Type.String(),
    //       bucket: Type.String(),
    //       prefix: Type.String(),
    //     }),
    //   }),
    // }),
  }),
])

export type ApplicationConfiguration = Static<typeof configurationSchema>

export const configurationValidator = getValidator(configurationSchema, dataValidator)
