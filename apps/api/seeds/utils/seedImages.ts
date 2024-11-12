import { downloadImage } from "./downloadImage"
import { existsSync, mkdirSync, promises } from "fs"
import * as crypto from "crypto"
import { getImages } from "./getUnsplashImages"
import { type SeederOpts } from "./types"
//@ts-ignore
import { faker } from "@faker-js/faker"

const saveImage = async (buffer: string | Buffer, fileName: string, dir: string) => {
  const hashSum = crypto.createHash("md5")
  hashSum.update(buffer)
  const hash = hashSum.digest("hex").substring(0, 10)
  const imageName = `${fileName.toLowerCase().replace(/ /g, "-")}-${hash}.png`
  const path = `${dir}/${imageName}`

  try {
    await promises.writeFile(path, buffer)
    return path
  } catch (error) {
    return (error as Error).message
  }
}

// export const clearImageFolder = async (path = '') => {
//   const files = glob.sync(path);

//   return files.length === 0
//     ? [] // <-- automatically wrapped in a Promise
//     : Promise.all(files.map(f => unlink(f).then(_ => f)));
// };

export const createIfNotExist = (filepath: string) => {
  if (!existsSync(filepath)) {
    mkdirSync(filepath, { recursive: true })
  } else {
    return
  }
}

export const imageSeeder = async () => {
  // Initialize image types with proper error handling
  const imageTypeConfigs = {
    properties: { query: "modern house", size: "regular" },
    users: { query: "headshot", size: "regular" },
  } as const

  const getImageTypes = async (type: keyof typeof imageTypeConfigs) => {
    const config = imageTypeConfigs[type]
    if (!config) {
      throw new Error(`Invalid image type: ${type}`)
    }

    return await getImages(config)
  }

  return async (opts: SeederOpts) => {
    const { type, id, imageCount = 1 } = opts

    // Validate inputs
    if (!type || !id) {
      throw new Error("Type and ID are required parameters")
    }

    const seedImageDir = `${process.cwd()}/seeds/images/${type}`
    const images: string[] = []
    // const removePath = (imagePath: string) => imagePath?.split(`${seedImageDir}/`)[1]

    createIfNotExist(seedImageDir)

    // await clearImageFolder(`${seedUserImageDir}/*.png`)
    //   .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))

    // TODO: consolidate duplicates
    const downloadPromises = Array.from({ length: imageCount }, async () => {
      try {
        const randomImages = await getImageTypes(type)
        if (randomImages) {
          const randomImage = faker.helpers.arrayElement(randomImages)
          const image = await downloadImage(randomImage)
          return await saveImage(image, id, seedImageDir)
        } else {
          throw new Error(`No images available for type: ${type}`)
        }
      } catch (error) {
        console.error(`Failed to process image: ${error.message}`)
        return null
      }
    })

    const results = await Promise.all(downloadPromises)
    images.push(...results.filter(Boolean))

    if (images.length === 0) {
      throw new Error("Failed to generate any valid images")
    }

    return imageCount > 1 ? images : images[0]
  }
}
