import type { NoSerialize } from "@builder.io/qwik"
import { logError } from "~/utils/logError"
import { api } from "~/client"

type UploadData = (
  data: NoSerialize<File>,
  options: {
    path?: string
    debug?: boolean
    expiresIn: number
    // Name to store the file under. Defaults to the file's own name.
    fileName?: string
  }
) => Promise<Response | undefined>

type SignedURL = (id: string, path: string) => Promise<{ signedUrl: string } | undefined>

const getSignedURL: SignedURL = async (name, path) => {
  try {
    // Through the api client rather than fetch: the API only signs upload URLs for a logged-in
    // user, and the client adds the login token to the request
    return await api.service("presignurl").putObject({ id: name, path })
  } catch (error) {
    if (error instanceof Error) {
      logError(error)
    }
  }
}
const upload: UploadData = async function (data, options) {
  if (!data) throw new Error('upload: missing "data" file parameter')
  const name = options.fileName ?? data.name

  if (!options.path) throw new Error('create: missing "missing options.path" parameter')
  const { path } = options

  try {
    const signed = await getSignedURL(name, path)
    // getSignedURL has already logged why it failed, so there is nothing to upload
    if (!signed) return undefined
    return await fetch(signed.signedUrl, {
      method: "PUT",
      body: data,
    })
  } catch (error) {
    if (error instanceof Error) {
      logError(error)
    }
  }
}

export default upload
