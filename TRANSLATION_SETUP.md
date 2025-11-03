# Auto-Translation System for Therapist Data

This system automatically translates therapist profiles between English and Indonesian to provide a better experience for Indonesian users and tourists.

## 🚀 Features

- **Auto-Translation**: Automatically translates therapist bios, locations, and massage types
- **Multi-Language Storage**: Stores both English and Indonesian versions in database
- **Smart Language Detection**: Automatically detects source language
- **Fallback System**: Uses common massage term translations when API fails
- **Admin Panel**: Easy-to-use interface for managing translations
- **Free API**: Uses MyMemory API (5000 chars/day free)

## 📋 Setup Instructions

### 1. Database Schema Update

The system automatically adds these fields to your therapist collection:

```typescript
// New fields added to Therapist interface
description_en?: string;     // English description
description_id?: string;     // Indonesian description  
location_en?: string;        // English location
location_id?: string;        // Indonesian location
massageTypes_en?: string;    // English massage types (JSON)
massageTypes_id?: string;    // Indonesian massage types (JSON)
name_en?: string;           // English name
name_id?: string;           // Indonesian name
```

### 2. Admin Dashboard Integration

✅ **Already integrated!** The admin dashboard now includes:

- **UI Translations** button - For interface translations
- **Therapist Data Translations** button - For therapist profile translations

### 3. Automatic Translation Usage

#### Option A: Use in Therapist Registration Forms

```typescript
import { useAutoTranslateTherapist } from '../hooks/useAutoTranslateTherapist';

const TherapistRegistrationForm = () => {
  const { smartTranslateTherapist } = useAutoTranslateTherapist();
  
  const handleSubmit = async (formData) => {
    try {
      // 1. Save therapist data
      const savedTherapist = await therapistService.create(formData);
      
      // 2. Auto-translate and save both languages
      await smartTranslateTherapist(savedTherapist.$id, {
        description: formData.description,
        location: formData.location,
        massageTypes: formData.massageTypes
      });
      
      console.log('✅ Therapist saved and translated!');
    } catch (error) {
      console.error('Error:', error);
    }
  };
};
```

#### Option B: Bulk Translate Existing Data

Use the admin panel's "Translate All Therapists" button to translate existing therapist profiles.

### 4. Frontend Display

✅ **Already implemented!** TherapistCard now automatically shows:

- Indonesian text when language is set to 'id'
- English text when language is set to 'en'
- Falls back to generic Indonesian description when needed

## 🔧 API Configuration

### Current Setup (Free)
- **MyMemory API**: 5000 characters/day, no API key needed
- **Fallback Translations**: Common massage terms built-in

### Production Upgrade (Optional)
For higher volume, uncomment Google Translate in `translationService.ts`:

```typescript
// Add to .env file
VITE_GOOGLE_TRANSLATE_API_KEY=your_api_key_here

// Uncomment in translationService.ts
const translated = await translateWithGoogle(text, fromLang, toLang);
```

## 📊 How It Works

### Translation Flow
1. **Data Entry**: Therapist enters profile in any language
2. **Language Detection**: System detects if text is English or Indonesian  
3. **API Translation**: Calls MyMemory API to translate
4. **Fallback**: Uses built-in translations for common massage terms
5. **Storage**: Saves both language versions in database
6. **Display**: App shows correct language based on user's setting

### Supported Content
- ✅ Therapist descriptions/bios
- ✅ Location names  
- ✅ Massage type lists
- ✅ Therapist names (for international therapists)

## 🎯 Usage Examples

### Admin Panel Features

1. **Test Single Translation**
   - Enter therapist ID and content
   - Test translation before bulk processing
   - View translation results

2. **Bulk Translation**
   - Translate all existing therapists at once
   - Progress tracking and error reporting
   - Safe - only translates missing translations

### Translation Quality

**Common Massage Terms** (Built-in fallbacks):
- Swedish Massage → Pijat Swedia
- Deep Tissue → Pijat Jaringan Dalam  
- Hot Stone → Pijat Batu Panas
- Aromatherapy → Pijat Aromaterapi
- Thai Massage → Pijat Thailand

**API Translations**: Full sentences and descriptions

## 🛠 Troubleshooting

### Translation Not Working?
1. Check browser console for errors
2. Verify Appwrite connection
3. Check MyMemory API rate limits (5000 chars/day)

### Missing Translations?
1. Use admin panel to check translation status
2. Run bulk translation for existing data
3. Verify database field names match schema

### Poor Translation Quality?
1. Consider upgrading to Google Translate API
2. Add more fallback terms in `translationService.ts`
3. Manually edit translations via admin panel

## 🚀 Next Steps

1. **Test the System**:
   - Go to Admin Dashboard → "Therapist Data Translations"
   - Try single therapist translation
   - Run bulk translation for existing data

2. **Monitor Usage**:
   - Check translation success rates
   - Monitor API usage limits
   - Review translation quality

3. **Scale Up** (Optional):
   - Add Google Translate API for production
   - Implement caching for repeated translations
   - Add more languages (Chinese, Japanese, etc.)

## 📞 Support

The system includes comprehensive error handling and logging. Check browser console for detailed information about translation status and any issues.

**Translation Benefits for Your Business**:
- ✅ Better user experience for Indonesian customers
- ✅ Increased accessibility for tourists
- ✅ Automatic scaling - works for all new therapists
- ✅ No manual translation work required
- ✅ Consistent terminology across the platform