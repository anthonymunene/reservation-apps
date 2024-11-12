import { readdir, readFile, stat } from "node:fs/promises"
import path, { basename, join } from "node:path"
import { S3Service } from "../../src/utils/s3/lib"
import * as defaultConfig from "../../config/default.json"
import { imageSeeder } from "./seedImages"
import { EntityType, Image, ImageFolders, PropertyId, S3Path, UserId, ImageType } from "./types"
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, ENTITY_CONFIG } from "./variables"
import type { Knex } from "knex"
import { ImageDefaults } from "./imageDefaults"

export const getFiles = async (directoryPath: string): Promise<string[]> => {
  if (!directoryPath) {
    console.error("Directory path is required")
    return []
  }

  const absolutePath = path.join(process.cwd(), directoryPath)

  try {
    const files = await readdir(absolutePath)
    const fileStats = await Promise.all(
      files.map(async file => {
        const filePath = join(absolutePath, file)
        const stats = await stat(filePath)
        return {
          name: file,
          isFile: stats.isFile(),
        }
      })
    )

    return fileStats.filter(file => file.isFile).map(file => basename(file.name))
    // return fs
    //   .readdirSync(absolutePath)
    //   .filter(file => fs.statSync(path.join(absolutePath, file)).isFile())
    //   .map(file => path.basename(file))
  } catch (error) {
    console.error(`Error reading directory ${absolutePath}:`, error)
    return []
  }
}

export const getPresignedUrl = async (fileName: string, path: S3Path, dependencies = { S3Service }) => {
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
  return s3Client.getPresignedUrl(fileName, path)
}

export const getMatchingFile = async (
  id: string,
  path: ImageFolders,
  dependencies = { getFiles }
): Promise<[string, Buffer] | undefined> => {
  const { getFiles } = dependencies
  const filesNames = await getFiles(path)
  if (!filesNames.length || !id) return undefined

  const matchingFile = filesNames.find(fileName => fileName.includes(id))
  if (!matchingFile) return undefined

  const content = await readFile(`${process.cwd()}/${path}/${matchingFile}`)
  return [matchingFile, content]
}

export const generateImages = async (
  data: UserId[] | PropertyId[],
  imageType: ImageType,
  { getImages = imageSeeder } = {}
): Promise<undefined | Error> => {
  try {
    if (!data) return new Error("data missing")

    const seedImages = await getImages()
    await Promise.all(data.map(({ id }) => seedImages({ type: imageType, id })))
  } catch (e) {
    return new Error(e)
  }
}

export const uploadToS3 = async (
  fileName: string,
  fileData: Buffer,
  path: S3Path,
  dependencies = { getPresignedUrl }
) => {
  try {
    const { getPresignedUrl } = dependencies
    const presignedUrl = await getPresignedUrl(fileName, path)
    return await fetch(presignedUrl, {
      method: "PUT",
      body: fileData,
    })
  } catch (e) {
    return new Error(e)
  }
}

export const replacePrimaryImageForEntity = async (
  dbClient: Knex,
  entityId: string,
  fileName: string,
  entityType: EntityType
) => {
  if (!dbClient) throw new Error("Database client is required")
  if (!entityId) throw new Error("Entity ID is required")
  if (!fileName) throw new Error("File name is required")
  const config = ENTITY_CONFIG[entityType]
  if (!config) throw new Error(`Invalid entity type: ${entityType}`)
  try {
    const imageData: Image = ImageDefaults.createNewImageEntry(fileName, { isPrimary: true, order: 0 })
    await dbClient(config.table)
      .where(config.idColumn, entityId)
      .update({
        images: JSON.stringify(imageData),
        updatedAt: dbClient.fn.now(),
      })
  } catch (error) {
    throw new Error(`Failed to replace primary image for ${entityType}: ${error.message}`)
  }
}
