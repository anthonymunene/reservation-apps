// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  propertyTypesDataValidator,
  propertyTypesPatchValidator,
  propertyTypesQueryValidator,
  propertyTypesResolver,
  propertyTypesExternalResolver,
  propertyTypesDataResolver,
  propertyTypesPatchResolver,
  propertyTypesQueryResolver,
} from './propertyTypes.schema';

import type { Application } from '../../declarations';
import { PropertyTypesService, getOptions } from './propertyTypes.class';
import { propertyTypesPath, propertyTypesMethods } from './propertyTypes.shared';

export * from './propertyTypes.class';
export * from './propertyTypes.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const propertyTypes = (app: Application) => {
  // Register our service on the Feathers application
  app.use(propertyTypesPath, new PropertyTypesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: propertyTypesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service(propertyTypesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(propertyTypesExternalResolver),
        schemaHooks.resolveResult(propertyTypesResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(propertyTypesQueryValidator),
        schemaHooks.resolveQuery(propertyTypesQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(propertyTypesDataValidator),
        schemaHooks.resolveData(propertyTypesDataResolver),
      ],
      patch: [
        schemaHooks.validateData(propertyTypesPatchValidator),
        schemaHooks.resolveData(propertyTypesPatchResolver),
      ],
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
    [propertyTypesPath]: PropertyTypesService;
  }
}
