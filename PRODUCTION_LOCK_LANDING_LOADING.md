# 🔒 PRODUCTION LOCK — LANDING & LOADING PAGES

**Status:** ACTIVE — HARD LOCK  
**Owner:** @Philip2024394  
**Last Verified:** February 9, 2026

---

## ⚠️ CRITICAL PRODUCTION LOCK

The Landing Page and Loading Page are **FIXED and STABLE**.  
They were previously crashing and failing to load.  
They are now working correctly and **MUST NOT CHANGE AGAIN**.

---

## 🔐 LOCKED FILES (DO NOT MODIFY WITHOUT OWNER APPROVAL)

### Core Landing/Loading Components
- `src/pages/MainLandingPage.tsx` - Primary landing page
- `src/pages/LandingPage.tsx` - Alternative landing page
- `src/pages/LoadingGate.tsx` - Loading/splash screen
- `src/pages/HomePage.tsx` - Home page fallback

### Bootstrap & Routing
- `src/App.tsx` - Application initialization
- `src/AppRouter.tsx` - Route configuration
- `src/context/LoadingContext.tsx` - Loading state management

### Location Selection System
- `src/services/customerGPSCollectionService.ts` - GPS collection logic
- `src/services/simpleGPSBookingIntegration.ts` - Location integration
- Components handling city/location selection on landing page

---

## ❌ PROHIBITED ACTIONS

**DO NOT:**
- ❌ Refactor these files
- ❌ Rename components or files
- ❌ Move files to different directories
- ❌ Add new dependencies
- ❌ Add new hooks, effects, or async logic
- ❌ Add logging, diagnostics, or experiments
- ❌ Change render timing, polling, or lifecycle behavior
- ❌ Modify initial app bootstrap flow
- ❌ Change route definitions for landing/loading pages

**⚠️ Any change here risks a full app outage.**

---

## ✅ REQUIRED FUNCTIONALITY (MUST PRESERVE)

### User Capabilities
Users **MUST** be able to:
- ✅ View landing page immediately on app load
- ✅ Select a city via location slider
- ✅ Allow auto-detect location (GPS)
- ✅ Change location without page reload
- ✅ See loading screen without infinite loops
- ✅ Access app even if location detection fails

### Location Logic Requirements
Location system **MAY:**
- ✅ Read from browser geolocation API
- ✅ Read/write selected city to storage or state
- ✅ Trigger navigation AFTER selection

Location system **MUST NOT:**
- 🚫 Affect landing page render flow
- 🚫 Block initial paint
- 🚫 Delay loading screen resolution
- 🚫 Cause re-mount of the root app
- 🚫 Make API calls before user interaction

---

## 🧱 ARCHITECTURAL RULES (ENFORCED)

### Landing Page Architecture
```typescript
// ✅ CORRECT: Pure UI + minimal state
const LandingPage = () => {
  const [selectedCity, setSelectedCity] = useState(null);
  
  // Minimal, isolated logic
  const handleCitySelect = (city) => {
    setSelectedCity(city);
    navigateToHome();
  };
  
  return <UI />;
};
```

```typescript
// ❌ WRONG: Side effects, API calls, complex logic
const LandingPage = () => {
  useEffect(() => {
    fetchUserData(); // ❌ NO
    initializeServices(); // ❌ NO
    trackAnalytics(); // ❌ NO
  }, []);
  
  return <UI />;
};
```

### Requirements
1. **Landing page = pure UI + minimal state**
2. **No direct API calls from landing page**
3. **No database access from landing page**
4. **No side effects except:**
   - Reading location
   - Saving selected location

### Location Selection Must Be
- **Isolated** - Does not affect other systems
- **Fail-safe** - App loads even if it fails
- **Non-blocking** - Does not delay initial render

---

## 🚨 FAILURE PROTECTION

### Landing Page Must Always Render
Even if:
- ❌ Location API fails
- ❌ Network is offline
- ❌ Storage is empty or corrupted
- ❌ Third-party services are down

### Default Behavior on Failure
```typescript
// Always provide safe fallback
const location = getLocation() || DEFAULT_LOCATION;
const providers = getProviders() || ALL_PROVIDERS;
```

**Show:**
- All providers (no filtering)
- Manual city selection option
- Clear error messages (not blank screens)

**Never Show:**
- Blank screens
- Infinite loaders
- Uncaught errors
- White screen of death

---

## 🛑 CHANGE CONTROL PROCESS

### Before Making ANY Change

**If touching:**
- Landing page
- Loading page  
- App bootstrap
- Location initialization

**You MUST:**
1. ✋ **STOP** - Get explicit approval from @Philip2024394
2. 📋 Document exact change and reason
3. 🧪 Create isolated test environment
4. ✅ Pass manual verification of initial load
5. 🔄 Verify no regression in existing behavior
6. 📊 Monitor for 24h after deployment

### If Unsure
**→ DO NOT CHANGE**

---

## ✅ VERIFICATION CHECKLIST

Before any deployment touching locked files:

- [ ] Landing page renders in < 1 second
- [ ] Loading screen appears and resolves correctly
- [ ] City selection works (manual + auto-detect)
- [ ] App loads with no network connection
- [ ] App loads with location permission denied
- [ ] No infinite loading loops
- [ ] No blank/white screens
- [ ] Navigation from landing → home works
- [ ] All locked files unchanged (or approved changes only)

---

## 🎯 FINAL DIRECTIVE

**Treat these files as PRODUCTION-CRITICAL.**

**Priority Order:**
1. **Stability** ← HIGHEST
2. Features
3. Refactors ← LOWEST

**The app must always load exactly as it does now.**

---

## 📞 EMERGENCY CONTACT

**Owner:** @Philip2024394  
**Repository:** website-massage-  
**Lock Established:** February 9, 2026

**If absolutely necessary to modify locked files:**
1. Open GitHub Issue with detailed justification
2. Tag @Philip2024394
3. Wait for explicit approval
4. Follow change control process above

**No exceptions. No emergency bypasses.**

---

## 🔍 AUDIT TRAIL

| Date | Action | Files | Approver | Status |
|------|--------|-------|----------|--------|
| 2026-02-09 | Lock established | All landing/loading files | @Philip2024394 | ✅ Active |
| | | | | |
| | | | | |

---

**🔒 This lock is permanent until explicitly removed by the owner.**
