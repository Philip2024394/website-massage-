# Appwrite Database Collections Schema

**Project ID:** `68f23b11000d25eb3664`  
**Database ID:** `68f76ee1000e64ca8d05`  
**Endpoint:** `https://syd.cloud.appwrite.io/v1`

---

## 📊 Collections Overview

| # | Collection Name | Collection ID | Purpose |
|---|-----------------|---------------|---------|
| 1 | Admins | `admins_collection_id` | Admin user accounts |
| 2 | Therapists | `therapists_collection_id` | Massage therapist profiles |
| 3 | Places | `places_collection_id` | Massage service locations |
| 4 | Agents | `agents_collection_id` | Sales agent accounts |
| 5 | Bookings | `bookings_collection_id` | Customer bookings |
| 6 | Hotel Bookings | `hotel_bookings` | Hotel/villa bookings |
| 7 | Reviews | `reviews_collection_id` | Customer reviews |
| 8 | Notifications | `notifications_collection_id` | User notifications |
| 9 | Users | `users_collection_id` | Customer accounts |
| 10 | Hotels | `hotels_collection_id` | Hotel/villa venues |
| 11 | Massage Types | `massage_types_collection_id` | Service catalog |
| 12 | Membership Pricing | `membership_pricing_collection_id` | Pricing tiers |
| 13 | Image Assets | `image_assets` | Image storage metadata |
| 14 | Login Backgrounds | `login_backgrounds` | Login page images |
| 15 | Custom Links | `custom_links_collection_id` | Custom URL redirects |
| 16 | Translations | `translations_collection_id` | i18n content |
| 17 | Commission Records | `commission_records` | Agent commissions |
| 18 | Attributes | `attributes` | Dynamic metadata |
| 19 | Analytics Events | `analytics_events` | User tracking |
| 20 | Therapist Job Listings | `therapist_job_listings` | Job opportunity registrations |
| 21 | Employer Job Postings | `employer_job_postings` | Job opening listings |

---

## 1️⃣ Admins Collection
**Collection ID:** `admins_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| username | String | ✅ | Admin login username |
| password | String | ✅ | Hashed password |
| email | String | ✅ | Admin email |
| role | String | ✅ | Admin role (super/regular) |
| createdAt | DateTime | ✅ | Account creation date |
| lastLogin | DateTime | ❌ | Last login timestamp |

---

## 2️⃣ Therapists Collection
**Collection ID:** `therapists_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | ✅ | Therapist full name |
| description | String | ❌ | Bio/description |
| profilePicture | String (URL) | ❌ | Profile photo URL |
| mainImage | String (URL) | ❌ | Main display image |
| whatsappNumber | String | ✅ | Contact number |
| email | String | ✅ | Email address |
| password | String | ✅ | Hashed password |
| yearsOfExperience | Integer | ❌ | Years of experience |
| massageTypes | String (JSON) | ❌ | Array of massage types |
| languages | String (JSON) | ❌ | Languages spoken |
| pricing | String (JSON) | ✅ | {60: price, 90: price, 120: price} |
| hourlyRate | Integer | ✅ | Base hourly rate (50-500 range) |
| location | String | ✅ | Address/location |
| coordinates | String (JSON) | ❌ | {lat: number, lng: number} |
| status | String | ✅ | Available/Busy/Offline |
| isLive | Boolean | ✅ | Admin approval status |
| rating | Float | ❌ | Average rating (0-5) |
| reviewCount | Integer | ❌ | Number of reviews |
| isLicensed | Boolean | ❌ | License verification |
| licenseNumber | String | ❌ | License ID |
| activeMembershipDate | DateTime | ❌ | Membership expiry |
| analytics | String (JSON) | ❌ | {impressions, profileViews, whatsappClicks} |
| hotelVillaServiceStatus | String | ❌ | NotOptedIn/Active/Inactive |
| hotelDiscount | Integer | ❌ | Hotel discount % |
| villaDiscount | Integer | ❌ | Villa discount % |
| serviceRadius | Integer | ❌ | Service radius (km) |
| createdAt | DateTime | ✅ | Profile creation date |

---

## 3️⃣ Places Collection
**Collection ID:** `places_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | ✅ | Business name |
| description | String | ❌ | Business description |
| mainImage | String (URL) | ❌ | Main photo |
| whatsappNumber | String | ✅ | Contact number |
| email | String | ✅ | Email address |
| password | String | ✅ | Hashed password |
| massageTypes | String (JSON) | ❌ | Services offered |
| pricing | String (JSON) | ✅ | {60: price, 90: price, 120: price} |
| location | String | ✅ | Address |
| coordinates | String (JSON) | ❌ | {lat: number, lng: number} |
| operatingHours | String | ❌ | Business hours |
| status | String | ✅ | Open/Closed |
| isLive | Boolean | ✅ | Admin approval |
| rating | Float | ❌ | Average rating |
| reviewCount | Integer | ❌ | Review count |
| activeMembershipDate | DateTime | ❌ | Membership expiry |
| analytics | String (JSON) | ❌ | Analytics data |
| createdAt | DateTime | ✅ | Creation date |

---

## 4️⃣ Agents Collection
**Collection ID:** `agents_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | ✅ | Agent full name |
| email | String | ✅ | Email address |
| password | String | ✅ | Hashed password |
| whatsappNumber | String | ✅ | Contact number |
| commissionRate | Integer | ✅ | Commission % (20 or 23) |
| tier | String | ✅ | Standard/Toptier |
| isActive | Boolean | ✅ | Account status |
| totalEarnings | Float | ❌ | Lifetime earnings |
| clients | String (JSON) | ❌ | Array of client IDs |
| createdAt | DateTime | ✅ | Registration date |

---

## 5️⃣ Bookings Collection
**Collection ID:** `bookings_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String | ✅ | Customer ID |
| userName | String | ✅ | Customer name |
| providerId | String | ✅ | Therapist/Place ID |
| providerType | String | ✅ | therapist/place |
| service | String | ✅ | Service duration (60/90/120) |
| startTime | DateTime | ✅ | Booking start time |
| status | String | ✅ | Pending/Confirmed/Completed/Cancelled |
| location | String | ✅ | Service location |
| price | Float | ✅ | Total price |
| agentId | String | ❌ | Referring agent ID |
| commission | Float | ❌ | Agent commission amount |
| createdAt | DateTime | ✅ | Booking creation time |

---

## 6️⃣ Hotel Bookings Collection
**Collection ID:** `hotel_bookings`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| hotelId | String | ✅ | Hotel/villa ID |
| guestName | String | ✅ | Guest name |
| guestRoom | String | ✅ | Room number |
| therapistId | String | ✅ | Assigned therapist |
| service | String | ✅ | Service type |
| duration | Integer | ✅ | Minutes (60/90/120) |
| scheduledTime | DateTime | ✅ | Appointment time |
| status | String | ✅ | Pending/Confirmed/Completed |
| price | Float | ✅ | Service price |
| discount | Float | ❌ | Discount applied |
| finalPrice | Float | ✅ | Price after discount |
| createdAt | DateTime | ✅ | Booking time |

---

## 7️⃣ Reviews Collection
**Collection ID:** `reviews_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| userId | String | ✅ | Reviewer ID |
| providerId | String | ✅ | Therapist/Place ID |
| providerType | String | ✅ | therapist/place |
| rating | Integer | ✅ | Rating 1-5 stars |
| comment | String | ❌ | Review text |
| createdAt | DateTime | ✅ | Review date |

---

## 8️⃣ Notifications Collection
**Collection ID:** `notifications_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| providerId | String | ✅ | Recipient ID |
| type | String | ✅ | booking/review/system |
| title | String | ✅ | Notification title |
| message | String | ✅ | Notification body |
| isRead | Boolean | ✅ | Read status |
| createdAt | DateTime | ✅ | Notification time |
| relatedId | String | ❌ | Related entity ID |

---

## 9️⃣ Users Collection
**Collection ID:** `users_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | ✅ | Customer name |
| email | String | ✅ | Email address |
| password | String | ✅ | Hashed password |
| phone | String | ❌ | Phone number |
| preferredLanguage | String | ❌ | en/id |
| bookingHistory | String (JSON) | ❌ | Array of booking IDs |
| createdAt | DateTime | ✅ | Registration date |

---

## 🔟 Hotels Collection
**Collection ID:** `hotels_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | ✅ | Hotel/villa name |
| type | String | ✅ | hotel/villa |
| location | String | ✅ | Address |
| contactPerson | String | ✅ | Manager name |
| email | String | ✅ | Email |
| password | String | ✅ | Hashed password |
| whatsappNumber | String | ✅ | Contact number |
| qrCodeEnabled | Boolean | ✅ | QR menu enabled |
| partnerTherapists | String (JSON) | ❌ | Array of therapist IDs |
| discountRate | Integer | ❌ | Standard discount % |
| isActive | Boolean | ✅ | Account status |
| createdAt | DateTime | ✅ | Registration date |

---

## 1️⃣1️⃣ Massage Types Collection
**Collection ID:** `massage_types_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | ✅ | Massage type name |
| category | String | ✅ | Traditional/Modern/Wellness |
| description | String | ❌ | Description |
| icon | String | ❌ | Icon URL/name |
| isActive | Boolean | ✅ | Available status |
| order | Integer | ❌ | Display order |

---

## 1️⃣2️⃣ Membership Pricing Collection
**Collection ID:** `membership_pricing_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| tier | String | ✅ | Basic/Premium/Enterprise |
| duration | Integer | ✅ | Months (1/3/6/12) |
| price | Float | ✅ | Price in Rupiah |
| features | String (JSON) | ✅ | Array of features |
| isActive | Boolean | ✅ | Available for purchase |
| discount | Integer | ❌ | Discount % |

---

## 1️⃣3️⃣ Image Assets Collection
**Collection ID:** `image_assets`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| fileName | String | ✅ | Original filename |
| url | String | ✅ | CDN/storage URL |
| fileId | String | ✅ | Appwrite file ID |
| type | String | ✅ | profile/main/background |
| ownerId | String | ✅ | Owner entity ID |
| ownerType | String | ✅ | therapist/place/hotel |
| mimeType | String | ✅ | image/jpeg, etc. |
| size | Integer | ✅ | File size in bytes |
| uploadedAt | DateTime | ✅ | Upload timestamp |

---

## 1️⃣4️⃣ Login Backgrounds Collection
**Collection ID:** `login_backgrounds`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| title | String | ✅ | Image title |
| url | String | ✅ | Image URL |
| fileId | String | ✅ | Appwrite file ID |
| isActive | Boolean | ✅ | Currently displayed |
| order | Integer | ❌ | Display priority |
| uploadedAt | DateTime | ✅ | Upload date |

---

## 1️⃣5️⃣ Custom Links Collection
**Collection ID:** `custom_links_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| slug | String | ✅ | URL slug (unique) |
| targetUrl | String | ✅ | Redirect destination |
| title | String | ❌ | Link title |
| description | String | ❌ | Link description |
| clicks | Integer | ❌ | Click counter |
| isActive | Boolean | ✅ | Link status |
| createdAt | DateTime | ✅ | Creation date |

---

## 1️⃣6️⃣ Translations Collection
**Collection ID:** `translations_collection_id`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| key | String | ✅ | Translation key (unique) |
| en | String | ✅ | English text |
| id | String | ✅ | Indonesian text |
| category | String | ❌ | ui/messages/errors |
| updatedAt | DateTime | ✅ | Last update |

---

## 1️⃣7️⃣ Commission Records Collection
**Collection ID:** `commission_records`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| agentId | String | ✅ | Agent ID |
| bookingId | String | ✅ | Related booking |
| clientId | String | ✅ | Customer ID |
| amount | Float | ✅ | Commission amount |
| rate | Integer | ✅ | Commission % used |
| status | String | ✅ | pending/paid |
| paidAt | DateTime | ❌ | Payment date |
| createdAt | DateTime | ✅ | Record creation |

---

## 1️⃣8️⃣ Attributes Collection
**Collection ID:** `attributes`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| entityType | String | ✅ | therapist/place/hotel |
| entityId | String | ✅ | Entity ID |
| key | String | ✅ | Attribute key |
| value | String | ✅ | Attribute value (JSON) |
| dataType | String | ✅ | string/number/boolean/json |
| updatedAt | DateTime | ✅ | Last update |

---

## 1️⃣9️⃣ Analytics Events Collection
**Collection ID:** `analytics_events`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| eventType | String | ✅ | impression/view/click |
| entityType | String | ✅ | therapist/place/hotel |
| entityId | String | ✅ | Entity ID |
| userId | String | ❌ | User who triggered |
| sessionId | String | ❌ | Session identifier |
| metadata | String (JSON) | ❌ | Additional data |
| createdAt | DateTime | ✅ | Event timestamp |

---

## 2️⃣0️⃣ Therapist Job Listings Collection
**Collection ID:** `therapist_job_listings`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| listingId | Integer | ✅ | Unique listing identifier (1-1000000) |
| jobTitle | String (128) | ✅ | Job title / position sought |
| jobDescription | String (500) | ✅ | Brief description of experience & goals |
| requiredLicenses | String (256) | ❌ | Licenses & certifications |
| applicationDeadline | DateTime | ❌ | Optional deadline for applications |
| jobType | String (64) | ✅ | Type: job-seeking/available/etc. |
| location | String (128) | ❌ | Current location |
| therapistId | String (100) | ✅ | Therapist reference |
| therapistName | String (255) | ✅ | Cached name |
| willingToRelocateDomestic | Boolean | ✅ | Indonesia relocation |
| willingToRelocateInternational | Boolean | ✅ | International relocation |
| availability | String (50) | ✅ | full-time/part-time/both |
| minimumSalary | String (100) | ✅ | Monthly salary (Rupiah) |
| preferredLocations | String[] (2000) | ✅ | Array of cities |
| accommodation | String (50) | ✅ | required/preferred/not-required |
| experienceYears | Integer | ❌ | Years experience |
| specializations | String[] (2000) | ❌ | Massage types array |
| languages | String[] (500) | ❌ | Languages spoken array |
| isActive | Boolean | ✅ | Listing status |
| listingDate | DateTime | ✅ | Registration date |
| expiryDate | DateTime | ✅ | 1 year from listing |

---

## 2️⃣1️⃣ Employer Job Postings Collection
**Collection ID:** `employer_job_postings`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| jobTitle | String (128) | ✅ | Main job title |
| jobDescription | String (1000) | ✅ | Detailed job description |
| employmentType | String (64) | ✅ | full-time/part-time/contract/freelance |
| location | String (128) | ❌ | Specific location/address |
| salaryRangeMin | Integer | ❌ | Minimum salary (min: 0) |
| salaryRangeMax | Integer | ❌ | Maximum salary (min: 0) |
| applicationDeadline | DateTime | ❌ | Application deadline |
| businessName | String (255) | ✅ | Company name |
| businessType | String (100) | ✅ | hotel/spa/wellness-center/resort/home-service/other |
| contactPerson | String (255) | ✅ | HR manager name |
| contactEmail | String (255) | ✅ | Contact email |
| contactPhone | String (50) | ❌ | Phone number |
| country | String (100) | ✅ | Indonesia/international |
| city | String (255) | ✅ | City/location |
| positionTitle | String (255) | ✅ | Alternative position title |
| numberOfPositions | Integer | ✅ | Number of openings |
| salaryMin | String (100) | ❌ | Minimum salary (string format) |
| salaryMax | String (100) | ❌ | Maximum salary (string format) |
| accommodationProvided | Boolean | ✅ | Accommodation offered |
| accommodationDetails | String (1000) | ❌ | Accommodation details |
| workType | String (50) | ✅ | full-time/part-time/contract |
| requirements | String[] (2000) | ❌ | Array of requirements |
| benefits | String[] (2000) | ❌ | Array of benefits |
| startDate | String (100) | ❌ | Expected start date |
| postedDate | DateTime | ✅ | Posted timestamp |
| status | String (50) | ❌ | active/filled/closed |
| views | Integer | ❌ | View counter (default: 0) |
| applications | Integer | ❌ | Application count (default: 0) |

---

## 📝 Data Type Legend

| Type | Description | Example |
|------|-------------|---------|
| String | Text data | "John Doe" |
| String (JSON) | JSON string | '["Thai", "Balinese"]' |
| String (URL) | URL/path | "https://..." |
| Integer | Whole number | 5 |
| Float | Decimal number | 149.99 |
| Boolean | True/false | true |
| DateTime | ISO timestamp | "2025-10-27T10:30:00.000Z" |

---

## 🔒 Permissions Reference

### Recommended Permission Structure

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| Admins | Role:admin | Role:admin | Role:admin | Role:admin |
| Therapists | Any | Any | Owner + Admin | Admin |
| Places | Any | Any | Owner + Admin | Admin |
| Agents | Role:admin | Role:admin | Owner + Admin | Admin |
| Bookings | User + Provider | User | User + Provider | User + Admin |
| Hotel Bookings | Hotel + Admin | Hotel | Hotel + Admin | Hotel + Admin |
| Reviews | Any | User | Owner | Admin |
| Notifications | Owner | System | Owner | Owner |
| Users | Owner + Admin | Any | Owner | Owner + Admin |
| Hotels | Admin | Admin | Owner + Admin | Admin |
| Massage Types | Any | Admin | Admin | Admin |
| Membership Pricing | Any | Admin | Admin | Admin |
| Image Assets | Any | Authenticated | Owner + Admin | Owner + Admin |
| Login Backgrounds | Any | Admin | Admin | Admin |
| Custom Links | Any | Admin | Admin | Admin |
| Translations | Any | Admin | Admin | Admin |
| Commission Records | Agent + Admin | System | Admin | Admin |
| Attributes | Any | Authenticated | Owner + Admin | Admin |
| Analytics Events | Admin | Any | System | Admin |
| Therapist Job Listings | Any | Therapist | Owner | Owner + Admin |
| Employer Job Postings | Any | Any | Owner + Admin | Owner + Admin |

---

## 🎯 Quick Setup Commands

### Create All Collections (Pseudo-code)

```javascript
// Use Appwrite Console or SDK to create these collections
// Set appropriate permissions for each collection
// Configure indexes for frequently queried fields

// Example indexes to create:
// - therapists: isLive, status, location
// - places: isLive, status, location
// - bookings: userId, providerId, status, startTime
// - hotel_bookings: hotelId, therapistId, status, scheduledTime
// - reviews: providerId, rating
// - analytics_events: entityType, entityId, eventType, createdAt
```

---

**Last Updated:** October 27, 2025  
**Version:** 2.0  
**Total Collections:** 21
