import type { HookContext } from "../declarations"
import type { Properties } from "../services/properties/properties.schema"
import { logger } from "../logger"

/**
 * Batch loads relations for properties to solve the N+1 query problem.
 *
 * ## The Problem (N+1 Queries)
 *
 * Virtual resolvers run ONCE PER ITEM. For 10 properties, that's:
 * - 10 queries for profiles (ownedBy)
 * - 10 queries for property types
 * - 20 queries for amenities (2 per property)
 * = 41 total queries!
 *
 * ## The Solution (Batch Loading)
 *
 * This hook runs ONCE AFTER all properties are fetched:
 * - 1 query for all profiles
 * - 1 query for all property types
 * - 1 query for property-amenity links
 * - 1 query for amenity details
 * = 5 total queries (regardless of property count)
 *
 * ## Analogy: Mail Room Assistant
 *
 * Instead of each employee going to get their own mail (N trips),
 * a mail room assistant:
 * 1. Collects all mailbox numbers
 * 2. Goes to the post office ONCE
 * 3. Brings back all mail
 * 4. Distributes to each employee
 */
export const batchLoadPropertyRelations = async (context: HookContext) => {
  // Handle both paginated results (find) and single result (get)
  const isPaginated = context.result?.data !== undefined
  const isGetMethod = context.method === "get"

  let properties: Properties[]

  if (isGetMethod) {
    // For get(), result is a single object, not an array
    properties = [context.result as Properties]
  } else if (isPaginated) {
    properties = context.result.data as Properties[]
  } else {
    properties = context.result as Properties[]
  }

  // Early return if no properties
  if (!properties || properties.length === 0) {
    return context
  }

  logger.debug(`Batch loading relations for ${properties.length} properties`)

  // Step 1: Collect unique IDs (using Set for deduplication)
  // Think of this as making a "master shopping list" before going to the store
  const hostIds = [...new Set(properties.map(p => p.host).filter(Boolean))]
  const propertyTypeIds = [...new Set(properties.map(p => p.propertyTypeId).filter(Boolean))]
  const propertyIds = properties.map(p => p.id)

  // Step 2: Batch fetch all related data in parallel (3 queries, not 3N!)
  // This is like going to the store ONCE with your master list
  const [profiles, propertyTypes, propertyAmenities] = await Promise.all([
    // Fetch all profiles for all hosts at once
    hostIds.length > 0
      ? context.app.service("profiles").find({
          paginate: false,
          query: { userId: { $in: hostIds } }
        })
      : [],

    // Fetch all property types at once
    propertyTypeIds.length > 0
      ? context.app.service("propertytypes").find({
          paginate: false,
          query: { id: { $in: propertyTypeIds } }
        })
      : [],

    // Fetch all property-amenity relationships at once
    context.app.service("propertyamenities").find({
      paginate: false,
      query: {
        propertyId: { $in: propertyIds },
        $select: ["propertyId", "amenityId"]
      }
    })
  ])

  // Step 3: Fetch amenity details (one more query)
  const amenityIds = [...new Set(
    (propertyAmenities as any[]).map(pa => pa.amenityId).filter(Boolean)
  )]

  const amenitiesResult = amenityIds.length > 0
    ? await context.app.service("amenities").find({
        paginate: false,
        query: { id: { $in: amenityIds } }
      })
    : []

  // Handle both paginated and non-paginated amenities result
  const amenities = Array.isArray(amenitiesResult)
    ? amenitiesResult
    : (amenitiesResult as any).data || []

  // Step 4: Create lookup Maps for O(1) access
  // Maps are like a well-organized filing cabinet - instant access by key
  // vs Arrays with .find() which is like searching through a pile of papers

  const profileMap = new Map(
    (profiles as any[]).map(p => [p.userId, p])
  )

  const typeMap = new Map(
    (propertyTypes as any[]).map(t => [t.id, t])
  )

  const amenityMap = new Map(
    (amenities as any[]).map(a => [a.id, a])
  )

  // Group property amenities by propertyId for efficient lookup
  const propertyAmenitiesMap = new Map<string, string[]>()
  for (const pa of propertyAmenities as any[]) {
    const existing = propertyAmenitiesMap.get(pa.propertyId) || []
    existing.push(pa.amenityId)
    propertyAmenitiesMap.set(pa.propertyId, existing)
  }

  // Step 5: Distribute results to each property (O(1) lookups)
  for (const property of properties) {
    // Resolve ownedBy (profile name)
    const profile = profileMap.get(property.host)
    property.ownedBy = profile
      ? `${profile.firstName} ${profile.surname}`
      : ""

    // Resolve propertyType (type name)
    const type = typeMap.get(property.propertyTypeId)
    property.propertyType = type?.name ?? ""

    // Resolve amenities (array of amenity names)
    const amenityIdsForProperty = propertyAmenitiesMap.get(property.id) || []
    property.amenities = amenityIdsForProperty
      .map(id => amenityMap.get(id)?.name)
      .filter((name): name is string => Boolean(name))
  }

  logger.debug(`Batch loading complete: ${profiles.length} profiles, ${propertyTypes.length} types, ${amenities.length} amenities`)

  return context
}
