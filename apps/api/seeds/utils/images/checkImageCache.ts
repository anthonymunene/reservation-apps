import { existsSync, readdirSync } from "fs"
import { ok, err, Result } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { ErrorCode, FileSystemError } from "@seeds/utils/types/errors"

export type CachedImage = { exists: true; path: string; fileName: string }
export type CacheMiss = { exists: false }
export type CacheCheckResult = CachedImage | CacheMiss

/**
 * Check if an image for the given entity ID already exists in the cache directory.
 * Images are named: {id}-{8char-md5-hash}.png
 *
 * This avoids unnecessary Unsplash API calls when images have already been downloaded.
 */
export const checkImageCache = (
  entityId: string,
  cacheDir: string
): Result<CacheCheckResult, FileSystemError> => {
  if (!entityId || !cacheDir) {
    return err(createError(ErrorCode.FILE_SYSTEM, "Entity ID and cache directory required"))
  }

  const absolutePath = `${process.cwd()}/${cacheDir}`

  if (!existsSync(absolutePath)) {
    return ok({ exists: false })
  }

  try {
    const files = readdirSync(absolutePath)
    // Find files that start with the entity ID (format: {id}-{hash}.png)
    const matchingFile = files.find(file => file.startsWith(`${entityId}-`))

    if (matchingFile) {
      return ok({
        exists: true,
        path: `${absolutePath}/${matchingFile}`,
        fileName: matchingFile,
      })
    }

    return ok({ exists: false })
  } catch (error) {
    return err(
      createError(
        ErrorCode.FILE_SYSTEM,
        `Failed to read cache directory: ${error instanceof Error ? error.message : error}`
      )
    )
  }
}
