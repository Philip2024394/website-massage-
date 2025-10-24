# Translations Setup Guide

## Overview
IndoStreet translations are now stored in Appwrite for easy management without redeployment.

## Appwrite Collection Setup

### Collection Name: `translations`
### Collection ID: `translations_collection_id`

### Attributes:
1. **language** (String, required)
   - Size: 10
   - Values: 'en', 'id'

2. **key** (String, required)
   - Size: 100
   - Examples: 'home', 'serviceTerms', 'privacyPolicy'

3. **value** (String, required)
   - Size: 65000 (max for complex objects)
   - JSON stringified objects or plain text

### Indexes:
1. **language_key** (unique)
   - Attributes: language, key
   - Type: unique
   - This prevents duplicate translations

## Initial Setup Steps

### 1. Create Collection in Appwrite Console
- Go to your Appwrite project
- Create new collection named "translations"
- Add the 3 attributes above
- Create the unique index
- Set permissions (any user can read, only admins can write)

### 2. Update Collection ID
In `lib/appwrite.config.ts`, replace `translations_collection_id` with your actual collection ID from Appwrite.

### 3. Sync Local Translations to Appwrite
Run the sync script once to upload all translations:

```bash
npm run sync:translations
```

Or manually import and run:
```typescript
import { translationsService } from './lib/appwriteService';
import { translations } from './translations/index';

await translationsService.syncFromLocal(translations);
```

### 4. Update App.tsx
Replace the current translations import with the hook:

```typescript
import { useTranslations } from './lib/useTranslations';

function App() {
    const { t, loading } = useTranslations('en');
    
    if (loading) return <div>Loading...</div>;
    
    // Use t as before
}
```

## Benefits

✅ **Update without redeployment** - Change translations in Appwrite console
✅ **Caching** - 1-hour browser cache for performance
✅ **Fallback** - Uses local translations if Appwrite fails
✅ **Offline support** - Cached translations work offline

## Managing Translations

### Through Appwrite Console
1. Go to Databases → translations collection
2. Find the document (filter by language and key)
3. Edit the `value` field
4. For complex objects, edit as JSON string

### Programmatically
```typescript
import { translationsService } from './lib/appwriteService';

// Update a translation
await translationsService.set('en', 'home', {
    title: 'Welcome to IndoStreet',
    subtitle: 'Find the best massage services'
});

// Refresh all from local
await translationsService.syncFromLocal(translations);
```

## Structure in Appwrite

Each translation key becomes a document:

| language | key | value |
|----------|-----|-------|
| en | home | `{"title": "Home", "welcome": "..."}` |
| en | serviceTerms | `{"title": "Service Policy", ...}` |
| id | home | `{"title": "Beranda", "welcome": "..."}` |
| id | serviceTerms | `{"title": "Kebijakan Layanan", ...}` |

## Cache Management

Translations are cached for 1 hour. To force refresh:
```typescript
const { refresh } = useTranslations('en');
await refresh();
```

Or clear cache:
```typescript
localStorage.removeItem('indostreet_translations');
```

## Performance

- **First load**: ~500ms (network fetch)
- **Cached**: <10ms (localStorage)
- **Fallback**: 0ms (bundled in app)

## Rollback

To revert to local translations only:
1. Remove `useTranslations` hook usage
2. Use original `import { translations }` from `translations/index`
3. Keep local files as backup
