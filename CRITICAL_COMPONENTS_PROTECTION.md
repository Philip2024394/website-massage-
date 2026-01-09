# 🔒 CRITICAL COMPONENTS - PROTECTION REGISTRY

## Overview
This document lists all production-critical components that require approval before modification.

---

## 🚨 LEVEL 1: CRITICAL - DO NOT TOUCH WITHOUT APPROVAL

### Shared Profile System
**Location:** `features/shared-profiles/`  
**Risk Level:** 🔴 CRITICAL  
**Used By:** Thousands of shared links in production  
**Last Verified:** January 10, 2026

**Protected Files:**
- `SharedTherapistProfile.tsx`
- `SharedPlaceProfile.tsx`
- `SharedFacialProfile.tsx`
- `utils/shareUrlBuilder.ts`

**Why Protected:**
- Handles all `/therapist-profile/:id` URLs
- Powers social media sharing (WhatsApp, Facebook, Instagram)
- Critical for SEO and marketing campaigns
- Breaking this breaks customer acquisition pipeline

**See:** `features/shared-profiles/PROTECTION_NOTICE.md`

---

### Routing Configuration
**Location:** `router/routes/profileRoutes.tsx`  
**Risk Level:** 🔴 CRITICAL  
**Used By:** All profile page routing  
**Last Verified:** January 10, 2026

**Why Protected:**
- Maps URLs to components
- Wrong configuration = broken links
- Affects all profile pages platform-wide

---

### Main Router
**Location:** `AppRouter.tsx` (lines 605-616)  
**Risk Level:** 🔴 CRITICAL  
**Section:** `case 'shared-therapist-profile'`  
**Last Verified:** January 10, 2026

**Why Protected:**
- Main routing logic for shared profiles
- Direct impact on all shared links
- Changes here affect thousands of URLs

---

## 🟡 LEVEL 2: IMPORTANT - TEST THOROUGHLY BEFORE DEPLOY

### Chat System Components
**Location:** `chat/FloatingChatWindow.tsx`  
**Risk Level:** 🟡 IMPORTANT  
**Last Verified:** January 10, 2026

**Recent Changes:**
- Lines 477-485: Header now uses profilePicture field
- Fixed: Was showing banner images instead of profile pictures

---

### Therapist Dashboard
**Location:** `apps/therapist-dashboard/src/components/TherapistLayout.tsx`  
**Risk Level:** 🟡 IMPORTANT  
**Last Verified:** January 10, 2026

**Recent Changes:**
- Lines 100-122: Header now uses actual therapist profile picture
- Fixed: Was showing placeholder orange circle

---

## 🟢 LEVEL 3: STANDARD - NORMAL DEVELOPMENT

All other components follow standard development workflow.

---

## 📋 MODIFICATION APPROVAL PROCESS

### Level 1 (Critical) - Requires Approval
1. Create detailed proposal document
2. Get approval from system architect
3. Create feature branch
4. Make changes with comprehensive tests
5. Code review by 2+ senior developers
6. Deploy to staging for 48hr testing
7. Deploy to production with rollback plan ready

### Level 2 (Important) - Requires Testing
1. Create feature branch
2. Make changes
3. Test thoroughly in development
4. Code review by senior developer
5. Deploy to staging for 24hr testing
6. Deploy to production

### Level 3 (Standard) - Normal Workflow
1. Create feature branch
2. Make changes
3. Test in development
4. Code review
5. Deploy

---

## 🆘 EMERGENCY ROLLBACK PROCEDURES

### If Shared Profile System Breaks:

```bash
# 1. Identify the working commit
git log --oneline features/shared-profiles/ router/routes/profileRoutes.tsx AppRouter.tsx

# 2. Revert to last working state (January 10, 2026)
git checkout <working-commit-hash> features/shared-profiles/
git checkout <working-commit-hash> router/routes/profileRoutes.tsx
git checkout <working-commit-hash> AppRouter.tsx

# 3. Commit the revert
git commit -m "EMERGENCY REVERT: Restore working shared profile system"

# 4. Deploy immediately
git push origin main
```

### Verification After Rollback:
- [ ] Test `/therapist-profile/695522d30008e7bb9992-pijat-jakarta-tri`
- [ ] Test `/share/therapist/:id` URLs
- [ ] Check browser console for errors
- [ ] Verify Appwrite connection
- [ ] Test social media sharing

---

## 📊 SYSTEM STATUS DASHBOARD

| System | Status | Last Update | Notes |
|--------|--------|-------------|-------|
| Shared Profiles | ✅ WORKING | Jan 10, 2026 | All tests passing |
| Chat Headers | ✅ WORKING | Jan 10, 2026 | Profile images fixed |
| Profile Routing | ✅ WORKING | Jan 10, 2026 | Using new components |
| Appwrite Integration | ✅ WORKING | Jan 10, 2026 | Direct fetch working |

---

## 🔐 ACCESS CONTROL

**Who Can Modify Level 1 Components:**
- System Architect
- Senior Backend Engineers (with approval)

**Who Can Modify Level 2 Components:**
- Senior Developers
- Mid-level Developers (with review)

**Who Can Modify Level 3 Components:**
- All developers (with code review)

---

**Last Updated:** January 10, 2026  
**Document Version:** 1.0  
**Maintained By:** System Architecture Team
