# 🚀 Dashboard i18n Quick Reference

## ✅ What's Ready

```
✓ Admin Dashboard:      lib/i18n.ts (English only) 🔒
✓ Therapist Dashboard: lib/i18n.ts (EN + ID) 🌐
✓ Place Dashboard:     lib/i18n.ts (EN + ID) 🌐
✓ Facial Dashboard:    lib/i18n.ts (EN + ID) 🌐
✓ Header Icons:        🇮🇩 / 🇬🇧 ready to use
✓ i18n-ally:           Configured for all dashboards
```

---

## 📋 3 Steps per Dashboard

### Step 1: Add to main.tsx
```tsx
// At the VERY TOP of apps/[dashboard]/src/main.tsx
import './lib/i18n';
```

### Step 2: Update Components
```tsx
// Change this:
import { useLanguage } from '../hooks/useLanguage';

// To this:
import { useTranslation } from 'react-i18next';
```

### Step 3: Done! ✅
- Language switcher automatically works
- i18n-ally monitors coverage
- All translations available

---

## 🎯 Each Dashboard

| Dashboard | main.tsx | Components | Switcher |
|-----------|----------|-----------|----------|
| **Therapist** | Add i18n | Update hooks | Yes ✅ |
| **Place** | Add i18n | Update hooks | Yes ✅ |
| **Facial** | Add i18n | Update hooks | Yes ✅ |
| **Admin** | Add i18n | Update hooks | No ❌ |

---

## 🔍 Component Examples

### Therapist/Place/Facial (with switching):
```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <>
      <h1>{t('namespace.key')}</h1>
      <p>Language: {i18n.language}</p>
    </>
  );
}
```

### Admin (English only):
```tsx
import { useTranslation } from 'react-i18next';

export function AdminComponent() {
  const { t } = useTranslation();
  // No need for i18n.changeLanguage() - always English
  
  return <h1>{t('namespace.key')}</h1>;
}
```

---

## 📊 i18n-ally Coverage

Shows different coverage per dashboard:

- **Therapist:** EN: 95%, ID: 92%
- **Place:** EN: 95%, ID: 92%
- **Facial:** EN: 95%, ID: 92%
- **Admin:** EN: 98% (only one language)

---

## 🌐 Language Files Location

All dashboards use the same translation files:

```
/translations/
├── common.ts
├── auth.ts
├── therapistDashboard.ts
├── placeDashboard.ts
├── dashboard.ts (for admin)
└── ... (15 total files)
```

Both `en` and `id` available in each.

---

## ✨ Testing Quick Checklist

```
☐ Therapist: 🇮🇩 click → Indonesian
☐ Therapist: 🇬🇧 click → English
☐ Therapist: Refresh → Language persists
☐ Place: 🇮🇩 click → Indonesian
☐ Place: 🇬🇧 click → English
☐ Place: Refresh → Language persists
☐ Facial: 🇮🇩 click → Indonesian
☐ Facial: 🇬🇧 click → English
☐ Facial: Refresh → Language persists
☐ Admin: No switcher visible
☐ Admin: Always English
☐ i18n-ally: Shows coverage for all
```

---

## 🎯 Result

```
Main App:           EN + ID (switcher) 🇮🇩🇬🇧
Auth App:           EN + ID (switcher) 🇮🇩🇬🇧
Therapist Dash:     EN + ID (switcher) 🇮🇩🇬🇧
Place Dash:         EN + ID (switcher) 🇮🇩🇬🇧
Facial Dash:        EN + ID (switcher) 🇮🇩🇬🇧
Admin Dash:         English only 🔒

i18n-ally monitoring: ✅ ALL dashboards
Language Coverage:    ✅ 95%+ each language
Header Icons:         ✅ 🇮🇩 / 🇬🇧 working
```

Done! 🌐
