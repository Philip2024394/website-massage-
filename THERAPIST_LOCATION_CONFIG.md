# Therapist Location Configuration - Indonesia
**Last Updated:** December 30, 2025  
**Status:** ✅ LOCKED - Production Configuration

---

## 🎯 Core Filtering Rules

### 1. **NO RADIUS FILTERING**
- ❌ **REMOVED:** 10km GPS radius restriction
- ✅ **CURRENT:** Therapists serve their assigned city/location area regardless of GPS distance
- 📍 **Reason:** Each therapist is assigned to specific cities and should appear in those cities only

### 2. **City-Based Assignment**
Therapists are displayed based on their **assigned location/city**, not GPS proximity:

```javascript
// City matching uses GPS coordinates as primary source
const therapistCoords = parseCoordinates(t.coordinates);
const matchedCity = matchProviderToCity(therapistCoords, 25);
if (matchedCity && matchedCity.locationId === selectedCity) {
    // ✅ Show therapist in their assigned city
}
```

### 3. **Distance Calculation Purpose**
- **Used for:** Sorting therapists (nearest first within same city)
- **NOT used for:** Filtering or excluding therapists
- **Formula:** Haversine distance calculation

---

## 🌍 Indonesian City Coverage

### Current Cities with Therapists:
1. **Yogyakarta** - 24 real therapists + 1 featured (Budi)
2. **Bandung** - 1 real therapist (Aditia) + 1 featured (Budi)
3. **Other Cities** - Featured sample (Budi) + 5 showcase profiles from Yogyakarta

### City Configuration:
```typescript
// Location matching priority:
// 1. GPS coordinates (primary source of truth)
// 2. Location string (fallback only)
```

---

## 👤 Featured Sample Therapist

**Budi** - Shows in ALL Indonesian cities:
- ID: `692467a3001f6f05aaa1`
- Purpose: Ensure every city has at least one visible therapist
- Status: Always visible regardless of city selection
- Coordinates: Yogyakarta base location

```javascript
// Featured sample detection
const isFeatured = isFeaturedSample(therapist, 'therapist');
if (isFeatured) {
    // ✅ Always include in all cities
    return true;
}
```

---

## 🎭 Showcase Profiles System

**Purpose:** Display sample therapists in cities with NO real therapists

**Rules:**
1. Only add showcase profiles when city has **0 real therapists** (excluding Budi)
2. Select 5 random Yogyakarta therapists
3. Mark them as "busy" status (not bookable)
4. Override location to match viewing city

**Example:**
```javascript
// Only add if no real therapists in city
const realTherapistsInCity = filteredTherapists.filter(
    (t) => !isFeaturedSample(t, 'therapist')
);

if (realTherapistsInCity.length === 0) {
    // Add 5 Yogyakarta showcase profiles
}
```

---

## 📋 Filtering Logic Flow

### Step 1: Fetch All Therapists
- Get from Appwrite database
- Parse coordinates (JSON string → object)
- Normalize status (offline → busy)

### Step 2: City Filtering (Primary)
```javascript
// GPS coordinate-based city detection
if (selectedCity === 'all') {
    // Show all therapists
} else {
    // Filter by GPS coordinates matching selected city
    const matchedCity = matchProviderToCity(coords, 25);
    if (matchedCity.locationId === selectedCity) {
        // ✅ Include therapist
    }
}
```

### Step 3: Status Filtering
```javascript
// Live status check
const treatedAsLive = shouldTreatTherapistAsLive(therapist);
// Includes: available, busy, offline, online
```

### Step 4: Distance Calculation (Sorting Only)
```javascript
// Calculate distance for sorting (NOT filtering)
const distance = calculateHaversineDistance(userLocation, therapistCoords);
// Sort: nearest first within same city
```

### Step 5: Showcase Profiles (If Needed)
```javascript
// Add only if city has no real therapists
if (realTherapistsInCity.length === 0) {
    finalList = [...filteredTherapists, ...showcaseProfiles];
}
```

---

## 🔧 Key Configuration Files

### 1. `pages/HomePage.tsx`
**Line 1665-1670:** Distance filtering logic (REMOVED)
```typescript
// ✅ NO DISTANCE FILTERING
// Therapists serve their assigned city/location area
// Distance only for sorting, not filtering
```

### 2. `lib/appwrite/services/therapist.service.ts`
**Line 154-161:** Status normalization
```typescript
// Default status: Busy (not Offline)
if (!status) return 'Busy';
if (lowercaseStatus === 'offline') return 'Busy';
```

### 3. City Filtering Logic
**Line 945-1005:** GPS-based city matching
```typescript
// Primary: GPS coordinates
// Fallback: Location string
```

---

## ⚠️ CRITICAL - DO NOT CHANGE

### Protected Settings:
1. ❌ **DO NOT** re-add 10km radius filtering
2. ❌ **DO NOT** remove city-based filtering
3. ❌ **DO NOT** change showcase profile logic (0 real therapists check)
4. ❌ **DO NOT** exclude therapists based on GPS distance

### Approved Changes:
1. ✅ Add new cities with proper GPS coordinates
2. ✅ Add new therapists with city assignments
3. ✅ Adjust sorting logic (within city)
4. ✅ Update status normalization rules

---

## 🚀 Adding New Cities/Therapists

### To Add New City:
1. Add to `src/data/indonesianCities.ts`
2. Include GPS coordinates and locationId
3. System will automatically filter therapists for that city

### To Add New Therapist:
1. Add to Appwrite `therapists` collection
2. Set coordinates (JSON string format):
   ```json
   {"lat": -6.9175, "lng": 107.6191}
   ```
3. Set location field (e.g., "Bandung, Indonesia")
4. System will automatically detect city from coordinates

---

## 📊 Current Production Status

**Yogyakarta:** ✅ 24 therapists showing correctly  
**Bandung:** ✅ 1 therapist (Aditia) showing correctly  
**All other cities:** ✅ Budi + 5 showcase profiles showing correctly

**Distance Filtering:** ❌ DISABLED (as required)  
**City-Based Filtering:** ✅ ACTIVE  
**Showcase System:** ✅ ACTIVE (only for empty cities)

---

## 🔐 Fallback Instructions

**If city filtering breaks, restore these settings:**

1. **Remove distance filtering:**
   ```typescript
   // NO 10km radius check
   // NO distance-based exclusion
   ```

2. **Enable GPS coordinate matching:**
   ```typescript
   const matchedCity = matchProviderToCity(coords, 25);
   if (matchedCity.locationId === selectedCity) {
       return true; // Include therapist
   }
   ```

3. **Check showcase profile logic:**
   ```typescript
   const realTherapists = filteredTherapists.filter(
       (t) => !isFeaturedSample(t, 'therapist')
   );
   if (realTherapists.length === 0) {
       // Add showcase profiles
   }
   ```

---

## 📞 Support References

**Key Email:** indastreet29@gmail.com (Aditia - Bandung therapist)  
**Test Cities:** Yogyakarta, Bandung  
**Configuration Date:** December 30, 2025

---

**✅ CONFIGURATION LOCKED - All Indonesian cities use these rules**
