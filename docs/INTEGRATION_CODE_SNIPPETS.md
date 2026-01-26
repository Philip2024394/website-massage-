# 🎯 Copy-Paste Integration Code

Use these exact code snippets to integrate the AI Human Orchestrator into your existing codebase.

---

## 1️⃣ Backend Integration (Express Server)

### File: `server.ts` or `index.ts` (your main Express file)

```typescript
import express from 'express';
import cors from 'cors';
import aiHumanOrchestratorRouter from './routes/aiHumanOrchestrator';
import e2eTestRouter from './routes/e2eTest'; // Optional - for individual tests

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ ADD THESE TWO LINES
app.use('/api', aiHumanOrchestratorRouter);
app.use('/api', e2eTestRouter); // Optional

// Your existing routes
// app.use('/api/bookings', bookingRouter);
// app.use('/api/therapists', therapistRouter);
// etc...

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 AI Human Orchestrator: http://localhost:${PORT}/api/run-full-e2e`);
});

export default app;
```

---

## 2️⃣ Frontend Integration (React)

### Option A: Full Dashboard (Recommended)

**File: `src/AppRouter.tsx` or `src/App.tsx`**

```typescript
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AIHumanOrchestrator } from './components/AIHumanOrchestrator';
import { ProtectedRoute } from './components/ProtectedRoute'; // If you have auth

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Your existing routes */}
        <Route path="/" element={<Home />} />
        <Route path="/therapists" element={<TherapistList />} />
        <Route path="/booking/:id" element={<BookingPage />} />
        
        {/* ✅ ADD THIS ROUTE */}
        <Route 
          path="/admin/e2e-testing" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AIHumanOrchestrator />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
```

### Option B: Simple Button in Existing Page

**File: `src/pages/AdminDashboard.tsx` (or any admin page)**

```typescript
import React from 'react';
import { AIHumanE2ETestButton } from '../components/AIHumanE2ETestButton';

function AdminDashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* ✅ ADD THIS SECTION */}
      <div className="mb-8 border-2 border-blue-500 rounded-lg p-6 bg-blue-50">
        <h2 className="text-xl font-semibold mb-4 text-blue-900">
          🤖 AI Human E2E Testing
        </h2>
        <AIHumanE2ETestButton />
      </div>
      
      {/* Your existing dashboard content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard title="Total Bookings" value={bookings.length} />
        <StatsCard title="Active Therapists" value={therapists.length} />
        <StatsCard title="Revenue" value={`$${revenue}`} />
      </div>
    </div>
  );
}

export default AdminDashboard;
```

---

## 3️⃣ Environment Variables

### File: `.env` (local development)

```bash
# Existing variables (don't change these)
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68f23b11000d25eb3664
VITE_APPWRITE_DATABASE_ID=68f76ee1000e64ca8d05

# ✅ ADD THESE LINES
# E2E Testing Configuration
BASE_URL=http://localhost:3000
THERAPIST_URL=http://localhost:3005
ADMIN_URL=http://localhost:3007

# Optional: Notifications
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL
ALERT_EMAIL=dev-team@yourcompany.com
```

### File: `.env.production` (production)

```bash
# Existing variables
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68f23b11000d25eb3664
VITE_APPWRITE_DATABASE_ID=68f76ee1000e64ca8d05

# ✅ ADD THESE LINES (update URLs to your production domains)
BASE_URL=https://yoursite.com
THERAPIST_URL=https://therapist.yoursite.com
ADMIN_URL=https://admin.yoursite.com
```

---

## 4️⃣ GitHub Secrets

**Go to: Settings → Secrets and variables → Actions → New repository secret**

Add these secrets (one by one):

```bash
# Required for E2E tests in CI/CD
BASE_URL
Value: https://staging.yoursite.com

THERAPIST_URL
Value: https://therapist.staging.yoursite.com

ADMIN_URL
Value: https://admin.staging.yoursite.com

# Optional: Slack notifications
SLACK_WEBHOOK_URL
Value: https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Optional: Email notifications
SMTP_HOST
Value: smtp.gmail.com

SMTP_PORT
Value: 587

SMTP_USER
Value: your-email@gmail.com

SMTP_PASSWORD
Value: your-app-password

ALERT_EMAIL
Value: dev-team@yourcompany.com

# Optional: Deployment
VERCEL_TOKEN
Value: your-vercel-token

# OR

NETLIFY_AUTH_TOKEN
Value: your-netlify-token
```

---

## 5️⃣ Package.json Scripts (Already Added)

**File: `package.json`**

These scripts should already exist in your `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:report": "playwright show-report",
    "test:e2e:diagnose": "ts-node e2e-tests/scripts/diagnose-failures.ts",
    "test:e2e:report:executive": "ts-node e2e-tests/scripts/generate-executive-report.ts",
    "test:e2e:report:developer": "ts-node e2e-tests/scripts/generate-developer-report.ts"
  }
}
```

If they don't exist, copy-paste the entire `scripts` section above into your `package.json`.

---

## 6️⃣ Admin Navigation Link (Optional)

Add a link to the E2E testing dashboard in your admin navigation:

**File: `src/components/AdminNav.tsx` or `src/layouts/AdminLayout.tsx`**

```typescript
import { Link } from 'react-router-dom';

function AdminNav() {
  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-6">
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/bookings">Bookings</Link></li>
        <li><Link to="/admin/therapists">Therapists</Link></li>
        <li><Link to="/admin/users">Users</Link></li>
        
        {/* ✅ ADD THIS LINE */}
        <li>
          <Link to="/admin/e2e-testing" className="flex items-center space-x-2">
            <span>🤖</span>
            <span>E2E Testing</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

export default AdminNav;
```

---

## 7️⃣ Install Missing Dependencies

```bash
# Required for React components
pnpm add react-markdown

# If you don't have these, install them
pnpm add @playwright/test -D
pnpm add ts-node -D
```

---

## 8️⃣ Test Your Integration

### Backend Test
```bash
# Start your server
pnpm dev

# In another terminal, test the API
curl -X POST http://localhost:3000/api/run-full-e2e \
  -H "Content-Type: application/json"

# Expected response:
# {
#   "status": "GO",
#   "passedTests": 8,
#   "totalTests": 8,
#   "scenarios": [...],
#   "executiveSummary": "..."
# }
```

### Frontend Test
```bash
# Start your dev server (if not already running)
pnpm dev

# Navigate to:
http://localhost:3000/admin/e2e-testing

# Click "Run Full AI Human E2E Test"
# Verify results display
```

### E2E Test
```bash
# Run tests locally
pnpm test:e2e e2e-tests/flows/ai-human-multi-user-workflow.spec.ts

# Expected output:
# ✅ 8 scenarios passed
# All verifications passed
```

### CI/CD Test
```bash
# Commit your changes
git add .
git commit -m "feat: integrate AI Human orchestrator"
git push origin main

# Check GitHub Actions:
# Navigate to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions

# Expected:
# ✅ AI Human Orchestrator job passes
# ✅ Revenue Guard job passes
# ✅ PR comment appears (if applicable)
# ✅ Deployment proceeds (if tests pass)
```

---

## 9️⃣ Enable Branch Protection (Production Safety)

**Go to: Settings → Branches → Add branch protection rule**

Configure as follows:

```
Branch name pattern: main

☑️ Require a pull request before merging
  ☑️ Require approvals: 1

☑️ Require status checks to pass before merging
  ☑️ Require branches to be up to date before merging
  ☑️ Status checks that are required:
      • AI Human Orchestrator
      • Revenue Guard

☑️ Do not allow bypassing the above settings

[Save changes]
```

This ensures:
- ✅ No direct pushes to main
- ✅ All PRs require approval
- ✅ E2E tests must pass before merging
- ✅ Revenue protection is ENFORCED

---

## 🎯 Complete Integration Checklist

Run through this checklist to verify everything is working:

- [ ] Backend route added to `server.ts`
- [ ] Frontend component added (dashboard or button)
- [ ] `.env` file updated with BASE_URL, THERAPIST_URL, ADMIN_URL
- [ ] GitHub secrets configured (BASE_URL, THERAPIST_URL, ADMIN_URL)
- [ ] Dependencies installed (`react-markdown`, `@playwright/test`)
- [ ] Backend API test passes: `curl -X POST http://localhost:3000/api/run-full-e2e`
- [ ] Frontend dashboard accessible at `/admin/e2e-testing`
- [ ] E2E tests pass locally: `pnpm test:e2e`
- [ ] CI/CD workflow triggers on push to main
- [ ] PR comments appear with GO/NO-GO decision
- [ ] Branch protection enabled on main branch
- [ ] (Optional) Slack/Email notifications configured
- [ ] (Optional) Deployment pipeline integrated

---

## 🎉 Done!

Your AI Human E2E Testing System is now fully integrated!

### What You Can Do Now

1. **Run tests manually:**
   ```bash
   pnpm test:e2e e2e-tests/flows/ai-human-multi-user-workflow.spec.ts
   ```

2. **Use the backend API:**
   ```bash
   curl -X POST http://localhost:3000/api/run-full-e2e
   ```

3. **Access the dashboard:**
   - Navigate to: `http://localhost:3000/admin/e2e-testing`
   - Click "Run Full AI Human E2E Test"

4. **Automatic CI/CD:**
   - Every push to main/staging triggers tests
   - PR comments show GO/NO-GO decision
   - Deployment blocked on SEV-1 failures

### Support

If you encounter any issues:
- Check [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) for troubleshooting
- Review [AI_HUMAN_ORCHESTRATOR_DEPLOYMENT_GUIDE.md](./AI_HUMAN_ORCHESTRATOR_DEPLOYMENT_GUIDE.md) for detailed setup
- Read [QUICK_START_DEPLOYMENT.md](./QUICK_START_DEPLOYMENT.md) for 10-minute quick start

**Your revenue is now protected!** 🔒🚀
