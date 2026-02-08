# FILE NAMING AUDIT REPORT - CRITICAL DUPLICATES DETECTED

## 🚨 CRITICAL ISSUE: Multiple Component Naming Conflicts Found

### DUPLICATE COMPONENT NAMES CAUSING CONFUSION:

#### 1. TherapistBookings Conflict
- **File 1**: `TherapistBookings.tsx` exports component `TherapistBookings`
- **File 2**: `TherapistBookingsPage.tsx` exports component `TherapistBookings`
- **Risk**: Import/routing confusion, component override conflicts

#### 2. TherapistChat Conflict
- **File 1**: `TherapistChat.tsx` exports component `TherapistChat`
- **File 2**: `TherapistChatPage.tsx` exports component `TherapistChat`
- **Risk**: Import/routing confusion, component override conflicts

#### 3. TherapistPaymentInfo Conflict
- **File 1**: `TherapistPaymentInfo.tsx` exports component `TherapistPaymentInfo`
- **File 2**: `TherapistPaymentInfoPage.tsx` exports component `TherapistPaymentInfo`
- **Risk**: Import/routing confusion, component override conflicts

#### 4. TherapistPaymentStatus Conflict
- **File 1**: `TherapistPaymentStatus.tsx` exports component `TherapistPaymentStatus`
- **File 2**: `TherapistPaymentStatusPage.tsx` exports component `TherapistPaymentStatus`
- **Risk**: Import/routing confusion, component override conflicts

#### 5. TherapistSchedule Conflict
- **File 1**: `TherapistSchedule.tsx` exports component `TherapistSchedule`
- **File 2**: `TherapistSchedulePage.tsx` exports component `TherapistSchedule`
- **Risk**: Import/routing confusion, component override conflicts

#### 6. TherapistOnlineStatus Conflict
- **File 1**: `TherapistOnlineStatus.tsx` exports component `TherapistOnlineStatus`
- **File 2**: `TherapistOnlineStatusPage.tsx` exports component `TherapistOnlineStatus`
- **Risk**: Import/routing confusion, component override conflicts

#### 7. TherapistNotifications Conflict
- **File 1**: `TherapistNotifications.tsx` exports component `TherapistNotifications`
- **File 2**: `TherapistNotificationsPage.tsx` exports component `TherapistNotifications`
- **Risk**: Import/routing confusion, component override conflicts

#### 8. TherapistLegal Conflict
- **File 1**: `TherapistLegal.tsx` exports component `TherapistLegal`
- **File 2**: `TherapistLegalPage.tsx` exports component `TherapistLegal`
- **Risk**: Import/routing confusion, component override conflicts

#### 9. TherapistMenu Conflict
- **File 1**: `TherapistMenu.tsx` exports component `TherapistMenu`
- **File 2**: `TherapistMenuPage.tsx` exports component `TherapistMenu`
- **Risk**: Import/routing confusion, component override conflicts

#### 10. TherapistEarnings Conflict
- **File 1**: `TherapistEarnings.tsx` exports component `TherapistEarnings`
- **File 2**: `TherapistEarningsPage.tsx` exports component `TherapistEarnings`
- **Risk**: Import/routing confusion, component override conflicts

### DASHBOARD PORTAL CONFLICT:
- **File 1**: `TherapistDashboard.tsx` exports component `TherapistPortalPage`
- **File 2**: `TherapistDashboardPage.tsx` exports component `TherapistPortalPage`
- **Risk**: Critical routing/portal conflicts

## 🔥 IMMEDIATE RISKS:

1. **Import Confusion**: Developers may accidentally import wrong component
2. **Routing Conflicts**: React Router may load incorrect components
3. **Build Conflicts**: Bundling may override one component with another
4. **Future Edit Confusion**: Without qw: commands, edits may target wrong files
5. **Code Maintenance Nightmare**: Duplicate logic across similar-named files

## ✅ RESOLUTION REQUIRED:

### Recommended Naming Convention:
- **Component Files**: `ComponentName.tsx` (for reusable components)
- **Page Files**: `ComponentNamePage.tsx` with export `ComponentNamePage`
- **Example**: 
  - `TherapistBookings.tsx` → exports `TherapistBookings`
  - `TherapistBookingsPage.tsx` → exports `TherapistBookingsPage`

### TOTAL FILES AFFECTED: 20+ critical naming conflicts

## STATUS: 🚨 HIGH PRIORITY - PRODUCTION INTEGRITY COMPROMISED

This violates the unique naming requirement and creates significant confusion risks for future development without qw: override protection.