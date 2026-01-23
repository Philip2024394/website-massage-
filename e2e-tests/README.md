# 🎭 E2E Testing Setup Guide

## Overview

AI-assisted end-to-end testing for the **booking + chat + notification** flow using Playwright.

**Severity:** SEV-0 (Infrastructure-critical)

## Test Coverage

### 8 Critical Checks (Go/No-Go Verification)

1. ✅ **Chat Window Opens** - System messages, therapist/client names, booking status
2. ✅ **Countdown Timer** - Single source of truth from database, updates every second
3. ✅ **Notifications** - Document creation, realtime subscription, browser push, badge
4. ✅ **Therapist Dashboard** - Live state updates without refresh
5. ✅ **Admin Dashboard** - Full event trace visible
6. ✅ **Failure Path** - Bookings survive notification failures
7. ✅ **Timer Expiry** - Clean timeout handling, logged reasons
8. ✅ **Money Safety** - Double acceptance, timeout acceptance, cancellation blocked

## Installation

```bash
# Install Playwright
pnpm add -D @playwright/test

# Install browsers
pnpm exec playwright install chromium
```

## Test Accounts

Create 3 test accounts in Appwrite:

1. **user@test.com** (Customer)
   - Password: `Test123456!`
   - Role: customer

2. **therapist@test.com** (Service Provider)
   - Password: `Test123456!`
   - Role: therapist
   - Requires therapist profile in database

3. **admin@test.com** (Platform Admin)
   - Password: `Test123456!`
   - Role: admin

## Test Instrumentation

The test suite injects hooks to detect:

```typescript
window.TEST_EVENTS = {
  audioPlayed: [],        // audio.play() invocations
  vibrateCalled: [],      // navigator.vibrate() calls
  notificationsShown: [], // Browser notifications
  realtimeEvents: []      // Real-time subscription events
}
```

## Running Tests

```bash
# Run all E2E tests
pnpm exec playwright test

# Run specific test file
pnpm exec playwright test e2e-tests/booking-flow.spec.ts

# Run tests in UI mode (interactive)
pnpm exec playwright test --ui

# Run tests with headed browser (visible)
pnpm exec playwright test --headed

# Generate HTML report
pnpm exec playwright show-report
```

## Test Structure

```
e2e-tests/
├── booking-flow.spec.ts          # Main booking flow tests
├── fixtures/
│   ├── auth-utils.ts             # Authentication utilities
│   ├── test-instrumentation.ts   # Audio/vibration hooks
│   └── report-generator.ts       # JSON report generation
└── test-results/
    └── e2e-test-report.json      # JSON test report
```

## Test Reports

### JSON Report

Located at: `test-results/e2e-test-report.json`

Contains:
- Pass/fail status per test
- Test duration
- Error messages
- Screenshot paths
- Audio/vibration event counts

### HTML Report

Generated at: `playwright-report/index.html`

View with:
```bash
pnpm exec playwright show-report
```

### Screenshots

Automatically captured on test failure:

Location: `test-results/booking-flow-*/test-failed-*.png`

## Debugging Tests

### 1. Run in UI Mode
```bash
pnpm exec playwright test --ui
```

### 2. Run with Browser Visible
```bash
pnpm exec playwright test --headed
```

### 3. Pause Execution
Add `await page.pause()` in test code to debug interactively.

### 4. Console Logs
All test logs visible in terminal output with `[TEST]` prefix.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Install Playwright browsers
        run: pnpm exec playwright install chromium
      
      - name: Run E2E tests
        run: pnpm exec playwright test
        env:
          CI: true
      
      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Troubleshooting

### Tests Fail to Login

**Issue:** Test accounts don't exist in Appwrite

**Solution:** Create test accounts manually or run setup script:
```typescript
import { setupTestAccounts } from './e2e-tests/fixtures/auth-utils';
await setupTestAccounts();
```

### Audio Events Not Detected

**Issue:** Autoplay policy blocking audio

**Solution:** Tests use `--autoplay-policy=no-user-gesture-required` flag (already configured)

### Timeouts on Slow CI

**Issue:** Tests timeout on CI servers

**Solution:** Increase timeout in `playwright.config.ts`:
```typescript
timeout: 120000, // 2 minutes
```

### Real-time Updates Not Working

**Issue:** Appwrite subscriptions not firing

**Solution:** 
1. Verify Appwrite API endpoint is accessible
2. Check network tab for WebSocket connections
3. Ensure test accounts have proper permissions

## Best Practices

1. **Run tests sequentially** - Avoid race conditions with shared database
2. **Clean up test data** - Delete test bookings after each run
3. **Use test accounts only** - Never use production accounts
4. **Monitor test duration** - Tests should complete in <2 minutes
5. **Review screenshots** - Check failure screenshots for visual bugs

## Support

For issues or questions:
1. Check `playwright-report/index.html` for detailed logs
2. Review `test-results/e2e-test-report.json` for error details
3. Run tests with `--headed` flag to see browser interactions

---

**Status:** Ready for execution  
**Last Updated:** January 22, 2026
