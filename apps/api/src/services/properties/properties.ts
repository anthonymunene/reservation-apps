// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  propertiesDataValidator,
  propertiesPatchValidator,
  propertiesQueryValidator,
  propertiesResolver,
  propertiesExternalResolver,
  propertiesDataResolver,
  propertiesPatchResolver,
  propertiesQueryResolver,
} from './properties.schema';

// import { withOwner, withPropertyTypes } from '../../hooks/properties';

import type { Application } from '../../declarations';
import { PropertiesService, getOptions } from './properties.class';
import { insertAmenity } from './properties.hooks';

export * from './properties.class';
export * from './properties.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const properties = (app: Application) => {
  // Register our service on the Feathers application
  app.use('properties', new PropertiesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'patch', 'remove'],
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service('properties').hooks({
    around: {
      all: [schemaHooks.resolveExternal(propertiesExternalResolver), schemaHooks.resolveResult(propertiesResolver)],
      create: [insertAmenity],
    },
    before: {
      all: [schemaHooks.validateQuery(propertiesQueryValidator), schemaHooks.resolveQuery(propertiesQueryResolver)],
      create: [schemaHooks.validateData(propertiesDataValidator), schemaHooks.resolveData(propertiesDataResolver)],
      patch: [schemaHooks.validateData(propertiesPatchValidator), schemaHooks.resolveData(propertiesPatchResolver)],
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
    properties: PropertiesService;
  }
}
