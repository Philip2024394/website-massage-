# API Key Configuration for Data Feeds

## Overview
This document describes how the Appwrite API key is securely stored and used for therapist and places data feed operations.

## Storage Location

The API key is stored in the `.env` file in the root directory:

```bash
# .env file
APPWRITE_API_KEY=standard_dcae7c5dedfb7780d5ac83f49bb05df59b9eb05b46919b45c7787b85ae4184a7c35e09fec1ba58c03ca7f595158cee24852c4cf8899cf85e93d8c9acced138af023e7ca7f1d64ec009d831014d9990f5ad4f5068177e435e091a1af5b468325019750ab13dcc22f039046963e24d2eabad24a5d712d55f5fe488e7346a16f790
VITE_APPWRITE_API_KEY=standard_dcae7c5dedfb7780d5ac83f49bb05df59b9eb05b46919b45c7787b85ae4184a7c35e09fec1ba58c03ca7f595158cee24852c4cf8899cf85e93d8c9acced138af023e7ca7f1d64ec009d831014d9990f5ad4f5068177e435e091a1af5b468325019750ab13dcc22f039046963e24d2eabad24a5d712d55f5fe488e7346a16f790
```

### Security Notes
- ✅ The `.env` file is listed in `.gitignore` and will never be committed to version control
- ✅ A template `.env.example` is provided for new developers (without the actual key)
- ✅ The API key is only used server-side and never exposed to the client browser

## Usage

### Configuration File
The API key is centrally managed in [`config/dataFeedConfig.ts`](config/dataFeedConfig.ts):

```typescript
import { DATA_FEED_CONFIG } from './config/dataFeedConfig';

// Access the API key
const apiKey = DATA_FEED_CONFIG.apiKey;

// Check if configured
const isConfigured = isApiKeyConfigured();
```

### Data Feed Operations

The API key is used for:

1. **Therapist Data Feeds**
   - Fetching all therapists from Appwrite
   - Creating/updating therapist profiles
   - Managing therapist availability status

2. **Places Data Feeds**
   - Fetching massage places from Appwrite
   - Creating/updating place profiles
   - Managing place availability and bookings

3. **Server-Side Operations**
   - Admin dashboard backend operations
   - Scheduled data synchronization
   - Batch processing tasks

### Services Using the API Key

- `lib/appwrite/services/therapist.service.ts`
- `lib/appwrite/services/places.service.ts`
- `services/dataService.ts`
- `hooks/useDataFetching.ts`

## Environment Setup

### For New Developers

1. Copy the example file:
   ```bash
   cp .env.example .env
   ```

2. Request the actual API key from the team lead

3. Update the `.env` file with the real API key

### For Production Deployment

Set the environment variable in your hosting platform:

```bash
# Netlify, Vercel, or similar
APPWRITE_API_KEY=standard_dcae7c5dedfb7780d5ac83f49bb05df59b9eb05b46919b45c7787b85ae4184a7c35e09fec1ba58c03ca7f595158cee24852c4cf8899cf85e93d8c9acced138af023e7ca7f1d64ec009d831014d9990f5ad4f5068177e435e091a1af5b468325019750ab13dcc22f039046963e24d2eabad24a5d712d55f5fe488e7346a16f790
```

## Troubleshooting

### API Key Not Working

1. Verify the key is correctly set in `.env`:
   ```bash
   echo $APPWRITE_API_KEY
   ```

2. Check the configuration status:
   ```typescript
   import { isApiKeyConfigured } from './config/dataFeedConfig';
   console.log('API Key configured:', isApiKeyConfigured());
   ```

3. Restart your development server after changing `.env`:
   ```bash
   pnpm run dev
   ```

### Data Feed Not Updating

1. Check the feed intervals in `config/dataFeedConfig.ts`
2. Verify Appwrite endpoint and project ID
3. Check network requests in browser DevTools
4. Review console logs for API errors

## API Key Permissions

This API key has the following permissions in Appwrite:

- ✅ Read access to `therapists_collection_id`
- ✅ Write access to `therapists_collection_id`
- ✅ Read access to `places` collections
- ✅ Write access to `places` collections
- ✅ Read access to `bookings_collection_id`

## Security Best Practices

1. **Never commit the .env file** - It's in .gitignore for a reason
2. **Rotate keys regularly** - Update the API key every 90 days
3. **Use different keys for different environments** - Dev, staging, production
4. **Monitor API usage** - Check Appwrite dashboard for unusual activity
5. **Limit key permissions** - Only grant necessary permissions

## Related Files

- [.env](.env) - Contains the actual API key (not committed)
- [.env.example](.env.example) - Template for new developers
- [config/dataFeedConfig.ts](config/dataFeedConfig.ts) - Central configuration
- [.gitignore](.gitignore) - Ensures .env is never committed

## Support

For API key issues or questions, contact:
- Email: indastreet.id@gmail.com
- WhatsApp: +6281392000050

---

**Last Updated:** January 26, 2026  
**API Key Last Rotated:** January 26, 2026
