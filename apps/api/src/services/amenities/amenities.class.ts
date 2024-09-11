// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers"
import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex"
import { KnexService } from "@feathersjs/knex"

import type { Application } from "../../declarations"
import type { Amenities, AmenitiesData, AmenitiesPatch, AmenitiesQuery } from "./amenities.schema"

export type { Amenities, AmenitiesData, AmenitiesPatch, AmenitiesQuery }

export interface AmenitiesParams extends KnexAdapterParams<AmenitiesQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class AmenitiesService<ServiceParams extends Params = AmenitiesParams> extends KnexService<
  Amenities,
  AmenitiesData,
  AmenitiesParams,
  AmenitiesPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "Amenity",
  }
}
