//@ts-nocheck
// For more information about this file see https://dove.feathersjs.com/guides/cli/service.test.html
import assert from "assert"
import { app } from "../../../src/app"
const { faker } = require("@faker-js/faker")
import { randomiseMany } from "../../../src/utils/randomise"
import { createQueryCounter } from "../../utils/query-counter"

describe("properties service", () => {
  it("registered the service", () => {
    const service = app.service("properties")

    assert.ok(service, "Registered the service")
  })

  it("creates a new property", async () => {
    const propertyType = await app.service("propertytypes").find({ query: { $limit: 1 } })
    const amenities = (
      await app.service("amenities").find({ query: { $select: ["id"] } })
    ).data.map(amenity => amenity.id)

    const randomAmenities = randomiseMany(amenities, 3)

    const user = await app.service("users").find({ query: { $limit: 1 } })
    const property = await app.service("properties").create({
      title: faker.word.adjective(7),
      description: faker.lorem.sentences(),
      city: faker.location.city(),
      host: user.data[0].id,
      countryCode: faker.location.countryCode(),
      propertyTypeId: propertyType.data[0].id,
      amenities: randomAmenities,
    })
    assert.ok(property, "Success Created User")
  })
})

/**
 * Behavior Tests - Verify the data contract is maintained
 *
 * These tests check WHAT data is returned, not HOW it's fetched.
 * They should pass both before and after our N+1 fix.
 */
describe("properties service - relation loading", () => {

  it("should return ownedBy as a string with owner name", async () => {
    const { data: properties } = await app.service("properties").find({
      query: { $limit: 1 }
    })
    const property = properties[0]

    assert.ok(property.ownedBy, "Should have ownedBy field")
    assert.strictEqual(typeof property.ownedBy, "string", "ownedBy should be a string")
    assert.ok(property.ownedBy.length > 0, "ownedBy should not be empty")
  })

  it("should return propertyType as the type name string", async () => {
    const { data: properties } = await app.service("properties").find({
      query: { $limit: 1 }
    })
    const property = properties[0]

    assert.ok(property.propertyType, "Should have propertyType field")
    assert.strictEqual(typeof property.propertyType, "string", "propertyType should be a string")
  })

  it("should return amenities as an array of names", async () => {
    const { data: properties } = await app.service("properties").find({
      query: { $limit: 1 }
    })
    const property = properties[0]

    assert.ok(property.amenities, "Should have amenities field")
    assert.ok(Array.isArray(property.amenities), "amenities should be an array")
    // Each amenity should be a string name, not an object
    if (property.amenities.length > 0) {
      assert.strictEqual(typeof property.amenities[0], "string", "amenity should be a string name")
    }
  })

  it("should return correct relations for single property via get", async () => {
    // First find a property to get its ID
    const { data: properties } = await app.service("properties").find({
      query: { $limit: 1 }
    })
    const propertyId = properties[0].id

    // Now test the get method
    const property = await app.service("properties").get(propertyId)

    assert.ok(property.ownedBy, "get() should return ownedBy")
    assert.ok(property.propertyType, "get() should return propertyType")
    assert.ok(Array.isArray(property.amenities), "get() should return amenities array")
  })

  it("should handle multiple properties correctly", async () => {
    // Fetch multiple properties - this is where N+1 would be painful
    const { data: properties } = await app.service("properties").find({
      query: { $limit: 5 }
    })

    // All properties should have their relations populated
    for (const property of properties) {
      assert.ok(property.ownedBy, `Property ${property.id} should have ownedBy`)
      assert.ok(property.propertyType, `Property ${property.id} should have propertyType`)
      assert.ok(Array.isArray(property.amenities), `Property ${property.id} should have amenities`)
    }
  })
})

/**
 * Performance Tests - Verify query count is optimized
 *
 * These tests use the query counter to measure database efficiency.
 * They prove that our batch loading reduces the number of queries.
 *
 * Analogy: Like a pedometer - we're counting "steps" (queries) to prove
 * our optimization reduces the number of "trips" to the database.
 */
describe("properties service - query performance", () => {
  let queryCounter: ReturnType<typeof createQueryCounter>

  before(() => {
    queryCounter = createQueryCounter(app)
  })

  after(() => {
    queryCounter.stop()
  })

  beforeEach(() => {
    queryCounter.reset()
  })

  it("should use batched queries for find operation", async () => {
    // Fetch 5 properties
    await app.service("properties").find({ query: { $limit: 5 } })

    const count = queryCounter.count()

    // With batching: ~5 queries (properties + profiles + types + propAmenities + amenities)
    // Without batching (N+1): ~21 queries (1 + 5*4)
    // We expect significantly fewer queries with batching
    assert.ok(
      count <= 10,
      `Expected ≤10 queries for 5 properties, but got ${count}. Queries:\n${queryCounter.queries().join("\n")}`
    )
  })

  it("should scale constantly not linearly with result count", async () => {
    // Test with 3 properties
    queryCounter.reset()
    await app.service("properties").find({ query: { $limit: 3 } })
    const countFor3 = queryCounter.count()

    // Test with 6 properties
    queryCounter.reset()
    await app.service("properties").find({ query: { $limit: 6 } })
    const countFor6 = queryCounter.count()

    // With batching: both should have similar query counts (~5 queries each)
    // With N+1: countFor6 would be ~2x countFor3
    const ratio = countFor6 / countFor3
    assert.ok(
      ratio < 1.5,
      `Query count should not scale linearly. 3 props: ${countFor3} queries, 6 props: ${countFor6} queries (ratio: ${ratio.toFixed(2)})`
    )
  })
})
