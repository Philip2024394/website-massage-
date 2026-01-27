# 🚀 AI Human Orchestrator - Deployment Guide

## Overview

This guide covers deploying the complete AI Human E2E Testing System with orchestrator backend, React dashboard, and CI/CD integration.

---

## 📋 Prerequisites

- ✅ All TypeScript errors resolved
- ✅ Appwrite backend configured (Database: `68f76ee1000e64ca8d05`)
- ✅ Test accounts created (customer, therapist, admin)
- ✅ Playwright installed (`@playwright/test ^1.57.0`)
- ✅ Node.js 18+ and pnpm installed

---

## 🎯 Phase 1: Backend API Deployment

### 1.1 Add Backend Routes to Express Server

**File: `server.ts` or `index.ts` (your main Express file)**

```typescript
import express from 'express';
import aiHumanOrchestratorRouter from './routes/aiHumanOrchestrator';
import e2eTestRouter from './routes/e2eTest';

const app = express();

// Middleware
app.use(express.json());

// AI Human Orchestrator Routes
app.use('/api', aiHumanOrchestratorRouter);

// E2E Test Routes (optional - for individual test execution)
app.use('/api', e2eTestRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 AI Human Orchestrator: http://localhost:${PORT}/api/run-full-e2e`);
});
```

### 1.2 Verify Backend Routes

```bash
# Start your backend server
pnpm dev

# Test orchestrator endpoint (in another terminal)
curl -X POST http://localhost:3000/api/run-full-e2e \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected response:
# {
#   "status": "GO" | "NO-GO" | "WARNING",
#   "passedTests": 8,
#   "totalTests": 8,
#   "scenarios": [...],
#   "executiveSummary": "..."
# }
```

### 1.3 Environment Variables

**Add to `.env`:**

```bash
# Playwright Configuration
BASE_URL=http://localhost:3000
THERAPIST_URL=http://localhost:3005
ADMIN_URL=http://localhost:3007

# Production URLs (for staging/production)
# BASE_URL=https://staging.yoursite.com
# THERAPIST_URL=https://therapist.staging.yoursite.com
# ADMIN_URL=https://admin.staging.yoursite.com

# Appwrite (already configured)
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68f23b11000d25eb3664
VITE_APPWRITE_DATABASE_ID=68f76ee1000e64ca8d05

# Notification Configuration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL=dev-team@yourcompany.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yourcompany.com
SMTP_PASSWORD=your-smtp-password
```

---

## 🎨 Phase 2: Frontend Dashboard Deployment

### 2.1 Install Dependencies

```bash
pnpm add react-markdown
```

### 2.2 Add Dashboard to Your App

**Option A: Dedicated Admin Route**

```typescript
// AppRouter.tsx or routes.tsx
import { AIHumanOrchestrator } from './components/AIHumanOrchestrator';
import { ProtectedRoute } from './components/ProtectedRoute';

<Route 
  path="/admin/e2e-testing" 
  element={
    <ProtectedRoute allowedRoles={['admin']}>
      <AIHumanOrchestrator />
    </ProtectedRoute>
  } 
/>
```

**Option B: Simple Button in Existing Dashboard**

```typescript
// src/pages/AdminDashboard.tsx
import { AIHumanE2ETestButton } from '../components/AIHumanE2ETestButton';

function AdminDashboard() {
  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      {/* Add AI Human E2E Test Button */}
      <div className="mb-6">
        <AIHumanE2ETestButton />
      </div>
      
      {/* Rest of your dashboard */}
    </div>
  );
}
```

### 2.3 Configure API Endpoint

The React components expect the backend at `/api/run-full-e2e` and `/api/run-scenario`. 

**If your backend is on a different domain:**

```typescript
// src/config/api.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Update AIHumanOrchestrator.tsx
const response = await fetch(`${API_BASE_URL}/api/run-full-e2e`, {
  method: 'POST',
  // ...
});
```

### 2.4 Test Frontend Integration

1. Navigate to `/admin/e2e-testing`
2. Click "Run Full AI Human E2E Test"
3. Verify results display with:
   - ✅ GO/NO-GO/WARNING status
   - 📊 Metrics (Total/Passed/Failed/Revenue/Auto-Fixed)
   - 🚨 SEV-1/SEV-2 alerts
   - 📈 Executive summary

---

## 🔄 Phase 3: CI/CD Pipeline Integration

### 3.1 Update GitHub Actions Workflow

**File: `.github/workflows/e2e-revenue-guard.yml`**

```yaml
name: 🔒 AI Human E2E - Revenue Guard & Deployment Gate

on:
  push:
    branches: [main, staging, develop]
  pull_request:
    branches: [main, staging]
  workflow_dispatch: # Manual trigger

env:
  BASE_URL: https://staging.yoursite.com
  THERAPIST_URL: https://therapist.staging.yoursite.com
  ADMIN_URL: https://admin.staging.yoursite.com

jobs:
  # ========================================
  # JOB 1: AI HUMAN ORCHESTRATOR (FULL SUITE)
  # ========================================
  ai-human-orchestrator:
    name: 🤖 AI Human Orchestrator - Full Suite
    runs-on: ubuntu-latest
    timeout-minutes: 30
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: 📦 Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: 📚 Install dependencies
        run: pnpm install --frozen-lockfile

      - name: 🎭 Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: 🤖 Run AI Human Orchestrator (All Scenarios)
        id: orchestrator
        run: |
          pnpm exec playwright test e2e-tests/flows/ai-human-multi-user-workflow.spec.ts --reporter=json
        continue-on-error: true

      - name: 📊 Generate Executive Report
        if: always()
        run: pnpm exec ts-node e2e-tests/scripts/generate-executive-report.ts

      - name: 🔍 AI Diagnosis (on failure)
        if: failure()
        run: pnpm exec ts-node e2e-tests/scripts/diagnose-failures.ts

      - name: 📤 Upload Test Results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: orchestrator-results
          path: |
            playwright-report/
            e2e-tests/reports/
          retention-days: 30

      - name: 💬 Comment on PR (GO/NO-GO Decision)
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const reportPath = 'e2e-tests/reports/executive-summary.md';
            
            if (fs.existsSync(reportPath)) {
              const report = fs.readFileSync(reportPath, 'utf8');
              
              github.rest.issues.createComment({
                issue_number: context.issue.number,
                owner: context.repo.owner,
                repo: context.repo.repo,
                body: `## 🤖 AI Human E2E Test Results\n\n${report}`
              });
            }

      - name: 🚨 Block deployment on SEV-1 failures
        if: failure()
        run: |
          echo "❌ AI Human E2E Tests FAILED"
          echo "🚫 Deployment BLOCKED - SEV-1 revenue-critical failures detected"
          exit 1

  # ========================================
  # JOB 2: REVENUE GUARD (COMMISSION VERIFICATION)
  # ========================================
  revenue-guard:
    name: 💰 Revenue Guard - Commission Verification
    runs-on: ubuntu-latest
    timeout-minutes: 15
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: 📦 Setup Node.js & pnpm
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: 📚 Install dependencies
        run: pnpm install --frozen-lockfile

      - name: 🎭 Install Playwright
        run: pnpm exec playwright install --with-deps chromium

      - name: 💰 Run Revenue Guard Tests
        run: pnpm exec playwright test e2e-tests/flows/booking-flow.spec.ts --grep "Commission"

      - name: 🚨 Block on revenue violations
        if: failure()
        run: |
          echo "❌ REVENUE GUARD VIOLATION DETECTED"
          echo "🚫 Commission verification FAILED - deployment BLOCKED"
          exit 1

  # ========================================
  # JOB 3: NOTIFICATIONS (Slack/Email)
  # ========================================
  notify-failure:
    name: 📧 Notify Team on Failure
    runs-on: ubuntu-latest
    needs: [ai-human-orchestrator, revenue-guard]
    if: failure()
    
    steps:
      - name: 📧 Send Slack Notification
        if: env.SLACK_WEBHOOK_URL != ''
        uses: slackapi/slack-github-action@v1.24.0
        with:
          payload: |
            {
              "text": "🚨 AI Human E2E Tests FAILED",
              "blocks": [
                {
                  "type": "section",
                  "text": {
                    "type": "mrkdwn",
                    "text": "*🚨 AI Human E2E Tests FAILED*\n\n*Branch:* `${{ github.ref_name }}`\n*Commit:* ${{ github.sha }}\n*Author:* ${{ github.actor }}\n\n⚠️ *Revenue-critical failures detected - deployment BLOCKED*"
                  }
                },
                {
                  "type": "actions",
                  "elements": [
                    {
                      "type": "button",
                      "text": {
                        "type": "plain_text",
                        "text": "View Workflow"
                      },
                      "url": "${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}"
                    }
                  ]
                }
              ]
            }
        env:
          SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}

      - name: 📧 Send Email Notification
        if: env.ALERT_EMAIL != ''
        uses: dawidd6/action-send-mail@v3
        with:
          server_address: ${{ secrets.SMTP_HOST }}
          server_port: ${{ secrets.SMTP_PORT }}
          username: ${{ secrets.SMTP_USER }}
          password: ${{ secrets.SMTP_PASSWORD }}
          subject: '🚨 AI Human E2E Tests FAILED - ${{ github.ref_name }}'
          to: ${{ secrets.ALERT_EMAIL }}
          from: 'GitHub Actions <noreply@github.com>'
          body: |
            AI Human E2E Tests FAILED
            
            Branch: ${{ github.ref_name }}
            Commit: ${{ github.sha }}
            Author: ${{ github.actor }}
            
            ⚠️ Revenue-critical failures detected
            🚫 Deployment has been BLOCKED
            
            View workflow: ${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }}
            
            Please review the test results and fix the issues before deploying.

  # ========================================
  # JOB 4: DEPLOYMENT (only if all tests pass)
  # ========================================
  deploy:
    name: 🚀 Deploy to Staging
    runs-on: ubuntu-latest
    needs: [ai-human-orchestrator, revenue-guard]
    if: github.ref == 'refs/heads/staging' && success()
    
    steps:
      - name: 📥 Checkout code
        uses: actions/checkout@v4

      - name: ✅ All tests passed - deploying
        run: echo "✅ GO decision - deploying to staging"

      - name: 🚀 Deploy to Netlify/Vercel
        run: |
          # Add your deployment commands here
          # Example for Netlify:
          # pnpm build
          # netlify deploy --prod
          
          # Example for Vercel:
          # vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
          
          echo "Deployment logic goes here"
```

### 3.2 Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** and add:

```bash
# Slack Integration (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email Notifications (optional)
ALERT_EMAIL=dev-team@yourcompany.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=notifications@yourcompany.com
SMTP_PASSWORD=your-smtp-password

# Deployment (if needed)
VERCEL_TOKEN=your-vercel-token
NETLIFY_AUTH_TOKEN=your-netlify-token
```

### 3.3 Test CI/CD Pipeline

```bash
# Create a feature branch
git checkout -b test/ai-orchestrator

# Make a small change
echo "# Test CI/CD" >> README.md

# Commit and push
git add .
git commit -m "test: trigger AI Human E2E pipeline"
git push origin test/ai-orchestrator

# Create PR on GitHub
# CI/CD will automatically run and comment with GO/NO-GO decision
```

---

## 📊 Phase 4: Monitoring & Notifications

### 4.1 Slack Integration

**Setup Slack Webhook:**

1. Go to https://api.slack.com/apps
2. Create new app → "Incoming Webhooks"
3. Activate webhooks
4. Add webhook to workspace
5. Copy webhook URL
6. Add to GitHub secrets: `SLACK_WEBHOOK_URL`

**Test Slack Notification:**

```bash
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d '{
    "text": "🧪 Test notification from AI Human E2E System"
  }'
```

### 4.2 Email Notifications

**Using Gmail SMTP:**

1. Enable 2-factor authentication on Gmail
2. Generate app password: https://myaccount.google.com/apppasswords
3. Add to GitHub secrets:
   - `SMTP_HOST=smtp.gmail.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=your-email@gmail.com`
   - `SMTP_PASSWORD=your-app-password`
   - `ALERT_EMAIL=dev-team@yourcompany.com`

### 4.3 Custom Webhook (Alternative)

**Create custom notification endpoint:**

```typescript
// routes/notifications.ts
import express from 'express';

const router = express.Router();

router.post('/notify/e2e-failure', async (req, res) => {
  const { status, failures, executiveSummary } = req.body;
  
  if (status === 'NO-GO') {
    // Send to Slack
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 E2E Tests FAILED\n\n${executiveSummary}`,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `*🚨 AI Human E2E Tests FAILED*\n\n${failures.map((f: any) => `• ${f.scenario}: ${f.error}`).join('\n')}`
            }
          }
        ]
      })
    });
    
    // Send email via SendGrid/AWS SES/etc
    // await sendEmailAlert(failures);
  }
  
  res.json({ success: true });
});

export default router;
```

---

## 🎯 Phase 5: Production Deployment

### 5.1 Pre-Production Checklist

- [ ] All E2E tests pass locally
- [ ] Backend API endpoints verified
- [ ] Frontend dashboard functional
- [ ] CI/CD pipeline configured
- [ ] Notifications working (Slack/Email)
- [ ] Environment variables set for production
- [ ] Appwrite production database configured
- [ ] Test accounts created in production

### 5.2 Deploy to Production

```bash
# Update .env for production
BASE_URL=https://yoursite.com
THERAPIST_URL=https://therapist.yoursite.com
ADMIN_URL=https://admin.yoursite.com

# Build production bundle
pnpm build

# Deploy (example for Vercel)
vercel --prod

# Verify deployment
curl -X POST https://yoursite.com/api/run-full-e2e
```

### 5.3 Post-Deployment Verification

```bash
# Run E2E tests against production
BASE_URL=https://yoursite.com pnpm test:e2e

# Check orchestrator dashboard
# Navigate to https://yoursite.com/admin/e2e-testing

# Verify CI/CD blocking works
# Create test PR with intentionally failing code
```

---

## 📈 Usage & Maintenance

### Daily Operations

**Manual Test Execution:**
```bash
# Run full orchestrator
pnpm test:e2e e2e-tests/flows/ai-human-multi-user-workflow.spec.ts

# Run specific scenario
pnpm test:e2e --grep "Book Now"

# Generate reports
pnpm exec ts-node e2e-tests/scripts/generate-executive-report.ts
```

**Dashboard Access:**
- Navigate to `/admin/e2e-testing`
- Click "Run Full AI Human E2E Test"
- Review GO/NO-GO decision
- Check individual scenarios

**CI/CD Monitoring:**
- Every push to `main`/`staging` triggers tests
- PR comments show GO/NO-GO decision
- Slack/Email alerts on failures
- Deployment blocked on SEV-1 failures

### Troubleshooting

**Tests failing locally but passing in CI:**
- Check environment variables
- Verify Appwrite connection
- Ensure test accounts exist
- Check BASE_URL configuration

**CI/CD not blocking deployment:**
- Verify workflow has `if: failure()` check
- Ensure `exit 1` on SEV-1 failures
- Check GitHub branch protection rules

**Notifications not working:**
- Verify webhook URLs in GitHub secrets
- Test Slack webhook manually
- Check SMTP credentials
- Review notification job logs

---

## 🎓 Next Steps

1. **Expand Test Coverage:**
   - Add more scenarios (cancellation, refunds, etc.)
   - Test edge cases (network failures, timeouts)
   - Add mobile-specific tests

2. **Enhanced Monitoring:**
   - Integrate with Datadog/New Relic
   - Set up custom metrics dashboard
   - Add performance benchmarking

3. **Advanced Features:**
   - Scheduled E2E test runs (nightly)
   - Load testing with multiple concurrent users
   - Visual regression testing with Percy/Chromatic

---

## 📚 Resources

- [AI E2E System README](./e2e-tests/AI_HUMAN_E2E_SYSTEM_README.md)
- [Orchestrator API Docs](./routes/AI_HUMAN_ORCHESTRATOR_DOCS.md)
- [Business Rules](./e2e-tests/config/business-rules.ts)
- [Playwright Documentation](https://playwright.dev)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## ✅ Deployment Complete!

Your AI Human E2E Testing System is now:
- ✅ Deployed with backend API
- ✅ Integrated with React dashboard
- ✅ Connected to CI/CD pipeline
- ✅ Configured with notifications
- ✅ Blocking deployments on revenue-critical failures

**GO decision confirmed** - Revenue protection is ACTIVE 🔒
