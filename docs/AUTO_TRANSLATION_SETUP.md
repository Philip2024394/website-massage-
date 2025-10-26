# Auto-Translation System Setup Guide

## Overview
Your massage booking platform now has an **intelligent auto-translation system** that supports 8 languages:
- 🇬🇧 English (EN)
- 🇮🇩 Indonesian (ID)
- 🇨🇳 Chinese (ZH)
- 🇯🇵 Japanese (JA)
- 🇰🇷 Korean (KO)
- 🇷🇺 Russian (RU)
- 🇫🇷 French (FR)
- 🇩🇪 German (DE)

### How It Works
1. **Check Appwrite first**: If translation exists, use it ✅
2. **Auto-translate if missing**: Uses Google Translate API to translate to all 8 languages
3. **Store permanently**: Saves in Appwrite for future reuse (no repeated API calls)
4. **Only translate NEW text**: Saves API costs by reusing cached translations
5. **Manual override capability**: Allows human refinement for quality control

---

## Step 1: Get Google Translate API Key

### 1.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Create Project**
3. Name it `massage-booking-translations`
4. Click **Create**

### 1.2 Enable Cloud Translation API
1. In your project, go to **APIs & Services** → **Library**
2. Search for **"Cloud Translation API"**
3. Click on it and press **Enable**

### 1.3 Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API Key**
3. Copy the API key (starts with `AIza...`)
4. **IMPORTANT**: Click **Restrict Key** for security:
   - Under **API restrictions**, select **Restrict key**
   - Choose **Cloud Translation API**
   - Click **Save**

### 1.4 Add to .env File
Create or update `.env` in your project root:

```env
VITE_GOOGLE_TRANSLATE_API_KEY=AIza...YOUR_ACTUAL_KEY_HERE
```

**Security Note**: This key is visible in client-side code. For production:
- Use Firebase Cloud Functions or backend proxy
- Or implement API key rotation
- Monitor usage in Google Cloud Console

---

## Step 2: Create Appwrite Collection

### 2.1 Login to Appwrite Console
1. Go to [https://cloud.appwrite.io/console](https://cloud.appwrite.io/console)
2. Select your project: **Indamassage** (Project ID: `68f23b11000d25eb3664`)
3. Go to **Databases** → Your database (ID: `68f76ee1000e64ca8d05`)

### 2.2 Create Translations Collection
1. Click **Add Collection**
2. Collection ID: `translations_collection_id` (MUST match exactly)
3. Collection Name: `Translations`
4. Click **Create**

### 2.3 Add Attributes
Click **Attributes** tab and add these fields:

| Attribute | Type | Size | Required | Default | Description |
|-----------|------|------|----------|---------|-------------|
| `key` | String | 255 | ✅ Yes | - | Unique translation key (e.g., "booking.guestName") |
| `en` | String | 1000 | ✅ Yes | - | English text |
| `id` | String | 1000 | ✅ Yes | - | Indonesian text |
| `zh` | String | 1000 | ✅ Yes | - | Chinese text |
| `ja` | String | 1000 | ✅ Yes | - | Japanese text |
| `ko` | String | 1000 | ✅ Yes | - | Korean text |
| `ru` | String | 1000 | ✅ Yes | - | Russian text |
| `fr` | String | 1000 | ✅ Yes | - | French text |
| `de` | String | 1000 | ✅ Yes | - | German text |
| `lastUpdated` | String | 50 | ❌ No | - | ISO 8601 timestamp |
| `autoTranslated` | Boolean | - | ✅ Yes | `true` | Whether auto-generated or human-edited |

### 2.4 Create Index
1. Click **Indexes** tab
2. Click **Add Index**
3. Index Key: `key_unique`
4. Type: **Unique**
5. Attributes: Select `key`
6. Order: **ASC**
7. Click **Create**

This ensures each translation key is unique.

### 2.5 Set Permissions
1. Click **Settings** tab
2. Under **Permissions**, add:
   - **Read access**: `Role: Any`
   - **Create access**: `Role: Users`
   - **Update access**: `Role: Users`
   - **Delete access**: `Role: Admin` (or your admin role ID)

---

## Step 3: Initialize Translations

### 3.1 Run Initialization Script
This will translate all 70+ pre-defined phrases to all languages:

```bash
# Install ts-node if not already installed
npm install -D ts-node

# Run the initialization script
npx ts-node scripts/initializeTranslations.ts
```

### 3.2 What It Does
- Translates **booking page**: 20 phrases (Guest Name, Room Number, Select Time, etc.)
- Translates **menu page**: 8 phrases (Menu, Categories, Ingredients, etc.)
- Translates **provider card**: 15 phrases (Rating, Reviews, Book Now, etc.)
- Translates **common terms**: 8 phrases (Save, Cancel, Edit, Delete, etc.)
- Translates **days of week**: 7 phrases (Monday-Sunday)
- Translates **months**: 12 phrases (January-December)

**Total**: ~70 phrases × 7 target languages = ~490 translations

### 3.3 Monitor Progress
The script shows real-time progress:

```
Initializing translations...
✓ Translated 'booking.guestName' (1/70)
✓ Translated 'booking.roomNumber' (2/70)
✓ Translated 'booking.selectDate' (3/70)
...
✅ Initialization complete!
   - Success: 70
   - Failed: 0
```

**Note**: With 200ms delay between translations, this takes ~14 seconds per language × 7 languages = **~2 minutes total**.

---

## Step 4: Update Hotel/Villa Booking Page

The booking page has already been updated to use the auto-translation hook! 

### Current Implementation
```typescript
import { useAutoTranslation } from '../hooks/useAutoTranslation';

const HotelVillaGuestBookingPage = ({ selectedLanguage, ... }) => {
    const { t } = useAutoTranslation(selectedLanguage);
    
    return (
        <div>
            <h1>{t('bookAppointment', 'Book Appointment')}</h1>
            <input placeholder={t('guestNamePlaceholder', 'Enter your name')} />
            {/* Auto-translates if key missing, returns default text immediately */}
        </div>
    );
};
```

### How `t()` Function Works
```typescript
t('key', 'default text')
```

**Non-Blocking Behavior**:
1. Returns `default text` **immediately** (no loading spinner)
2. Checks Appwrite cache in background
3. If translation exists → Updates component with translated text
4. If missing → Auto-translates to all languages via Google API → Saves to Appwrite → Updates component

**Benefits**:
- ✅ No loading states needed
- ✅ Instant UI rendering
- ✅ Graceful degradation
- ✅ Auto-populates cache for future use

---

## Step 5: Testing

### 5.1 Test Language Switching
1. Open Hotel/Villa Guest Booking page
2. Change language selector to each language:
   - 🇬🇧 English (default)
   - 🇮🇩 Indonesian (should show immediately from cache)
   - 🇨🇳 Chinese (auto-translates first time, then cached)
   - 🇯🇵 Japanese
   - 🇰🇷 Korean
   - 🇷🇺 Russian
   - 🇫🇷 French
   - 🇩🇪 German

### 5.2 Test Auto-Translation
Add a new translatable string:

```typescript
// In any component using useAutoTranslation
const { t } = useAutoTranslation(language);

<button>{t('newFeature.button', 'Click Me!')}</button>
```

**What happens**:
1. First render: Shows "Click Me!" (default text)
2. Background: Checks Appwrite → Not found → Translates to all 8 languages
3. Saves to Appwrite with key `newFeature.button`
4. Updates component with translated text
5. Next time: Instantly loads from Appwrite cache ✅

### 5.3 Verify in Appwrite
1. Go to Appwrite Console → Databases → Translations collection
2. You should see documents like:

```json
{
  "key": "booking.guestName",
  "en": "Guest Name",
  "id": "Nama Tamu",
  "zh": "客人姓名",
  "ja": "ゲスト名",
  "ko": "손님 이름",
  "ru": "Имя гостя",
  "fr": "Nom de l'invité",
  "de": "Gastname",
  "lastUpdated": "2024-01-15T10:30:00.000Z",
  "autoTranslated": true
}
```

---

## Step 6: Manual Translation Override

For quality control, you can manually refine auto-translations:

### 6.1 Using the Service
```typescript
import { updateManualTranslation } from '../services/autoTranslationService';

// Override auto-translation with human-refined text
await updateManualTranslation(
    'booking.guestName',  // key
    'ja',                  // language code
    'お客様のお名前'       // refined Japanese translation
);
```

This updates the translation and sets `autoTranslated: false` to track human edits.

### 6.2 Future: Admin Panel
You could build an admin interface:
- List all translations
- Filter by `autoTranslated: true` (needs human review)
- Edit translations inline
- Bulk import/export via CSV

---

## Cost Estimation

### Google Translate API Pricing
- **Free tier**: $0 (none)
- **Standard edition**: $20 per 1 million characters
- **Average**: 1 phrase = ~20 characters × 7 languages = 140 chars

**Your usage**:
- Initial 70 phrases: 70 × 140 = 9,800 chars = **$0.20**
- Monthly new features: ~50 phrases = 7,000 chars = **$0.14/month**
- **Total first year**: ~$2.00

### Appwrite Storage
- **Free tier**: 75,000 documents, 2GB storage
- Your translations: ~500 docs × 2KB = **1MB total**
- **Cost**: $0 (well within free tier)

---

## Architecture Files Created

### 1. `services/autoTranslationService.ts`
Core translation engine with methods:
- `translateText()`: Single translation via Google API
- `translateToAllLanguages()`: Bulk translation (1 → 7 languages)
- `getOrTranslate()`: Main method (check cache → translate → save)
- `saveTranslation()`: Store in Appwrite
- `getAllTranslationsForLanguage()`: Fetch all for specific language
- `updateManualTranslation()`: Manual override

### 2. `hooks/useAutoTranslation.ts`
React hook for components:
- `t(key, defaultText)`: Translation function
- `language`: Current language state
- `setLanguage(lang)`: Change language
- `loading`: Translation fetch status
- `error`: Error messages

### 3. `scripts/initializeTranslations.ts`
One-time setup script:
- `BOOKING_TRANSLATIONS`: 70+ pre-defined phrases
- `initializeTranslations()`: Bulk translation function
- Progress tracking and error handling

---

## Troubleshooting

### Issue: "API key not found"
**Solution**: Check `.env` file has `VITE_GOOGLE_TRANSLATE_API_KEY=AIza...`
- Restart dev server after adding `.env`

### Issue: "Collection not found"
**Solution**: Verify Appwrite collection ID is exactly `translations_collection_id`
- Check `lib/appwrite.ts` → `COLLECTIONS.TRANSLATIONS`

### Issue: "Translation not appearing"
**Solution**: Check browser console for errors
- Open DevTools → Console tab
- Look for Appwrite or API errors

### Issue: "Rate limit exceeded"
**Solution**: Reduce translation speed
- Edit `scripts/initializeTranslations.ts`
- Increase delay from `200ms` to `500ms`

### Issue: "Incorrect translation quality"
**Solution**: Use manual override
```typescript
await updateManualTranslation('key', 'lang', 'better translation');
```

---

## Next Steps

### 1. Apply to Other Pages
Update these pages to use auto-translation:
- `HomePage.tsx`
- `MenuPage.tsx`
- `TherapistCard.tsx`
- `PlaceCard.tsx`
- `BookingPage.tsx`

### 2. Add Language Selector
Create a language switcher component:

```typescript
const LanguageSwitcher = () => {
    const { language, setLanguage } = useAutoTranslation();
    
    return (
        <select value={language} onChange={(e) => setLanguage(e.target.value as LanguageCode)}>
            <option value="en">🇬🇧 English</option>
            <option value="id">🇮🇩 Indonesian</option>
            <option value="zh">🇨🇳 Chinese</option>
            <option value="ja">🇯🇵 Japanese</option>
            <option value="ko">🇰🇷 Korean</option>
            <option value="ru">🇷🇺 Russian</option>
            <option value="fr">🇫🇷 French</option>
            <option value="de">🇩🇪 German</option>
        </select>
    );
};
```

### 3. Performance Optimization
- Implement translation pre-loading on app startup
- Cache translations in localStorage for offline support
- Batch translation requests for new features

### 4. Quality Assurance
- Review auto-translated text with native speakers
- Create translation review workflow for admins
- Track which translations need human refinement

---

## Summary

✅ **Auto-translation system complete!**

**What you have**:
1. ✅ Google Translate API integration
2. ✅ Appwrite persistent storage
3. ✅ React hook for easy component usage
4. ✅ Initialization script with 70+ phrases
5. ✅ Manual override capability
6. ✅ 8 languages supported
7. ✅ Hotel/Villa booking page updated

**What you need to do**:
1. ⏳ Get Google Translate API key
2. ⏳ Create Appwrite translations collection
3. ⏳ Run initialization script
4. ⏳ Test language switching

**Estimated setup time**: 15-20 minutes

🎉 **Your platform will support 8 languages with minimal ongoing cost (~$2/year)!**
