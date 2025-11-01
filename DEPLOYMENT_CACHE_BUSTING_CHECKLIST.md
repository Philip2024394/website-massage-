# 🚀 Deployment Cache-Busting Checklist

## ⚠️ MANDATORY: Before Every Deployment

To prevent users from getting stuck with old cached JavaScript (like the issue you just experienced), follow these steps **EVERY TIME** you deploy new code:

---

## 📝 Pre-Deployment Steps

### 1. Update Service Worker Version
**File:** `service-worker.js` (Line 3)

```javascript
// 🔥 INCREMENT THIS NUMBER!
const CACHE_VERSION = 'v2.0.1'; // Change: v2.0.0 → v2.0.1 → v2.0.2, etc.
```

**Why:** This forces the browser to download a new service worker, which will clear old caches and download fresh JavaScript files.

**Versioning Strategy:**
- **Patch (v2.0.X)**: Bug fixes, small changes
- **Minor (v2.X.0)**: New features, component updates
- **Major (vX.0.0)**: Breaking changes, major refactors

---

### 2. Verify Vite Build Config
**File:** `vite.config.ts` (Lines 50-54)

Ensure these lines exist (already configured):

```typescript
entryFileNames: 'assets/[name].[hash].js',    // ✓ Hash-based filenames
chunkFileNames: 'assets/[name].[hash].js',    // ✓ Hash-based chunks
assetFileNames: 'assets/[name].[hash].[ext]', // ✓ Hash-based assets
```

**Why:** Content hashing ensures every build generates unique filenames when code changes.

---

### 3. Build Production Bundle

```bash
npm run build
```

**Verify Output:**
Check `dist/assets/` - you should see files like:
- `index-a7f3b9c2.js` (random hash after each filename)
- `vendor-d4e5f6a1.js`
- `main-b8c9d0e2.css`

If files have the **same hash** after code changes, something is wrong!

---

### 4. Test Production Build Locally

```bash
npm run preview
```

Then:
1. Open browser to the preview URL
2. Make a code change
3. Run `npm run build` again
4. Hard refresh browser (Ctrl+Shift+R)
5. Verify your changes appear

---

## 🌐 Deployment Platform Configuration

### For Netlify

Add to `netlify.toml`:

```toml
[[headers]]
  for = "/index.html"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
    Pragma = "no-cache"
    Expires = "0"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### For Vercel

Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "no-cache, no-store, must-revalidate"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### For Apache (.htaccess)

```apache
# index.html - no cache
<Files "index.html">
  Header set Cache-Control "no-cache, no-store, must-revalidate"
  Header set Pragma "no-cache"
  Header set Expires "0"
</Files>

# Assets - long cache with immutable
<FilesMatch "\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2)$">
  Header set Cache-Control "public, max-age=31536000, immutable"
</FilesMatch>
```

---

## 🧪 Post-Deployment Verification

After deploying to production:

1. **Open DevTools (F12)**
2. **Go to Network Tab**
3. **Hard Refresh (Ctrl+Shift+R)**
4. **Check JavaScript files:**
   - Should have NEW hash in filename
   - Should show `200 OK` (not `304 Not Modified` or `from disk cache`)

5. **Check Service Worker:**
   - Open DevTools → Application → Service Workers
   - Should show: "waiting to activate" or "activated and running"
   - Cache version should match your updated version

6. **Test with Incognito/Private Window:**
   - Open your site in incognito mode
   - Verify all features work correctly
   - Check console for errors

---

## 🐛 Troubleshooting: Users Report Old Code

If users report seeing old features or bugs that were fixed:

### Quick Fix (Emergency)

1. **Increment service worker version immediately:**
   ```javascript
   const CACHE_VERSION = 'v2.0.2'; // Bump version
   ```

2. **Deploy the change**

3. **Tell users to:**
   - Close ALL tabs with your site
   - Press Ctrl+Shift+Delete
   - Clear "Cached images and files"
   - Reopen the site

### Root Cause Analysis

Check these common issues:

- [ ] Did you forget to increment `CACHE_VERSION`?
- [ ] Are your build files actually different? (`npm run build`)
- [ ] Are your server headers correct? (Check with browser DevTools)
- [ ] Is your CDN caching too aggressively? (Check CDN settings)
- [ ] Are service worker files being cached? (They shouldn't be)

---

## 📊 Monitoring Cache Health

### Browser DevTools Check

**Before deployment:**
```
Network → JS file → Headers → Response Headers
Cache-Control: public, max-age=31536000, immutable ✓
```

**index.html should have:**
```
Cache-Control: no-cache, no-store, must-revalidate ✓
```

### Service Worker Check

**DevTools → Application → Service Workers:**
- Status: "activated and running" ✓
- Version in logs matches code ✓
- Old caches deleted (check Cache Storage) ✓

---

## 🎯 Summary: The Golden Rule

> **ALWAYS increment `CACHE_VERSION` before deploying code changes!**

Without this, users will continue seeing old cached JavaScript, leading to:
- ❌ Features not working
- ❌ Bugs that were "fixed" still appearing
- ❌ Confusion and support tickets
- ❌ Loss of user trust

---

## 📝 Quick Deployment Command

Create this helper script in `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && echo '⚠️  Did you increment CACHE_VERSION in service-worker.js? (y/n)' && read -r response && [ \"$response\" = 'y' ]"
  }
}
```

This will remind you to check the cache version before every deployment!

---

## ✅ Current Configuration Status

- ✅ Vite build with content hashing enabled
- ✅ Service worker with versioning system
- ✅ Network-first caching strategy
- ✅ Automatic old cache deletion
- ✅ HTML meta tags prevent HTML caching
- ✅ Development server has `Cache-Control: no-store`

Your cache-busting setup is now **production-ready**! 🎉

---

**Last Updated:** November 1, 2025
**Current Cache Version:** v2.0.0
