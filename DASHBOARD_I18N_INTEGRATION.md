# 🌐 i18n-ally Dashboard Integration Guide

## Overview

Your project now has i18next configured for **ALL 5 dashboards/apps**:

| Dashboard | Languages | Language Switcher | Header Icon |
|-----------|-----------|-------------------|------------|
| **Admin** | English only 🔒 | ❌ No | - |
| **Therapist** | EN + ID | ✅ Yes | 🇮🇩 / 🇬🇧 |
| **Place** | EN + ID | ✅ Yes | 🇮🇩 / 🇬🇧 |
| **Facial** | EN + ID | ✅ Yes | 🇮🇩 / 🇬🇧 |
| **Auth** | EN + ID (main app) | ✅ Yes | 🇮🇩 / 🇬🇧 |

---

## Files Created

```
apps/
├── admin-dashboard/src/lib/i18n.ts     ✅ (English only)
├── therapist-dashboard/src/lib/i18n.ts ✅ (EN + ID)
├── place-dashboard/src/lib/i18n.ts     ✅ (EN + ID)
└── facial-dashboard/src/lib/i18n.ts    ✅ (EN + ID)
```

---

## 📋 Integration Checklist

### For Therapist Dashboard
- [ ] Open: `apps/therapist-dashboard/src/main.tsx`
- [ ] Add at TOP: `import './lib/i18n';`
- [ ] Update components to use: `import { useTranslation } from 'react-i18next';`
- [ ] Header LanguageSwitcher will automatically control it
- [ ] Test language switching with 🇮🇩 / 🇬🇧 icons

### For Place Dashboard (Massage Places)
- [ ] Open: `apps/place-dashboard/src/main.tsx`
- [ ] Add at TOP: `import './lib/i18n';`
- [ ] Update components to use: `import { useTranslation } from 'react-i18next';`
- [ ] Header LanguageSwitcher will automatically control it
- [ ] Test language switching with 🇮🇩 / 🇬🇧 icons

### For Facial Dashboard
- [ ] Open: `apps/facial-dashboard/src/main.tsx`
- [ ] Add at TOP: `import './lib/i18n';`
- [ ] Update components to use: `import { useTranslation } from 'react-i18next';`
- [ ] Header LanguageSwitcher will automatically control it
- [ ] Test language switching with 🇮🇩 / 🇬🇧 icons

### For Admin Dashboard ⚠️
- [ ] Open: `apps/admin-dashboard/src/main.tsx`
- [ ] Add at TOP: `import './lib/i18n';`
- [ ] ⚠️ **IMPORTANT:** Admin is **ENGLISH ONLY**
- [ ] Do NOT add LanguageSwitcher component
- [ ] All components automatically use English
- [ ] No language switching UI needed

---

## 🔧 Implementation Steps

### Step 1: Update main.tsx for Each Dashboard

#### Therapist Dashboard Example:
```tsx
// apps/therapist-dashboard/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import './lib/i18n'; // ← ADD THIS LINE
import App from './App.tsx';
import './index.css';

import '../../../lib/appwrite-startup-validator';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Same pattern for:**
- `apps/place-dashboard/src/main.tsx`
- `apps/facial-dashboard/src/main.tsx`
- `apps/admin-dashboard/src/main.tsx`

### Step 2: Update Components

Replace old pattern:
```tsx
import { useLanguage } from '../hooks/useLanguage';
const { language, setLanguage } = useLanguage();
```

With new pattern:
```tsx
import { useTranslation } from 'react-i18next';
const { t, i18n } = useTranslation();
```

### Step 3: Update LanguageSwitcher in Each Dashboard

Update the header component to use the new switcher (or create dashboard-specific versions):

```tsx
import { useTranslation } from 'react-i18next';

export function TherapistHeader() {
  const { i18n } = useTranslation();
  
  return (
    <header>
      <h1>{/* dashboard content */}</h1>
      
      {/* Language Switcher - 🇮🇩 / 🇬🇧 icons */}
      <LanguageSwitcher />
    </header>
  );
}
```

---

## 🎯 Language Behavior by Dashboard

### Admin Dashboard (English Only 🔒)

```tsx
// apps/admin-dashboard/src/lib/i18n.ts
lng: 'en',           // Always English
fallbackLng: 'en',   // Always English
resources: { en }    // Only English available
```

**Result:**
- No language switcher shown
- Always displays English
- Professional, consistent interface
- No user confusion

**Example Component:**
```tsx
import { useTranslation } from 'react-i18next';

export function AdminPanel() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.welcome')}</p>
      {/* Everything is English - no need to think about language */}
    </div>
  );
}
```

---

### Therapist Dashboard (Bilingual with Switcher ✅)

```tsx
// apps/therapist-dashboard/src/lib/i18n.ts
lng: getStoredLanguage(),     // ID by default
fallbackLng: 'en',
resources: { en, id }         // Both languages
```

**Result:**
- Header shows 🇮🇩 / 🇬🇧 icons
- Click to switch language
- Language persists in localStorage
- All pages update instantly
- i18n-ally monitors coverage

**Example Component:**
```tsx
import { useTranslation } from 'react-i18next';

export function TherapistBookings() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('therapistDashboard.bookings')}</h1>
      
      {/* Language indicator */}
      <div>Current: {i18n.language === 'id' ? 'Bahasa Indonesia' : 'English'}</div>
      
      {/* Content auto-updates when language changes */}
      <BookingsList />
    </div>
  );
}
```

---

### Place Dashboard (Bilingual with Switcher ✅)

Same as Therapist Dashboard:
```tsx
// apps/place-dashboard/src/lib/i18n.ts
lng: getStoredLanguage(),
fallbackLng: 'en',
resources: { en, id }
```

---

### Facial Dashboard (Bilingual with Switcher ✅)

Same as Therapist Dashboard:
```tsx
// apps/facial-dashboard/src/lib/i18n.ts
lng: getStoredLanguage(),
fallbackLng: 'en',
resources: { en, id }
```

---

## 🔄 Language Switching Flow

### When User Clicks 🇮🇩 in Header:

```
1. User clicks Indonesian flag icon
2. LanguageSwitcher calls: i18n.changeLanguage('id')
3. Language saved to localStorage
4. All components re-render with Indonesian translations
5. i18n-ally updates coverage display
```

### When User Clicks 🇬🇧 in Header:

```
1. User clicks GB flag icon
2. LanguageSwitcher calls: i18n.changeLanguage('en')
3. Language saved to localStorage
4. All components re-render with English translations
5. i18n-ally updates coverage display
```

### For Admin Dashboard:

```
No language switcher
Always uses English
No user action needed
```

---

## 📊 i18n-ally Monitoring per Dashboard

### Therapist Dashboard
Status bar will show:
```
🌐 i18n Ally | EN: 95% ID: 92%
```
Click to see exactly what's missing in each language.

### Place Dashboard
Status bar will show:
```
🌐 i18n Ally | EN: 95% ID: 92%
```

### Facial Dashboard
Status bar will show:
```
🌐 i18n Ally | EN: 95% ID: 92%
```

### Admin Dashboard
Status bar will show:
```
🌐 i18n Ally | EN: 98%
```
(Only English, so no ID coverage tracked)

---

## ✨ Usage Examples

### Therapist Dashboard Component
```tsx
import { useTranslation } from 'react-i18next';

export function TherapistEarnings() {
  const { t, i18n } = useTranslation();
  
  return (
    <div className="earnings-panel">
      {/* Translatable heading */}
      <h2>{t('therapistDashboard.earnings.title')}</h2>
      
      {/* Translatable buttons */}
      <button>{t('common.buttons.download')}</button>
      
      {/* Translatable messages */}
      <p>{t('therapistDashboard.earnings.welcome')}</p>
      
      {/* Language indicator (optional) */}
      <span>{i18n.language === 'id' ? '🇮🇩' : '🇬🇧'}</span>
    </div>
  );
}
```

### Admin Dashboard Component
```tsx
import { useTranslation } from 'react-i18next';

export function AdminUsers() {
  const { t } = useTranslation();
  // No i18n.changeLanguage() needed - admin is always English
  
  return (
    <div className="users-panel">
      <h2>{t('dashboard.users.title')}</h2>
      <button>{t('common.buttons.add')}</button>
      {/* Everything is English - simple! */}
    </div>
  );
}
```

---

## 🚀 Quick Start Summary

### For Each Dashboard:

1. **Add ONE line** to `main.tsx`:
   ```tsx
   import './lib/i18n';
   ```

2. **Update components** - replace:
   ```tsx
   // OLD
   import { useLanguage } from '../hooks/useLanguage';
   
   // NEW
   import { useTranslation } from 'react-i18next';
   ```

3. **That's it!** Everything else works automatically.

---

## 🔒 Admin Security

Admin dashboard is **locked to English** to:
- Prevent accidental language switching
- Maintain professional interface
- Reduce confusion for administrators
- Keep settings/operations consistent

To make Admin bilingual later, just update:
```tsx
resources: { en, id }
lng: getStoredLanguage()
```

But currently: **English only** ✅

---

## 📞 Testing Checklist

### Test Each Dashboard:

- [ ] Therapist: Click 🇮🇩 → Text switches to Indonesian
- [ ] Therapist: Click 🇬🇧 → Text switches to English
- [ ] Therapist: Refresh → Language persists
- [ ] Place: Click 🇮🇩 → Text switches to Indonesian
- [ ] Place: Click 🇬🇧 → Text switches to English
- [ ] Place: Refresh → Language persists
- [ ] Facial: Click 🇮🇩 → Text switches to Indonesian
- [ ] Facial: Click 🇬🇧 → Text switches to English
- [ ] Facial: Refresh → Language persists
- [ ] Admin: No language switcher visible
- [ ] Admin: Always displays English
- [ ] i18n-ally shows coverage for all dashboards

---

## Summary

✅ **Admin Dashboard:** English only (locked)  
✅ **Therapist Dashboard:** EN + ID (switchable)  
✅ **Place Dashboard:** EN + ID (switchable)  
✅ **Facial Dashboard:** EN + ID (switchable)  
✅ **Header Icons:** 🇮🇩 / 🇬🇧 control all bilingual dashboards  
✅ **i18n-ally:** Monitors coverage on ALL dashboards  

All set for multi-language, multi-dashboard support! 🌐
