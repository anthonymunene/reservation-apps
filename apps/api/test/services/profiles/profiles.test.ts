// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from "assert"
import { randomUUID } from "crypto"
import { faker } from "@faker-js/faker"
import { app } from "../../../src/app"

// A complete image entry, in the shape the profiles schema requires
const imageEntry = (url: string) => ({
  id: randomUUID(),
  url,
  metadata: {
    status: "active" as const,
    uploadedAt: new Date().toISOString(),
    displayOrder: 0,
    isPrimaryImage: true,
  },
  updatedAt: new Date().toISOString(),
  version: 1,
})

// Creating a user also creates their profile (see the users service hooks)
const createUser = async () => {
  const user = await app.service("users").create({
    email: faker.internet.email(),
    password: faker.internet.password(),
  })
  return user.id as string
}

// Reads a profile the way the database stores it, including the profile id
const getStoredProfile = async (userId: string) => {
  const db = app.get("postgresqlClient")
  return db("Profile").where({ userId }).first()
}

describe("profiles service", () => {
  it("registered the service", () => {
    const service = app.service("profiles")

    assert.ok(service, "Registered the service")
  })

  describe("patching a profile by userId", () => {
    let userId: string
    let otherUserId: string

    before(async () => {
      userId = await createUser()
      otherUserId = await createUser()
    })

    it("updates only the profile that belongs to that user", async () => {
      const otherBefore = await getStoredProfile(otherUserId)

      await app
        .service("profiles")
        .patch(null, { images: [imageEntry("new-picture.png")] }, { query: { userId } })

      const updated = await getStoredProfile(userId)
      const otherAfter = await getStoredProfile(otherUserId)
      assert.equal(updated.images[0].url, "new-picture.png")
      assert.deepEqual(otherAfter.images, otherBefore.images, "Other profiles are untouched")
    })

    it("works without a logged-in user", async () => {
      // The API has no authentication yet, so requests arrive with no params.user
      await app
        .service("profiles")
        .patch(
          null,
          { images: [imageEntry("anonymous.png")] },
          { query: { userId }, provider: "rest" }
        )

      const updated = await getStoredProfile(userId)
      assert.equal(updated.images[0].url, "anonymous.png")
    })

    it("rejects a patch with neither a profile id nor a userId", async () => {
      await assert.rejects(
        app.service("profiles").patch(null, { images: [imageEntry("everyone.png")] }),
        { name: "BadRequest" }
      )
    })

    it("returns NotFound for a userId with no profile", async () => {
      await assert.rejects(
        app.service("profiles").patch(null, { images: [] }, { query: { userId: randomUUID() } }),
        { name: "NotFound" }
      )
    })
  })
})
