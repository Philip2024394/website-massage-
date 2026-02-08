# PWA NOTIFICATION SOUND TESTING GUIDE

## 🧪 COMPREHENSIVE TESTING PROTOCOL

**Purpose:** Verify PWA notification sounds work reliably on Android and iOS  
**Target:** Therapist apps, Place apps, Installed PWAs  
**Platforms:** Android Chrome PWA, iOS Safari PWA

---

## 📋 PRE-TESTING CHECKLIST

### Requirements
- [ ] Sound files exist in `/public/sounds/`:
  - [ ] `booking-notification.mp3`
  - [ ] `message-notification.mp3`
  - [ ] `status-notification.mp3`
  - [ ] `urgent-notification.mp3`
- [ ] Service Worker registered (`/sw.js`)
- [ ] App installed as PWA (not browser tab)
- [ ] Notification permission granted

### Test Devices
- [ ] Android phone (Android 8+)
- [ ] iPhone (iOS 14+)
- [ ] Desktop Chrome (for comparison)

---

## 🤖 ANDROID PWA TESTING

### Test 1: Install PWA
**Steps:**
1. Open Chrome on Android
2. Navigate to app URL
3. Tap menu → "Add to Home Screen"
4. Launch app from home screen icon

**Expected Result:**
- ✅ App opens in standalone mode (no browser UI)
- ✅ Service Worker registered in DevTools

**Status:** [ ] PASS / [ ] FAIL

---

### Test 2: Grant Notification Permission
**Steps:**
1. Open app
2. Look for notification permission prompt
3. Tap "Allow"

**Expected Result:**
- ✅ Permission granted
- ✅ No errors in console

**Status:** [ ] PASS / [ ] FAIL

---

### Test 3: Verify Android Notification Channel
**Steps:**
1. Open Chrome DevTools (connect via USB debugging)
2. Check Service Worker console logs
3. Look for: `✅ Android notification channel "booking-alerts-high" created`

**Expected Result:**
- ✅ Channel created automatically on Service Worker activation
- ✅ Channel has HIGH importance

**Alternative Check:**
1. Android Settings → Apps → [Your App] → Notifications
2. Verify "Booking Alerts" channel exists
3. Verify sound is enabled

**Status:** [ ] PASS / [ ] FAIL

---

### Test 4: Background Notification (App Closed)
**Steps:**
1. Close app completely (swipe away from recent apps)
2. Lock screen
3. Send test notification (use backend test endpoint or Firebase Console)
4. Wait for notification

**Expected Result:**
- ✅ Phone makes sound (default notification sound)
- ✅ Notification appears on lock screen
- ✅ Vibration occurs
- ✅ Notification is visible

**Test Data:**
```json
{
  "title": "New Booking Request",
  "body": "Test Customer requests 60-minute massage",
  "icon": "/icon-192.png",
  "badge": "/badge-72.png",
  "bookingId": "TEST123",
  "priority": "high"
}
```

**Status:** [ ] PASS / [ ] FAIL

---

### Test 5: Foreground Notification (App Open)
**Steps:**
1. Open app
2. Keep app in foreground
3. Send test notification
4. Listen for sound

**Expected Result:**
- ✅ Custom MP3 sound plays (`booking-notification.mp3`)
- ✅ Vibration occurs
- ✅ System notification also appears

**Status:** [ ] PASS / [ ] FAIL

---

### Test 6: Locked Screen Notification
**Steps:**
1. Keep app running in background (don't close)
2. Lock screen
3. Send test notification
4. Check lock screen

**Expected Result:**
- ✅ Sound plays
- ✅ Notification shows on lock screen
- ✅ Tapping notification unlocks phone and opens app

**Status:** [ ] PASS / [ ] FAIL

---

### Test 7: Sound Settings Toggle
**Steps:**
1. Open app
2. Go to notification settings
3. Toggle sound OFF
4. Send test notification
5. Toggle sound ON
6. Send another test notification

**Expected Result:**
- ✅ Sound OFF: No custom MP3 plays (system sound may still play)
- ✅ Sound ON: Custom MP3 plays
- ✅ Settings persist after app restart

**Status:** [ ] PASS / [ ] FAIL

---

### Test 8: Volume Control
**Steps:**
1. Open app
2. Go to notification settings
3. Adjust volume slider to 50%
4. Test sound button
5. Adjust to 100%
6. Test sound button

**Expected Result:**
- ✅ Volume changes audibly
- ✅ Sound plays at correct volume
- ✅ Volume setting persists

**Status:** [ ] PASS / [ ] FAIL

---

## 🍎 iOS PWA TESTING

### Test 1: Install PWA on iOS
**Steps:**
1. Open Safari on iPhone
2. Navigate to app URL
3. Tap Share button → "Add to Home Screen"
4. Launch app from home screen icon

**Expected Result:**
- ✅ App opens in standalone mode
- ✅ No Safari UI visible

**Status:** [ ] PASS / [ ] FAIL

---

### Test 2: iOS Permission Prompt
**Steps:**
1. Open app (first launch)
2. Look for custom permission prompt (with 🔔 icon)
3. Tap "Enable Notifications" button
4. iOS system prompt appears
5. Tap "Allow"

**Expected Result:**
- ✅ Custom educational prompt appears
- ✅ Explains iOS limitations
- ✅ Triggered from user gesture (button click)
- ✅ iOS system prompt appears after tapping button
- ✅ Permission granted successfully

**iOS-Specific Notes:**
- ⚠️ If permission prompt doesn't appear, check: Settings → Safari → Notifications
- ⚠️ Permission MUST be requested from user action (button tap)

**Status:** [ ] PASS / [ ] FAIL

---

### Test 3: iOS Background Notification (App Closed)
**Steps:**
1. Close app completely (swipe up in app switcher)
2. Lock iPhone
3. Send test notification
4. Wait for notification

**Expected Result:**
- ✅ iOS system notification sound plays (NOT custom MP3)
- ✅ Notification appears on lock screen
- ✅ Banner shows on screen when unlocked
- ⚠️ Custom vibration may not work (iOS limitation)

**Known iOS Limitations:**
- ❌ Custom MP3 sounds not supported
- ✅ System notification sound works
- ⚠️ Vibration patterns limited

**Status:** [ ] PASS / [ ] FAIL

---

### Test 4: iOS Foreground Notification (App Open)
**Steps:**
1. Open app
2. Keep app in foreground
3. Send test notification

**Expected Result:**
- ✅ Custom MP3 sound plays (iOS allows audio in foreground)
- ✅ System notification may also appear
- ✅ Sound respects volume setting

**Status:** [ ] PASS / [ ] FAIL

---

### Test 5: iOS Audio Permission (First Interaction)
**Steps:**
1. Fresh install (or clear site data)
2. Open app
3. First notification arrives
4. Tap notification settings
5. Tap "Test Sound" button

**Expected Result:**
- ✅ iOS plays sound (audio permission granted via user interaction)
- ✅ Subsequent notifications play sound automatically

**iOS Note:** First audio play must be from user gesture

**Status:** [ ] PASS / [ ] FAIL

---

### Test 6: iOS Settings Persistence
**Steps:**
1. Change notification settings (sound OFF)
2. Close app completely
3. Reopen app
4. Check settings

**Expected Result:**
- ✅ Settings preserved
- ✅ Sound state matches previous session

**Status:** [ ] PASS / [ ] FAIL

---

### Test 7: iOS Permission Denied Recovery
**Steps:**
1. Fresh install
2. When permission prompt appears, tap "Don't Allow"
3. Check app behavior

**Expected Result:**
- ✅ App shows "Notifications Blocked" message
- ✅ Instructions provided for enabling in Settings
- ✅ App functions normally otherwise

**Status:** [ ] PASS / [ ] FAIL

---

## 🖥️ DESKTOP BROWSER TESTING (Baseline)

### Test 1: Desktop Chrome
**Steps:**
1. Open Chrome on desktop
2. Navigate to app
3. Grant notification permission
4. Send test notification

**Expected Result:**
- ✅ Desktop notification appears
- ✅ System sound plays
- ✅ Clicking notification opens app

**Status:** [ ] PASS / [ ] FAIL

---

## 📊 PERFORMANCE TESTING

### Test 1: Sound Preloading
**Steps:**
1. Open app
2. Check DevTools Network tab
3. Look for sound file requests

**Expected Result:**
- ✅ Sound files loaded in background
- ✅ Files cached for instant playback
- ✅ No delay when testing sound

**Status:** [ ] PASS / [ ] FAIL

---

### Test 2: Multiple Notifications
**Steps:**
1. Send 3 notifications rapidly (within 10 seconds)
2. Check app behavior

**Expected Result:**
- ✅ All notifications display
- ✅ Sound plays for each (may queue)
- ✅ No crashes or errors

**Status:** [ ] PASS / [ ] FAIL

---

### Test 3: Battery Impact
**Steps:**
1. Install app on Android
2. Use for 1 hour with notifications
3. Check battery usage

**Expected Result:**
- ✅ Battery drain reasonable (<5% per hour background)
- ✅ No excessive CPU usage

**Status:** [ ] PASS / [ ] FAIL

---

## 🐛 EDGE CASE TESTING

### Test 1: No Internet Connection
**Steps:**
1. Turn on airplane mode
2. App already installed
3. Try to play test sound

**Expected Result:**
- ✅ Cached sound plays
- ✅ No errors shown

**Status:** [ ] PASS / [ ] FAIL

---

### Test 2: Sound Files Missing
**Steps:**
1. Block `/sounds/` directory in DevTools
2. Trigger notification

**Expected Result:**
- ✅ Fallback sound plays OR
- ✅ Silent notification (no crash)
- ✅ Error logged in console

**Status:** [ ] PASS / [ ] FAIL

---

### Test 3: Service Worker Update
**Steps:**
1. Deploy new Service Worker version
2. Open app
3. Check for update

**Expected Result:**
- ✅ New Service Worker installs
- ✅ Old cache cleared
- ✅ Android notification channels recreated
- ✅ No loss of settings

**Status:** [ ] PASS / [ ] FAIL

---

## ✅ FINAL ACCEPTANCE TEST

### The Ultimate Test: Real-World Scenario

**Scenario:** Therapist receives booking at night

**Steps:**
1. Install app as PWA
2. Grant all permissions
3. Close app completely
4. Put phone on bedside table (screen locked)
5. Send real booking notification
6. **CRITICAL:** Phone must wake therapist with sound

**Expected Result:**
- ✅ Phone plays notification sound (loud enough to wake)
- ✅ Notification visible on lock screen
- ✅ Vibration occurs
- ✅ Tapping notification opens app to booking details

**This is the ONLY test that matters for business success.**

**Status:** [ ] PASS / [ ] FAIL

---

## 📝 TEST REPORT TEMPLATE

```
TESTER: _______________
DATE: _______________
DEVICE: _______________
OS VERSION: _______________

ANDROID PWA TESTS:
- Test 1: [ ] PASS / [ ] FAIL
- Test 2: [ ] PASS / [ ] FAIL
- Test 3: [ ] PASS / [ ] FAIL
- Test 4: [ ] PASS / [ ] FAIL
- Test 5: [ ] PASS / [ ] FAIL
- Test 6: [ ] PASS / [ ] FAIL
- Test 7: [ ] PASS / [ ] FAIL
- Test 8: [ ] PASS / [ ] FAIL

iOS PWA TESTS:
- Test 1: [ ] PASS / [ ] FAIL
- Test 2: [ ] PASS / [ ] FAIL
- Test 3: [ ] PASS / [ ] FAIL
- Test 4: [ ] PASS / [ ] FAIL
- Test 5: [ ] PASS / [ ] FAIL
- Test 6: [ ] PASS / [ ] FAIL
- Test 7: [ ] PASS / [ ] FAIL

FINAL ACCEPTANCE: [ ] PASS / [ ] FAIL

NOTES:
_________________________________
_________________________________
_________________________________
```

---

## 🚨 CRITICAL ISSUES TO WATCH

### Issue 1: Android Notification Channel Not Created
**Symptom:** Sound doesn't play on Android  
**Fix:** Check Service Worker activation logs  
**Debug:** `adb logcat | grep "booking-alerts"`

### Issue 2: iOS Permission Blocked
**Symptom:** iOS notifications don't appear  
**Fix:** Settings → Safari → Notifications → Enable  
**Prevention:** Ensure permission requested from user gesture

### Issue 3: Sound Files 404
**Symptom:** No sound plays when app is open  
**Fix:** Verify files exist in `/public/sounds/`  
**Debug:** Check Network tab for 404 errors

### Issue 4: Service Worker Not Updating
**Symptom:** Old version still running  
**Fix:** Unregister SW → Hard refresh → Re-register  
**Command:** DevTools → Application → Service Workers → Unregister

---

## ✅ TESTING COMPLETE CHECKLIST

- [ ] All Android tests passed
- [ ] All iOS tests passed
- [ ] Final acceptance test passed
- [ ] No critical issues found
- [ ] Performance acceptable
- [ ] Edge cases handled
- [ ] Documentation updated
- [ ] Stakeholders notified

**If all checkboxes are checked, implementation is PRODUCTION READY.**

---

**END OF TESTING GUIDE**
