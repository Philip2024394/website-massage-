# PWA GOLD STANDARD AUDIT REPORT
**Date:** February 8, 2026  
**Audit Type:** Pre-Implementation Compliance Check  
**Objective:** Achieve Uber/GoJek-grade PWA install experience

---

## 🔍 AUDIT FINDINGS

### ❌ CRITICAL VIOLATIONS

#### 1. Manifest.json - Icon Source (VIOLATION)
**Location:** `public/manifest.json` lines 16-58  
**Issue:** All icons use CDN URLs (ImageKit) instead of local assets  
**Current:** `https://ik.imagekit.io/7grri5v7d/indastreet_massage_button-removebg-preview.png`  
**Required:** `/icon-512.png` (local asset)  
**Risk:** CDN failure = No icon on home screen, failed store review  

#### 2. Manifest.json - Start URL (VIOLATION)
**Location:** `public/manifest.json` line 5  
**Issue:** `start_url: "/?pwa=true&page=status"`  
**Required:** `start_url: "/"`  
**Risk:** Tracking params break app routing, session loss on install  

#### 3. Vite Config Conflict (VIOLATION)
**Location:** `vite.config.ts` lines 60-80  
**Issue:** Manifest duplicated in vite.config.ts with different start_url  
**Current:** vite.config has `start_url: "/"` but uses CDN icons  
**Required:** Single source of truth (public/manifest.json)  
**Risk:** Build-time manifest overrides runtime manifest  

#### 4. Missing Scope Awareness (VIOLATION)
**Location:** Multiple files  
**Issue:** `PWAInstallBanner` shows on all pages without context detection  
**Current:** Same banner on consumer pages and dashboard  
**Required:** Separate banners for Main App vs Dashboard  
**Risk:** Dashboard users see consumer install prompt  

---

## ✅ COMPLIANT AREAS

1. **Service Worker Caching**
   - ✅ NO caching of Appwrite API calls
   - ✅ NO caching of booking flows
   - ✅ NO caching of auth sessions
   - ✅ Only static assets + ImageKit images cached

2. **State Preservation**
   - ✅ PWAStateManager component exists
   - ✅ State preservation logic in place

3. **Platform Detection**
   - ✅ iOS detection implemented
   - ✅ beforeinstallprompt capture working
   - ✅ Standalone mode detection active

4. **User Control**
   - ✅ Install requires user tap (no auto-prompts)
   - ✅ Banners are dismissible
   - ✅ 7-day dismissal timeout

---

## 📋 REQUIRED CHANGES

### Priority 1: Manifest Integrity (CRITICAL)
- [ ] Replace all CDN icon URLs with local paths
- [ ] Change start_url from `/?pwa=true&page=status` to `/`
- [ ] Remove manifest from vite.config.ts (use public/manifest.json only)
- [ ] Verify 512x512 maskable icon exists locally

### Priority 2: Scope-Aware Banners
- [ ] Create `MainAppPWABanner.tsx` for consumer pages
- [ ] Create `DashboardPWABanner.tsx` for admin/therapist/partner dashboards
- [ ] Implement context detection (pathname-based)
- [ ] Add copy variants: "Download IndaStreet App" vs "Install Dashboard App"

### Priority 3: Visual Standards
- [ ] Reduce banner size (current is too large)
- [ ] Make non-blocking (bottom banner, not modal)
- [ ] Ensure dismissible with clear X button
- [ ] Add subtle animation (slide-up from bottom)

### Priority 4: iOS Instructions
- [ ] Simplify iOS modal text (currently too long)
- [ ] Use visual icons for Safari steps
- [ ] Test on real iOS device

---

## 🎯 GOLD STANDARD REQUIREMENTS CHECKLIST

### 1. Install UX Rules
- [x] Custom install banners (not browser defaults)
- [x] Show only when beforeinstallprompt available
- [x] Never force auto-prompts
- [x] User action required to trigger install
- [ ] **Missing:** Scope-aware banner variants

### 2. Platform-Specific Behavior
- [x] Android/Chrome: beforeinstallprompt capture
- [x] Android/Chrome: Branded button/banner
- [x] iOS: No programmatic install attempts
- [x] iOS: Instruction modal with steps
- [ ] **Missing:** Cleaner iOS instructions

### 3. Scope & Context Awareness
- [ ] ❌ Main App banner on consumer pages only
- [ ] ❌ Dashboard banner on admin/therapist/partner only
- [x] Don't show if already installed
- [x] Don't show in standalone mode

### 4. Manifest & Install Integrity (LOCKED)
- [ ] ❌ start_url: "/"
- [x] scope: "/"
- [x] id: "/"
- [ ] ❌ Icons: Local assets, not CDN
- [ ] ❌ 512×512 maskable icon
- [x] display: "standalone"

### 5. State Safety (Critical)
- [x] PWAStateManager active
- [ ] **Needs verification:** Booking state preserved during install
- [ ] **Needs verification:** Chat state preserved during install
- [ ] **Needs verification:** Dashboard session preserved during install

### 6. Service Worker Rules (DO NOT VIOLATE)
- [x] Cache static assets only
- [x] NEVER cache booking flows
- [x] NEVER cache auth sessions
- [x] NEVER cache API calls
- [x] NEVER cache Appwrite requests
- [x] Offline mode does NOT allow bookings

### 7. Visual & UX Standards
- [x] Minimal design
- [ ] **Needs improvement:** More non-blocking (current modal-style on some pages)
- [x] Dismissible
- [x] Clear copy ("Download App" / "Install Dashboard App")

### 8. Change Control
- [ ] **Action required:** Lock PWA install logic after implementation
- [ ] **Action required:** Require explicit confirmation for any PWA changes

---

## 🚀 IMPLEMENTATION PLAN

### Phase 1: Fix Manifest Integrity (30 minutes)
1. Update `public/manifest.json`:
   - Replace all ImageKit URLs with `/icon-{size}.png`
   - Change start_url to `/`
   - Verify all icon files exist in public/

2. Update `vite.config.ts`:
   - Remove embedded manifest
   - Use public/manifest.json as single source of truth

### Phase 2: Create Scope-Aware Banners (45 minutes)
1. Create `src/components/pwa/MainAppPWABanner.tsx`:
   - Only show on consumer-facing routes (/, /therapist/:id, /place/:id)
   - Copy: "Download IndaStreet App"
   - Minimal bottom banner design

2. Create `src/components/pwa/DashboardPWABanner.tsx`:
   - Only show on dashboard routes (/therapist, /admin, /place)
   - Copy: "Install Dashboard App"
   - Same minimal design, different copy

3. Update route detection logic:
   - useLocation() hook for pathname detection
   - Context provider for dashboard vs consumer mode

### Phase 3: Refine iOS UX (20 minutes)
1. Update `PWAInstallIOSModal.tsx`:
   - Shorten instruction text
   - Add visual step indicators
   - Test on iOS Safari

### Phase 4: Testing & Validation (30 minutes)
1. Test install flow on Android Chrome
2. Test iOS instructions on Safari
3. Verify state preservation during install
4. Verify no booking/chat interruption

### Phase 5: Documentation & Lock (15 minutes)
1. Create `PWA_GOLD_STANDARD_IMPLEMENTATION.md`
2. Document all changes
3. Add change control warnings
4. Lock PWA logic with comments

---

## ⚠️ BLOCKING ISSUES

1. **MUST FIX BEFORE DEPLOY:** CDN icons in manifest
2. **MUST FIX BEFORE DEPLOY:** start_url with query params
3. **SHOULD FIX BEFORE DEPLOY:** Scope-aware banners
4. **NICE TO HAVE:** Simplified iOS instructions

---

## 📝 NOTES

- Current PWA infrastructure is 70% gold-standard compliant
- Main issues are manifest integrity and scope awareness
- Service worker caching rules are already compliant (excellent!)
- State preservation logic exists but needs testing under install scenario

---

**Audit completed by:** GitHub Copilot  
**Next steps:** Proceed with Phase 1 (Manifest Integrity) implementation
