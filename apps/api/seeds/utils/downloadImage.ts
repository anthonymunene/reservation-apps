export const downloadImage = async (imageURL: string): Promise<Buffer | string> => {
  try {
    const response = await fetch(imageURL)

    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`)
    }

    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    return Buffer.from(arrayBuffer)
  } catch (error) {
    if (error instanceof Error) {
      return error.message
    }
    return "An unknown error occurred"
  }
}
