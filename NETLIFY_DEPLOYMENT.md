# Netlify Build Settings

## ✅ Rollup Native Binary Issue Fixed

**Issue**: Netlify builds were failing with `MODULE_NOT_FOUND` errors for optional Rollup native binaries.

**Solution Applied**:
1. ✅ Added `ROLLUP_NO_NATIVE = "1"` and `ROLLUP_NO_WASM = "1"` to `netlify.toml`
2. ✅ Added Linux-specific rollup package (`@rollup/rollup-linux-x64-gnu`) as dev dependency
3. ✅ Optimized build command with `--frozen-lockfile` flag
4. ✅ Added memory optimization with `NODE_OPTIONS = "--max-old-space-size=4096"`

## Required Environment Variables
These are automatically set via `netlify.toml`:

### Build Environment (Auto-configured)
- `ROLLUP_NO_NATIVE` = `"1"` ✅
- `ROLLUP_NO_WASM` = `"1"` ✅  
- `PNPM_VERSION` = `"10.22.0"` ✅
- `NODE_VERSION` = `"22"` ✅
- `NODE_OPTIONS` = `"--max-old-space-size=4096"` ✅

### Appwrite Configuration (Required)
- `VITE_APPWRITE_ENDPOINT` = `https://syd.cloud.appwrite.io/v1`
- `VITE_APPWRITE_PROJECT_ID` = `68f23b11000d25eb3664`
- `VITE_APPWRITE_DATABASE_ID` = `68f76ee1000e64ca8d05`
- `VITE_APPWRITE_BUCKET_ID` = `68f76bdd002387590584`

### Contact & Support Configuration
- `VITE_WHATSAPP_SUPPORT` = `6281392000050`
- `VITE_SUPPORT_EMAIL` = `support@indastreet.com`
- `VITE_PRIVACY_EMAIL` = `privacy@indastreet.com`

### Banking Information
- `VITE_BANK_NAME` = `BCA (Bank Central Asia)`
- `VITE_BANK_ACCOUNT_NUMBER` = `1234567890`
- `VITE_BANK_ACCOUNT_NAME` = `IndaStreet Platform`

### App Configuration
- `VITE_APP_NAME` = `IndaStreet`

## Build Commands
- **Build Command**: `pnpm install && pnpm run build`
- **Publish Directory**: `dist`
- **Node Version**: 22.x

## Deployment Notes
1. The build process uses TypeScript compilation followed by Vite bundling
2. All assets are optimized for production with proper caching headers
3. SPA routing is configured with catch-all redirect to index.html
4. Security headers are applied automatically