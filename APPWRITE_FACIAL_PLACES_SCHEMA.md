# Appwrite Facial Places Collection Schema

## Collection: `facial_places_collection`

This collection stores facial salons/spas with detailed service information and images stored in bucket `6932f43700113926eb80`.

### Collection Settings
- **Collection ID**: `facial_places_collection`
- **Database**: Use the same database as massage places
- **Image Bucket ID**: `6932f43700113926eb80`
- **Permissions**: 
  - Create: Users (authenticated)
  - Read: Any (public browsing)
  - Update: Document creator only
  - Delete: Document creator only

### Attributes

| Attribute | Type | Required | Size/Range | Default | Description |
|-----------|------|----------|------------|---------|-------------|
| $id | string | Auto | - | - | Document ID (auto-generated) |
| facialPlaceId | string | Yes | 64 | - | Unique identifier for facial place |
| collectionName | string | Yes | 255 | - | Collection identifier |
| category | enum | Yes | - | - | Facial spa category |
| name | string | No | 100 | NULL | Name of the facial place |
| description | string | No | 2000 | NULL | Detailed description of services |
| address | string | No | 255 | NULL | Physical address |
| websiteurl | string | No | 200 | NULL | Website URL |
| facialservices | string | No | 500 | NULL | JSON array of services offered |
| facialtypes | string | No | 500 | NULL | JSON array of facial treatment types |
| prices | string | No | 255 | NULL | JSON pricing structure |
| facialtimes | string | No | 255 | NULL | Available time slots |
| openclosetime | datetime | No | - | NULL | Opening/closing datetime |
| statusonline | string | No | 255 | NULL | Online status ("live", "offline") |
| discounted | boolean | No | - | NULL | Discount active flag |
| starrate | string | No | 200 | NULL | Star rating (0-5) |
| distancekm | string | No | 150 | NULL | Distance from user location |
| popularityScore | double | No | 0-5 | NULL | Popularity score (0-5) |
| averageSessionDuration | integer | No | 30-120 | 60 | Average session duration in minutes |
| equipmentList | string | No | 500 | NULL | JSON array of available equipment |
| dateadded | datetime | No | - | NULL | Date when place was added |
| lastUpdate | datetime | Yes | - | - | Last update timestamp |
| $createdAt | datetime | Auto | - | - | Creation timestamp (auto) |
| $updatedAt | datetime | Auto | - | - | Last update timestamp (auto) |

### Indexes
- `location` (key index for city filtering)
- `isLive` (boolean index for active filtering)
- `rating` (descending for sorting)
- `$createdAt` (datetime index for newest first)

### Example Document
```json
{
  "name": "Bali Glow Facial Spa",
  "description": "Premium facial treatments specializing in anti-aging and skin brightening therapies using organic products.",
  "mainImage": "https://example.com/facial-spa-cover.jpg",
  "profilePicture": "https://example.com/facial-spa-logo.jpg",
  "location": "Seminyak",
  "coordinates": "{\"lat\": -8.6917, \"lng\": 115.1685}",
  "whatsappNumber": "+6281234567890",
  "email": "info@baliglowfacial.com",
  "pricing": "{\"60\": 180, \"90\": 250, \"120\": 320}",
  "facialTypes": "[\"Anti-Aging\", \"Brightening\", \"Hydrating\", \"Acne Treatment\"]",
  "operatingHours": "10:00 AM - 8:00 PM",
  "openingTime": "10:00",
  "closingTime": "20:00",
  "rating": 4.8,
  "reviewCount": 45,
  "status": "live",
  "isLive": true,
  "isVerified": true,
  "verifiedAt": "2024-12-01T10:00:00.000Z",
  "amenities": "[\"AC\", \"WiFi\", \"Parking\", \"Private Rooms\"]",
  "languages": "[\"English\", \"Indonesian\"]",
  "yearsOfExperience": 5,
  "websiteUrl": "https://baliglowfacial.com",
  "therapistGender": "Female",
  "isDiscountActive": false,
  "discountPercentage": 0,
  "activeMembershipDate": "2024-01-15T00:00:00.000Z",
  "analytics": "{\"views\": 120, \"bookings\": 45, \"shares\": 12}"
}
```

## Setup Instructions

1. **Create Collection in Appwrite Console**
   - Go to your Appwrite Database
   - Click "Add Collection"
   - Name: "Facial Places"
   - Collection ID: `facial_places_collection_id`

2. **Add Attributes** (follow table above)

3. **Set Permissions**
   - Read: Any
   - Create: Users
   - Update: Document creator
   - Delete: Document creator

4. **Create Indexes**
   - location (key)
   - isLive (boolean)
   - rating (double, descending)
   - $createdAt (datetime, descending)

5. **Update Config File**
   Add to `lib/appwrite.config.ts`:
   ```typescript
   facial_places: 'facial_places_collection_id'
   ```

6. **Test with Sample Data**
   Use Appwrite Console to manually create 2-3 test facial places in different cities.
