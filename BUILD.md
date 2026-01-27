# 🏗️ BUILD & DEPLOYMENT PROCESS

**Production-Grade Workflow for Source-Only Deployment**

---

## 🎯 Golden Rules

### **RULE #1: NEVER EDIT `dist/` DIRECTLY** ❌

```bash
# ❌ WRONG
nano dist/index.html    # Direct production edit
git add dist/           # Committing built files

# ✅ RIGHT
nano index.html         # Edit source
pnpm build             # Rebuild
pnpm verify            # Verify output
git add index.html     # Commit source only
```

**Why?**
- `dist/` is generated from source files
- Manual edits get overwritten on next build
- No git history for production changes
- Inconsistent source vs production code

---

## 🚀 Standard Workflow

### **1. Make Changes in Source Files**

Edit files in:
- `src/`, `components/`, `pages/`, `lib/`, etc. (source code)
- `index.html`, `vite.config.ts`, `package.json` (config)
- `public/` (static assets)

```bash
# Example: Update homepage
nano pages/HomePage.tsx

# Example: Update SW version
nano public/sw.js
```

### **2. Build and Verify**

```bash
# Generate production build
pnpm build

# Run automated verification (critical checks)
pnpm verify

# Optional: Check SW version updated
pnpm verify:sw
```

**What verification checks:**
- ✅ dist/ folder generated
- ✅ Hashed JS/CSS files present (cache-busting)
- ✅ Critical CSS inline (prevents blank screens)
- ✅ No development URLs in production
- ✅ TypeScript compilation successful
- ✅ Service Worker version valid

### **3. Test Locally (Optional)**

```bash
# Preview production build
pnpm preview

# Or run dev server
pnpm dev
```

**Test:**
- Homepage loads
- City dropdown works
- Therapist cards display
- Booking flow works
- Mobile view renders
- Console has no errors

### **4. Commit Source Changes**

```bash
# Stage source files only (dist/ is gitignored)
git add pages/HomePage.tsx
git add public/sw.js
git commit -m "fix: city cache bug and SW version update"

# Push to trigger deployment
git push origin main
```

### **5. Netlify Auto-Deploys**

Netlify automatically:
1. Pulls latest code from GitHub
2. Runs `pnpm build`
3. Deploys `dist/` to production
4. Invalidates CDN cache

**Monitor deploy:**
- Visit: https://app.netlify.com/sites/[your-site]/deploys
- Check build logs for errors
- Verify deploy status: ✅ Published

---

## 🆘 Emergency Hotfix Procedure

**If production is broken and needs IMMEDIATE fix:**

### Step 1: Identify Issue
```bash
# Check production console errors
# Visit: https://your-site.com
# Open DevTools → Console
```

### Step 2: Fix Source Locally
```bash
# Create hotfix branch (optional but recommended)
git checkout -b hotfix/critical-bug

# Fix the issue in source files
nano pages/HomePage.tsx

# Test locally
pnpm dev
# Verify fix works
```

### Step 3: Build & Verify
```bash
# Build production bundle
pnpm build

# Run verification (MUST PASS)
pnpm verify
```

### Step 4: Deploy
```bash
# Commit and push
git add .
git commit -m "hotfix: critical production bug"
git push origin hotfix/critical-bug

# Merge to main (or push directly if urgent)
git checkout main
git merge hotfix/critical-bug
git push origin main
```

### Step 5: Verify Production
```bash
# Wait for Netlify deploy (usually 2-3 minutes)
# Visit production site
# Hard refresh: Ctrl+Shift+R
# Verify fix deployed
```

**DO NOT:**
- ❌ Edit `dist/index.html` directly on server
- ❌ Patch production without source changes
- ❌ Skip verification steps
- ❌ Commit `dist/` to git

---

## 📦 Available Scripts

```bash
# Development
pnpm dev              # Start dev server (port 3000)
pnpm dev:admin        # Start admin dashboard dev server

# Building
pnpm build            # Build for production → dist/
pnpm preview          # Preview production build

# Verification
pnpm verify           # Run all build verifications
pnpm verify:sw        # Check SW version updated
pnpm pre-deploy       # Full pre-deployment suite

# Type Checking
pnpm tsc              # TypeScript compilation check
```

---

## 🧪 Verification Details

### **Build Verification (`pnpm verify`)**

Checks performed:
1. ✅ `dist/` folder exists
2. ✅ `index.html` generated
3. ✅ Hashed JS files present (e.g., `main.a1b2c3d4.js`)
4. ✅ Service Worker version valid
5. ✅ Critical CSS present (loading spinner)
6. ✅ No `localhost` or `127.0.0.1` URLs
7. ✅ TypeScript compiles without errors

**Exit codes:**
- `0` = All checks passed ✅
- `1` = Critical errors, DO NOT deploy ❌

### **SW Version Check (`pnpm verify:sw`)**

Compares:
- Source version: `public/sw.js`
- Built version: `dist/sw.js`

**Validates:**
- SW version updated (cache will invalidate)
- Build hash present (format: `2.3.0+abc123`)
- Network-first strategy configured

### **Pre-Deploy Suite (`pnpm pre-deploy`)**

Comprehensive checks:
1. TypeScript compilation
2. Production build generation
3. Build verification
4. SW version check

**Use before:**
- Major production deploys
- Release candidates
- After significant changes

---

## 🏭 Netlify Build Configuration

**File:** `netlify.toml`

```toml
[build]
  command = "pnpm build"
  publish = "dist"
  
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
  force = false
  conditions = {path = ["!*.js", "!*.css", "!*.png", ...]}
```

**Key settings:**
- **Build command**: `pnpm build` (runs automatically)
- **Publish directory**: `dist/` (built files only)
- **SPA routing**: Redirects non-asset requests to `index.html`
- **Asset exclusions**: Prevents HTML serving for JS/CSS files

**Environment variables:**
Set in Netlify UI (Settings → Environment Variables):
- `VITE_APPWRITE_ENDPOINT`
- `VITE_APPWRITE_PROJECT_ID`
- `VITE_VAPID_PUBLIC_KEY`
- etc.

---

## 📊 Build Output Analysis

### **Typical Build Stats:**
```
vite v6.4.1 building for production...
✓ 1247 modules transformed.
dist/index.html                          18.02 kB │ gzip:   6.45 kB
dist/assets/vendor-react.a1b2c3d4.js   143.21 kB │ gzip:  46.12 kB
dist/assets/vendor-ui.e5f6g7h8.js      187.35 kB │ gzip:  62.47 kB
dist/assets/main.i9j0k1l2.js           943.95 kB │ gzip: 298.73 kB
✓ built in 18.98s
```

**Chunk sizes:**
- `vendor-react`: < 150 KB (React core)
- `vendor-ui`: < 200 KB (UI libraries)
- `vendor-appwrite`: < 100 KB (Backend SDK)
- `main`: < 1 MB (App code)

**Cache-busting:**
All files have content hashes:
- `main.a1b2c3d4.js` → changes to `main.x9y0z1a2.js` on content change
- Browser automatically fetches new version
- Old cached files become unused

---

## 🛡️ Pre-Commit Hooks (Optional)

**Prevent accidental `dist/` commits:**

Create `.git/hooks/pre-commit`:
```bash
#!/bin/bash
if git diff --cached --name-only | grep -q "^dist/"; then
  echo "❌ ERROR: Cannot commit dist/ files!"
  echo "   Edit source files and rebuild instead."
  echo "   Run: pnpm build && pnpm verify"
  exit 1
fi
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

**Effect:**
- Blocks commits containing `dist/` files
- Forces source-only commits
- Prevents production patches without source changes

---

## 🔍 Troubleshooting

### **Build Fails**

```bash
# Check TypeScript errors
pnpm tsc --noEmit

# Clear cache and retry
rm -rf node_modules/.vite
pnpm build
```

### **Verification Fails**

```bash
# See detailed error
node scripts/verify-build.js

# Common fixes:
# - Update SW version in public/sw.js
# - Remove hardcoded localhost URLs
# - Ensure critical CSS present in index.html
```

### **Netlify Deploy Fails**

```bash
# Check build logs in Netlify UI
# Common issues:
# - Missing environment variables
# - Node version mismatch
# - pnpm not installed

# Fix: Add to netlify.toml
[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--version"
```

### **Service Worker Not Updating**

```bash
# 1. Update version in source
nano public/sw.js
# Change: const SW_VERSION = '2.3.0' → '2.3.1'

# 2. Rebuild
pnpm build

# 3. Verify version changed
pnpm verify:sw

# 4. Deploy
git add public/sw.js
git commit -m "chore: bump SW version to 2.3.1"
git push
```

### **White Screen on Mobile**

```bash
# Check critical CSS present
grep "#root:empty::before" dist/index.html

# If missing, ensure present in source index.html
# Then rebuild
pnpm build && pnpm verify
```

---

## 📚 Additional Resources

- **Vite Build Guide**: https://vitejs.dev/guide/build.html
- **Netlify Deploy Docs**: https://docs.netlify.com/
- **Service Worker Guide**: https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API

---

## ✅ Quick Reference

```bash
# Standard workflow
git pull                    # Get latest changes
# ... edit source files ...
pnpm build                  # Build production
pnpm verify                 # Verify output
git add <source-files>      # Stage source only
git commit -m "..."         # Commit with message
git push origin main        # Deploy to production

# Emergency hotfix
git checkout -b hotfix/bug  # Create branch
# ... fix in source ...
pnpm build && pnpm verify   # Build and verify
git push origin hotfix/bug  # Push branch
# Merge to main via PR or CLI

# Verification only
pnpm verify                 # Quick verification
pnpm verify:sw              # Check SW version
pnpm pre-deploy             # Full pre-deploy suite
```

---

**Last Updated:** January 26, 2026  
**Version:** 2.3.0  
**Maintained By:** Production Engineering Team
