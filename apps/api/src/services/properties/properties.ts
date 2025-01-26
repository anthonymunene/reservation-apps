// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from "@feathersjs/schema"

import {
  propertiesDataResolver,
  propertiesDataValidator,
  propertiesExternalResolver,
  propertiesPatchResolver,
  propertiesPatchValidator,
  propertiesQueryResolver,
  propertiesQueryValidator,
  propertiesResolver,
} from "./properties.schema"

// import { withOwner, withPropertyTypes } from '../../hooks/properties';
import type { Application } from "../../declarations"
import { getOptions, PropertiesService } from "./properties.class"
import { insertAmenity } from "./properties.hooks"
import { sanitiseImageData } from "../../hooks/sanitiseImagedata"
import { propertiesMethods, propertiesPath } from "./properties.shared"

export * from "./properties.class"
export * from "./properties.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const properties = (app: Application) => {
  // Register our service on the Feathers application
  app.use(propertiesPath, new PropertiesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: propertiesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(propertiesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(propertiesExternalResolver),
        schemaHooks.resolveResult(propertiesResolver),
      ],
      create: [insertAmenity],
    },
    before: {
      all: [
        schemaHooks.validateQuery(propertiesQueryValidator),
        schemaHooks.resolveQuery(propertiesQueryResolver),
      ],
      create: [
        schemaHooks.validateData(propertiesDataValidator),
        schemaHooks.resolveData(propertiesDataResolver),
      ],
      patch: [
        schemaHooks.validateData(propertiesPatchValidator),
        schemaHooks.resolveData(propertiesPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      find: [sanitiseImageData],
      get: [],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    properties: PropertiesService
  }
}
