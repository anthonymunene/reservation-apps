import * as cloudinaryProvider from "cloudinary"
import * as dotenv from "dotenv" // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import { logger } from "../logger"
dotenv.config()

const cloudinary = cloudinaryProvider.v2
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export const uploadToImageStorage = async (fileName: string) => {
  try {
    const data = await cloudinary.uploader.upload(fileName)
    return data.secure_url
  } catch (error) {
    logger.error('Failed to upload image to Cloudinary', { fileName, error })
    throw error
  }
}
