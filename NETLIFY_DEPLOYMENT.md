# Netlify Build Settings

## ✅ Build Issues Resolved

**Issues**: 
- Netlify builds failing with `MODULE_NOT_FOUND` errors for optional Rollup native binaries
- Exit code 2 during vite build step

**Solutions Applied**:
1. ✅ Added `ROLLUP_NO_NATIVE = "1"` and `ROLLUP_NO_WASM = "1"` to force JS fallback
2. ✅ Added Linux-specific rollup package (`@rollup/rollup-linux-x64-gnu`) as dev dependency  
3. ✅ Created optimized `build:netlify` script without custom deployment config
4. ✅ Added fallback build commands for npm compatibility
5. ✅ Enhanced debugging with `NETLIFY_BUILD_DEBUG = "true"`
6. ✅ Memory optimization with `NODE_OPTIONS = "--max-old-space-size=4096"`

**Build Verification**: ✅ Tested locally - builds successfully in 5.89s with optimal chunking

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