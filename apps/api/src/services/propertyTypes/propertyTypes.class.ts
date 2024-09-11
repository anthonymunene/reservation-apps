// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers"
import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex"
import { KnexService } from "@feathersjs/knex"

import type { Application } from "../../declarations"
import type { PropertyTypes, PropertyTypesData, PropertyTypesPatch, PropertyTypesQuery } from "./propertyTypes.schema"

export type { PropertyTypes, PropertyTypesData, PropertyTypesPatch, PropertyTypesQuery }

export interface PropertyTypesParams extends KnexAdapterParams<PropertyTypesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class PropertyTypesService<ServiceParams extends Params = PropertyTypesParams> extends KnexService<
  PropertyTypes,
  PropertyTypesData,
  PropertyTypesParams,
  PropertyTypesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "PropertyType",
  }
}
