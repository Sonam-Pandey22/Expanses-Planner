import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  use: {
    baseURL: process.env.TEST_BASE_URL || 'http://localhost:3000',
    channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome',
    headless: true,
    reducedMotion: 'reduce',
    viewport: { width: 1440, height: 1100 },
    screenshot: 'only-on-failure',
  },
});
