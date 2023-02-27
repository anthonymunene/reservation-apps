// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, virtual } from '@feathersjs/schema';
import { Type, getDataValidator, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';
import { usersDataSchema } from '../users/users.schema';
import { randomUUID } from 'crypto';

// Main data model schema
export const propertiesSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    title: Type.String(),
    description: Type.String(),
    city: Type.String(),
    countryCode: Type.String(),
    bedrooms: Type.Number(),
    beds: Type.Number(),
    images: Type.Array(Type.Object({ image: Type.String() })),
    hostId: Type.String({ format: 'uuid' }),
    propertyTypeId: Type.String(),
    propertyType: Type.String(),
    ownedBy: Type.String(),
    amenities: Type.Array(Type.String()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    updatedBy: Type.String({ format: 'date-time' }),
  },
  { $id: 'Properties', additionalProperties: false }
);
export type Properties = Static<typeof propertiesSchema>;
type Users = Static<typeof usersDataSchema>;
export const propertiesResolver = resolve<Properties, HookContext>({
  ownedBy: virtual(async (property, context) => {
    const user: Users = await context.app.service('users').get(property.hostId);
    return `${user.id}`;
  }),
  amenities: virtual(async (property, context) => {
    const amenities = await context.app
      .service('propertyAmenities')
      .find({
        query: {
          propertyId: property.id,
          $select: ['amenityId'],
        },
      })
      .then(propertyAmenities => propertyAmenities.data.map(propertyAmenity => propertyAmenity.amenityId))
      .then(async amenityIds => {
        const amenities = await context.app.service('amenities').find({
          query: {
            id: {
              $in: amenityIds,
            },
          },
        });
        return amenities;
      });
    const propertyAmenities = amenities.data.map(amenity => amenity.name);

    return propertyAmenities;
  }),
  propertyType: virtual(async (property, context) => {
    const propertyType = await context.app.service('propertyTypes').find({
      query: {
        id: property.propertyTypeId,
        $select: ['name'],
      },
    });

    return `${propertyType.data[0].name}`;
  }),
});

export const propertiesExternalResolver = resolve<Properties, HookContext>({
  hostId: async () => undefined,
  propertyTypeId: async () => undefined,
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
});

// Schema for creating new entries
export const propertiesDataSchema = Type.Omit(
  propertiesSchema,
  ['title', 'description', 'city', 'countryCode', 'bedrooms', 'beds'],
  {
    $id: 'PropertiesData',
  }
);
export type PropertiesData = Static<typeof propertiesDataSchema>;
export const propertiesDataValidator = getDataValidator(propertiesDataSchema, dataValidator);
export const propertiesDataResolver = resolve<Properties, HookContext>({
  id: async () => {
    return randomUUID();
  },
  createdAt: async () => {
    return new Date().toISOString();
  },
});

// Schema for updating existing entries
export const propertiesPatchSchema = Type.Partial(propertiesSchema, {
  $id: 'PropertiesPatch',
});
export type PropertiesPatch = Static<typeof propertiesPatchSchema>;
export const propertiesPatchValidator = getDataValidator(propertiesPatchSchema, dataValidator);
export const propertiesPatchResolver = resolve<Properties, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString();
  },
  updatedBy: async (_value, _document, context: HookContext) => context.params.user.id,
});

// Schema for allowed query properties
export const propertiesQueryProperties = Type.Pick(propertiesSchema, ['id']);
export const propertiesQuerySchema = Type.Intersect(
  [
    querySyntax(propertiesQueryProperties),
    // Add additional query properties here
    // Type.Object({

    //   'munene': Type.String()
    // },
    // { additionalProperties: false })
  ],
  { additionalProperties: false }
);
export type PropertiesQuery = Static<typeof propertiesQuerySchema>;
export const propertiesQueryValidator = getValidator(propertiesQuerySchema, queryValidator);
export const propertiesQueryResolver = resolve<PropertiesQuery, HookContext>({});

// Resolver for the data that is being returned
export const propertiesResultResolver = resolve<Properties, HookContext>({});
