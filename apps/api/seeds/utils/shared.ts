import { readdir, readFile, stat } from "node:fs/promises"
import path, { basename, join } from "node:path"
import { S3Service } from "@utils/s3/lib"
import * as defaultConfig from "../../config/default.json"
import { seedImages } from "./seedImages"
import { AllowedTables, EntityType, S3Path, TableData } from "@seeds/utils/types/shared"
import {
  DefaultImageBase,
  Image,
  ImageFolders,
  ImageType,
  UploadResult,
} from "@seeds/utils/types/images"
import { PropertyId } from "@seeds/utils/types/properties"
import { UserId } from "@seeds/utils/types/users"
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ENTITY_CONFIG } from "./variables"
import { ImageDefaults } from "./imageDefaults"
import { errAsync, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import {
  ApiError,
  ConfigurationError,
  DatabaseError,
  ErrorCode,
  FileSystemError,
  ImagesMetaDataError,
} from "@seeds/utils/types/errors"
import { SavedImageSuccess } from "@seeds/utils/images"
import { Knex } from "knex"

const safeReaddir = ResultAsync.fromThrowable(
  (path: string) => readdir(path, { withFileTypes: true, recursive: true }),
  error => createError(ErrorCode.FILE_SYSTEM, `Failed to read directory: ${error}`)
)

const safeStat = ResultAsync.fromThrowable(stat, error =>
  createError(ErrorCode.FILE_SYSTEM, `Failed to get file stats: ${error}`)
)

const safeReadFile = ResultAsync.fromThrowable(
  (path: string) => readFile(path),
  error => createError(ErrorCode.FILE_SYSTEM, `Failed to read directory: ${error}`)
)
export const getFiles = (
  directoryPath: string,
  dependencies = {
    safeReaddir,
    path,
    safeStat,
  }
): ResultAsync<string[], FileSystemError | ConfigurationError> => {
  const { safeReaddir, path, safeStat } = dependencies
  if (!directoryPath) {
    console.error("Directory path is required")
    return errAsync(createError(ErrorCode.CONFIGURATION, "Directory path is required"))
  }

  const absolutePath = path.join(process.cwd(), directoryPath)

  return safeReaddir(absolutePath)
    .andThen(files =>
      ResultAsync.combine(
        files.map(file => {
          const filePath = join(absolutePath, file.name)
          return safeStat(filePath).map(stats => ({
            name: file.name,
            isFile: stats.isFile(),
          }))
        })
      )
    )
    .map(fileStats => fileStats.filter(file => file.isFile).map(file => basename(file.name)))
}

export const getPresignedUrl = (fileName: string, path: S3Path, dependencies = { S3Service }) => {
  const { S3Service } = dependencies
  const s3Client = new S3Service({
    s3Client: {
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
      },
      ...defaultConfig.storage.s3.s3Client,
    },
  })
  return s3Client.getPresignedUrl(fileName, path).map(url => url)
}

export const getMatchingFile = (
  id: string,
  path: ImageFolders,
  dependencies = { getFiles, safeReadFile }
): ResultAsync<DefaultImageBase[], ConfigurationError | FileSystemError> => {
  const { getFiles, safeReadFile } = dependencies
  if (!id) return errAsync(createError(ErrorCode.CONFIGURATION, `missing id parameter`))
  return getFiles(path).andThen(files => {
    if (!files.length) return errAsync(createError(ErrorCode.FILE_SYSTEM, `no files found`))
    const matchingFiles = files.filter(file => file.includes(id))
    if (!matchingFiles.length)
      return errAsync(createError(ErrorCode.FILE_SYSTEM, `no matching files found`))

    const operation = matchingFiles.map(file => {
      return safeReadFile(`${process.cwd()}/${path}/${file}`).map(content => ({
        name: file,
        content,
      }))
    })
    return ResultAsync.combine(operation)
  })
}

const processImage = (
  { id }: UserId | PropertyId,
  imageType: ImageType,
  dependencies = { seedImages }
): ResultAsync<SavedImageSuccess[], ImagesMetaDataError> => {
  const { seedImages } = dependencies
  return seedImages({
    query: imageType,
    id,
  })
}

export const generateImages = (
  data: UserId[] | PropertyId[],
  imageType: ImageType,
  dependencies = { processImage }
): ResultAsync<SavedImageSuccess[], ImagesMetaDataError> => {
  const { processImage } = dependencies
  if (!data) {
    return errAsync(createError(ErrorCode.CONFIGURATION, "data missing"))
  }

  return ResultAsync.combine(data.map(id => processImage(id, imageType))).map(results =>
    results.flat()
  )
}

const uploadContent = (url: string, content: Buffer) => {
  console.log(url)
  return ResultAsync.fromPromise(
    fetch(url, {
      method: "PUT",
      body: content,
    }),
    error => createError(ErrorCode.API, `something went wrong ${error}`)
  )
}
export const uploadToS3 = (
  fileName: string,
  fileData: Buffer,
  path: S3Path,
  dependencies = { getPresignedUrl }
): ResultAsync<UploadResult, ConfigurationError | ApiError> => {
  const { getPresignedUrl } = dependencies
  return getPresignedUrl(fileName, path)
    .andThen(url => {
      return uploadContent(url, fileData)
    })
    .mapErr(error => {
      console.log(error)
      return error
    })
    .map(response => {
      return { fileName, status: response.statusText }
    })
}
const replacePrimaryImageForEntity = <T extends AllowedTables>(
  dbClient: Knex,
  entityId: string,
  fileName: string,
  entityType: EntityType,
  config: { table: T; idColumn: string }
): ResultAsync<{ status: string; result: string[] }, DatabaseError> => {
  if (!dbClient) {
    return errAsync(createError(ErrorCode.DATABASE, "Database client is required"))
  }
  if (!entityId) {
    return errAsync(createError(ErrorCode.DATABASE, "Entity ID is required"))
  }
  if (!fileName) {
    return errAsync(createError(ErrorCode.DATABASE, "File name is required"))
  }

  if (!config) return errAsync(createError(ErrorCode.DATABASE, `config is required`))

  const imageData: Image = ImageDefaults.createNewImageEntry(fileName, {
    isPrimary: true,
    order: 0,
  })

  return ResultAsync.fromPromise(
    dbClient(config.table)
      .where(config.idColumn, entityId)
      .update({
        images: dbClient.raw(
          `(
            CASE
              WHEN images IS NULL OR images = '[]'::jsonb OR (images @> '[{"id": null}]'::jsonb)
              THEN ?::jsonb
              ELSE COALESCE(images, '[]'::jsonb) || ?::jsonb
            END
          )`,
          [
            JSON.stringify([imageData]), // Replace placeholder completely
            JSON.stringify([imageData]), // Append to existing valid images
          ]
        ),
        updatedAt: dbClient.fn.now(),
      } as unknown as Partial<TableData<T>>)
      .returning("id"),
    error =>
      createError(ErrorCode.DATABASE, `Failed to replace primary image for ${entityType}: ${error}`)
  ).map(result => ({ status: "success", result: result[0] }))
}

export const updateEntityImage = (
  dbClient: Knex,
  entityId: string,
  fileName: string,
  entityType: EntityType
) => {
  const config = ENTITY_CONFIG[entityType]
  return replacePrimaryImageForEntity(dbClient, entityId, fileName, entityType, config)
}
