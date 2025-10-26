# Appwrite Function: Send WhatsApp Booking Notification

This function sends WhatsApp messages to therapists when guests book a massage through the hotel menu. The guest never sees the WhatsApp interface - they only receive a booking confirmation with ID and timestamp.

## Setup Instructions

### 1. Create Twilio Account
1. Sign up at [Twilio](https://www.twilio.com)
2. Activate WhatsApp Sandbox or get approved WhatsApp number
3. Get your credentials:
   - Account SID
   - Auth Token
   - WhatsApp Number

### 2. Deploy to Appwrite

#### Option A: Using Appwrite Console
1. Go to your Appwrite Console → Functions
2. Click "Create Function"
3. Name: `send-booking-notification`
4. Runtime: Node.js 18+
5. Upload the `src/main.js` file
6. Set Environment Variables:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
   ```

#### Option B: Using Appwrite CLI
```bash
# Install Appwrite CLI
npm install -g appwrite

# Login to Appwrite
appwrite login

# Deploy function
appwrite deploy function \
  --functionId send-booking-notification \
  --name "Send Booking Notification" \
  --runtime node-18.0 \
  --entrypoint src/main.js \
  --execute any
```

### 3. Update Frontend Endpoint

In `HotelDashboardPage.tsx`, update the API endpoint:

```typescript
// Change this:
const response = await fetch('/api/send-booking-notification', {

// To your Appwrite function URL:
const response = await fetch('https://[YOUR-APPWRITE-DOMAIN]/v1/functions/[FUNCTION-ID]/executions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-Appwrite-Project': '[YOUR-PROJECT-ID]',
  },
  body: JSON.stringify({
    data: JSON.stringify(therapistMessage)
  })
});
```

### 4. Test the Function

Test message format sent to therapist:
```
🏨 NEW BOOKING ALERT

📍 Hotel: Grand Bali Resort
📌 Location: Jl. Sunset Road, Kuta

👤 Guest Name: John Doe
🚪 Room Number: 305
🆔 Booking ID: BK12345678
⏰ Booking Time: Jan 15, 2025, 03:30 PM

💆 Service Details:
• Duration: 60 minutes
• Price: Rp 250,000

⚠️ Therapist Must confirm "On The Way" to keep Account Active

Please confirm your availability and update status to "On The Way" in your app.
```

## Alternative WhatsApp Providers

If you prefer not to use Twilio, you can modify the function for:

### MessageBird
```javascript
const response = await fetch('https://conversations.messagebird.com/v1/send', {
  headers: {
    'Authorization': `AccessKey ${process.env.MESSAGEBIRD_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: to,
    type: 'text',
    content: { text: message },
    channelId: process.env.MESSAGEBIRD_CHANNEL_ID
  })
});
```

### 360dialog
```javascript
const response = await fetch('https://waba.360dialog.io/v1/messages', {
  headers: {
    'D360-API-KEY': process.env.DIALOG360_API_KEY,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: to,
    type: 'text',
    text: { body: message }
  })
});
```

## Security Notes

- ✅ Guest never sees WhatsApp was sent
- ✅ Function runs server-side (secure)
- ✅ Credentials stored in environment variables
- ✅ Booking still succeeds even if WhatsApp fails
- ✅ Error logging for debugging

## Troubleshooting

**WhatsApp not sending?**
- Check Twilio console for error logs
- Verify phone numbers are in E.164 format (+62812...)
- Ensure WhatsApp sandbox is active (for testing)
- Check environment variables are set correctly

**Booking works but no notification?**
- Check Appwrite function logs
- Verify CORS settings allow your domain
- Test function directly in Appwrite console

## Cost Estimation

Twilio WhatsApp pricing (as of 2025):
- Conversation initiated: ~$0.005-$0.01 per message
- For 1000 bookings/month: ~$5-$10/month

Cheaper alternatives:
- 360dialog: ~$0.003 per message
- WATI: Flat monthly pricing
- MessageBird: Volume discounts available
