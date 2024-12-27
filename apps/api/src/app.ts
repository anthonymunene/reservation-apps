// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html
import { feathers } from "@feathersjs/feathers"
import configuration from "@feathersjs/configuration"
import {
  bodyParser,
  cors,
  errorHandler,
  koa,
  parseAuthentication,
  rest,
  serveStatic,
} from "@feathersjs/koa"
import socketio from "@feathersjs/socketio"

import { configurationValidator } from "./configuration"
import type { Application } from "./declarations"
import { logError } from "./hooks/log-error"
import { postgresql } from "./postgresql"
import { services } from "./services"
import { channels } from "./channels"

const app: Application = koa(feathers())

// Load our app configuration (see config/ folder)
app.configure(configuration(configurationValidator))

// Set up Koa middleware
app.use(cors())
app.use(serveStatic(app.get("public")))
app.use(serveStatic("lib/utils"))
app.use(errorHandler())
app.use(parseAuthentication())
app.use(bodyParser())

// Configure services and transports
app.configure(rest())
app.configure(
  socketio({
    cors: {
      origin: app.get("origins"),
    },
  })
)
app.configure(channels)
app.configure(postgresql)
app.configure(services)

// Register hooks that run on all service methods
app.hooks({
  around: {
    all: [logError],
  },
  before: {},
  after: {},
  error: {},
})
// Register application setup and teardown hooks here
app.hooks({
  setup: [],
  teardown: [],
})

export { app }
