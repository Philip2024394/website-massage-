# Netlify Build Settings

## Required Environment Variables
Set these in your Netlify dashboard under Site settings > Environment variables:

### Required for Build
- `ROLLUP_NO_NATIVE` = `1`
- `PNPM_VERSION` = `10.22.0`
- `NODE_VERSION` = `22`

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