# Locked Files - Therapist Home Page

**Lock Date**: January 5, 2026
**Status**: Production-Ready, Logic & Layout Protected

## 🔒 LOCKED FILES (Structure & Logic Only)

### Core Page Components
- ✅ `pages/HomePage.tsx` - Page structure, filtering logic, state management, GPS calculations
- ✅ `components/TherapistHomeCard.tsx` - Card layout, UI structure, click handlers

### Protected Logic
These files contain the core business logic that powers the Therapist Home experience:

1. **Filtering & Sorting**
   - Distance-based filtering (25km radius)
   - City-based filtering
   - Massage type filtering
   - Featured therapist logic

2. **State Management**
   - Language switching (id/en)
   - Location state (GPS, city selection)
   - Filter state (massage types, search)
   - Pagination/infinite scroll

3. **UI Structure**
   - Grid/list layout
   - Responsive breakpoints
   - Header placement
   - Loading states
   - Error boundaries

4. **Performance & Safety**
   - Error handling wrappers
   - Lazy loading logic
   - Distance calculation algorithms
   - Data transformation pipelines

## ✅ UNLOCKED FILES (Dynamic Content & Data)

### Translation Files (MUST REMAIN EDITABLE)
- ⚠️ `translations/home.ts` - Indonesian & English UI text
- ⚠️ `translations/*.ts` - All other translation modules
- ⚠️ `locales/**/*` - Any locale-specific files

### Backend & Data Sources (MUST REMAIN EDITABLE)
- ⚠️ `lib/appwriteService.ts` - Appwrite integration
- ⚠️ `lib/therapistService.ts` - Therapist data fetching
- ⚠️ `lib/bookingService.ts` - Booking data
- ⚠️ `lib/reviewService.ts` - Review data
- ⚠️ Appwrite collection schemas (in Appwrite dashboard)
- ⚠️ Appwrite permissions
- ⚠️ Database queries and indexes

### Dynamic Configuration (MUST REMAIN EDITABLE)
- ⚠️ `constants/indonesianCities.ts` - City lists
- ⚠️ `constants/massageTypes.ts` - Service categories
- ⚠️ Featured therapist IDs (configurable)
- ⚠️ Filter options and categories

### Therapist Content (UPDATES DAILY)
- ⚠️ Therapist names, photos, bios
- ⚠️ Languages offered
- ⚠️ Services and prices
- ⚠️ Availability status
- ⚠️ Ratings and reviews
- ⚠️ Location coordinates
- ⚠️ Profile badges

### Styling (MAY EVOLVE)
- ⚠️ `index.css` - Theme variables
- ⚠️ Tailwind config (if theme evolves)
- ⚠️ Color tokens
- ⚠️ Spacing/typography scales

## 📋 What This Lock Protects

### ✅ Protected (Frozen)
1. **Page architecture** - How components are organized
2. **Filtering algorithms** - How therapists are filtered and sorted
3. **State management patterns** - How app state flows
4. **GPS calculation logic** - Distance algorithms
5. **Error handling structure** - Safety wrappers
6. **Component interfaces** - Props and event handlers
7. **Routing patterns** - How navigation works

### ❌ NOT Protected (Remains Dynamic)
1. **Therapist data** - Names, photos, bios (from Appwrite)
2. **Translations** - UI text in Indonesian/English
3. **Backend queries** - Appwrite fetch logic
4. **Configuration** - Cities, categories, filters
5. **Content updates** - New therapists added daily
6. **Styling tokens** - Colors, spacing (if theme evolves)
7. **Business rules** - Prices, service offerings

## 🚨 Critical Rules

1. **Daily Updates Continue**: New therapists added to Appwrite appear automatically (no code changes needed)
2. **Translations Editable**: i18n files must remain unlocked for content updates
3. **Backend Integration Flexible**: Appwrite services, schemas, permissions remain editable
4. **Content vs Structure**: Lock prevents breaking UX/logic, not content updates
5. **Emergency Override**: Architecture team can unlock with documented reason

## 🔧 Modification Guidelines

### To Add a New Therapist (NO CODE CHANGES)
1. Add therapist to Appwrite `therapists` collection
2. Upload profile photo to Appwrite storage
3. Set availability status
4. ✅ Therapist appears automatically on home page

### To Update Translations (NO CODE CHANGES)
1. Edit `translations/home.ts`
2. Add/modify Indonesian or English text
3. ✅ UI updates automatically

### To Modify Filter Options (NO CODE CHANGES)
1. Edit `constants/massageTypes.ts` or city lists
2. Update filter configuration
3. ✅ Filters update automatically

### To Change Page Logic (REQUIRES UNLOCK)
1. Request unlock from architecture team
2. Document reason and scope
3. Make changes with review
4. Re-lock after approval

## ✅ Verification Checklist

- [x] Therapist cards render dynamically from Appwrite
- [x] New therapists appear without code changes
- [x] Translations are editable in separate files
- [x] Backend queries remain flexible
- [x] Configuration files remain unlocked
- [x] Daily content updates work automatically
- [x] Language switching works (id/en)
- [x] Filtering and sorting logic is stable
- [x] GPS distance calculations are reliable
- [x] Error handling is robust

## 📊 Impact Assessment

**Locked Components**: 2 files (HomePage.tsx, TherapistHomeCard.tsx)
**Protected Lines of Code**: ~2,400 lines
**Unlocked Data Sources**: 100% (all Appwrite data, translations, config)
**Daily Update Capability**: ✅ Maintained
**i18n Flexibility**: ✅ Maintained
**Backend Flexibility**: ✅ Maintained

---

**Status**: ✅ **Therapist Home Page safely locked**
- Logic & layout protected
- Content remains dynamic
- Daily updates continue working
- Translations remain editable
