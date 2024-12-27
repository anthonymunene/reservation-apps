// Type for a single review
type Review = string

// Type for the entire reviews structure
export interface Reviews {
  positive: Review[]
  negative: Review[]
  mixed: Review[]
}
