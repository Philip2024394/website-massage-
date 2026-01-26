# Country-Specific App Testing Guide

## Quick Testing Instructions

### 1. Test Vietnam App Experience

**URL to Test**: `http://localhost:3011/vietnam`

**Expected Results**:
- ✅ Hero subtitle shows: "Discover Traditional Vietnamese Wellness"
- ✅ Sidebar shows Vietnamese massage types:
  - 🌿 Vietnamese Traditional Massage
  - 🎋 Bamboo Massage
  - 🌸 Vietnamese Aromatherapy
  - 💆 Cao Gio (Coining)
  - 🦶 Vietnamese Reflexology
- ✅ NO Balinese massage types visible
- ✅ Wellness centers show Vietnamese categories
- ✅ Console logs: `🌍 [COUNTRY] Country-specific mode: true Country: VN`

### 2. Test Thailand App Experience

**URL to Test**: `http://localhost:3011/thailand`

**Expected Results**:
- ✅ Hero subtitle shows: "Experience Authentic Thai Wellness"
- ✅ Sidebar shows Thai massage types:
  - 🙏 Traditional Thai Massage
  - 💆 Thai Oil Massage
  - 🔥 Thai Hot Stone Massage
  - 🦶 Thai Foot Massage
  - 👑 Royal Thai Massage
- ✅ Cultural elements show Thai traditional practices

### 3. Test Malaysia App Experience

**URL to Test**: `http://localhost:3011/malaysia`

**Expected Results**:
- ✅ Hero subtitle shows: "Explore Malaysian Wellness Heritage"
- ✅ Sidebar shows Malaysian massage types:
  - 🌺 Traditional Malay Massage
  - 🌿 Urut Batin
  - 💆 Javanese Massage
  - 🦶 Malaysian Reflexology
  - 🏝️ Borneo Traditional Massage

### 4. Test Singapore App Experience

**URL to Test**: `http://localhost:3011/singapore`

**Expected Results**:
- ✅ Hero subtitle shows: "Premium Wellness in the Lion City"
- ✅ Sidebar shows Singapore massage types:
  - 🌏 Fusion Massage
  - 🌿 Tui Na Chinese Massage
  - 💆 Ayurvedic Massage
  - ✨ Premium Spa Massage
  - 🦶 Singapore Reflexology

### 5. Test Indonesia App Experience

**URL to Test**: `http://localhost:3011/indonesia`

**Expected Results**:
- ✅ Hero subtitle shows: "Discover Indonesian Healing Traditions"
- ✅ Sidebar shows Indonesian massage types:
  - 🌺 Balinese Massage
  - 💆 Javanese Massage
  - 🌸 Indonesian Aromatherapy

### 6. Test Default Homepage

**URL to Test**: `http://localhost:3011/` or `http://localhost:3011/home`

**Expected Results**:
- ✅ Shows default content based on CityContext detection
- ✅ Sidebar shows default Bali-focused massage types
- ✅ Hero subtitle: "[Country]'s Massage Therapist Hub"
- ✅ Console shows detected country from CityContext

## Browser Console Debugging

### Expected Console Logs

When visiting a country-specific page, you should see:

```javascript
🔍 [STAGE 4 - HomePage] Component rendering
🔍 [STAGE 4] Therapists prop received: X
🔍 [STAGE 4] First 3 therapist names: [...]
🌍 [COUNTRY] Country-specific mode: true Country: VN  // ← This confirms country mode
```

### Checking Current Country

Open browser console and run:
```javascript
// Check CityContext
console.log('CityContext:', window.__cityContext);

// Check AppRouter state
console.log('Current page:', window.location.pathname);
```

## Mobile Testing

### Sidebar Menu Test
1. Visit country-specific URL on mobile (or resize browser to mobile width)
2. Tap hamburger menu icon (☰)
3. Verify sidebar opens with country-specific massage types
4. Verify massage types have correct icons and colors
5. Tap a massage type - should navigate to massage detail page

### Touch Interactions
- ✅ Sidebar swipe gestures work
- ✅ Massage type cards are tappable
- ✅ Navigation smooth on mobile
- ✅ No horizontal scrolling issues

## Edge Cases to Test

### 1. Direct Navigation
- Navigate from `/vietnam` to `/thailand` directly
- Should switch country content without page reload

### 2. Browser Back/Forward
- Visit `/vietnam` → `/thailand` → browser back
- Should restore Vietnam content

### 3. Refresh Page
- Visit `/vietnam` → refresh page (F5)
- Should maintain Vietnam-specific content

### 4. Invalid Country Route
- Visit `/invalid-country`
- Should fall back to default home page

### 5. Logged-in User
- Log in as therapist → visit `/vietnam`
- Should show country-specific content with therapist dashboard access

## API/Data Testing

### Therapist Filtering
Once data filtering is implemented:
1. Visit `/vietnam`
2. Should show ONLY therapists with `country = 'VN'`
3. Should NOT show Indonesian or Malaysian therapists

### Place Filtering
1. Visit `/thailand`
2. Should show ONLY massage places in Thailand
3. Should NOT show Singapore or Vietnam places

## Known Limitations (TODO)

- ⏳ Account creation doesn't capture country context yet
- ⏳ Therapist/place data not filtered by country yet
- ⏳ Only 5 countries configured (VN, TH, MY, SG, ID)
- ⏳ Remaining 5 countries need configuration (PH, GB, US, AU, DE)
- ⏳ No country switcher UI yet

## Troubleshooting

### Issue: Country-specific content not showing
**Check**:
1. Console log shows `Country-specific mode: true`?
2. `countryContent` prop received by HomePage?
3. `getCountryContent()` returning data for country code?

**Fix**: Verify country code mapping in AppRouter.tsx

### Issue: Sidebar shows default content instead of country-specific
**Check**:
1. AppDrawer receiving `countryCode` and `countryContent` props?
2. Console log in AppDrawer showing props?

**Fix**: Verify HomePage passing props to AppDrawer at line ~1245

### Issue: Route not recognized
**Check**:
1. Route added to AppRouter switch statement?
2. Country code mapped in `countryCodeMap`?

**Fix**: Add route case and mapping in AppRouter.tsx

### Issue: TypeScript errors
**Check**:
```bash
# Run TypeScript compiler
npm run type-check

# Or check specific files
npx tsc --noEmit pages/HomePage.tsx
npx tsc --noEmit AppRouter.tsx
```

**Fix**: Verify all interfaces have country props defined

## Success Criteria

Your country-specific app implementation is successful if:

✅ Each country URL shows unique massage types relevant to that country
✅ Sidebar menu adapts to show country-specific content
✅ Hero subtitle changes based on country
✅ No TypeScript errors
✅ Console logs confirm country-specific mode
✅ Mobile sidebar works on all country pages
✅ Navigation between countries smooth
✅ Browser back/forward works correctly

## Next Steps After Testing

Once basic country-specific functionality is verified:

1. **Configure Remaining Countries**
   - Add content for PH, GB, US, AU, DE
   - Define country-specific massage types for each

2. **Implement Data Filtering**
   - Filter therapists by country
   - Filter places by country
   - Update search/filter logic

3. **Add Account Registration with Country**
   - Capture country from route during signup
   - Store country preference in user profile
   - Load user's preferred country on login

4. **Add Country Switcher**
   - Country dropdown in header
   - Allow users to switch countries
   - Remember selection in localStorage

5. **Analytics Integration**
   - Track country-specific page views
   - Monitor conversion rates per country
   - A/B test country-specific content

## Contact

For questions or issues with country-specific implementation, check:
- `COUNTRY_SPECIFIC_APP_IMPLEMENTATION.md` - Full implementation guide
- `config/countryContent.ts` - Country configurations
- `AppRouter.tsx` - Routing logic
- `pages/HomePage.tsx` - Country prop handling
