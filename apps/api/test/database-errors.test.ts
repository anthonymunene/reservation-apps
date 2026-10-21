import assert from "assert"
import axios from "axios"
import type { Server } from "http"
import { faker } from "@faker-js/faker"
import { app } from "../src/app"
import { logger } from "../src/logger"

const port = app.get("port")
const appUrl = `http://${app.get("host")}:${port}`
const http = axios.create({ baseURL: appUrl, validateStatus: () => true })

// Signs that a response body contains raw database details
const DATABASE_DETAILS =
  /insert into|select |update "|delete from|constraint|"User"|"Property"|\$1/i

describe("database errors", () => {
  let server: Server

  before(async () => {
    server = await app.listen(port)
  })

  after(done => {
    server.close(done)
  })

  it("signing up with an email that's already registered gives 409 with a clear message", async () => {
    const email = faker.internet.email().toLowerCase()
    const user = { email, password: "correct-horse-battery" }
    assert.equal((await http.post("/users", user)).status, 201)

    const response = await http.post("/users", user)

    assert.equal(response.status, 409)
    assert.equal(response.data.name, "Conflict")
    assert.equal(response.data.error.code, "CONFLICT")
    assert.equal(response.data.message, "An account with this email already exists")
    assert.doesNotMatch(JSON.stringify(response.data), DATABASE_DETAILS)
  })

  it("never sends SQL to the client, but logs the full error on the server", async () => {
    const logged: string[] = []
    const originalError = logger.error.bind(logger)
    logger.error = ((message: string, ...rest: unknown[]) => {
      logged.push(String(message))
      return originalError(message, ...rest)
    }) as typeof logger.error

    try {
      // Not a valid uuid, so Postgres rejects the query itself
      const response = await http.get("/properties/not-a-uuid")

      assert.ok(response.status >= 400, "The request still fails")
      assert.equal(response.data.message, "The request could not be completed.")
      assert.doesNotMatch(JSON.stringify(response.data), DATABASE_DETAILS)
      assert.ok(
        logged.some(line => /select/i.test(line) && /uuid/i.test(line)),
        "The server log has the full database error, with the query"
      )
    } finally {
      logger.error = originalError
    }
  })

  it("leaves validation errors as they are", async () => {
    const response = await http.post("/users", {
      email: faker.internet.email(),
      password: "short",
    })

    assert.equal(response.status, 400)
    assert.equal(response.data.message, "validation failed")
    assert.ok(response.data.error.details.length > 0, "Field details are still included")
  })

  it("keeps full database messages for internal calls", async () => {
    await assert.rejects(app.service("properties").get("not-a-uuid"), (error: Error) => {
      assert.match(error.message, /uuid/i)
      return true
    })
  })
})
