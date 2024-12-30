import { randomiseInt } from "@utils/randomise"
import { Table } from "@database-generated-types/knex-db"
import reviewsSeedData from "@seeds/data/reviews.json"
import type { Reviews } from "@seeds/utils/types/reviews"
import { UserId } from "@seeds/utils/types/users"
import { randomUUID } from "crypto"
import { DatabaseClient } from "@seeds/utils/types/shared"

export const getRandomReview = (reviews: string[], dependencies = { randomiseInt }) => {
  const { randomiseInt } = dependencies
  return reviews[randomiseInt(reviews.length)]
}

export const createReviews = async (dbClient: DatabaseClient): Promise<void> => {
  console.log(`Creating reviews...`)
  const [users, properties] = await Promise.all([
    dbClient.select("id").from(Table.User),
    dbClient.select("id").from(Table.Property),
  ])
  const reviews = reviewsSeedData as Reviews
  const allReviews = [...reviews.positive, ...reviews.negative, ...reviews.mixed]
  await Promise.all(
    properties.map(property => {
      const { id }: UserId = users[randomiseInt(users.length)]

      const review = getRandomReview(allReviews)
      return dbClient
        .insert({
          id: randomUUID(),
          propertyId: property.id,
          userId: id,
          comment: review,
        })
        .into(Table.Review)
    })
  )
}
