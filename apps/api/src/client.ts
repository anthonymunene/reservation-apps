// For more information about this file see https://dove.feathersjs.com/guides/cli/client.html
import { feathers } from '@feathersjs/feathers';
import type { TransportConnection, Application } from '@feathersjs/feathers';
import authenticationClient from '@feathersjs/authentication-client';
import type { AuthenticationClientOptions } from '@feathersjs/authentication-client';

import { propertyTypesClient } from './services/propertyTypes/propertyTypes.shared';
export type {
  PropertyTypes,
  PropertyTypesData,
  PropertyTypesQuery,
  PropertyTypesPatch,
} from './services/propertyTypes/propertyTypes.shared';

import { propertyAmenitiesClient } from './services/propertyAmenities/propertyAmenities.shared';
export type {
  PropertyAmenities,
  PropertyAmenitiesData,
  PropertyAmenitiesQuery,
  PropertyAmenitiesPatch,
} from './services/propertyAmenities/propertyAmenities.shared';

import { amenitiesClient } from './services/amenities/amenities.shared';
export type { Amenities, AmenitiesData, AmenitiesQuery, AmenitiesPatch } from './services/amenities/amenities.shared';

import { reviewsClient } from './services/reviews/reviews.shared';
export type { Reviews, ReviewsData, ReviewsQuery, ReviewsPatch } from './services/reviews/reviews.shared';

import { propertiesClient } from './services/properties/properties.shared';
export type {
  Properties,
  PropertiesData,
  PropertiesQuery,
  PropertiesPatch,
} from './services/properties/properties.shared';

import { profilesClient } from './services/profiles/profiles.shared';
export type { Profiles, ProfilesData, ProfilesQuery, ProfilesPatch } from './services/profiles/profiles.shared';

import { usersClient } from './services/users/users.shared';
export type { Users, UsersData, UsersQuery, UsersPatch } from './services/users/users.shared';

export interface Configuration {
  connection: TransportConnection<ServiceTypes>;
}

export interface ServiceTypes {}

export type ClientApplication = Application<ServiceTypes, Configuration>;

/**
 * Returns a typed client for the test-app app.
 *
 * @param connection The REST or Socket.io Feathers client connection
 * @param authenticationOptions Additional settings for the authentication client
 * @see https://dove.feathersjs.com/api/client.html
 * @returns The Feathers client application
 */
export const createClient = <Configuration = any>(
  connection: TransportConnection<ServiceTypes>,
  authenticationOptions: Partial<AuthenticationClientOptions> = {}
) => {
  const client: ClientApplication = feathers();

  client.configure(connection);
  client.configure(authenticationClient(authenticationOptions));
  client.set('connection', connection);

  client.configure(usersClient);
  client.configure(profilesClient);
  client.configure(propertiesClient);
  client.configure(reviewsClient);
  client.configure(amenitiesClient);
  client.configure(propertyAmenitiesClient);
  client.configure(propertyTypesClient);
  // client.configure(uploadsClient);
  return client;
};
