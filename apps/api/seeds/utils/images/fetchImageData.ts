import { ErrorCode, NetworkError, ParseError } from "@seeds/utils/types/errors"
import { err, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { UnsplashSearchResponse } from "@seeds/utils/types/images"

type FetchResult = NetworkError | ParseError
export const fetchImageData = (url: string) => {
  return ResultAsync.fromPromise<Response, NetworkError>(fetch(url), error =>
    createError(ErrorCode.NETWORK, `${error}`)
  ).andThen(response => {
    if (!response.ok) {
      return err(createError(ErrorCode.NETWORK, response.statusText))
    }
    return ResultAsync.fromPromise<UnsplashSearchResponse, ParseError>(response.json(), error =>
      createError(ErrorCode.PARSE, `${error}`)
    )
  })
}
