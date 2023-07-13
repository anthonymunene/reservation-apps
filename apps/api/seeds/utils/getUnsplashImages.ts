//@ts-nocheck
const IMAGE_URL = 'https://api.unsplash.com/search/photos';
const ACCESS = 'fQCTr6MeEUhXbXGWRoieLlpdrBGLHoEmstOBBSytxIo';
const extractImageLink = (data: any, size: string) => data.map(image => image.urls[size]);

type ImageOpts = {
  query: string;
  size: string;
  imagesCount?: number;
};
export const getImages = async (opts: ImageOpts) => {
  const { query, size, imagesCount = 10 } = opts;
  const response: string[] = await fetch(
    `${IMAGE_URL}?client_id=${ACCESS}&query=${encodeURIComponent(query)}&per_page=${imagesCount}`
  ).then(async data => {
    const { results } = await data.json();

    return extractImageLink(results, size);
  });

  return response;
};
