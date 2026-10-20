// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
import createDebug from "debug"
import type { Application } from "../../declarations"
import type { Presignurl, PresignurlData } from "./presignurl.schema"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import type { PutObjectCommandInput } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { BadRequest, GeneralError } from "@feathersjs/errors"

export type { Presignurl, PresignurlData }
const debug = createDebug("feathers-s3:service")

type S3Credentials = {
  accessKeyId?: string
  secretAccessKey?: string
}

export interface PresignurlServiceOptions {
  s3Client: {
    // Optional: the API can run without S3 credentials, and putObject reports it clearly
    credentials?: S3Credentials
    // endpoint,
    region: string
    prefix?: string
    // AWS SDK v3 always signs with v4. This is checked to catch old config, not passed on.
    signatureVersion: string
    bucket: string
  }
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class PresignurlService {
  credentials?: S3Credentials
  s3Client: S3Client
  bucket: string
  delimiter: string
  prefix?: string

  constructor(public options: PresignurlServiceOptions) {
    if (!options) {
      throw new Error("feathers-s3:constructor: `options` must be provided")
    }

    const { signatureVersion, credentials } = options.s3Client
    this.credentials = credentials
    if (signatureVersion !== "v4") {
      throw new Error(
        "feathers-s3:constructor: `options.s3Client.signatureVersion` must be provided and equal to `v4`"
      )
    }
    this.s3Client = new S3Client({
      region: options.s3Client.region,
      // Left out when incomplete; putObject refuses to sign without both values anyway
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
    this.delimiter = "/"
    // Check for optional prefix
    this.prefix = options.s3Client.prefix
  }

  async putObject(data: PresignurlData): Promise<Presignurl> {
    if (!data.id) throw new BadRequest('create: missing "data.id" parameter')
    if (!data.path) throw new BadRequest('create: missing "data.path" paramater')
    debug(`method 'putOject' called with 'id': ${data.id} and 'path': ${data.path}`)

    // Checked per request rather than at startup, so the API (and its tests) can still run
    // without S3 credentials. Without this check the AWS SDK fails with a vague
    // "Resolved credential object is not valid", or signs with an empty secret.
    if (!this.credentials?.accessKeyId || !this.credentials?.secretAccessKey) {
      throw new GeneralError(
        "S3 credentials are not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY."
      )
    }

    const commandParams = {
      Key: this.getKey(data.id, data.path),
      Bucket: this.bucket,
    }

    const signedUrl = await this.getPresignedUrl(commandParams)
    return {
      id: data.id,
      signedUrl,
    }
  }

  getKey(id: string, path: string) {
    return this.prefix ? this.prefix + this.delimiter + path + this.delimiter + id : id
  }

  async getPresignedUrl(commandParams: PutObjectCommandInput) {
    const command = new PutObjectCommand(commandParams)
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
