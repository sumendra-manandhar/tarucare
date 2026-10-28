import { defineConfig, devices } from '@playwright/test'

// End-to-end tests, written from each user's point of view (guest shopper, signed-in
// customer, owner, staff). Run with `npm run test:e2e`; see tests/e2e/README.md.
export default defineConfig({
  testDir: './tests/e2e',
  // All tests share one test shop that is reset before each test, so they run one at a time.
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4310',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    // Shoppers on phones: the guest journey again on a small screen.
    { name: 'mobile', use: { ...devices['Pixel 5'] }, testMatch: /guest\.spec\.js/ },
  ],
  webServer: {
    command: 'npm run build && node tests/e2e/test-server.mjs',
    url: 'http://localhost:4310/api/config',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
