//@ts-nocheck
import { UNSPLASH_ACCESS_KEY } from "./variables"

const IMAGE_URL = "https://api.unsplash.com/search/photos"
const CLIENT_ACCESS_KEY = UNSPLASH_ACCESS_KEY
const extractImageLink = (data: any, size: string) =>
  data.map((image: { urls: { [x: string]: any } }) => image.urls[size])

type ImageOpts = {
  query: string
  size: string
  imagesCount?: number
}
export const getImages = async (opts: ImageOpts) => {
  if (!CLIENT_ACCESS_KEY) throw new Error("missing CLIENT_ACCESS_KEY")
  const { query, size, imagesCount = 10 } = opts
  const response: void | string[] = await fetch(
    `${IMAGE_URL}?client_id=${CLIENT_ACCESS_KEY}&query=${encodeURIComponent(query)}&per_page=${imagesCount}`
  )
    .then(async data => {
      const { results } = await data.json()

      return extractImageLink(results, size)
    })
    .catch(e => console.log(e))

  return response
}
