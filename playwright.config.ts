import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium-mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: {
    command: 'npm run preview:e2e',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: true,
  },
});
