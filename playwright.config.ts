/**
 * 🎭 PLAYWRIGHT E2E TEST CONFIGURATION
 * 
 * Purpose: AI-assisted end-to-end testing for booking + chat + notification flow
 * Severity: SEV-0 (Infrastructure-critical)
 * 
 * Test Coverage:
 * - User creates booking
 * - Therapist receives notification (audio + vibration)
 * - Chat window opens with system messages
 * - Countdown timer updates every second
 * - Admin sees booking + commission in dashboard
 * - All 8 go/no-go checks verified
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e-tests',
  
  // Test timeout: 60 seconds per test (booking flow can be slow)
  timeout: 60000,
  
  // Expect timeout: 10 seconds for assertions
  expect: {
    timeout: 10000
  },
  
  // Run tests in parallel
  fullyParallel: false, // Run sequentially to avoid race conditions
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : 1,
  
  // Reporter to use
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results/e2e-test-report.json' }],
    ['list']
  ],
  
  // Shared settings for all projects
  use: {
    // Base URL for tests
    baseURL: 'http://localhost:3000',
    
    // Collect trace on failure
    trace: 'on-first-retry',
    
    // Screenshot on failure
    screenshot: 'only-on-failure',
    
    // Video on failure
    video: 'retain-on-failure',
    
    // Emulate timezone
    timezoneId: 'Asia/Jakarta',
    
    // Emulate locale
    locale: 'id-ID',
  },
  
  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Grant permissions for notifications and geolocation
        permissions: ['notifications', 'geolocation'],
        // Allow audio autoplay
        launchOptions: {
          args: ['--autoplay-policy=no-user-gesture-required']
        }
      },
    },
  ],
  
  // Run local dev server before starting tests
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start
  },
});
