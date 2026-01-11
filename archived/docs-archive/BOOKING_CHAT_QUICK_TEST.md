# 🔍 Quick Test Guide - Booking → Chat Flow

## ⚡ Fast Validation (5 minutes)

### Step 1: Check Environment Variables (30 seconds)
```bash
# Open browser console (F12)
# Look for these lines:
[APPWRITE CONFIG] Checking VITE_CHAT_SESSIONS_COLLECTION_ID: ✅ LOADED
[APPWRITE CONFIG] Checking VITE_CHAT_MESSAGES_COLLECTION_ID: ✅ LOADED

# ✅ PASS: All show ✅ LOADED
# ❌ FAIL: Any show ❌ MISSING → Add to .env.development
```

### Step 2: Test Booking Acceptance (1 minute)
```bash
# 1. Navigate to: /accept-booking/{any-booking-id}
# 2. Click "Accept Booking"
# 3. Check console for:

[BOOKING ACCEPT] STEP 4 VALIDATION:
[BOOKING ACCEPT]   - buyerId: ✅
[BOOKING ACCEPT]   - therapistId: ✅
[BOOKING ACCEPT]   - bookingId: ✅
[BOOKING ACCEPT]   - status: ✅
[BOOKING ACCEPT]   - createdAt: ✅
[BOOKING ACCEPT] ✅ Chat session created: booking_xyz789

# ✅ PASS: All show ✅ and chat session created
# ❌ FAIL: Any ❌ or error → Check BOOKING_CHAT_FLOW_DEBUG_REPORT.md
```

### Step 3: Test Chat Unlock (2 minutes)
```bash
# 1. Open therapist dashboard
# 2. Click chat icon
# 3. Should see 🔒 locked overlay
# 4. Check console:

[FLOATING CHAT] ✅ Realtime subscription active

# 5. Simulate booking confirmation:
#    Go to Appwrite Console → bookings collection
#    Update booking status to 'confirmed'

# 6. Check console:
[FLOATING CHAT] ✅ Realtime event received
[FLOATING CHAT] ✅ Booking confirmed - Unlocking chat
[FLOATING CHAT] STEP 8: Chat UI will now be unlocked

# 7. Verify chat is now unlocked (no 🔒 overlay)

# ✅ PASS: Chat unlocks automatically
# ❌ FAIL: Chat stays locked → Check realtime subscription
```

### Step 4: Test Message Sending (1 minute)
```bash
# 1. With unlocked chat, type "Test message"
# 2. Click send
# 3. Check console:

[MESSAGING] 📝 Creating message document
[MESSAGING] Collection ID: chat_messages
[MESSAGING] ✅ Message created: msg_abc123

# 4. Message appears in chat window

# ✅ PASS: Message sent and appears
# ❌ FAIL: Error or no message → Check VITE_CHAT_MESSAGES_COLLECTION_ID
```

---

## 🔴 Common Issues

### Issue: "❌ MISSING CONFIG: VITE_CHAT_SESSIONS_COLLECTION_ID"
**Fix:** Add to `.env.development`:
```bash
VITE_CHAT_SESSIONS_COLLECTION_ID=chat_sessions
VITE_CHAT_MESSAGES_COLLECTION_ID=chat_messages
```

### Issue: "❌ EMPTY COLLECTION ID"
**Root Cause:** Environment variable not loaded
**Fix:** 
1. Check `.env.development` exists
2. Restart dev server
3. Clear browser cache

### Issue: Chat stays locked forever
**Root Cause:** Realtime subscription not receiving events
**Fix:**
1. Check console for `[FLOATING CHAT] ✅ Realtime subscription active`
2. Verify booking status changed in Appwrite Console
3. Check subscription channel matches collection ID

### Issue: Chat session not created
**Root Cause:** Missing Appwrite permissions or collection
**Fix:**
1. Verify `chat_sessions` collection exists in Appwrite
2. Check permissions: Any → Create, Read, Update
3. Check console for STEP 4 validation results

---

## 📋 Pass/Fail Checklist

- [ ] ✅ All VITE_* variables loaded
- [ ] ✅ Chat session created on booking accept
- [ ] ✅ All STEP 4 validations show ✅
- [ ] ✅ Realtime subscription active
- [ ] ✅ Chat unlocks when status = 'confirmed'
- [ ] ✅ Messages can be sent and received
- [ ] ✅ No errors in console

**If all checked:** Flow is working correctly ✅

**If any unchecked:** See full debug report in `BOOKING_CHAT_FLOW_DEBUG_REPORT.md`

---

## 🎯 Expected Console Output (Complete Flow)

```bash
# On page load:
[APPWRITE CONFIG] Checking VITE_APPWRITE_ENDPOINT: ✅ LOADED
[APPWRITE CONFIG] Checking VITE_CHAT_SESSIONS_COLLECTION_ID: ✅ LOADED
[APPWRITE CONFIG] ✅ Appwrite Client initialized

# On booking accept:
[BOOKING ACCEPT] Creating chat session for booking: booking_xyz
[BOOKING ACCEPT] STEP 4 VALIDATION:
[BOOKING ACCEPT]   - buyerId: ✅
[BOOKING ACCEPT]   - therapistId: ✅
[BOOKING ACCEPT]   - bookingId: ✅
[BOOKING ACCEPT]   - status: ✅
[BOOKING ACCEPT] ✅ Chat session created: booking_xyz

# On chat open:
[FLOATING CHAT] STEP 7: Setting up realtime listener
[FLOATING CHAT] ✅ Realtime subscription active

# On booking confirmed:
[FLOATING CHAT] ✅ Realtime event received
[FLOATING CHAT] ✅ Booking confirmed - Unlocking chat
[FLOATING CHAT] STEP 8: Chat UI will now be unlocked

# On message send:
[MESSAGING] 📝 Creating message document
[MESSAGING] Collection ID: chat_messages
[MESSAGING] ✅ Message created: msg_abc123
```

---

## 📞 Need Help?

Full details in: `BOOKING_CHAT_FLOW_DEBUG_REPORT.md`
- Step-by-step validation
- Detailed error explanations
- Code examples
- Deployment checklist

