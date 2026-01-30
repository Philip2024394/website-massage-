# ARCHITECTURE RULES

**Status:** ENFORCED  
**Last Updated:** January 31, 2026  
**Authority Level:** PRODUCTION STANDARD

---

## 🎯 PURPOSE

This document establishes **immutable architectural rules** to prevent regressions, maintain stability, and ensure clear ownership boundaries across the application.

**Core Principle:** Every file has exactly one owner. Every concern has exactly one source of truth.

---

## 📐 SYSTEM ARCHITECTURE

### Router
**Type:** Custom hash-based router  
**Owner File:** `src/AppRouter.tsx`  
**Status:** IMMUTABLE

**Rules:**
- ❌ Do NOT replace with React Router
- ❌ Do NOT replace with Next.js router
- ❌ Do NOT introduce route guards without explicit approval
- ❌ Do NOT add middleware layers
- ✅ Routes must fail safely (no blank screens)
- ✅ All routes must be hash-based (`#/route`)

---

## 🗂️ OWNERSHIP MATRIX

### Landing Page
| Concern | Owner File | Write Access | Read Access |
|---------|-----------|--------------|-------------|
| Country detection | `MainLandingPage.tsx` | Owner only | Any (via props) |
| Country persistence | `MainLandingPage.tsx` | Owner only | Any (via localStorage) |
| City list rendering | `MainLandingPage.tsx` | Owner only | N/A |
| Route `/` behavior | `MainLandingPage.tsx` | Owner only | N/A |

**Contract:** See `/docs/page-contracts/LANDING_PAGE_CONTRACT.md`

### City Selection
| Concern | Owner File | Write Access | Read Access |
|---------|-----------|--------------|-------------|
| Selected city | `CityContext.tsx` | Via `updateCity()` | Via `useCityContext()` |
| City persistence | `CityContext.tsx` | Context only | Via context |
| City filtering logic | `HomePage.tsx` | Owner only | N/A |

**Rules:**
- ❌ Do NOT write to `localStorage` key `selectedCity` outside `CityContext.tsx`
- ❌ Do NOT duplicate city state in components
- ✅ Always use `useCityContext()` to read city
- ✅ Always use `updateCity()` to write city

### Booking
| Concern | Owner File | Write Access | Read Access |
|---------|-----------|--------------|-------------|
| Booking state | `BookingContext.tsx` | Context only | Via context |
| Booking flow | Booking components | Owner only | N/A |
| Payment logic | Payment components | Owner only | N/A |

**Rules:**
- ❌ Landing page does NOT access booking state
- ❌ Chat does NOT access booking state
- ❌ Dashboard does NOT modify booking state (read-only)

### Chat
| Concern | Owner File | Write Access | Read Access |
|---------|-----------|--------------|-------------|
| Chat messages | Chat components | Owner only | N/A |
| Chat UI | Chat components | Owner only | N/A |
| Chat state | Chat components | Owner only | N/A |

**Rules:**
- ❌ Landing page does NOT render chat
- ❌ Booking does NOT access chat state
- ❌ Chat does NOT access booking state

### Therapist Dashboard
| Concern | Owner File | Write Access | Read Access |
|---------|-----------|--------------|-------------|
| Dashboard layout | Dashboard root | Owner only | N/A |
| Therapist data | Dashboard components | Owner only | Via props |
| Appointments | Dashboard components | Owner only | Via props |

**Rules:**
- ❌ Landing page does NOT access dashboard
- ❌ Dashboard does NOT modify city selection
- ❌ Dashboard does NOT redirect to landing page

---

## 🔒 SINGLE SOURCE OF TRUTH PRINCIPLE

**Definition:** For every piece of state or logic, there exists exactly ONE authoritative source.

### Enforcement Rules

1. **No Duplication**
   ```typescript
   // ❌ FORBIDDEN
   // In ComponentA.tsx:
   const country = await ipGeolocationService.detect();
   
   // In ComponentB.tsx:
   const country = await ipGeolocationService.detect();
   
   // ✅ CORRECT
   // In MainLandingPage.tsx (owner):
   const country = await ipGeolocationService.detect();
   
   // In other components (consumers):
   const { country } = useCountryContext(); // if exposed
   ```

2. **No Override**
   ```typescript
   // ❌ FORBIDDEN
   useEffect(() => {
     // Overriding CityContext from outside
     localStorage.setItem('selectedCity', 'Jakarta');
   }, []);
   
   // ✅ CORRECT
   const { updateCity } = useCityContext();
   updateCity('Jakarta', 'ID');
   ```

3. **No Recalculation**
   ```typescript
   // ❌ FORBIDDEN
   // In TherapistCard.tsx:
   const nearbyTherapists = therapists.filter(t => 
     calculateDistance(userLocation, t.location) < 10
   );
   
   // ✅ CORRECT
   // Filtering logic lives in HomePage.tsx (owner)
   // TherapistCard receives already-filtered data
   ```

---

## 🚫 ABSOLUTE PROHIBITIONS

### 1. Context Mutation from Outside
```typescript
// ❌ FORBIDDEN
cityContext.city = 'Canggu';
authContext.user = null;

// ✅ CORRECT
updateCity('Canggu', 'ID');
logout();
```

### 2. Global State Side Effects
```typescript
// ❌ FORBIDDEN
useEffect(() => {
  window.appState = { city: 'Jakarta' };
  window.userData = { country: 'ID' };
}, []);

// ✅ CORRECT
// Use proper contexts
updateCity('Jakarta', 'ID');
```

### 3. Hidden Redirects
```typescript
// ❌ FORBIDDEN
useEffect(() => {
  if (!user) window.location.hash = '#/login';
}, [user]);

// ✅ CORRECT (explicit, user-triggered)
const handleSubmit = () => {
  if (validateForm()) {
    window.location.hash = '#/success';
  }
};
```

### 4. Layout Wrapping Without Permission
```typescript
// ❌ FORBIDDEN
// In some parent file:
<FeatureWrapper>
  <MainLandingPage />
</FeatureWrapper>

// ✅ CORRECT
// Landing page controls its own structure
```

### 5. Router Replacement
```typescript
// ❌ FORBIDDEN
import { BrowserRouter } from 'react-router-dom';
import { useRouter } from 'next/router';

// ✅ CORRECT
// Continue using custom hash router
```

---

## 🛡️ CONTEXTS ARE READ-ONLY BY DEFAULT

**Rule:** Unless explicitly stated, contexts expose state but do NOT own logic.

### Context Responsibilities

**CityContext.tsx:**
- ✅ Expose `city`, `countryCode`, `hasSelectedCity`
- ✅ Provide `updateCity()` method
- ✅ Persist to localStorage
- ❌ Do NOT detect IP
- ❌ Do NOT validate authentication
- ❌ Do NOT redirect based on city

**BookingContext.tsx (if exists):**
- ✅ Expose booking state
- ✅ Provide booking methods
- ❌ Do NOT modify city state
- ❌ Do NOT redirect after booking

**AuthContext.tsx (if exists):**
- ✅ Expose user state
- ✅ Provide login/logout methods
- ❌ Do NOT modify city state
- ❌ Do NOT detect country

---

## 🧱 IMPLEMENTATION STANDARD

### Before Writing Code

1. **Identify the owner file**
   ```
   Task: Add country flag display
   Owner: MainLandingPage.tsx (country logic owner)
   Status: Authorized
   ```

2. **Confirm read-only files**
   ```
   Read-only:
   - CityContext.tsx (city state)
   - AppRouter.tsx (router)
   - UniversalHeader.tsx (header)
   ```

3. **Confirm what must not change**
   ```
   Must not change:
   - Landing page routing behavior
   - City selection flow
   - Header visibility
   ```

4. **Implement minimum change**
   ```
   Diff: +5 lines (country flag emoji)
   Files touched: 1 (MainLandingPage.tsx)
   Side effects: 0
   ```

5. **Validate no regressions**
   ```
   ✅ Landing page still renders
   ✅ Country detection still works
   ✅ City selection still works
   ✅ Navigation still works
   ✅ Header still visible
   ```

---

## 📋 TASK ACCEPTANCE CRITERIA

Every task must include:

1. **Owner file identification**
   ```
   Owner: src/pages/MainLandingPage.tsx
   ```

2. **Allowed files list**
   ```
   Allowed:
   - src/pages/MainLandingPage.tsx
   
   Forbidden:
   - src/context/CityContext.tsx
   - src/AppRouter.tsx
   - All other files
   ```

3. **Expected visible change**
   ```
   Expected change:
   - Country flag emoji appears next to country name
   - No layout shifts
   - No routing changes
   - No state changes outside ownership
   ```

4. **Regression prevention**
   ```
   Zero-regression guarantee:
   ✅ Landing page renders
   ✅ No headers disappear
   ✅ No chat breaks
   ✅ No dashboards regress
   ```

---

## 🚨 REGRESSION PREVENTION

### Common Regression Sources (FORBIDDEN)

1. **"Improvement" Refactors**
   ```typescript
   // ❌ FORBIDDEN (unauthorized refactor)
   // "Let me standardize the country detection pattern"
   
   // ✅ CORRECT
   // Only change what's explicitly requested
   ```

2. **Scope Creep**
   ```typescript
   // ❌ FORBIDDEN
   // Task: Add country flag
   // Implementation: Refactored entire landing page + added router guard
   
   // ✅ CORRECT
   // Task: Add country flag
   // Implementation: Added 1 emoji span, 5 lines changed
   ```

3. **"Helpful" Side Effects**
   ```typescript
   // ❌ FORBIDDEN
   useEffect(() => {
     // "I'll also reset the booking state to be helpful"
     clearBookingData();
   }, []);
   
   // ✅ CORRECT
   // Only implement requested behavior
   ```

4. **Unrelated File Touches**
   ```typescript
   // ❌ FORBIDDEN
   // Task: Fix landing page button
   // Files changed:
   //   - MainLandingPage.tsx
   //   - CityContext.tsx (cleaned up)
   //   - AppRouter.tsx (standardized)
   
   // ✅ CORRECT
   // Task: Fix landing page button
   // Files changed:
   //   - MainLandingPage.tsx (1 button style)
   ```

---

## 🧪 TESTING STANDARD

### Pre-Deployment Checklist

- [ ] Landing page renders at `/`
- [ ] Country detection works
- [ ] City selection works
- [ ] Navigation to home page works
- [ ] Header visible and functional
- [ ] No console errors
- [ ] No blank screens
- [ ] No infinite redirects
- [ ] No state conflicts
- [ ] No layout breaks

### Critical User Flows

1. **Landing → City Selection → Home**
   ```
   1. User lands on /
   2. Country auto-detected
   3. User selects city
   4. Navigates to /#/home
   5. Sees filtered therapists
   ```

2. **Landing → Country Change → City Selection**
   ```
   1. User lands on /
   2. Country auto-detected (e.g., USA)
   3. User clicks "Change country"
   4. Selects different country (e.g., Thailand)
   5. City list updates to Thailand cities
   6. User selects city
   7. Navigates to home
   ```

3. **Landing → GPS Location**
   ```
   1. User lands on /
   2. User clicks "Use My GPS Location"
   3. Browser asks permission
   4. User allows
   5. GPS coordinates detected
   6. Nearest city matched
   7. Navigates to home
   ```

All flows must work after every change.

---

## 📞 ESCALATION PROTOCOL

### When to Stop and Ask

1. **Ambiguous requirement**
   ```
   "Add country support" → Which file? Which concern?
   STOP → Ask for clarification
   ```

2. **Boundary crossing**
   ```
   Task touches MainLandingPage.tsx AND CityContext.tsx
   STOP → Ask which is primary owner
   ```

3. **Unclear ownership**
   ```
   "Fix city filtering" → In HomePage? In Landing? In Context?
   STOP → Ask for owner file
   ```

4. **Risk of regression**
   ```
   Task requires changing router behavior
   STOP → Confirm authorization
   ```

### Escalation Contacts

**Architecture Decisions:** Project Owner  
**Contract Violations:** Immediate revert + owner notification  
**Unclear Requirements:** Request clarification before implementation

---

## ✅ SUCCESS METRICS

This architecture succeeds when:

1. **Zero surprise regressions**
   - No page "disappears"
   - No state conflicts
   - No navigation breaks

2. **Clear ownership**
   - Every file has documented owner
   - Every concern has single source of truth
   - No ambiguity about responsibilities

3. **Stable boundaries**
   - Landing never affected by booking changes
   - Dashboard never affects city selection
   - Chat never modifies global state

4. **Predictable changes**
   - Diff size matches task scope
   - Side effects documented
   - Regression tests pass

---

## 📚 RELATED DOCUMENTATION

- [Landing Page Contract](/docs/page-contracts/LANDING_PAGE_CONTRACT.md)
- [Component Ownership Matrix](/docs/COMPONENT_OWNERSHIP.md) (if exists)
- [State Management Guide](/docs/STATE_MANAGEMENT.md) (if exists)

---

**This architecture is ENFORCED. Violations require immediate revert.**
