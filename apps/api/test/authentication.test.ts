import assert from "assert"
import axios from "axios"
import type { Server } from "http"
import rest from "@feathersjs/rest-client"
import { faker } from "@faker-js/faker"
import { app } from "../src/app"
import { createClient } from "../src/client"

const port = app.get("port")
const appUrl = `http://${app.get("host")}:${port}`

// Logs in over real HTTP with the API's own client, the same way the frontend does
const newClient = () => createClient(rest(appUrl).axios(axios))

describe("authentication", () => {
  const email = faker.internet.email().toLowerCase()
  const password = "correct-horse-battery"
  let userId: string
  let server: Server

  before(async () => {
    server = await app.listen(port)
    const user = await app.service("users").create({ email, password })
    userId = user.id
  })

  after(done => {
    server.close(done)
  })

  it("registered the authentication service", () => {
    assert.ok(app.service("authentication"), "Registered the service")
  })

  it("stores a hash of the password, not the password itself", async () => {
    const stored = await app.get("postgresqlClient")("User").where({ id: userId }).first()

    assert.notEqual(stored.password, password)
    assert.match(stored.password, /^\$2[aby]\$/, "Stored as a bcrypt hash")
  })

  it("logs in with the right email and password and returns a JWT", async () => {
    const result = await newClient().authenticate({ strategy: "local", email, password })

    assert.ok(result.accessToken, "Returned an access token")
    assert.equal(result.user.id, userId)
    assert.equal(result.user.password, undefined, "The password is not sent back")
  })

  it("rejects a wrong password with 401", async () => {
    // Checked with plain HTTP: the API's error middleware sends its own error format, which the
    // Feathers client can't turn back into a typed NotAuthenticated error
    const response = await axios.post(
      `${appUrl}/authentication`,
      { strategy: "local", email, password: "wrong-password" },
      { validateStatus: () => true }
    )

    assert.equal(response.status, 401)
    assert.equal(response.data.error.code, "NOT_AUTHENTICATED")
    assert.equal(response.data.error.message, "Invalid login")
  })

  it("gives the Feathers client a typed NotAuthenticated error for a wrong password", async () => {
    await assert.rejects(
      newClient().authenticate({ strategy: "local", email, password: "wrong-password" }),
      { name: "NotAuthenticated", code: 401, message: "Invalid login" }
    )
  })

  it("accepts the returned JWT on later requests", async () => {
    const { accessToken } = await newClient().authenticate({ strategy: "local", email, password })

    const result = await newClient().authenticate({ strategy: "jwt", accessToken })

    assert.equal(result.user.id, userId)
  })

  it("logs out", async () => {
    const client = newClient()
    await client.authenticate({ strategy: "local", email, password })

    const result = await client.logout()

    assert.ok(result?.accessToken, "Logout returns the token that was removed")
  })
})
