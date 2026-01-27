# PWA Installation Debug Guide

## 🔍 How to Debug PWA Installation Issues

### Quick Console Commands

Open browser console (F12) and run these commands:

```javascript
// Check PWA status
window.getPWAStatus()

// Reset installation banner (if dismissed)
window.clearPWADismissal()

// Manually show banner
window.showPWABanner()
```

## 📱 Platform-Specific Installation

### iOS (Safari)
1. Open website in Safari browser
2. Tap the Share button (⬆️) at the bottom
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. ✅ App icon will appear on home screen

**Note:** iOS doesn't support the `beforeinstallprompt` event. Users MUST use manual installation.

### Android (Chrome)
1. Open website in Chrome browser
2. Look for install banner at top of page
3. Tap "Install" button
4. OR tap menu (⋮) → "Install app"
5. ✅ App will open automatically

**Note:** Chrome requires PWA criteria to be met before showing install prompt.

### Desktop (Chrome/Edge)
1. Look for install icon (⬇️) in address bar
2. Click it and select "Install"
3. OR go to menu → "Install IndaStreet"
4. ✅ App will open in standalone window

## 🛠️ Common Issues & Solutions

### Issue 1: "Install button doesn't appear"

**Possible causes:**
- App is already installed
- User previously dismissed banner (7-day cooldown)
- Browser doesn't support PWA
- PWA requirements not met

**Solutions:**
```javascript
// 1. Check if already installed
window.getPWAStatus()

// 2. Reset dismissal
window.clearPWADismissal()

// 3. Check console logs for errors
// Look for messages starting with "PWA Install:"
```

### Issue 2: "beforeinstallprompt never fires"

**Possible causes:**
- iOS device (Safari doesn't fire this event)
- App already installed
- Service worker not registered
- Manifest errors
- Not served over HTTPS

**Check:**
1. Open DevTools → Application tab
2. Check "Service Workers" section
3. Check "Manifest" section for errors
4. Verify HTTPS (required for PWA)

### Issue 3: "Install prompt shows but install fails"

**Error messages and solutions:**

- **"User gesture required"** → User must click install button (can't auto-trigger)
- **"Already installed"** → App is already installed, check home screen
- **"Manifest invalid"** → Check manifest.json for errors

## 🔎 Console Logging

The PWA banner logs detailed information:

```
PWA Install Banner: Component mounted
PWA Install Banner: User agent: ...
PWA Install Banner: Is iOS? true/false
PWA Install Banner: ✅ beforeinstallprompt event fired  // Success!
PWA Install Banner: ⚠️ beforeinstallprompt did NOT fire  // Issue!
```

### What to check if prompt doesn't fire:

1. **Already installed?**
   ```javascript
   window.matchMedia('(display-mode: standalone)').matches  // true = installed
   ```

2. **Recently dismissed?**
   ```javascript
   localStorage.getItem('pwa-banner-dismissed')  // 'true' = dismissed
   ```

3. **Service worker active?**
   ```javascript
   navigator.serviceWorker.controller  // Should return ServiceWorker object
   ```

## 📋 PWA Requirements Checklist

For PWA to be installable:

- ✅ Served over HTTPS
- ✅ Valid manifest.json with:
  - name
  - short_name
  - icons (at least 192x192 and 512x512)
  - start_url
  - display: standalone
- ✅ Service worker registered
- ✅ Service worker controls page
- ✅ User has engaged with site (not required for iOS)

## 🧪 Testing Installation

### Test on Android Chrome:
1. Open site in Chrome
2. Open DevTools → Console
3. Run: `window.getPWAStatus()`
4. Check for: `hasPrompt: true`
5. If false, check console for warning messages

### Test on iOS Safari:
1. Open site in Safari
2. Look for banner showing iOS instructions
3. Follow manual installation steps
4. App should have iOS-specific manifest

### Force Reset for Testing:
```javascript
// Clear all PWA state
localStorage.clear()
// Unregister service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister())
})
// Reload page
location.reload()
```

## 📞 Customer Support Script

**When customer says "I can't install the app":**

1. **Ask what device/browser they're using**
   - iOS Safari → Direct to manual installation
   - Android Chrome → Check for banner/prompt
   - Other browsers → Provide specific instructions

2. **Check if banner was dismissed**
   - Ask them to run: `window.clearPWADismissal()`
   - Banner should reappear

3. **Verify installation requirements**
   - Served over HTTPS? ✅
   - Valid manifest? ✅
   - Service worker active? ✅

4. **Platform-specific instructions**
   - **iOS:** "Tap Share (⬆️) → Add to Home Screen"
   - **Android:** "Look for 'Install app' in browser menu (⋮)"
   - **Desktop:** "Look for install icon (⬇️) in address bar"

## 🎯 Enhanced Error Messages

The updated PWA banner now provides:

1. **Detailed platform-specific instructions** when prompt unavailable
2. **Better error messages** for installation failures
3. **Console logging** for debugging
4. **Helper functions** for testing (`window.getPWAStatus()`, `window.clearPWADismissal()`)

## 🔧 Recent Improvements

### What was fixed:

1. ✅ **Better fallback instructions** - Shows platform-specific steps when `beforeinstallprompt` unavailable
2. ✅ **Enhanced console logging** - Tracks install flow and identifies issues
3. ✅ **Debug helpers** - `window.getPWAStatus()`, `window.clearPWADismissal()`, `window.showPWABanner()`
4. ✅ **Error handling** - Catches and explains installation errors
5. ✅ **iOS detection** - Automatically shows iOS-specific instructions
6. ✅ **Success confirmation** - Shows alert when installation succeeds

### Testing the fixes:

```javascript
// 1. Open homepage
// 2. Open console (F12)
// 3. Check status
window.getPWAStatus()

// 4. If dismissed, reset
window.clearPWADismissal()

// 5. Banner should appear with install button or instructions
```

## 📝 Notes

- Banner auto-dismisses for 7 days when user clicks "Not Now"
- iOS requires manual installation (Safari limitation)
- Chrome requires user engagement before showing prompt
- Service worker must be active for installation
- HTTPS is mandatory for PWA features
