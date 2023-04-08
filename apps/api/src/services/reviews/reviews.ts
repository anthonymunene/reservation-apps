// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  reviewsDataValidator,
  reviewsPatchValidator,
  reviewsQueryValidator,
  reviewsResolver,
  reviewsExternalResolver,
  reviewsDataResolver,
  reviewsPatchResolver,
  reviewsQueryResolver,
} from './reviews.schema';

import type { Application } from '../../declarations';
import { ReviewsService, getOptions } from './reviews.class';

export * from './reviews.class';
export * from './reviews.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const reviews = (app: Application) => {
  // Register our service on the Feathers application
  app.use('reviews', new ReviewsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'patch', 'remove'],
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service('reviews').hooks({
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
  });
};

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    reviews: ReviewsService;
  }
}
