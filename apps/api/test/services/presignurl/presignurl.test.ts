// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from "assert"
import { app } from "../../../src/app"
import { PresignurlService } from "../../../src/services/presignurl/presignurl.class"

// Options shaped like config/default.json. The credentials are fake: signing a URL happens
// locally, so no request is sent to AWS.
const s3Options = (credentials?: { accessKeyId?: string; secretAccessKey?: string }) => ({
  s3Client: {
    credentials,
    region: "eu-west-2",
    signatureVersion: "v4",
    bucket: "test-bucket",
    prefix: "images",
  },
})

describe("presignurl service", () => {
  it("registered the service", () => {
    const service = app.service("presignurl")

    assert.ok(service, "Registered the service")
  })

  it("returns a signed upload URL when credentials are configured", async () => {
    const service = new PresignurlService(
      s3Options({ accessKeyId: "test-key-id", secretAccessKey: "test-secret" }) as any
    )

    // The Presignurl schema type doesn't list signedUrl, although putObject returns it
    const result: any = await service.putObject({ id: "avatar.png", path: "users" })
    const url = new URL(result.signedUrl)

    assert.equal(result.id, "avatar.png")
    assert.ok(url.host.startsWith("test-bucket.s3."), `Unexpected host ${url.host}`)
    assert.equal(url.pathname, "/images/users/avatar.png")
    assert.ok(url.searchParams.get("X-Amz-Signature"), "URL is signed")
  })

  it("fails with a clear configuration error when credentials are missing", async () => {
    const service = new PresignurlService(s3Options(undefined) as any)

    await assert.rejects(service.putObject({ id: "avatar.png", path: "users" }), (error: any) => {
      assert.equal(error.name, "GeneralError")
      assert.match(error.message, /AWS_ACCESS_KEY_ID/)
      assert.match(error.message, /AWS_SECRET_ACCESS_KEY/)
      return true
    })
  })

  it("fails with a clear configuration error when a credential is empty", async () => {
    const service = new PresignurlService(
      s3Options({ accessKeyId: "test-key-id", secretAccessKey: "" }) as any
    )

    await assert.rejects(service.putObject({ id: "avatar.png", path: "users" }), {
      name: "GeneralError",
    })
  })
})
