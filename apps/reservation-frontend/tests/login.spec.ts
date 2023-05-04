import { test, expect } from '@playwright/test';

test.describe('login', () => {
  let form;
  let email;
  let password;
  test.beforeEach(async ({ page }) => {
    page.goto('/login');
    form = page.locator('#add-user');
    email = form.getByTestId('email');
    password = form.getByTestId('password');
  });
  test('with invalid fields', async ({ page }) => {
    await email.fill('mail.com');
    await password.fill('123');
    await expect(await page.locator('#email-error')).toBeDefined();
    await expect(await page.locator('#password-error')).toBeDefined();
  });
});
