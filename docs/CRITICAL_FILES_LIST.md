# 🔴 CRITICAL FILES - REQUIRES EXTREME CAUTION

## ⚠️ PRODUCTION APP - ACTIVE MEMBERS USING NOW

These files are **MISSION CRITICAL** and must be modified with extreme care.

---

## 🚨 Tier 1: ABSOLUTELY CRITICAL (Break = Members Cannot Use App)

### Authentication & Account Creation
| File | Purpose | Location | Backup |
|------|---------|----------|--------|
| `CreateAccountPage.tsx` | Member account creation | `/pages/auth/` | ✅ |
| `LoginPage.tsx` | Member login | `/pages/auth/` | ✅ |
| `ProviderAuthPage.tsx` | Provider (therapist/place) login | `/pages/auth/` | ⚠️ Need backup |
| `membershipSignup.service.ts` | Account creation logic | `/lib/services/` | ⚠️ Need backup |

### Therapist Dashboard & Profile
| File | Purpose | Location | Backup |
|------|---------|----------|--------|
| `TherapistDashboard.tsx` | Therapist profile editor | `/apps/therapist-dashboard/src/pages/` | ✅ |
| `TherapistLayout.tsx` | Dashboard header + burger menu | `/apps/therapist-dashboard/src/components/` | ✅ |
| `TherapistOnlineStatus.tsx` | Therapist availability status | `/apps/therapist-dashboard/src/pages/` | ⚠️ Need backup |

### Booking System
| File | Purpose | Location | Backup |
|------|---------|----------|--------|
| `TherapistBookings.tsx` | Booking management | `/apps/therapist-dashboard/src/pages/` | ✅ |
| `BookingRequestCard.tsx` | Real-time booking requests | `/apps/therapist-dashboard/src/components/` | ⚠️ Need backup |
| `bookingCreationService.ts` | Booking logic | `/lib/services/` | ⚠️ Need backup |

### Chat System
| File | Purpose | Location | Backup |
|------|---------|----------|--------|
| `PersistentChatProvider.tsx` | Facebook Messenger-style chat | `/context/` | ✅ |
| `serverEnforcedChatService.ts` | Chat message sending | `/lib/services/` | ⚠️ Need backup |
| `chat_rooms` collection | Database schema | Appwrite Console | 📝 Documented |
| `chat_messages` collection | Database schema | Appwrite Console | 📝 Documented |

---

## 🟠 Tier 2: VERY IMPORTANT (Break = Major Features Lost)

### Homepage & Search
| File | Purpose | Location | Status |
|------|---------|----------|--------|
| `LandingPage.tsx` | Customer homepage | `/pages/` | 🔍 Monitor |
| `TherapistHomeCard.tsx` | Therapist profile cards | `/components/` | 🔍 Monitor |
| `CityLocationDropdown.tsx` | City/location selector | `/components/` | 🔍 Monitor |

### Payment & Membership
| File | Purpose | Location | Status |
|------|---------|----------|--------|
| `PlusMembershipPayment.tsx` | Payment submission | `/apps/therapist-dashboard/src/components/` | 🔍 Monitor |
| `TherapistPaymentStatus.tsx` | Payment history | `/apps/therapist-dashboard/src/pages/` | 🔍 Monitor |
| `CommissionPayment.tsx` | 30% commission payments | `/apps/therapist-dashboard/src/pages/` | 🔍 Monitor |

### Place Dashboard
| File | Purpose | Location | Status |
|------|---------|----------|--------|
| `PlaceDashboard.tsx` | Massage place dashboard | `/apps/place-dashboard/src/pages/` | ⚠️ Need backup |
| `PlaceLayout.tsx` | Place dashboard layout | `/apps/place-dashboard/src/components/` | ⚠️ Need backup |

---

## 🟢 Tier 3: IMPORTANT (Break = Minor Issues)

- Navigation components
- UI helper components
- Translation files
- Configuration files

---

## 🛡️ PROTECTION RULES FOR CRITICAL FILES

### Before ANY Change:

1. **Create Git Commit**
   ```bash
   git add .
   git commit -m "Stable working version before changes"
   ```

2. **Test in Development**
   ```bash
   pnpm run dev
   # Test thoroughly before deploying
   ```

3. **Compare with Backup**
   ```bash
   code --diff "path/to/file.tsx" "CRITICAL_PROTECTED_FILES/category/file.BACKUP.tsx"
   ```

4. **Gradual Deployment**
   - Test locally first
   - Deploy to staging (if available)
   - Deploy to production
   - Monitor for errors

### After Confirmed Stable:

5. **Update Backup**
   ```bash
   Copy-Item "path\to\file.tsx" "CRITICAL_PROTECTED_FILES\category\file.BACKUP.tsx" -Force
   git add CRITICAL_PROTECTED_FILES/
   git commit -m "chore: update backup after stable deployment"
   ```

---

## 🚨 EMERGENCY PROCEDURES

### If Critical File Breaks:

1. **IMMEDIATE ROLLBACK**
   ```bash
   # Restore from backup
   Copy-Item "CRITICAL_PROTECTED_FILES\category\file.BACKUP.tsx" "path\to\broken\file.tsx" -Force
   
   # Or rollback git
   git checkout HEAD~1 path/to/file.tsx
   ```

2. **DEPLOY FIX IMMEDIATELY**
   ```bash
   git add path/to/restored/file.tsx
   git commit -m "EMERGENCY: Restore critical file"
   git push origin main
   ```

3. **VERIFY APP WORKS**
   - Test login
   - Test create account
   - Test bookings
   - Test chat

4. **INVESTIGATE ROOT CAUSE**
   - What caused the break?
   - How to prevent it?
   - Update protection rules

---

## 📝 Modification Log

| Date | File | Change | Who | Status |
|------|------|--------|-----|--------|
| 2026-01-20 | TherapistDashboard.tsx | Restored TherapistLayout wrapper | GitHub Copilot | ✅ Fixed |
| 2026-01-20 | CRITICAL_PROTECTED_FILES/ | Created backup system | GitHub Copilot | ✅ Complete |

---

**⚠️ REMEMBER: Members are using the app RIGHT NOW. Every change matters.**
