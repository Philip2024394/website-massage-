# 🔧 Appwrite CORS Fix Guide

## Problem
Your live Vercel app can't connect to Appwrite because of CORS restrictions. Appwrite is only allowing requests from `https://localhost` but your app is deployed at `https://massagewebsiteindastreet-obnrw1h13.vercel.app`.

## Solution Steps

### 1. Login to Appwrite Console
1. Go to https://cloud.appwrite.io/console
2. Login to your account
3. Select your project (Project ID: `68f23b11000d25eb3664`)

### 2. Update Platform Settings
1. Navigate to **Settings** → **Platforms**
2. Find your web platform entry
3. Update the **Hostname** to include both:
   - `localhost` (for development)
   - `massagewebsiteindastreet-obnrw1h13.vercel.app` (for production)

### 3. Add Multiple Hostnames
You can either:

**Option A: Edit existing platform**
- Change hostname from `localhost` to `*` (allows all domains - less secure)

**Option B: Add new platform (Recommended)**
- Click "Add Platform"
- Select "Web App"
- Name: "Production Vercel"
- Hostname: `massagewebsiteindastreet-obnrw1h13.vercel.app`

### 4. Verify Configuration
After updating, your platforms should look like:
```
Platform 1 (Development):
- Type: Web App
- Name: Local Development
- Hostname: localhost

Platform 2 (Production):
- Type: Web App  
- Name: Production Vercel
- Hostname: massagewebsiteindastreet-obnrw1h13.vercel.app
```

## 🚨 Security Note
- **Never use `*` wildcard** in production as it allows any domain
- **Always specify exact domains** for security
- **Use HTTPS domains** for production

## Alternative: Environment-Based Configuration

If you want dynamic CORS handling, you can also configure this in your Appwrite project settings:

1. Go to **Settings** → **General**
2. Under **API Keys & Access**, add allowed origins:
   - `https://localhost:3000`
   - `https://localhost:3001`
   - `https://localhost:3002`
   - `https://massagewebsiteindastreet-obnrw1h13.vercel.app`

## After Making Changes
1. Save the settings in Appwrite console
2. Wait 1-2 minutes for changes to propagate
3. Refresh your Vercel app
4. Check browser console - CORS errors should be gone
5. Your app should now load data from Appwrite successfully

## Verification
Once fixed, you should see:
- ✅ Therapists data loading
- ✅ Places data loading  
- ✅ Translations loading
- ✅ Authentication working
- ✅ No more CORS errors in console

The app will then show actual therapists and places instead of "0 therapists" and empty data.