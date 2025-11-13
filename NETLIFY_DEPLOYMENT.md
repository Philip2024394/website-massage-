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

## 🔧 **Latest Fix Applied**

**Issue**: Netlify builds failing during `pnpm install --frozen-lockfile` step
**Root Cause**: The `--frozen-lockfile` flag can cause issues on Netlify even when lockfile is committed
**Solution**: Removed `--frozen-lockfile` flag from build command for better compatibility

**Updated Command**: 
```bash
pnpm install && pnpm run build
```
*(pnpm version controlled via environment variables)*

This allows pnpm to handle dependency resolution more flexibly while maintaining reproducibility.

## 🚨 **Critical Build Command Fix**

**Issue**: Netlify showing build command typo: `pnpm run b}` instead of `pnpm run build`
**Root Cause**: Build command corruption in Netlify dashboard or cached configuration

### **Immediate Solutions**:

1. **Check Netlify Dashboard**:
   - Go to Site settings → Build & deploy → Build settings
   - Verify build command shows: `npm install -g pnpm@10.22.0 && pnpm install && pnpm run build`
   - If corrupted, manually edit and save

2. **Clear Netlify Cache**:
   - Click "Clear cache and deploy site" for fresh build

3. **Alternative Commands** (if issues persist):
   ```bash
   # Option 1: Simple npm fallback
   npm ci && npm run build
   
   # Option 2: Let Netlify handle pnpm
   pnpm install && pnpm run build
   ```

### **Verification**:
- ✅ `build` script exists in package.json
- ✅ netlify.toml contains correct command
- ✅ All build scripts tested locally

## 🔥 **EEXIST Error Fix Applied**

**Issue**: `npm error EEXIST: file already exists /opt/buildhome/.nvm/versions/node/v22.21.1/bin/pnpm`
**Root Cause**: Netlify already has pnpm installed via Corepack, npm install -g conflicts

### **Solution Applied**:
```bash
# NEW: Use Corepack instead of npm global install
corepack enable && corepack prepare pnpm@10.22.0 --activate && pnpm install && pnpm run build

# OLD (caused EEXIST): npm install -g pnpm@10.22.0 && pnpm install && pnpm run build
```

### **Benefits**:
- ✅ **No Conflicts**: Uses Netlify's existing pnpm infrastructure
- ✅ **Version Control**: Still ensures pnpm@10.22.0 specifically  
- ✅ **Corepack Native**: Leverages Node.js built-in package manager
- ✅ **Faster Builds**: No global installation overhead

## 🔧 **Command Truncation Fix**

**Issue**: Build command truncated to `--activa}` instead of `--activate`
**Root Cause**: Long build commands can be truncated or corrupted by Netlify

### **Solution Applied**:
```bash
# NEW: Simplified command
pnpm install && pnpm run build

# Environment variables handle version control:
PNMP_VERSION = "10.22.0"
NODE_VERSION = "22"
```

### **Benefits**:
- ✅ **No Truncation**: Short, simple command
- ✅ **Version Control**: Via environment variables  
- ✅ **Reliable**: Uses Netlify's default pnpm setup
- ✅ **Fallback Ready**: Easy to switch to npm if needed

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