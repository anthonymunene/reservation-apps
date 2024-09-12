// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from "@feathersjs/schema"

import {
  reviewsDataResolver,
  reviewsDataValidator,
  reviewsExternalResolver,
  reviewsPatchResolver,
  reviewsPatchValidator,
  reviewsQueryResolver,
  reviewsQueryValidator,
  reviewsResolver,
} from "./reviews.schema"

import type { Application } from "../../declarations"
import { getOptions, ReviewsService } from "./reviews.class"
import { reviewsPath, reviewsMethods } from "./reviews.shared"

export * from "./reviews.class"
export * from "./reviews.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const reviews = (app: Application) => {
  // Register our service on the Feathers application
  app.use(reviewsPath, new ReviewsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: reviewsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(reviewsPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(reviewsExternalResolver), schemaHooks.resolveResult(reviewsResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(reviewsQueryValidator), schemaHooks.resolveQuery(reviewsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(reviewsDataValidator), schemaHooks.resolveData(reviewsDataResolver)],
      patch: [schemaHooks.validateData(reviewsPatchValidator), schemaHooks.resolveData(reviewsPatchResolver)],
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
    reviews: ReviewsService
  }
}
