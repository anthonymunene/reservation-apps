// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html

import type { ClientApplication } from "../../client"
import type { Presignurl, PresignurlData, PresignurlService } from "./presignurl.class"

export type { Presignurl, PresignurlData }

export type PresignurlClientService = Pick<PresignurlService, (typeof presignurlMethods)[number]>

export const presignurlPath = "presignurl"

export const presignurlMethods: Array<keyof PresignurlService> = ["putObject"]

export const presignurlClient = (client: ClientApplication) => {
  const connection = client.get("connection")

  client.use(presignurlPath, connection.service(presignurlPath), {
    methods: presignurlMethods,
  })
}

// Add this service to the client service type index
declare module "../../client" {
  interface ServiceTypes {
    [presignurlPath]: PresignurlClientService
  }
}
