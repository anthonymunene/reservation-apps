// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from "@feathersjs/schema"

import {
  propertyAmenitiesDataResolver,
  propertyAmenitiesDataValidator,
  propertyAmenitiesExternalResolver,
  propertyAmenitiesPatchResolver,
  propertyAmenitiesPatchValidator,
  propertyAmenitiesQueryResolver,
  propertyAmenitiesQueryValidator,
  propertyAmenitiesResolver,
} from "./propertyAmenities.schema"

import type { Application } from "../../declarations"
import { getOptions, PropertyAmenitiesService } from "./propertyAmenities.class"
import { propertyAmenitiesMethods, propertyAmenitiesPath } from "./propertyAmenities.shared"

export * from "./propertyAmenities.class"
export * from "./propertyAmenities.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const propertyAmenities = (app: Application) => {
  // Register our service on the Feathers application
  app.use(propertyAmenitiesPath, new PropertyAmenitiesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: propertyAmenitiesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(propertyAmenitiesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(propertyAmenitiesExternalResolver),
        schemaHooks.resolveResult(propertyAmenitiesResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(propertyAmenitiesQueryValidator),
        schemaHooks.resolveQuery(propertyAmenitiesQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(propertyAmenitiesDataValidator),
        schemaHooks.resolveData(propertyAmenitiesDataResolver),
      ],
      patch: [
        schemaHooks.validateData(propertyAmenitiesPatchValidator),
        schemaHooks.resolveData(propertyAmenitiesPatchResolver),
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
    [propertyAmenitiesPath]: PropertyAmenitiesService
  }
}
