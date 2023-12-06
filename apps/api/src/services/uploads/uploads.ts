// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
//@ts-nocheck

import type { Application } from '../../declarations';
import { uploadsPath, uploadsMethods } from './uploads.shared';

import { Service } from '../../utils/s3/lib';

// A configure function that registers the service and its hooks via `app.configure`
export const uploads = async (app: Application) => {
  const S3Options = {};
  // const UploadsService = S3.Service;
  // Register our service on the Feathers application
  app.use(uploadsPath, new Service(S3Options), {
    // A list of all methods this service exposes externally
    methods: uploadsMethods,
    // You can add additional custom events to be sent to clients here
    // events: [],
  });
};
