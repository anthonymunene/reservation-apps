// For more information about this file see https://dove.feathersjs.com/guides/cli/authentication.html
import { AuthenticationService, JWTStrategy } from "@feathersjs/authentication"
import { LocalStrategy } from "@feathersjs/authentication-local"

import type { Application } from "./declarations"

declare module "./declarations" {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

// Registers POST /authentication (log in) and DELETE /authentication (log out).
// "local" checks an email and password against the users service; "jwt" checks the token that a
// successful login returns. Settings are under `authentication` in config/default.json, and the
// signing secret comes from the FEATHERS_SECRET environment variable.
export const authentication = (app: Application) => {
  const authentication = new AuthenticationService(app)

  authentication.register("jwt", new JWTStrategy())
  authentication.register("local", new LocalStrategy())

  app.use("authentication", authentication)
}
