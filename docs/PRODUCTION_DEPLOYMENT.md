# Production Deployment Guide

## Domain Information
- **Production Domain**: `www.indastreetmassage.com`
- **Current Appwrite Endpoint**: `https://syd.cloud.appwrite.io/v1`

## Optional: Custom Domain Setup for Enhanced Security

### Why Use a Custom Domain?
Using a custom subdomain for your Appwrite API allows:
- HTTP-only cookies instead of localStorage (more secure against XSS)
- Removes the Appwrite localStorage warning
- Better security for session management

### Steps to Configure Custom Domain

#### 1. Choose Your API Subdomain
Recommended: `api.indastreetmassage.com`

#### 2. DNS Configuration
Add a CNAME record in your domain registrar:
```
Type: CNAME
Name: api
Value: syd.cloud.appwrite.io
TTL: 3600 (or default)
```

#### 3. Configure in Appwrite Console
1. Go to your Appwrite Console: https://cloud.appwrite.io
2. Navigate to: Settings → Domains
3. Add custom domain: `api.indastreetmassage.com`
4. Follow Appwrite's verification steps
5. Wait for SSL certificate provisioning (usually 5-10 minutes)

#### 4. Update Application Configuration
Once DNS propagates and Appwrite verifies your domain, update:

**File**: `lib/appwrite.config.ts`
```typescript
export const APPWRITE_CONFIG = {
    endpoint: 'https://api.indastreetmassage.com/v1', // Changed from syd.cloud.appwrite.io
    projectId: '68f23b11000d25eb3664',
    // ... rest of config
};
```

#### 5. Deploy and Test
1. Deploy updated configuration to production
2. Test authentication flows
3. Verify cookies are being used (check browser DevTools → Application → Cookies)
4. Confirm localStorage warning is gone

### Current Status
✅ LocalStorage globally disabled via `utils/disableLocalStorage.ts`
✅ Warning suppressed in development via console.warn filter
✅ All data flows through Appwrite API correctly
⏳ Custom domain setup optional (for production security enhancement)

### Alternative: Keep Current Setup
If you prefer to keep using `syd.cloud.appwrite.io`:
- Current security is adequate (localStorage disabled, warning suppressed)
- Appwrite SDK manages sessions internally
- No changes needed for launch

## Deployment Checklist
- [ ] Verify Appwrite collections are populated with real data
- [ ] Remove any demo/sample therapist profiles
- [ ] Test authentication flows (therapist, customer, admin)
- [ ] Verify payment integration (if applicable)
- [ ] Test on mobile devices
- [ ] Configure custom domain (optional)
- [ ] Update environment variables for production
- [ ] Enable HTTPS (automatic with most hosting providers)

## Environment Variables (if needed)
```env
VITE_APPWRITE_ENDPOINT=https://api.indastreetmassage.com/v1
VITE_APPWRITE_PROJECT_ID=68f23b11000d25eb3664
```

## Support
For custom domain issues, contact Appwrite support or check:
https://appwrite.io/docs/custom-domains
