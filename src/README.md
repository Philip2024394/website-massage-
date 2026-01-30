# Source Code - Indastreet Massage Platform

This directory contains the React application source code.

---

## 🔒 ARCHITECTURE GOVERNANCE

**CRITICAL:** This codebase is governed by strict ownership rules and contracts.

Before modifying ANY file, consult:
- **[Architecture Rules](/docs/ARCHITECTURE_RULES.md)** - System-wide boundaries and prohibitions
- **[Landing Page Contract](/docs/page-contracts/LANDING_PAGE_CONTRACT.md)** - Landing page immutability rules

### Quick Reference

**Router Type:** Custom hash-based (NOT React Router, NOT Next.js)  
**State Management:** React Context API + localStorage  
**Routing File:** `AppRouter.tsx` (IMMUTABLE)

### Page Ownership

| Page | Owner File | Route | Contract |
|------|-----------|-------|----------|
| Landing Page | `pages/MainLandingPage.tsx` | `/` | [View Contract](/docs/page-contracts/LANDING_PAGE_CONTRACT.md) |
| Home Page | `pages/HomePage.tsx` | `/#/home` | N/A |
| Booking | Booking components | `/#/booking/*` | N/A |
| Dashboard | Dashboard components | `/#/dashboard/*` | N/A |

### Context Ownership

| Context | Owner File | Purpose | Write Access |
|---------|-----------|---------|--------------|
| City Selection | `context/CityContext.tsx` | Selected city state | Via `updateCity()` only |
| Booking | `context/BookingContext.tsx` | Booking flow state | Via context methods only |
| Auth | Auth components | User authentication | Via auth methods only |

---

## 🚫 ABSOLUTE RULES

1. **Do NOT modify `MainLandingPage.tsx` without explicit authorization**
2. **Do NOT duplicate state** - Single source of truth for every concern
3. **Do NOT add redirects** without explicit approval
4. **Do NOT touch routing** without explicit approval
5. **Do NOT refactor** unless explicitly requested

---

## 📋 BEFORE MAKING CHANGES

1. Identify the **owner file** for the concern
2. Check if file is **read-only** (contexts, router)
3. Confirm **expected visible change**
4. List **forbidden files**
5. Verify **zero regressions**

**If uncertain, STOP and ask for clarification.**

---

## 🛡️ REGRESSION PREVENTION

This app has suffered production regressions from:
- Unauthorized refactors
- State duplication
- Hidden side effects
- Router modifications
- Context mutations
- Layout wrapping

**Every change must preserve existing behavior unless explicitly authorized to change it.**

---

## 📞 QUESTIONS?

See full architecture documentation at `/docs/ARCHITECTURE_RULES.md`

**Contract Authority:** Project Owner  
**Violation Protocol:** Immediate revert + root cause analysis
