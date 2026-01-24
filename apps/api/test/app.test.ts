// For more information about this file see https://dove.feathersjs.com/guides/cli/app.test.html
import assert from "assert"
import axios from "axios"
import type { Server } from "http"
import { app } from "../src/app"

const port = app.get("port")
const appUrl = `http://${app.get("host")}:${port}`

describe("Feathers application tests", () => {
  let server: Server

  before(async () => {
    server = await app.listen(port)
  })

  after(async () => {
    await app.teardown()
  })

  it("starts and shows the index page", async () => {
    const { data } = await axios.get<string>(appUrl)

    assert.ok(data.indexOf('<html lang="en">') !== -1)
  })

  it("shows a 404 JSON error in standardized format", async () => {
    try {
      await axios.get(`${appUrl}/path/to/nowhere`, {
        responseType: "json",
      })
      assert.fail("should never get here")
    } catch (error: any) {
      const { response } = error
      // Check HTTP status
      assert.strictEqual(response?.status, 404)

      // Check our new standardized error format
      assert.strictEqual(response?.data?.success, false)
      assert.strictEqual(response?.data?.error?.code, "NOT_FOUND")
      assert.ok(response?.data?.error?.message, "Error should have a message")
      assert.ok(Array.isArray(response?.data?.error?.details), "Details should be an array")
      assert.ok(response?.data?.error?.timestamp, "Error should have a timestamp")
    }
  })
})
