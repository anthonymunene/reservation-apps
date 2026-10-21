import { createContextId, useContext } from "@builder.io/qwik"
import { api } from "~/client"

/**
 * Who is logged in, shared across the app through Qwik context.
 *
 * Logging in only ever happens in the browser. The `api` client in src/client.tsx is one shared
 * instance, and on the server it would keep the token in memory shared by every visitor's
 * request. In the browser, the Feathers authentication client saves the token in localStorage
 * and adds it to that browser's own API requests.
 */
export type AuthUser = { id: string; email: string }

export type AuthState = {
  user: AuthUser | null
  // False until the browser has checked for a saved session, so pages don't flash "logged out"
  checked: boolean
}

export const AuthContext = createContextId<AuthState>("auth")

export const useAuth = () => useContext(AuthContext)

const toAuthUser = (user: { id: string; email: string }): AuthUser => ({
  id: user.id,
  email: user.email,
})

/** Logs in with an email and password. Throws NotAuthenticated (code 401) if they're wrong. */
export const logIn = async (email: string, password: string) => {
  const result = await api.authenticate({ strategy: "local", email, password })
  return toAuthUser(result.user)
}

/** Restores the session from the token saved by an earlier login, or returns null. */
export const restoreSession = async () => {
  try {
    const result = await api.reAuthenticate()
    return toAuthUser(result.user)
  } catch {
    // No saved token, or it has expired or been rejected
    return null
  }
}

/** Logs out on the API and forgets the saved token. */
export const logOut = async () => {
  await api.logout()
}

/** True when an error means "wrong email or password" rather than something else going wrong. */
export const isLoginRejected = (error: unknown) =>
  typeof error === "object" && error !== null && (error as { code?: number }).code === 401
