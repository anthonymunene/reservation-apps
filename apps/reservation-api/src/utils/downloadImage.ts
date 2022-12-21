



export const downloadImage = async (category: string) => {
  const IMAGE_URL = process.env.IMAGE_URL;
  const response = await fetch(`${IMAGE_URL}/${category}?w=640&h=480`).then(async response => {
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
  }).catch(error => {
    return (error as Error).message;
  });

  return response;
};
