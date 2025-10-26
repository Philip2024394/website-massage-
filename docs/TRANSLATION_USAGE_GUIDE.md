# Translation Usage Guide

Quick reference for developers on how to use the auto-translation system in components.

---

## Basic Usage

### 1. Import the Hook
```typescript
import { useAutoTranslation } from '../hooks/useAutoTranslation';
import type { LanguageCode } from '../services/autoTranslationService';
```

### 2. Use in Component
```typescript
const MyComponent = ({ selectedLanguage }: { selectedLanguage: LanguageCode }) => {
    const { t, loading, error } = useAutoTranslation(selectedLanguage);
    
    return (
        <div>
            <h1>{t('myComponent.title', 'Welcome to My Component')}</h1>
            <p>{t('myComponent.description', 'This is a description')}</p>
            <button>{t('common.save', 'Save')}</button>
        </div>
    );
};
```

---

## Translation Function: `t(key, defaultText)`

### Parameters
- **`key`** (string, required): Unique identifier for the translation
  - Use dot notation for organization: `category.subcategory.item`
  - Examples: `booking.guestName`, `menu.categories`, `common.save`
  
- **`defaultText`** (string, optional): Fallback text (usually English)
  - Displayed immediately while translation loads
  - Used if translation fails
  - Auto-translated to other languages if key doesn't exist

### Naming Convention
```typescript
// ✅ GOOD: Organized, descriptive
t('booking.form.guestName', 'Guest Name')
t('hotel.dashboard.analytics', 'Analytics')
t('provider.card.rating', 'Rating')

// ❌ BAD: Flat, unclear
t('name', 'Name')
t('text1', 'Some text')
t('button', 'Click')
```

**Best Practice**: Use hierarchical keys that match your app structure:
```
booking.
  form.
    guestName
    roomNumber
    selectDate
  confirmation.
    success
    pending
menu.
  categories
  ingredients
  allergens
common.
  save
  cancel
  edit
  delete
```

---

## Examples by Use Case

### Form Labels
```typescript
<label>
    {t('booking.form.guestName', 'Guest Name')}
    <span className="text-red-500">*</span>
</label>
<input 
    placeholder={t('booking.form.guestNamePlaceholder', 'Enter your name')}
/>
```

### Button Text
```typescript
<button>
    {t('booking.actions.confirmBooking', 'Confirm Booking')}
</button>

<button onClick={handleCancel}>
    {t('common.cancel', 'Cancel')}
</button>
```

### Error Messages
```typescript
const [error, setError] = useState<string | null>(null);

// In validation
if (!guestName.trim()) {
    setError(t('booking.errors.nameRequired', 'Guest name is required'));
    return;
}

// In UI
{error && <div className="error">{error}</div>}
```

### Status Text
```typescript
const statusText = {
    pending: t('booking.status.pending', 'Pending'),
    confirmed: t('booking.status.confirmed', 'Confirmed'),
    completed: t('booking.status.completed', 'Completed'),
    cancelled: t('booking.status.cancelled', 'Cancelled')
};

<span>{statusText[booking.status]}</span>
```

### Dynamic Content
```typescript
// ✅ GOOD: Separate key for each variation
const durationText = selectedDuration === '60' 
    ? t('booking.duration.60min', '60 Minutes')
    : selectedDuration === '90'
    ? t('booking.duration.90min', '90 Minutes')
    : t('booking.duration.120min', '120 Minutes');

// ❌ BAD: String concatenation (breaks translations)
const text = t('duration', 'Duration:') + ' ' + selectedDuration + ' minutes';
```

### Lists (Days, Months, etc.)
```typescript
const days = [
    t('common.days.monday', 'Monday'),
    t('common.days.tuesday', 'Tuesday'),
    t('common.days.wednesday', 'Wednesday'),
    // ... etc
];

const months = [
    t('common.months.january', 'January'),
    t('common.months.february', 'February'),
    // ... etc
];
```

### Navigation
```typescript
const navItems = [
    { path: '/home', label: t('nav.home', 'Home') },
    { path: '/menu', label: t('nav.menu', 'Menu') },
    { path: '/bookings', label: t('nav.bookings', 'Bookings') },
    { path: '/profile', label: t('nav.profile', 'Profile') }
];
```

---

## Language Switching

### Option 1: Use Hook's Built-in State
```typescript
const LanguageSwitcher = () => {
    const { language, setLanguage } = useAutoTranslation();
    
    return (
        <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as LanguageCode)}
        >
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

### Option 2: Pass Language as Prop
```typescript
interface Props {
    selectedLanguage: LanguageCode;
    onLanguageChange: (lang: LanguageCode) => void;
}

const MyComponent = ({ selectedLanguage, onLanguageChange }: Props) => {
    const { t } = useAutoTranslation(selectedLanguage);
    
    return (
        <div>
            <h1>{t('title', 'Title')}</h1>
            <button onClick={() => onLanguageChange('zh')}>
                Switch to Chinese
            </button>
        </div>
    );
};
```

---

## Loading and Error States

### Handle Loading
```typescript
const { t, loading, error } = useAutoTranslation(language);

if (loading) {
    return <div>Loading translations...</div>;
}

if (error) {
    return <div>Error: {error}</div>;
}

return <div>{t('key', 'Default')}</div>;
```

**Note**: Usually you don't need loading states because `t()` returns default text immediately!

### Optimistic UI (Recommended)
```typescript
// ✅ Better: Show default text immediately, auto-updates when translation loads
const { t } = useAutoTranslation(language);

return (
    <div>
        {/* Renders "Welcome" immediately, updates to translation when ready */}
        <h1>{t('welcome', 'Welcome')}</h1>
    </div>
);
```

---

## Common Patterns

### Conditionally Rendered Text
```typescript
{isBookingConfirmed ? (
    <span className="text-green-600">
        {t('booking.status.confirmed', 'Confirmed')}
    </span>
) : (
    <span className="text-yellow-600">
        {t('booking.status.pending', 'Pending')}
    </span>
)}
```

### Pluralization
```typescript
// Simple approach
const reviewText = reviewCount === 1
    ? t('provider.reviewSingular', '1 Review')
    : t('provider.reviewPlural', `${reviewCount} Reviews`);

// Better: Separate keys
const getReviewText = (count: number) => {
    if (count === 0) return t('provider.reviews.none', 'No reviews');
    if (count === 1) return t('provider.reviews.one', '1 review');
    return t('provider.reviews.many', `${count} reviews`);
};
```

### Time/Date Formatting
```typescript
// ⚠️ Don't translate dates directly - use Intl API
const formattedDate = new Intl.DateTimeFormat(language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
}).format(new Date(booking.startTime));

// Then add translated label
<div>
    {t('booking.scheduledFor', 'Scheduled for')}: {formattedDate}
</div>
```

---

## Performance Tips

### 1. Reuse Common Translations
```typescript
// ✅ GOOD: Reuse common.save across all components
<button>{t('common.save', 'Save')}</button>

// ❌ BAD: Create duplicate keys
<button>{t('booking.saveButton', 'Save')}</button>
<button>{t('profile.saveButton', 'Save')}</button>
```

### 2. Pre-define Translation Keys
```typescript
// In a separate file: translationKeys.ts
export const TRANSLATION_KEYS = {
    BOOKING: {
        GUEST_NAME: 'booking.form.guestName',
        ROOM_NUMBER: 'booking.form.roomNumber',
        CONFIRM: 'booking.actions.confirm'
    },
    COMMON: {
        SAVE: 'common.save',
        CANCEL: 'common.cancel',
        EDIT: 'common.edit'
    }
} as const;

// In component
import { TRANSLATION_KEYS } from '../constants/translationKeys';

<button>{t(TRANSLATION_KEYS.COMMON.SAVE, 'Save')}</button>
```

### 3. Avoid Translation in Loops
```typescript
// ❌ BAD: Translates inside map (re-translates on every render)
{items.map(item => (
    <div key={item.id}>
        {t('item.label', 'Item')}: {item.name}
    </div>
))}

// ✅ GOOD: Translate once outside loop
const itemLabel = t('item.label', 'Item');
{items.map(item => (
    <div key={item.id}>
        {itemLabel}: {item.name}
    </div>
))}
```

---

## Testing Translations

### Manual Testing Checklist
1. ✅ Switch to each language and verify text appears
2. ✅ Check for layout breaking (long German/Russian words)
3. ✅ Verify right-to-left doesn't break UI (if adding Arabic/Hebrew later)
4. ✅ Test error messages in all languages
5. ✅ Confirm date/time formatting respects locale

### Debugging Tips
```typescript
// Add console logs to see what's happening
const { t } = useAutoTranslation(language);

console.log('Current language:', language);
console.log('Translation:', t('key', 'default'));

// Check if key exists in Appwrite
import { autoTranslationService } from '../services/autoTranslationService';

const checkTranslation = async () => {
    const translation = await autoTranslationService.getOrTranslate(
        'booking.guestName',
        'Guest Name'
    );
    console.log('Translation data:', translation);
};
```

---

## Migration Guide

### Converting Old Hardcoded Translations

**Before** (old way):
```typescript
const LANGUAGES = {
    en: { title: 'Welcome', save: 'Save' },
    id: { title: 'Selamat Datang', save: 'Simpan' }
};

const t = LANGUAGES[language];

<h1>{t.title}</h1>
<button>{t.save}</button>
```

**After** (new way):
```typescript
import { useAutoTranslation } from '../hooks/useAutoTranslation';

const { t } = useAutoTranslation(language);

<h1>{t('page.title', 'Welcome')}</h1>
<button>{t('common.save', 'Save')}</button>
```

**Benefits**:
- ✅ Supports 8 languages instead of 2
- ✅ Auto-translates missing keys
- ✅ Centralized in Appwrite (no code changes for translation updates)
- ✅ Allows manual refinement by non-developers

---

## Quick Reference Table

| Use Case | Code Example |
|----------|--------------|
| **Simple text** | `t('key', 'Default')` |
| **With variables** | `t('greeting', 'Hello')` + ` ${userName}` |
| **Button** | `<button>{t('common.save', 'Save')}</button>` |
| **Input placeholder** | `placeholder={t('form.namePlaceholder', 'Enter name')}` |
| **Conditional** | `condition ? t('yes', 'Yes') : t('no', 'No')` |
| **List item** | `['Mon', 'Tue'].map(day => t(\`days.\${day}\`, day))` |
| **Error message** | `setError(t('errors.required', 'Required'))` |
| **Language switch** | `setLanguage('zh' as LanguageCode)` |

---

## Support

### Common Questions

**Q: What if translation quality is poor?**
A: Use `updateManualTranslation()` to override with better text.

**Q: Can I use HTML in translations?**
A: No, translations are plain text. Use React components for formatting.

**Q: How do I handle plurals?**
A: Create separate keys for singular/plural (see Pluralization section).

**Q: What about currency formatting?**
A: Use `Intl.NumberFormat` for numbers/currency, then add translated label.

**Q: Can I nest translations?**
A: No, don't translate a translation. Use separate keys for complex content.

---

## Best Practices Summary

✅ **DO**:
- Use descriptive, hierarchical keys (`booking.form.guestName`)
- Provide default text for all translations
- Reuse common translations (`common.save`, `common.cancel`)
- Use `Intl` API for dates, times, and currencies
- Test in all 8 languages before deploying

❌ **DON'T**:
- Concatenate strings (`t('hello') + ' ' + userName`)
- Translate inside loops unnecessarily
- Use generic keys (`text1`, `button`)
- Hardcode language-specific content
- Forget to test with long translations (German/Russian)

---

Happy translating! 🌍🎉
