# Therapist Card Display Troubleshooting Guide 🔍

## Issue Report
**Problem**: Therapist cards not displaying on live app from dashboard save. Live card info should be displayed on therapist profile page for edit.

## Diagnostic Steps

### 1. **Data Flow Verification**

#### **Check 1: Save Process**
**Location**: `hooks/useProviderAgentHandlers.ts` - `handleSaveTherapist`

**Console Commands to Run in Browser DevTools:**
```javascript
// 1. Check if save function is being called
localStorage.getItem('debug_therapist_save') // Should show recent save attempts

// 2. Check therapist data in localStorage
JSON.parse(localStorage.getItem('app_therapists') || '[]')

// 3. Check if therapist has isLive=true
const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
therapists.filter(t => t.isLive === true)
```

#### **Check 2: Profile Data Loading**
**Location**: `pages/TherapistDashboardPage.tsx` - `fetchTherapistData`

**Expected Behavior:**
- Profile loads existing data when therapist returns to edit
- Form fields populate with saved information
- isLive status reflects correctly

#### **Check 3: Home Page Filtering**
**Location**: `pages/HomePage.tsx` - Line 365

**Filter Chain:**
```tsx
const liveTherapists = nearbyTherapists.filter((t: any) => t.isLive === true);
```

### 2. **Common Issues & Solutions**

#### **Issue A: isLive Status Problem**
**Symptoms**: 
- Therapist saves profile successfully
- Profile doesn't appear on home page
- Admin dashboard shows therapist as inactive

**Debug Steps:**
1. Check Appwrite database directly
2. Verify `isLive` field is set to `true`
3. Check if therapist update vs create is working

**Fix**: Ensure `isLive: true` is set in both create and update operations

#### **Issue B: State Update Problem**
**Symptoms**:
- Profile saves but doesn't reflect immediately
- Need to refresh page to see changes
- Form doesn't load saved data

**Debug Steps:**
1. Check if `setTherapists()` is called after save
2. Verify therapist ID matching logic
3. Check for race conditions in async operations

#### **Issue C: Profile Loading Problem**
**Symptoms**:
- Saved data doesn't appear when editing profile
- Form starts empty despite having saved data
- `fetchTherapistData` fails to load existing data

**Debug Steps:**
1. Check `therapistService.getById()` calls
2. Verify therapist ID consistency
3. Check Appwrite query permissions

### 3. **Testing Protocol**

#### **Step 1: Test Save Process**
1. Open browser DevTools → Console
2. Navigate to Therapist Dashboard
3. Fill out profile form
4. Click "Save Profile"
5. **Check Console for:**
   ```
   💾 SAVE BUTTON CLICKED - Starting save process...
   💾 Calling onSave with data: {...}
   ✅ Therapist profile saved successfully
   ```

#### **Step 2: Test Data Persistence**
1. After saving, refresh the page
2. Navigate back to profile editing
3. **Verify:** Form fields are populated with saved data
4. **Check Console for:**
   ```
   📖 Fetching therapist data for ID: [ID]
   ✅ Found existing therapist profile: {...}
   ```

#### **Step 3: Test Live Display**
1. After saving profile, navigate to Home page
2. **Verify:** Therapist card appears in listings
3. **Check Console for:**
   ```
   🔴 Live nearby therapists (isLive=true): [count > 0]
   ```

### 4. **Debug Console Commands**

#### **Check Therapist Data in State:**
```javascript
// In browser console on any page
window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.[1]?.currentFiber?.stateNode?.state?.therapists
```

#### **Check Appwrite Database:**
```javascript
// Check if therapist exists in database
fetch('/api/therapists/[therapistId]').then(r => r.json()).then(console.log)
```

#### **Force Refresh Therapist Data:**
```javascript
// Trigger data refresh
localStorage.removeItem('app_therapists');
window.location.reload();
```

### 5. **Expected Console Output (Success)**

#### **During Save:**
```
💾 SAVE BUTTON CLICKED - Starting save process...
📋 Profile data being saved: {...}
💾 Calling onSave with data: {...}
✅ onSave called successfully
💾 Saving therapist data: {...}
✏️ Updating existing profile, going live immediately
✅ Therapist profile saved successfully
🔄 Updated therapists state with new data
```

#### **During Profile Load:**
```
📖 Fetching therapist data for ID: [ID]
✅ Found existing therapist profile: {...}
📋 Profile data breakdown: {...}
```

#### **During Home Page Display:**
```
🏠 HomePage Therapist Display Debug (Location-Filtered):
  📊 Total therapists prop: [count]
  🔴 Live nearby therapists (isLive=true): [count > 0]
  🎯 Final filtered therapists: [count > 0]
```

### 6. **Quick Fixes to Try**

#### **Fix 1: Clear Cache & Reload**
```javascript
// Clear all app data and reload
localStorage.clear();
sessionStorage.clear();
window.location.reload();
```

#### **Fix 2: Force Live Status**
If therapist exists but isLive=false, manually set:
```javascript
const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
therapists.forEach(t => { if (t.name === '[THERAPIST_NAME]') t.isLive = true; });
localStorage.setItem('app_therapists', JSON.stringify(therapists));
window.location.reload();
```

### 7. **Error Patterns to Look For**

#### **Save Errors:**
- ❌ `onSave prop received: false` → AppRouter prop missing
- ❌ `Error in handleSave` → Validation or API error
- ❌ `Permission denied` → Appwrite authentication issue

#### **Load Errors:**
- ❌ `No existing profile found` → Data not saved properly
- ❌ `Error loading therapist data` → Database query issue
- ❌ `Could not load therapist data` → Authentication issue

#### **Display Errors:**
- ❌ `Live nearby therapists: 0` → isLive status problem
- ❌ `Final filtered therapists: 0` → Location/type filtering issue
- ❌ Empty therapist cards → Data structure problem

---

**Next Steps**: Run through this diagnostic protocol to identify the specific issue with therapist data display and persistence.