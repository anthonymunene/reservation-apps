import { HookContext } from "../declarations"
import { Properties } from "@services/properties/properties.schema"
import { logger } from "../logger"

const sanitise = (images: Properties["images"]) => images.map(image => ({ url: image.url }))
export const sanitiseImageData = async (context: HookContext) => {
  logger.debug(`Running sanitiseImageData hook on ${context.path}.${context.method}`)
  if (context.method === "get") {
    context.result.images = sanitise(context.result.images)
  }
  if (context.method === "find") {
    if (context.result.data) {
      context.result.data = context.result.data.map((items: Properties) => {
        const { images, ...rest } = items
        const sanitisedImageData = sanitise(images)
        return { ...rest, images: sanitisedImageData }
      })
    } else {
      context.result = context.result.map((items: Properties) => {
        const { images, ...rest } = items
        const sanitisedImageData = sanitise(images)
        return { ...rest, images: sanitisedImageData }
      })
    }
  }
  return context
}
