import glob from 'glob';
import { downloadImage } from '../../utils/downloadImage';
import { unlink } from 'fs/promises';
import { promises, existsSync, mkdirSync } from 'fs';
import crypto from 'crypto';


interface ImageOptions {
  user?: {
    firstName: string,
    lastName: string
  },
  property?: { title: string },
  dir: string,
  imageCount?: number
}

const saveImage = async (buffer: string | Buffer, fileName: string, dir: string) => {
  const hashSum = crypto.createHash('md5');
  hashSum.update(buffer);
  const hash = hashSum.digest('hex').substring(0, 10);
  const imageName = `${fileName.toLowerCase()}-${hash}.png`;
  const path = `${dir}/${imageName}`;

  try {
    await promises.writeFile(path, buffer);
    return path;
  } catch (error) {
    return (error as Error).message;
  }


};

export const clearImageFolder = async (path = '') => {
  const files = glob.sync(path);

  return files.length === 0
    ? [] // <-- automatically wrapped in a Promise
    : Promise.all(files.map((f) => unlink(f).then((_) => f)));
};

export const createIfNotExist = (filepath: string) => {
  if (!existsSync(filepath)) {
    mkdirSync(filepath);
  } else {
    return;
  }
};
export const seedImages = async (imageCategory: string, { user, property, dir, imageCount = 1 }: ImageOptions) => {
  const images: string[] = [];
  const removePath = (imagePath: string) => imagePath?.split(`${dir}/`)[1];
  // TODO: consolidate duplicates
  for (let i = 0; i < imageCount; i++) {
    if (user) {
      const imageName = `${user.firstName}-${user.lastName}`;
      await downloadImage(imageCategory).then(async image => {
        await saveImage(image, imageName, dir).then(fileName => {
          images.push(removePath(fileName));
        });
      });
    }

    if (property) {
      const imageName = `${property.title}`.replace(/ /g, '_');
      await downloadImage(imageCategory).then(async image => {
        await saveImage(image, imageName, dir).then(fileName => images.push(removePath(fileName)));
      });
    }

  }
  return images;

};

