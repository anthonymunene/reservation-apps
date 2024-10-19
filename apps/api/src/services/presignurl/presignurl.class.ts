// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
// @ts-nocheck
import createDebug from "debug"
import type { Application } from "../../declarations"
import type { Presignurl, PresignurlData } from "./presignurl.schema"
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import _ from "lodash"
import { BadRequest } from "@feathersjs/errors"

export type { Presignurl, PresignurlData }
const debug = createDebug("feathers-s3:service")

export interface PresignurlServiceOptions {
  s3Client: {
    credentials: {
      accessKeyId: string
      secretAccessKey: string
    }
    // endpoint,
    region: string
    prefix: string
    signatureVersion: string
    bucket: string
  }
}

// This is a skeleton for a custom service class. Remove or add the methods you need here
export class PresignurlService {
  constructor(public options: PresignurlServiceOptions) {
    if (!options) {
      throw new Error("feathers-s3:constructor: `options` must be provided")
    }

    const signatureVersion = options.s3Client.signatureVersion

    const credentials = options.s3Client.credentials
    if (signatureVersion !== "v4") {
      throw new Error("feathers-s3:constructor: `options.s3Client.signatureVersion` must be provided and equal to `v4`")
    }
    this.s3Client = new S3Client({ region: options.s3Client.region, signatureVersion, credentials: { ...credentials } })
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

    const commandParams = {
      Key: this.getKey(data.id, data.path),
      Bucket: this.options.s3Client.bucket,
    }

    const signedUrl = await this.getPresignedUrl(commandParams)
    return {
      id: data.id,
      signedUrl,
    }
  }

  getKey(id, path) {
    return this.prefix ? this.prefix + this.delimiter + path + this.delimiter + id : id
  }

  async getPresignedUrl(commandParams) {
    const command = new PutObjectCommand(commandParams)
    return await getSignedUrl(this.s3Client, command, { expiresIn: 3600 })
  }
}

export const getOptions = (app: Application) => {
  return { app }
}
