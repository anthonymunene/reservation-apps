// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from "@feathersjs/feathers"
import type { ClientApplication } from "../../client"
import type {
  Reviews,
  ReviewsData,
  ReviewsPatch,
  ReviewsQuery,
  ReviewsService,
} from "./reviews.class"

export type { Reviews, ReviewsData, ReviewsPatch, ReviewsQuery }

export type ReviewsClientService = Pick<
  ReviewsService<Params<ReviewsQuery>>,
  (typeof reviewsMethods)[number]
>

export const reviewsPath = "reviews"

export const reviewsMethods = ["find", "get", "create", "patch", "remove"] as const

export const reviewsClient = (client: ClientApplication) => {
  const connection = client.get("connection")

  client.use(reviewsPath, connection.service(reviewsPath), {
    methods: reviewsMethods,
  })
}

// Add this service to the client service type index
declare module "../../client" {
  interface ServiceTypes {
    [reviewsPath]: ReviewsClientService
  }
}
