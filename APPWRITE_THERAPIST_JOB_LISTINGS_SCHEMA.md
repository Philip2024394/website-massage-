# Appwrite Collection Schema: therapist_job_listings

## Collection Details

**Collection ID:** `therapist_job_listings`  
**Database ID:** `68f76ee1000e64ca8d05`  
**Project ID:** `68f23b11000d25eb3664`  
**Endpoint:** https://syd.cloud.appwrite.io/v1

---

## Purpose

This collection stores job listings created by therapists who are seeking employment opportunities. Therapists can create profiles showcasing their skills, experience, and job preferences to be discovered by potential employers (hotels, spas, massage places).

---

## Attributes Schema

### Required Attributes

| Attribute Name | Type | Size | Required | Default | Description |
|---------------|------|------|----------|---------|-------------|
| `listingId` | integer | - | ✅ Yes | - | Unique listing identifier (timestamp) |
| `therapistId` | string | 255 | ✅ Yes | - | ID of the therapist creating the listing |
| `therapistName` | string | 255 | ✅ Yes | - | Display name of the therapist |
| `jobTitle` | string | 500 | ✅ Yes | - | Title of job seeking profile (e.g., "Experienced Balinese Massage Therapist") |
| `jobDescription` | string | 5000 | ✅ Yes | - | Detailed description of skills, experience, and what therapist is seeking |
| `isActive` | boolean | - | ✅ Yes | true | Whether the listing is currently active |
| `listingDate` | datetime | - | ✅ Yes | - | When the listing was created (ISO 8601 format) |
| `expiryDate` | datetime | - | ✅ Yes | - | When the listing expires (1 year from creation) |

### Optional Attributes

| Attribute Name | Type | Size | Required | Default | Description |
|---------------|------|------|----------|---------|-------------|
| `jobType` | string | 100 | ❌ No | 'job-seeking' | Type of listing (always 'job-seeking' for therapists) |
| `location` | string | 255 | ❌ No | null | Current location of therapist |
| `willingToRelocateDomestic` | boolean | - | ❌ No | false | Willing to relocate within Indonesia |
| `willingToRelocateInternational` | boolean | - | ❌ No | false | Willing to relocate internationally |
| `availability` | string | 50 | ❌ No | 'full-time' | Job availability: 'full-time', 'part-time', or 'both' |
| `minimumSalary` | string | 255 | ❌ No | null | Minimum salary expectation (e.g., "IDR 5,000,000/month") |
| `preferredLocations` | string[] | - | ❌ No | [] | Array of preferred work locations |
| `accommodation` | string | 50 | ❌ No | 'required' | Accommodation needs: 'required', 'preferred', 'not-required' |
| `experienceYears` | integer | - | ❌ No | null | Years of massage therapy experience |
| `specializations` | string[] | - | ❌ No | [] | Array of massage specializations (e.g., ['Balinese', 'Deep Tissue', 'Swedish']) |
| `languages` | string[] | - | ❌ No | [] | Array of languages spoken (e.g., ['Indonesian', 'English', 'Mandarin']) |
| `requiredLicenses` | string | 1000 | ❌ No | null | Required licenses/certifications the therapist has |
| `applicationDeadline` | datetime | - | ❌ No | null | Deadline for employers to contact (if applicable) |

---

## Index Configuration

### Recommended Indexes

1. **therapistId_index**
   - Type: Key
   - Attributes: `therapistId`
   - Order: ASC

2. **isActive_index**
   - Type: Key
   - Attributes: `isActive`
   - Order: ASC

3. **listingDate_index**
   - Type: Key
   - Attributes: `listingDate`
   - Order: DESC

4. **location_index**
   - Type: Fulltext
   - Attributes: `location`

5. **specializations_index**
   - Type: Fulltext
   - Attributes: `specializations`

---

## Permissions

### Document Security

**Create Permissions:**
- `role:all` - Any authenticated user can create (therapists)

**Read Permissions:**
- `role:all` - Anyone can view job listings (including guests)

**Update Permissions:**
- `user:[USER_ID]` - Only the therapist who created can update
- `role:admin` - Admins can update

**Delete Permissions:**
- `user:[USER_ID]` - Only the therapist who created can delete
- `role:admin` - Admins can delete

---

## Sample Document

```json
{
  "$id": "unique_document_id",
  "$createdAt": "2025-11-01T10:30:00.000+00:00",
  "$updatedAt": "2025-11-01T10:30:00.000+00:00",
  "$permissions": [
    "read(\"role:all\")",
    "update(\"user:therapist123\")",
    "delete(\"user:therapist123\")"
  ],
  "listingId": 1730459400000,
  "therapistId": "therapist123",
  "therapistName": "Ketut Maya",
  "jobTitle": "Experienced Balinese Massage Therapist - Seeking Hotel Position",
  "jobDescription": "Certified Balinese massage therapist with 8+ years experience. Specialized in traditional Balinese massage, deep tissue, hot stone, and aromatherapy. Seeking full-time position at luxury hotel or spa. Excellent customer service skills and fluent in Indonesian, English, and basic Mandarin.",
  "jobType": "job-seeking",
  "location": "Ubud, Bali",
  "willingToRelocateDomestic": true,
  "willingToRelocateInternational": false,
  "availability": "full-time",
  "minimumSalary": "IDR 6,500,000/month",
  "preferredLocations": ["Bali", "Jakarta", "Lombok", "Bandung"],
  "accommodation": "preferred",
  "experienceYears": 8,
  "specializations": ["Balinese Massage", "Deep Tissue", "Hot Stone", "Aromatherapy", "Reflexology"],
  "languages": ["Indonesian", "English", "Mandarin (basic)"],
  "requiredLicenses": "Certified by Bali Massage Association (BMA), First Aid certified",
  "applicationDeadline": "2026-02-01T00:00:00.000+00:00",
  "isActive": true,
  "listingDate": "2025-11-01T10:30:00.000+00:00",
  "expiryDate": "2026-11-01T10:30:00.000+00:00"
}
```

---

## Setup Instructions

### Step 1: Create Collection in Appwrite Console

1. Go to **Appwrite Console**: https://syd.cloud.appwrite.io
2. Select Project: **68f23b11000d25eb3664**
3. Navigate to **Databases** → Database **68f76ee1000e64ca8d05**
4. Click **"Add Collection"**
5. Set **Collection ID**: `therapist_job_listings`
6. Set **Collection Name**: `Therapist Job Listings`
7. Click **"Create"**

### Step 2: Add Attributes

In the collection, go to the **Attributes** tab and add each attribute:

#### Required String Attributes:
```
1. therapistId
   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

2. therapistName
   - Type: String
   - Size: 255
   - Required: Yes
   - Array: No

3. jobTitle
   - Type: String
   - Size: 500
   - Required: Yes
   - Array: No

4. jobDescription
   - Type: String
   - Size: 5000
   - Required: Yes
   - Array: No
```

#### Optional String Attributes:
```
5. jobType
   - Type: String
   - Size: 100
   - Required: No
   - Default: 'job-seeking'
   - Array: No

6. location
   - Type: String
   - Size: 255
   - Required: No
   - Array: No

7. availability
   - Type: String
   - Size: 50
   - Required: No
   - Default: 'full-time'
   - Array: No

8. minimumSalary
   - Type: String
   - Size: 255
   - Required: No
   - Array: No

9. accommodation
   - Type: String
   - Size: 50
   - Required: No
   - Default: 'required'
   - Array: No

10. requiredLicenses
    - Type: String
    - Size: 1000
    - Required: No
    - Array: No
```

#### Boolean Attributes:
```
11. isActive
    - Type: Boolean
    - Required: Yes
    - Default: true
    - Array: No

12. willingToRelocateDomestic
    - Type: Boolean
    - Required: No
    - Default: false
    - Array: No

13. willingToRelocateInternational
    - Type: Boolean
    - Required: No
    - Default: false
    - Array: No
```

#### Integer Attributes:
```
14. listingId
    - Type: Integer
    - Required: Yes
    - Min: 0
    - Max: No limit
    - Array: No

15. experienceYears
    - Type: Integer
    - Required: No
    - Min: 0
    - Max: 100
    - Array: No
```

#### DateTime Attributes:
```
16. listingDate
    - Type: DateTime
    - Required: Yes
    - Array: No

17. expiryDate
    - Type: DateTime
    - Required: Yes
    - Array: No

18. applicationDeadline
    - Type: DateTime
    - Required: No
    - Array: No
```

#### String Array Attributes:
```
19. preferredLocations
    - Type: String
    - Size: 255
    - Required: No
    - Array: Yes (enable array)

20. specializations
    - Type: String
    - Size: 255
    - Required: No
    - Array: Yes (enable array)

21. languages
    - Type: String
    - Size: 100
    - Required: No
    - Array: Yes (enable array)
```

### Step 3: Configure Indexes

Go to **Indexes** tab and create:

1. **Index Key**: `therapistId_idx`
   - Type: Key
   - Attributes: `therapistId` (ASC)

2. **Index Key**: `isActive_idx`
   - Type: Key
   - Attributes: `isActive` (ASC)

3. **Index Key**: `listingDate_idx`
   - Type: Key
   - Attributes: `listingDate` (DESC)

4. **Index Fulltext**: `location_search`
   - Type: Fulltext
   - Attributes: `location`

5. **Index Fulltext**: `specializations_search`
   - Type: Fulltext
   - Attributes: `specializations`

### Step 4: Set Permissions

Go to **Settings** → **Permissions**:

**Document-level permissions** (recommended):

- **Create**: `role:all`
- **Read**: `role:all`
- **Update**: `user:[USER_ID]`, `role:admin`
- **Delete**: `user:[USER_ID]`, `role:admin`

---

## Integration Status

### ✅ Code Already Integrated

The following pages are already configured to use this collection:

1. **TherapistJobOpportunitiesPage.tsx**
   - Creates job listings
   - Checks opt-in status
   - Updates existing listings
   - Handles payment (Rp 200,000 for 1 year)

2. **MassageJobsPage.tsx**
   - Lists all active job postings
   - "Create Profile" button triggers the flow

3. **App.tsx**
   - Route: `'therapistJobRegistration'`
   - Handler: `handleNavigateToTherapistProfileCreation()`

### ✅ Features Working

- ✅ Create therapist job listing
- ✅ Update existing listing
- ✅ Check if therapist already has active listing
- ✅ 1-year expiry automatic
- ✅ Payment integration (Rp 200,000)
- ✅ Form validation
- ✅ Active/inactive status

---

## Testing

After creating the collection, test the flow:

1. Navigate to **Massage Jobs** page (`#massageJobs`)
2. Switch to **"Therapists Seeking Jobs"** tab
3. Click **"Create Profile"** button
4. Fill out the form
5. Accept terms and conditions
6. Click submit
7. Verify document is created in Appwrite console

---

## Collection Created By

**Date:** November 1, 2025  
**Developer:** GitHub Copilot  
**Project:** IndaStreet Massage Platform  
**Version:** 2.0.0

---

## Status

⚠️ **COLLECTION NEEDS TO BE CREATED IN APPWRITE CONSOLE**

Once created, the feature will be fully operational with zero code changes needed.

---

## Support

For issues or questions:
- Check browser console for errors
- Verify collection ID matches: `therapist_job_listings`
- Ensure all attributes are created with correct types
- Check permissions allow create/read/update/delete

