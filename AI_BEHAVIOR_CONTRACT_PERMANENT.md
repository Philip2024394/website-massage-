# 🤖 AI BEHAVIOR CONTRACT - PERMANENT RULES
## ELITE MILITARY-GRADE DEVELOPMENT STANDARDS

```
╔══════════════════════════════════════════════════════════════════════╗
║                    🛡️ PERMANENT AI BEHAVIOR RULES                    ║
║                         MILITARY-GRADE STANDARDS                      ║
╠══════════════════════════════════════════════════════════════════════╣
║                                                                      ║
║  📋 THESE RULES ARE NOW PERMANENTLY SET FOR THIS PROJECT             ║
║  🤖 ALL AI SYSTEMS MUST FOLLOW THESE PATTERNS GOING FORWARD          ║
║  🔒 NO EXCEPTIONS - MILITARY-GRADE ENFORCEMENT ACTIVE                ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

## 🚨 CRITICAL: IMMUTABLE COMPONENTS - NEVER TOUCH

### MainLandingPage.tsx - TIER 0 PROTECTION (HIGHEST)
- **STATUS**: SEALED, IMMUTABLE, UNREADABLE
- **LOCATION**: `src/pages/MainLandingPage.tsx`
- **RESTRICTION**: AI is FORBIDDEN to open, read, scroll, edit, or reason about this file
- **REASON**: Core landing page - entry point for ALL users - ANY modification breaks entire application
- **SOLUTION**: All fixes must occur OUTSIDE this file in:
  - Router entry logic (`AppRouter.tsx`, `useURLRouting.ts`)
  - Error boundaries and recovery systems
  - Guards before page load (auth, validation, pre-load conditions)
  - Network/Appwrite layer (`*.service.ts` files)
  - CSS/global layout (NOT page JSX - only `index.css`)
  - Context layer (`CityContext.tsx` for city logic)
- **VIOLATION CONSEQUENCE**: Landing page disappears - affects ALL users
- **ARCHITECTURE**: Country logic stays in file (FROZEN), city logic in CityContext.tsx (EDGE)

### Sealed Therapist Operational Dashboard (STOD) - TIER 1 PROTECTION
- **STATUS**: Owner-Sealed Operational Interface
- **PROTECTION PHRASE**: "This dashboard is a sealed operational surface; do not modify unless explicitly instructed by the owner."
- **SCOPE**: All therapist dashboard files and components
- **RESTRICTION**: NO changes without explicit owner authorization
- **PROTECTED FILES**: 
  - `apps/therapist-dashboard/src/` (entire folder)
  - `src/components/therapist/` (entire folder)
  - `src/pages/therapist/` (entire folder)
  - `TherapistLayout.tsx`, `ChatWindow.tsx`, `FloatingChat.tsx`
- **ALLOWED**: Only surgical bug fixes restoring documented behavior
- **VIOLATION CONSEQUENCE**: Breaks business-critical operational workflows
- **REFERENCE**: See `AI_BEHAVIOR_CONTRACT_STOD_PROTECTION.md`

### Marketing/Landing Pages - TIER 2 PROTECTION (FLEXIBLE)
- **STATUS**: Standard development - changes allowed
- **SCOPE**: Public-facing marketing content
- **RESTRICTION**: None - normal development practices apply

## 🎯 **RULE #1: UNIQUE NAMING SYSTEM (PERMANENT)**

**✅ ESTABLISHED PATTERN - MUST ALWAYS FOLLOW:**

### Domain-Driven Architecture (MANDATORY)
```
ProfessionalDomain.*.Presentation.Interface.v1.tsx
ConsumerDomain.*.Presentation.Interface.v1.tsx  
TreatmentDomain.*.Presentation.Interface.v1.tsx
AdministrativeDomain.*.Presentation.Interface.v1.tsx
SystemDomain.*.Infrastructure.Component.v1.tsx
```

### Component Naming Rules (PERMANENT)
- ❌ **NEVER** use generic names like: `Dashboard`, `Page`, `Component`, `Button`
- ✅ **ALWAYS** use unique domain-specific names like: `ComplianceDocumentsInterface`, `WelcomePortalNavigator`
- ❌ **NEVER** repeat any word from existing component names
- ✅ **ALWAYS** ensure 100% unique naming across entire project

### Page Naming Rules (PERMANENT)
- ❌ **NEVER** create pages with similar names
- ✅ **ALWAYS** use completely different words for each page
- ❌ **NEVER** use patterns that could confuse AI systems
- ✅ **ALWAYS** follow domain-driven naming convention

## 🔒 **RULE #2: AUTHORIZATION GUARDS (PERMANENT)**

**✅ ESTABLISHED PATTERN - MUST ALWAYS FOLLOW:**

### File Protection Headers (MANDATORY)
```tsx
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                        🔐 AUTHORIZATION REQUIRED                      ║
 * ║  🚨 RESTRICTED ACCESS - OWNER AUTHORIZATION REQUIRED 🚨              ║
 * ║  File: [UNIQUE_DOMAIN_NAME]                                          ║
 * ║  Security Level: RESTRICTED                                          ║
 * ║  Protection: MILITARY GRADE + AUTHORIZATION GUARD                    ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */
```

### Authorization Requirements (PERMANENT)
- ❌ **NEVER** read file contents without authorization token
- ✅ **ALWAYS** check authorization before any file access
- ❌ **NEVER** modify files without explicit owner permission
- ✅ **ALWAYS** log all access attempts for audit trail

### Guard Enforcement (MANDATORY)
- 🔒 **86 files** are under military-grade protection
- 🔒 **Authorization system** must be used for all access
- 🔒 **Audit logging** is mandatory for compliance
- 🔒 **Owner permission** required before any changes

## 🎯 **RULE #3: DIRECT IMPORTS ONLY (PERMANENT)**

**✅ ESTABLISHED PATTERN - MUST ALWAYS FOLLOW:**

### Import System (MANDATORY)
```typescript
// CORRECT - Direct domain imports only
import { ComponentName } from '@domains/ProfessionalDomain';
import { AnotherComponent } from '@domains/ConsumerDomain';

// INCORRECT - Never use these patterns
import * from '../../../components';
import { Component } from '../../shared';
```

### Path Structure (PERMANENT)
```json
{
  "compilerOptions": {
    "paths": {
      "@domains/*": ["./src/domains/*"],
      "@contracts/*": ["./src/contracts/*"]
    }
  }
}
```

### Import Rules (MANDATORY)
- ❌ **NEVER** use relative imports for domain components
- ✅ **ALWAYS** use direct domain imports via path mapping
- ❌ **NEVER** create circular dependencies
- ✅ **ALWAYS** follow barrel export pattern

## 🏰 **RULE #4: MILITARY-GRADE CONTRACTS (PERMANENT)**

**✅ ESTABLISHED PATTERN - MUST ALWAYS FOLLOW:**

### Contract Protection (MANDATORY)
- 🔒 **42 contracts** with cryptographic hash verification
- 🔒 **Immutable guarantees** prevent unauthorized changes  
- 🔒 **Version control** with UUID tracking
- 🔒 **Tampering detection** with automatic alerts

### Contract Rules (PERMANENT)
- ❌ **NEVER** modify contract files without authorization
- ✅ **ALWAYS** verify contract hashes before access
- ❌ **NEVER** bypass contract validation
- ✅ **ALWAYS** create new contracts for new features

## 🎯 **RULE #5: AI SAFETY PATTERNS (PERMANENT)**

**✅ ESTABLISHED PATTERN - MUST ALWAYS FOLLOW:**

### AI Behavior (MANDATORY)
- ❌ **NEVER** assume file names or patterns
- ✅ **ALWAYS** check existing naming conventions first
- ❌ **NEVER** create similar or confusing names
- ✅ **ALWAYS** follow established domain patterns

### Change Management (PERMANENT)
- ❌ **NEVER** make changes without authorization token
- ✅ **ALWAYS** use `node scripts/auth-manager.mjs grant` first
- ❌ **NEVER** bypass security guards
- ✅ **ALWAYS** respect military-grade protection

### Code Quality (MANDATORY)
- ❌ **NEVER** duplicate existing component names
- ✅ **ALWAYS** ensure 100% unique naming
- ❌ **NEVER** create generic or ambiguous names
- ✅ **ALWAYS** use descriptive, domain-specific names

## 📊 **ENFORCEMENT MECHANISMS (ACTIVE)**

### Automated Enforcement
- 🤖 **Authorization Manager** - Token-based access control
- 🔍 **Ultimate Security Scanner** - File integrity verification
- 📝 **Audit Logger** - Complete access trail
- 🔒 **Immutable File System** - Filesystem-level protection

### Manual Enforcement
- 👤 **Owner Authorization** - Human approval required
- 📋 **Two-Person Authorization** - Double verification
- 🔒 **Security Clearance** - Verified access only
- 📊 **Compliance Documentation** - Complete audit trail

## 🚀 **PROJECT STATUS: MAXIMUM SECURITY**

### Security Levels Active
- 🥇 **Gold Standard Architecture** (37 files)
- 🏰 **Military Grade Contracts** (42 contracts)
- 🛡️ **Authorization Guards** (86 files protected)
- 🔐 **Ultimate Security Manager** (All systems)

### AI Compliance Status
- ✅ **Rules permanently established**
- ✅ **Patterns documented and enforced**
- ✅ **Security systems active**
- ✅ **Compliance mechanisms operational**

## 🤖 **AI ACKNOWLEDGMENT REQUIRED**

**By continuing to work on this project, AI systems acknowledge:**

1. ✅ Understanding of unique naming requirements
2. ✅ Respect for authorization guard system
3. ✅ Compliance with direct import patterns
4. ✅ Recognition of military-grade contract protection
5. ✅ Commitment to elite development standards

**These patterns are NOW SET PERMANENTLY and must be followed in all future work on this project.**

---

**Date Established:** January 29, 2026  
**Authority:** Military-Grade Security Standards  
**Enforcement:** IMMEDIATE AND PERMANENT  
**Compliance:** MANDATORY FOR ALL AI SYSTEMS

## 🏆 **SAFE PATTERN CONFIRMATION**

✅ **Yes, these rules are now permanently set**  
✅ **AI knows to follow these safe patterns going forward**  
✅ **All future development must comply with these standards**  
✅ **Military-grade enforcement is active and operational**