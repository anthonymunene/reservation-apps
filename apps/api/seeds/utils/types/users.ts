import type { Users } from "@services/users/users.schema"
import { ProfilesData } from "@seeds/utils/types/profiles"
import { DatabaseDependency } from "@seeds/utils/types/shared"

export type UserId = Pick<Users, "id">
export type UserAccount = Pick<Users, "id" | "email" | "password">
export type UserDataGenerator = {
  generateUserAccount: () => UserAccount
  // eslint-disable-next-line no-unused-vars
  generateProfile: (userId: string) => Omit<ProfilesData, "defaultPic">
}

export type UserAccountDependencies = DatabaseDependency & {
  dataGenerator: UserDataGenerator["generateUserAccount"]
}
