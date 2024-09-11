//@ts-nocheck

import type { Application } from "../../declarations"

const S3Options = {
  s3Client: {
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION,
    signatureVersion: "v4",
  },
  bucket: process.env.S3_BUCKET,
  prefix: "feathers-s3-example",
}

// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#custom-services
// import type { Id, NullableId, Params, ServiceInterface } from '@feathersjs/feathers';

// import type { Application } from '../../declarations';
// import type { Uploads, UploadsData, UploadsPatch, UploadsQuery } from './uploads.schema';

// export type { Uploads, UploadsData, UploadsPatch, UploadsQuery };

// export interface UploadsServiceOptions {
//   app: Application;
// }

// export interface UploadsParams extends Params<UploadsQuery> {}

// // This is a skeleton for a custom service class. Remove or add the methods you need here
// export class UploadsService<ServiceParams extends UploadsParams = UploadsParams>
//   implements ServiceInterface<Uploads, UploadsData, ServiceParams, UploadsPatch>
// {
//   constructor(public options: UploadsServiceOptions) {}

//   // async find(_params?: ServiceParams): Promise<Uploads[]> {
//   //   return [];
//   // }

//   // async get(id: Id, _params?: ServiceParams): Promise<Uploads> {
//   //   return {
//   //     file: `A new message with ID: ${id}!`,
//   //   };
//   // }

//   // async create(data: UploadsData, params?: ServiceParams): Promise<Uploads>;
//   // async create(data: UploadsData[], params?: ServiceParams): Promise<Uploads[]>;
//   async create(file: UploadsData | UploadsData[], params?: ServiceParams): Promise<Uploads | Uploads[]> {
//     console.log(file);

//     return {};
//   }

//   // This method has to be added to the 'methods' option to make it available to clients
//   async createMultipartUpload(id: NullableId, data: UploadsData, _params?: ServiceParams): Promise<Uploads> {
//     return {
//       id: 0,
//       ...data,
//     };
//   }

//   async completeMultipartUpload(id: NullableId, data: UploadsPatch, _params?: ServiceParams): Promise<Uploads> {
//     return {
//       id: 0,
//       text: `Fallback for ${id}`,
//       ...data,
//     };
//   }

//   async uploadPart(id: NullableId, _params?: ServiceParams): Promise<Uploads> {
//     return {
//       id: 0,
//       text: 'removed',
//     };
//   }

//   async putObject(id: NullableId, _params?: ServiceParams): Promise<Uploads> {
//     return {
//       id: 0,
//       text: 'removed',
//     };
//   }
//   // async remove(id: NullableId, _params?: ServiceParams): Promise<Uploads> {
//   //   return {
//   //     id: 0,
//   //     text: 'removed',
//   //   };
//   // }
// }

export const getOptions = (app: Application) => {
  return { app, ...S3Options }
}
