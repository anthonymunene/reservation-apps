import { expect, type APIRequestContext, type Page } from "@playwright/test"

export const API_URL = process.env.PUBLIC_API_URL ?? "http://localhost:3030"
export const PASSWORD = "correct-horse-battery"

export type TestUser = { id: string; email: string; token: string }

/**
 * Creates a throwaway user through the API (so the password is hashed) and logs in as them over
 * the API, to get a token for cleaning up afterwards.
 */
export const createTestUser = async (request: APIRequestContext): Promise<TestUser> => {
  // A random id, not a timestamp: parallel workers can start in the same millisecond
  const email = `e2e-${crypto.randomUUID()}@example.test`
  const created = await request.post(`${API_URL}/users`, { data: { email, password: PASSWORD } })
  expect(created.ok()).toBeTruthy()

  const login = await request.post(`${API_URL}/authentication`, {
    data: { strategy: "local", email, password: PASSWORD },
  })
  expect(login.ok()).toBeTruthy()

  return { id: (await created.json()).id, email, token: (await login.json()).accessToken }
}

/** Deletes the user (and with it their profile). Only the user themselves is allowed to. */
export const deleteTestUser = async (request: APIRequestContext, user: TestUser) => {
  await request.delete(`${API_URL}/users/${user.id}`, {
    headers: { Authorization: `Bearer ${user.token}` },
  })
}

/** Logs in through the app's login page. */
export const logInThroughPage = async (page: Page, email: string, password = PASSWORD) => {
  await page.goto("/login/", { waitUntil: "networkidle" })
  const form = page.locator("#add-user")
  await form.getByTestId("email").fill(email)
  await form.getByTestId("password").fill(password)
  await form.getByRole("button", { name: "Sign in" }).click()
}
