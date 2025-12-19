# Massage Type Images Reference

## 📸 How to Add Image URLs for Massage Types

This document explains how to add and manage image URLs for different massage types in the application.

---

## 🎯 Current Setup

**File**: `constants.ts`

The massage types are now configured with an image URL structure:

```typescript
export const MASSAGE_TYPES_WITH_IMAGES: MassageTypeWithImage[] = [
    { 
        name: 'Swedish Massage', 
        imageUrl: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia.png?updatedAt=1759648341961' 
    },
    { 
        name: 'Deep Tissue Massage', 
        imageUrl: '' // Add URL when available
    },
    // ... more types
];
```

---

## ✅ Already Added

| Massage Type | Image URL | Status |
|--------------|-----------|--------|
| Swedish Massage | `https://ik.imagekit.io/7grri5v7d/massage%20indonesia.png?updatedAt=1759648341961` | ✅ Added |

---

## ⏳ Pending (Need Images)

### Western Massages
- [ ] Deep Tissue Massage
- [ ] Sports Massage
- [ ] Hot Stone Massage
- [ ] Aromatherapy Massage

### Eastern & Indonesian Massages
- [ ] Balinese Massage
- [ ] Javanese Massage
- [ ] Thai Massage
- [ ] Shiatsu Massage
- [ ] Reflexology
- [ ] Acupressure
- [ ] Lomi Lomi Massage

### Traditional Indonesian Techniques
- [ ] Kerokan (Coin Rub)
- [ ] Jamu Massage

### Specialty Massages
- [ ] Prenatal Massage
- [ ] Lymphatic Massage
- [ ] Indian Head Massage

---

## 📝 How to Add New Image URLs

### Step 1: Upload Image to ImageKit
1. Go to your ImageKit.io account
2. Upload the massage type image
3. Copy the image URL

### Step 2: Update constants.ts

Open `constants.ts` and find the massage type in `MASSAGE_TYPES_WITH_IMAGES` array:

```typescript
// BEFORE:
{ 
    name: 'Balinese Massage', 
    imageUrl: '' // Add URL when available
},

// AFTER:
{ 
    name: 'Balinese Massage', 
    imageUrl: 'https://ik.imagekit.io/7grri5v7d/balinese-massage.png?updatedAt=...' 
},
```

### Step 3: Save and Test
- Save the file
- The changes will hot-reload in your dev server
- Images will appear wherever massage types are displayed

---

## 🔍 Where Images Are Used

The `getMassageTypeImage()` helper function can be used anywhere to retrieve images:

```typescript
import { getMassageTypeImage } from '../constants';

const imageUrl = getMassageTypeImage('Swedish Massage');
// Returns: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia.png?updatedAt=1759648341961'
```

### Current Usage Locations:
1. **MassageTypesPage** - Displays all massage types with images
2. **HomePage** - Shows popular massage types
3. **TherapistCard** - Shows therapist's massage specialties
4. **PlaceDetailPage** - Displays services offered
5. **Job Posting Pages** - Shows required massage skills

---

## 🎨 Image Guidelines

### Recommended Image Specs:
- **Format**: PNG or JPG
- **Size**: 800x600px or 1200x900px (4:3 ratio)
- **File Size**: Under 500KB for fast loading
- **Quality**: High resolution for clear display
- **Style**: Professional, clean, consistent across all types

### ImageKit URL Format:
```
https://ik.imagekit.io/[YOUR_ID]/[IMAGE_NAME].[extension]?updatedAt=[TIMESTAMP]
```

---

## 📊 Progress Tracker

**Total Massage Types**: 18  
**Images Added**: 1 (Swedish Massage) ✅  
**Images Pending**: 17 ⏳  
**Completion**: 5.6%

---

## 🚀 Quick Add Template

Copy and paste this template when adding new images:

```typescript
{ 
    name: '[MASSAGE TYPE NAME]', 
    imageUrl: 'https://ik.imagekit.io/7grri5v7d/[IMAGE_NAME].[ext]?updatedAt=[TIMESTAMP]' 
},
```

**Example**:
```typescript
{ 
    name: 'Deep Tissue Massage', 
    imageUrl: 'https://ik.imagekit.io/7grri5v7d/deep-tissue-massage.png?updatedAt=1759648400000' 
},
```

---

## 💡 Tips

1. **Use Descriptive Names**: Name your images clearly (e.g., `swedish-massage.png`, `hot-stone-massage.jpg`)

2. **URL Encoding**: Special characters in URLs are automatically encoded (e.g., spaces become `%20`)

3. **ImageKit Features**: You can use ImageKit transformations:
   - Resize: `?tr=w-400,h-300`
   - Quality: `?tr=q-80`
   - Format: `?tr=f-webp`

4. **Fallback**: If `imageUrl` is empty, the app can display a placeholder or just show the text name

5. **Bulk Upload**: Upload all images at once to ImageKit, then update the constants file

---

## 🔧 Helper Function Usage

### Get Image URL by Massage Type:
```typescript
import { getMassageTypeImage } from './constants';

const swedishImage = getMassageTypeImage('Swedish Massage');
// Returns: 'https://ik.imagekit.io/7grri5v7d/massage%20indonesia.png?updatedAt=1759648341961'

const unknownImage = getMassageTypeImage('Unknown Massage');
// Returns: '' (empty string)
```

### Check if Image Exists:
```typescript
const hasImage = getMassageTypeImage('Swedish Massage') !== '';
// Returns: true

const noImage = getMassageTypeImage('Deep Tissue Massage') === '';
// Returns: true (no image added yet)
```

---

## 📅 Next Steps

1. ✅ Add Swedish Massage image - **DONE**
2. ⏳ Upload remaining 17 massage type images to ImageKit
3. ⏳ Update `MASSAGE_TYPES_WITH_IMAGES` array with new URLs
4. ⏳ Test images display correctly across all pages
5. ⏳ Optimize images for web (compress, resize, format conversion)

---

**Last Updated**: October 28, 2025  
**Total Types**: 18  
**Images Added**: 1  
**Status**: 🟡 In Progress
