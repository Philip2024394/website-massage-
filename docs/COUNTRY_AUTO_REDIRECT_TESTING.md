# Testing Country Auto-Redirect

## Quick Test Instructions

### 1. Test Basic Auto-Redirect

**Simulate Fresh Visit**:
```javascript
// Open browser console and run:
sessionStorage.removeItem('country_auto_redirected');
localStorage.removeItem('user_location_preference');
location.reload();
```

**Expected Result**:
- Page detects your IP country
- Auto-redirects to country-specific page
- Console shows: `🌍 [AUTO-REDIRECT] Redirecting to country page: <country>`

### 2. Test Nearest Country Fallback

**Test from Unsupported Country**:

If you're in a country not in the supported list (ID, MY, SG, TH, PH, VN, GB, US, AU, DE), you should see:

```javascript
// Console output
📍 Detected JP but not supported, using nearest: SG
🌍 [AUTO-REDIRECT] Detected location: { country: 'SG', isNearest: true, originalCountry: 'JP' }
📍 [NEAREST COUNTRY] Redirected from JP to nearest: SG
```

### 3. Test with VPN

**Using VPN**:
1. Connect to VPN (e.g., Japan, China, France)
2. Clear session: `sessionStorage.removeItem('country_auto_redirected');`
3. Visit homepage
4. Should redirect to nearest supported country

**Expected Redirects**:
- VPN to Japan → Singapore
- VPN to China → Thailand
- VPN to France → United Kingdom
- VPN to Canada → United States
- VPN to New Zealand → Australia

### 4. Test Session Behavior

**First Redirect**:
```javascript
// Visit homepage
// Console: "🌍 [AUTO-REDIRECT] Redirecting to country page: vietnam"
```

**Navigate Back to Home**:
```javascript
// Click back or navigate to /home
// Console: "🌍 [AUTO-REDIRECT] Skipping - already redirected this session"
```

**New Session**:
```javascript
// Close browser tab
// Open new tab, visit homepage
// Should redirect again (new session)
```

### 5. Test Saved Preference

**Save Preference**:
1. Visit `/` (auto-redirects to detected country, e.g., `/vietnam`)
2. Manually navigate to `/thailand`
3. Preference auto-saved

**Test Saved Preference**:
```javascript
// Refresh page
// Should open /thailand (saved preference)
// Console: "🌍 [AUTO-REDIRECT] Skipping - user has saved preference"
```

**Clear Preference**:
```javascript
localStorage.removeItem('user_location_preference');
location.reload();
// Should use IP detection again
```

## Console Commands for Testing

### Check Current Location Data
```javascript
// Import service
const { ipGeolocationService } = await import('./lib/ipGeolocationService');

// Get location
const location = await ipGeolocationService.getUserLocation();
console.log('Location:', location);
```

### Test Nearest Country Logic
```javascript
// Test different countries
const { ipGeolocationService } = await import('./lib/ipGeolocationService');

console.log('Japan → ', ipGeolocationService.getNearestCountry('JP'));     // → SG
console.log('China → ', ipGeolocationService.getNearestCountry('CN'));     // → TH
console.log('France → ', ipGeolocationService.getNearestCountry('FR'));    // → GB
console.log('Canada → ', ipGeolocationService.getNearestCountry('CA'));    // → US
console.log('India → ', ipGeolocationService.getNearestCountry('IN'));     // → SG
```

### Get Country Route
```javascript
const { ipGeolocationService } = await import('./lib/ipGeolocationService');

console.log('VN → ', ipGeolocationService.getCountryRoute('VN'));  // → 'vietnam'
console.log('GB → ', ipGeolocationService.getCountryRoute('GB'));  // → 'united-kingdom'
console.log('US → ', ipGeolocationService.getCountryRoute('US'));  // → 'united-states'
```

### Check Supported Countries
```javascript
const { ipGeolocationService } = await import('./lib/ipGeolocationService');

const countries = ipGeolocationService.getSupportedCountries();
console.table(countries);
// Shows: code, name, flag for all 10 supported countries
```

### View Proximity Map
```javascript
// This is internal, but you can inspect it in the source
// lib/ipGeolocationService.ts → COUNTRY_PROXIMITY constant
```

## Expected Console Logs

### Successful Auto-Redirect (Supported Country)
```
📍 CityContext: Location initialized: {
  countryCode: 'VN',
  countryName: 'Vietnam',
  detected: true,
  method: 'ip'
}
🌍 [AUTO-REDIRECT] Detected location: {
  country: 'VN',
  method: 'ip',
  isNearest: false
}
🌍 [AUTO-REDIRECT] Redirecting to country page: vietnam
```

### Auto-Redirect with Nearest Country
```
📍 CityContext: Location initialized: {
  countryCode: 'SG',
  countryName: 'Singapore',
  detected: true,
  method: 'ip',
  isNearest: true,
  originalCountryCode: 'JP'
}
🌍 [AUTO-REDIRECT] Detected location: {
  country: 'SG',
  method: 'ip',
  isNearest: true,
  originalCountry: 'JP'
}
📍 [NEAREST COUNTRY] Redirected from JP to nearest: SG
🌍 [AUTO-REDIRECT] Redirecting to country page: singapore
```

### Skipped - Already Redirected
```
🌍 [AUTO-REDIRECT] Skipping - already redirected this session
```

### Skipped - Saved Preference
```
📍 Using saved location preference: {
  countryCode: 'TH',
  countryName: 'Thailand',
  method: 'saved'
}
🌍 [AUTO-REDIRECT] Skipping - user has saved preference
```

### Skipped - Not on Home Page
```
🌍 [AUTO-REDIRECT] Skipping - not on home page
```

## Testing Different Scenarios

### Scenario 1: User from Vietnam (First Visit)
```
1. User visits https://yoursite.com/
2. IP detected: VN
3. Auto-redirects to /vietnam
4. User sees Vietnamese massage types
5. Session flag set
6. Navigate to /home → No redirect (session flag)
```

### Scenario 2: User from Japan (Unsupported)
```
1. User visits https://yoursite.com/
2. IP detected: JP (not supported)
3. Finds nearest: SG
4. Auto-redirects to /singapore
5. Console: "Redirected from JP to nearest: SG"
6. User sees Singapore massage types
```

### Scenario 3: User Manually Switches
```
1. User from Vietnam, auto-redirected to /vietnam
2. User clicks on Thailand link or navigates to /thailand
3. Preference saved: TH
4. User closes browser and returns tomorrow
5. Opens https://yoursite.com/
6. Auto-redirects to /thailand (saved preference)
7. Console: "Using saved location preference"
```

### Scenario 4: VPN User Changes Location
```
1. User connects VPN to Thailand
2. Visit site → Redirects to /thailand
3. Session flag: "country_auto_redirected = true"
4. User disconnects VPN (now in Japan)
5. Navigate to /home → No redirect (session flag still set)
6. Close browser, reopen (new session)
7. Now detects Japan → Redirects to /singapore
```

## Debugging Common Issues

### Issue: Not Redirecting

**Check**:
```javascript
// 1. Check if session flag set
console.log(sessionStorage.getItem('country_auto_redirected'));
// Clear if needed: sessionStorage.removeItem('country_auto_redirected');

// 2. Check current page
console.log(window.location.pathname + window.location.hash);
// Must be '/' or '/home' or '/#/home'

// 3. Check saved preference
console.log(localStorage.getItem('user_location_preference'));
// Clear if needed: localStorage.removeItem('user_location_preference');

// 4. Check IP detection
const { ipGeolocationService } = await import('./lib/ipGeolocationService');
const location = await ipGeolocationService.getUserLocation();
console.log('Location:', location);
```

### Issue: Wrong Country Detected

**Possible Causes**:
1. VPN active
2. Corporate proxy
3. IP geolocation database outdated
4. Using cached result

**Solutions**:
```javascript
// Clear cache and force re-detection
localStorage.removeItem('user_location_preference');
sessionStorage.removeItem('country_auto_redirected');

// Manually set country
const { useCityContext } = await import('./context/CityContext');
// In React component:
const { setCountry } = useCityContext();
setCountry('TH'); // Set to Thailand
```

### Issue: Redirects Every Time

**Check**:
```javascript
// Session flag should be set after first redirect
console.log(sessionStorage.getItem('country_auto_redirected'));

// If null, the useEffect might be running multiple times
// Check App.tsx for duplicate useEffect or dependency issues
```

### Issue: Console Errors

**Check Browser Console**:
```javascript
// Look for errors like:
// ❌ [AUTO-REDIRECT] Failed: <error>

// Check network tab for failed API calls:
// - https://ipapi.co/json/
// - https://ipinfo.io/json
```

## Performance Testing

### Measure Redirect Time
```javascript
// In browser console
const start = performance.now();

// Clear and reload
sessionStorage.removeItem('country_auto_redirected');
localStorage.removeItem('user_location_preference');

// After redirect completes, check:
const end = performance.now();
console.log('Redirect took:', end - start, 'ms');

// Expected: 100-500ms for first visit
```

### Test IP Service Speed
```javascript
const { ipGeolocationService } = await import('./lib/ipGeolocationService');

// Test IPAPI
const start1 = performance.now();
const response1 = await fetch('https://ipapi.co/json/');
const data1 = await response1.json();
console.log('ipapi.co:', performance.now() - start1, 'ms', data1);

// Test IPInfo
const start2 = performance.now();
const response2 = await fetch('https://ipinfo.io/json');
const data2 = await response2.json();
console.log('ipinfo.io:', performance.now() - start2, 'ms', data2);
```

## Manual Testing Checklist

- [ ] Visit `/` from supported country → Redirects to country page
- [ ] Visit `/` from unsupported country → Redirects to nearest country
- [ ] Console shows country detection logs
- [ ] Console shows redirect logs
- [ ] Session flag prevents multiple redirects
- [ ] Navigate to `/home` after redirect → No second redirect
- [ ] Manually switch country → Preference saved
- [ ] Revisit site → Uses saved preference
- [ ] Clear preference → Uses IP detection again
- [ ] Test with VPN to different countries
- [ ] Test on mobile device
- [ ] Test in incognito mode
- [ ] Check performance (<500ms)
- [ ] Verify correct nearest country for unsupported regions

## Success Criteria

✅ **Auto-Redirect Works**:
- Users from supported countries go to their country page
- Users from unsupported countries go to nearest country
- Console logs confirm detection and redirect

✅ **Session Management Works**:
- Only redirects once per session
- Multiple home page visits don't cause multiple redirects

✅ **Preference System Works**:
- Manual country selection saves preference
- Saved preference overrides IP detection
- Can clear preference to re-enable IP detection

✅ **Performance Acceptable**:
- Total redirect time < 500ms
- No blocking or flickering
- Smooth user experience

✅ **Nearest Country Logic Works**:
- Unsupported Asian countries → Singapore/Thailand
- Unsupported European countries → United Kingdom
- Unsupported American countries → United States
- Unsupported Oceanic countries → Australia

## Notes

- Auto-redirect only happens on first home page visit per session
- Users can always manually navigate to any country
- Saved preferences persist across sessions
- VPN users will be redirected based on VPN location
- Corporate networks might affect IP detection
