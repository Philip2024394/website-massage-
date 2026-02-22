# Country-Specific App Implementation Guide

## Overview
Implemented a comprehensive country-specific app system where each country gets its own localized experience with country-specific massage types, sidebar menus, and cultural elements.

## Side drawer and Appwrite (country social pages)

All countries in the home page side drawer under **IndaStreet Countries** are connected so that selecting a country opens that country’s social page (same experience as Indonesia, with hero and country name).

**Connection chain**
1. **useDrawerCountries()** – Loads countries from Appwrite (`fetchDrawerCountries`) or falls back to `DRAWER_COUNTRIES_LIST` in `src/constants/drawerCountries.ts`.
2. **COUNTRY_PAGE_IDS** – Set of country ids that have an in-app social page (indonesia, malaysia, singapore, thailand, philippines, vietnam, united-kingdom, united-states, australia, germany). Drawer uses this to decide “open in-app page” vs “open linkedWebsite”.
3. **getSafeDrawerPage(country.id)** – Maps drawer country id to a valid `Page` (e.g. `united-kingdom` → `uk`). See `src/config/drawerConfig.ts` ALIASES.
4. **onNavigate(page)** – Calls `state.setPage(page)`; AppRouter renders the matching country social page.

**Appwrite**
- Collection: `countries` (id in app: `src/lib/appwrite.config.ts` → `collections.countries`).
- Required attributes: `code`, `name`, `flag`, `active` (boolean). Optional: `linkedWebsite`.
- Country id in the app is derived from `code` in `src/lib/appwrite/services/countries.service.ts` (e.g. GB → united-kingdom, ID → indonesia). All 10 codes (ID, MY, SG, TH, PH, VN, GB, US, AU, DE) must exist with `active: true` for the drawer to show them from Appwrite.
- **Seed script**: `APPWRITE_API_KEY=your_key npx ts-node scripts/seed-drawer-countries.ts` – creates the 10 country documents if missing.
- **Verification**: In dev, `useDrawerCountries` runs `verifyDrawerCountriesConnection()` and logs warnings if any drawer country does not resolve to a valid social page. Unit test: `src/utils/__tests__/drawerCountriesVerification.test.ts`.

## Architecture

### 1. Configuration System
**File**: `config/countryContent.ts`

Defines country-specific content for each of the 10 active countries:
- Vietnam (VN)
- Thailand (TH)
- Malaysia (MY)
- Singapore (SG)
- Indonesia (ID)
- Philippines (PH)
- United Kingdom (GB)
- United States (US)
- Australia (AU)
- Germany (DE)

Each country configuration includes:
```typescript
{
  name: string;
  code: string;
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
  };
  massageTypes: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    price: { min: number; max: number; currency: string; };
  }>;
  wellnessCenters: Array<{
    name: string;
    category: string;
  }>;
  culturalElements: {
    traditionalPractices: string[];
    healingPhilosophy: string;
  };
}
```

### 2. Routing System
**File**: `AppRouter.tsx`

Added country-specific routes that map to country codes:
- `/vietnam` → VN
- `/thailand` → TH
- `/malaysia` → MY
- `/singapore` → SG
- `/indonesia` → ID
- `/philippines` → PH
- `/united-kingdom` → GB
- `/united-states` → US
- `/australia` → AU
- `/germany` → DE

When user navigates to a country route:
1. AppRouter maps route to country code
2. Loads country-specific content from `countryContent.ts`
3. Passes `countryCode`, `countryContent`, and `isCountrySpecific=true` to HomePage

### 3. HomePage Integration
**File**: `pages/HomePage.tsx`

Updated to support country-specific experiences:

**New Props**:
```typescript
interface HomePageProps {
  // ... existing props
  countryCode?: string;           // Country code (e.g., 'VN', 'TH')
  countryContent?: CountryContent; // Full country configuration
  isCountrySpecific?: boolean;     // Flag for country-specific mode
}
```

**Key Updates**:
1. Uses `propCountryCode` if provided, falls back to `CityContext.countryCode`
2. Passes country props to AppDrawer for country-specific sidebar
3. Displays country-specific hero subtitle when in country mode
4. Logs country-specific state for debugging

### 4. AppDrawer Integration
**File**: `components/AppDrawerClean.tsx`

Updated to display country-specific sidebar menus:

**New Props**:
```typescript
interface AppDrawerProps {
  // ... existing props
  countryCode?: string;
  countryContent?: any;
}
```

**Conditional Rendering**:
- When `countryContent` is provided: Shows country-specific massage types and wellness centers
- When no `countryContent`: Shows default Bali-focused content
- Sidebar menu adapts to show:
  - Country-specific massage types with icons and colors
  - Country-specific wellness center categories
  - Cultural healing practices

### 5. Country-Specific Massage Pages
**File**: `pages/CountryMassagePage.tsx`

New component for displaying individual massage type pages with:
- Country-specific hero section with background
- Massage type details (description, benefits, pricing)
- Cultural context section
- Pricing grid with duration options
- Traditional practices display

## User Experience Flow

### Default Flow (No Country Selected)
1. User visits homepage `/`
2. CityContext detects user location
3. Displays default content based on detected country
4. Sidebar shows Bali-focused content

### Country-Specific Flow
1. User navigates to `/vietnam`
2. AppRouter loads Vietnam content
3. HomePage renders with Vietnam-specific:
   - Hero subtitle: "Discover Traditional Vietnamese Wellness"
   - Sidebar massage types: Vietnamese Traditional, Bamboo Massage, Cao Gio, etc.
   - Cultural elements: Vietnamese healing traditions
4. User sees ONLY Vietnam-focused content, not Balinese massage types

### Account Creation with Country Context
*(Pending Implementation)*
When user creates account from country-specific page:
1. Capture `countryCode` from route
2. Store country preference in user profile
3. Future logins show country-specific experience by default

## Example: Vietnam App Experience

When user visits `/vietnam`:

**Hero Section**:
- Title: "Massage Therapist Hub"
- Subtitle: "Discover Traditional Vietnamese Wellness"

**Sidebar Massage Types**:
1. 🌿 Vietnamese Traditional Massage
   - Full body massage with traditional techniques
   - $15-25/hour
2. 🎋 Bamboo Massage
   - Therapeutic massage using heated bamboo sticks
   - $20-30/hour
3. 🌸 Vietnamese Aromatherapy
   - Relaxing massage with Vietnamese essential oils
   - $18-28/hour
4. 💆 Cao Gio (Coining)
   - Traditional Vietnamese scraping therapy
   - $12-20/hour
5. 🦶 Vietnamese Reflexology
   - Foot massage based on pressure points
   - $15-25/hour

**Cultural Elements**:
- Traditional Practices: Cao Gio, Vietnamese Herbal Compress, Bamboo Therapy
- Healing Philosophy: "Vietnamese wellness combines ancient Eastern traditions with herbal medicine and therapeutic techniques passed down through generations."

## Benefits

### For Users
- ✅ Localized experience relevant to their country
- ✅ Country-specific massage types and pricing
- ✅ Cultural context for traditional practices
- ✅ No confusion with irrelevant massage types (e.g., Balinese in Vietnam app)

### For Business
- ✅ Better conversion rates with localized content
- ✅ SEO optimization for country-specific searches
- ✅ Easier market expansion with pre-configured country templates
- ✅ Country-specific marketing campaigns

### For Development
- ✅ Centralized configuration in `countryContent.ts`
- ✅ Type-safe country content
- ✅ Easy to add new countries
- ✅ Reusable components across countries

## Adding New Countries

To add a new country:

1. **Add country configuration** in `config/countryContent.ts`:
```typescript
'XX': {
  name: 'Country Name',
  code: 'XX',
  hero: { /* ... */ },
  massageTypes: [ /* ... */ ],
  wellnessCenters: [ /* ... */ ],
  culturalElements: { /* ... */ }
}
```

2. **Add route mapping** in `AppRouter.tsx`:
```typescript
case 'country-name':
  const countryCodeMap = {
    // ... existing mappings
    'country-name': 'XX'
  };
```

3. **Update navigation** (if needed) to link to new country route

## Testing

### Manual Testing Checklist
- [ ] Visit `/vietnam` - should show Vietnamese massage types
- [ ] Visit `/thailand` - should show Thai massage types
- [ ] Visit `/` - should show default/detected country content
- [ ] Open sidebar on country page - should show country-specific menu
- [ ] Check hero subtitle - should be country-specific
- [ ] Test on mobile - sidebar should work on mobile
- [ ] Create account from country page - should store country context
- [ ] Filter therapists/places - should respect country context

### Browser Console Checks
Look for these log messages:
```
🌍 [COUNTRY] Country-specific mode: true Country: VN
```

## Future Enhancements

1. **Account Registration**
   - Capture country from route during signup
   - Store country preference in user profile
   - Default to user's country on login

2. **Data Filtering**
   - Filter therapists by country
   - Filter places by country
   - Show only country-relevant search results

3. **Country Switching**
   - Allow users to switch countries
   - Show country selector in header
   - Remember user's country preference

4. **Analytics**
   - Track country-specific page views
   - Monitor country conversion rates
   - A/B test country-specific content

5. **Internationalization**
   - Translate country content to local languages
   - Support multiple currencies per country
   - Localize date/time formats

## Status

✅ **Completed**:
- Country content configuration system
- Country-specific routing
- HomePage country props integration
- AppDrawer country-specific menus
- CountryMassagePage component
- 5 countries fully configured (VN, TH, MY, SG, ID)

🔄 **In Progress**:
- Account creation with country context
- Testing country-specific experiences

⏳ **Pending**:
- Remaining 5 countries configuration (PH, GB, US, AU, DE)
- Data filtering by country
- Country switching UI
- Analytics integration

## Files Modified

1. `config/countryContent.ts` - NEW FILE
2. `AppRouter.tsx` - Added country routing
3. `pages/HomePage.tsx` - Added country props
4. `components/AppDrawerClean.tsx` - Added country-specific menus
5. `pages/CountryMassagePage.tsx` - NEW FILE

## Notes

- Booking system remains unified across all countries
- Admin dashboard already has country filtering
- Default homepage uses CityContext for country detection
- Country-specific pages override CityContext country
- Side drawer adapts automatically based on country props
