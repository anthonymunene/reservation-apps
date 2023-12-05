export const downloadImage = async (imageURL: string) => {
  const response = await fetch(imageURL)
    .then(async response => {
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer;
    })
    .catch(error => {
      return (error as Error).message;
    });

  return response;
};
