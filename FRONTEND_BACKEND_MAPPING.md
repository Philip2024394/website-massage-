# FRONTEND-BACKEND PAGE MAPPING SYSTEM

## 🎯 OBJECTIVE: Connect Frontend Display Names to Backend File Names

### MAPPING REFERENCE TABLE:

| Frontend Display Name | Backend File Name | Component Export Name | Route/Navigation |
|----------------------|-------------------|---------------------|------------------|
| **Bookings** | `TherapistBookingsPage.tsx` | `TherapistBookingsPage` | `/therapist/bookings` |
| **Chat** | `TherapistChatPage.tsx` | `TherapistChatPage` | `/therapist/chat` |
| **Payment Info** | `TherapistPaymentInfoPage.tsx` | `TherapistPaymentInfoPage` | `/therapist/payment-info` |
| **Payment Status** | `TherapistPaymentStatusPage.tsx` | `TherapistPaymentStatusPage` | `/therapist/payment-status` |
| **Schedule** | `TherapistSchedulePage.tsx` | `TherapistSchedulePage` | `/therapist/schedule` |
| **Online Status** | `TherapistOnlineStatusPage.tsx` | `TherapistOnlineStatusPage` | `/therapist/online-status` |
| **Notifications** | `TherapistNotificationsPage.tsx` | `TherapistNotificationsPage` | `/therapist/notifications` |
| **Legal** | `TherapistLegalPage.tsx` | `TherapistLegalPage` | `/therapist/legal` |
| **Menu** | `TherapistMenuPage.tsx` | `TherapistMenuPage` | `/therapist/menu` |
| **Earnings** | `TherapistEarningsPage.tsx` | `TherapistEarningsPage` | `/therapist/earnings` |
| **Dashboard/Portal** | `TherapistDashboardPage.tsx` | `TherapistPortalPage` | `/therapist/dashboard` |
| **Calendar** | `TherapistCalendarPage.tsx` | `TherapistCalendarPage` | `/therapist/calendar` |

### COMPONENT FILES (Reusable Components):
| Component Purpose | Backend File Name | Component Export Name | Usage |
|------------------|-------------------|---------------------|-------|
| **Bookings Component** | `TherapistBookings.tsx` | `TherapistBookings` | Reusable booking component |
| **Chat Component** | `TherapistChat.tsx` | `TherapistChat` | Reusable chat component |
| **Payment Component** | `TherapistPaymentInfo.tsx` | `TherapistPaymentInfo` | Reusable payment form |
| **Status Component** | `TherapistPaymentStatus.tsx` | `TherapistPaymentStatus` | Reusable status display |
| **Schedule Component** | `TherapistSchedule.tsx` | `TherapistSchedule` | Reusable schedule view |
| **Online Component** | `TherapistOnlineStatus.tsx` | `TherapistOnlineStatus` | Reusable status toggle |
| **Notifications Component** | `TherapistNotifications.tsx` | `TherapistNotifications` | Reusable notifications |
| **Legal Component** | `TherapistLegal.tsx` | `TherapistLegal` | Reusable legal content |
| **Menu Component** | `TherapistMenu.tsx` | `TherapistMenu` | Reusable menu component |
| **Earnings Component** | `TherapistEarnings.tsx` | `TherapistEarnings` | Reusable earnings display |
| **Dashboard Component** | `TherapistDashboard.tsx` | `TherapistPortalPage` | Reusable dashboard logic |
| **Calendar Component** | `TherapistCalendar.tsx` | `TherapistCalendar` | Reusable calendar view |

## 🔗 DEVELOPER WORKFLOW:

### When Frontend Says: "Edit the Bookings page"
1. **Frontend Display**: "Bookings"
2. **Backend File**: `TherapistBookingsPage.tsx`
3. **Component**: `TherapistBookingsPage`
4. **qw: Command**: `qw: edit bookings page logic`

### When Frontend Says: "Fix the Payment Info screen"
1. **Frontend Display**: "Payment Info"
2. **Backend File**: `TherapistPaymentInfoPage.tsx`
3. **Component**: `TherapistPaymentInfoPage`
4. **qw: Command**: `qw: update payment info validation`

### When Frontend Says: "Update Chat functionality"
1. **Frontend Display**: "Chat"
2. **Backend File**: `TherapistChatPage.tsx`
3. **Component**: `TherapistChatPage`
4. **qw: Command**: `qw: enhance chat messaging`

## ✅ NAMING CONVENTION RULES:

### FOR PAGE FILES:
- **Filename**: `ComponentNamePage.tsx`
- **Export**: `ComponentNamePage`
- **Purpose**: Full-page views with routing

### FOR COMPONENT FILES:
- **Filename**: `ComponentName.tsx`  
- **Export**: `ComponentName`
- **Purpose**: Reusable components within pages

## 🎯 QUICK REFERENCE FOR DEVELOPERS:

**Frontend Name → Backend File Formula:**
```
Frontend Display Name = "Payment Status"
Backend File = "TherapistPaymentStatusPage.tsx"
Component Export = "TherapistPaymentStatusPage"
```

**Search Command:**
```bash
# To find backend file for "Earnings" page:
grep -r "TherapistEarningsPage" src/pages/therapist/
```

This mapping ensures developers always know which backend file corresponds to any frontend page name they encounter.