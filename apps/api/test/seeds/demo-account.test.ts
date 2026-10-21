import assert from "assert"
import axios from "axios"
import type { Server } from "http"
import { app } from "../../src/app"
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD, getDemoAccount } from "@seeds/users/demo-account"
import type { DatabaseClient } from "@seeds/utils/types/shared"

const port = app.get("port")
const appUrl = `http://${app.get("host")}:${port}`

// Stands in for a database where the demo user doesn't exist yet
const emptyDatabase = (() => ({
  where: () => ({ first: async () => undefined }),
})) as unknown as DatabaseClient

describe("seed demo account", () => {
  let server: Server

  before(async () => {
    server = await app.listen(port)
  })

  after(done => {
    server.close(done)
  })

  it("was seeded, and can log in with the documented email and password", async () => {
    const response = await axios.post(
      `${appUrl}/authentication`,
      { strategy: "local", email: DEMO_USER_EMAIL, password: DEMO_USER_PASSWORD },
      { validateStatus: () => true }
    )

    assert.equal(response.status, 201)
    assert.ok(response.data.accessToken, "Returned an access token")
  })

  it("has a profile like the other seeded users", async () => {
    const db = app.get("postgresqlClient")
    const user = await db("User").where({ email: DEMO_USER_EMAIL }).first()
    const profile = await db("Profile").where({ userId: user.id }).first()

    assert.ok(profile?.firstName, "Has a profile with a name")
  })

  it("is offered when it doesn't exist yet", async () => {
    const account = await getDemoAccount(emptyDatabase, "development")

    assert.equal(account?.email, DEMO_USER_EMAIL)
    assert.equal(account?.password, DEMO_USER_PASSWORD)
  })

  it("isn't added again when it already exists, so reseeding doesn't fail", async () => {
    assert.equal(await getDemoAccount(app.get("postgresqlClient"), "test"), null)
  })

  it("is never added in production", async () => {
    assert.equal(await getDemoAccount(emptyDatabase, "production"), null)
  })
})
