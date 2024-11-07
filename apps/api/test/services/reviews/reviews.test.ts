// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from "assert"
import { app } from "../../../src/app"

describe("reviews service", () => {
  it("registered the service", () => {
    const service = app.service("reviews")

    assert.ok(service, "Registered the service")
  })
})
