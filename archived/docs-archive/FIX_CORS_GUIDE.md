# Fix CORS Errors - Add Development Platform to Appwrite

## Problem
Your browser is blocking all Appwrite requests with CORS errors, causing the app to show 3 fake fallback therapists instead of your real 60 therapists.

## Solution

### Step 1: Open Appwrite Console
1. Go to https://cloud.appwrite.io/console
2. Select your project (ID: `68f23b11000d25eb3664`)

### Step 2: Add Web Platform
1. Click **"Settings"** in left sidebar (or go directly to Project Settings)
2. Scroll down to **"Platforms"** section
3. Click **"Add Platform"** button
4. Select **"Web App"**

### Step 3: Configure Platform
Enter these values:
- **Name**: `Local Development`
- **Hostname**: `127.0.0.1` (NO port, NO protocol, just the hostname)

Alternative hostname to add (create a second platform):
- **Hostname**: `localhost` (if you prefer using localhost)

### Step 4: Save & Restart
1. Click **"Next"** or **"Create"** to save the platform
2. In your VS Code terminal, restart the dev server:
   ```powershell
   # Press Ctrl+C to stop current server
   pnpm run dev
   ```

### Step 5: Verify Fix
After restart, check browser console:
- ❌ Before: `Access to fetch...has been blocked by CORS policy`
- ✅ After: `✅ [STAGE 2 - HOOK] Therapists after robustQuery: 60` (or 57 live)

## Expected Results

**Before (fake data):**
- 3 therapist cards: Budi, Sari, Maya
- IDs: `dev-budi-001`, `dev-sari-002`, `dev-maya-003`
- Console: `🔄 CORS/Network error detected - providing development sample data`

**After (real data):**
- 57-60 therapist cards from Appwrite
- Real therapist IDs from your database
- Console: `✅ [STAGE 2 - HOOK] Therapists after robustQuery: 60`

## Production Platform (Future)

When you deploy, also add your production domain:
- **Name**: `Production Site`
- **Hostname**: `your-domain.com` (without https://)

## Troubleshooting

**If CORS errors persist after adding platform:**

1. **Wait 1-2 minutes** - Appwrite may need time to propagate platform settings

2. **Hard refresh browser**:
   - Windows: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`

3. **Check platform format**:
   - ✅ Correct: `127.0.0.1` (hostname only)
   - ✅ Correct: `localhost` (hostname only)
   - ❌ Wrong: `127.0.0.1:3000` (no port)
   - ❌ Wrong: `http://127.0.0.1` (no protocol)
   - ❌ Wrong: `127.0.0.1/` (no trailing slash)

4. **Verify project ID matches**:
   - In Appwrite Console, check Project ID = `68f23b11000d25eb3664`
   - In `.env`, check `VITE_APPWRITE_PROJECT_ID=68f23b11000d25eb3664`

5. **Check API endpoint**:
   - Should be: `https://syd.cloud.appwrite.io/v1` (Sydney region)
   - In `.env`: `VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1`

## Alternative: Use Appwrite CLI (Advanced)

If you can't access console, use Appwrite CLI:
```bash
appwrite projects updatePlatform \
  --projectId 68f23b11000d25eb3664 \
  --platformId <PLATFORM_ID> \
  --hostname "127.0.0.1:3000"
```

## Contact Support

If issues persist, check:
- Appwrite Community: https://appwrite.io/discord
- Appwrite Docs: https://appwrite.io/docs/getting-started-for-web
