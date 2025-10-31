# Social Sharing - Quick Visual Test Guide 🧪

## What Changed?
Added 4 social media share buttons (WhatsApp, Facebook, Instagram, TikTok) to the **bottom-right corner** of therapist profile images on the home page.

## Where to Look?
1. Open **http://localhost:3000** in your browser
2. Scroll to the **therapist listings** section (below massage type buttons)
3. Look at the **main banner image** (the large photo at the top of each therapist card)
4. You should see **4 small circular buttons** in the **bottom-right corner**:
   - 🟢 Green button (WhatsApp)
   - 🔵 Blue button (Facebook)
   - 🟣 Gradient purple-pink-orange button (Instagram)
   - ⚫ Black button (TikTok)

## Visual Reference

### BEFORE (missing social buttons):
```
┌─────────────────────────────────┐
│  Main Banner Image              │
│  ⭐ 4.5 (23)      [20% OFF]     │
│                                 │
│                                 │ ← Empty corner
└─────────────────────────────────┘
```

### AFTER (with social buttons):
```
┌─────────────────────────────────┐
│  Main Banner Image              │
│  ⭐ 4.5 (23)      [20% OFF]     │
│                                 │
│                  [🟢][🔵][🟣][⚫]│ ← NEW!
└─────────────────────────────────┘
```

## Quick Test Steps

### 1️⃣ **Visual Check** (1 minute)
- [ ] Social buttons visible on therapist cards
- [ ] Positioned in bottom-right corner
- [ ] 4 buttons total (WhatsApp, Facebook, Instagram, TikTok)
- [ ] Buttons are small circles with icons inside
- [ ] Buttons have shadow effect

### 2️⃣ **Hover Test** (1 minute)
- [ ] Hover over each button → should scale up slightly (110%)
- [ ] Hover → color should darken
- [ ] Smooth animation

### 3️⃣ **Click Test** (2 minutes)
**WhatsApp Button (Green):**
- [ ] Click → New tab opens to WhatsApp Web
- [ ] Pre-filled message: "Check out [Therapist Name] on IndaStreet - Amazing massage therapist! [URL]"

**Facebook Button (Blue):**
- [ ] Click → New tab opens to Facebook Sharer
- [ ] Shows current page URL

**Instagram Button (Gradient):**
- [ ] Click → Alert appears: "Instagram message copied! Open Instagram and paste to share."
- [ ] Clipboard contains share message with therapist name + URL

**TikTok Button (Black):**
- [ ] Click → Alert appears: "TikTok message copied! Open TikTok and paste to share."
- [ ] Clipboard contains share message with therapist name + URL

### 4️⃣ **Card Click Test** (30 seconds)
- [ ] Click social button → Should NOT open therapist details
- [ ] Click anywhere else on card → Should open therapist details
- [ ] Social buttons have proper click isolation (stopPropagation working)

### 5️⃣ **Mobile Test** (Optional - if testing on phone)
- [ ] Buttons visible on mobile screen
- [ ] Buttons tappable (not too small)
- [ ] WhatsApp opens WhatsApp app (not web)
- [ ] Facebook opens Facebook app (if installed)

## Expected Behavior

| Button | Click Action | Opens | Message Format |
|--------|--------------|-------|----------------|
| 🟢 WhatsApp | Opens WhatsApp | New tab | "Check out [Name] on IndaStreet - Amazing massage therapist! [URL]" |
| 🔵 Facebook | Opens Facebook Sharer | New tab | Current page URL |
| 🟣 Instagram | Copies to clipboard | Alert popup | "Check out [Name] on IndaStreet - Amazing massage therapist! [URL]" |
| ⚫ TikTok | Copies to clipboard | Alert popup | "Check out [Name] on IndaStreet - Amazing massage therapist! [URL]" |

## Troubleshooting

### ❌ Buttons Not Showing Up?
1. **Hard refresh:** Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)
2. **Clear cache:** Open DevTools (F12) → Network tab → Check "Disable cache"
3. **Incognito mode:** Try opening in new Incognito/Private window
4. **Check console:** F12 → Console → Look for errors

### ❌ Buttons Showing But Not Working?
1. **Popup blockers:** Browser might be blocking new tabs (check address bar)
2. **Console errors:** F12 → Console → Check for JavaScript errors
3. **Click area:** Make sure you're clicking the button icon, not near it

### ❌ Wrong Therapist Name in Share Message?
1. Check the therapist data is loading correctly
2. Open DevTools → Console → Look for therapist data logs
3. Verify `therapist.name` property exists

## Comparison: Place Cards vs Therapist Cards

**To verify consistency:**
1. Scroll down to **place listings** section (massage spas/salons)
2. Check if place cards ALSO have social buttons (they should already have them)
3. Compare:
   - Position: Both at bottom-right? ✅
   - Size: Same button size? ✅
   - Platforms: Same 4 platforms? ✅
   - Style: Similar circular buttons? ✅

## Browser Compatibility

**Tested Browsers:**
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (macOS)
- [ ] Safari (iOS)
- [ ] Chrome (Android)

## Performance Check

Watch for:
- ❌ Layout shift when buttons load
- ❌ Buttons overlapping other elements
- ❌ Image quality degradation
- ❌ Slow hover animations

Should be:
- ✅ Instant button appearance
- ✅ Smooth 110% scale on hover
- ✅ No layout shifts
- ✅ No performance impact

## Screenshot Locations

If taking screenshots for documentation:
1. **Full therapist card** - showing share buttons in bottom-right
2. **Hover state** - showing scale-up effect
3. **WhatsApp share** - opened WhatsApp Web with pre-filled message
4. **Clipboard alert** - Instagram/TikTok copy notification

## Quick Pass/Fail

**PASS Criteria:**
- ✅ 4 buttons visible on therapist cards
- ✅ Bottom-right corner positioning
- ✅ WhatsApp opens with therapist name in message
- ✅ Facebook opens sharer dialog
- ✅ Instagram/TikTok copy to clipboard + show alert
- ✅ Clicking buttons doesn't open therapist details
- ✅ Hover effects work smoothly

**FAIL Criteria:**
- ❌ No buttons visible
- ❌ Buttons not clickable
- ❌ Wrong position (not bottom-right)
- ❌ Opens therapist details when clicking share button
- ❌ WhatsApp/Facebook don't open
- ❌ Clipboard copy doesn't work

---

**Dev Server:** http://localhost:3000  
**Status:** ✅ HMR Detected Changes - Ready to Test!  
**Estimated Test Time:** 5 minutes

**Quick Test Command:**
```powershell
# Just open browser to localhost:3000 and scroll to therapists section
Start-Process "http://localhost:3000"
```
