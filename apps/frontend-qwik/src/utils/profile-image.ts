import { USER_IMAGE_FOLDER } from "~/utils/variables"

// Shown when a user has no profile picture yet
export const PLACEHOLDER_PROFILE_IMAGE =
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"

/**
 * The address of a user's profile picture. The API stores only the file name in `url`; the file
 * itself lives in the users folder of the image bucket.
 */
export const profileImageUrl = (images?: { url?: string }[] | null) => {
  const fileName = images?.[0]?.url
  if (!fileName) return PLACEHOLDER_PROFILE_IMAGE
  return `${import.meta.env.PUBLIC_IMAGE_BASE_URL}/${USER_IMAGE_FOLDER}/${fileName}`
}

/**
 * A file name for a new upload that won't clash with anyone else's, even when two people upload
 * files with the same name. Keeps the original extension so the image type is still obvious.
 */
export const uniqueImageName = (ownerId: string, originalName: string) => {
  const extension = originalName.includes(".") ? originalName.split(".").pop() : "img"
  return `${ownerId}-${crypto.randomUUID()}.${extension}`
}

/**
 * A complete image entry in the shape the profiles API expects, marked as the primary picture.
 */
export const primaryImageEntry = (fileName: string) => {
  const now = new Date().toISOString()
  return {
    id: crypto.randomUUID(),
    url: fileName,
    metadata: {
      status: "active" as const,
      uploadedAt: now,
      displayOrder: 0,
      isPrimaryImage: true,
    },
    updatedAt: now,
    version: 1,
  }
}
