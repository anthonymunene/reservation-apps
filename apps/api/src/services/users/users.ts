// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from "@feathersjs/schema"

import {
  usersDataResolver,
  usersDataValidator,
  usersExternalResolver,
  usersPatchResolver,
  usersPatchValidator,
  usersQueryResolver,
  usersQueryValidator,
  usersResolver,
} from "./users.schema"

import type { Application } from "../../declarations"
import { getOptions, UsersService } from "./users.class"
import { createProfile } from "./user.hooks"
import { usersPath, usersMethods } from "./users.shared"

export * from "./users.class"
export * from "./users.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const users = (app: Application) => {
  // Register our service on the Feathers application
  app.use(usersPath, new UsersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: usersMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(usersPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(usersExternalResolver),
        schemaHooks.resolveResult(usersResolver),
      ],
    },
    before: {
      all: [
        schemaHooks.validateQuery(usersQueryValidator),
        schemaHooks.resolveQuery(usersQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(usersDataValidator),
        schemaHooks.resolveData(usersDataResolver),
      ],
      patch: [
        schemaHooks.validateData(usersPatchValidator),
        schemaHooks.resolveData(usersPatchResolver),
      ],
      remove: [],
    },
    after: {
      all: [],
      create: [createProfile],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    users: UsersService
  }
}
