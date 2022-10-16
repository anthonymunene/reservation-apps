import glob from 'glob';
import { downloadImage } from '../../utils/downloadImage';
import { unlink } from 'fs/promises';

export const clearImageFolder = async (path = '') => {
  const files = glob.sync(path);

  return files.length === 0
    ? [] // <-- automatically wrapped in a Promise
    : Promise.all(files.map((f) => unlink(f).then((_) => f)));
};

interface ImageOptions {
  user: {
    firstName: string,
    lastName: string
  },
  dir: string
}
export const seedImages = async (category: string, { user, dir }: ImageOptions) => {
  try {
    const { firstName, lastName } = user;
    const outputFileName = `${dir}/${firstName}-${lastName}.png`;
    return await downloadImage({ path: outputFileName, category }).then(
      (outputFileName) => outputFileName
    );
  } catch (error) {
    console.log(error);
  }
};

