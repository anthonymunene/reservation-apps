// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from "@feathersjs/schema"
import { authenticate } from "@feathersjs/authentication"

import {
  profilesDataResolver,
  profilesDataValidator,
  profilesExternalResolver,
  profilesPatchResolver,
  profilesPatchValidator,
  profilesQueryResolver,
  profilesQueryValidator,
  profilesResolver,
} from "./profiles.schema"

import type { Application } from "../../declarations"
import { getOptions, ProfilesService } from "./profiles.class"
import { profilesMethods, profilesPath } from "./profiles.shared"
import { sanitiseImageData } from "../../hooks/sanitiseImagedata"
import { patchProfileByUserId } from "../../hooks/patch-profile-by-user-id"
import { ownProfileRecord, restrictToOwner } from "../../hooks/restrict-to-owner"

export * from "./profiles.class"
export * from "./profiles.schema"

// A configure function that registers the service and its hooks via `app.configure`
export const profiles = (app: Application) => {
  // Register our service on the Feathers application
  app.use(profilesPath, new ProfilesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: profilesMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
  })
  // Initialize hooks
  app.service(profilesPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(profilesExternalResolver),
        schemaHooks.resolveResult(profilesResolver),
      ],
      // Changing data needs a logged-in user; reading stays public
      create: [authenticate("jwt")],
      patch: [authenticate("jwt")],
      remove: [authenticate("jwt")],
    },
    before: {
      all: [
        schemaHooks.validateQuery(profilesQueryValidator),
        schemaHooks.resolveQuery(profilesQueryResolver),
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(profilesDataValidator),
        schemaHooks.resolveData(profilesDataResolver),
      ],
      // A user can only change or delete their own profile. patchProfileByUserId runs first so a
      // PATCH /profiles?userId=... request is checked against the profile it actually targets.
      patch: [
        patchProfileByUserId,
        restrictToOwner(ownProfileRecord),
        schemaHooks.validateData(profilesPatchValidator),
        schemaHooks.resolveData(profilesPatchResolver),
      ],
      remove: [restrictToOwner(ownProfileRecord)],
    },
    after: {
      all: [],
      find: [sanitiseImageData],
    },
    error: {
      all: [],
    },
  })
}

// Add this service to the service type index
declare module "../../declarations" {
  interface ServiceTypes {
    profiles: ProfilesService
  }
}
