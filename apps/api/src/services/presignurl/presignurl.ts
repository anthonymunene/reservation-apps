// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
// @ts-nocheck
import { hooks as schemaHooks } from "@feathersjs/schema"

import {
  presignurlExternalResolver,
  presignurlResolver,
  presignurlDataValidator,
  presignurlDataResolver,
} from "./presignurl.schema"

import type { Application } from "../../declarations"
import { getOptions, PresignurlService } from "./presignurl.class"
import { presignurlMethods, presignurlPath } from "./presignurl.shared"

export * from "./presignurl.class"
export * from "./presignurl.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const presignurl = (app: Application) => {
  const s3Options = getOptions(app).app.get("storage").s3
  // Register our service on the Feathers application
  app.use(presignurlPath, new PresignurlService(s3Options), {
    // A list of all methods this service exposes externally
    methods: presignurlMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(presignurlPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(presignurlExternalResolver),
        schemaHooks.resolveResult(presignurlResolver),
      ],
    },
    before: {
      // Validate incoming data for putObject (the only method)
      // This ensures id and path meet our constraints before S3 interaction
      putObject: [
        schemaHooks.validateData(presignurlDataValidator),
        schemaHooks.resolveData(presignurlDataResolver),
      ],
    },
    after: {
      all: [],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    [presignurlPath]: PresignurlService
  }
}
