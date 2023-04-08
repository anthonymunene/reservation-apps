// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';

import type { Application } from '../../declarations';
import type { Profiles, ProfilesData, ProfilesPatch, ProfilesQuery } from './profiles.schema';
export type { Profiles, ProfilesData, ProfilesPatch, ProfilesQuery };

export interface ProfilesParams extends KnexAdapterParams<ProfilesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ProfilesService<ServiceParams extends Params = ProfilesParams> extends KnexService<
  Profiles,
  ProfilesData,
  ServiceParams,
  ProfilesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('postgresqlClient'),
    name: 'Profile',
  };
};
