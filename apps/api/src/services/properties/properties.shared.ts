// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type {
  Properties,
  PropertiesData,
  PropertiesPatch,
  PropertiesQuery,
  PropertiesService,
} from './properties.class';

export type { Properties, PropertiesData, PropertiesPatch, PropertiesQuery };

export type PropertiesClientService = Pick<
  PropertiesService<Params<PropertiesQuery>>,
  (typeof propertiesMethods)[number]
>;

export const propertiesPath = 'properties';

export const propertiesMethods = ['find', 'get', 'create', 'patch', 'remove'] as const;

export const propertiesClient = (client: ClientApplication) => {
  const connection = client.get('connection');

  client.use(propertiesPath, connection.service(propertiesPath), {
    methods: propertiesMethods,
  });
};

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [propertiesPath]: PropertiesClientService;
  }
}
