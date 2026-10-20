import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { errAsync, ResultAsync } from "neverthrow"
import { createError } from "../../../../seeds/utils/createError"
import { ErrorCode } from "../../../../seeds/utils/types/errors"

// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/interfaces/_aws_sdk_types.requestpresigningarguments-1.html

export type S3ServiceOptions = {
  s3Client: {
    credentials?: { accessKeyId?: string; secretAccessKey?: string }
    region: string
    // Kept in config to document the signing method. AWS SDK v3 always signs with v4, so it is
    // checked here but not passed to S3Client (which doesn't accept it).
    signatureVersion: string
    bucket: string
    prefix?: string
  }
  delimiter?: string
  id?: string
}

export class S3Service {
  s3Client: S3Client
  bucket: string
  delimiter: string
  prefix?: string
  id: string

  constructor(options: S3ServiceOptions) {
    // Check options
    if (!options) {
      throw new Error("feathers-s3:constructor: `options` must be provided")
    }
    // Check s3Client configuration
    if (!options.s3Client) {
      throw new Error("feathers-s3:constructor: `options.s3Client` must be provided")
    }

    const { signatureVersion, credentials } = options.s3Client
    if (signatureVersion !== "v4") {
      throw new Error(
        "feathers-s3:constructor: `options.s3Client.signatureVersion` must be provided and equal to `v4`"
      )
    }
    this.s3Client = new S3Client({
      region: options.s3Client.region,
      // Without both values, leave credentials out so the SDK looks them up itself (it also reads
      // AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY). Empty strings would sign URLs S3 rejects.
      credentials:
        credentials?.accessKeyId && credentials?.secretAccessKey
          ? { accessKeyId: credentials.accessKeyId, secretAccessKey: credentials.secretAccessKey }
          : undefined,
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

  getKey(id: string, path: string) {
    return this.prefix ? this.prefix + this.delimiter + path + this.delimiter + id : id
  }

  getPresignedUrl(id: string, path: string) {
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
