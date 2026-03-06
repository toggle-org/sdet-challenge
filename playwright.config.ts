import { defineConfig, devices } from '@playwright/test';

const apiBaseURL = process.env.API_BASE_URL || 'http://localhost:3001/api';
const uiBaseURL = process.env.UI_BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['html', { open: 'never', outputFolder: process.env.PLAYWRIGHT_REPORT_DIR || 'e2e/playwright-report' }],
    ['list'],
  ],
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'ui',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: uiBaseURL,
      },
      testMatch: /ui\/.*\.spec\.ts/,
    },
    {
      name: 'api',
      use: {
        baseURL: apiBaseURL,
        extraHTTPHeaders: { 'Content-Type': 'application/json' },
      },
      testMatch: /api\/.*\.spec\.ts/,
    },
  ],
});
