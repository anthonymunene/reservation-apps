import { test, expect } from '@playwright/test';

test('user', async ({ page }) => {
  await page.goto('/users');

  // Expect a title "to contain" a substring.
  // await expect(page).toHaveTitle(/Qwik/);

  // create a locator
  const form = page.locator('#add-user');
  const userList = page.locator('#users:list')

  // Expect an attribute "to be strictly equal" to the value.
  await expect(form).toBeDefined();
  await expect(userList).toBeDefined();
});
