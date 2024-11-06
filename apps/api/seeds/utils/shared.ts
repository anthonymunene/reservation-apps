import fs from "node:fs"
import path from "node:path"
import { S3Service } from "../../src/utils/s3/lib"
import * as defaultConfig from "../../config/default.json"

export type SeederOpts = {
  type: "users" | "properties"
  id: string
  imageCount?: number
}
export const IMAGE_DIR = "seeds/images"
export const USERS_IMAGE_DIR = `${IMAGE_DIR}/users`
export const PROPERTIES_IMAGE_DIR = `${IMAGE_DIR}/properties`
export const getFiles = (directoryPath: string): string[] => {
  if (!directoryPath) {
    console.error("Directory path is required")
    return []
  }

  const absolutePath = path.join(process.cwd(), directoryPath)

  try {
    return fs
      .readdirSync(absolutePath)
      .filter(file => fs.statSync(path.join(absolutePath, file)).isFile())
      .map(file => path.basename(file))
  } catch (error) {
    console.error(`Error reading directory ${absolutePath}:`, error)
    return []
  }
}

export const getPresignedUrl = async (fileName: string, path: "users" | "properties", dependencies = { S3Service }) => {
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

export const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID
export const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY
export const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
