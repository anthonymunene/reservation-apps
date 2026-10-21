import assert from "assert"
import axios from "axios"
import type { Server } from "http"
import rest from "@feathersjs/rest-client"
import { faker } from "@faker-js/faker"
import { app } from "../src/app"
import { createClient } from "../src/client"

const port = app.get("port")
const appUrl = `http://${app.get("host")}:${port}`
const PASSWORD = "correct-horse-battery"

// Plain HTTP, so tests can check status codes for any response
const http = axios.create({ baseURL: appUrl, validateStatus: () => true })

// Creates a user and returns their id and a valid token, logging in over HTTP like the frontend
const createLoggedInUser = async () => {
  const email = faker.internet.email().toLowerCase()
  const user = await app.service("users").create({ email, password: PASSWORD })
  const client = createClient(rest(appUrl).axios(axios))
  const { accessToken } = await client.authenticate({
    strategy: "local",
    email,
    password: PASSWORD,
  })
  return { id: user.id as string, headers: { Authorization: `Bearer ${accessToken}` } }
}

const imageEntry = (url: string) => ({
  id: faker.string.uuid(),
  url,
  metadata: {
    status: "active",
    uploadedAt: new Date().toISOString(),
    displayOrder: 0,
    isPrimaryImage: true,
  },
  updatedAt: new Date().toISOString(),
  version: 1,
})

describe("access control", () => {
  let server: Server
  let alice: Awaited<ReturnType<typeof createLoggedInUser>>
  let bob: Awaited<ReturnType<typeof createLoggedInUser>>

  before(async () => {
    server = await app.listen(port)
    alice = await createLoggedInUser()
    bob = await createLoggedInUser()
  })

  after(done => {
    server.close(done)
  })

  describe("without logging in", () => {
    it("can still read public listings", async () => {
      assert.equal((await http.get("/properties")).status, 200)
      assert.equal((await http.get("/users")).status, 200)
    })

    it("can still sign up", async () => {
      const response = await http.post("/users", {
        email: faker.internet.email().toLowerCase(),
        password: PASSWORD,
      })
      assert.equal(response.status, 201)
    })

    it("can't change data", async () => {
      // Properties, because their ids are visible to clients (amenities hide theirs)
      const [property] = (await http.get("/properties")).data.data
      assert.ok(property.id, "Found a real property to target")
      assert.equal((await http.post("/amenities", { name: "sauna" })).status, 401)
      assert.equal((await http.patch(`/properties/${property.id}`, { title: "x" })).status, 401)
      assert.equal((await http.delete(`/properties/${property.id}`)).status, 401)
      assert.ok(
        await app.get("postgresqlClient")("Property").where({ id: property.id }).first(),
        "The property still exists"
      )
    })

    it("can't change a profile or an account", async () => {
      const patch = { images: [imageEntry("anonymous.png")] }
      assert.equal((await http.patch(`/profiles?userId=${alice.id}`, patch)).status, 401)
      assert.equal(
        (await http.patch(`/users/${alice.id}`, { email: "x@example.test" })).status,
        401
      )
    })

    it("can't get a signed upload URL", async () => {
      const response = await http.post(
        "/presignurl",
        { id: "x.png", path: "users" },
        { headers: { "X-Service-Method": "putObject" } }
      )
      assert.equal(response.status, 401)
    })
  })

  describe("logged in", () => {
    it("can change data, and the change records who made it", async () => {
      const [property] = (await http.get("/properties")).data.data

      const response = await http.patch(
        `/properties/${property.id}`,
        { title: property.title },
        { headers: alice.headers }
      )

      assert.equal(response.status, 200)
      const stored = await app
        .get("postgresqlClient")("Property")
        .where({ id: property.id })
        .first()
      assert.equal(stored.updatedBy, alice.id)
    })

    it("can change their own profile, recording who changed it", async () => {
      const response = await http.patch(
        `/profiles?userId=${alice.id}`,
        { images: [imageEntry("alice.png")] },
        { headers: alice.headers }
      )

      assert.equal(response.status, 200)
      const stored = await app
        .get("postgresqlClient")("Profile")
        .where({ userId: alice.id })
        .first()
      assert.equal(stored.images[0].url, "alice.png")
      assert.equal(stored.updatedBy, alice.id)
    })

    it("can't change someone else's profile", async () => {
      const before = await app.get("postgresqlClient")("Profile").where({ userId: bob.id }).first()

      const byUserId = await http.patch(
        `/profiles?userId=${bob.id}`,
        { images: [imageEntry("not-bob.png")] },
        { headers: alice.headers }
      )
      const byProfileId = await http.patch(
        `/profiles/${before.id}`,
        { images: [imageEntry("not-bob.png")] },
        { headers: alice.headers }
      )

      assert.equal(byUserId.status, 403)
      assert.equal(byProfileId.status, 403)
      const after = await app.get("postgresqlClient")("Profile").where({ userId: bob.id }).first()
      assert.deepEqual(after.images, before.images, "Bob's profile is unchanged")
    })

    it("can change their own account but not someone else's", async () => {
      const own = await http.patch(
        `/users/${alice.id}`,
        { email: `renamed-${alice.id}@example.test` },
        { headers: alice.headers }
      )
      const other = await http.patch(
        `/users/${bob.id}`,
        { email: "stolen@example.test" },
        { headers: alice.headers }
      )

      assert.equal(own.status, 200)
      assert.equal(other.status, 403)
    })

    it("can't delete someone else's account", async () => {
      const response = await http.delete(`/users/${bob.id}`, { headers: alice.headers })

      assert.equal(response.status, 403)
      assert.ok(await app.get("postgresqlClient")("User").where({ id: bob.id }).first())
    })

    it("gets past the login check for a signed upload URL", async () => {
      const response = await http.post(
        "/presignurl",
        { id: "x.png", path: "users" },
        { headers: { ...alice.headers, "X-Service-Method": "putObject" } }
      )
      // The tests run without S3 credentials, so signing itself fails with 500; the point is
      // that the request is no longer turned away as unauthenticated
      assert.notEqual(response.status, 401)
    })
  })
})
