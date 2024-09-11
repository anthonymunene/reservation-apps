// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
// import type { Uploads, UploadsData, UploadsPatch, UploadsQuery, UploadsService } from './uploads.class';

// export type { Uploads, UploadsData, UploadsPatch, UploadsQuery };

// export type UploadsClientService = Pick<UploadsService<Params<UploadsQuery>>, (typeof uploadsMethods)[number]>;

export const uploadsPath = "uploads"

export const uploadsMethods = [
  "create",
  // 'get',
  "find",
  // 'remove',
  "createMultipartUpload",
  "completeMultipartUpload",
  "uploadPart",
  "putObject",
] as const

// export const uploadsClient = (client: ClientApplication) => {
//   const connection = client.get('connection');

//   client.use(uploadsPath, connection.service(uploadsPath), {
//     methods: uploadsMethods,
//   });
// };

// Add this service to the client service type index
// declare module '../../client' {
//   interface ServiceTypes {
//     [uploadsPath]: UploadsClientService;
//   }
// }
