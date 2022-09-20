const FileType = require("file-type-cjs");
const fs = require("fs");
const glob = require("glob");
const downloadImage = require("../../utils/downloadImage");
const { unlink } = require("fs/promises");

const clearImageFolder = async (path = "") => {
  const files = glob.sync(path);

  return files.length === 0
    ? [] // <-- automatically wrapped in a Promise
    : Promise.all(files.map((f) => unlink(f).then((_) => f)));
};
const seedImages = async (category, { user, dir }) => {
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

module.exports = {
  seedImages,
  clearImageFolder,
};
