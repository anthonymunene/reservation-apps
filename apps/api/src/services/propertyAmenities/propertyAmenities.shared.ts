// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from "@feathersjs/feathers"
import type { ClientApplication } from "../../client"
import type {
  PropertyAmenities,
  PropertyAmenitiesData,
  PropertyAmenitiesPatch,
  PropertyAmenitiesQuery,
  PropertyAmenitiesService,
} from "./propertyAmenities.class"

export type { PropertyAmenities, PropertyAmenitiesData, PropertyAmenitiesPatch, PropertyAmenitiesQuery }

export type PropertyAmenitiesClientService = Pick<
  PropertyAmenitiesService<Params<PropertyAmenitiesQuery>>,
  (typeof propertyAmenitiesMethods)[number]
>

export const propertyAmenitiesPath = "propertyamenities"

export const propertyAmenitiesMethods = ["find", "get", "create", "patch", "remove"] as const

export const propertyAmenitiesClient = (client: ClientApplication) => {
  const connection = client.get("connection")

  client.use(propertyAmenitiesPath, connection.service(propertyAmenitiesPath), {
    methods: propertyAmenitiesMethods,
  })
}

// Add this service to the client service type index
declare module "../../client" {
  interface ServiceTypes {
    [propertyAmenitiesPath]: PropertyAmenitiesClientService
  }
}
