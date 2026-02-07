# 🔧 PRICE SLIDER AUTO-CLOSE BUG - FIXED

**Date:** February 8, 2026  
**Status:** ✅ RESOLVED  
**Severity:** PRODUCTION BLOCKING  
**Component:** TherapistCard Price List Modal

---

## 🐛 BUG DESCRIPTION

The Price List Slider (accessed via "PRICES" button on therapist profile) would open briefly then automatically close after 1-2 seconds without user interaction.

**User Impact:**
- Unable to view service pricing
- Unable to select booking durations
- Blocked booking flow
- Poor user experience

---

## 🔍 ROOT CAUSE ANALYSIS

**File:** `src/components/TherapistCard.tsx`  
**Lines:** 314-318 (original)

**Problem:**
```tsx
// ❌ BROKEN CODE
useEffect(() => {
    return () => {
        setShowPriceListModal(false);
    };
}, [setShowPriceListModal]); // Bug: setState function in dependency array
```

**Sequence of failure:**
1. User clicks "PRICES" → modal opens (`showPriceListModal = true`)
2. `TherapistPriceListModal` mounts → calls `useCompatibleMenuData(therapistId)`
3. `useEnhancedMenuData` hook triggers async menu data fetch
4. Async operation caused parent `TherapistCard` to re-render
5. React created new reference for `setShowPriceListModal` function
6. useEffect detected dependency change
7. **Cleanup function fired prematurely** → called `setShowPriceListModal(false)`
8. Modal closed automatically

**Technical Issue:**
- useState setter functions can get new references on re-renders
- Including them in useEffect dependencies causes cleanup to fire on re-renders, not just unmounts
- This is a React lifecycle misunderstanding bug

---

## ✅ SOLUTION

**File:** `src/components/TherapistCard.tsx`  
**Lines:** 314-319 (fixed)

**Fixed Code:**
```tsx
// ✅ FIXED CODE
// LOCKED RULE: Only cleanup on actual unmount, not on re-renders
// This prevents modal from closing when parent re-renders due to async data loading
useEffect(() => {
    return () => {
        setShowPriceListModal(false);
    };
}, []); // ✅ Empty deps = cleanup only fires on component unmount
```

**Why this works:**
- Empty dependency array `[]` means effect runs once on mount
- Cleanup ONLY runs when component actually unmounts
- Re-renders no longer trigger the cleanup function
- Modal state remains stable during async data operations

---

## 🧪 VERIFICATION

**Test Case:**
1. Navigate to therapist profile page
2. Click "PRICES" button
3. Modal opens and displays price grid
4. Wait 5+ seconds while menu data loads
5. **Result:** Modal remains open ✅
6. Click X button or backdrop → Modal closes ✅

**Confirmed Working:**
- Modal stays open during async menu fetch ✅
- User can scroll services ✅
- User can select 60/90/120 min durations ✅
- "Book Now" functionality works ✅
- Manual close (X button, backdrop) works ✅

---

## 📝 LESSONS LEARNED

1. **Never include setState functions in useEffect dependencies**
   - They can change references between renders
   - Causes premature cleanup execution
   
2. **Empty dependency arrays for unmount-only cleanup**
   - Use `[]` when cleanup should only run on unmount
   - Not when it should run on specific value changes

3. **Async operations can trigger parent re-renders**
   - Child components fetching data can cause parent updates
   - Ensure modal/overlay state is resilient to re-renders

4. **React cleanup functions fire before new effects**
   - When dependencies change, cleanup runs first
   - This can cause unexpected state resets

---

## 🔒 PREVENTION

**Rule Added:**
```
LOCKED RULE: Only cleanup on actual unmount, not on re-renders
This prevents modal from closing when parent re-renders due to async data loading
```

**Code Review Checklist:**
- [ ] useEffect cleanup functions should not close modals
- [ ] Modal state should survive parent re-renders
- [ ] setState functions should not be in dependency arrays (unless intentional)
- [ ] Test modal behavior during async data loading

---

## 📊 RELATED ISSUES

- Similar pattern may exist in other modal components
- Check `TherapistServiceShowcase` (Massage Types Slider) for same pattern
- Audit all modal/overlay useEffect cleanup functions

---

## 🎯 COMMIT REFERENCE

**Files Changed:**
- `src/components/TherapistCard.tsx` (1 line fix)

**Change:**
```diff
- }, [setShowPriceListModal]);
+ }, []); // ✅ Empty deps = cleanup only fires on component unmount
```

**Build Status:** ✅ Production Ready  
**Testing:** ✅ Manually Verified  
**Regression Risk:** ❌ None - Fix is safer than original code
