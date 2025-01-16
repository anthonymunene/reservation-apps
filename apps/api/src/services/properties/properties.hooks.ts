import { HookContext, NextFunction } from "../../declarations"
import { Properties } from "@services/properties/properties.schema"

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

const sanitise = (images: Properties["images"]) => images.map(image => ({ url: image.url }))

export const sanitiseImageData = async (context: HookContext) => {
  console.log(`Running hook create order on ${context.path}.${context.method}`)
  context.result.data = context.result.data.map((items: Properties) => {
    const { images, ...rest } = items
    const sanitisedImageData = sanitise(images)
    return { ...rest, images: sanitisedImageData }
  })
  return context
}
