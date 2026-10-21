import { test, expect, type Page } from '@playwright/test';
import { createTestUser, deleteTestUser, logInThroughPage, type TestUser } from './helpers';

// A 1x1 transparent PNG
const tinyPng = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082',
  'hex'
);

// Stub S3 so the test never writes to the real bucket. The presign request gets a fake signed
// URL, and the upload to that URL always succeeds. Saving the picture on the profile still goes
// through the real API.
const stubS3 = async (page: Page, presignStatus = 200) => {
  await page.route('**/presignurl', async route => {
    // Like the real API, refuse a request that doesn't carry the login token
    const authorization = route.request().headers()['authorization'] ?? '';
    if (!authorization.startsWith('Bearer ')) {
      await route.fulfill({ status: 401, json: { name: 'NotAuthenticated', code: 401 } });
      return;
    }
    if (presignStatus !== 200) {
      await route.fulfill({ status: presignStatus, json: { success: false } });
      return;
    }
    const { id } = route.request().postDataJSON();
    await route.fulfill({ json: { id, signedUrl: `https://s3-stub.test/users/${id}` } });
  });
  await page.route('https://s3-stub.test/**', route => route.fulfill({ status: 200 }));
};

// In dev mode Vite compiles each chunk the first time it's used, so the first upload on a cold
// server can take longer than Playwright's default 5 second wait
const STATUS_TIMEOUT = 15_000;

const uploadPicture = async (page: Page) => {
  await page.locator('input[type=file]').setInputFiles({
    name: 'avatar.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });
  await page.getByRole('button', { name: 'Upload file' }).click();
};

test.describe('profile picture', () => {
  let user: TestUser;

  // Each run uses its own user, so it never changes the seeded users' pictures
  test.beforeEach(async ({ request }) => {
    user = await createTestUser(request);
  });

  test.afterEach(async ({ request }) => {
    await deleteTestUser(request, user);
  });

  test('uploading a picture shows it on the profile and keeps it after a reload', async ({ page }) => {
    await stubS3(page);
    // Logging in lands on the user's own page
    await logInThroughPage(page, user.email);
    await expect(page).toHaveURL(new RegExp(`/users/${user.id}/$`));

    const picture = page.getByTestId('profile-picture');
    await expect(picture).toHaveAttribute('src', /unsplash/); // placeholder, no picture yet

    await uploadPicture(page);

    await expect(page.getByTestId('upload-status')).toHaveText(
      'Your profile picture has been updated.',
      { timeout: STATUS_TIMEOUT }
    );
    // Stored under a unique name that starts with the user's id
    const savedName = new RegExp(`/users/${user.id}-[0-9a-f-]+\\.png$`);
    await expect(picture).toHaveAttribute('src', savedName);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('profile-picture')).toHaveAttribute('src', savedName);
  });

  test('a failed upload shows an error and keeps the old picture', async ({ page }) => {
    await stubS3(page, 500);
    await logInThroughPage(page, user.email);
    await expect(page).toHaveURL(new RegExp(`/users/${user.id}/$`));

    await uploadPicture(page);

    await expect(page.getByTestId('upload-status')).toHaveText(
      'Your profile picture could not be updated. Please try again.',
      { timeout: STATUS_TIMEOUT }
    );
    await expect(page.getByTestId('profile-picture')).toHaveAttribute('src', /unsplash/);
  });

  test("only shows the upload controls on the user's own page", async ({ page, request }) => {
    // Logged out: no upload controls
    await page.goto(`/users/${user.id}/`, { waitUntil: 'networkidle' });
    await expect(page.getByRole('link', { name: 'Log in' })).toBeVisible();
    await expect(page.getByTestId('upload-section')).toHaveCount(0);

    // Logged in as someone else: still no upload controls on this page
    const someoneElse = await createTestUser(request);
    try {
      await logInThroughPage(page, someoneElse.email);
      await expect(page.getByTestId('signed-in-as')).toBeVisible();
      await page.goto(`/users/${user.id}/`, { waitUntil: 'networkidle' });
      await expect(page.getByTestId('signed-in-as')).toBeVisible();
      await expect(page.getByTestId('upload-section')).toHaveCount(0);
    } finally {
      await deleteTestUser(request, someoneElse);
    }
  });
});
