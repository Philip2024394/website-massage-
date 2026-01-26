# Browser Testing Checklist - 2026

## Quick Test Commands

### Check Browser Compatibility (Open Console - F12)
```javascript
// Run this in browser console to check compatibility
import { logBrowserInfo } from './utils/browserCompatibility';
logBrowserInfo();
```

Expected output:
```
🌐 Browser Compatibility Report
Browser: Chrome 121
Supported: ✅
Platform: Desktop
Geolocation: ✅
Storage: ✅ localStorage
Features: {fetch: true, promise: true, ...}
```

## Desktop Browser Testing

### Chrome (Windows/Mac/Linux)
- [ ] Version 73+
- [ ] GPS location button works
- [ ] HTTPS geolocation works
- [ ] PWA install prompt appears
- [ ] Push notifications work
- [ ] Service Worker activates
- [ ] Offline mode functions
- [ ] All pages load correctly
- [ ] Chat system works
- [ ] Booking flow completes
- [ ] Image uploads work
- [ ] Responsive design on resize

**Test URLs:**
- [ ] http://localhost:3000 (dev)
- [ ] https://yourdomain.com (production)

### Firefox (Windows/Mac/Linux)
- [ ] Version 63+
- [ ] GPS location button works
- [ ] HTTPS geolocation works
- [ ] PWA install prompt appears
- [ ] Push notifications work
- [ ] Service Worker activates
- [ ] Offline mode functions
- [ ] All pages load correctly
- [ ] Chat system works
- [ ] Booking flow completes
- [ ] Image uploads work
- [ ] Tracking protection doesn't break features

### Safari (macOS)
- [ ] Version 12.1+
- [ ] GPS location button works (30s timeout)
- [ ] HTTPS geolocation works
- [ ] Manual PWA install works (File → Add to Dock)
- [ ] Service Worker activates
- [ ] Offline mode functions
- [ ] All pages load correctly
- [ ] Chat system works
- [ ] Booking flow completes
- [ ] Image uploads work
- [ ] Private mode storage fallback works

**Safari-Specific Tests:**
```javascript
// Test in Safari console
navigator.geolocation.getCurrentPosition(
  (pos) => console.log('✅ Location:', pos.coords),
  (err) => console.error('❌ Error:', err),
  { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
);
```

### Edge (Windows/Mac)
- [ ] Version 79+
- [ ] GPS location button works
- [ ] HTTPS geolocation works
- [ ] PWA install prompt appears
- [ ] Push notifications work
- [ ] Service Worker activates
- [ ] Offline mode functions
- [ ] All pages load correctly
- [ ] Chat system works
- [ ] Booking flow completes
- [ ] Image uploads work

## Mobile Browser Testing

### Chrome Android
**Device Requirements:** Android 8+

- [ ] GPS location button works
- [ ] Device GPS must be ON
- [ ] HTTPS geolocation works
- [ ] PWA install banner appears
- [ ] Add to Home Screen works
- [ ] PWA opens in standalone mode
- [ ] Push notifications work
- [ ] Service Worker activates
- [ ] Offline mode functions
- [ ] Touch gestures work
- [ ] Keyboard doesn't cover inputs
- [ ] Chat system works on mobile
- [ ] Booking flow on mobile
- [ ] Image capture/upload works
- [ ] Responsive layout correct

**Test Scenarios:**
1. **Location Permission:**
   - First visit: Shows permission prompt
   - Denied: Shows clear error with instructions
   - Allowed: Captures GPS accurately
   
2. **PWA Install:**
   - Visit 2-3 times
   - Banner appears automatically
   - Install works
   - Uninstall and reinstall works

3. **Offline:**
   - Load page online
   - Turn on airplane mode
   - App still works
   - Shows offline indicator

### Safari iOS/iPadOS
**Device Requirements:** iOS 12.2+ or iPadOS 13+

- [ ] GPS location button works (30s timeout)
- [ ] Location Services ON in Settings
- [ ] HTTPS geolocation works
- [ ] Manual PWA install (Share → Add to Home Screen)
- [ ] PWA opens from home screen
- [ ] Service Worker activates
- [ ] Offline mode functions
- [ ] Touch gestures work
- [ ] Safari UI doesn't cover content
- [ ] Viewport handles keyboard correctly
- [ ] Chat system works
- [ ] Booking flow works
- [ ] Image capture works
- [ ] Camera permission works

**iOS-Specific Setup:**
1. Settings → Privacy & Security → Location Services → **ON**
2. Settings → Safari → Location Services → **While Using**
3. Test in both Safari and PWA mode

**iOS Test Script:**
```javascript
// Run in Safari iOS console
async function testIOSLocation() {
  console.log('🔍 Testing iOS location...');
  
  if (!navigator.geolocation) {
    console.error('❌ Geolocation not supported');
    return;
  }
  
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('✅ iOS Location Success!');
      console.log('Latitude:', position.coords.latitude);
      console.log('Longitude:', position.coords.longitude);
      console.log('Accuracy:', position.coords.accuracy, 'm');
    },
    (error) => {
      console.error('❌ iOS Location Error:', error.message);
      console.error('Error code:', error.code);
      switch(error.code) {
        case 1: console.log('→ Go to Settings → Privacy → Location Services'); break;
        case 2: console.log('→ Move to open area with GPS signal'); break;
        case 3: console.log('→ Request timed out (iOS can be slow)'); break;
      }
    },
    {
      enableHighAccuracy: true,
      timeout: 30000, // iOS needs 30s
      maximumAge: 0
    }
  );
}

testIOSLocation();
```

### Firefox Android
**Device Requirements:** Android 8+

- [ ] GPS location button works
- [ ] HTTPS geolocation works
- [ ] PWA install works
- [ ] Push notifications work
- [ ] Enhanced tracking protection doesn't break features
- [ ] Service Worker activates
- [ ] All features work

### Samsung Internet
**Device Requirements:** Android 8+, Samsung Internet 10+

- [ ] GPS location button works
- [ ] HTTPS geolocation works
- [ ] PWA install works
- [ ] Push notifications work
- [ ] Ad blocker doesn't break features
- [ ] Service Worker activates
- [ ] All features work

## Feature-Specific Testing

### GPS Location Button
**All Browsers:**
1. Click GPS button
2. Check console logs (F12)
3. Allow permission when prompted
4. Verify coordinates displayed
5. Check city is derived correctly
6. Verify button shows "✅ GPS Location Verified"

**Expected Console Output:**
```
🔘 Location button clicked
🌐 Browser Compatibility Report
  Browser: Chrome 121
  Supported: ✅
✅ Browser supported: Chrome 121
📍 Requesting GPS location...
⏳ Waiting for GPS response...
✅ GPS position received: GeolocationPosition {...}
📍 GPS accuracy: 15m
📍 Raw coordinates: {lat: -6.1234, lng: 106.1234}
🔍 Validation result: {isValid: true}
🎯 GPS-derived city: jakarta
✅ Location state updated successfully
```

**Error Testing:**
- [ ] Permission denied → Shows browser-specific instructions
- [ ] Position unavailable → Suggests moving outdoors
- [ ] Timeout → Explains GPS signal issue
- [ ] Invalid coordinates → Rejects non-Indonesia locations

### PWA Installation
**Chrome/Edge/Samsung:**
1. Visit site 2-3 times
2. Look for install banner
3. Click "Install"
4. Verify app installs
5. Open from home screen/app menu
6. Check standalone mode (no browser UI)

**Safari (Manual):**
- **macOS:** Safari → File → Add to Dock
- **iOS:** Share → Add to Home Screen

### Push Notifications
**Chrome/Firefox/Edge:**
1. Click notification permission prompt
2. Allow notifications
3. Verify subscription created
4. Send test notification
5. Check notification appears
6. Click notification
7. Verify app opens

**Safari iOS:**
- Limited support (badges only)
- Test badge counter updates

### Service Worker & Offline
**All Browsers:**
1. Load site online
2. Open DevTools → Application → Service Worker
3. Verify "activated and running"
4. Turn on airplane mode / disconnect network
5. Reload page
6. Verify page loads from cache
7. Check offline indicator appears
8. Verify critical features work offline

### Chat System
**All Browsers:**
1. Open chat with therapist
2. Send message
3. Verify message appears
4. Check real-time updates
5. Test on poor connection
6. Verify offline queuing

### Booking Flow
**All Browsers:**
1. Select therapist
2. Choose service
3. Set location (GPS)
4. Fill booking details
5. Submit booking
6. Verify confirmation
7. Check therapist receives notification

### Image Uploads
**All Browsers:**
1. Click upload button
2. Select image (< 5MB)
3. Verify preview
4. Submit
5. Check image appears
6. Test large images (should reject)
7. Test invalid formats (should reject)

**Mobile-Specific:**
- [ ] Camera capture works
- [ ] Photo library access works
- [ ] Compression works correctly

## Network Conditions Testing

### Slow 3G
- [ ] Pages load within 3 seconds
- [ ] Images lazy load
- [ ] GPS works (may be slower)
- [ ] Chat functions
- [ ] Booking completes

### 4G
- [ ] Fast load times (< 2s)
- [ ] All features instant
- [ ] GPS fast (< 5s)

### Wi-Fi
- [ ] Optimal performance
- [ ] GPS works
- [ ] All features smooth

### Offline
- [ ] Service Worker serves cached content
- [ ] Offline indicator shows
- [ ] Critical features work
- [ ] Queue syncs when online

## Performance Testing

### Lighthouse Scores (Chrome DevTools)
Target Scores:
- Performance: ≥ 90
- Accessibility: ≥ 95
- Best Practices: ≥ 95
- SEO: ≥ 90
- PWA: ≥ 90

**Run Test:**
1. Open DevTools (F12)
2. Lighthouse tab
3. Generate report
4. Check scores

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Bundle Size
- Main bundle: < 300KB (gzipped)
- Vendor chunks: < 200KB (gzipped)
- Total initial: < 500KB (gzipped)

## Security Testing

### HTTPS
- [ ] Production uses HTTPS
- [ ] No mixed content warnings
- [ ] Geolocation works on HTTPS
- [ ] All API calls use HTTPS

### Permissions
- [ ] Geolocation asks permission
- [ ] Notifications ask permission
- [ ] Camera asks permission (mobile)
- [ ] All permissions can be revoked

### Content Security Policy
- [ ] CSP headers present
- [ ] No CSP violations in console
- [ ] External scripts allowed
- [ ] Inline scripts controlled

## Accessibility Testing

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Focus visible
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] Arrow keys work in lists

### Screen Reader (NVDA/JAWS/VoiceOver)
- [ ] All images have alt text
- [ ] Buttons have labels
- [ ] Forms have labels
- [ ] Landmarks present
- [ ] Headings hierarchical

### Visual
- [ ] High contrast mode works
- [ ] Text scales to 200%
- [ ] Color contrast ≥ 4.5:1
- [ ] Focus indicators visible

## Responsive Design Testing

### Breakpoints
- [ ] Mobile: 320px - 768px
- [ ] Tablet: 768px - 1024px
- [ ] Desktop: 1024px+
- [ ] Large Desktop: 1440px+

### Orientations
- [ ] Portrait mode
- [ ] Landscape mode
- [ ] Rotation handling

### Device Testing
- [ ] iPhone 12/13/14 (iOS)
- [ ] iPhone SE (small screen)
- [ ] iPad (tablet)
- [ ] Samsung Galaxy S21+
- [ ] Google Pixel
- [ ] Small Android (360px width)

## Automation Test Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific browser
pnpm test:e2e --project=chromium
pnpm test:e2e --project=firefox
pnpm test:e2e --project=webkit

# Mobile tests
pnpm test:e2e --project=mobile-chrome
pnpm test:e2e --project=mobile-safari

# Headed mode (see browser)
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e --debug
```

## Bug Reporting Template

When reporting browser issues:

```markdown
**Browser:** Chrome 121.0.6167.85 (Official Build)
**OS:** Windows 11
**Device:** Desktop / Mobile (specify)
**URL:** https://example.com/page
**Issue:** GPS button doesn't work
**Steps to Reproduce:**
1. Click GPS location button
2. Allow permissions
3. Button stays in loading state

**Console Errors:**
[Paste console output]

**Expected:** GPS captures location
**Actual:** Button hangs, no location captured

**Screenshot:** [Attach if relevant]
```

## Sign-Off Checklist

Before production deployment:
- [ ] All desktop browsers tested
- [ ] All mobile browsers tested
- [ ] GPS works on all browsers
- [ ] PWA installs correctly
- [ ] Offline mode works
- [ ] Performance targets met
- [ ] Security checks passed
- [ ] Accessibility verified
- [ ] Responsive on all sizes
- [ ] E2E tests pass
- [ ] Browser compatibility documented
- [ ] Known issues documented

---

**Testing Period:** Pre-deployment  
**Re-test Frequency:** Every major release  
**Last Updated:** January 23, 2026
