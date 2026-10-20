// @ts-nocheck
import _ from "lodash"
import createDebug from "debug"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { errAsync, ResultAsync } from "neverthrow"
import { createError } from "@seeds/utils/createError"
import { ErrorCode } from "@seeds/utils/types/errors"

const debug = createDebug("feathers-s3:service")

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/interfaces/_aws_sdk_types.requestpresigningarguments-1.html

export class S3Service {
  constructor(options) {
    // Check options
    if (!options) {
      throw new Error("feathers-s3:constructor: `options` must be provided")
    }
    // Check s3Client configuration
    if (!options.s3Client) {
      throw new Error("feathers-s3:constructor: `options.s3Client` must be provided")
    }

    const signatureVersion = _.get(options.s3Client, "signatureVersion")

    const credentials = options.s3Client.credentials
    if (signatureVersion !== "v4") {
      throw new Error(
        "feathers-s3:constructor: `options.s3Client.signatureVersion` must be provided and equal to `v4`"
      )
    }
    this.s3Client = new S3Client({
      region: options.s3Client.region,
      signatureVersion,
      credentials: { ...credentials },
    })
    // Check for bucket
    if (!options.s3Client.bucket) {
      throw new Error("feathers-s3:constructor: `options.bucket` must be provided")
    }
    this.bucket = options.s3Client.bucket
    // Check for optional delimiter
    this.delimiter = options.delimiter || "/"
    // Check for optional prefix
    this.prefix = options.s3Client.prefix
    this.id = options.id || "id"
  }

  getKey(id, path) {
    return this.prefix ? this.prefix + this.delimiter + path + this.delimiter + id : id
  }

  getPresignedUrl(id: string, path: id) {
    if (!id) return errAsync(createError(ErrorCode.CONFIGURATION, `missing id`))
    if (!path) return errAsync(createError(ErrorCode.CONFIGURATION, `missing path`))
    const commandParams = {
      Key: this.getKey(id, path),
      Bucket: this.bucket,
    }
    const command = new PutObjectCommand(commandParams)
    const signedURL = ResultAsync.fromPromise(
      getSignedUrl(this.s3Client, command, { expiresIn: 3600 }),
      error => createError(ErrorCode.API, `something went wrong ${error}`)
    )
    return signedURL
  }
}
