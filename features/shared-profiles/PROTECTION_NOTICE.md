# 🔒 SHARED PROFILES - PROTECTED SYSTEM

## ⚠️ CRITICAL WARNING

**This directory contains PRODUCTION-CRITICAL components that handle ALL shared profile links.**

### 🚨 DO NOT MODIFY WITHOUT APPROVAL

Any changes to files in this directory can break:
- ✅ Thousands of shared links in production
- ✅ Social media sharing (Facebook, WhatsApp, Instagram)
- ✅ SEO and Google rankings
- ✅ Marketing campaigns
- ✅ Customer bookings from shared links

---

## 📁 Protected Files

### **Core Components** (🔴 HIGH RISK)
- `SharedTherapistProfile.tsx` - Handles `/therapist-profile/:id` and `/share/therapist/:id`
- `SharedPlaceProfile.tsx` - Handles `/share/place/:id`
- `SharedFacialProfile.tsx` - Handles `/share/facial/:id`

### **Utility Files** (🟡 MEDIUM RISK)
- `utils/shareUrlBuilder.ts` - URL generation logic
- `utils/shareHelpers.ts` - Sharing functionality
- `utils/shortUrlResolver.ts` - Short URL resolution

### **Configuration** (🟢 LOW RISK - BUT TEST BEFORE DEPLOY)
- `README.md` - Documentation
- `index.ts` - Exports

---

## ✅ LAST VERIFIED WORKING

**Date:** January 10, 2026  
**Status:** ✅ ALL SYSTEMS OPERATIONAL  
**Tests Passed:**
- ✅ Direct URL access works
- ✅ Appwrite data fetching successful
- ✅ Profile images (not banners) displaying correctly
- ✅ Chat window headers show profile pictures
- ✅ Scrolling behavior fixed
- ✅ Social media meta tags generated properly
- ✅ SEO optimization working

---

## 🔧 TESTED ROUTES

```
✅ /therapist-profile/695522d30008e7bb9992-pijat-jakarta-tri
✅ /therapist-profile/6953d926002d001a0ab1-pijat-bandung-heri
✅ /share/therapist/:id
✅ /share/place/:id
✅ /share/facial/:id
```

---

## 📋 MODIFICATION CHECKLIST

If you MUST modify files here, follow this checklist:

### Before Making Changes:
- [ ] Read all code comments in the file
- [ ] Understand the current working implementation
- [ ] Create a backup branch
- [ ] Document WHY the change is needed

### Testing Requirements:
- [ ] Test with real production URLs
- [ ] Test direct URL access (not just navigation)
- [ ] Test on mobile and desktop
- [ ] Test social media sharing (WhatsApp, Facebook)
- [ ] Verify Appwrite data fetching works
- [ ] Check browser console for errors
- [ ] Test with multiple therapist/place IDs

### After Changes:
- [ ] Clear browser cache and test again
- [ ] Test in incognito/private mode
- [ ] Verify all shared links still work
- [ ] Update this PROTECTION_NOTICE.md with new test date
- [ ] Document changes in git commit message

---

## 🆘 IF SOMETHING BREAKS

### Immediate Actions:
1. **REVERT IMMEDIATELY** - Don't try to fix forward
2. **Restore from last working commit** (January 10, 2026)
3. **Test restored version thoroughly**
4. **Document what went wrong**

### Working Commit Reference:
```bash
# Last known working state
# Commit: [Will be updated when pushed]
# Date: January 10, 2026
```

---

## 🏗️ Architecture Overview

### Data Flow:
```
User opens shared link
    ↓
useAppState.ts detects URL pattern
    ↓
Sets page to 'shared-therapist-profile'
    ↓
AppRouter.tsx routes to SharedTherapistProfile
    ↓
Component extracts ID from URL
    ↓
Fetches therapist data from Appwrite
    ↓
Renders TherapistProfileBase with data
```

### Key Dependencies:
- **Appwrite**: Direct database access (REQUIRED)
- **TherapistProfileBase**: Presentation component
- **shareUrlBuilder**: URL generation utilities
- **analyticsService**: View tracking

---

## 📞 SUPPORT

**If you need to modify these files:**
- Contact: System Architect
- Slack: #critical-infrastructure
- Email: dev-team@indastreet.com

**Emergency Rollback:**
```bash
git log --oneline features/shared-profiles/
git checkout <last-working-commit> features/shared-profiles/
```

---

## 🎯 SYSTEM HEALTH STATUS

| Component | Status | Last Tested |
|-----------|--------|-------------|
| SharedTherapistProfile | ✅ WORKING | Jan 10, 2026 |
| SharedPlaceProfile | ✅ WORKING | Jan 10, 2026 |
| SharedFacialProfile | ✅ WORKING | Jan 10, 2026 |
| Appwrite Integration | ✅ WORKING | Jan 10, 2026 |
| URL Routing | ✅ WORKING | Jan 10, 2026 |
| Social Sharing | ✅ WORKING | Jan 10, 2026 |

---

**🔒 THIS SYSTEM IS PROTECTED - HANDLE WITH CARE 🔒**
