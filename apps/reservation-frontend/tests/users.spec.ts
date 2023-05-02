import { test, expect } from '@playwright/test';

test.describe('user', () => {
  let form;
  let email;
  let password;
  let userList;
  test.beforeEach(async ({ page }) => {
    await page.goto('/users');
    form = page.locator('#add-user');
    email = form.getByTestId('email');
    password = form.getByTestId('password');
    userList = page.locator('#users:list');
  });
  test.afterEach(async ({ page }) => {
    form = null;
    email = null;
    password = null;
    userList = null;
  });

  test('adding a user ', async ({ page }) => {
    await page.getByTestId('email').fill('mail.com');
    await page.getByTestId('password').fill('password');
    await expect(await email.inputValue()).toContain('mail.com');
    await expect(await password.inputValue()).toContain('password');
  });
});
