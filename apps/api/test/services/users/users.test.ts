// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from "assert"
import { app } from "../../../src/app"
const { faker } = require("@faker-js/faker")
import { describe } from "mocha"

describe("users service", () => {
  it("registered the service", () => {
    const service = app.service("users")
    assert.ok(service, "Registeredddddddd the service")
  })
  it("creates a new user", async () => {
    const email = faker.internet.email()
    const user = await app.service("users").create({
      email: email,
      password: faker.internet.password(),
    })
    assert.ok(user, "Success Created User")
    //should automatically creates a user profile
    assert.equal(user.profile.bio, "insert bio", "Success Created Profile")
  })
})
