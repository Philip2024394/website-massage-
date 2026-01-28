# 🔒 BUSINESS LOGIC HARD LOCK SYSTEM
**IndaStreetmassage Therapist Dashboard**  
**Implemented: January 28, 2026**  
**Status: ✅ ACTIVE AND ENFORCED**

---

## 🎯 OBJECTIVE

Protect critical business logic from accidental modification while keeping UI, styling, copy, and help text fully editable.

---

## 📋 WHAT IS LOCKED

### 🔒 **Centralized Business Constants**
Location: `src/constants/businessLogic.ts`

| Constant | Value | Impact |
|----------|-------|--------|
| `BOOKING_ACCEPTANCE_TIMEOUT_MINUTES` | 5 | Therapist must respond to instant bookings within 5 minutes |
| `SCHEDULED_BOOKING_NOTIFICATION_HOURS` | 5 | Notifications sent 5 hours before scheduled bookings |
| `SCHEDULED_BOOKING_DEPOSIT_PERCENTAGE` | 30 | Customers pay 30% deposit upfront (NON-REFUNDABLE) |
| `PLATFORM_COMMISSION_PERCENTAGE_INDONESIA` | 30 | Platform takes 30% commission on all bookings |
| `BANK_DETAILS_REQUIRED_FOR_SCHEDULED_BOOKINGS` | true | Complete bank details mandatory to accept scheduled bookings |
| `VERIFICATION_BADGE_BOOKING_INCREASE_PERCENTAGE` | 60 | Verified profiles get 60% more bookings |

### 🔒 **KTP Verification States**
```typescript
KTP_VERIFICATION_STATES = {
  SUBMITTED: 'submitted',  // Orange badge "Menunggu Verifikasi"
  VERIFIED: 'verified',    // Green badge "Terverifikasi"  
  REJECTED: 'rejected'     // No badge, show rejection reason
}
```

### 🔒 **Business Logic Functions**
```typescript
calculateTherapistEarnings(bookingPrice)
calculatePlatformCommission(bookingPrice)
calculateScheduledBookingDeposit(totalPrice)
```

---

## 📁 LOCKED FILES & SECTIONS

### **1. TherapistBookings.tsx**
**Location:** `src/pages/therapist/TherapistBookings.tsx`  
**Locked Logic:**
- ✅ Scheduled booking bank details enforcement (lines 328-344)
- ✅ 30% deposit validation before acceptance (lines 346-359)
- ✅ Backend validation API call (lines 362-382)
- ✅ Deposit approval requirement check

**Editable:**
- ❌ UI components, styling classes, button text
- ❌ Toast messages and error text
- ❌ Loading states and animations

---

### **2. simpleChatService.ts**
**Location:** `src/lib/simpleChatService.ts`  
**Locked Logic:**
- ✅ `updateStatus()` function server-side bank details validation (lines 172-198)
- ✅ Required field checking (bankName, accountName, accountNumber)
- ✅ Error responses for missing fields

**Editable:**
- ❌ Error message text
- ❌ Console log formatting

---

### **3. TherapistPaymentInfo.tsx**
**Location:** `src/pages/therapist/TherapistPaymentInfo.tsx`  
**Locked Logic:**
- ✅ KTP 3-state verification badge system (lines 158-177)
- ✅ Immediate `ktpSubmitted = true` on upload (orange badge)
- ✅ Admin approval sets `ktpVerified = true` (green badge)
- ✅ Rejection sets `ktpRejected = true` (hide badge)

**Editable:**
- ❌ Form fields, layout, styling
- ❌ Help text and tooltips
- ❌ Badge UI design (colors stay orange/green/red)

---

### **4. types.ts**
**Location:** `src/types.ts`  
**Locked Logic:**
- ✅ KTP verification field definitions (lines 318-349)
- ✅ 3-state system documentation
- ✅ Type definitions for verification states

**Editable:**
- ❌ Field descriptions and comments
- ❌ Additional optional fields (non-business logic)

---

### **5. Commission Calculation Files**

#### **bookingLocalStorage.ts**
**Location:** `src/services/localStorage/bookingLocalStorage.ts`  
**Locked Logic:**
- ✅ `calculateCommission()` function (lines 429-440)
- ✅ 30% commission formula (UI display only)

#### **backendSyncService.ts**
**Location:** `src/services/localStorage/backendSyncService.ts`  
**Locked Logic:**
- ✅ Authoritative backend commission calculation (lines 273-283)
- ✅ Server-side 30% enforcement

**Editable:**
- ❌ Logging messages
- ❌ Error handling UI

---

### **6. Routing Configuration**

#### **therapistRoutes.tsx**
**Location:** `src/router/routes/therapistRoutes.tsx`  
**Locked Logic:**
- ✅ All route paths (`/therapist`, `/therapist/bookings`, etc.)
- ✅ Route names (`therapist-dashboard`, `therapist-bookings`, etc.)
- ✅ Component mappings (which component serves which route)
- ✅ `requiresAuth` flags (all therapist routes require authentication)
- ✅ Route structure and organization

**Impact of Route Changes:**
- 🚨 Breaks deep links from notifications
- 🚨 Breaks saved bookmarks and external links
- 🚨 Breaks navigation from TherapistLayout menu
- 🚨 Breaks external integrations

**Editable:**
- ❌ Component implementations (UI, styling)
- ❌ Lazy loading strategy
- ❌ Comments and documentation

---

### **7. Layout & Navigation Stability**

#### **TherapistLayout.tsx**
**Location:** `src/components/therapist/TherapistLayout.tsx`  
**Locked Logic:**
- ✅ Layout structure and mounting behavior
- ✅ Navigation patterns (menu item click → navigate)
- ✅ Menu item order from `THERAPIST_MENU_ITEMS` constant
- ✅ NO conditional redirects on mount (prevents flashing)
- ✅ Push notification request delay (5 seconds)

**Safe useEffects:**
- ✅ Push notification permission prompt (5-second delay, no redirects)
- ✅ Unread badge updates (read-only state observation)

**Editable:**
- ❌ Menu labels, icons, styling
- ❌ UI elements, animations, transitions
- ❌ Sidebar design and behavior

#### **TherapistDashboard.tsx**
**Location:** `src/pages/therapist/TherapistDashboard.tsx`  
**Locked Logic:**
- ✅ Form initialization sequence on mount
- ✅ Location normalization (extractLocationId)
- ✅ NO conditional redirects on mount
- ✅ Data loading from database on mount

**Safe useEffects:**
- ✅ Load latest therapist data from database
- ✅ Read package selection from localStorage
- ✅ Reset save state when form changes

**Editable:**
- ❌ Form UI, layout, styling
- ❌ Field labels and placeholders
- ❌ Validation messages

---

### **8. Navigation Constants**
**Location:** `src/constants/businessLogic.ts`

| Constant | Value | Purpose |
|----------|-------|---------|
| `PUSH_NOTIFICATION_REQUEST_DELAY_MS` | 5000 | Delay before showing push permission prompt |
| `THERAPIST_MENU_ITEMS` | Array of page IDs | Menu order locked for consistent UX |
| `ALLOW_CONDITIONAL_REDIRECTS_ON_MOUNT` | false | Prevents flashing and redirect loops |
| `STABLE_MOUNTING_REQUIRED` | true | Enforces stable component mounting |

**Menu Item Order (Locked):**
```typescript
[
  'therapist-how-it-works',
  'status',
  'dashboard',
  'bookings',
  'chat',
  'calendar',
  'earnings',
  'payment',
  'notifications',
  'menu'
]
```

---

## ✅ WHAT REMAINS EDITABLE

### **UI & Styling**
- ✅ Tailwind classes, colors (except verification badge orange/green/red)
- ✅ Layout, spacing, responsive design
- ✅ Icons, animations, transitions
- ✅ Button styles, hover effects

### **Copy & Content**
- ✅ All button text, labels, placeholders
- ✅ Toast messages, error messages
- ✅ Help tooltips, descriptions
- ✅ Page titles, subtitles

### **User Experience**
- ✅ Loading states, skeletons
- ✅ Modal dialogs, confirmations
- ✅ Navigation flows
- ✅ Form validation messages (non-business-rule)

### **Help System**
- ✅ `src/pages/therapist/HowItWorksPage.tsx` - Full content editable
- ✅ Help tooltips in all pages
- ✅ Onboarding flows

---

## 🚫 MODIFICATION PROCESS

### **To Change ANY Locked Constant:**

1. **❌ STOP** - Do not modify without approval
2. **📝 Document** - Write business justification
3. **✅ Approve** - Get written approval from business stakeholders
4. **🧪 Test** - Full regression testing required
5. **📢 Notify** - Alert all active therapists and places
6. **📚 Update** - Update all documentation

### **Who Can Approve Changes:**
- Business Owner
- Product Manager
- Revenue Operations Lead

### **Testing Requirements:**
- ✅ All booking flows (instant + scheduled)
- ✅ Payment processing
- ✅ Commission calculations
- ✅ Verification flows
- ✅ Notification system
- ✅ Backend API validation

---

## 📊 IMPACT ANALYSIS

### **Revenue Protection**
- 🔒 30% commission rate locked → Revenue stability guaranteed
- 🔒 Deposit percentage locked → Cash flow predictable
- 🔒 Bank details enforcement → Payment failures prevented

### **User Trust**
- 🔒 KTP verification system locked → Consistent trust signal
- 🔒 Badge states locked → Clear verification status
- 🔒 Notification timing locked → Reliable service expectations

### **System Integrity**
- 🔒 Backend validation locked → API bypass impossible
- 🔒 Required fields enforced → Data quality maintained
- 🔒 Booking timeouts locked → Fair therapist allocation

---

## 🔍 VERIFICATION CHECKLIST

Before deploying changes, verify:

### **Business Logic**
- [ ] No hard-coded business values outside `businessLogic.ts`
- [ ] All business constants imported from central file
- [ ] HARD LOCK comments present on critical logic
- [ ] UI/styling changes did not modify business rules
- [ ] Commission calculations still use locked formulas
- [ ] KTP verification 3-state system intact
- [ ] Bank details validation still enforced server-side
- [ ] Deposit percentage matches constant everywhere
- [ ] Notification timing matches constant

### **Routing & Navigation**
- [ ] No route paths changed in `therapistRoutes.tsx`
- [ ] No route names modified (breaks deep links)
- [ ] Component mappings unchanged
- [ ] Menu item order matches `THERAPIST_MENU_ITEMS` constant
- [ ] No conditional redirects added to layout mounting

### **Layout Stability**
- [ ] TherapistLayout has no conditional redirects on mount
- [ ] TherapistDashboard initialization sequence unchanged
- [ ] No flashing observed during page navigation
- [ ] No remounting observed when clicking menu items
- [ ] Push notification prompt still uses 5-second delay

### **Integration Testing**
- [ ] Deep links from notifications still work
- [ ] Menu navigation flows correctly
- [ ] No redirect loops observed
- [ ] Page remounting prevented
- [ ] Main site and user flows untouched

---

## 📞 SUPPORT

**Questions about locked logic:**
- Review this document first
- Check `src/constants/businessLogic.ts` documentation
- Contact: Engineering Lead + Product Manager

**UI/Copy Changes:**
- Proceed freely
- Test in development first
- Deploy with confidence

---

## 📜 VERSION HISTORY

| Date | Version | Changes |
|------|---------|---------|
| 2026-01-28 | 1.0 | Initial HARD LOCK implementation with centralized constants |

---

## 🎓 DEVELOPER GUIDELINES

### ✅ **Correct Usage**
```typescript
import { BOOKING_ACCEPTANCE_TIMEOUT_MINUTES } from '@/constants/businessLogic';

// Timer logic
if (timeElapsed > BOOKING_ACCEPTANCE_TIMEOUT_MINUTES * 60) {
  expireBooking();
}
```

### ❌ **Incorrect Usage**
```typescript
// ❌ Hard-coded value - DO NOT DO THIS
if (timeElapsed > 5 * 60) {
  expireBooking();
}
```

### ✅ **Editable UI**
```typescript
<p className="text-gray-700">
  You have {BOOKING_ACCEPTANCE_TIMEOUT_MINUTES} minutes to respond
</p>
// ✅ Changing "minutes to respond" text is fine
// 🚫 Changing BOOKING_ACCEPTANCE_TIMEOUT_MINUTES requires approval
```

---

**🔒 HARD LOCK ACTIVE**  
**Last Updated: 2026-01-28**  
**Status: ✅ ENFORCED IN PRODUCTION**
