# PWA Cache Invalidation Guide

## 🔄 Automatic Cache Invalidation

### Service Worker Version: v5
**Updated:** January 1, 2026

The service worker has been upgraded to **v5** with automatic cache invalidation:

✅ **Automatic Actions on Deployment:**
1. Old caches (`indastreet-v1`, `v2`, `v3`, `v4`) are automatically deleted
2. New cache (`indastreet-v5`) is created
3. Service worker takes control of all clients immediately
4. Users get fresh code without manual intervention

### What Happens After Deployment:

1. **Netlify deploys** new code with updated `sw.js`
2. **User visits site** → Browser detects new SW version
3. **SW installs** → Creates new cache (`indastreet-v5`)
4. **SW activates** → Deletes all old caches automatically
5. **SW claims** → Takes control of all pages immediately
6. **User has** → Latest code with all fixes

---

## 🧪 Manual Cache Testing (For Developers)

### Option 1: Hard Refresh (Recommended)
**Windows:** `Ctrl + Shift + R` or `Ctrl + F5`  
**Mac:** `Cmd + Shift + R`

This forces browser to bypass cache and fetch fresh resources.

### Option 2: DevTools Cache Clear
1. Open DevTools (`F12`)
2. Go to **Application** tab
3. Click **Clear storage** (left sidebar)
4. Check all boxes:
   - ✅ Unregister service workers
   - ✅ Cache storage
   - ✅ Application cache
   - ✅ Local storage
   - ✅ IndexedDB
5. Click **Clear site data**
6. Reload page (`F5`)

### Option 3: Service Worker Unregister
```javascript
// Run in DevTools Console
navigator.serviceWorker.getRegistrations().then(function(registrations) {
  for(let registration of registrations) {
    registration.unregister();
    console.log('✅ Service Worker unregistered');
  }
});

// Then clear caches
caches.keys().then(function(names) {
  for(let name of names) {
    caches.delete(name);
    console.log('✅ Cache deleted:', name);
  }
});

// Reload page
location.reload();
```

### Option 4: Incognito/Private Window
Open site in incognito/private browsing mode - no cache, no service worker.

---

## 📊 Verify Cache Version

### Check Active Service Worker:
1. Open DevTools → **Application** tab
2. Click **Service Workers** (left sidebar)
3. Look for: `Status: activated and is running`
4. Check version in console: Should show `Service Worker v5: Activated...`

### Check Cache Storage:
1. DevTools → **Application** tab
2. Click **Cache Storage** (left sidebar)
3. Should see: `indastreet-v5`
4. Old caches (`v1`, `v2`, `v3`, `v4`) should be gone

### Check Bundle Files:
1. DevTools → **Network** tab
2. Reload page (`F5`)
3. Look for: `main.Ck72cY6v.js` (current build)
4. Old bundle `main.C3j1LDGJ.js` should NOT load

---

## 🚀 Production Deployment Checklist

### Pre-Deployment:
- [ ] Run `pnpm run build` successfully
- [ ] Verify `dist/index.html` references new bundle hash
- [ ] Commit and push changes to GitHub
- [ ] Verify service worker version incremented

### Post-Deployment:
- [ ] Wait 2-5 minutes for Netlify build
- [ ] Visit live site in incognito mode
- [ ] Check console for `Service Worker v5: Activated...`
- [ ] Test chat activation (no "Failed to activate" error)
- [ ] Test booking flow with notifications
- [ ] Verify VAPID warnings are gone

### User Testing:
- [ ] Ask 2-3 users to hard refresh (`Ctrl + Shift + R`)
- [ ] Verify they see new features/fixes
- [ ] Check their console for v5 activation
- [ ] Confirm push notifications work

---

## 🔧 Troubleshooting

### Issue: Still seeing old bundle `main.C3j1LDGJ.js`
**Solution:** 
1. Hard refresh (`Ctrl + Shift + R`)
2. Clear cache in DevTools (Option 2 above)
3. Check Netlify deployment status
4. Verify `dist/index.html` has new bundle hash before pushing

### Issue: Service worker stuck on old version
**Solution:**
1. Unregister SW (Option 3 above)
2. Close ALL tabs of the site
3. Reopen site in new tab
4. Check DevTools → Application → Service Workers

### Issue: Push notifications not working
**Solution:**
1. Check console for VAPID errors (should be none with v5)
2. Verify notification permissions granted
3. Test with `pwaFeatures.testNotificationSystem()`
4. Check Appwrite database for pushSubscriptions document

### Issue: Chat activation fails
**Solution:**
1. Verify bundle loaded: `main.Ck72cY6v.js` (not old hash)
2. Check console for specific error message
3. Verify messagingService format (should use LEGACY params)
4. Clear storage and reload

---

## 📝 Version History

### v5 (January 1, 2026) - Current
- ✅ Fixed VAPID key validation
- ✅ Fixed messagingService parameter format
- ✅ Added automatic old cache deletion
- ✅ Improved activation and claim logic
- ✅ Enhanced console logging for debugging

### v4 (Previous)
- Basic cache strategy
- No automatic cache cleanup
- Missing VAPID key validation

---

## 🎯 Key Metrics to Monitor

After deployment, monitor:
1. **Console logs:** Should show `Service Worker v5: Activated...`
2. **Network tab:** New bundle hash `main.Ck72cY6v.js` loading
3. **Cache storage:** Only `indastreet-v5` present
4. **Error count:** Zero 401/400 errors for collections
5. **Chat activation:** Success rate should be 100%
6. **Booking notifications:** Should trigger immediately

---

## 📞 Support

If issues persist after following this guide:
1. Capture console logs (include timestamps)
2. Capture Network tab (show failed requests)
3. Note exact error messages
4. Document steps to reproduce
5. Check Appwrite database health

**Critical Files Modified:**
- `public/sw.js` → Service worker v5
- `src/components/chat/ChatWindow.tsx` → messagingService format fix
- `lib/appwrite.config.ts` → Collection ID null fix
- `utils/pushNotificationService.ts` → VAPID key fix
- `apps/therapist-dashboard/src/lib/pwaFeatures.ts` → VAPID key fix

---

**Last Updated:** January 1, 2026  
**Bundle Hash:** `main.Ck72cY6v.js`  
**Service Worker Version:** v5  
**Deployment Status:** Ready for Netlify auto-deploy
