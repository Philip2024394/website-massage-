# 🔒 CORE UI - PROTECTED SYSTEM FILES

## ⚠️ CRITICAL WARNING ⚠️

**DO NOT MODIFY WITHOUT ARCHITECT APPROVAL**

This folder contains **PRODUCTION-CRITICAL** files that control the application's boot sequence and landing experience. Changes to these files can cause complete application failure.

---

## 🛡️ Protection Level: MAXIMUM

**Status:** 🔴 **IMMUTABLE** - Changes require explicit approval  
**Users Affected:** 120+ active users + thousands of visitors  
**Failure Impact:** Complete app unusable, blank screens, infinite loops

---

## 📁 Protected Files

### 1. **index.html** (Root Level)
- **Purpose:** Initial HTML shell, orange splash screen
- **Protection:** Must render 100% offline
- **Rules:**
  - ❌ No dynamic imports
  - ❌ No API dependencies
  - ❌ No feature flags
  - ✅ Pure HTML/CSS only

### 2. **LoadingGate.tsx** (`src/pages/LoadingGate.tsx`)
- **Purpose:** Orange loading transition (300ms)
- **Protection:** Zero dependencies except logger
- **Rules:**
  - ❌ No context providers
  - ❌ No async operations
  - ❌ No conditional rendering
  - ✅ Direct navigation only

### 3. **MainLandingPage.tsx** (`src/pages/MainLandingPage.tsx`)
- **Purpose:** First interactive page users see
- **Protection:** Must work offline, no blockers
- **Rules:**
  - ❌ No required API calls
  - ❌ No required authentication
  - ❌ No required location data
  - ✅ All features optional

### 4. **App.tsx** (`src/App.tsx`)
- **Purpose:** Root component with provider hierarchy
- **Protection:** Boot sequence must never fail
- **Rules:**
  - ❌ No blocking async in render
  - ❌ No early returns before providers
  - ❌ No state initialization that can fail
  - ✅ Error boundaries everywhere

### 5. **main.tsx** (`src/main.tsx`)
- **Purpose:** React entry point
- **Protection:** Must mount React app successfully
- **Rules:**
  - ❌ No uncaught errors
  - ❌ No sync blocking operations
  - ✅ Multiple error boundaries

---

## 🚫 ABSOLUTE NO-BREAK RULES

### Landing Page Must NEVER:
- [ ] Fetch from Appwrite before rendering
- [ ] Depend on authentication
- [ ] Require location data
- [ ] Require network connection
- [ ] Have conditional returns that block render

### Loading Page Must NEVER:
- [ ] Re-run on navigation
- [ ] Be controlled by external state
- [ ] Loop infinitely
- [ ] Show blank screen
- [ ] Depend on async data

---

## ✅ ALLOWED MODIFICATIONS

### Safe Changes:
- ✅ Styling (colors, spacing, fonts)
- ✅ Adding optional features (user can ignore)
- ✅ Debug logging
- ✅ Accessibility improvements
- ✅ Performance optimizations (non-breaking)

### Unsafe Changes (Require Approval):
- ⚠️ Changing boot sequence order
- ⚠️ Adding new providers
- ⚠️ Modifying error boundaries
- ⚠️ Changing navigation logic
- ⚠️ Adding async blocking operations

---

## 🔐 Git Protection

### Branch Protection Rules (Required):
```yaml
main branch:
  require_pull_request_reviews: 2
  dismiss_stale_reviews: true
  require_code_owner_reviews: true
  required_approving_review_count: 2
  require_status_checks_to_pass: true
  required_status_checks:
    - "Landing Page Health Check"
    - "Boot Sequence Test"
  enforce_admins: true
  allow_force_pushes: false
  allow_deletions: false
```

### CODEOWNERS Configuration:
```
# Core UI files require architect approval
/core-ui/                    @Philip2024394
/index.html                  @Philip2024394
/src/pages/LoadingGate.tsx   @Philip2024394
/src/pages/MainLandingPage.tsx @Philip2024394
/src/App.tsx                 @Philip2024394
/src/main.tsx                @Philip2024394
```

---

## 🧪 CI/CD Requirements

### Pre-Deployment Checks:
1. **Landing Page Health Check** - Must pass
   - Renders without errors
   - No blank screens
   - No infinite loops
   - Works offline

2. **Boot Sequence Test** - Must pass
   - index.html → LoadingGate → Landing
   - No console errors
   - Completes in <2 seconds

3. **TypeScript Build** - Must pass
   - No type errors
   - No linting violations in core files

### Deployment Blockers:
- ❌ Any test failure blocks deploy
- ❌ No emergency override allowed
- ❌ Manual QA required for core-ui changes

---

## 📊 Monitoring

### Production Alerts (Auto-Deployed):
- 🚨 Boot failure rate > 0.1%
- 🚨 Blank screen reports
- 🚨 Infinite loop detection
- 🚨 Landing page load time > 3s

### Auto-Response:
- Log error details
- Force safe mode (landing page)
- Alert development team
- Create incident report

---

## 🆘 Emergency Procedures

### If Boot Fails:
1. **Immediate:** Roll back to last known good version
2. **Analysis:** Check error logs, reproduce locally
3. **Fix:** Create hotfix branch from last stable
4. **Deploy:** After ALL tests pass

### If Landing Page Breaks:
1. **Immediate:** Serve static HTML fallback (index.html)
2. **Emergency Mode:** Disable React app entirely
3. **User Message:** "Maintenance in progress, please refresh"

---

## 📝 Change Request Template

To modify core-ui files:

```markdown
## Core UI Change Request

**File(s):** [List files]
**Reason:** [Why change is needed]
**Risk Level:** [Low/Medium/High]
**Rollback Plan:** [How to undo]
**Testing:** [How thoroughly tested]
**Approval Required:** 2 senior engineers

### Pre-Change Checklist:
- [ ] Tested locally (dev mode)
- [ ] Tested locally (production build)
- [ ] Tested offline mode
- [ ] Tested slow network (throttle 3G)
- [ ] Verified no console errors
- [ ] Verified no infinite loops
- [ ] Created backup branch
- [ ] Documented rollback procedure

### Post-Deploy Monitoring:
- [ ] Watch error logs for 1 hour
- [ ] Monitor user reports
- [ ] Check boot success rate
- [ ] Verify all platforms (mobile/desktop)
```

---

## 🎯 Golden Rule

> **Landing Page = Safe Mode**  
> Always available, always works, nothing can break it.  
> Everything else is optional.

If in doubt, **DON'T MODIFY**.

---

## 📞 Contact

**Architect:** @Philip2024394  
**Emergency:** [Emergency contact method]  
**Incident Reports:** [Issue tracker link]

---

**Last Updated:** February 9, 2026  
**Protection Level:** MAXIMUM  
**Status:** 🔴 LOCKED
