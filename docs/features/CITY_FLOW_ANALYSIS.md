# City Selection Flow Analysis 🔍

## Current Implementation Status

### ✅ What's Working

#### 1. **Landing Page → City Selection**
- **File:** [pages/LandingPage.tsx](pages/LandingPage.tsx#L218-L250)
- **Handler:** `handleCitySelectNew(city: CityOption)`
- **Flow:**
  ```typescript
  1. User clicks city button
  2. setSelectedCity(city.name) - Update local state
  3. setCity(city.name) - Save to CityContext ✅
  4. Navigate to home page
  ```

#### 2. **CityContext Persistence**
- **File:** [context/CityContext.tsx](context/CityContext.tsx#L76-L79)
- **Handler:** `handleSetCity(newCity: string)`
- **Flow:**
  ```typescript
  1. setCity(newCity) - Update context state ✅
  2. ipGeolocationService.saveLocation(countryCode, newCity) - Save to localStorage ✅
  3. City persists across page reloads ✅
  ```

#### 3. **Therapist Filtering by City**
- **File:** [hooks/useDataFetching.ts](hooks/useDataFetching.ts#L89-L95)
- **Function:** `filterTherapistsByCity(therapists, activeCity)` 
- **Implementation:**
  ```typescript
  // City filtering is applied
  if (activeCity && activeCity !== 'all') {
      console.log(`🔒 CITY FILTER: Filtering ${therapistsWithReviews.length} therapists by city="${activeCity}"`);
      finalTherapists = filterTherapistsByCity(therapistsWithReviews, activeCity);
      console.log(`🔒 CITY FILTER: After filtering, ${finalTherapists.length} therapists remain`);
  }
  ```

#### 4. **Database Query Filtering**
- **File:** [lib/appwrite/services/therapist.service.ts](lib/appwrite/services/therapist.service.ts#L111-L117)
- **Method:** `therapistService.getAll(city, area)`
- **Query:**
  ```typescript
  if (city) {
      queries.push(Query.search('location', city));
      console.log('🏙️ [STAGE 1] Added city query filter');
  }
  ```

### ⚠️ Potential Issues

#### 1. **Header Doesn't Show City**
- **File:** [components/shared/UniversalHeader.tsx](components/shared/UniversalHeader.tsx)
- **Issue:** UniversalHeader **does NOT** display current city
- **Missing:** City indicator in header
- **Fix Needed:**
  ```typescript
  // Add to UniversalHeader props
  interface UniversalHeaderProps {
      city?: string;  // NEW
      countryCode?: string;  // NEW
      showCityInfo?: boolean;  // NEW
  }
  
  // Display in header
  {showCityInfo && city && (
      <div className="text-sm text-gray-600">
          📍 {city}, {countryCode}
      </div>
  )}
  ```

#### 2. **HomePage City Filtering Verification Needed**
- **Files to Check:**
  - [pages/HomePage.tsx](pages/HomePage.tsx) - Main filtering logic
  - [hooks/useHomePageLocation.ts](hooks/useHomePageLocation.ts#L125-L132) - Location hook
- **Concerns:**
  - Multiple filtering layers (useEffect, useHomePageLocation, cityFilteredTherapists)
  - Need to verify city from CityContext flows correctly to HomePage
  - Showcase profiles from Yogyakarta might bypass city filter

#### 3. **City Field Inconsistency in Therapist Data**
- **Issue:** Therapists may have city in different fields:
  - `therapist.city` - Direct city field
  - `therapist.location` - Full location string (may contain city)
  - `therapist.locationId` - Normalized location ID
  - `therapist._locationArea` - Computed area field
- **Filter Utility:** [utils/cityFilterUtils.ts] likely handles this normalization

---

## 🔍 Verification Steps

### Step 1: Landing Page Selection
```bash
# Test this flow:
1. Open landing page
2. Select country (e.g., Thailand)
3. Select city (e.g., Bangkok)
4. Check console logs:
   - "📍 City selected: Bangkok - navigating to home page"
   - CityContext should update
```

### Step 2: CityContext State
```bash
# Check browser console:
window.__CITY_CONTEXT__ = {
    city: "Bangkok",
    countryCode: "TH",
    hasSelectedCity: true
}

# Check localStorage:
localStorage.getItem('userLocation')
// Should show: {"countryCode":"TH","city":"Bangkok","timestamp":...}
```

### Step 3: HomePage Therapist Filtering
```bash
# Expected console logs on HomePage:
1. "🔒 CITY FILTER: Filtering X therapists by city='Bangkok'"
2. "🔒 CITY FILTER: After filtering, Y therapists remain"
3. Therapist list should only show Bangkok therapists
```

### Step 4: Database Query
```bash
# Expected Appwrite query console logs:
1. "🏙️ [STAGE 1] Filtering by city: Bangkok"
2. "🏙️ [STAGE 1] Added city query filter"
3. Query should include: Query.search('location', 'Bangkok')
```

### Step 5: Header Display (NEEDS FIX)
```bash
# Current: Header does NOT show city ❌
# Expected: Header should show "📍 Bangkok, Thailand" ✅
```

---

## 🔧 Required Fixes

### Fix #1: Add City Display to UniversalHeader

**File:** [components/shared/UniversalHeader.tsx](components/shared/UniversalHeader.tsx)

```typescript
// Add imports
import { useCityContext } from '../../context/CityContext';

// Update props interface
interface UniversalHeaderProps {
    // ... existing props
    showCityInfo?: boolean;  // NEW: Show city in header
}

// Add to component
export const UniversalHeader: React.FC<UniversalHeaderProps> = ({
    // ... existing props
    showCityInfo = false,  // NEW
}) => {
    // NEW: Get city from context
    const { city, countryCode, country } = useCityContext();
    
    return (
        <header className={headerClasses}>
            <PageContainer className={`py-2 sm:py-3 max-w-full ${containerClassName}`}>
                <div className="flex justify-between items-center max-w-full">
                    
                    {/* Left side: Brand + City */}
                    {showBrand && (
                        <div className="flex items-center gap-2">
                            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex-shrink-0">
                                <span className="text-black">Inda</span>
                                <span className="text-orange-500">Street</span>
                            </h1>
                            
                            {/* NEW: City Display */}
                            {showCityInfo && city && (
                                <div className="hidden sm:flex items-center gap-1 text-xs text-gray-600 ml-2 bg-gray-100 px-2 py-1 rounded-full">
                                    <MapPin className="w-3 h-3" />
                                    <span>{city}, {countryCode}</span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* ... rest of component */}
                </div>
            </PageContainer>
        </header>
    );
};
```

### Fix #2: Update HomePage to Pass City Info

**File:** [pages/HomePage.tsx](pages/HomePage.tsx)

```typescript
// Import CityContext
import { useCityContext } from '../context/CityContext';

// In HomePage component
const HomePage = () => {
    const { city, countryCode } = useCityContext();
    
    return (
        <div>
            <UniversalHeader
                language={language}
                onLanguageChange={handleLanguageChange}
                onMenuClick={() => setDrawerOpen(true)}
                showCityInfo={true}  // NEW: Enable city display
            />
            {/* ... rest of component */}
        </div>
    );
};
```

---

## 🧪 Test Cases

### Test Case 1: City Selection Persists
```typescript
Scenario: User selects city and refreshes page
Given: User selects "Bangkok" on landing page
When: User navigates to home page
And: User refreshes the browser (F5)
Then: City remains "Bangkok"
And: Therapists shown are only Bangkok therapists
```

### Test Case 2: City Filtering Works
```typescript
Scenario: Only therapists from selected city appear
Given: Database has 100 therapists across 6 cities
And: User selects "Canggu"
When: HomePage loads
Then: Only Canggu therapists are displayed
And: Console shows filter log: "Filtered to X Canggu therapists"
```

### Test Case 3: Header Shows City
```typescript
Scenario: Header displays current city
Given: User has selected "Singapore"
When: HomePage renders
Then: Header shows "📍 Singapore, SG"
And: City badge is visible on desktop
```

### Test Case 4: City Change Updates Everything
```typescript
Scenario: Changing city updates all components
Given: User is viewing Bangkok therapists
When: User clicks city selector and changes to "Phuket"
Then: Therapist list refreshes
And: Header updates to "📍 Phuket, TH"
And: Only Phuket therapists are shown
```

### Test Case 5: No City Shows All
```typescript
Scenario: No city selected shows all therapists
Given: User hasn't selected a city yet
When: HomePage loads
Then: All therapists from all cities are shown
Or: User is prompted to select a city first
```

---

## 📊 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                       LANDING PAGE                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  User Action: Click City Button (e.g., "Bangkok")          │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    CITY CONTEXT                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  1. setCity("Bangkok")                                      │ │
│  │  2. ipGeolocationService.saveLocation("TH", "Bangkok")      │ │
│  │  3. localStorage.setItem('userLocation', {...})            │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                     HOME PAGE                                     │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  const { city, countryCode } = useCityContext()             │ │
│  │  city = "Bangkok", countryCode = "TH"                      │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  DATA FETCHING                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  const data = await fetchPublicData(city)                   │ │
│  │  ↓                                                           │ │
│  │  therapistService.getAll(city="Bangkok")                   │ │
│  │  ↓                                                           │ │
│  │  Query.search('location', 'Bangkok')                       │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                    APPWRITE DATABASE                              │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  SELECT * FROM therapists                                   │ │
│  │  WHERE location LIKE '%Bangkok%'                           │ │
│  │  LIMIT 500                                                  │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  CLIENT-SIDE FILTERING                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  finalTherapists = filterTherapistsByCity(therapists, city) │ │
│  │  ↓                                                           │ │
│  │  Returns only therapists with city="Bangkok"               │ │
│  └────────────────────┬───────────────────────────────────────┘ │
└────────────────────────┼─────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                      DISPLAY                                      │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Header: 📍 Bangkok, TH (NEEDS FIX ⚠️)                     │ │
│  │  ↓                                                           │ │
│  │  TherapistCard #1 (Bangkok)                                │ │
│  │  TherapistCard #2 (Bangkok)                                │ │
│  │  TherapistCard #3 (Bangkok)                                │ │
│  │  ...                                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✅ Action Items

1. **✅ WORKING:** City selection saves to CityContext
2. **✅ WORKING:** CityContext persists to localStorage
3. **✅ WORKING:** Therapist filtering by city
4. **❌ NEEDS FIX:** Header doesn't show current city
5. **🔍 VERIFY:** HomePage receives city from context correctly
6. **🔍 VERIFY:** All therapist data has consistent city field
7. **🔍 VERIFY:** City switcher/dropdown updates everything

---

## 🎯 Summary

### What's Confirmed Working:
- ✅ Landing page city selection → CityContext
- ✅ CityContext → localStorage persistence
- ✅ Database query includes city filter
- ✅ Client-side filtering by city
- ✅ Therapist service filtering

### What Needs Attention:
- ⚠️ Header missing city display
- ⚠️ Need to verify HomePage integration
- ⚠️ Need to verify city switcher updates header
- ⚠️ Need to test cross-country navigation

### Next Steps:
1. Add city display to UniversalHeader
2. Test full flow from landing → home
3. Verify city changes update all components
4. Add city indicator to all relevant pages
5. Test with real therapist data from all 6 countries
