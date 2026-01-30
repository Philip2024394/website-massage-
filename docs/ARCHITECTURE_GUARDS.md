# ARCHITECTURE GUARDS - LANDING PAGE PROTECTION SYSTEM

## 🛡️ PRIMARY OBJECTIVE
Guarantee MainLandingPage.tsx NEVER disappears or breaks again through architectural protection.

## 🚨 IMMUTABLE ZONES - DO NOT ENTER

### MainLandingPage.tsx
- **Status**: SEALED, IMMUTABLE, UNREADABLE
- **Rule**: AI cannot open, read, or modify
- **Enforcement**: Treat as black box
- **Reason**: Entry point for all users - any change breaks everything

### Other Protected Components
- TherapistLayout.tsx - Core therapist system
- Critical routing components
- Essential user flow pages

## ✅ MODIFICATION ZONES - EDGES ONLY

### 1. Router Entry Logic
- **Location**: `AppRouter.tsx`, `useURLRouting.ts`
- **Purpose**: Route definitions, navigation logic, entry guards
- **Safety**: Changes here don't affect page internals
- **Examples**: 
  - Add new route definitions
  - Modify redirect logic
  - Add authentication checks

### 2. Error Boundaries
- **Location**: Error boundary components
- **Purpose**: Catch and recover from errors
- **Safety**: Provides fallbacks without touching core pages
- **Examples**:
  - Landing page error boundary
  - Network failure recovery
  - Component crash protection

### 3. Guards Before Page Load
- **Location**: Route guards, middleware
- **Purpose**: Pre-load validation and setup
- **Safety**: Prevents broken states from reaching pages
- **Examples**:
  - Authentication validation
  - Device capability checks
  - Network connectivity guards

### 4. Network/Appwrite Layer
- **Location**: Service files (`*.service.ts`)
- **Purpose**: Data fetching, API calls, external integrations
- **Safety**: Page logic remains untouched
- **Files**:
  - `locationService.ts` - GPS and location logic
  - `deviceService.ts` - Device detection
  - `ipGeolocationService.ts` - IP-based location

### 5. CSS/Global Layout (NOT PAGE JSX)
- **Location**: `index.css`, global stylesheets
- **Purpose**: Visual styling and responsive design
- **Safety**: Styling changes don't affect component logic
- **Examples**:
  - Mobile responsive fixes
  - Animation improvements
  - Layout adjustments

### 6. Context Layer
- **Location**: Context providers (`*Context.tsx`)
- **Purpose**: State management outside components
- **Safety**: Logic lives in context, not in pages
- **Files**:
  - `CityContext.tsx` - City selection and filtering
  - Language contexts
  - User preference contexts

## 🔧 PROBLEM-SOLVING PROTOCOL

### When Landing Page Issues Arise:
1. **NEVER** touch MainLandingPage.tsx
2. Identify the root cause
3. Find which edge zone can solve it
4. Implement solution at the boundary
5. Test thoroughly
6. Document the fix

### Example Fix Locations:
- **Location not working?** → Fix `locationService.ts`
- **City filtering broken?** → Fix `CityContext.tsx`
- **Styling issues?** → Fix `index.css`
- **Routing problems?** → Fix `AppRouter.tsx`
- **Component crashes?** → Add error boundary

## 🏗️ CURRENT ARCHITECTURE STATUS

### ✅ Good Architecture Already in Place
- Country logic stays in MainLandingPage.tsx (FROZEN)
- City logic moved to CityContext.tsx (EDGE)
- Router is custom and untouched (PROTECTED)
- Service layer handles external calls (EDGE)

### 🔒 Freeze These Elements
- Core component structure
- Essential user flows
- Critical business logic
- JSX rendering logic

## 🚫 VIOLATION RESPONSE

If someone tries to modify MainLandingPage.tsx:
1. **IMMEDIATE STOP** - Refer to this document
2. **IDENTIFY ALTERNATIVE** - Find edge solution
3. **ARCHITECTURAL SOLUTION** - Solve at boundaries
4. **DOCUMENT** - Record why and how
5. **VALIDATE** - Ensure landing page remains stable

## 🎯 SUCCESS METRICS

- Landing page stability: 100% uptime
- Zero direct modifications to MainLandingPage.tsx
- All fixes implemented at edges
- Architecture integrity maintained

**RULE: The landing page is UNTOUCHABLE. All solutions happen at the edges.**