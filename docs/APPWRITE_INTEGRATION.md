# Appwrite Integration Guide

This project has been updated to be compatible with Appwrite, which uses string fields instead of JSON objects for complex data types.

## Key Changes Made

### 1. Data Type Conversions

The following complex objects have been converted to JSON strings for Appwrite compatibility:

- **`pricing`**: Object `{60: number, 90: number, 120: number}` → JSON string
- **`massageTypes`**: Array `string[]` → JSON string  
- **`coordinates`**: Object `{lat: number, lng: number}` → JSON string
- **`analytics`**: Object `{impressions: number, profileViews: number, whatsappClicks: number}` → JSON string

### 2. Helper Functions

Created utility functions in `/utils/appwriteHelpers.ts`:

- **Parsing functions**: Convert JSON strings back to objects
  - `parsePricing(string)` → `Pricing`
  - `parseMassageTypes(string)` → `string[]`
  - `parseCoordinates(string)` → `{lat: number, lng: number}`
  - `parseAnalytics(string)` → `Analytics`

- **Stringify functions**: Convert objects to JSON strings
  - `stringifyPricing(Pricing)` → `string`
  - `stringifyMassageTypes(string[])` → `string`
  - `stringifyCoordinates({lat, lng})` → `string`
  - `stringifyAnalytics(Analytics)` → `string`

### 3. Updated Components

- **TherapistCard**: Uses helper functions to parse pricing and massage types
- **TherapistDashboardPage**: Converts between objects and strings for form handling
- **App.tsx**: Mock data now uses string format

### 4. Database Schema for Appwrite

When setting up your Appwrite database, use these field types:

```javascript
// Therapist Collection
{
  id: 'integer',
  name: 'string',
  email: 'string', 
  profilePicture: 'string',
  description: 'string',
  status: 'string', // AvailabilityStatus enum
  pricing: 'string', // JSON string: {"60":150,"90":200,"120":250}
  whatsappNumber: 'string',
  distance: 'double',
  rating: 'double',
  reviewCount: 'integer',
  massageTypes: 'string', // JSON string: ["Swedish","Deep Tissue"]
  isLive: 'boolean',
  location: 'string',
  coordinates: 'string', // JSON string: {"lat":-6.2088,"lng":106.8456}
  activeMembershipDate: 'string', // ISO date string
  analytics: 'string', // JSON string: {"impressions":100,"profileViews":50,"whatsappClicks":10}
  agentId: 'integer' // optional
}

// Place Collection (similar structure)
{
  // ... same fields as Therapist plus:
  mainImage: 'string',
  thumbnailImages: 'string', // JSON string array
  openingTime: 'string',
  closingTime: 'string'
}
```

### 5. Implementation Steps

1. **Set up Appwrite**: Install Appwrite SDK and configure your project
2. **Create Collections**: Use the schema above for your collections
3. **Replace Mock Data**: Update the mock implementations with actual Appwrite queries
4. **Authentication**: Implement Appwrite authentication in place of current mock auth

### 6. Example Appwrite Query

```javascript
import { Client, Databases, Query } from 'appwrite';

const client = new Client()
  .setEndpoint('YOUR_ENDPOINT')
  .setProject('YOUR_PROJECT_ID');

const databases = new Databases(client);

// Fetch therapists
const fetchTherapists = async () => {
  try {
    const response = await databases.listDocuments(
      'YOUR_DATABASE_ID',
      'therapists',
      [Query.equal('isLive', true)]
    );
    
    // Parse the string fields back to objects
    return response.documents.map(therapist => ({
      ...therapist,
      pricing: parsePricing(therapist.pricing),
      massageTypes: parseMassageTypes(therapist.massageTypes),
      coordinates: parseCoordinates(therapist.coordinates),
      analytics: parseAnalytics(therapist.analytics)
    }));
  } catch (error) {
    console.error('Error fetching therapists:', error);
    return [];
  }
};
```

### 7. Form Submission Example

```javascript
// When saving therapist data
const saveTherapist = async (therapistData) => {
  const appwriteData = {
    ...therapistData,
    pricing: stringifyPricing(therapistData.pricing),
    massageTypes: stringifyMassageTypes(therapistData.massageTypes),
    coordinates: stringifyCoordinates(therapistData.coordinates),
    analytics: stringifyAnalytics(therapistData.analytics)
  };
  
  await databases.createDocument(
    'YOUR_DATABASE_ID',
    'therapists', 
    'unique()',
    appwriteData
  );
};
```

This approach ensures your data is stored as strings in Appwrite while maintaining the object-based interface in your React application.