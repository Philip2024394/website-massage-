# 🔄 Extending Payment Flow to Massage & Facial Places

## ✅ COMPLETED: Therapist Dashboard

The "register first, pay when going live" flow is **fully implemented** for therapists with:
- Package detection from localStorage
- "Go Live" button with Pro/Plus logic
- Plus members: Profile LIVE first, then payment modal
- Payment modal can be closed to edit profile
- Persistent red banner reminder when payment pending
- 12:00 AM deadline warning
- All working perfectly ✅

## ✅ PARTIALLY COMPLETED: Massage Place

### Done:
- ✅ **MassagePlaceLoginPage.tsx** updated with:
  - Package detection from localStorage (lines 22-32)
  - Package info display in signup form
  - Star ratings (Pro: 3⭐, Plus: 5⭐)
  - Info messages about payment timing
  - Button text: "Create Account & Build Profile" for Plus members

### Still Needed:
- ⏳ **apps/place-dashboard/src/pages/PlaceDashboard.tsx** needs:
  - Add imports: `Star, Upload, X, CheckCircle` from lucide-react
  - Add state variables (after line 109):
    ```typescript
    const [selectedPackage, setSelectedPackage] = useState<{ plan: 'pro' | 'plus', selectedAt: string } | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
    const [uploadingPayment, setUploadingPayment] = useState(false);
    const [paymentPending, setPaymentPending] = useState(false);
    ```
  - Add package detection useEffect
  - Add handler functions: `handleGoLive()`, `handleProActivation()`, `handlePlusActivation()`, `handlePaymentProofChange()`, `handlePaymentSubmit()`
  - Add "Go Live" button UI section (before save button, conditional on `!place.isLive`)
  - Add payment modal JSX (at end of component)
  - Add payment reminder banner (when `paymentPending && !showPaymentModal`)
  - Add payment reminder button in header

## ⏳ TODO: Facial Place

### Files to Update:

#### 1. **pages/FacialPlaceLoginPage.tsx**
Same changes as MassagePlaceLoginPage:
- Add imports: `Star, CheckCircle`
- Add state: `selectedPackage`
- Add useEffect for package detection
- Add package info display in signup form
- Update submit button text for Plus members

#### 2. **apps/facial-dashboard/src/pages/FacialDashboard.tsx**
Same changes as needed for place dashboard:
- Add all the state variables
- Add all handler functions
- Add "Go Live" button UI
- Add payment modal
- Add reminder banner and button

## 📋 Implementation Steps for Each Dashboard

### Step 1: Add Imports
```typescript
import { Star, Upload, X, CheckCircle } from 'lucide-react';
```

### Step 2: Add State Variables (after existing useState declarations)
```typescript
// Package and payment state
const [selectedPackage, setSelectedPackage] = useState<{ plan: 'pro' | 'plus', selectedAt: string } | null>(null);
const [showPaymentModal, setShowPaymentModal] = useState(false);
const [paymentProof, setPaymentProof] = useState<File | null>(null);
const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
const [uploadingPayment, setUploadingPayment] = useState(false);
const [paymentPending, setPaymentPending] = useState(false);
```

### Step 3: Add Package Detection (near other useEffects)
```typescript
// Detect package from localStorage
useEffect(() => {
    try {
        const packageStr = localStorage.getItem('packageDetails');
        if (packageStr) {
            const pkg = JSON.parse(packageStr);
            setSelectedPackage(pkg);
            console.log('📦 Package detected:', pkg);
        }
    } catch (error) {
        console.error('❌ Error parsing package details:', error);
    }
}, []);
```

### Step 4: Add Handler Functions (after existing handlers)
Copy these from TherapistDashboard.tsx lines 451-563:
- `handleGoLive()`
- `handleProActivation()`
- `handlePlusActivation()`
- `handlePaymentProofChange()`
- `handlePaymentSubmit()`

**Important**: Replace `therapistService` with `placeService` (for place dashboard) or `facialService` (for facial dashboard)

### Step 5: Add "Go Live" Button Section
Add before the existing "Save Profile" button, conditional on `!place.isLive && selectedPackage`:
```jsx
{!place.isLive && selectedPackage && (
    // Copy from TherapistDashboard.tsx lines 969-1006
)}
```

### Step 6: Add Payment Reminder Banner
Add at the top of the main content area:
```jsx
{paymentPending && !showPaymentModal && place.isLive && (
    // Copy from TherapistDashboard.tsx lines 628-650
)}
```

### Step 7: Add Payment Modal
Add at the end of the component, before closing tags:
```jsx
{showPaymentModal && (
    // Copy from TherapistDashboard.tsx lines 1057-1211
)}
```

### Step 8: Add Payment Reminder Button in Header
Add next to existing header buttons:
```jsx
{paymentPending && !showPaymentModal && (
    <button 
        onClick={() => setShowPaymentModal(true)}
        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition-colors shadow-lg animate-pulse"
    >
        ⏰ Submit Payment (Due 12 AM)
    </button>
)}
```

## 🎯 Testing Checklist (For Each Portal)

### Massage Place Testing:
- [ ] Login page shows package info correctly
- [ ] Pro member: Click "Go Live" → Profile LIVE instantly
- [ ] Plus member: Click "Go Live" → Profile LIVE → Modal opens
- [ ] Payment modal shows 12 AM deadline
- [ ] Can close modal and edit profile
- [ ] Red banner shows when modal closed
- [ ] Header button opens modal again
- [ ] Payment upload works
- [ ] Profile stays LIVE after payment submission

### Facial Place Testing:
- [ ] Same checklist as above

## 📝 Notes

### Service Names:
- Therapist: Uses `therapistService`
- Massage Place: Uses `placeService` (from place dashboard)
- Facial Place: Uses `facialService` (from facial dashboard)

### Collection Names:
- Therapist: `COLLECTIONS.THERAPISTS`
- Massage Place: `COLLECTIONS.PLACES`
- Facial Place: `COLLECTIONS.FACIAL_PLACES`

### isLive Field:
All three use the same `isLive` boolean field in Appwrite.

### Bank Details:
Same for all portals:
- Bank: Bank Mandiri
- Account Name: PT IndaStreet Indonesia
- Account Number: 1370-0123-4567-890
- Amount: Rp 250,000

## 🚀 Quick Reference: Copy Sections from TherapistDashboard.tsx

| What to Copy | Lines | Where to Paste |
|--------------|-------|----------------|
| Imports | 13 (add Star, Upload, X, CheckCircle) | Top of file |
| State variables | 55-60 | After existing useState |
| Package detection | 62-71 | After existing useEffect |
| Handler functions | 451-563 | After existing handlers |
| "Go Live" section | 969-1006 | Before "Save Profile" button |
| Payment banner | 628-650 | Top of main content |
| Payment modal | 1057-1211 | End of component JSX |
| Header button | 613-620 | In header next to other buttons |

## ⚙️ Service Method Mapping

When copying handler functions, update these method calls:

```typescript
// Therapist version:
await therapistService.update(String(therapist.$id || therapist.id), {...});

// Massage Place version:
await placeService.update(String(place.$id || place.id), {...});

// Facial Place version:
await facialService.update(String(place.$id || place.id), {...});
```

## 🎨 UI Customization

Keep the same styling but adjust text labels:
- Therapist: "Therapist Dashboard"
- Massage Place: "Massage Spa Dashboard"  
- Facial Place: "Facial Spa Dashboard"

---

**Current Status**: 
- ✅ Therapist: 100% Complete
- ⚠️ Massage Place: 50% Complete (login done, dashboard pending)
- ⏳ Facial Place: 0% Complete (needs both login and dashboard)

**Estimated Time to Complete**: 
- Massage Place Dashboard: 30-45 minutes
- Facial Place (both files): 45-60 minutes
