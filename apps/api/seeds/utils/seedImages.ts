//ts-nocheck
import { downloadImage } from "./downloadImage"
import { existsSync, mkdirSync, promises } from "fs"
import * as crypto from "crypto"
import { getImages } from "./getUnsplashImages"
import { type SeederOpts } from "./shared"

const { faker } = require("@faker-js/faker")

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
  const imageTypes = {
    properties: await getImages({ query: "house exterior", size: "regular" }),
    users: await getImages({ query: "profile picture", size: "regular" }),
  }

  return async (opts: SeederOpts) => {
    const { type, id, imageCount = 1 } = opts
    const seedImageDir = `${process.cwd()}/seeds/images/${type}`
    const images: string[] = []
    const removePath = (imagePath: string) => imagePath?.split(`${seedImageDir}/`)[1]
    createIfNotExist(seedImageDir)

    // await clearImageFolder(`${seedUserImageDir}/*.png`)
    //   .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))

    // TODO: consolidate duplicates
    for (let i = 0; i < imageCount; i++) {
      try {
        const randomImage = faker.helpers.arrayElement(imageTypes[type])
        await downloadImage(randomImage).then(async image => {
          await saveImage(image, id, seedImageDir).then(fileName => {
            images.push(fileName)
          })
        })
      } catch (e) {
        console.log(e)
      }
    }

    return imageCount > 1 ? images : images[0]
  }
}
