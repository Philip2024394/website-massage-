# Filter Page (Advanced Search) - STRUCTURE & LOGIC LOCK 🔒

**Date Locked:** February 8, 2026  
**Status:** FINAL - NO MODIFICATIONS ALLOWED  
**File:** `src/pages/AdvancedSearchPage.tsx`  
**Component:** AdvancedSearchPage

---

## 🚨 CRITICAL LOCK STATEMENT

This Filter Page is now considered **FINAL and LOCKED** in terms of:
- **Structure** - Component layout and DOM hierarchy
- **Logic** - Data flow, state management, and filter behavior
- **UI Layout** - Spacing, grouping, ordering, and styling
- **Filter Fields** - Types, options, and definitions

---

## What Users MAY DO ✅

Users are **ONLY** allowed to:
- ✅ Select filter fields (e.g., choose a city, select massage type)
- ✅ Change filter values (e.g., change gender from "All" to "Female")
- ✅ Apply filters by clicking "Search Therapists" button
- ✅ Clear selections by clicking "Cancel" button
- ✅ Change language between English and Indonesian

**Filters must continue to:**
- Update results dynamically or on apply (existing behavior)
- Respect current booking, location, and availability logic
- Sync with CityContext when city is selected
- Reset area when city changes

---

## What is STRICTLY FORBIDDEN ❌

You **MUST NOT**:

### Structure Modifications
- ❌ Add new filter fields
- ❌ Remove existing filter fields
- ❌ Rename filter fields or labels
- ❌ Reorder filters (current order is locked)
- ❌ Change filter grouping or sections
- ❌ Modify component hierarchy

### Logic Modifications
- ❌ Change filter logic or query behavior
- ❌ Modify how filters affect search, listings, or results
- ❌ Alter state management structure
- ❌ Change filter value types or options

### UI/UX Modifications
- ❌ Change UI layout, spacing, or grouping
- ❌ Modify styling classes or design system values
- ❌ Alter button positions or actions
- ❌ Change header/footer components
- ❌ Modify visual hierarchy

### Data Integrity Violations
- ❌ Override location logic (GPS system must remain authoritative)
- ❌ Override Set Location coordinates
- ❌ Override availability rules
- ❌ Bypass booking flow validation

---

## Filter Page Architecture (LOCKED STRUCTURE)

### File Location
```
src/pages/AdvancedSearchPage.tsx
```

### Dependencies (DO NOT MODIFY)
```typescript
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FloatingPageFooter from '../components/FloatingPageFooter';
import CityLocationDropdown from '../components/CityLocationDropdown';
import AreaFilter from '../components/AreaFilter';
import { useCityContext } from '../context/CityContext';
```

### Props Interface (LOCKED)
```typescript
interface AdvancedSearchPageProps {
    t: any;                              // Translation object
    language?: 'en' | 'id';              // Language code
    onNavigate?: (page: string) => void; // Navigation handler
}
```

---

## Filter Fields Inventory (LOCKED DEFINITIONS)

### 1. **City Location Filter** 🏙️ (PRIMARY FILTER)
- **Type:** CityLocationDropdown component
- **State:** `selectedCity: string`
- **Default:** `contextCity || 'all'`
- **Options:** All Indonesian cities (from CityLocationDropdown)
- **Special Behavior:**
  - Syncs with CityContext when not 'all'
  - Resets `selectedArea` when changed
  - Shows AreaFilter when city is selected (not 'all')
- **Labels:**
  - EN: "📍 City Location"
  - ID: "📍 Lokasi Kota"
- **Placeholder:**
  - EN: "🇮🇩 All Indonesia"
  - ID: "🇮🇩 Semua Indonesia"
- **Helper Text:**
  - EN: "💡 Filter therapists and places by city"
  - ID: "💡 Filter terapis dan tempat berdasarkan kota"

### 2. **Area Filter** 📍 (SUB-FILTER)
- **Type:** AreaFilter component
- **State:** `selectedArea: string | null`
- **Visibility:** Only shown when `selectedCity !== 'all'`
- **Default:** `null`
- **Container:** Orange highlighted box (`bg-orange-50 border-orange-200`)
- **Labels:**
  - EN: "📍 Areas in {selectedCity}"
  - ID: "📍 Area dalam {selectedCity}"
- **Behavior:** Dynamically loads areas based on selected city

### 3. **Massage Type** 💆
- **Type:** `<select>` dropdown
- **State:** `filters.massageType: string`
- **Default:** `''` (empty = all types)
- **Options:** (19 total massage types)
  ```
  '' - All Massage Types / Semua Jenis Pijat
  'balinese' - Balinese Massage / Pijat Bali
  'aromatherapy' - Aromatherapy Massage / Pijat Aromaterapi
  'deep-tissue' - Deep Tissue Massage / Pijat Deep Tissue
  'swedish' - Swedish Massage / Pijat Swedish
  'thai' - Thai Massage / Pijat Thai
  'sports' - Sports Massage / Pijat Olahraga
  'shiatsu' - Shiatsu Massage / Pijat Shiatsu
  'hot-stone' - Hot Stone Massage / Pijat Batu Panas
  'reflexology' - Reflexology Massage / Pijat Refleksi
  'pregnancy' - Pregnancy Massage / Pijat Kehamilan
  'couples' - Couples Massage / Pijat Pasangan
  'head-shoulder' - Head & Shoulder Massage / Pijat Kepala & Bahu
  'foot-massage' - Foot Massage / Pijat Kaki
  'facial-massage' - Facial Massage / Pijat Wajah
  'lymphatic-drainage' - Lymphatic Drainage / Drainase Limfatik
  'traditional-javanese' - Traditional Javanese Massage / Pijat Tradisional Jawa
  'acupressure' - Acupressure Massage / Pijat Akupresur
  'cupping-massage' - Cupping Massage / Pijat Bekam
  'body-scrub' - Body Scrub & Massage / Lulur & Pijat
  ```
- **Labels:**
  - EN: "Massage Type"
  - ID: "Jenis Pijat"

### 4. **Therapist Gender** 👤
- **Type:** Radio buttons (3 options)
- **State:** `filters.gender: string`
- **Default:** `''` (empty = all)
- **Options:**
  ```
  '' - All / Semua (no icon)
  'female' - Female / Wanita (pink circle: bg-pink-500)
  'male' - Male / Pria (blue circle: bg-blue-500)
  ```
- **Labels:**
  - EN: "Therapist Gender"
  - ID: "Gender Terapis"
- **Visual:** Colored circles next to Female/Male options

### 5. **Client Specialization** 👥
- **Type:** `<select>` dropdown
- **State:** `filters.clientType: string`
- **Default:** `''` (empty = all clients)
- **Options:** (8 client specializations)
  ```
  '' - All Clients / Semua Klien
  'women' - Women Only / Khusus Wanita
  'men' - Men Only / Khusus Pria
  'children' - Children Only / Khusus Anak-anak
  'pregnant' - Pregnant Women Only / Khusus Ibu Hamil
  'couples' - Couples / Pasangan
  'families' - Families / Keluarga
  'elderly' - Elderly / Lansia
  ```
- **Labels:**
  - EN: "Client Specialization"
  - ID: "Spesialisasi Klien"
- **Helper Text:**
  - EN: "💡 Therapists experienced with specific client groups"
  - ID: "💡 Terapis yang berpengalaman dengan kelompok klien tertentu"

### 6. **Price Range** 💰
- **Type:** `<select>` dropdown
- **State:** `filters.priceRange: string`
- **Default:** `''` (empty = all ranges)
- **Options:** (6 price tiers)
  ```
  '' - All Price Ranges / Semua Rentang Harga
  '0-150000' - Rp 0 - 150,000 (Budget/Ekonomis)
  '150000-300000' - Rp 150,000 - 300,000 (Standard/Standar)
  '300000-500000' - Rp 300,000 - 500,000 (Premium)
  '500000-750000' - Rp 500,000 - 750,000 (VIP)
  '750000-1000000' - Rp 750,000 - 1,000,000 (Luxury)
  '1000000+' - Rp 1,000,000+ (Elite)
  ```
- **Labels:**
  - EN: "Price Range"
  - ID: "Rentang Harga"
- **Helper Text:**
  - EN: "💡 Prices for 60-minute sessions"
  - ID: "💡 Harga untuk sesi 60 menit"

### 7. **Availability** ⏰
- **Type:** `<select>` dropdown
- **State:** `filters.availability: string`
- **Default:** `''` (empty = anytime)
- **Options:** (5 availability options)
  ```
  '' - Anytime / Kapan Saja
  'now' - Available Now / Sekarang
  'today' - Today / Hari Ini
  'tomorrow' - Tomorrow / Besok
  'thisweek' - This Week / Minggu Ini
  ```
- **Labels:**
  - EN: "Availability"
  - ID: "Ketersediaan"

### 8. **Experience** 🎓
- **Type:** `<select>` dropdown
- **State:** `filters.experience: string`
- **Default:** `''` (empty = all levels)
- **Options:** (5 experience levels)
  ```
  '' - All Levels / Semua Level
  '1' - 1+ Years / 1+ Tahun
  '3' - 3+ Years / 3+ Tahun
  '5' - 5+ Years / 5+ Tahun
  '10' - 10+ Years / 10+ Tahun
  ```
- **Labels:**
  - EN: "Minimum Experience"
  - ID: "Pengalaman Minimum"

### 9. **SafePass Verified** 🏨
- **Type:** Checkbox
- **State:** `filters.safePass: boolean`
- **Default:** `false`
- **Container:** Blue highlighted box (`bg-blue-50 border-blue-200`)
- **Icon:** Hotel image (`hotel%205.png`)
- **Labels:**
  - EN: "SafePass Verified"
  - ID: "SafePass Terverifikasi"
- **Description:**
  - EN: "Therapists certified for hotels, villas & public places"
  - ID: "Terapis dengan sertifikasi hotel, villa & tempat umum"

---

## State Structure (LOCKED)

### Filter State Object
```typescript
const [filters, setFilters] = useState({
    massageType: '',           // Massage type value key
    gender: '',                // 'female' | 'male' | ''
    clientType: '',            // Client specialization key
    priceRange: '',            // Price range key
    rating: '',                // ⚠️ UNUSED (not implemented in UI)
    availability: '',          // Availability time key
    experience: '',            // Minimum years as string
    safePass: false,           // Boolean checkbox
    specialties: [] as string[] // ⚠️ UNUSED (not implemented in UI)
});
```

### Additional State Variables
```typescript
const [isMenuOpen, setIsMenuOpen] = useState(false);
const [currentLanguage, setCurrentLanguage] = useState<'en' | 'id'>(language || 'en');
const { city: contextCity, setCity } = useCityContext();
const [selectedCity, setSelectedCity] = useState<string>(contextCity || 'all');
const [selectedArea, setSelectedArea] = useState<string | null>(null);
```

---

## UI Component Hierarchy (LOCKED ORDER)

```
<div> // Root container
  ├── <UniversalHeader />
  │   └── Language toggle + Burger menu
  │
  ├── <div> // Content container (max-w-4xl)
  │   ├── <button> // Back arrow (orange circle)
  │   ├── <div> // Hero section
  │   │   ├── <img> Location image
  │   │   ├── <h2> "Advanced Search" title
  │   │   └── <p> Subtitle text
  │   │
  │   └── <div> // White card (rounded-2xl shadow-lg)
  │       ├── [1] City Location Filter (CityLocationDropdown)
  │       ├── [2] Area Filter (conditional: selectedCity !== 'all')
  │       ├── <div> // Verified Members Header
  │       │   ├── <h3> + Verified badge icon
  │       │   └── <p> Description
  │       ├── <div> // Filters container (space-y-6)
  │       │   ├── [3] Massage Type (select)
  │       │   ├── [4] Therapist Gender (radio)
  │       │   ├── [5] Client Specialization (select)
  │       │   ├── [6] Price Range (select)
  │       │   ├── [7] Availability (select)
  │       │   ├── [8] Experience (select)
  │       │   ├── [9] SafePass Verified (checkbox in blue box)
  │       │   └── <div> // Action buttons
  │       │       ├── <button> Search Therapists (orange)
  │       │       └── <button> Cancel (gray)
  │
  ├── <FloatingPageFooter />
  └── <AppDrawer />
```

**🔒 CRITICAL:** This order MUST NOT be changed. Filter sequence affects user experience and has been optimized for conversion.

---

## Event Handlers (LOCKED BEHAVIOR)

### City Change Handler
```typescript
// When city changes:
onCityChange={(newCity) => {
    console.log('🏙️ City changed in advanced search:', newCity);
    setSelectedCity(newCity);
    
    // Sync with CityContext if not 'all'
    if (newCity !== 'all') {
        setCity(newCity);
    }
    
    // CRITICAL: Reset area when city changes
    setSelectedArea(null);
}}
```

**Lock Rule:** Area MUST reset when city changes to prevent invalid city-area combinations.

### Search Handler
```typescript
const handleSearch = () => {
    // Implement search logic here
    console.log('Searching with filters:', filters);
    onNavigate?.('home');
};
```

**Current Behavior:** Logs filters and navigates to home. Search implementation must respect this navigation flow.

### Filter Update Pattern
```typescript
// Standard filter update (for all <select> and <input> elements):
onChange={(e) => setFilters({ ...filters, [fieldName]: e.target.value })}

// Checkbox update:
onChange={(e) => setFilters({ ...filters, safePass: e.target.checked })}
```

**Lock Rule:** All filter updates MUST use object spread syntax. Direct mutation is forbidden.

---

## Visual Design System (LOCKED STYLES)

### Container Styles
- **Root:** `min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white`
- **Content:** `max-w-4xl mx-auto px-4 py-8 pt-20`
- **Card:** `bg-white rounded-2xl p-6 shadow-lg`

### Button Styles
- **Back Button:** `w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg`
- **Search Button:** `flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600`
- **Cancel Button:** `px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300`

### Special Containers
- **Area Filter Box:** `p-4 bg-orange-50 rounded-xl border-2 border-orange-200`
- **SafePass Box:** `bg-blue-50 rounded-xl p-4 border-2 border-blue-200`

### Input Elements
- **Selects:** `w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`
- **Radio Inputs:** Standard browser styling with margin adjustments
- **Checkbox:** `w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mr-3`

**🔒 CRITICAL:** These Tailwind classes are LOCKED. No design system changes permitted.

---

## Data Integrity Rules (NON-NEGOTIABLE)

### Location Logic Protection
1. **GPS Authority:** Filter results MUST respect GPS-derived locations
   - City selection in filter is for **search filtering only**
   - Provider location coordinates remain authoritative
   - No filter can override actual GPS data

2. **GPS Consistency:** Filtered therapists/places MUST have:
   - Valid GPS coordinates
   - City derived from coordinates via `deriveLocationIdFromGeopoint()`
   - No manual city overrides

### Booking Flow Protection
3. **Booking Data:** Filter selections MUST NOT:
   - Modify booking payload structure
   - Bypass booking validation rules
   - Override pricing calculations
   - Alter commission calculations

### Availability Protection
4. **Availability Rules:** Availability filter MUST NOT:
   - Override therapist `islive` status
   - Bypass "Available Now" validation
   - Ignore therapist-set availability windows
   - Show offline providers as available

### Search Integrity
5. **Search Results:** Filter application MUST:
   - Query actual database state
   - Respect provider visibility rules (islive, SafePass status)
   - Honor GPS proximity calculations
   - Apply all active filters with AND logic (not OR)

---

## Non-Regression Requirements

### Critical Flows That Must NOT Break

1. **Booking Flow**
   - Users can still book from filtered results
   - Booking data includes correct location coordinates
   - Pricing reflects actual therapist rates
   - Commission calculations remain accurate

2. **Pricing Logic**
   - Price range filter shows providers within range
   - Displayed prices match actual booking prices
   - No filter can cause price discrepancies

3. **Therapist/Place Visibility**
   - Only verified/live providers appear in results
   - SafePass filter correctly shows certified providers
   - Location-based visibility rules still apply

4. **Search Functionality**
   - Basic search (non-filter) still works
   - Filter results complement basic search
   - Combined search+filter queries work correctly

### Existing Saved Filters
- **Requirement:** If users have saved filter preferences (localStorage/backend), they MUST continue to work
- **Validation:** Test with pre-existing saved filter data after any changes

---

## Lock Enforcement Rules 🔒

### Change Request Protocol

**Any request to:**
- Update
- Optimize
- Redesign
- Refactor
- Simplify
- Enhance
- Add features
- Remove features
- Reorder elements

**MUST:**
1. **🛑 STOP IMMEDIATELY** - Do not proceed with implementation
2. **📋 Document Request** - Write down exact change requested
3. **🔍 Review Impact** - Assess which locked sections are affected
4. **✋ Request Approval** - Obtain explicit written approval from stakeholder
5. **📝 Update Lock File** - If approved, update this document with new locked state
6. **✅ Re-validate** - Run full regression test suite after changes

### Emergency Override Clause
If a critical production bug requires Filter Page modification:
1. Document bug with severity assessment
2. Propose minimal fix that preserves structure
3. Get approval for emergency change
4. Implement fix with detailed comments
5. Update this lock file immediately
6. Schedule proper fix for next release

---

## Testing Requirements

### Before Deployment (Mandatory Checklist)

**Filter Functionality:**
- [ ] All 9 filters can be selected/changed
- [ ] City change resets area selection
- [ ] Area filter only shows when city is selected
- [ ] Search button navigates to home
- [ ] Cancel button navigates to home
- [ ] Language toggle works for all labels

**State Management:**
- [ ] Filter state persists during interaction
- [ ] City context syncs correctly
- [ ] No console errors on state updates
- [ ] Filter object logs correctly on search

**Non-Regression:**
- [ ] Booking flow works from filtered results
- [ ] GPS location system unaffected
- [ ] Pricing displays correctly
- [ ] Availability rules respected
- [ ] SafePass filter works correctly

**Visual Integrity:**
- [ ] Mobile responsive (tested on 3 screen sizes)
- [ ] Desktop layout correct
- [ ] All icons load correctly
- [ ] Styling matches locked design
- [ ] No layout shifts on interaction

---

## Related Documentation

- **GPS_ONLY_LOCATION_IMPLEMENTATION_COMPLETE.md** - GPS coordinate system
- **BOOKING_FLOW_LOCKED.md** - Booking data flow rules
- **CORE_SYSTEM_LOCK.md** - Overall architecture constraints
- **BUSINESS_LOGIC_HARD_LOCK.md** - Business rule enforcement

---

## Version Control

### Current Locked Version
- **File:** `src/pages/AdvancedSearchPage.tsx`
- **Last Modified:** Check Git history
- **Lines:** 370 total lines
- **Locked Date:** February 8, 2026

### Change Log
| Date | Change Type | Approved By | Description |
|------|-------------|-------------|-------------|
| Feb 8, 2026 | INITIAL LOCK | System | Filter Page structure and logic locked |

---

## Appendix: Code Patterns

### Adding a Filter Value (IF APPROVED)
```typescript
// 1. Add to state interface (existing filters object)
const [filters, setFilters] = useState({
    // ... existing filters
    newField: '',  // Add new field
});

// 2. Add UI element (respecting locked order - insert at approved position)
<div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        {currentLanguage === 'id' ? 'Label ID' : 'Label EN'}
    </label>
    <select
        value={filters.newField}
        onChange={(e) => setFilters({ ...filters, newField: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
    >
        <option value="">Default Option</option>
        {/* Add options */}
    </select>
</div>

// 3. Update this LOCK file with new field documentation
```

### Reading Current Filter State
```typescript
// To access current filters:
console.log('Current filters:', filters);
console.log('Current city:', selectedCity);
console.log('Current area:', selectedArea);

// To check if any filters are active:
const hasActiveFilters = Object.values(filters).some(val => 
    val !== '' && val !== false && (!Array.isArray(val) || val.length > 0)
) || selectedCity !== 'all' || selectedArea !== null;
```

### Filter Validation Pattern
```typescript
// Before applying filters to search:
const validateFilters = () => {
    // Ensure city-area consistency
    if (selectedArea && !selectedCity) {
        console.error('Invalid state: area selected without city');
        setSelectedArea(null);
    }
    
    // Ensure price range format
    if (filters.priceRange && !filters.priceRange.match(/^\d+-\d+$|^\d+\+$/)) {
        console.error('Invalid price range format');
        setFilters({ ...filters, priceRange: '' });
    }
    
    return true;
};
```

---

## Contact & Escalation

**Filter Page Owner:** Platform Frontend Team  
**System Architect:** Check CODEOWNERS  
**Emergency Contact:** Project Lead

**For Lock Override Requests:**
1. Create GitHub Issue with label `filter-page-change-request`
2. Include justification and impact assessment
3. Tag system architect and frontend lead
4. Wait for approval before proceeding

---

## Final Warning ⚠️

**This Filter Page is production-critical infrastructure.**

Unauthorized modifications risk:
- 🔴 Breaking search functionality for all users
- 🔴 Location data corruption (GPS system conflicts)
- 🔴 Booking flow failures
- 🔴 Revenue loss from broken filtering

**When in doubt, DO NOT MODIFY. Ask first.**

---

**END OF LOCK DOCUMENT** 🔒

**Last Updated:** February 8, 2026  
**Lock Status:** ✅ ACTIVE - ENFORCED  
**Next Review:** After 10,000 production searches with current structure
