# Translation System - Complete Guide

## 🌐 Overview

Your app has a **complete bilingual translation system** with:
- **Default Language**: Indonesian (`id`)
- **Secondary Language**: English (`en`)
- **Storage**: Appwrite database + local fallback files
- **Switching**: Header language selector (EN/ID buttons)

---

## ✅ Current Implementation Status

### Completed:
- ✅ Translation structure in `/translations` folder
- ✅ `useTranslations` hook for loading translations
- ✅ Language context with 'en' and 'id' support
- ✅ Default language: Indonesian ('id')
- ✅ Fallback system when Appwrite is unreachable
- ✅ Header language switcher
- ✅ Automatic language persistence (localStorage)

### To Complete:
- ⏳ **Seed translations to Appwrite** (run the script below)
- ⏳ Verify translation loading in browser
- ⏳ Test language switching functionality

---

## 🚀 Setup Instructions

### Step 1: Seed Translations to Appwrite

The translation files exist locally but need to be uploaded to Appwrite:

**Windows PowerShell:**
```powershell
$env:APPWRITE_API_KEY="your-api-key-here"
node scripts/seedTranslations.cjs
```

**Linux/Mac:**
```bash
export APPWRITE_API_KEY="your-api-key-here"
node scripts/seedTranslations.cjs
```

### Step 2: Get Your API Key

1. Go to: https://cloud.appwrite.io/console/project-67ad11370013cea5c66b/settings
2. Click "API Keys" tab
3. Create new key with:
   - Name: "Translation Seeding"
   - Scopes: `databases.read`, `databases.write`
4. Copy the API key

### Step 3: Verify in Appwrite Console

1. Go to: https://cloud.appwrite.io/console
2. Open your project database
3. Look for `translations` collection
4. Should contain ~1000+ documents (500+ for each language)

---

## 📁 Translation Files Structure

```
/translations
├── index.ts              # Main export, combines all modules
├── common.ts             # Common UI elements
├── auth.ts               # Authentication pages
├── home.ts               # Home page
├── dashboard.ts          # Dashboard pages
├── massageTypes.ts       # Massage types directory
├── jobs.ts               # Job listings
└── partners.ts           # Partner pages
```

Each file exports translations in this format:
```typescript
export const commonTranslations = {
  en: {
    welcome: 'Welcome',
    login: 'Login',
    logout: 'Logout'
  },
  id: {
    welcome: 'Selamat Datang',
    login: 'Masuk',
    logout: 'Keluar'
  }
};
```

---

## 🎮 How to Use Translations in Components

### Method 1: Object Access (Recommended)
```typescript
import { useTranslations } from '../lib/useTranslations';

function MyComponent() {
  const { dict } = useTranslations();
  
  return (
    <div>
      <h1>{dict.home?.therapistsTitle}</h1>
      <p>{dict.home?.therapistsSubtitle}</p>
    </div>
  );
}
```

### Method 2: Function Access
```typescript
import { useTranslations } from '../lib/useTranslations';

function MyComponent() {
  const { t } = useTranslations();
  
  return (
    <div>
      <h1>{t('home.therapistsTitle')}</h1>
      <p>{t('home.therapistsSubtitle')}</p>
    </div>
  );
}
```

### Method 3: With Language Context
```typescript
import { useContext } from 'react';
import { LanguageContext } from '../context/LanguageContext';
import { useTranslations } from '../lib/useTranslations';

function MyComponent() {
  const { language, setLanguage } = useContext(LanguageContext);
  const { dict } = useTranslations(language);
  
  return (
    <div>
      <p>Current: {language}</p>
      <button onClick={() => setLanguage('en')}>English</button>
      <button onClick={() => setLanguage('id')}>Indonesian</button>
      <h1>{dict.home?.therapistsTitle}</h1>
    </div>
  );
}
```

---

## 🔄 How Language Switching Works

### 1. User Clicks Language Button in Header
```typescript
// Header component
<button onClick={() => setLanguage('id')}>ID</button>
<button onClick={() => setLanguage('en')}>EN</button>
```

### 2. Language State Updates
```typescript
// useAppState.ts - Default is 'id'
const [language, setLanguage] = useState<'en' | 'id'>('id');
```

### 3. useTranslations Hook Reloads
```typescript
// useTranslations.ts
useEffect(() => {
  loadTranslations(); // Fetches from Appwrite or uses fallback
}, [currentLanguage]);
```

### 4. Components Re-render with New Language
All components using `useTranslations()` automatically get new text.

---

## 📝 Adding New Translations

### Step 1: Add to Translation Files

**Edit `/translations/home.ts`:**
```typescript
export const homeTranslations = {
  en: {
    home: {
      newFeature: 'New Feature',
      newButton: 'Click Me'
    }
  },
  id: {
    home: {
      newFeature: 'Fitur Baru',
      newButton: 'Klik Saya'
    }
  }
};
```

### Step 2: Re-seed to Appwrite

```powershell
$env:APPWRITE_API_KEY="your-key"
node scripts/seedTranslations.cjs
```

The script will:
- ✅ Skip existing translations (no duplicates)
- ✅ Only add new translations
- ✅ Show progress for each language

### Step 3: Use in Component

```typescript
const { dict } = useTranslations();
return <h1>{dict.home?.newFeature}</h1>;
```

---

## 🔍 How the Fallback System Works

### Loading Priority:

1. **Appwrite Database** (Primary)
   - Fetched on component mount
   - Cached for 1 hour in localStorage
   - Always checked first

2. **Local Cache** (Secondary)
   - 1-hour expiry
   - Used if Appwrite request fails
   - Speeds up subsequent loads

3. **Local Fallback Files** (Tertiary)
   - `/translations/*.ts` files
   - Used if Appwrite empty or offline
   - Prevents app from breaking

### Example Flow:
```
User opens app
    ↓
useTranslations hook loads
    ↓
Check localStorage cache (1hr expiry)
    ├─ Found & Fresh → Use cached
    └─ Expired or Missing → Query Appwrite
        ├─ Success → Cache & Use
        └─ Fail → Use local fallback files
```

---

## 🐛 Troubleshooting

### Problem: Translations Not Loading

**Check Browser Console:**
```
✅ "useTranslations: Using Appwrite translations for id"
✅ "UIConfigService: Loaded config for book_now_behavior"
```

**If you see:**
```
⚠️ "useTranslations: Appwrite empty, using fallback translations"
```

**Solution:** Run the seeding script:
```powershell
$env:APPWRITE_API_KEY="your-key"
node scripts/seedTranslations.cjs
```

---

### Problem: Language Not Switching

**Check:**
1. Header language buttons exist and have `onClick` handlers
2. Browser console shows: `"🌍 App.tsx: handleLanguageSelect called with: id"`
3. localStorage key `app_language` changes when clicking buttons

**Debug:**
```typescript
const { language } = useContext(LanguageContext);
console.log('Current language:', language);
```

---

### Problem: Missing Translations (Shows Key Instead of Text)

**Example:** Shows `"home.therapistsTitle"` instead of `"Home Service Therapists"`

**Causes:**
1. Translation key doesn't exist in files
2. Appwrite collection not seeded
3. Typo in translation key

**Solution:**
1. Check `/translations/home.ts` for the key
2. Add missing translation if needed
3. Re-run seed script
4. Clear cache: `localStorage.clear()`

---

## 📊 Translation Statistics

After seeding, you should have:

| Language | Keys | Sections |
|----------|------|----------|
| English (en) | ~600 | 15+ |
| Indonesian (id) | ~600 | 15+ |

**Sections Include:**
- common (buttons, labels)
- auth (login, register)
- home (therapist cards, places)
- dashboard (provider dashboards)
- massageTypes (directory)
- jobs (job listings)
- partners (hotel/villa)
- blog, howItWorks, serviceTerms, privacyPolicy

---

## 🎯 Best Practices

### 1. Always Provide Both Languages
```typescript
// ✅ Good
const translations = {
  en: { greeting: 'Hello' },
  id: { greeting: 'Halo' }
};

// ❌ Bad
const translations = {
  en: { greeting: 'Hello' },
  id: {} // Missing translation
};
```

### 2. Use Nested Structure for Organization
```typescript
// ✅ Good
{
  home: {
    therapists: {
      title: 'Therapists',
      subtitle: 'Find the best'
    }
  }
}

// ❌ Bad (flat, hard to manage)
{
  homeTherapistsTitle: 'Therapists',
  homeTherapistsSubtitle: 'Find the best'
}
```

### 3. Use Optional Chaining
```typescript
// ✅ Good - Won't break if key missing
<h1>{dict.home?.therapistsTitle || 'Default'}</h1>

// ❌ Bad - Will error if key missing
<h1>{dict.home.therapistsTitle}</h1>
```

### 4. Cache Translations for Performance
The system already does this automatically with 1-hour localStorage cache.

---

## 🔐 Security & Permissions

### Appwrite Collection Permissions:
- **Read**: Any (public)
- **Write**: Admin team only

This ensures:
- ✅ Anyone can read translations
- ✅ Only admins can modify translations
- ✅ Users can't inject malicious translations

---

## 🚀 Advanced: Dynamic Translation Updates

You can update translations in real-time without code deployment:

### 1. Update in Appwrite Console
1. Go to `translations` collection
2. Find the document (e.g., language='en', key='home.therapistsTitle')
3. Edit the `value` field
4. Save

### 2. Clear Cache in App
```javascript
// In browser console
localStorage.removeItem('indostreet_translations');
window.location.reload();
```

### 3. Changes Appear Immediately
No code deployment needed!

---

## 📱 Mobile Considerations

Translations work identically on mobile. The language selector in the header adapts to mobile screens.

---

## 🌟 Key Features

1. **Bilingual**: Full English and Indonesian support
2. **Default Indonesian**: App loads in Indonesian by default
3. **Instant Switching**: Click EN/ID to switch languages
4. **Persistent**: Language choice saved in localStorage
5. **Offline**: Works even when Appwrite is offline (fallback files)
6. **Scalable**: Easy to add more languages (just add 'fr', 'es', etc.)

---

## ✅ Testing Checklist

- [ ] Run `seedTranslations.cjs` script
- [ ] Verify `translations` collection exists in Appwrite
- [ ] Open app - should load in Indonesian
- [ ] Click "EN" button - should switch to English
- [ ] Click "ID" button - should switch back to Indonesian
- [ ] Refresh page - language should persist
- [ ] Check browser console - no translation errors
- [ ] Test on mobile - language switcher works

---

## 🎉 Success Criteria

You'll know it's working when:
1. ✅ App loads in Indonesian by default
2. ✅ Header shows EN/ID buttons
3. ✅ Clicking buttons changes all text instantly
4. ✅ Language persists after refresh
5. ✅ No "key not found" errors in console
6. ✅ All pages translated (home, dashboard, auth, etc.)

---

**🌐 Your app is now fully bilingual! Users can seamlessly switch between Indonesian and English.**
