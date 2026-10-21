import { HookContext, NextFunction } from "../../declarations"
import { logger } from "../../logger"

export const insertAmenity = async (context: HookContext, next: NextFunction) => {
  logger.debug(`Running insertAmenity hook on ${context.path}.${context.method}`)
  if (context.method === "create") {
    // amenities is optional; a property can be created without any
    const { amenities = [], ...data } = context.data

    // Code before `await next()` runs before the main function
    //strips out amenities from data as schema does not allow it
    context.data = data

    await next()
    if (amenities.length === 0) return

    const amenityData = amenities.map((amenity: string) => ({
      propertyId: context.result?.id,
      amenityId: amenity,
    }))

    await context.app.service("propertyamenities").create(amenityData)
  }
}
