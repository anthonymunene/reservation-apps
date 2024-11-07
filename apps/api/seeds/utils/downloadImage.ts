export const downloadImage = async (imageURL: string) => {
  return await fetch(imageURL)
    .then(async response => {
      const blob = await response.blob()
      const arrayBuffer = await blob.arrayBuffer()
      return Buffer.from(arrayBuffer)
    })
    .catch(error => {
      console.log(error)
      return (error as Error).message
    })
}
