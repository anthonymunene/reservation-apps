import { ResultAsync } from "neverthrow"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"
import { createError } from "@seeds/utils/createError"
import { ImageDownloadResult } from "@seeds/utils/types/images"

export const downloadImages = (
  link: string
): ResultAsync<ImageDownloadResult, ImagesMetaDataError> => {
  //TODO: fetch multiple images here based on the number of urls
  return ResultAsync.fromPromise(fetch(link), error => createError(ErrorCode.NETWORK, `${error}`))
    .andThen(response =>
      ResultAsync.fromPromise(response.blob(), error =>
        createError(ErrorCode.PARSE, `${error}`)
      ).andThen(blob =>
        ResultAsync.fromPromise(blob.arrayBuffer(), error =>
          createError(ErrorCode.PARSE, `${error}`)
        )
      )
    )
    .map(arrayBuffer => ({ url: link, content: Buffer.from(arrayBuffer) }))
}
