// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from "@feathersjs/feathers"
import type { ClientApplication } from "../../client"
import type {
  Profiles,
  ProfilesData,
  ProfilesPatch,
  ProfilesQuery,
  ProfilesService,
} from "./profiles.class"

export type { Profiles, ProfilesData, ProfilesPatch, ProfilesQuery }

export type ProfilesClientService = Pick<
  ProfilesService<Params<ProfilesQuery>>,
  (typeof profilesMethods)[number]
>

export const profilesPath = "profiles"

export const profilesMethods = ["find", "get", "create", "patch", "remove"] as const

export const profilesClient = (client: ClientApplication) => {
  const connection = client.get("connection")

  client.use(profilesPath, connection.service(profilesPath), {
    methods: profilesMethods,
  })
}

// Add this service to the client service type index
declare module "../../client" {
  interface ServiceTypes {
    [profilesPath]: ProfilesClientService
  }
}
