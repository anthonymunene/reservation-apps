import { randomiseInt } from "@utils/randomise"
import { Table } from "@database-generated-types/knex-db"
import reviewsSeedData from "@seeds/data/reviews.json"
import type { ReviewsId, ReviewsSeedData } from "@seeds/utils/types/reviews"
import { UserId } from "@seeds/utils/types/users"
import { randomUUID } from "crypto"
import { DatabaseClient } from "@seeds/utils/types/shared"
import { ResultAsync } from "neverthrow"
import { PropertyId } from "@seeds/utils/types/properties"
import { createError } from "@seeds/utils/createError"
import { ErrorCode } from "@seeds/utils/types/errors"

export const getRandomReview = (reviews: string[], dependencies = { randomiseInt }) => {
  const { randomiseInt } = dependencies
  return reviews[randomiseInt(reviews.length)]
}

export const createReviews = (dbClient: DatabaseClient) => {
  console.log(`Creating reviews...`)
  const reviews = reviewsSeedData as ReviewsSeedData
  const allReviews = [...reviews.positive, ...reviews.negative, ...reviews.mixed]
  const getRandomUserId = (users: UserId[]) => users[randomiseInt(users.length)]

  return ResultAsync.combine([
    ResultAsync.fromPromise(
      dbClient.select("id").from(Table.User) as Promise<UserId[]>,
      error => error as Error
    ),
    ResultAsync.fromPromise(
      dbClient.select("id").from(Table.Property) as Promise<PropertyId[]>,
      error => error as Error
    ),
  ]).andThen(([users, properties]) => {
    return ResultAsync.fromPromise(
      Promise.all(
        properties.map(property => {
          const { id } = getRandomUserId(users)
          const review = getRandomReview(allReviews)
          return dbClient
            .insert({
              id: randomUUID(),
              propertyId: property.id,
              userId: id,
              comment: review,
            })
            .returning("id")
            .into(Table.Review) as Promise<ReviewsId>
        })
      ),
      error => createError(ErrorCode.DATABASE, `${error}`)
    )
    // await Promise.all(
    //   properties.map(property => {
    //     const { id }: UserId = users[randomiseInt(users.length)]
    //
    //     const review = getRandomReview(allReviews)
    //     return dbClient
    //       .insert({
    //         id: randomUUID(),
    //         propertyId: property.id,
    //         userId: id,
    //         comment: review,
    //       })
    //       .into(Table.Review)
    //   })
    // )
  })
}
