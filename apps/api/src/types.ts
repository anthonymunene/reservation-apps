// The TypeScript definitions below are automatically generated.
// Do not touch them, or risk, your modifications being lost.

export enum Table {
  Amenity = "Amenity",
  Profile = "Profile",
  Property = "Property",
  PropertyAmenity = "PropertyAmenity",
  PropertyType = "PropertyType",
  Review = "Review",
  User = "User",
}

export type Tables = {
  Amenity: Amenity
  Profile: Profile
  Property: Property
  PropertyAmenity: PropertyAmenity
  PropertyType: PropertyType
  Review: Review
  User: User
}

export type Amenity = {
  id: string
  name: string | null
  createdAt: Date
  updatedAt: Date
}

export type Profile = {
  id: string
  firstName: string | null
  surname: string | null
  otherNames: string | null
  bio: string | null
  isSuperHost: boolean
  defaultPic: Record<string, unknown> | null
  profilePics: Record<string, unknown> | null
  userId: string | null
  createdAt: Date
  updatedAt: Date
}

export type Property = {
  id: string
  title: string
  description: string | null
  city: string | null
  countryCode: string | null
  bedrooms: number | null
  beds: number | null
  images: unknown[] | null
  host: string | null
  propertyTypeId: string | null
  createdAt: Date
  updatedAt: Date
}

export type PropertyAmenity = {
  id: string
  propertyId: string | null
  amenityId: string | null
  createdAt: Date
  updatedAt: Date
}

export type PropertyType = {
  id: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type Review = {
  id: string
  propertyId: string | null
  userId: string | null
  comment: string | null
  createdAt: Date
  updatedAt: Date
}

export type User = {
  id: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
  lastLogin: Date | null
}
