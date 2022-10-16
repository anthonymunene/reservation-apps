// AUTO GENERATED FILE BY @kalissaac/prisma-typegen
// DO NOT EDIT




export interface Property {
    id: number,
    createdAt: Date,
    updatedAt: Date,
    title: string,
    propertyType?: PropertyType,
    propertyTypeId: number,
    description?: string,
    city: string,
    country: string,
    bedrooms: number,
    beds: number,
    baths?: number,
    entirePlace: boolean,
    defaultImage?: string,
    amenities: AmenitiesOnProperty[],
    host?: User,
    hostId?: number,
    reviews: Review[],
}

export interface Review {
    id: number,
    createdAt: Date,
    updatedAt: Date,
    comment: string,
    rating: number,
    reviewer: User,
    reviewerId: number,
    property: Property,
    propertyId: number,
}

export interface Amenity {
    id: number,
    properties: AmenitiesOnProperty[],
    name: string,
    createdAt: Date,
    updatedAt: Date,
}

export interface AmenitiesOnProperty {
    amenity: Amenity,
    amenityId: number,
    property?: Property,
    propertyId: number,
    createdAt: Date,
    updatedAt: Date,
}

export interface User {
    id: number,
    email: string,
    firstName?: string,
    lastName?: string,
    profile?: Profile,
    properties: Property[],
    reviews: Review[],
    createdAt: Date,
    updatedAt: Date,
}

export interface Profile {
    id: number,
    bio?: string,
    profilePic?: string,
    account: User,
    accountId: string,
    superHost: boolean,
    createdAt: Date,
    updatedAt: Date,
}

export interface PropertyType {
    id: number,
    name: string,
    type: Property[],
    createdAt: Date,
    updatedAt: Date,
}
