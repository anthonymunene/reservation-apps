// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from "@feathersjs/schema"

import {
  amenitiesDataResolver,
  amenitiesDataValidator,
  amenitiesExternalResolver,
  amenitiesPatchResolver,
  amenitiesPatchValidator,
  amenitiesQueryResolver,
  amenitiesQueryValidator,
  amenitiesResolver,
} from "./amenities.schema"

import type { Application } from "../../declarations"
import { AmenitiesService, getOptions } from "./amenities.class"
import { amenitiesMethods, amenitiesPath } from "./amenities.shared"

export * from "./amenities.class"
export * from "./amenities.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const amenities = (app: Application) => {
  // Register our service on the Feathers application
  app.use(amenitiesPath, new AmenitiesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: amenitiesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(amenitiesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(amenitiesExternalResolver),
        schemaHooks.resolveResult(amenitiesResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(amenitiesQueryValidator),
        schemaHooks.resolveQuery(amenitiesQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(amenitiesDataValidator),
        schemaHooks.resolveData(amenitiesDataResolver),
      ],
      patch: [
        schemaHooks.validateData(amenitiesPatchValidator),
        schemaHooks.resolveData(amenitiesPatchResolver),
      ],
      remove: [],
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
    [amenitiesPath]: AmenitiesService
  }
}
