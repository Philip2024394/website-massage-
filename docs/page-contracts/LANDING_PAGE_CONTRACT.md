# LANDING PAGE CONTRACT

**Status:** ENFORCED  
**Last Updated:** January 31, 2026  
**Authority Level:** IMMUTABLE WITHOUT EXPLICIT APPROVAL

---

## 🔒 OWNERSHIP DECLARATION

### Owner File
**`src/pages/MainLandingPage.tsx`**

This file is the **SINGLE SOURCE OF TRUTH** for:
- Landing page routing
- Country detection logic (IP + fallback)
- Country persistence (localStorage)
- City list rendering
- Navigation trigger after city selection

### Route
**`/` (hash-based root)**

This is the application entry point. No other component may:
- Redirect away from `/`
- Inject content into `/`
- Override routing behavior at `/`
- Conditionally hide `/`

---

## ✅ EXPLICIT RESPONSIBILITIES

`MainLandingPage.tsx` owns and controls:

1. **Country Detection**
   - IP-based detection via `ipGeolocationService`
   - Regional fallback mapping (40+ countries → 10 supported)
   - Detection method tracking (`'ip'` or `'saved'`)
   - Auto-detection badge display

2. **Country Persistence**
   - Writing to `localStorage` key: `userCountry`, `userCountryDetectionMethod`
   - Reading saved preferences on mount
   - Overriding IP detection with saved preferences

3. **Country State Management**
   - Current country code state
   - Country data lookup from `COUNTRIES` array
   - Country modal visibility
   - Country change handlers

4. **City List Rendering**
   - Filtering cities by selected country (`CITIES_BY_COUNTRY[countryCode]`)
   - Search filtering within city list
   - City selection buttons
   - Scrollable city container

5. **Navigation Trigger**
   - Setting city in `CityContext` via `updateCity()`
   - Navigating to home page after city selection
   - GPS location flow initiation

---

## ❌ EXPLICIT NON-RESPONSIBILITIES

`MainLandingPage.tsx` does **NOT** own:

1. **City State Persistence**
   - Owned by: `src/context/CityContext.tsx`
   - Landing page reads from context, writes via `updateCity()` only

2. **Booking Logic**
   - Owned by: Booking components
   - Landing page has zero booking awareness

3. **Chat Logic**
   - Owned by: Chat components
   - Landing page does not render chat UI

4. **Dashboard Logic**
   - Owned by: Dashboard components
   - Landing page does not access therapist/admin state

5. **Header/Navigation**
   - Owned by: `UniversalHeader.tsx`
   - Landing page imports header, does not implement it

6. **Routing System**
   - Owned by: `AppRouter.tsx`
   - Landing page is a route consumer, not a router

---

## 🚫 HARD PROHIBITIONS

### No Redirects
```typescript
// ❌ FORBIDDEN
useEffect(() => {
  if (someCondition) {
    window.location.hash = '#/home';
  }
}, []);

// ✅ ALLOWED (controlled navigation after user action)
const handleCitySelect = (city) => {
  updateCity(city);
  setTimeout(() => window.location.hash = '#/home', 500);
};
```

### No Side Effects via useEffect
```typescript
// ❌ FORBIDDEN (modifying global state)
useEffect(() => {
  localStorage.setItem('globalTheme', 'dark');
  window.userPrefs = { country: 'ID' };
}, []);

// ✅ ALLOWED (internal state only)
useEffect(() => {
  detectCountryFromIP().then(setCountryCode);
}, []);
```

### No Global State Writes
```typescript
// ❌ FORBIDDEN
useEffect(() => {
  resetAllContexts(); // Touches other page state
  clearBookingData();  // Outside ownership
}, []);

// ✅ ALLOWED
useEffect(() => {
  const savedCountry = localStorage.getItem('userCountry');
  if (savedCountry) setCurrentCountryCode(savedCountry);
}, []);
```

### No Context Mutation
```typescript
// ❌ FORBIDDEN
useEffect(() => {
  cityContext.cities = filteredCities; // Direct mutation
  authContext.reset();                 // Outside ownership
}, []);

// ✅ ALLOWED
const handleCitySelect = (city) => {
  updateCity(city.name, city.country); // Via official API
};
```

### No Layout Wrapping
```typescript
// ❌ FORBIDDEN (adding wrappers from outside)
// In some other file:
<LayoutWrapper>
  <MainLandingPage />
</LayoutWrapper>

// ✅ ALLOWED (landing page controls its own structure)
// In MainLandingPage.tsx:
<div className="landing-container">
  <UniversalHeader />
  {/* Landing page content */}
</div>
```

### No Router Replacement
```typescript
// ❌ FORBIDDEN
import { BrowserRouter } from 'react-router-dom';
// Wrapping app in React Router

// ❌ FORBIDDEN
import { useRouter } from 'next/router';
// Introducing Next.js router

// ✅ ALLOWED
// Continue using custom hash router
window.location.hash = '#/home';
```

---

## 📋 SINGLE SOURCE OF TRUTH RULES

### Country State
- **Owner:** `MainLandingPage.tsx`
- **Read Access:** Any component (via props/context if exposed)
- **Write Access:** `MainLandingPage.tsx` ONLY
- **Persistence:** `MainLandingPage.tsx` ONLY

### City State
- **Owner:** `src/context/CityContext.tsx`
- **Read Access:** Any component via `useCityContext()`
- **Write Access:** Via `updateCity()` method ONLY
- **Persistence:** `CityContext.tsx` ONLY

### No Duplication
```typescript
// ❌ FORBIDDEN (duplicate country detection)
// In HomePage.tsx:
const detectedCountry = await ipGeolocationService.detect();

// ❌ FORBIDDEN (duplicate city persistence)
// In TherapistDashboard.tsx:
localStorage.setItem('selectedCity', city);

// ✅ ALLOWED (reading from official source)
const { city, countryCode } = useCityContext();
```

---

## 🤖 AI SAFETY RULES

Any AI agent or developer working on tasks that touch `/` (landing page) must:

### 1. Quote This Contract
Before making changes, explicitly state:
```
"I am working on the landing page, which is governed by 
/docs/page-contracts/LANDING_PAGE_CONTRACT.md"
```

### 2. List Allowed Files
```
Allowed files:
- src/pages/MainLandingPage.tsx
- (any other files explicitly approved)

Forbidden files:
- src/context/CityContext.tsx (read-only)
- AppRouter.tsx (immutable)
- UniversalHeader.tsx (immutable)
- (all other files unless explicitly approved)
```

### 3. State Expected Visible Change
```
Expected visible change:
- [Specific UI element] will [specific behavior]
- No routing changes
- No header changes
- No state changes outside ownership
```

### 4. Zero-Regression Guarantee
Before implementing:
```
Regression check:
✅ Landing page still renders
✅ Country detection still works
✅ City selection still works
✅ Navigation to home page still works
✅ No other pages affected
```

---

## 🛡️ ENFORCEMENT MECHANISMS

### Code Review Checklist
- [ ] Does this change touch `MainLandingPage.tsx`?
- [ ] Was the contract quoted in the PR description?
- [ ] Are forbidden files listed?
- [ ] Is expected visible change documented?
- [ ] Does landing page still render after change?
- [ ] Are there new `useEffect` side effects?
- [ ] Are there new global state writes?
- [ ] Are there new redirects?

### Automated Checks (Recommended)
```bash
# Check for forbidden patterns
grep -r "window.location.hash = '#/home'" src/pages/MainLandingPage.tsx
grep -r "resetAllContexts()" src/pages/MainLandingPage.tsx
grep -r "clearBookingData()" src/pages/MainLandingPage.tsx

# Verify single source of truth
grep -r "ipGeolocationService.detect()" src/ | grep -v "MainLandingPage.tsx"
# Should return empty (only landing page detects country)

grep -r "localStorage.setItem('userCountry'" src/ | grep -v "MainLandingPage.tsx"
# Should return empty (only landing page persists country)
```

---

## 📝 CHANGE HISTORY

### January 31, 2026 - Contract Established
- Defined ownership: `MainLandingPage.tsx`
- Documented responsibilities and non-responsibilities
- Established hard prohibitions
- Created AI safety rules
- No runtime changes made

---

## 🚨 VIOLATION PROTOCOL

If this contract is violated:

1. **Identify the violation:**
   - Which file was modified?
   - Which prohibition was broken?
   - What side effect was introduced?

2. **Immediate revert:**
   - Roll back the violating change
   - Restore previous working state
   - Test landing page renders correctly

3. **Root cause analysis:**
   - Why was the contract not followed?
   - Was the task ambiguous?
   - Was the contract not visible?

4. **Update contract if needed:**
   - Add missing prohibition
   - Clarify ambiguous rule
   - Add example of violation

---

## ✅ SUCCESS CRITERIA

This contract succeeds if:

1. **Landing page never "disappears" again**
   - No blank screens
   - No infinite redirects
   - No hidden renders

2. **Clear boundaries exist**
   - Any developer/AI knows what's allowed
   - Any change requires contract consultation
   - No "helpful" refactors break production

3. **Single source of truth maintained**
   - No duplicate country detection
   - No duplicate city persistence
   - No state conflicts

4. **Zero collateral damage**
   - Working on booking doesn't break landing
   - Working on dashboard doesn't break landing
   - Working on chat doesn't break landing

---

## 📞 CONTACT / ESCALATION

**Contract Authority:** Project Owner  
**Modification Requires:** Explicit written approval  
**Violation Reporting:** Immediate revert + root cause analysis

**This contract is IMMUTABLE without explicit approval.**
