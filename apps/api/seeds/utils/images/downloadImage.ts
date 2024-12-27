import { ResultAsync } from "neverthrow"
import { ErrorCode, ImagesMetaDataError } from "@seeds/utils/types/errors"
import { createError } from "@seeds/utils/createError"

export const downloadImage = (imageURL: string): ResultAsync<Buffer, ImagesMetaDataError> =>
  ResultAsync.fromPromise(fetch(imageURL), error => createError(ErrorCode.NETWORK, `${error}`))
    .andThen(response =>
      ResultAsync.fromPromise(response.blob(), error =>
        createError(ErrorCode.PARSE, `${error}`)
      ).andThen(blob =>
        ResultAsync.fromPromise(blob.arrayBuffer(), error =>
          createError(ErrorCode.PARSE, `${error}`)
        )
      )
    )
    .map(arrayBuffer => Buffer.from(arrayBuffer))
