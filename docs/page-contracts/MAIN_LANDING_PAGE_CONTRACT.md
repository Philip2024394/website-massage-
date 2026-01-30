# MAIN LANDING PAGE CONTRACT - IMMUTABLE PROTECTION

## 🚨 CRITICAL PROTECTION STATUS
- **File**: `src/pages/MainLandingPage.tsx`
- **Status**: **SEALED - IMMUTABLE - UNREADABLE**
- **Protection Level**: MAXIMUM
- **Last Update**: 2026-01-31

## 🛡️ AI RESTRICTIONS - ABSOLUTE RULES

### FORBIDDEN ACTIONS
- ❌ AI cannot open this file
- ❌ AI cannot read this file
- ❌ AI cannot scroll through this file
- ❌ AI cannot reason about its contents
- ❌ AI cannot modify any line
- ❌ AI cannot suggest changes to JSX
- ❌ AI cannot touch component logic

### WHY THIS EXISTS
The landing page is the entry point for ALL users. Even minor modifications can:
- Break the entire application
- Cause landing page to disappear
- Affect user acquisition
- Disrupt business operations

## ✅ ALLOWED MODIFICATION ZONES (EDGES ONLY)

### 1. Router Entry Logic
- `AppRouter.tsx` - Route definitions
- `useURLRouting.ts` - Navigation logic
- Entry guards and redirects

### 2. Error Boundaries
- Global error catchers
- Fallback components
- Error recovery systems

### 3. Guards Before Page Load
- Authentication checks
- Permission validations
- Pre-load conditions

### 4. Network/Appwrite Layer
- `locationService.ts`
- `deviceService.ts`
- `ipGeolocationService.ts`
- API response handling

### 5. CSS/Global Layout (NOT PAGE JSX)
- `index.css` - Global styles
- Layout wrapper styles
- Responsive breakpoints
- Animation classes

### 6. Context Layer
- `CityContext.tsx` - City selection logic
- Language context
- State management outside page

## 🏗️ CURRENT ARCHITECTURE (PRESERVED)

### What Stays in MainLandingPage.tsx
- Country logic (UNTOUCHED)
- Core component structure (FROZEN)
- Essential user flows (IMMUTABLE)

### What Lives Outside (Good Architecture)
- ✅ City logic → `CityContext.tsx`
- ✅ Location services → Service layer
- ✅ Router logic → Custom routing
- ✅ Styling → CSS files

## 🚫 VIOLATION PROTOCOL

If AI attempts to modify MainLandingPage.tsx:
1. **STOP IMMEDIATELY**
2. Reference this contract
3. Find alternative solution in allowed zones
4. Document why change was needed
5. Implement at the edges

## 🔒 ENFORCEMENT
- This file should be treated as READ-ONLY
- All fixes happen at boundaries
- No exceptions for "small changes"
- Architecture over convenience

**THE LANDING PAGE STAYS UNTOUCHED FOREVER**