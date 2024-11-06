// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from "@feathersjs/feathers"
import type { ClientApplication } from "../../client"
import type {
  PropertyTypes,
  PropertyTypesData,
  PropertyTypesPatch,
  PropertyTypesQuery,
  PropertyTypesService,
} from "./propertyTypes.class"

export type { PropertyTypes, PropertyTypesData, PropertyTypesPatch, PropertyTypesQuery }

export type PropertyTypesClientService = Pick<
  PropertyTypesService<Params<PropertyTypesQuery>>,
  (typeof propertyTypesMethods)[number]
>

export const propertyTypesPath = "propertytypes"

export const propertyTypesMethods = ["find", "get", "create", "patch", "remove"] as const

export const propertyTypesClient = (client: ClientApplication) => {
  const connection = client.get("connection")

  client.use(propertyTypesPath, connection.service(propertyTypesPath), {
    methods: propertyTypesMethods,
  })
}

// Add this service to the client service type index
declare module "../../client" {
  interface ServiceTypes {
    [propertyTypesPath]: PropertyTypesClientService
  }
}
