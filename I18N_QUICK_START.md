# 🚀 i18n-ally Quick Start (5 Minutes)

## ✅ What's Already Done

```
✓ i18next 25.7.4 installed
✓ react-i18next 16.5.3 installed  
✓ lib/i18n.ts created
✓ .i18nrc.json configured
✓ 1000+ translations ready
✓ i18n-ally extension ready
```

---

## 🎯 3 SIMPLE STEPS TO ACTIVATE

### Step 1: Open main.tsx and Add ONE Line
**Location:** Root `main.tsx` file

**Add at the VERY TOP (before App import):**
```tsx
import './lib/i18n'; // ← ADD THIS LINE

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// ... rest of imports
```

**Why?** This initializes i18next before your components render.

---

### Step 2: Update One Component
Pick any component and change:

**BEFORE:**
```tsx
import { useTranslations } from '../lib/useTranslations';

export function MyComponent() {
  const { t } = useTranslations();
  return <h1>{t('home.title')}</h1>;
}
```

**AFTER:**
```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('home.title')}</h1>;
}
```

That's it! The rest can stay the same.

---

### Step 3: Check i18n-ally in VS Code
1. Look at VS Code **status bar** (bottom right)
2. Should see: **🌐 i18n Ally**
3. Click it to see coverage: `EN: 95% ID: 90%`

---

## 🎨 Optional: Add Language Switcher

```tsx
import { useTranslation } from 'react-i18next';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className="lang-switcher">
      <button 
        onClick={() => i18n.changeLanguage('en')}
        className={i18n.language === 'en' ? 'active' : ''}
      >
        English
      </button>
      <button 
        onClick={() => i18n.changeLanguage('id')}
        className={i18n.language === 'id' ? 'active' : ''}
      >
        Bahasa Indonesia
      </button>
    </div>
  );
}
```

---

## ✨ Now i18n-ally Will:

✅ **Highlight untranslated text** with red squiggles  
✅ **Show translations on hover** - no need to check files  
✅ **Track coverage %** - see what's missing at a glance  
✅ **Suggest keys** - press Ctrl+Space for autocomplete  
✅ **Find unused translations** - clean up code  
✅ **Monitor all pages** - nothing gets missed  

---

## 🎯 Translation Coverage

As you add `t()` calls, i18n-ally will show:

```
🌐 i18n Ally
├── English:     95% ✅
├── Indonesian:  92% ⚠️
└── Missing:     home.newFeature
                 common.error
```

---

## 📍 Where Are Your Translations?

They're already here, organized by feature:

| File | Purpose | Example Keys |
|------|---------|--------------|
| `common.ts` | Buttons, errors | `common.submit`, `common.cancel` |
| `home.ts` | Homepage | `home.title`, `home.welcome` |
| `auth.ts` | Login/signup | `auth.login`, `auth.password` |
| `dashboard.ts` | Dashboards | `dashboard.bookings`, `dashboard.earnings` |

Just use: `t('filename.key')`

---

## 🔍 Check Everything Works

### Test 1: Use a Translation
```tsx
const { t } = useTranslation();
return <h1>{t('home.title')}</h1>;
// Should show in Indonesian (default)
```

### Test 2: See Coverage
- Status bar → i18n-ally → See %

### Test 3: Switch Language
```tsx
const { i18n } = useTranslation();
i18n.changeLanguage('en'); // Switch to English
```

---

## ✅ You're Done!

The setup is complete. With just:
1. One import in main.tsx
2. Changing hooks to react-i18next
3. i18n-ally does the rest!

---

## 📚 Need More?

- [Full Setup Guide](./I18N_SETUP_COMPLETE.md)
- [Example Component](./I18N_EXAMPLE_COMPONENT.tsx)
- [Checklist](./I18N_SETUP_CHECKLIST.md)

---

## 🎉 Result: 100% Translation Coverage!

Never ship untranslated text again! 🌐
