import { test, expect, type Page } from "@playwright/test"

const API_URL = process.env.PUBLIC_API_URL ?? "http://localhost:3030"
const PASSWORD = "correct-horse-battery"

// Where the Feathers authentication client keeps the token in the browser
const TOKEN_KEY = "feathers-jwt"

const fillLogin = async (page: Page, email: string, password: string) => {
  const form = page.locator("#add-user")
  await form.getByTestId("email").fill(email)
  await form.getByTestId("password").fill(password)
  await form.getByRole("button", { name: "Sign in" }).click()
}

test.describe("logging in and out", () => {
  let userId: string
  let email: string

  // Each test uses its own user, created through the API so its password is hashed
  test.beforeEach(async ({ request }) => {
    email = `e2e-${crypto.randomUUID()}@example.test`
    const response = await request.post(`${API_URL}/users`, { data: { email, password: PASSWORD } })
    expect(response.ok()).toBeTruthy()
    userId = (await response.json()).id
  })

  test.afterEach(async ({ request }) => {
    await request.delete(`${API_URL}/users/${userId}`)
  })

  test("logs in, goes to the user's page, and shows who is signed in", async ({ page }) => {
    await page.goto("/login/", { waitUntil: "networkidle" })

    await fillLogin(page, email, PASSWORD)

    await expect(page).toHaveURL(new RegExp(`/users/${userId}/$`))
    await expect(page.getByTestId("signed-in-as")).toHaveText(`Signed in as ${email}`)
    expect(await page.evaluate(key => localStorage.getItem(key), TOKEN_KEY)).toBeTruthy()
  })

  test("stays logged in after a reload", async ({ page }) => {
    await page.goto("/login/", { waitUntil: "networkidle" })
    await fillLogin(page, email, PASSWORD)
    await expect(page.getByTestId("signed-in-as")).toBeVisible()

    await page.reload({ waitUntil: "networkidle" })

    await expect(page.getByTestId("signed-in-as")).toHaveText(`Signed in as ${email}`)
  })

  test("logs out and forgets the token", async ({ page }) => {
    await page.goto("/login/", { waitUntil: "networkidle" })
    await fillLogin(page, email, PASSWORD)
    await expect(page.getByTestId("signed-in-as")).toBeVisible()

    await page.getByRole("button", { name: "Log out" }).click()

    await expect(page).toHaveURL(/\/login\/$/)
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible()
    expect(await page.evaluate(key => localStorage.getItem(key), TOKEN_KEY)).toBeNull()

    // And it stays logged out after a reload
    await page.reload({ waitUntil: "networkidle" })
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible()
  })

  test("doesn't share one visitor's session with another", async ({ page, browser }) => {
    await page.goto("/login/", { waitUntil: "networkidle" })
    await fillLogin(page, email, PASSWORD)
    await expect(page.getByTestId("signed-in-as")).toBeVisible()

    // A second, separate browser visiting the same pages must not be logged in. This would fail
    // if the login ever happened in server-side code, where the api client is shared.
    const otherVisitor = await browser.newContext()
    const otherPage = await otherVisitor.newPage()
    await otherPage.goto(`/users/${userId}/`, { waitUntil: "networkidle" })
    await expect(otherPage.getByRole("link", { name: "Log in" })).toBeVisible()
    await expect(otherPage.getByTestId("signed-in-as")).toHaveCount(0)
    await otherVisitor.close()
  })

  test("shows an error for a wrong password and stays on the login page", async ({ page }) => {
    await page.goto("/login/", { waitUntil: "networkidle" })

    await fillLogin(page, email, "wrong-password")

    await expect(page.getByTestId("login-error")).toHaveText(
      "That email and password don't match an account."
    )
    await expect(page).toHaveURL(/\/login\/$/)
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible()
  })
})
