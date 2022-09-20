const { promises } = require("fs");

const downloadImage = async ({ path, category }) => {
  const IMAGE_URL = process.env.IMAGE_URL;
  const response = await fetch(`${IMAGE_URL}/${category}?w=640&h=480`);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  await promises.writeFile(path, buffer);

  return path;
};

module.exports = downloadImage;
