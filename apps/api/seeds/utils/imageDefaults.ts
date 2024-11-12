import { Image } from "./types"
import { randomUUID } from "crypto"

export class ImageDefaults {
  static createDefaultJson(): string {
    return JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      images: [],
    })
  }

  static createNewImageEntry(
    url: string,
    options: {
      isPrimary?: boolean
      order?: number
      caption?: string
      altText?: string
    } = {}
  ): Image {
    return {
      id: `img_${randomUUID()}`,
      url,
      caption: options.caption,
      altText: options.altText,
      metadata: {
        uploadedAt: new Date().toISOString(),
        status: "active",
        isPrimaryImage: options.isPrimary ?? false,
        displayOrder: options.order ?? 0,
      },
    }
  }
}
