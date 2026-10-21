import assert from "assert"
import { okAsync } from "neverthrow"
import { faker } from "@faker-js/faker"
import { app } from "../../src/app"
import { updatePropertyPictures } from "@seeds/properties"
import { updateProfilePictures } from "@seeds/users"

// Stand-ins for the S3 upload and the local image cache, so these tests never touch S3 or the
// file system. Each id "has" one cached image, named after the id like the real cache.
const stubs = {
  getMatchingFile: (id: string) =>
    okAsync([{ name: `${id}-cached.png`, content: Buffer.from("") }]),
  uploadToS3: (fileName: string) => okAsync({ fileName, status: "success" }),
}

const db = () => app.get("postgresqlClient")

// A property and a user created through the API, the way the tests and the app create them:
// neither has an image, so neither has a file in the seed image cache
const createRecordsWithoutImages = async () => {
  const propertyType = await app.service("propertytypes").find({ query: { $limit: 1 } })
  const owner = await app.service("users").find({ query: { $limit: 1 } })
  const property = await app.service("properties").create({
    title: faker.word.adjective(),
    description: faker.lorem.sentence(),
    city: faker.location.city(),
    countryCode: faker.location.countryCode(),
    host: owner.data[0].id,
    propertyTypeId: propertyType.data[0].id,
  })
  const user = await app.service("users").create({
    email: faker.internet.email(),
    password: faker.internet.password(),
  })
  return { propertyId: property.id as string, userId: user.id as string }
}

describe("seed picture updates", () => {
  let existing: { propertyId: string; userId: string }

  before(async () => {
    existing = await createRecordsWithoutImages()
  })

  it("only attaches pictures to the properties it is given", async () => {
    const [seeded] = await db()("Property")
      .select("id")
      .whereNot({ id: existing.propertyId })
      .limit(1)
    const before = await db()("Property").where({ id: existing.propertyId }).first()

    const result = await updatePropertyPictures(db(), [{ id: seeded.id }], stubs)

    assert.ok(result.isOk(), `Expected success, got ${result.isErr() && result.error.message}`)
    const updated = await db()("Property").where({ id: seeded.id }).first()
    const untouched = await db()("Property").where({ id: existing.propertyId }).first()
    assert.ok(
      updated.images.some((image: { url: string }) => image.url === `${seeded.id}-cached.png`),
      "The given property got its picture"
    )
    assert.deepEqual(untouched.images, before.images, "Other properties are left alone")
  })

  it("only attaches profile pictures to the users it is given", async () => {
    const [seeded] = await db()("User").select("id").whereNot({ id: existing.userId }).limit(1)
    const before = await db()("Profile").where({ userId: existing.userId }).first()

    const result = await updateProfilePictures(db(), [{ id: seeded.id }], stubs)

    assert.ok(result.isOk(), `Expected success, got ${result.isErr() && result.error.message}`)
    const updated = await db()("Profile").where({ userId: seeded.id }).first()
    const untouched = await db()("Profile").where({ userId: existing.userId }).first()
    assert.ok(
      updated.images.some((image: { url: string }) => image.url === `${seeded.id}-cached.png`),
      "The given user got their profile picture"
    )
    assert.deepEqual(untouched.images, before.images, "Other profiles are left alone")
  })
})
