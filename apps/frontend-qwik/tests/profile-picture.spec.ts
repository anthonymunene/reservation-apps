import { test, expect, type Page } from '@playwright/test';

const API_URL = process.env.PUBLIC_API_URL ?? 'http://localhost:3030';

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
  let userId: string;

  // Each run uses its own user, so it never changes the seeded users' pictures
  test.beforeEach(async ({ request }) => {
    const response = await request.post(`${API_URL}/users`, {
      // A random id, not a timestamp: parallel workers can start in the same millisecond
      data: { email: `e2e-${crypto.randomUUID()}@example.test`, password: 'longenough1' },
    });
    expect(response.ok()).toBeTruthy();
    userId = (await response.json()).id;
  });

  test.afterEach(async ({ request }) => {
    // Deleting the user also deletes their profile
    await request.delete(`${API_URL}/users/${userId}`);
  });

  test('uploading a picture shows it on the profile and keeps it after a reload', async ({ page }) => {
    await stubS3(page);
    await page.goto(`/users/${userId}/`, { waitUntil: 'networkidle' });

    const picture = page.getByTestId('profile-picture');
    await expect(picture).toHaveAttribute('src', /unsplash/); // placeholder, no picture yet

    await uploadPicture(page);

    await expect(page.getByTestId('upload-status')).toHaveText(
      'Your profile picture has been updated.',
      { timeout: STATUS_TIMEOUT }
    );
    // Stored under a unique name that starts with the user's id
    const savedName = new RegExp(`/users/${userId}-[0-9a-f-]+\\.png$`);
    await expect(picture).toHaveAttribute('src', savedName);

    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByTestId('profile-picture')).toHaveAttribute('src', savedName);
  });

  test('a failed upload shows an error and keeps the old picture', async ({ page }) => {
    await stubS3(page, 500);
    await page.goto(`/users/${userId}/`, { waitUntil: 'networkidle' });

    await uploadPicture(page);

    await expect(page.getByTestId('upload-status')).toHaveText(
      'Your profile picture could not be updated. Please try again.',
      { timeout: STATUS_TIMEOUT }
    );
    await expect(page.getByTestId('profile-picture')).toHaveAttribute('src', /unsplash/);
  });
});
