import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.BASE_URL;

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['line']],
  use: {
    baseURL: liveBaseUrl || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: liveBaseUrl ? undefined : {
    command: 'npm run build && npm run serve:test',
    url: 'http://127.0.0.1:4173/health',
    timeout: 240_000,
    reuseExistingServer: false,
  },
});
