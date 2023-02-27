// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema';
import { Type, getValidator, querySyntax } from '@feathersjs/typebox';
import type { Static } from '@feathersjs/typebox';
import { randomUUID } from 'crypto';

import type { HookContext } from '../../declarations';
import { dataValidator, queryValidator } from '../../validators';

// Main data model schema
export const propertyTypesSchema = Type.Object(
  {
    id: Type.String({ format: 'uuid' }),
    name: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    updatedBy: Type.String({ format: 'date-time' }),
  },
  { $id: 'PropertyTypes', additionalProperties: false }
);
export type PropertyTypes = Static<typeof propertyTypesSchema>;
export const propertyTypesValidator = getValidator(propertyTypesSchema, dataValidator);
export const propertyTypesResolver = resolve<PropertyTypes, HookContext>({});

export const propertyTypesExternalResolver = resolve<PropertyTypes, HookContext>({
  createdAt: async () => undefined,
  updatedAt: async () => undefined,
  updatedBy: async () => undefined,
});

// Schema for creating new entries
export const propertyTypesDataSchema = Type.Pick(propertyTypesSchema, ['name'], {
  $id: 'PropertyTypesData',
});
export type PropertyTypesData = Static<typeof propertyTypesDataSchema>;
export const propertyTypesDataValidator = getValidator(propertyTypesDataSchema, dataValidator);
export const propertyTypesDataResolver = resolve<PropertyTypes, HookContext>({
  id: async () => {
    return randomUUID();
  },
  createdAt: async () => {
    return new Date().toISOString();
  },
});

// Schema for updating existing entries
export const propertyTypesPatchSchema = Type.Partial(propertyTypesSchema, {
  $id: 'PropertyTypesPatch',
});
export type PropertyTypesPatch = Static<typeof propertyTypesPatchSchema>;
export const propertyTypesPatchValidator = getValidator(propertyTypesPatchSchema, dataValidator);
export const propertyTypesPatchResolver = resolve<PropertyTypes, HookContext>({
  updatedAt: async () => {
    return new Date().toISOString();
  },
  updatedBy: async (_value, _document, context: HookContext) => context.params.user.id,
});

// Schema for allowed query properties
export const propertyTypesQueryProperties = Type.Pick(propertyTypesSchema, ['id', 'name']);
export const propertyTypesQuerySchema = Type.Intersect(
  [
    querySyntax(propertyTypesQueryProperties),
    // Add additional query properties here
    Type.Object({}, { additionalProperties: false }),
  ],
  { additionalProperties: false }
);
export type PropertyTypesQuery = Static<typeof propertyTypesQuerySchema>;
export const propertyTypesQueryValidator = getValidator(propertyTypesQuerySchema, queryValidator);
export const propertyTypesQueryResolver = resolve<PropertyTypesQuery, HookContext>({});
