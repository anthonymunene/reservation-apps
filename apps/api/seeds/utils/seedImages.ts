// import { glob } from 'glob';
import { downloadImage } from "./downloadImage"
// import { unlink } from 'fs/promises';
import { promises, existsSync, mkdirSync } from "fs"
import * as crypto from "crypto"
import { getImages } from "./getUnsplashImages"
import { randomiseInt } from "../../src/utils/randomise"
const { faker } = require("@faker-js/faker")
import { count, error } from "console"

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

type seederOpts = {
  type: "users" | "properties"
  name: string
  imageCount?: number
}

export const imageSeeder = async () => {
  const imageTypes = {
    properties: await getImages({ query: "house exterior", size: "regular" }),
    users: await getImages({ query: "profile picture", size: "regular" }),
  }

  const init = async (opts: seederOpts) => {
    const { type, name, imageCount = 1 } = opts
    const seedImageDir = `${process.cwd()}/seeds/images/${type}`
    const images: string[] = []
    const removePath = (imagePath: string) => imagePath?.split(`${seedImageDir}/`)[1]
    createIfNotExist(seedImageDir)

    // await clearImageFolder(`${seedUserImageDir}/*.png`)
    //   .then((deletedFiles) => console.log('done! deleted files:', deletedFiles))

    // TODO: consolidate duplicates
    for (let i = 0; i < imageCount; i++) {
      const randomImage = faker.helpers.arrayElement(imageTypes[type])
      await downloadImage(randomImage).then(async image => {
        await saveImage(image, name, seedImageDir).then(fileName => {
          images.push(fileName)
        })
      })
    }

    return imageCount > 1 ? images : images[0]
  }

  return init
}
