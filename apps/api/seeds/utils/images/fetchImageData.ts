import { ErrorCode, NetworkError, ParseError } from "@seeds/utils/types/errors"
import { err, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { UnsplashSearchResponse } from "@seeds/utils/types/images"

// Unsplash explains a refusal in the response body (for example "Rate Limit Exceeded"), which is
// far more useful than the status text alone. Kept short so a large error page can't flood logs.
const MAX_BODY_IN_ERROR = 200

export const fetchImageData = (url: string) => {
  return ResultAsync.fromPromise<Response, NetworkError>(fetch(url), error =>
    createError(ErrorCode.NETWORK, `${error}`)
  ).andThen(response => {
    if (!response.ok) {
      // The request URL carries the Unsplash access key, so it is deliberately left out of the error.
      // Reading the body can't fail the request: an unreadable body just means no reason is shown.
      const readBody = response.text().catch(() => "")
      return ResultAsync.fromSafePromise(readBody).andThen(body => {
        const reason = body.trim().slice(0, MAX_BODY_IN_ERROR)
        return err(
          createError(
            ErrorCode.NETWORK,
            `${response.status} ${response.statusText}${reason ? `: ${reason}` : ""}`,
            response.status,
            {
              status: response.status,
              rateLimitRemaining: response.headers.get("x-ratelimit-remaining"),
              rateLimit: response.headers.get("x-ratelimit-limit"),
            }
          )
        )
      })
    }
    return ResultAsync.fromPromise<UnsplashSearchResponse, ParseError>(response.json(), error =>
      createError(ErrorCode.PARSE, `${error}`)
    )
  })
}
