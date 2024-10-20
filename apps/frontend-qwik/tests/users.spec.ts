import { test, expect } from '@playwright/test';

test.describe('users', () => {
  let form;
  let email;
  let password;
  let userList;
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
    form = page.locator('#add-user');
    email = form.getByTestId('email');
    password = form.getByTestId('password');
    userList = page.locator('#users-list');
  });
  test.afterEach(async ({ page }) => {
    form = null;
    email = null;
    password = null;
    userList = null;
  });

  test('list users ', async ({ page }) => {

    //not returning the count
    const userListcount = await page.getByRole('listitem').count();
    await expect(await page.getByRole('listitem').count()).toBeGreaterThan(1)
  });
});
