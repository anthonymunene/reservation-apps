import { test, expect, type Locator } from '@playwright/test';

test.describe('login', () => {
  let form: Locator;
  let email: Locator;
  let password: Locator;
  let emailError: Locator;
  let passwordError: Locator;

  test.beforeEach(async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    form = page.locator('#add-user');
    email = form.getByTestId('email');
    password = form.getByTestId('password');
    // The error elements are always in the page and are empty when there is no error
    emailError = page.locator('#email-error');
    passwordError = page.locator('#password-error');
  });

  const submit = () => form.getByRole('button', { name: 'Sign in' }).click();

  test('asks for both fields when submitted empty', async () => {
    await submit();

    await expect(emailError).toHaveText('Please enter your email.');
    await expect(passwordError).toHaveText('Please enter your password.');
  });

  test('explains what is wrong with badly formatted values', async () => {
    await email.fill('mail.com');
    await password.fill('123');
    await submit();

    await expect(emailError).toHaveText('The email address is badly formatted.');
    await expect(passwordError).toHaveText('Your password must have 8 characters or more.');
  });

  test('clears the errors once the values are valid', async () => {
    await email.fill('mail.com');
    await password.fill('123');
    await submit();
    await expect(emailError).not.toBeEmpty();
    await expect(passwordError).not.toBeEmpty();

    // After a failed submit the form re-checks each field as it changes
    await email.fill('someone@example.com');
    await password.fill('longenough1');

    await expect(emailError).toBeEmpty();
    await expect(passwordError).toBeEmpty();
  });
});
