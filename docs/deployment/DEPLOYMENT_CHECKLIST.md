# 🚀 Deployment Checklist - AI Human Orchestrator

Use this checklist to verify your deployment is complete and operational.

---

## Phase 1: Backend API Integration ✅

### Step 1.1: Add Route to Express Server
- [ ] Open your main Express server file (e.g., `server.ts` or `index.ts`)
- [ ] Import orchestrator route:
  ```typescript
  import aiHumanOrchestratorRouter from './routes/aiHumanOrchestrator';
  ```
- [ ] Add middleware:
  ```typescript
  app.use('/api', aiHumanOrchestratorRouter);
  ```
- [ ] Start server: `pnpm dev`

### Step 1.2: Test Backend Endpoints
```bash
# Test full orchestrator
curl -X POST http://localhost:3000/api/run-full-e2e \
  -H "Content-Type: application/json"

# Expected response: {"status": "GO", "passedTests": 8, ...}
```

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 2: Frontend Dashboard Integration ✅

### Step 2.1: Install Dependencies
- [ ] Run: `pnpm add react-markdown`

### Step 2.2: Add Dashboard Component
Choose one option:

**Option A: Full Dashboard (8 scenarios)**
- [ ] Import in `AppRouter.tsx`:
  ```typescript
  import { AIHumanOrchestrator } from './components/AIHumanOrchestrator';
  ```
- [ ] Add route:
  ```typescript
  <Route path="/admin/e2e-testing" element={<AIHumanOrchestrator />} />
  ```

**Option B: Simple Button in Existing Page**
- [ ] Import in admin page:
  ```typescript
  import { AIHumanE2ETestButton } from './components/AIHumanE2ETestButton';
  ```
- [ ] Add component:
  ```typescript
  <AIHumanE2ETestButton />
  ```

### Step 2.3: Test Frontend
- [ ] Navigate to `/admin/e2e-testing` or your admin page
- [ ] Click "Run Full AI Human E2E Test"
- [ ] Verify GO/NO-GO status displays
- [ ] Check metrics (Total/Passed/Failed/Revenue/Auto-Fixed)
- [ ] Review executive summary

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 3: CI/CD Pipeline Configuration ✅

### Step 3.1: Verify Workflow File
- [ ] Open `.github/workflows/e2e-revenue-guard.yml`
- [ ] Verify 4 jobs exist:
  - `ai-human-orchestrator` (8 scenarios)
  - `revenue-guard` (commission verification)
  - `notify-failure` (Slack/Email alerts)
  - `deploy` (only runs if tests pass)

### Step 3.2: Test CI/CD Pipeline
```bash
# Create test branch
git checkout -b test/ai-orchestrator

# Make a small change
echo "# Test CI/CD" >> README.md

# Commit and push
git add .
git commit -m "test: trigger AI Human E2E pipeline"
git push origin test/ai-orchestrator

# Create PR on GitHub
# Expected: CI runs and comments with GO/NO-GO decision
```

### Step 3.3: Verify PR Comment
- [ ] Open PR on GitHub
- [ ] Wait for CI to complete
- [ ] Verify comment appears with:
  - 🤖 AI Human E2E Test Results
  - GO/NO-GO/WARNING status
  - Metrics (Total/Passed/Failed)
  - Executive summary

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Phase 4: Notifications Setup (Optional) 📧

### Step 4.1: Slack Notifications
- [ ] Create Slack webhook: https://api.slack.com/messaging/webhooks
- [ ] Go to GitHub: Settings → Secrets → Actions
- [ ] Add secret: `SLACK_WEBHOOK_URL`
- [ ] Test webhook:
  ```bash
  curl -X POST $SLACK_WEBHOOK_URL \
    -H 'Content-Type: application/json' \
    -d '{"text": "🧪 Test from AI Human E2E System"}'
  ```

### Step 4.2: Email Notifications
- [ ] Add GitHub secrets:
  - `SMTP_HOST` (e.g., `smtp.gmail.com`)
  - `SMTP_PORT` (e.g., `587`)
  - `SMTP_USER` (your email)
  - `SMTP_PASSWORD` (app password)
  - `ALERT_EMAIL` (dev team email)

### Step 4.3: Test Notifications
- [ ] Trigger a test failure (comment out a test assertion)
- [ ] Push to main/staging
- [ ] Verify Slack message received
- [ ] Verify email received

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete | ⏭️ Skipped

---

## Phase 5: Production Deployment 🚀

### Step 5.1: Update Environment Variables
- [ ] Update `.env` for production:
  ```bash
  BASE_URL=https://yoursite.com
  THERAPIST_URL=https://therapist.yoursite.com
  ADMIN_URL=https://admin.yoursite.com
  ```

### Step 5.2: Add GitHub Secrets
- [ ] `BASE_URL` = Production URL
- [ ] `THERAPIST_URL` = Therapist dashboard URL
- [ ] `ADMIN_URL` = Admin dashboard URL
- [ ] `VERCEL_TOKEN` or `NETLIFY_AUTH_TOKEN` (for deployment)

### Step 5.3: Enable Branch Protection
- [ ] Go to: Settings → Branches → Branch protection rules
- [ ] Add rule for `main` branch:
  - ✅ Require status checks before merging
  - ✅ Require "AI Human Orchestrator" check
  - ✅ Require "Revenue Guard" check
  - ✅ Do not allow bypassing

### Step 5.4: Deploy to Production
```bash
# Build production bundle
pnpm build

# Deploy (example for Vercel)
vercel --prod

# Or deploy (example for Netlify)
netlify deploy --prod
```

### Step 5.5: Verify Production
- [ ] Run E2E tests against production:
  ```bash
  BASE_URL=https://yoursite.com pnpm test:e2e
  ```
- [ ] Navigate to production dashboard
- [ ] Click "Run Full AI Human E2E Test"
- [ ] Verify all 8 scenarios pass

**Status:** ⬜ Not Started | ⏳ In Progress | ✅ Complete

---

## Verification Checklist ✅

### Backend API
- [ ] `/api/run-full-e2e` returns JSON with GO/NO-GO status
- [ ] `/api/run-scenario` can execute individual scenarios
- [ ] `/api/orchestration-status` returns test status

### Frontend Dashboard
- [ ] Dashboard accessible at `/admin/e2e-testing`
- [ ] 8 scenario cards displayed
- [ ] "Run Full AI Human E2E Test" button works
- [ ] Individual scenario buttons work
- [ ] Metrics display correctly (Total/Passed/Failed/Revenue/Auto-Fixed)
- [ ] SEV-1/SEV-2 alerts show when failures occur
- [ ] Executive summary renders

### CI/CD Pipeline
- [ ] Push to main/staging triggers workflow
- [ ] All 4 jobs run (orchestrator, revenue-guard, notify, deploy)
- [ ] PR comments appear with GO/NO-GO decision
- [ ] Deployment blocked when SEV-1 failures occur
- [ ] Deployment proceeds when all tests pass

### Notifications (if configured)
- [ ] Slack messages received on failures
- [ ] Email alerts received on failures
- [ ] Notifications include workflow link

### E2E Tests
- [ ] All 8 scenarios pass locally:
  - ✅ Book Now Flow
  - ✅ Scheduled Booking
  - ✅ Slider Booking
  - ✅ Chat System
  - ✅ Notifications
  - ✅ Commission Verification
  - ✅ Countdown Timer
  - ✅ Admin Dashboard
- [ ] Revenue Guard passes (commission verification)
- [ ] No orphan commissions detected
- [ ] Idempotency enforced (no duplicates)

---

## Troubleshooting Common Issues 🔧

### Issue: Backend API returns 404
**Solution:**
- Verify route is imported in main server file
- Check `app.use('/api', aiHumanOrchestratorRouter)`
- Restart server: `pnpm dev`

### Issue: Frontend dashboard not loading
**Solution:**
- Verify `react-markdown` installed: `pnpm add react-markdown`
- Check route exists in `AppRouter.tsx`
- Check browser console for errors

### Issue: CI/CD not triggering
**Solution:**
- Verify `.github/workflows/e2e-revenue-guard.yml` exists
- Check workflow triggers include your branch
- Go to Actions tab → Enable workflows

### Issue: Tests failing locally
**Solution:**
- Check environment variables in `.env`
- Verify Appwrite connection (DATABASE_ID, COLLECTIONS)
- Ensure test accounts exist (user@test.com, therapist@test.com, admin@test.com)
- Run: `pnpm exec playwright install --with-deps chromium`

### Issue: Slack/Email notifications not working
**Solution:**
- Test webhook manually with `curl`
- Verify secrets exist in GitHub: Settings → Secrets → Actions
- Check notification job logs in Actions tab

---

## Final Verification ✅

Run this comprehensive check:

```bash
# 1. Backend API
curl -X POST http://localhost:3000/api/run-full-e2e

# 2. E2E Tests
pnpm test:e2e e2e-tests/flows/ai-human-multi-user-workflow.spec.ts

# 3. Reports
pnpm exec ts-node e2e-tests/scripts/generate-executive-report.ts

# 4. Commit and push (triggers CI/CD)
git add .
git commit -m "feat: deploy AI Human orchestrator"
git push origin main

# 5. Check GitHub Actions
# Navigate to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

**Expected Results:**
- ✅ Backend API returns GO status
- ✅ All 8 E2E scenarios pass
- ✅ Executive report generated
- ✅ CI/CD workflow runs successfully
- ✅ PR comment appears (if applicable)
- ✅ Deployment proceeds (if on staging/main)

---

## 🎉 Deployment Complete!

**Once all checkboxes are ticked, your AI Human E2E Testing System is fully operational!**

### System Status
- 🔒 **Revenue Protection:** ACTIVE
- 🚨 **Deployment Gate:** ENABLED
- 🤖 **AI Diagnosis:** OPERATIONAL
- 📊 **Dashboard:** ACCESSIBLE
- 🔔 **Notifications:** CONFIGURED (if optional phase completed)

### Key Capabilities
- ✅ 8 comprehensive test scenarios
- ✅ Commission verification (revenue protected)
- ✅ Automatic deployment blocking on SEV-1 failures
- ✅ AI-powered failure diagnosis
- ✅ Real-time dashboard with metrics
- ✅ Slack/Email notifications on failures

### Documentation
- 📚 [Deployment Guide](./AI_HUMAN_ORCHESTRATOR_DEPLOYMENT_GUIDE.md)
- ⚡ [Quick Start](./QUICK_START_DEPLOYMENT.md)
- 📊 [API Docs](./routes/AI_HUMAN_ORCHESTRATOR_DOCS.md)
- 🎓 [System README](./e2e-tests/AI_HUMAN_E2E_SYSTEM_README.md)

---

**Your massage therapy booking platform is now revenue-protected!** 🔒🚀

For support, refer to the comprehensive documentation or review CI/CD logs in the GitHub Actions tab.
