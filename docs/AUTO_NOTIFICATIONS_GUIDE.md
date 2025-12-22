# Auto-Notification System - Integration Guide

## Overview
Comprehensive auto-notification system that sends real-time updates to therapists and customers via chat. All notifications are automatically translated based on the user's language preference.

## Installation

```bash
# Already included in the project
import * as ChatNotifications from '@/lib/appwrite/services/chatNotifications.service';
```

## Integration Points

### 1. Booking Flow

#### When Booking is Created
```typescript
import { sendBookingConfirmedNotification } from '@/lib/appwrite/services/chatNotifications.service';

// After booking is created
await sendBookingConfirmedNotification({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  customerName: booking.customerName,
  dateTime: `${booking.date} at ${booking.time}`,
  serviceName: booking.serviceName,
  amount: booking.totalAmount
});
```

#### 24 Hours Before Booking
```typescript
import { send24HourBookingReminder } from '@/lib/appwrite/services/chatNotifications.service';

// In cron job or scheduled task
await send24HourBookingReminder({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  customerName: booking.customerName,
  dateTime: `${booking.date} at ${booking.time}`,
  locationSummary: `${booking.city}, ${booking.district}`
});
```

#### 1 Hour Before Booking (Reveal Contact Info)
```typescript
import { sendBookingStartingSoonNotification } from '@/lib/appwrite/services/chatNotifications.service';

await sendBookingStartingSoonNotification({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  customerName: booking.customerName,
  customerPhone: booking.customerPhone,
  fullAddress: booking.fullAddress
});
```

#### Late Arrival Detection (15+ minutes)
```typescript
import { sendLateArrivalWarning } from '@/lib/appwrite/services/chatNotifications.service';

// Check 15 minutes after scheduled start time
if (currentTime > scheduledTime + 15minutes && !checkedIn) {
  await sendLateArrivalWarning({
    recipientId: booking.therapistId,
    recipientType: 'therapist',
    recipientName: therapist.name,
    bookingId: booking.$id,
    customerName: booking.customerName,
    minutesLate: 15
  });
}
```

### 2. Payment Flow

#### Cash Payment (Customer Confirms)
```typescript
import { sendPaymentReceivedNotification } from '@/lib/appwrite/services/chatNotifications.service';

// When customer marks payment as "Paid with Cash"
await sendPaymentReceivedNotification({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  amount: booking.totalAmount,
  paymentMethod: 'cash',
  customerName: booking.customerName
});
```

#### Screenshot Upload
```typescript
import { sendPaymentPendingNotification } from '@/lib/appwrite/services/chatNotifications.service';

// When customer uploads payment screenshot
await sendPaymentPendingNotification({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  amount: booking.totalAmount,
  customerName: booking.customerName,
  screenshotUrl: uploadedImageUrl
});
```

#### Off-Platform Payment
```typescript
import { sendOffPlatformPaymentNotification } from '@/lib/appwrite/services/chatNotifications.service';

// When payment is made outside platform
await sendOffPlatformPaymentNotification({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  amount: booking.totalAmount,
  customerName: booking.customerName,
  notes: 'Customer paid directly via bank transfer'
});
```

### 3. Review & Feedback

#### New Review Received
```typescript
import { sendNewReviewNotification } from '@/lib/appwrite/services/chatNotifications.service';

// After customer submits review
await sendNewReviewNotification({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  customerName: booking.customerName,
  rating: review.rating,
  reviewText: review.comment
});
```

#### Review Reminder (7 days after booking)
```typescript
import { sendReviewReminderSuggestion } from '@/lib/appwrite/services/chatNotifications.service';

// Cron job: Check bookings completed 7 days ago without reviews
await sendReviewReminderSuggestion({
  recipientId: booking.therapistId,
  recipientType: 'therapist',
  recipientName: therapist.name,
  bookingId: booking.$id,
  customerName: booking.customerName,
  daysAgo: 7
});
```

### 4. Profile & Account

#### Profile Incomplete Warning
```typescript
import { sendProfileIncompleteWarning } from '@/lib/appwrite/services/chatNotifications.service';

// On login or weekly check
const missingFields = [];
if (!therapist.bio) missingFields.push('Bio/Description');
if (!therapist.certifications) missingFields.push('Certifications');
if (!therapist.specializations) missingFields.push('Specializations');
if (!therapist.mainImage) missingFields.push('Profile Photo');

if (missingFields.length > 0) {
  await sendProfileIncompleteWarning({
    recipientId: therapist.$id,
    recipientType: 'therapist',
    recipientName: therapist.name,
    missingFields: missingFields,
    completionPercentage: Math.round((1 - missingFields.length / 10) * 100)
  });
}
```

#### Membership Expiring
```typescript
import { sendMembershipExpiringNotification } from '@/lib/appwrite/services/chatNotifications.service';

// Cron job: Daily check
const daysUntilExpiry = Math.ceil((membershipEndDate - Date.now()) / (1000 * 60 * 60 * 24));

if (daysUntilExpiry === 7 || daysUntilExpiry === 3 || daysUntilExpiry === 1) {
  await sendMembershipExpiringNotification({
    recipientId: therapist.$id,
    recipientType: 'therapist',
    recipientName: therapist.name,
    daysRemaining: daysUntilExpiry,
    membershipTier: therapist.membershipTier
  });
}
```

### 5. Availability & Schedule

#### Low Availability Warning
```typescript
import { sendLowAvailabilityWarning } from '@/lib/appwrite/services/chatNotifications.service';

// Check weekly availability
const availableSlots = await countAvailableSlots(therapistId, nextWeek);

if (availableSlots < 5) {
  await sendLowAvailabilityWarning({
    recipientId: therapist.$id,
    recipientType: 'therapist',
    recipientName: therapist.name,
    availableSlots: availableSlots,
    weekOf: formatWeekRange(nextWeek)
  });
}
```

#### Offline Warning
```typescript
import { sendGoingOfflineWarning } from '@/lib/appwrite/services/chatNotifications.service';

// Check last online time
const hoursOffline = Math.floor((Date.now() - therapist.lastOnline) / (1000 * 60 * 60));

if (hoursOffline >= 2) {
  await sendGoingOfflineWarning({
    recipientId: therapist.$id,
    recipientType: 'therapist',
    recipientName: therapist.name,
    hoursOffline: hoursOffline
  });
}
```

### 6. Performance & Achievements

#### Weekly Summary (Every Monday)
```typescript
import { sendWeeklySummary } from '@/lib/appwrite/services/chatNotifications.service';

// Cron job: Every Monday morning
const weekStats = await getWeeklyStats(therapistId, lastWeek);

await sendWeeklySummary({
  recipientId: therapist.$id,
  recipientType: 'therapist',
  recipientName: therapist.name,
  weekOf: formatWeekRange(lastWeek),
  totalBookings: weekStats.bookings,
  totalEarnings: weekStats.earnings,
  avgRating: weekStats.avgRating,
  topRank: weekStats.percentileRank
});
```

#### Milestones
```typescript
import { sendMilestoneNotification } from '@/lib/appwrite/services/chatNotifications.service';

// After booking completion
const totalBookings = await getTotalBookings(therapistId);

if (totalBookings === 10 || totalBookings === 50 || totalBookings === 100 || totalBookings === 500) {
  await sendMilestoneNotification({
    recipientId: therapist.$id,
    recipientType: 'therapist',
    recipientName: therapist.name,
    milestone: 'Total Bookings Completed',
    count: totalBookings,
    reward: totalBookings === 100 ? 'Free Premium Upgrade for 1 month!' : undefined
  });
}
```

### 7. Safety & Compliance

#### Account Warning
```typescript
import { sendAccountWarningNotification } from '@/lib/appwrite/services/chatNotifications.service';

// After violation detected
await sendAccountWarningNotification({
  recipientId: therapist.$id,
  recipientType: 'therapist',
  recipientName: therapist.name,
  violationType: 'Contact Information Sharing',
  violationCount: 2,
  description: 'You attempted to share WhatsApp number with a customer. This violates our Terms of Service.'
});
```

#### Terms Update
```typescript
import { sendTermsUpdateNotification } from '@/lib/appwrite/services/chatNotifications.service';

// When terms are updated
const allTherapists = await getAllTherapists();

for (const therapist of allTherapists) {
  await sendTermsUpdateNotification({
    recipientId: therapist.$id,
    recipientType: 'therapist',
    recipientName: therapist.name,
    updateSummary: 'Payment processing fees updated from 10% to 8%. New cancellation policy for last-minute bookings.',
    effectiveDate: 'January 1, 2026'
  });
}
```

## Cron Job Setup

Create a file `scripts/send-auto-notifications.cjs`:

```javascript
const cron = require('node-cron');
const { Databases, Query } = require('node-appwrite');
const { sendBookingReminders, sendWeeklySummaries, checkLowAvailability } = require('./notification-handlers');

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running hourly notification checks...');
  await sendBookingReminders(); // 24hr and 1hr reminders
  await checkLowAvailability();
});

// Run every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('Sending weekly summaries...');
  await sendWeeklySummaries();
});

console.log('Auto-notification cron jobs started!');
```

## Best Practices

1. **Rate Limiting**: Don't send too many notifications at once
2. **Timing**: Send notifications at appropriate times (avoid late night)
3. **Relevance**: Only send notifications that are actionable
4. **Batching**: Combine similar notifications when possible
5. **User Preferences**: Allow users to configure notification preferences

## Testing

```bash
# Test individual notifications
node scripts/test-notification.cjs booking-confirmed [therapistId]
node scripts/test-notification.cjs payment-received [therapistId]
node scripts/test-notification.cjs weekly-summary [therapistId]
```

## Monitoring

Track notification delivery and engagement:
- Delivery rate
- Read rate
- Action taken rate (e.g., clicked "Send Discount")
- User feedback on notifications

## Future Enhancements

- [ ] Push notifications (mobile)
- [ ] Email digest option
- [ ] SMS for critical notifications
- [ ] User notification preferences panel
- [ ] A/B testing different notification messages
