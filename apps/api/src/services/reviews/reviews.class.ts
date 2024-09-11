// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers"
import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex"
import { KnexService } from "@feathersjs/knex"

import type { Application } from "../../declarations"
import type { Reviews, ReviewsData, ReviewsPatch, ReviewsQuery } from "./reviews.schema"

export type { Reviews, ReviewsData, ReviewsPatch, ReviewsQuery }

export interface ReviewsParams extends KnexAdapterParams<ReviewsQuery> {}

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class ReviewsService<ServiceParams extends Params = ReviewsParams> extends KnexService<
  Reviews,
  ReviewsData,
  ReviewsParams,
  ReviewsPatch
> {}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("postgresqlClient"),
    name: "Review",
  }
}
