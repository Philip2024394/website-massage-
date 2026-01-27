# 🎯 Shared Profiles Feature

**Simple, bulletproof sharing system for all provider types**

## 📋 Overview

This feature provides a **guaranteed working** share link system for:
- 🧘 **Therapists** - Individual massage therapists
- 🏢 **Massage Places** - Massage spas and salons
- 💆 **Facial Places** - Facial treatment centers

## ✨ Why This Approach?

### **OLD Way (Complex, Error-Prone):**
```
❌ /therapist-profile/676703b40009b9dd33de
❌ /therapist-profile/1-sarah-relaxation-specialist
❌ /therapist-profile/pijat-bali-surtiningsih-ubud
```
- Too many URL formats to handle
- Complex slug parsing logic
- Breaks when ID format changes
- Generates localhost URLs in dev

### **NEW Way (Simple, Reliable):**
```
✅ /share/therapist/1
✅ /share/place/5
✅ /share/facial/12
```
- **One simple format**
- **ID only** - no complex slugs
- **Always uses production URL** (`https://www.indastreetmassage.com`)
- **Works every time, guaranteed**

---

## 🚀 Usage

### **Generate Share URL**

```typescript
import { 
    generateTherapistShareURL,
    generatePlaceShareURL,
    generateFacialShareURL 
} from '@/features/shared-profiles';

// For therapist
const therapistURL = generateTherapistShareURL(therapist);
// Returns: https://www.indastreetmassage.com/share/therapist/123

// For massage place
const placeURL = generatePlaceShareURL(place);
// Returns: https://www.indastreetmassage.com/share/place/456

// For facial place
const facialURL = generateFacialShareURL(facialPlace);
// Returns: https://www.indastreetmassage.com/share/facial/789
```

### **In Component (TherapistCard example)**

```typescript
import { generateTherapistShareURL, generateShareText } from '@/features/shared-profiles';

function TherapistCard({ therapist }) {
    const handleShare = () => {
        const shareUrl = generateTherapistShareURL(therapist);
        const shareText = generateShareText(therapist.name, 'therapist', therapist.city);
        
        // Share on WhatsApp
        window.open(
            `https://wa.me/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`,
            '_blank'
        );
    };
    
    return (
        <button onClick={handleShare}>
            📱 Share on WhatsApp
        </button>
    );
}
```

---

## 📂 File Structure

```
features/shared-profiles/
├── index.ts                          # Main exports
├── SharedProfileLayout.tsx           # Common layout for all types
├── SharedTherapistProfile.tsx        # Therapist share page
├── SharedPlaceProfile.tsx            # Place share page
├── SharedFacialProfile.tsx           # Facial share page
├── hooks/
│   └── useSharedProfile.ts          # Universal profile loading hook
└── utils/
    └── shareUrlBuilder.ts           # URL generation & parsing
```

---

## 🎨 Features

### **1. Universal Layout**
- Consistent UI across all provider types
- Loading states
- Error states (profile not found)
- Call-to-action footer

### **2. SEO Optimized**
- Proper meta tags (title, description, OG tags)
- Canonical URLs
- Twitter cards
- JSON-LD structured data (coming soon)

### **3. Analytics Tracking**
- Automatic view tracking
- Share action tracking
- Session management

### **4. Share Options**
- WhatsApp (most popular in Indonesia)
- Copy to clipboard (with fallback for old browsers)
- Easy to add more platforms (Facebook, Telegram, etc.)

---

## 🔌 Integration

### **Step 1: Update Your Router**

Already done in `router/routes/profileRoutes.tsx`:

```typescript
export const profileRoutes = {
  shareTherapist: {
    path: '/share/therapist/:id',
    component: SharedTherapistProfile,
  },
  sharePlace: {
    path: '/share/place/:id',
    component: SharedPlaceProfile,
  },
  shareFacial: {
    path: '/share/facial/:id',
    component: SharedFacialProfile,
  }
};
```

### **Step 2: Use in Your Cards**

In [TherapistCard.tsx](../../components/TherapistCard.tsx):

```typescript
import { generateTherapistShareURL } from '@/features/shared-profiles';

// In your share button handler:
const shareUrl = generateTherapistShareURL(therapist);
```

In [MassagePlaceCard.tsx](../../components/MassagePlaceCard.tsx):

```typescript
import { generatePlaceShareURL } from '@/features/shared-profiles';

const shareUrl = generatePlaceShareURL(place);
```

In [FacialPlaceCard.tsx](../../components/FacialPlaceCard.tsx):

```typescript
import { generateFacialShareURL } from '@/features/shared-profiles';

const shareUrl = generateFacialShareURL(facialPlace);
```

---

## ✅ Benefits

| Feature | Old System | New System |
|---------|-----------|------------|
| URL Complexity | Multiple formats | One simple format |
| Works on Live | ❌ Sometimes | ✅ Always |
| Code Maintenance | 😰 Complex | 😊 Simple |
| File Size | ~300 lines | ~150 lines per type |
| Reusability | ❌ Duplicate code | ✅ Shared components |
| Error Handling | ⚠️ Basic | ✅ Comprehensive |
| SEO | ⚠️ Partial | ✅ Complete |

---

## 🐛 Troubleshooting

### **Link doesn't work when shared**
✅ **Fixed!** URLs always use `https://www.indastreetmassage.com` - never localhost

### **Profile not found**
✅ **Fixed!** Better error messages + fallback to homepage

### **Complex slug parsing**
✅ **Fixed!** Only uses simple numeric IDs

### **Can't find therapist**
Check:
1. Is the ID correct in the URL?
2. Is the therapist in the `therapists` array?
3. Check browser console for debug logs

---

## 🎯 Next Steps

### **Phase 1: Basic (Done ✅)**
- [x] Create shared profile feature
- [x] Simple URL format
- [x] Universal hook
- [x] Layout component

### **Phase 2: Enhancement (Optional)**
- [ ] Add more share platforms (Facebook, Telegram, Line)
- [ ] QR code generation for offline sharing
- [ ] Share history tracking
- [ ] Referral rewards integration

### **Phase 3: Advanced (Future)**
- [ ] A/B testing different share messages
- [ ] Deep linking for mobile app
- [ ] Share preview customization per provider

---

## 📚 API Reference

### **generateTherapistShareURL(therapist)**
Generates share URL for a therapist.

**Returns:** `string` - Full URL like `https://www.indastreetmassage.com/share/therapist/123`

### **generatePlaceShareURL(place)**
Generates share URL for a massage place.

### **generateFacialShareURL(place)**
Generates share URL for a facial place.

### **generateShareText(name, type, city?)**
Generates shareable text for social media.

**Returns:** `string` - Pre-formatted share message

### **extractProviderIdFromURL(url)**
Extracts provider ID and type from any URL format.

**Returns:** `{ id: string, type: 'therapist' | 'place' | 'facial' | null }`

### **copyShareURLToClipboard(url)**
Copies URL to clipboard with browser fallback.

**Returns:** `Promise<boolean>` - Success status

---

## 💡 Tips

1. **Always use the URL generators** - Don't manually construct URLs
2. **Test on live site** - Share links only work properly on production domain
3. **Keep it simple** - Resist adding complex slug patterns
4. **Monitor analytics** - Track which providers get most shares

---

**Created:** December 21, 2025  
**Last Updated:** December 21, 2025  
**Maintainer:** Development Team
