# APPWRITE LOCATIONS COLLECTION - BACKEND INTEGRATION GUIDE

## 📊 Collection Schema

**Collection ID:** `locations`

### Required Fields
- `city` (string, size 150) - **REQUIRED** - One of 15 Indonesian cities
- `serviceAreas` (string, size 200) - **REQUIRED** - JSON string of area IDs

### Optional Fields
- `locationId` (string, size 64) - Provider reference (e.g., "therapist-123")
- `longitude` (double, min: -180, max: 180) - GPS longitude
- `latitude` (double, min: -90, max: 90) - GPS latitude
- `geopoint` (point) - Appwrite geopoint for geospatial queries
- `altitude` (double, min: -500, max: 10000) - Elevation in meters
- `timestamp` (datetime) - Last location update
- `region` (enum) - Province/region
- `name` (string, size 120) - Location name
- `aliases[]` (string array, size 255) - Alternative names
- `country` (string, size 255) - Always "Indonesia"
- `isActive` (boolean, default: true) - Soft delete flag
- `maxTravelDistance` (string, size 200) - Travel limit in km

## 🔌 Backend Services

### 1. Location Service (`lib/appwrite/services/location.service.ts`)

**Created**: ✅ Complete

#### Key Methods:
```typescript
// Create location
await locationService.create({
  city: 'Jakarta',
  serviceAreas: '["jakarta-kemang", "jakarta-senopati"]',
  country: 'Indonesia',
  isActive: true
});

// Get locations by city
const locations = await locationService.getByCity('Jakarta');

// Get locations by service area
const locations = await locationService.getByServiceArea('Jakarta', 'jakarta-kemang');

// Update location
await locationService.update(locationId, {
  serviceAreas: '["jakarta-kemang", "jakarta-blok-m"]'
});

// Upsert for provider (therapist/place)
await locationService.upsertForProvider(
  therapistId,
  'therapist',
  {
    city: 'Jakarta',
    serviceAreas: '["jakarta-kemang"]',
    maxTravelDistance: '10'
  }
);
```

### 2. Location Helpers (`utils/locationHelpers.ts`)

**Created**: ✅ Complete

#### Key Functions:
```typescript
// Serialize/deserialize
serializeServiceAreas(['jakarta-kemang', 'jakarta-senopati'])
// Returns: '["jakarta-kemang","jakarta-senopati"]'

deserializeServiceAreas('["jakarta-kemang","jakarta-senopati"]')
// Returns: ['jakarta-kemang', 'jakarta-senopati']

// Get service areas from provider
const areas = getServiceAreas(therapist);

// Check if provider serves area
const serves = servesArea(therapist, 'jakarta-kemang');

// Validate before save
const { valid, errors } = validateLocationData({
  city: 'Jakarta',
  serviceAreas: ['jakarta-kemang']
});

// Prepare for Appwrite save (converts arrays to JSON strings)
const prepared = prepareTherapistForSave(therapist);

// Prepare from Appwrite (converts JSON strings to arrays)
const therapist = prepareTherapistFromAppwrite(appwriteDoc);
```

## 🔗 Type System Updates

### Therapist Interface (`types.ts`)

**Updated**: ✅ Complete

```typescript
interface Therapist {
  // ... existing fields ...
  
  // APPWRITE SCHEMA COMPATIBLE
  city?: string; // One of 15 Indonesian cities (REQUIRED in Appwrite)
  serviceAreas?: string; // JSON string of area IDs (REQUIRED in Appwrite, size 200)
  maxTravelDistance?: string; // Optional travel distance in km (size 200)
  country?: string; // Always "Indonesia" (size 255)
  region?: string; // Province/region (enum in Appwrite)
}
```

## 📝 Environment Variables

Add to `.env`:
```bash
VITE_LOCATIONS_COLLECTION_ID=locations
```

## 🔧 Appwrite Config (`lib/appwrite/config.ts`)

**Updated**: ✅ Complete

```typescript
export const APPWRITE_CONFIG = {
  // ... existing config ...
  collections: {
    // ... existing collections ...
    locations: requireEnv('VITE_LOCATIONS_COLLECTION_ID', 'locations'),
  }
};
```

## 🚀 Integration Examples

### Example 1: Save Therapist with Location

```typescript
import { therapistService } from './lib/appwriteService';
import { prepareTherapistForSave } from './utils/locationHelpers';

// Frontend data (with arrays)
const therapistData = {
  name: 'John Doe',
  city: 'Jakarta',
  serviceAreas: ['jakarta-kemang', 'jakarta-senopati'],
  maxTravelDistance: 10,
  country: 'Indonesia'
};

// Prepare for Appwrite (converts to JSON strings)
const preparedData = prepareTherapistForSave(therapistData);
// Result:
// {
//   name: 'John Doe',
//   city: 'Jakarta',
//   serviceAreas: '["jakarta-kemang","jakarta-senopati"]',
//   maxTravelDistance: '10',
//   country: 'Indonesia'
// }

// Save to Appwrite
await therapistService.create(preparedData);
```

### Example 2: Load Therapist and Display Service Areas

```typescript
import { therapistService } from './lib/appwriteService';
import { getServiceAreas } from './utils/locationHelpers';

// Load from Appwrite
const therapist = await therapistService.getById(therapistId);

// Get service areas as array
const areas = getServiceAreas(therapist);
// Returns: ['jakarta-kemang', 'jakarta-senopati']

// Display in UI
areas.forEach(areaId => {
  const area = getAreaById(areaId);
  console.log(area.name); // "Kemang", "Senopati"
});
```

### Example 3: Filter Therapists by City and Area

```typescript
import { dataService } from './services/dataService';
import { servesArea } from './utils/locationHelpers';

// Fetch therapists for city
const therapists = await dataService.getTherapists('Jakarta');

// Client-side filter by area
const therapistsInKemang = therapists.filter(t => servesArea(t, 'jakarta-kemang'));

// Or use service-level filtering
const therapists = await dataService.getTherapists('Jakarta', 'jakarta-kemang');
```

### Example 4: Therapist Registration Form

```typescript
import { serializeServiceAreas, validateLocationData } from './utils/locationHelpers';

// Form state
const [city, setCity] = useState('');
const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
const [maxTravel, setMaxTravel] = useState('');

// On submit
const handleSubmit = async () => {
  // Validate
  const validation = validateLocationData({
    city,
    serviceAreas: selectedAreas
  });
  
  if (!validation.valid) {
    alert(validation.errors.join(', '));
    return;
  }
  
  // Prepare data
  const therapistData = {
    name: formData.name,
    city: city,
    serviceAreas: serializeServiceAreas(selectedAreas),
    maxTravelDistance: maxTravel,
    country: 'Indonesia'
  };
  
  // Save
  await therapistService.create(therapistData);
};
```

## 🎯 Data Migration Strategy

### Step 1: Backfill Existing Therapists

```typescript
import { therapistService } from './lib/appwriteService';
import { matchProviderToCity } from './constants/indonesianCities';

// Get all therapists
const therapists = await therapistService.getAll();

for (const therapist of therapists) {
  // Skip if already has city
  if (therapist.city) continue;
  
  // Determine city from location field
  const city = matchProviderToCity(therapist.location);
  
  if (!city) {
    console.warn('Could not determine city for:', therapist.name, therapist.location);
    continue;
  }
  
  // Get default service areas for city
  const areas = getServiceAreasForCity(city);
  const defaultAreas = areas.filter(a => a.popular).map(a => a.id);
  
  // Update therapist
  await therapistService.update(therapist.$id!, {
    city: city,
    serviceAreas: serializeServiceAreas(defaultAreas),
    country: 'Indonesia'
  });
  
  console.log('✅ Updated:', therapist.name, city, defaultAreas);
}
```

### Step 2: Create Database Indexes

In Appwrite Console:
1. Go to Databases → locations collection
2. Create indexes:
   - `city_idx`: Index on `city` field (ASC)
   - `isActive_idx`: Index on `isActive` field (ASC)
   - `city_active`: Compound index on `city` + `isActive` (ASC, ASC)

### Step 3: Test Queries

```typescript
// Test city filtering
const jakartaTherapists = await therapistService.getAll('Jakarta');
console.log('Jakarta therapists:', jakartaTherapists.length);

// Test area filtering
const kemangTherapists = await therapistService.getAll('Jakarta', 'jakarta-kemang');
console.log('Kemang therapists:', kemangTherapists.length);
```

## ⚠️ Important Notes

### 1. Service Areas Storage
- **Frontend**: Array of strings `['jakarta-kemang', 'jakarta-senopati']`
- **Appwrite**: JSON string `'["jakarta-kemang","jakarta-senopati"]'`
- **Always use helpers** to convert between formats

### 2. Required Fields
- `city` is REQUIRED in Appwrite schema
- `serviceAreas` is REQUIRED in Appwrite schema
- Validate before saving to avoid errors

### 3. Client-Side Filtering
- Appwrite doesn't support JSON array searching
- Area filtering happens client-side after fetching by city
- For better performance, ensure city queries are indexed

### 4. Travel Distance
- Stored as string in Appwrite (size 200)
- Use `getMaxTravelDistance()` helper to convert to number
- Optional field - can be null

### 5. Country Field
- Always set to "Indonesia" by default
- No country selector exposed yet
- Future-proofing for multi-country support

## ✅ Testing Checklist

- [ ] Create therapist with city and serviceAreas
- [ ] Update therapist serviceAreas
- [ ] Fetch therapists by city
- [ ] Filter therapists by area (client-side)
- [ ] Validate location data before save
- [ ] Test with missing city (should fail)
- [ ] Test with empty serviceAreas (should fail)
- [ ] Test serialization/deserialization
- [ ] Backfill existing therapists
- [ ] Create database indexes
- [ ] Test query performance

## 📚 Next Steps

1. ✅ Location service created
2. ✅ Helper utilities created
3. ✅ Type system updated
4. ⏳ Update therapist registration form
5. ⏳ Update therapist profile editor
6. ⏳ Backfill existing data
7. ⏳ Create database indexes
8. ⏳ Test end-to-end flow
