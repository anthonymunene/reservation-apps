import type { Static } from "@feathersjs/typebox"
import { defaultAppConfiguration, getValidator, Type } from "@feathersjs/typebox"

import { dataValidator } from "./validators"

export const configurationSchema = Type.Intersect([
  defaultAppConfiguration,
  Type.Object({
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),
    storage: Type.Object({
      s3: Type.Object({
        s3Client: Type.Object({
          // Optional so the API (and its tests) can start without S3 credentials. The presign
          // service checks for them on each request instead.
          credentials: Type.Optional(
            Type.Object({
              accessKeyId: Type.Optional(Type.String()),
              secretAccessKey: Type.Optional(Type.String()),
            })
          ),
          region: Type.String(),
          signatureVersion: Type.String(),
          bucket: Type.String(),
          prefix: Type.Optional(Type.String()),
        }),
      }),
    }),
  }),
])

export type ApplicationConfiguration = Static<typeof configurationSchema>

export const configurationValidator = getValidator(configurationSchema, dataValidator)
