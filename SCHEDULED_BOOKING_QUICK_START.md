# 🚀 Quick Start: Scheduled Booking System

## How to Use (Customer)

1. **Find a therapist** on the homepage
2. Click the **orange "Schedule" button** (Jadwalkan)
3. **Choose duration**: 60, 90, or 120 minutes
4. **Pick a time slot**: Green = available, Red = booked
5. **Enter your details**: Name and WhatsApp number
6. **Confirm**: Booking sent to therapist!
7. **Wait**: 15-minute countdown timer shows therapist response status
8. **Done**: Get confirmation or replacement options

---

## How It Works (Therapist)

1. **Receive WhatsApp** notification with booking details
2. **Click the link** in message
3. **Review booking**: Time, duration, customer info, price
4. **Accept or Decline**
5. **Confirmed**: Your status changes to "Busy"
6. **No response in 15 min?** Booking released automatically

---

## Features at a Glance

✅ **15-minute time slots** (8 AM to your end time)  
✅ **Real-time availability** (booked slots turn red)  
✅ **30-minute travel buffer** (prevents overlapping)  
✅ **15-minute confirmation** (longer than immediate bookings)  
✅ **Auto-broadcast** (if therapist doesn't respond)  
✅ **Customer details** (name + WhatsApp collected)  
✅ **Mobile-friendly** (works on all devices)  
✅ **No login required** (easy booking)

---

## Pricing

| Duration | Price | With Travel Buffer |
|----------|-------|-------------------|
| 60 min   | $50   | 90 min total      |
| 90 min   | $70   | 120 min total     |
| 120 min  | $90   | 150 min total     |

---

## Important Notes

⚠️ **Travel Buffer**: 30 minutes added automatically to prevent overlapping  
⚠️ **Confirmation Time**: Therapist has 15 minutes to respond  
⚠️ **Past Times**: Only future time slots are shown  
⚠️ **Daily Schedule**: Therapists can set their last booking time (default: 10 PM)

---

## Next: Set Your Schedule (Therapists)

**Coming Soon:** Dashboard settings to customize your `lastBookingTime`

Until then, the default end time is **22:00 (10 PM)**.

---

## Need Help?

- **Customer can't book?** Check if time slots are available
- **Therapist didn't get notification?** Verify WhatsApp number is correct
- **Booking expired?** Look for replacement options in the popup
- **Technical issue?** Check browser console for errors

---

**System Status:** ✅ FULLY WORKING  
**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")
