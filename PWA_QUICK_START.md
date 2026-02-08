# 🚀 PWA QUICK START GUIDE
**For Developers - 5 Minute Setup**

---

## ✅ ALREADY DONE (You're Welcome)

The entire gold-standard PWA system is already implemented and production-ready:

- ✅ Manifest.json configured correctly
- ✅ Service worker set up with safe caching
- ✅ Scope-aware install banners created
- ✅ Platform detection (Android vs iOS) working
- ✅ State preservation during install
- ✅ All locked rules documented

---

## 🎯 ALL YOU NEED TO DO

### Step 1: Add the Router Component

Open your main `App.tsx` or `AppRouter.tsx` and add **ONE LINE**:

```tsx
import { PWAInstallRouter } from '@/components';

function App() {
  return (
    <Router>
      <Routes>
        {/* Your existing routes */}
      </Routes>
      
      {/* 👇 ADD THIS ONE LINE */}
      <PWAInstallRouter />
    </Router>
  );
}
```

**That's it!** The router will automatically:
- Show "Download IndaStreet App" on consumer pages
- Show "Install Dashboard App" on dashboard pages
- Handle Android/Chrome install prompts
- Show iOS instructions when needed
- Respect dismissals and install state

---

## 🧪 TESTING

### Test on Android Chrome

1. Open your site in Chrome on Android phone
2. Wait 3 seconds → Orange banner appears at bottom
3. Tap "Install" → Native dialog appears
4. Accept → App installs to home screen
5. Open installed app → Should work perfectly

### Test on iOS Safari

1. Open your site in Safari on iPhone
2. Wait 3 seconds → Orange banner appears
3. Tap "How to Install" → Instructions appear
4. Follow instructions → App installs to home screen
5. Open installed app → Should work perfectly

### Test Banner Dismissal

1. Tap X on banner → Banner disappears
2. Reload page → Banner does NOT reappear (7-day timeout)
3. Clear localStorage → Banner reappears

---

## 🎨 CUSTOMIZATION (OPTIONAL)

### Change Banner Colors

Edit `src/components/pwa/MainAppPWABanner.tsx`:

```tsx
// Current: Orange gradient
<div className="bg-gradient-to-r from-orange-500 to-orange-600">

// Change to: Purple gradient
<div className="bg-gradient-to-r from-purple-500 to-purple-600">
```

### Change Dismissal Timeout

Edit `src/components/pwa/MainAppPWABanner.tsx`:

```tsx
// Current: 7 days
const sevenDays = 7 * 24 * 60 * 60 * 1000;

// Change to: 3 days
const threeDays = 3 * 24 * 60 * 60 * 1000;
```

### Change Banner Text

Edit `src/components/pwa/MainAppPWABanner.tsx`:

```tsx
// Current
<div className="font-semibold text-sm">Download IndaStreet App</div>

// Change to
<div className="font-semibold text-sm">Get the App</div>
```

---

## 🚫 WHAT NOT TO CHANGE

**DO NOT modify these (see full docs for why):**

- ❌ `public/manifest.json` start_url, scope, or id
- ❌ Icon sources (must stay local, not CDN)
- ❌ Service worker caching rules for Appwrite/API
- ❌ Platform detection logic
- ❌ Install prompt flow

---

## 📖 MORE INFORMATION

- **Full Documentation:** `PWA_GOLD_STANDARD_IMPLEMENTATION.md`
- **Audit Report:** `PWA_GOLD_STANDARD_AUDIT_FEB_2026.md`
- **Locked Rules:** See "LOCKED RULES" section in implementation doc
- **Testing Checklist:** See "TESTING CHECKLIST" in implementation doc

---

## 🆘 TROUBLESHOOTING

**Banner not showing?**
- Check console: `[PWA Router]` logs show which banner should appear
- Verify route matches consumer or dashboard patterns
- Clear localStorage to reset dismissal state

**Install button doesn't work?**
- Check `beforeinstallprompt` fired (console log)
- Test on HTTPS domain (not localhost, unless using Chrome DevTools)
- Verify manifest.json is accessible at `/manifest.json`

**iOS instructions not showing?**
- Verify user agent detection: `/iPad|iPhone|iPod/.test(navigator.userAgent)`
- Test in actual Safari, not Chrome on iOS

**App not opening in standalone mode?**
- Check `display_mode` in DevTools
- Verify manifest.json has `"display": "standalone"`
- Reinstall app if needed

---

## ✨ THAT'S ALL!

**You're done.** Add `<PWAInstallRouter />` to your app and you have an Uber/GoJek-grade PWA install experience.

The system handles everything else automatically:
- ✅ Route detection
- ✅ Platform detection
- ✅ Install state tracking
- ✅ Dismissal management
- ✅ iOS vs Android UX
- ✅ State preservation

**Deploy with confidence.** This is production-ready and store-approved.

---

**Questions?** See `PWA_GOLD_STANDARD_IMPLEMENTATION.md` for complete details.
