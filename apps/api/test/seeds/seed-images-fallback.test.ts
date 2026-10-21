import assert from "assert"
import { errAsync, ok, okAsync } from "neverthrow"
import { seedImages } from "@seeds/utils/seedImages"
import { fetchImageData } from "@seeds/utils/images/fetchImageData"
import { createError } from "@seeds/utils/createError"
import { ErrorCode } from "@seeds/utils/types/errors"

const RATE_LIMITED = createError(ErrorCode.NETWORK, "403 Forbidden: Rate Limit Exceeded", 403, {
  status: 403,
  rateLimitRemaining: "0",
})

// Stand-ins for every step, so these tests need no network, no Unsplash key and no files.
// `calls` records what happened so each test can check it.
const makeDependencies = (options: { unsplashFails?: boolean; saveFails?: boolean } = {}) => {
  const calls = { unsplash: 0, placeholder: 0, warnings: [] as string[], saved: [] as string[] }
  const dependencies = {
    checkImageCache: () => ok({ exists: false as const }),
    getImageData: () => {
      calls.unsplash++
      return options.unsplashFails ? errAsync(RATE_LIMITED) : okAsync({ urls: {} })
    },
    extractImageLinks: () => ok("https://images.example/photo.jpg"),
    downloadImages: () => okAsync({ content: Buffer.from("unsplash") }),
    placeholderImages: {
      getImageData: () => {
        calls.placeholder++
        return okAsync({ urls: {} })
      },
      extractImageLinks: () => ok("file:///placeholder.png"),
      downloadImages: () => okAsync({ content: Buffer.from("placeholder") }),
    },
    saveImage: (content: Buffer, fileName: string) => {
      if (options.saveFails) return errAsync(createError(ErrorCode.FILE_SYSTEM, "disk full"))
      calls.saved.push(`${fileName}:${content.toString()}`)
      return okAsync({ success: true, value: fileName })
    },
    logger: {
      warn: (message: string) => calls.warnings.push(message),
      debug: () => undefined,
    },
    unsplashStatus: { available: true },
  }
  return { dependencies: dependencies as any, calls }
}

describe("seed images when Unsplash refuses", () => {
  it("uses a placeholder and logs one warning with the reason", async () => {
    const { dependencies, calls } = makeDependencies({ unsplashFails: true })

    const result = await seedImages({ query: "users", id: "user-1" } as any, dependencies)

    assert.ok(result.isOk(), "The seed carries on instead of failing")
    assert.deepEqual(calls.saved, ["user-1:placeholder"], "Saved the placeholder image")
    assert.equal(calls.warnings.length, 1)
    assert.match(calls.warnings[0], /Rate Limit Exceeded/, "The warning says why")
    assert.match(calls.warnings[0], /users user-1/, "The warning says which record")
    assert.equal(dependencies.unsplashStatus.available, false)
  })

  it("stops asking Unsplash for the rest of the run, without more warnings", async () => {
    const { dependencies, calls } = makeDependencies({ unsplashFails: true })

    await seedImages({ query: "users", id: "user-1" } as any, dependencies)
    await seedImages({ query: "users", id: "user-2" } as any, dependencies)
    await seedImages({ query: "properties", id: "property-1" } as any, dependencies)

    assert.equal(calls.unsplash, 1, "Unsplash was only asked once")
    assert.equal(calls.placeholder, 3)
    assert.equal(calls.warnings.length, 1, "Only one warning for the whole run")
  })

  it("logs one warning even when many requests are refused at the same time", async () => {
    const { dependencies, calls } = makeDependencies({ unsplashFails: true })

    // The seeds request every image in parallel, so all of these reach Unsplash before the
    // first refusal comes back
    const ids = ["p-1", "p-2", "p-3", "p-4", "p-5"]
    const results = await Promise.all(
      ids.map(id => seedImages({ query: "properties", id } as any, dependencies))
    )

    assert.ok(results.every(result => result.isOk()))
    assert.equal(calls.placeholder, ids.length, "Every image fell back to a placeholder")
    assert.equal(calls.warnings.length, 1, "Only one warning")
  })

  it("still uses Unsplash when it works", async () => {
    const { dependencies, calls } = makeDependencies()

    await seedImages({ query: "users", id: "user-1" } as any, dependencies)

    assert.deepEqual(calls.saved, ["user-1:unsplash"])
    assert.equal(calls.warnings.length, 0)
  })

  it("still fails when the image can't be saved", async () => {
    const { dependencies } = makeDependencies({ unsplashFails: true, saveFails: true })

    const result = await seedImages({ query: "users", id: "user-1" } as any, dependencies)

    assert.ok(result.isErr(), "A save failure is a real problem, so it isn't hidden")
  })
})

describe("fetchImageData errors", () => {
  const realFetch = global.fetch

  afterEach(() => {
    global.fetch = realFetch
  })

  it("include the status and Unsplash's reason, but not the URL with the access key", async () => {
    global.fetch = (async () =>
      new Response("Rate Limit Exceeded", {
        status: 403,
        statusText: "Forbidden",
        headers: { "x-ratelimit-remaining": "0", "x-ratelimit-limit": "50" },
      })) as typeof fetch

    const result = await fetchImageData("https://api.unsplash.com/search?client_id=SECRET-KEY")

    assert.ok(result.isErr())
    assert.equal(result.error.message, "403 Forbidden: Rate Limit Exceeded")
    assert.equal(result.error.context.details?.rateLimitRemaining, "0")
    assert.doesNotMatch(JSON.stringify(result.error), /SECRET-KEY/)
  })
})
