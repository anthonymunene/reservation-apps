// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { Properties, PropertiesData, PropertiesPatch, PropertiesQuery } from './properties.schema';
export type { Properties, PropertiesData, PropertiesPatch, PropertiesQuery };
export interface PropertiesParams extends KnexAdapterParams<PropertiesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class PropertiesService<ServiceParams extends Params = PropertiesParams> extends KnexService<
  Properties,
  PropertiesData,
  ServiceParams,
  PropertiesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'Property',
    multi: true,
  };
};
