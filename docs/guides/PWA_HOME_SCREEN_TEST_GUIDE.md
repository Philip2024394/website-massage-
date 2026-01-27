# 🧪 PWA Home Screen Routing - Test Guide

## Quick Test Procedure for Therapist Dashboard

### Prerequisites:
- Mobile device (Android or iOS)
- Chrome/Safari browser
- Therapist account credentials
- HTTPS connection (or localhost for testing)

---

## 📱 Test 1: PWA Installation

### Steps:
1. Open therapist dashboard in mobile browser
   - Production: `https://yourdomain.com/therapist`
   - Local: `http://localhost:3002` (requires HTTPS for real PWA)

2. Look for install prompt:
   - **Android Chrome**: Banner at bottom or "Add to Home Screen" in menu
   - **iOS Safari**: Share button → "Add to Home Screen"

3. Install the app:
   - Tap "Install" or "Add"
   - Confirm app name: "IndaStreet - Therapist Dashboard"
   - Verify icon appears on home screen

### Expected Result:
✅ App icon visible on phone home screen  
✅ Icon shows therapist dashboard logo  
✅ App name: "IndaStreet Therapist"

---

## 🏠 Test 2: Home Screen Launch Routing

### Steps:
1. **Important**: Close ALL browser tabs/windows
   - This ensures fresh launch simulation

2. Tap the PWA icon on home screen

3. Observe the launch behavior

### Expected Result:
✅ App opens in standalone mode (no browser address bar)  
✅ **Online Status page loads immediately** (not dashboard or any other page)  
✅ Console shows: `🏠 PWA Home Screen Launch - Routing to Online Status Dashboard`  
✅ Status buttons visible (Available/Busy/Offline)  
✅ Current status is displayed correctly

### Screenshot Areas to Verify:
- [ ] No browser UI (address bar, tabs)
- [ ] Header shows "Online Status"
- [ ] Three status buttons present
- [ ] Side menu icon visible (hamburger menu)
- [ ] Therapist name/photo in header

---

## 🔗 Test 3: Deep Link Parameters

Test that URL parameters correctly route to different pages.

### Test 3a: Status Page (Default)
**URL**: `/?pwa=true&page=status`  
**Expected**: Online Status page loads

### Test 3b: Dashboard Page
**URL**: `/?pwa=true&page=dashboard`  
**Expected**: Main dashboard page loads

### Test 3c: Bookings Page
**URL**: `/?pwa=true&page=bookings`  
**Expected**: Bookings management page loads

### Test 3d: No Parameter (Should default to status)
**URL**: `/?pwa=true`  
**Expected**: Online Status page loads

---

## 📲 Test 4: PWA Shortcuts (Android Only)

### Steps:
1. **Long-press** the PWA home screen icon
2. Observe the shortcut menu that appears

### Expected Result:
✅ Four shortcuts appear:
1. **Online Status** (First/Main)
2. Dashboard
3. Bookings
4. Support Chat

### Test Each Shortcut:
- [ ] Tap "Online Status" → Loads status page
- [ ] Tap "Dashboard" → Loads dashboard page
- [ ] Tap "Bookings" → Loads bookings page
- [ ] Tap "Support Chat" → Loads chat page

---

## 🧭 Test 5: In-App Navigation

### Steps:
1. Launch app from home screen (should open to status page)
2. Open side menu (hamburger icon)
3. Navigate to "Dashboard"
4. Close app (home button or app switcher)
5. Re-open app from home screen

### Expected Result:
✅ App returns to Online Status page (not the last visited page)  
✅ Fresh launch always goes to status page  
✅ This is intentional behavior for quick status access

---

## 🔍 Test 6: Console Logging

### Steps:
1. Connect device to computer (USB debugging for Android, Safari Web Inspector for iOS)
2. Open browser DevTools/Console
3. Launch app from home screen
4. Check console output

### Expected Console Logs:
```
🏠 PWA Home Screen Launch - Routing to Online Status Dashboard
✅ Authenticated user: therapist@example.com
📱 Initializing enhanced PWA features for therapist: [ID]
```

---

## 🌐 Test 7: Browser vs PWA Mode

### Browser Mode Test:
1. Open `https://yourdomain.com/therapist` in browser
2. Observe: Browser UI visible (address bar, tabs)
3. May load last visited page or dashboard

### PWA Mode Test:
1. Tap home screen icon
2. Observe: No browser UI (standalone app)
3. **Always loads Online Status page**

### Key Difference:
- **Browser**: Normal website behavior
- **PWA**: App-like experience, forced routing to status page

---

## ❌ Common Issues & Solutions

### Issue 1: App Opens to Dashboard Instead of Status
**Cause**: URL parameter not working  
**Solution**: 
- Verify manifest.json has `"start_url": "/?pwa=true&page=status"`
- Check App.tsx `getInitialPage()` function
- Clear browser cache and reinstall PWA

### Issue 2: Install Prompt Not Showing
**Cause**: PWA criteria not met  
**Solution**:
- Verify HTTPS connection (required)
- Check manifest.json is valid
- Ensure service worker is registered
- Try "Add to Home Screen" manually from browser menu

### Issue 3: Shortcuts Not Appearing (Android)
**Cause**: PWA not fully installed or browser limitation  
**Solution**:
- Long-press icon (not tap)
- Update Chrome to latest version
- Reinstall PWA

### Issue 4: iOS Not Showing as Standalone
**Cause**: iOS PWA limitations  
**Solution**:
- iOS always shows some browser UI (this is normal)
- Check `display-mode: standalone` is set in manifest
- Verify installed via "Add to Home Screen" not just bookmarked

---

## 📊 Test Results Template

Copy and fill out:

```
TEST DATE: __________
DEVICE: __________
OS: __________ (Android/iOS)
BROWSER: __________

✅ / ❌  PWA Installation successful
✅ / ❌  Home screen icon visible
✅ / ❌  Opens to Online Status page
✅ / ❌  Standalone mode (no browser UI)
✅ / ❌  Console log appears
✅ / ❌  Status buttons functional
✅ / ❌  Shortcuts menu works (Android)
✅ / ❌  Deep linking works
✅ / ❌  Navigation to other pages works
✅ / ❌  Return to status on fresh launch

NOTES:
_________________________________
_________________________________
```

---

## 🚀 Production Checklist

Before deploying to production:

- [ ] Manifest.json deployed with correct start_url
- [ ] App.tsx changes deployed
- [ ] Service worker updated and cache cleared
- [ ] HTTPS certificate valid
- [ ] PWA icons generated (all sizes)
- [ ] Test on multiple devices (Android + iOS)
- [ ] Verify routing works in production URL
- [ ] Check browser console for errors
- [ ] Test shortcuts on Android
- [ ] Confirm status page loads within 3 seconds

---

## 📞 Debugging Tips

### View PWA Configuration:
1. Open Chrome DevTools
2. Go to Application tab
3. Click "Manifest" in left sidebar
4. Verify start_url: `/?pwa=true&page=status`

### Check Service Worker:
1. Application tab → Service Workers
2. Verify registration status
3. Check for errors

### Test PWA Detection:
Open console and run:
```javascript
console.log('Display mode:', window.matchMedia('(display-mode: standalone)').matches);
console.log('iOS standalone:', window.navigator.standalone);
```

Should return `true` when opened from home screen.

---

**Document Version**: 1.0  
**Last Updated**: January 21, 2026  
**Feature Status**: ✅ Implemented & Ready for Testing
