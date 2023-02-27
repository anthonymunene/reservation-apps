// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema';

import {
  profilesDataValidator,
  profilesPatchValidator,
  profilesQueryValidator,
  profilesResolver,
  profilesExternalResolver,
  profilesDataResolver,
  profilesPatchResolver,
  profilesQueryResolver,
} from './profiles.schema';

import type { Application } from '../../declarations';
import { ProfilesService, getOptions } from './profiles.class';

export * from './profiles.class';
export * from './profiles.schema';

// A configure function that registers the service and its hooks via `app.configure`
export const profiles = (app: Application) => {
  // Register our service on the Feathers application
  app.use('profiles', new ProfilesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ['find', 'get', 'create', 'patch', 'remove'],
    // You can add additional custom events to be sent to clients here
    events: [],
  });
  // Initialize hooks
  app.service('profiles').hooks({
    around: {
      all: [schemaHooks.resolveExternal(profilesExternalResolver), schemaHooks.resolveResult(profilesResolver)],
    },
    before: {
      all: [schemaHooks.validateQuery(profilesQueryValidator), schemaHooks.resolveQuery(profilesQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(profilesDataValidator), schemaHooks.resolveData(profilesDataResolver)],
      patch: [schemaHooks.validateData(profilesPatchValidator), schemaHooks.resolveData(profilesPatchResolver)],
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
    profiles: ProfilesService;
  }
}
