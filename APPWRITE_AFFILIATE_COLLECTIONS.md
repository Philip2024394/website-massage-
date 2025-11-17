# ✅ Appwrite Affiliate Collections Setup

This adds two collections for the affiliate program used by the Affiliate Dashboard and booking attribution logic:

- `affiliate_clicks`: Tracks link/QR clicks with timestamp and referrer
- `affiliate_attributions`: Records bookings attributed to an affiliate with 10% commission by default

Both are already wired in the codebase. You just need to create them in your Appwrite project.

---

## Quick Setup (Recommended)

1) Create an API key (Appwrite Console → Project → Settings → API Keys)
- Name: `Affiliate Collections Setup`
- Scopes: All `databases.*`

2) Run the setup script

```powershell
# In project root
$env:APPWRITE_API_KEY = "<paste-your-appwrite-api-key>"
# Optional: override endpoint / project / database
# $env:APPWRITE_ENDPOINT = "https://syd.cloud.appwrite.io/v1"
# $env:APPWRITE_PROJECT_ID = "68f23b11000d25eb3664"
# $env:APPWRITE_DATABASE_ID = "68f76ee1000e64ca8d05"

# Install SDK if needed
pnpm add -D node-appwrite

# Run
node scripts/setup-affiliate-collections.js
```

Expected output: collections created (or skipped if existing), attributes and indexes ensured.

---

## Manual Setup (Console)

Database: `68f76ee1000e64ca8d05`

1) Collection: `affiliate_clicks`
- Attributes:
  - `affiliateCode` (string, 64, required)
  - `path` (string, 512, required)
  - `referrer` (string, 512)
  - `userAgent` (string, 500)
  - `createdAt` (datetime, required)
- Indexes:
  - `idx_code_time` → (affiliateCode ASC, createdAt DESC)
  - `idx_createdAt` → (createdAt DESC)

2) Collection: `affiliate_attributions`
- Attributes:
  - `bookingId` (string, 100, required)
  - `providerId` (string, 100, required)
  - `providerName` (string, 255)
  - `providerType` (enum: therapist | place, required)
  - `affiliateCode` (string, 64, required)
  - `commissionRate` (float, required)
  - `commissionAmount` (float, required)
  - `commissionStatus` (enum: pending | approved | paid, required)
  - `source` (string, 64)
  - `venueId` (string, 100)
  - `venueName` (string, 255)
  - `venueType` (string, 20)
  - `createdAt` (datetime, required)
- Indexes:
  - `idx_code_time` → (affiliateCode ASC, createdAt DESC)
  - `idx_provider_status` → (providerId ASC, commissionStatus ASC, createdAt DESC)
  - `idx_status_time` → (commissionStatus ASC, createdAt DESC)

Permissions (suggested, adjust as needed):
- `affiliate_clicks`: Create + Read → `Any`
- `affiliate_attributions`: Create + Read + Update → `Any` (or restrict Update to admins/labels if you prefer)

---

## Code Integration (already done)

- Config keys added in `lib/appwrite.config.ts`:
  - `affiliateClicks: 'affiliate_clicks'`
  - `affiliateAttributions: 'affiliate_attributions'`
- Click tracking: `lib/affiliateAnalyticsService.ts`
- Attribution on booking create: `lib/affiliateService.ts` and booking flows in `lib/appwriteService.ts`
- Dashboard UI: `pages/VillaDashboardPage.tsx` (Links, Banners, Commissions tabs)

Commission rate is globally set to 10% in `lib/affiliateService.ts`.

---

## Verify

After running the script, you can quickly verify from the console:
- Open the two collections and ensure attributes and indexes exist.
- Load the app with a URL `?aff=TESTCODE`; then navigate a bit to create clicks.
- Make a test booking (mock or real); confirm an attribution document is created.

---

## Troubleshooting

- Missing API key: Set `$env:APPWRITE_API_KEY = "..."` before running the script.
- Permission denied: Ensure the API key has `databases.*` scopes.
- Attribute exists: The script safely skips existing ones; re-running is fine.

Happy tracking!
