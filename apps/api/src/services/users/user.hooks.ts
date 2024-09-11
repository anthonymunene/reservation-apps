import { HookContext } from "../../declarations"

export const createProfile = async (context: HookContext) => {
  const { result } = context

  await context.app.service("profiles").create({
    bio: "insert bio",
    userId: result.id,
  })
}
