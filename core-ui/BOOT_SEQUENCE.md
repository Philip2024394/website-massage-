# 🚀 Boot Sequence Documentation

## 📊 Official Boot Flow (LOCKED)

This document defines the **immutable** boot sequence that must never change.

```
┌─────────────────────────────────────────────────────────┐
│ PHASE 1: HTML LOAD (0-100ms)                           │
│ File: index.html                                         │
│ ✅ Orange background rendered                           │
│ ✅ PWA splash visible                                   │
│ ✅ Skeleton loader hidden                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 2: REACT MOUNT (100-250ms)                       │
│ File: main.tsx                                          │
│ ✅ Error boundaries wrap                                │
│ ✅ React root mounts                                    │
│ ✅ No blocking operations                               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 3: APP INIT (250-400ms)                          │
│ File: App.tsx                                           │
│ ✅ Providers initialize (non-blocking)                  │
│ ✅ State starts with safe defaults                      │
│ ✅ Router resolves page                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 4: LOADING GATE (400-700ms)                      │
│ File: LoadingGate.tsx                                   │
│ ✅ Orange screen with brand                             │
│ ✅ 300ms timeout                                        │
│ ✅ Navigation to landing                                │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ PHASE 5: LANDING PAGE (700-1000ms)                     │
│ File: MainLandingPage.tsx                               │
│ ✅ Full UI rendered                                     │
│ ✅ User can interact                                    │
│ ✅ Optional features load async                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔒 Phase Guarantees

### Phase 1: HTML Load
**Guarantees:**
- Orange background visible immediately
- No white flash
- No blank screen
- Works offline
- No JavaScript required

**Violations:**
- ❌ Changing body background color
- ❌ Adding async scripts that block render
- ❌ Requiring network requests

### Phase 2: React Mount
**Guarantees:**
- React mounts successfully
- Error boundaries catch all errors
- No uncaught exceptions
- Falls back to static HTML if React fails

**Violations:**
- ❌ Removing error boundaries
- ❌ Adding sync blocking operations
- ❌ Throwing errors outside boundaries

### Phase 3: App Init
**Guarantees:**
- Providers wrap successfully
- State initializes with safe defaults
- Router resolves without errors
- No blocking async operations

**Violations:**
- ❌ Starting with `isLoading = true`
- ❌ Required async calls in render
- ❌ Conditional provider wrapping

### Phase 4: Loading Gate
**Guarantees:**
- Shows orange screen with brand
- Timeout guaranteed (300ms)
- Navigation guaranteed
- No infinite loops

**Violations:**
- ❌ Removing timeout
- ❌ Adding conditional rendering
- ❌ Depending on external state

### Phase 5: Landing Page
**Guarantees:**
- Always renders
- No required data
- No required auth
- No required location
- Works offline

**Violations:**
- ❌ Adding required API calls
- ❌ Blocking on auth
- ❌ Requiring location data
- ❌ Conditional returns

---

## 🛡️ Fallback Strategy

### If Any Phase Fails:
```javascript
try {
  // Attempt normal boot
  phases[1] → phases[2] → phases[3] → phases[4] → phases[5]
} catch (error) {
  // Force landing page immediately
  renderLandingPageFallback();
}
```

### Fallback Hierarchy:
1. **Normal Boot** (all phases)
2. **Skip Loading Gate** (direct to landing)
3. **Static HTML Landing** (no React)
4. **Emergency Message** (last resort)

---

## ⏱️ Performance Targets

| Phase | Target | Maximum | Alert Threshold |
|-------|--------|---------|-----------------|
| HTML Load | 50ms | 100ms | 150ms |
| React Mount | 150ms | 250ms | 400ms |
| App Init | 100ms | 200ms | 300ms |
| Loading Gate | 300ms | 300ms | 350ms |
| Landing Page | 200ms | 500ms | 1000ms |
| **Total Boot** | **800ms** | **1350ms** | **2000ms** |

---

## 🧪 Required Tests

### 1. Boot Sequence Test
```javascript
describe('Boot Sequence', () => {
  it('completes within 1.5 seconds', async () => {
    const start = Date.now();
    await loadApp();
    const duration = Date.now() - start;
    expect(duration).toBeLessThan(1500);
  });
  
  it('shows landing page after boot', async () => {
    await loadApp();
    expect(screen.getByText('IndaStreet')).toBeInTheDocument();
  });
  
  it('never shows blank screen', async () => {
    const screenshots = await captureBootFrames();
    screenshots.forEach(frame => {
      expect(frame).not.toBeBlank();
    });
  });
});
```

### 2. Offline Test
```javascript
it('boots successfully offline', async () => {
  await setOfflineMode();
  await loadApp();
  expect(screen.getByText('IndaStreet')).toBeInTheDocument();
});
```

### 3. Error Injection Test
```javascript
it('falls back to landing page on error', async () => {
  mockReactError();
  await loadApp();
  expect(document.body).toContainHTML('IndaStreet');
});
```

---

## 📝 Console Log Sequence

**Expected logs in order:**
```
1. ✅ Splash hidden - boot manager initialized
2. 🔄 LoadingGate mounted
3. 🔒 LoadingGate: Lock engaged
4. [ROUTER] Resolving page: loading
5. ✅ LoadingGate: Timeout complete
6. [ROUTER] Resolving page: landing
7. 🧭 Router resolved - rendering landing page
8. 🔥 Landing mounted
9. 🎬 LandingPage component mounted
```

**Any deviation = FAILURE**

---

## 🚨 Emergency Contacts

If boot sequence breaks:
1. Check console logs against expected sequence
2. Verify all 5 phases complete
3. Check error monitoring dashboard
4. Roll back immediately if critical

---

**Last Verified:** February 9, 2026  
**Status:** ✅ OPERATIONAL  
**Next Audit:** After any core-ui change
