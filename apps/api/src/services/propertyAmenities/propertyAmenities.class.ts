// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type {
  PropertyAmenities,
  PropertyAmenitiesData,
  PropertyAmenitiesPatch,
  PropertyAmenitiesQuery,
} from './propertyAmenities.schema';

export type { PropertyAmenities, PropertyAmenitiesData, PropertyAmenitiesPatch, PropertyAmenitiesQuery };

export interface PropertyAmenitiesParams extends KnexAdapterParams<PropertyAmenitiesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class PropertyAmenitiesService<ServiceParams extends Params = PropertyAmenitiesParams> extends KnexService<
  PropertyAmenities,
  PropertyAmenitiesData,
  PropertyAmenitiesParams,
  PropertyAmenitiesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'PropertyAmenity',
  };
};
