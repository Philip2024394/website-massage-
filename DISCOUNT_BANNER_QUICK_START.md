# 🎁 Elite Discount Banner System - Quick Start Guide

## 🚀 How It Works (Therapist Perspective)

### **Step-by-Step Flow:**

1. **Open "Kirim Diskon" Page**
   - See 4 discount banners: 5%, 10%, 15%, 20%
   - See list of customer names (last 30 days, completed bookings only)

2. **Select a Banner**
   - Tap any banner (e.g., 10% OFF)
   - Banner glows with orange ring
   - Customer names start pulsing/flashing
   - Text changes: "Klik nama pelanggan untuk kirim"

3. **Select a Customer**
   - Tap a pulsing customer name
   - Confirmation popup appears with:
     - Banner preview
     - "Kirim diskon 10% ke [Name]?"
     - "Berlaku 7 hari dari hari ini"

4. **Confirm Send**
   - Tap "Konfirmasi Kirim"
   - Customer name shows spinner: "Mengirim..."
   - Banner sent to customer's chat window
   - Customer receives push notification with MP3 sound

5. **Success Animation**
   - "Mengirim..." → "✓ Diskon Terkirim" (green)
   - After 2 seconds: Name fades out
   - Customer disappears from list
   - Can select new banner and repeat

---

## 📱 What Customer Receives

### **In Chat Window:**
- Banner image (5%, 10%, 15%, or 20% OFF)
- **Discount Code**: Unique code like `SM10-A3K9X` (prominently displayed)
- Message: 
  - **Indonesian**: "🎁 Terima kasih sudah booking massage dengan kami! Silakan gunakan diskon X% ini untuk booking selanjutnya dalam 7 hari. ✨ Kode Diskon: **[CODE]** ⏰ Berlaku sampai: [DATE] 👉 Masukkan kode ini saat booking untuk mendapatkan diskon otomatis. Kode hanya bisa digunakan 1x dengan saya."
  - **English**: "🎁 Thank you for your past massage booking! Please accept this X% discount for your next booking within 7 days. ✨ Discount Code: **[CODE]** ⏰ Valid until: [DATE] 👉 Enter this code during booking to get automatic discount. Code can only be used once with me."
- Expiry date: 7 days from send

### **Push Notification:**
- **Title**: "New Discount from [Therapist Name]!"
- **Body**: "You received a X% discount! Code: [CODE]"
- **Sound**: MP3 audio (cheerful notification sound - auto-plays)
- **Action**: Opens chat window when tapped

### **How to Use Discount:**
1. Customer opens booking form
2. Enters discount code: `SM10-A3K9X`
3. System validates:
   - ✅ Code exists and belongs to this therapist
   - ✅ Not expired (< 7 days old)
   - ✅ Not already used
   - ✅ Customer matches code owner
4. If valid: Discount applied automatically to therapist's price
5. Code marked as "used" after booking confirmed

### **Security:**
- ❌ Code cannot be used with other therapists
- ❌ Code cannot be shared with other customers
- ❌ Code expires after 7 days
- ❌ Code can only be used ONCE
- ✅ Discount applies to therapist's price only (therapist absorbs cost)

---

## 🎨 Visual States

| State | Appearance | Action |
|-------|-----------|--------|
| **No Banner Selected** | Customer names gray, non-clickable | Select a banner first |
| **Banner Selected** | Customer names pulse with orange border | Click name to send |
| **Sending** | Spinner + "Mengirim..." | Wait for completion |
| **Sent** | Green badge "✓ Diskon Terkirim" | Automatic fade-out in 2s |
| **Fading** | Opacity decreasing | Customer disappearing |
| **Disappeared** | Removed from list | Can't send again (one-time only) |

---

## 🔒 Business Rules

1. **One Send Per Customer**: Each customer can only receive ONE discount
2. **30-Day Window**: Only customers with bookings in last 30 days
3. **Completed Bookings Only**: No pending/cancelled bookings
4. **7-Day Expiry**: Discount valid for 1 week from send date
5. **Banner Selection**: Can change banner before selecting customer
6. **Confirmation Required**: Always shows confirmation dialog

---

## 💡 Tips for Therapists

- **Best Time to Send**: After a successful booking (customer satisfaction high)
- **Which Percentage**: 
  - 5% - Regular customers
  - 10% - Good customers
  - 15% - VIP customers
  - 20% - Special occasions only
- **Follow Up**: Check chat if customer doesn't respond within 24 hours
- **Track Results**: Monitor which customers book again after receiving discount

---

## 🛠️ Troubleshooting

### **Customer Not Appearing in List?**
- Check if booking was completed (not cancelled/pending)
- Check if booking was within last 30 days
- Check if customer already received discount (they disappear after first send)

### **Banner Not Sending?**
- Ensure internet connection is stable
- Try refreshing the page
- Contact support if issue persists

### **Customer Didn't Receive Notification?**
- Check if customer has app installed
- Verify customer has notifications enabled
- Ask customer to check chat window directly

---

## 📊 What Makes This "Elite"?

1. **Smart Filtering**: Only relevant customers (30 days, completed bookings)
2. **Visual Feedback**: Pulse animations show exactly when customers are clickable
3. **Confirmation Flow**: Prevents accidental sends
4. **Instant Notification**: Customer notified immediately with sound
5. **Clean UX**: Sent customers disappear (no clutter)
6. **One-Time Sends**: No duplicate discounts to same customer
7. **Mobile-Optimized**: Works perfectly on phones
8. **Bilingual**: English + Indonesian support

---

## 🎯 Expected Results

- **Higher Rebooking Rate**: Customers with discount are 3-4x more likely to book again
- **Increased Chat Engagement**: Discount notification opens conversation
- **Better Customer Relationships**: Personal touch shows you value their business
- **Revenue Boost**: More frequent bookings outweigh discount cost

---

**For Technical Support**: See [ELITE_DISCOUNT_BANNER_SYSTEM.md](./ELITE_DISCOUNT_BANNER_SYSTEM.md)
