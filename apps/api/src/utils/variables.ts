export const PROPERTY = {
  PROPERTY_TYPES: ["flat", "house", "guest house", "hotel"] as const,
  AMENITIES: ["wifi", "tv", "parking", "pool", "heating"] as const,
} as const

/**
 * Type representing valid property types
 */
export type PropertyType = (typeof PROPERTY.PROPERTY_TYPES)[number]

/**
 * Type representing valid amenities
 */
export type Amenity = (typeof PROPERTY.AMENITIES)[number]

/**
 * Type guard to check if a string is a valid property type
 */
export const isPropertyType = (value: string): value is PropertyType => {
  return PROPERTY.PROPERTY_TYPES.includes(value as PropertyType)
}

/**
 * Type guard to check if a string is a valid amenity
 */
export const isAmenity = (value: string): value is Amenity => {
  return PROPERTY.AMENITIES.includes(value as Amenity)
}
export const DEFAULT_EXCLUSIONS: string[] = ["updatedAt", "createdAt"]
