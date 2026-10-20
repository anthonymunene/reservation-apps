import type { PlaywrightTestConfig } from '@playwright/test';
import { devices, defineConfig } from '@playwright/test';
import * as dotenv from 'dotenv';

dotenv.config();

// Where the frontend runs during e2e tests. Defaults to the dev server (http://localhost:5173),
// which is also the only origin the S3 bucket's CORS rules allow. Set PUBLIC_BASE_URL and PORT
// to point the tests somewhere else.
const PORT = process.env.PORT ?? '5173';
const BASE_URL = `${process.env.PUBLIC_BASE_URL ?? 'http://localhost'}:${PORT}`;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig = {
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    actionTimeout: 0,
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    // {
    //   name: 'webkit',
    //   use: {
    //     ...devices['Desktop Safari'],
    //   },
    // },
  ],

  // Uses the dev server if it's already running. Otherwise starts it, which waits for the API on
  // port 3030, because the pages load their data from it.
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
};
export default defineConfig(config);
