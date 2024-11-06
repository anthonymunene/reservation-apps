import { HookContext, NextFunction } from "../../declarations"

export const insertAmenity = async (context: HookContext, next: NextFunction) => {
  console.log(`Running hook create order on ${context.path}.${context.method}`)
  if (context.method === "create") {
    const { amenities, ...data } = context.data

    // Code before `await next()` runs before the main function
    //strips out amenities from data as schema does not allow it
    context.data = data

    await next()
    const amenityData = amenities.map((amenity: any) => ({
      propertyId: context.result?.id,
      amenityId: amenity,
    }))

    await context.app.service("propertyamenities").create(amenityData)
  }
}
