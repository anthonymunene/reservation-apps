// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
//@ts-nocheck

import type { Application } from "../../declarations"
import { uploadsMethods, uploadsPath } from "./uploads.shared"

import { Service } from "../../utils/s3/lib" // A configure function that registers the service and its hooks via `app.configure`

// A configure function that registers the service and its hooks via `app.configure`
export const uploads = async (app: Application) => {
  const { accessKeyId, secretAccessKey, endpoint, region, bucket } = app.get("storage").s3Client
  const S3Options = {
    s3Client: {
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      endpoint,
      region,
      signatureVersion: "v4",
    },
    bucket,
  }
  // const UploadsService = S3.Service;
  // Register our service on the Feathers application
  app.use(uploadsPath, new Service(S3Options), {
    // A list of all methods this service exposes externally
    methods: uploadsMethods,
    // You can add additional custom events to be sent to clients here
    // events: [],
  })
}
