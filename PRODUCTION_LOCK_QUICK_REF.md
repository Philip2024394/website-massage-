# 🔒 PRODUCTION LOCK - QUICK REFERENCE

## ⚡ Quick Status Check

**Locked Files:**
- Landing pages: `src/pages/MainLandingPage.tsx`, `LandingPage.tsx`, `HomePage.tsx`
- Loading page: `src/pages/LoadingGate.tsx`  
- Bootstrap: `src/App.tsx`, `src/AppRouter.tsx`
- Location logic: GPS collection services

**Status:** 🔴 **HARD LOCK ACTIVE**

---

## 🚫 Can I modify these files?

**NO** - without owner approval (@Philip2024394)

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
   - Document change in lock file audit trail
   - Test thoroughly
   - Monitor for 24h after deployment

4. **If unsure:**  
   - **DON'T CHANGE IT**

---

## 📋 Verification Checklist

Before committing changes touching locked files:

- [ ] Landing page renders in < 1 second
- [ ] Loading screen works (no infinite loops)
- [ ] City selection works
- [ ] App loads offline
- [ ] No blank screens
- [ ] Owner approval obtained

---

## 🔍 See Also

- `PRODUCTION_LOCK_LANDING_LOADING.md` - Full documentation
- `CODEOWNERS` - Protected file list
- `validate-production-lock.ps1` - Validation script

---

**Remember: Stability > Features > Refactors**

🔒 These files are locked to protect user experience and revenue.
