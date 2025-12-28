# Language Implementation Guide - ID/GB Translation System

## ✅ Current Implementation Status

### Already Implemented:
1. **LanguageContext** (`context/LanguageContext.tsx`)
   - Supports: 'id' (Indonesian), 'en' (English), 'gb' (British English)
   - Default language: Indonesian ('id')
   - Global state management via Context API

2. **GlobalHeader** (`components/GlobalHeader.tsx`)
   - Language switcher buttons (GB/ID)
   - Active language highlighting (orange for selected)
   - Persistent across all pages

3. **Appwrite Translation Service** (`lib/appwrite/services/translation.service.ts`)
   - Stores translations in Appwrite database
   - Supports 20+ languages
   - Key-value structure: `language.key = value`
   - Automatic fallback to English if translation missing

4. **Chat Translation Service** (`services/chatTranslationService.ts`)
   - Specialized for chat/booking flows
   - Already translating: book_now, schedule, activate_chat, etc.

### Current Language Flow:
```
App.tsx 
  ↓ (provides LanguageProvider)
GlobalHeader 
  ↓ (user clicks GB/ID button)
setLanguage('gb' or 'id')
  ↓ (updates context)
All components using useLanguageContext()
  ↓ (re-render with new language)
Display translated content
```

## 📋 What Needs To Be Done:

### Phase 1: Homepage Translation (PRIORITY)
**File: `pages/HomePage.tsx`**

Current hardcoded text that needs translation:
- "Find Therapists" → "Temukan Terapis"
- "Find Massage Places" → "Temukan Tempat Pijat"
- "Find Facial Clinics" → "Temukan Klinik Kecantikan"
- "Available Now" → "Tersedia Sekarang"
- "All Locations" → "Semua Lokasi"
- Search placeholders
- Filter labels
- City names (optional - can keep English)

### Phase 2: Common Components
**Priority Components:**
1. `components/TherapistCard.tsx` - Partially done (Book Now, Schedule)
2. `components/TherapistHomeCard.tsx` - Needs translation
3. `components/MassagePlaceHomeCard.tsx` - Needs translation
4. `components/FacialPlaceHomeCard.tsx` - Needs translation
5. `components/GlobalFooter.tsx` - Footer links

### Phase 3: All Pages
Scan and translate:
- Customer pages (profile, reviews, bookings)
- Provider pages (dashboards, settings)
- Static pages (about, terms, privacy, FAQ)
- Auth pages (login, signup)

## 🛠️ Implementation Steps:

### Step 1: Add Translations to Appwrite

Create a collection called `translations` with structure:
```json
{
  "language": "id",
  "Key": "homepage.findTherapists",
  "value": "Temukan Terapis",
  "lastUpdated": "2025-12-24T00:00:00.000Z"
}
```

**Key Translations Needed:**
```typescript
// Homepage
homepage.findTherapists: "Temukan Terapis"
homepage.findPlaces: "Temukan Tempat Pijat"
homepage.findFacials: "Temukan Klinik Kecantikan"
homepage.availableNow: "Tersedia Sekarang"
homepage.allLocations: "Semua Lokasi"
homepage.searchPlaceholder: "Cari terapis, tempat, atau layanan..."
homepage.noResults: "Tidak ada hasil ditemukan"
homepage.loading: "Memuat..."

// Common UI
common.bookNow: "Pesan Sekarang"
common.schedule: "Jadwalkan"
common.available: "Tersedia"
common.busy: "Sibuk"
common.offline: "Offline"
common.rating: "Penilaian"
common.reviews: "Ulasan"
common.distance: "Jarak"
common.minutes: "menit"
common.hours: "jam"
common.save: "Simpan"
common.cancel: "Batal"
common.confirm: "Konfirmasi"
common.close: "Tutup"

// Therapist Card
therapist.viewProfile: "Lihat Profil"
therapist.priceMenu: "Menu Harga"
therapist.experiencedIn: "Berpengalaman Dalam"
therapist.languages: "Bahasa"
therapist.accepts: "Menerima"

// Booking
booking.selectDuration: "Pilih Durasi"
booking.selectTime: "Pilih Waktu"
booking.enterDetails: "Masukkan Detail"
booking.yourName: "Nama Anda"
booking.whatsappNumber: "Nomor WhatsApp"
booking.yourLocation: "Lokasi Anda"
booking.activateChat: "Aktifkan Chat"
booking.bookingConfirmed: "Booking Dikonfirmasi"

// Footer
footer.aboutUs: "Tentang Kami"
footer.contact: "Kontak"
footer.terms: "Syarat & Ketentuan"
footer.privacy: "Kebijakan Privasi"
footer.careers: "Karir"
```

### Step 2: Create Translation Hook

```typescript
// hooks/usePageTranslations.ts
import { useLanguageContext } from '../context/LanguageContext';
import { translationsService } from '../lib/appwrite/services/translation.service';
import { useState, useEffect } from 'react';

export function usePageTranslations() {
  const { language } = useLanguageContext();
  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      try {
        const allTranslations = await translationsService.getAll();
        const lang = language === 'gb' ? 'en' : language;
        setTranslations(allTranslations?.[lang] || {});
      } catch (error) {
        console.error('Failed to load translations:', error);
      } finally {
        setLoading(false);
      }
    }
    loadTranslations();
  }, [language]);

  const t = (key: string, fallback?: string) => {
    return translations[key] || fallback || key;
  };

  return { t, loading, language };
}
```

### Step 3: Update HomePage to Use Translations

```tsx
// In HomePage.tsx
import { usePageTranslations } from '../hooks/usePageTranslations';

const HomePage = (props) => {
  const { t, language } = usePageTranslations();

  return (
    <div>
      <h1>{t('homepage.findTherapists', 'Find Therapists')}</h1>
      <button>{t('common.bookNow', 'Book Now')}</button>
      {/* etc */}
    </div>
  );
};
```

### Step 4: Upload Translations to Appwrite

Use the Appwrite Console or create a migration script:

```typescript
// scripts/uploadTranslations.ts
import { translationsService } from '../lib/appwrite/services/translation.service';

const translations = {
  id: {
    'homepage.findTherapists': 'Temukan Terapis',
    'homepage.findPlaces': 'Temukan Tempat Pijat',
    // ... all Indonesian translations
  },
  en: {
    'homepage.findTherapists': 'Find Therapists',
    'homepage.findPlaces': 'Find Massage Places',
    // ... all English translations
  }
};

async function uploadAll() {
  for (const [lang, keys] of Object.entries(translations)) {
    for (const [key, value] of Object.entries(keys)) {
      await translationsService.set(lang, key, value);
      console.log(`✅ Uploaded: ${lang}.${key}`);
    }
  }
}

uploadAll();
```

## 📊 Testing Checklist:

- [ ] Homepage displays in Indonesian by default
- [ ] Clicking GB button switches all text to English
- [ ] Clicking ID button switches back to Indonesian
- [ ] Language persists across page navigation
- [ ] TherapistCard shows translated buttons
- [ ] ChatWindow shows translated fields
- [ ] All modals/popups translated
- [ ] Footer links translated
- [ ] Error messages translated
- [ ] Form validation messages translated

## 🎯 Current Translation Coverage:

### ✅ Already Translated:
- ChatWindow (immediate booking flow)
- BookingFormPopup
- TherapistCard buttons (Book Now, Schedule)
- Basic status labels (Available, Busy, Offline)

### ⚠️ Partially Translated:
- HomePage (mixed hardcoded + translated)
- TherapistCard (some UI elements)

### ❌ Not Translated:
- Most static pages
- Dashboard pages
- Settings pages
- Error pages
- Admin pages

## 🔧 Quick Fix for Immediate Implementation:

**Option 1: Use Existing Translation Pattern**
```tsx
import { useLanguageContext } from '../context/LanguageContext';

const MyComponent = () => {
  const { language } = useLanguageContext();
  
  return (
    <div>
      {language === 'id' ? 'Teks Indonesia' : 'English Text'}
    </div>
  );
};
```

**Option 2: Create Simple Translation Object**
```tsx
const TRANSLATIONS = {
  id: {
    title: 'Temukan Terapis',
    button: 'Pesan Sekarang'
  },
  en: {
    title: 'Find Therapists',
    button: 'Book Now'
  }
};

const MyComponent = () => {
  const { language } = useLanguageContext();
  const t = TRANSLATIONS[language === 'gb' ? 'en' : language];
  
  return (
    <div>
      <h1>{t.title}</h1>
      <button>{t.button}</button>
    </div>
  );
};
```

## 📝 Next Steps:

1. **Review this document** to understand current state
2. **Create translation keys** for HomePage first
3. **Upload to Appwrite** via console or script
4. **Update HomePage component** to use translations
5. **Test language switching** works correctly
6. **Repeat for other high-priority components**
7. **Gradually expand** to all pages

## 🆘 Support Resources:

- LanguageContext: `context/LanguageContext.tsx`
- GlobalHeader (switcher): `components/GlobalHeader.tsx`
- Translation Service: `lib/appwrite/services/translation.service.ts`
- Chat Translations: `services/chatTranslationService.ts`
- Example Usage: `components/TherapistCard.tsx` (search for `chatLang`)

---

**Last Updated:** December 24, 2025
**Status:** Infrastructure Ready, Content Migration Needed
**Priority:** Homepage → Common Components → All Pages
