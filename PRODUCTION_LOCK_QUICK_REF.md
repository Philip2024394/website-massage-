# 🔒 PRODUCTION LOCK - QUICK REFERENCE

## ⚡ Quick Status Check

**Locked Files:**
- Landing pages: `src/pages/MainLandingPage.tsx`, `LandingPage.tsx`, `HomePage.tsx`
- Loading page: `src/pages/LoadingGate.tsx`  
- Bootstrap: `src/App.tsx`, `src/AppRouter.tsx`
- Location logic: GPS collection services

**Status:** 🔴 **HARD LOCK ACTIVE - COMMITS BLOCKED**

---

## 🚫 Can I modify these files?

**NO** - Commits are automatically blocked

**Protection Layers:**
1. ⚠️ In-code warnings (top of each file)
2. 🔒 ESLint rules (prevents dangerous imports)
3. 🛑 Git pre-commit hook (blocks commits)
4. 🚨 CI/CD checks (blocks deployment)
5. 👤 CODEOWNERS (requires owner approval)

**Why?**  
These files were previously crashing. They're now stable and revenue-critical.

---

## ✅ What can users still do?

- Select city on landing page
- Use GPS auto-detect
- Change location
- Navigate normally
- Access app offline

**All user features work. Files are locked from CODE changes only.**

---

## 🛠️ How to check if I'm modifying locked files

```powershell
# Run validation script
pwsh validate-production-lock.ps1
```

Or check CODEOWNERS file for complete list.

---

## 🚨 I need to change a locked file - What do I do?

1. **Read full lock document:**  
   `PRODUCTION_LOCK_LANDING_LOADING.md`

2. **Open GitHub Issue**  
   - Explain why change is needed
   - Tag @Philip2024394
   - Wait for approval

3. **If approved:**  
   - Use `git commit --no-verify` (only with approval)
   - Document change in lock file audit trail
   - Test thoroughly
   - Monitor for 24h after deployment

4. **If unsure:**  
   - **DON'T CHANGE IT**

---

## 📋 Verification Checklist

Before committing changes touching locked files (with approval):

- [ ] Landing page renders in < 1 second
- [ ] Loading screen works (no infinite loops)
- [ ] City selection works
- [ ] App loads offline
- [ ] No blank screens
- [ ] Owner approval obtained
- [ ] Using `--no-verify` flag

---

## 🔧 Protection Layers Explained

### Layer 1: In-Code Comments
Each file has a warning at the top explaining it's locked.

### Layer 2: ESLint Rules
`.eslintrc.cjs` prevents dangerous imports and patterns.

### Layer 3: Git Pre-Commit Hook
Blocks commits automatically. Bypass with `--no-verify` (approval required).

### Layer 4: CI/CD Checks
`ci-check-production-lock.sh` blocks deployment if locked files changed.

### Layer 5: CODEOWNERS
Requires @Philip2024394 approval on GitHub PRs.

---

## 🔍 See Also

- `PRODUCTION_LOCK_LANDING_LOADING.md` - Full documentation
- `CODEOWNERS` - Protected file list
- `validate-production-lock.ps1` - Validation script
- `.eslintrc.cjs` - ESLint rules
- `ci-check-production-lock.sh` - CI check script
- `.github/workflows/production-lock-check.yml` - GitHub Actions

---

**Remember: Stability > Features > Refactors**

🔒 These files are locked to protect user experience and revenue.
