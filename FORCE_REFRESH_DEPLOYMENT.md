# Force Refresh System - Deployment Guide

## Overview
Users on the live site will automatically be notified when a new version is deployed and prompted to refresh their browser to get the latest updates.

## How It Works

### 1. Version Checking
- **Client-Side**: `lib/versionCheck.ts` checks version every 5 minutes
- **Service Worker**: `service-worker.js` manages cache with version numbers
- **Automatic Detection**: Compares stored version with current version

### 2. User Experience
When a new version is detected:
1. A beautiful gradient banner appears at the top of the screen
2. User sees: "🎉 New Version Available!"
3. Two options:
   - **"Refresh Now"** - Immediately clears cache and reloads
   - **"Later"** - Dismisses banner (will check again in 1 minute)

### 3. Cache Clearing
When user clicks "Refresh Now":
- ✅ Clears all service worker caches
- ✅ Unregisters old service workers
- ✅ Forces hard reload of the page
- ✅ Users get fresh content instantly

## Deployment Steps

### ⚠️ CRITICAL: Update Version on EVERY Deployment

**Before deploying to production, you MUST update the version number in 2 files:**

#### 1. Update `lib/versionCheck.ts`
```typescript
// Line 7
export const APP_VERSION = '2.1.0'; // ← INCREMENT THIS!
```

#### 2. Update `service-worker.js`
```javascript
// Line 3
const CACHE_VERSION = 'v2.1.0'; // ← INCREMENT THIS!
```

### Version Numbering Convention
Use semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR** (2.x.x) - Breaking changes, major new features
- **MINOR** (x.1.x) - New features, enhancements (like seed reviews)
- **PATCH** (x.x.1) - Bug fixes, small improvements

Examples:
- `2.0.0` → `2.1.0` - Added stable seed review system
- `2.1.0` → `2.1.1` - Fixed review display bug
- `2.1.1` → `2.2.0` - Added new booking feature
- `2.2.0` → `3.0.0` - Complete UI redesign

## Testing

### Test Locally (Before Deploying)
1. Build the production version:
   ```bash
   pnpm run build
   ```

2. Serve it locally:
   ```bash
   pnpm run preview
   ```

3. Open in browser and check console:
   ```
   ✅ Version check initialized. Current version: 2.1.0
   ```

### Test Version Update Flow
1. Deploy version 2.1.0
2. Users load the site (version 2.1.0 stored in localStorage)
3. Update version to 2.1.1 and deploy
4. Users with the site open will see the refresh banner within 5 minutes
5. Users clicking "Refresh Now" will get version 2.1.1

## Automatic Checks

The system checks for new versions:
- ✅ **Every 5 minutes** while app is open
- ✅ **When user returns to tab** (after switching away)
- ✅ **2 seconds after page load** (initial check)

## Preventing Cached Content

### Meta Tags (Already Added)
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```

### Service Worker Cache Management
- Old caches automatically deleted on activation
- New cache created with updated version number
- Assets cached only when needed (network-first strategy)

## Troubleshooting

### Users Still Seeing Old Version
1. **Check version numbers are updated** in both files
2. **Check service worker is registered** (browser DevTools → Application → Service Workers)
3. **Manual fix for users**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Banner Not Showing
1. Check browser console for version check logs
2. Verify `import.meta.env.PROD` is true in production
3. Check localStorage has old version stored

### Service Worker Issues
1. Unregister all service workers: DevTools → Application → Service Workers → Unregister
2. Clear all caches: DevTools → Application → Cache Storage → Delete all
3. Hard refresh the page

## Current Version

**Live Site Version:** 2.1.0

**Latest Features:**
- ✅ Stable seed review system with deterministic rotation
- ✅ Verified badge repositioned below star rating
- ✅ Hybrid review service with caching
- ✅ Auto-refresh notification for new versions

## Deployment Checklist

- [ ] Update `APP_VERSION` in `lib/versionCheck.ts`
- [ ] Update `CACHE_VERSION` in `service-worker.js`
- [ ] Update this README with new version number
- [ ] Build production: `pnpm run build`
- [ ] Test preview: `pnpm run preview`
- [ ] Deploy to production
- [ ] Monitor users receiving update notification
- [ ] Verify no console errors on live site

## Emergency Cache Clear

If you need to force ALL users to refresh immediately:

1. Increment both version numbers by a major version (e.g., 2.1.0 → 3.0.0)
2. Add this to `index.html` temporarily:
   ```html
   <script>
     // Emergency cache clear
     if ('caches' in window) {
       caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
     }
     if ('serviceWorker' in navigator) {
       navigator.serviceWorker.getRegistrations().then(regs => 
         regs.forEach(reg => reg.unregister())
       );
     }
   </script>
   ```
3. Deploy immediately
4. Remove script after 24 hours

## Notes

- Version check only runs in **production** (not in development)
- Service worker only registers in **production**
- Users will see update banner within 5 minutes of deployment
- Banner is non-intrusive and can be dismissed
- Refresh is smooth with no data loss
