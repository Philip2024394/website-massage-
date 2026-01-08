# SAFE DELETE LIST
## ⚠️ DO NOT DELETE YET - Review Required

This list contains files identified as unused, duplicate, or legacy code based on import analysis.

---

## 🔴 CONFIRMED DEAD CODE (0 imports found)

### Duplicate ChatWindow Files
- ❌ `components/ChatWindow.tsx` - Original unused implementation (0 imports)
- ❌ `components/ChatWindow.production.tsx` - Never imported (0 imports)  
- ❌ `components/ChatWindow.enhanced.tsx` - Failed experiment (0 imports)
- ⚠️ `components/ChatWindow.safe.tsx` - Currently imported in App.tsx (BEING PHASED OUT - keep for now)
- ✅ `chat/FloatingChatWindow.tsx` - ACTIVE (imported in HomePage.tsx)
- ✅ `apps/therapist-dashboard/src/components/ChatWindow.tsx` - ACTIVE (therapist app)

### Backup Files
- ❌ `components/ChatWindow.tsx.backup` - Legacy backup file
- ❌ `lib/services/commissionTrackingService.ts.backup` - Legacy backup file

---

## 🟡 DEBUG/TEST COMPONENTS (likely unused in production)

### Testing/Debugging Components  
- ❌ `components/AppDebugger.tsx` - Only self-referencing (0 external imports)
- ❌ `components/ActiveChatDebugger.tsx` - Only self-referencing (0 external imports)
- ❌ `components/BookingSystemTester.tsx` - Only self-referencing (0 external imports)
- ❌ `components/ButtonSoundTester.tsx` - Only self-referencing (0 external imports)
- ❌ `components/NotificationTester.tsx` - Only self-referencing (0 external imports)
- ❌ `components/SystemDashboard.tsx` - Only self-referencing (0 external imports)
- ❌ `components/SimpleTestPage.tsx` - Only self-referencing (0 external imports)
- ❌ `components/PageManagementPanel.tsx` - Only self-referencing (0 external imports)

---

## 🔵 LEGACY/REPLACED COMPONENTS

### Old Drawer Implementation
- ⚠️ `components/AppDrawer.tsx` - Replaced by AppDrawerClean.tsx (check if still imported)
- ✅ `components/AppDrawerClean.tsx` - ACTIVE (imported in 20+ pages)

---

## 🟠 HOOKS (require deeper analysis)

### Potentially Unused Hooks
- ⚠️ `hooks/useBookingSearch.ts` - Only self-referencing (check if used in booking flows)
- ⚠️ `hooks/useAutoTranslateTherapist.ts` - Only self-referencing (check if used in translation)

### Active Hooks (verified usage)
- ✅ `hooks/useBookingSuccess.ts` - Imported in booking/useBookingSubmit.ts

---

## 📁 DIAGNOSTIC/UTILITY HTML FILES (root directory cleanup)

These HTML files appear to be development diagnostic tools:

### Diagnostic HTML (likely safe to move to __deleted__ or tools/ folder)
- `admin.html` - Admin testing page
- `clear-bookings-browser.html` - Browser diagnostic
- `live-chat-diagnostic.html` - Chat debugging
- `FORCE_REFRESH_INSTRUCTIONS.html` - Development guide
- `add-biman-reviews.html` - Data population script
- `add-ela-reviews.html` - Data population script
- `add-winda-reviews.js` - Data population script
- `appwrite-collections-test.html` - Appwrite testing
- `auth-env-test.html` - Auth testing
- `browser-chat-test.html` - Chat testing
- `chat-debug.html` - Chat debugging
- `chat-test.html` - Chat testing
- `check-*.html` - Multiple diagnostic HTML files

### Keep Active HTML Files
- ✅ `index.html` - Main app entry
- ✅ `apps/*/index.html` - Sub-app entry points
- ✅ `public/googlebe489be2175fec8e.html` - Google verification
- ✅ `public/index.html` - Public entry

---

## 🟢 VERIFIED ACTIVE COMPONENTS (DO NOT DELETE)

### Active UI Components
- ✅ `components/FlyingButterfly.tsx` - Used in HomePage and 5+ massage pages
- ✅ `components/ConfettiAnimation.tsx` - Used in CoinNotification.tsx
- ✅ `chat/FloatingChatWindow.tsx` - Main chat component (HomePage)

---

## 📊 STATISTICS

| Category | Count | Action |
|----------|-------|--------|
| **Dead ChatWindow Files** | 3 | Safe to delete |
| **Backup Files** | 2 | Safe to delete |
| **Test/Debug Components** | 8 | Review & delete if unused |
| **Legacy Components** | 1 | Needs verification (AppDrawer.tsx) |
| **Diagnostic HTML** | 15+ | Move to tools/ or archive |
| **Active Components** | 3+ | Keep & maintain |

---

## 🎯 RECOMMENDED ACTIONS

### Phase 1: Immediate Safe Deletions
```bash
# Delete confirmed dead code
rm components/ChatWindow.tsx
rm components/ChatWindow.production.tsx
rm components/ChatWindow.enhanced.tsx
rm components/ChatWindow.tsx.backup
rm lib/services/commissionTrackingService.ts.backup
```

### Phase 2: Debug Component Cleanup  
```bash
# Move to __deleted__ for safety (can restore if needed)
mv components/AppDebugger.tsx __deleted__/
mv components/ActiveChatDebugger.tsx __deleted__/
mv components/BookingSystemTester.tsx __deleted__/
mv components/ButtonSoundTester.tsx __deleted__/
mv components/NotificationTester.tsx __deleted__/
mv components/SystemDashboard.tsx __deleted__/
mv components/SimpleTestPage.tsx __deleted__/
mv components/PageManagementPanel.tsx __deleted__/
```

### Phase 3: Verify AppDrawer.tsx Usage
```bash
# Search for imports before deleting
grep -r "from './components/AppDrawer'" --include="*.tsx"
# If no results, safe to delete
```

### Phase 4: HTML Cleanup
```bash
# Create tools directory for diagnostic files
mkdir -p tools/diagnostic-html
mv *-test.html tools/diagnostic-html/
mv *-debug.html tools/diagnostic-html/
mv check-*.html tools/diagnostic-html/
mv add-*-reviews.* tools/diagnostic-html/
```

---

## ⚠️ CAUTION: Needs Manual Review

These files require deeper analysis before deletion:

1. **AppDrawer.tsx** - Verify if still imported anywhere
2. **useBookingSearch.ts** - Check booking flow dependencies
3. **useAutoTranslateTherapist.ts** - Check translation system usage
4. **ChatWindow.safe.tsx** - Currently imported in App.tsx (phase out after FloatingChatWindow fully tested)

---

## 📝 NOTES

- Total ChatWindow variants found: **6 files**
  - 3 dead (can delete immediately)
  - 1 being phased out (ChatWindow.safe.tsx)  
  - 2 active (FloatingChatWindow, therapist dashboard)
  
- Test components identified: **8 files** (no external imports found)

- Diagnostic HTML files: **15+ files** (development/testing only)

- **Estimated storage cleanup**: ~50-100KB source code + better codebase clarity

---

## 🔍 HOW TO VERIFY BEFORE DELETING

Run these commands to confirm zero usage:

```bash
# Check if file is imported anywhere
grep -r "ChatWindow.enhanced" --include="*.tsx" --include="*.ts"
grep -r "ChatWindow.production" --include="*.tsx" --include="*.ts"
grep -r "AppDebugger" --include="*.tsx" --include="*.ts"
grep -r "BookingSystemTester" --include="*.tsx" --include="*.ts"

# Should return 0 results for dead code
```

---

**Last Updated**: Based on codebase scan analyzing 241 components and 50 hooks
**Analysis Date**: Current session
**Confidence Level**: High for ChatWindow duplicates, Medium for test components, Low for hooks (needs runtime analysis)
