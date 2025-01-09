import { Reviews } from "@services/reviews/reviews.schema"

export type ReviewsId = Pick<Reviews, "id">

// Type for the entire reviews structure
export interface ReviewsSeedData {
  positive: Reviews["comment"][]
  negative: Reviews["comment"][]
  mixed: Reviews["comment"][]
}
