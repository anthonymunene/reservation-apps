import { randomUUID } from "crypto"
import { Image } from "@seeds/utils/types/images"

export class ImageDefaults {
  static createDefaultJson(): string {
    return JSON.stringify([
      {
        id: null,
        url: null,
        caption: null,
        altText: null,
        metadata: {
          uploadedAt: null,
          status: "inactive",
          isPrimaryImage: false,
          displayOrder: 0,
        },
      },
    ])
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
      id: `${randomUUID()}`,
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
