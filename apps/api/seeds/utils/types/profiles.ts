import type { Profiles } from "@services/profiles/profiles.schema"
import { DatabaseDependency } from "@seeds/utils/types/shared"
import { UserDataGenerator } from "@seeds/utils/types/users"

export type ProfilesId = Pick<Profiles, "id">
export type ProfilesData = Pick<
  Profiles,
  "id" | "userId" | "firstName" | "surname" | "bio" | "defaultPic"
>

export type UserProfileDependencies = DatabaseDependency & {
  dataGenerator: UserDataGenerator["generateProfile"]
}
