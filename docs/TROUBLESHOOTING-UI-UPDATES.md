# UI Updates Blocked - Troubleshooting Guide

## Problem
UI updates are not showing up in the browser even after making changes to the code.

## Root Cause
The **Service Worker** is aggressively caching content, causing the browser to serve old cached versions instead of fresh updates.

---

## ✅ Solutions (in order of effectiveness)

### Solution 1: Clear Service Worker Cache (Immediate Fix)

#### Option A: Use Browser DevTools
1. Open Chrome DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Click **Unregister** next to each service worker
5. Click **Storage** in left sidebar
6. Click **Clear site data** button
7. Hard refresh: **Ctrl + Shift + R** (Windows) or **Cmd + Shift + R** (Mac)

#### Option B: Use Console Script
1. Open Browser Console (F12 → Console tab)
2. Copy and paste from: `scripts/clear-sw-cache.js`
3. Press Enter
4. Page will auto-refresh with clean cache

---

### Solution 2: Disable Service Worker in DevTools (Development)

While developing, keep service worker disabled:

1. Open DevTools (F12)
2. Go to **Application** tab → **Service Workers**
3. Check ✅ **"Bypass for network"**
4. OR Check ✅ **"Update on reload"**

This ensures fresh content on every page load during development.

---

### Solution 3: Use Incognito/Private Window

Open the app in an incognito/private browser window:
- **Chrome**: Ctrl + Shift + N
- **Firefox**: Ctrl + Shift + P
- **Edge**: Ctrl + Shift + N

Incognito mode doesn't have cached service workers.

---

### Solution 4: Version Bump (Automatic Cache Clear)

I've already updated the service worker version to force cache invalidation:
- Updated: `SW_VERSION = '2.2.2'`
- Updated: `CACHE_NAME = 'push-notifications-v2-2'`

The service worker will automatically clear old caches on activation.

---

## 🔧 Development Best Practices

### During Development

1. **Always use Hard Refresh:**
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

2. **Keep DevTools open:**
   - Check "Disable cache" in Network tab
   - Check "Bypass for network" in Application → Service Workers

3. **Use Vite's HMR:**
   - Hot Module Replacement should update without full refresh
   - If HMR breaks, restart dev server: `pnpm run dev`

### Service Worker Behavior

**Development Mode (localhost):**
- Service worker now bypasses cache completely
- Always fetches fresh content
- Safe for development

**Production Mode:**
- Service worker uses network-first strategy
- Falls back to cache only if network fails
- Provides offline support

---

## 🚨 Still Having Issues?

### Check if Service Worker is Active:

```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(regs => {
    console.log('Active service workers:', regs.length);
    regs.forEach(reg => console.log(reg.scope));
});
```

### Check Current Cache:

```javascript
// Run in browser console
caches.keys().then(names => {
    console.log('Active caches:', names);
});
```

### Nuclear Option - Clear Everything:

```javascript
// Run in browser console
navigator.serviceWorker.getRegistrations().then(regs => 
    Promise.all(regs.map(r => r.unregister()))
).then(() => caches.keys()).then(names => 
    Promise.all(names.map(n => caches.delete(n)))
).then(() => {
    localStorage.clear();
    sessionStorage.clear();
    location.reload(true);
});
```

---

## 📝 Recent Changes Made

1. ✅ Updated SW_VERSION to 2.2.2
2. ✅ Updated CACHE_NAME to force cache invalidation
3. ✅ Enhanced development mode to bypass caching on localhost
4. ✅ Added console logging for better debugging
5. ✅ Created clear-sw-cache.js script for easy cache clearing

---

## 🎯 Next Steps

1. **Refresh your browser** with hard refresh (Ctrl+Shift+R)
2. **Open DevTools** → Application → Service Workers
3. **Verify** the new version (2.2.2) is active
4. **Test** your UI changes should now appear immediately

---

## 📞 Still Blocked?

If UI updates are still not showing:

1. Check browser console for errors
2. Check Network tab for failed requests
3. Verify dev server is running (`pnpm run dev`)
4. Check if changes are saved in source files
5. Try a different browser to rule out browser-specific issues

---

**Last Updated:** January 13, 2026
**Service Worker Version:** 2.2.2
