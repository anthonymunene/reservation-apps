// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { Amenities, AmenitiesData, AmenitiesPatch, AmenitiesQuery, AmenitiesService } from './amenities.class';

export type { Amenities, AmenitiesData, AmenitiesPatch, AmenitiesQuery };

export type AmenitiesClientService = Pick<AmenitiesService<Params<AmenitiesQuery>>, (typeof amenitiesMethods)[number]>;

export const amenitiesPath = 'amenities';

export const amenitiesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const amenitiesClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(amenitiesPath, connection.service(amenitiesPath), {
    methods: amenitiesMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [amenitiesPath]: AmenitiesClientService;
  }
}
