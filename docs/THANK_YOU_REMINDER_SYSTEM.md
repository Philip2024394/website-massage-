# Thank You Discount Reminder System

## Overview
Automatically reminds members to send thank you discount banners to customers after completed bookings, increasing customer loyalty and return rates.

## System Flow

```
Customer Completes Booking
        ↓
Payment Received (Cash/Upload)
        ↓
Wait ~1 hour after massage finish time
        ↓
System sends notification to member's chat
        ↓
Member sees: "💝 Sending a thank you discount will increase your loyalty and return customers!"
        ↓
Member clicks "Send Reward Now"
        ↓
Member selects 5%, 10%, 15%, or 20% discount
        ↓
Discount banner sent to customer
        ↓
Customer loyalty increased! ✨
```

## Features Implemented

✅ **Automatic Timing** - Sends reminder 1 hour after massage completion
✅ **Smart Filtering** - Only for completed/paid bookings
✅ **One-time Only** - Won't spam members with duplicate reminders
✅ **Beautiful UI** - Orange notification bubble with clear call-to-action
✅ **Easy Integration** - Simple function calls from payment/booking flow

## Setup Steps

### 1. Add Database Field

Run this script to add the tracking field to your bookings collection:

```bash
node scripts/add-booking-reminder-field.cjs
```

This adds `thankYouReminderSent` (boolean, default: false) to the bookings collection.

### 2. Set Up Automated Reminders

**Option A: Node Cron (Recommended for Development)**

```bash
npm install node-cron
node scripts/thank-you-reminders-cron.cjs
```

**Option B: System Cron (Recommended for Production)**

Add to your crontab:
```bash
*/30 * * * * cd /path/to/project && node scripts/thank-you-reminders-cron.cjs
```

### 3. Integrate with Payment Flow

When customer completes payment (cash or upload), call the immediate reminder:

```typescript
import { sendImmediateThankYouReminder } from '@/lib/appwrite/services/bookingReminders.service';

// In your payment completion handler
async function handlePaymentCompleted(booking) {
    // ... existing payment logic ...

    // Send thank you reminder to member
    await sendImmediateThankYouReminder(
        booking.$id,
        booking.therapistId || booking.placeId,
        booking.therapistId ? 'therapist' : 'massage-place',
        booking.memberName,
        booking.customerId,
        booking.customerName
    );
}
```

### 4. Test the System

```bash
# Edit the test script with real IDs
node scripts/send-test-reminder.cjs
```

Then open the member's chat window to see the reminder notification.

## Integration Points

### When Customer Pays with Cash

```typescript
// In booking status update
if (booking.status === 'completed' && booking.paymentMethod === 'cash') {
    await sendImmediateThankYouReminder(
        booking.$id,
        booking.therapistId,
        'therapist',
        therapist.name,
        booking.customerId,
        booking.customerName
    );
}
```

### When Customer Uploads Payment

```typescript
// In payment upload handler
async function handlePaymentUpload(bookingId, uploadData) {
    // Verify payment upload
    await databases.updateDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        bookingId,
        { paymentStatus: 'paid' }
    );

    const booking = await databases.getDocument(
        DATABASE_ID,
        BOOKINGS_COLLECTION_ID,
        bookingId
    );

    // Send reminder
    await sendImmediateThankYouReminder(
        booking.$id,
        booking.therapistId,
        'therapist',
        booking.therapistName,
        booking.customerId,
        booking.customerName
    );
}
```

## How It Appears to Members

Members will see an **orange notification bubble** in their chat:

```
┌──────────────────────────────────────────────┐
│ 🎁 Team Indastreet     [Loyalty Tip]         │
│                                               │
│ 💝 Sending a thank you discount will         │
│ increase your loyalty and return customers!  │
│                                               │
│ Customer: John Smith                          │
│                                               │
│ [ 🎁 Send Reward Now ]                       │
└──────────────────────────────────────────────┘
```

When they click "Send Reward Now", the discount selector modal opens automatically.

## Timing Logic

The system waits **1 hour after the massage finish time** before sending the reminder:

```
Booking Date: 2025-01-15
Start Time: 14:00
Duration: 60 minutes
End Time: 15:00
Reminder Time: 16:00 (1 hour after end)
```

This gives time for:
- Massage to complete
- Customer to leave
- Any immediate follow-up
- Member to be ready for next action

## Database Schema

### Bookings Collection - New Field

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| thankYouReminderSent | boolean | No | false | Tracks if reminder was sent |

### Existing Required Fields

- bookingDate (string)
- startTime (string)
- duration (number - minutes)
- status (string)
- paymentStatus (string)
- therapistId or placeId (string)
- customerId (string)
- customerName (string)

## Benefits for Business

✅ **Increased Loyalty** - Customers feel appreciated
✅ **Higher Return Rate** - Discount encourages rebooking
✅ **Better Reviews** - Happy customers leave positive reviews
✅ **Automated Process** - No manual tracking needed
✅ **Member Engagement** - Keeps members active in platform
✅ **Revenue Growth** - More bookings = more commission

## Monitoring & Analytics

Track effectiveness by monitoring:
- Number of reminders sent
- Discount codes generated after reminder
- Discount code redemption rate
- Customer rebooking rate

Add to member dashboard:
```typescript
const stats = await getDiscountStats(memberId);
// Shows: total sent, redeemed, redemption rate
```

## Troubleshooting

**Reminder not appearing?**
- Check booking has `paymentStatus: 'paid'` or `status: 'completed'`
- Verify 1 hour has passed since booking end time
- Check `thankYouReminderSent` is `false`
- Look in browser console for errors

**Reminder appearing multiple times?**
- Ensure cron job not running too frequently
- Check `thankYouReminderSent` is being updated after sending

**Can't click "Send Reward Now"?**
- Verify DiscountBannerSelector component is imported
- Check showDiscountSelector state is working
- Look for JavaScript errors in console

## Code Files

- **Service:** `lib/appwrite/services/bookingReminders.service.ts`
- **Chat UI:** `apps/therapist-dashboard/src/pages/TherapistChat.tsx`
- **Setup Script:** `scripts/add-booking-reminder-field.cjs`
- **Cron Job:** `scripts/thank-you-reminders-cron.cjs`
- **Test Script:** `scripts/send-test-reminder.cjs`

## Future Enhancements

- [ ] A/B test different reminder messages
- [ ] Suggest discount percentage based on booking value
- [ ] Send reminder at optimal time based on member activity
- [ ] Include customer booking history in reminder
- [ ] Track reminder-to-conversion metrics

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Appwrite database permissions
3. Test with manual script first
4. Check message format is correct JSON

---

**Remember:** This feature helps members build long-term customer relationships and increases platform revenue through repeat bookings! 🚀
