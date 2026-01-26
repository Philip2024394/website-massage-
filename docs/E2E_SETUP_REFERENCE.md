# 🚀 Quick Reference - E2E Testing Setup

## ✅ One-Time Setup (Complete)

Run the setup verification script to install all dependencies:

### Windows (PowerShell)
```powershell
.\setup-e2e-tests.ps1
```

### Linux/Mac
```bash
chmod +x setup-e2e-tests.sh
./setup-e2e-tests.sh
```

## 📋 What Gets Installed

The setup script automatically:
- ✅ Installs Node.js dependencies (`pnpm install`)
- ✅ Installs Playwright browsers (`npx playwright install chromium`)
- ✅ Verifies Appwrite configuration
- ✅ Checks E2E test URLs
- ✅ Validates audio notification files
- ✅ Checks test files exist
- ✅ Verifies Playwright config

## 🎯 Quick Start Guide

### 1. First Time Setup
```bash
# Run setup script
.\setup-e2e-tests.ps1

# Expected output:
# ✅ ALL CHECKS PASSED - Ready to run E2E tests!
```

### 2. Start Backend Server
```bash
pnpm dev
```

### 3. Run E2E Tests
```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm test:e2e e2e-tests/flows/ai-human-multi-user-workflow.spec.ts

# Run with UI (interactive mode)
pnpm test:e2e:ui

# Run specific scenario
pnpm test:e2e --grep "notifications"

# Debug mode
pnpm test:e2e:debug
```

### 4. View Test Reports
```bash
# View last test report
pnpm test:e2e:report

# Generate executive summary
pnpm exec ts-node e2e-tests/scripts/generate-executive-report.ts
```

## 🔧 Manual Dependency Installation

If you prefer to install manually:

### 1. Install Node Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Install Playwright Browsers
```bash
npx playwright install
# or install specific browser
npx playwright install chromium
```

### 3. Install System Dependencies (Linux/CI)
```bash
npx playwright install-deps chromium
```

## 📊 Dependency Checklist

### Required ✅
- [x] Node.js 18+ (`node --version`)
- [x] pnpm or npm (`pnpm --version`)
- [x] @playwright/test (`npm list @playwright/test`)
- [x] Playwright browsers installed
- [x] Appwrite endpoint configured in `.env`

### Recommended ⚡
- [x] Backend server running (`pnpm dev`)
- [x] E2E test URLs in `.env` (BASE_URL, THERAPIST_URL, ADMIN_URL)
- [x] Audio notification file (`public/sounds/booking-notification.mp3`)

### Optional 🎨
- [ ] Slack webhook for notifications
- [ ] Email SMTP for alerts
- [ ] CI/CD secrets configured

## 🎵 Audio File Setup

### Quick Solution: Silent Audio
If you don't have audio files yet, create a silent MP3:

```bash
# Create sounds directory
mkdir -p public/sounds

# Generate 1-second silent audio with ffmpeg
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -q:a 9 -acodec libmp3lame public/sounds/booking-notification.mp3
```

### Or Download Sample
```bash
# Download free notification sound
curl -o public/sounds/booking-notification.mp3 https://freesound.org/data/previews/XXX/XXX_sample.mp3
```

### Or Skip Audio (Tests Will Warn But Pass)
The NotificationValidator gracefully handles missing audio files. Tests will show:
```
⚠️ Audio notification not detected (may not be implemented)
```

## 🌐 Backend Server Configuration

Your backend must be running for E2E tests to work:

### Development
```bash
# Terminal 1: Start backend
pnpm dev

# Terminal 2: Run E2E tests
pnpm test:e2e
```

### Custom URLs
Update `.env` if your servers run on different ports:

```bash
BASE_URL=http://localhost:5173
THERAPIST_URL=http://localhost:5174
ADMIN_URL=http://localhost:5175
```

## 🚨 Troubleshooting

### "Executable doesn't exist" Error
```bash
# Reinstall Playwright browsers
npx playwright install --force
```

### "Cannot find module @playwright/test"
```bash
# Reinstall dependencies
pnpm install
```

### "Connection refused" Error
```bash
# Start backend server
pnpm dev

# Or update BASE_URL in .env to match your server
```

### Audio Tests Failing
```bash
# Check audio file exists
ls -l public/sounds/booking-notification.mp3

# Or create silent audio (see Audio File Setup above)
```

### TypeScript Errors
```bash
# Regenerate types
pnpm exec tsc --noEmit
```

## 📈 CI/CD Setup

For GitHub Actions, the workflow automatically:
- ✅ Installs dependencies
- ✅ Installs Playwright browsers
- ✅ Runs E2E tests
- ✅ Generates reports
- ✅ Comments on PRs with results

No additional setup needed! Just push to `main` or `staging`.

## 🎓 Next Steps

Once setup is complete:

1. **Run tests locally**: `pnpm test:e2e`
2. **Integrate with CI/CD**: Push to trigger GitHub Actions
3. **Add to pre-commit**: Prevent broken code from being committed
4. **Monitor in production**: Schedule nightly E2E test runs

## 📚 Additional Resources

- [Playwright Documentation](https://playwright.dev)
- [AI E2E System README](./e2e-tests/AI_HUMAN_E2E_SYSTEM_README.md)
- [Deployment Guide](./AI_HUMAN_ORCHESTRATOR_DEPLOYMENT_GUIDE.md)
- [Quick Start](./QUICK_START_DEPLOYMENT.md)

---

## ✅ Verification Complete!

After running `.\setup-e2e-tests.ps1`, you should see:

```
✅ ALL CHECKS PASSED - Ready to run E2E tests!

🚀 Next steps:
   1. Start backend: pnpm dev
   2. Run tests: pnpm test:e2e
   3. View report: pnpm test:e2e:report
```

**Your AI Human E2E Testing System is ready!** 🎉
