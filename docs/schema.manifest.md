# INDASTREET PRODUCTION SCHEMA MANIFEST (LOCKED)

⚠️ **CRITICAL**: This schema exists in production Appwrite database.
🚫 **DO NOT MODIFY**: AI tools must not alter existing schema without explicit approval.
📋 **SOURCE OF TRUTH**: Always refer to this file for accurate field definitions.

---

## Collection: `chat_rooms`

**Purpose**: Chat sessions between customers and therapists for booking coordination

| Field | Type | Required | Size | Nullable | Description |
|-------|------|----------|------|----------|-------------|
| `$id` | string | Auto | - | ❌ | Appwrite document ID |
| `customerId` | string | ✅ | 255 | ❌ | Customer user ID |
| `customerName` | string | ✅ | 255 | ❌ | Customer display name |
| `customerLanguage` | string | ✅ | 10 | ❌ | Language preference (en/id) |
| `therapistId` | string | ❌ | 255 | ✅ | Therapist user ID (nullable) |
| `therapistName` | string | ✅ | 255 | ❌ | Therapist display name |
| `bookingId` | string | ❌ | 100 | ✅ | Related booking ID (nullable) |
| `status` | string | ✅ | 50 | ❌ | Chat room status enum |
| `expiresAt` | datetime | ✅ | - | ❌ | Room expiration timestamp |
| `acceptedAt` | datetime | ❌ | - | ✅ | Booking acceptance timestamp |
| `declinedAt` | datetime | ❌ | - | ✅ | Booking decline timestamp |
| `unreadCount` | integer | ✅ | - | ❌ | Number of unread messages |
| `createdAt` | datetime | ✅ | - | ❌ | Manual creation timestamp |
| `updatedAt` | datetime | ✅ | - | ❌ | Manual update timestamp |
| `$createdAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |
| `$updatedAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |

**Status Values**: `pending`, `active`, `accepted`, `declined`, `expired`, `completed`, `cancelled`

---

## Collection: `chat_messages`

**Purpose**: Individual messages within chat rooms

| Field | Type | Required | Size | Nullable | Description |
|-------|------|----------|------|----------|-------------|
| `$id` | string | Auto | - | ❌ | Appwrite document ID |
| `roomId` | string | ✅ | 50 | ❌ | Reference to chat_rooms.$id |
| `senderId` | string | ✅ | 255 | ❌ | Message sender ID |
| `senderName` | string | ✅ | 255 | ❌ | Message sender name |
| `senderType` | string | ✅ | 50 | ❌ | Sender type enum |
| `message` | string | ✅ | 1000 | ❌ | Message content |
| `originalText` | string | ✅ | 1000 | ❌ | Original message text |
| `translatedText` | string | ❌ | 1000 | ✅ | Translated message |
| `originalLanguage` | string | ✅ | 10 | ❌ | Original language code |
| `translatedLanguage` | string | ❌ | 10 | ✅ | Translation language |
| `isRead` | boolean | ✅ | - | ❌ | Read status |
| `$createdAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |
| `$updatedAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |

**Sender Types**: `customer`, `therapist`, `place`, `system`

---

## Collection: `therapists`

**Purpose**: Massage therapist profiles and business information

| Field | Type | Required | Size | Nullable | Description |
|-------|------|----------|------|----------|-------------|
| `$id` | string | Auto | - | ❌ | Appwrite document ID |
| `name` | string | ✅ | 255 | ❌ | Therapist full name |
| `email` | string | ✅ | 255 | ❌ | Contact email address |
| `whatsappNumber` | string | ✅ | 20 | ❌ | WhatsApp contact number |
| `profileImage` | string | ❌ | 500 | ✅ | Profile photo URL |
| `description` | string | ❌ | 1000 | ✅ | Service description |
| `location` | string | ✅ | 255 | ❌ | Service location |
| `coordinates` | string | ❌ | 100 | ✅ | GPS coordinates JSON |
| `city` | string | ❌ | 100 | ✅ | Service city |
| `serviceAreas` | string | ❌ | 200 | ✅ | Service areas JSON |
| `price60` | string | ❌ | 10 | ✅ | 60-minute service price |
| `price90` | string | ❌ | 10 | ✅ | 90-minute service price |
| `price120` | string | ❌ | 10 | ✅ | 120-minute service price |
| `rating` | float | ✅ | - | ❌ | Average rating (0-5) |
| `reviewCount` | integer | ✅ | - | ❌ | Number of reviews |
| `isLive` | boolean | ✅ | - | ❌ | Service availability |
| `status` | string | ✅ | 50 | ❌ | Account status |
| `isVerified` | boolean | ✅ | - | ❌ | Verification status |
| `$createdAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |
| `$updatedAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |

---

## Collection: `places`

**Purpose**: Massage parlor/spa business profiles

| Field | Type | Required | Size | Nullable | Description |
|-------|------|----------|------|----------|-------------|
| `$id` | string | Auto | - | ❌ | Appwrite document ID |
| `name` | string | ✅ | 255 | ❌ | Business name |
| `email` | string | ✅ | 255 | ❌ | Business email |
| `whatsappNumber` | string | ✅ | 20 | ❌ | Business WhatsApp |
| `description` | string | ❌ | 1000 | ✅ | Business description |
| `location` | string | ✅ | 255 | ❌ | Business address |
| `coordinates` | string | ❌ | 100 | ✅ | GPS coordinates JSON |
| `city` | string | ❌ | 100 | ✅ | Business city |
| `openingTime` | string | ✅ | 10 | ❌ | Opening hours |
| `closingTime` | string | ✅ | 10 | ❌ | Closing hours |
| `price60` | string | ❌ | 10 | ✅ | 60-minute service price |
| `price90` | string | ❌ | 10 | ✅ | 90-minute service price |
| `price120` | string | ❌ | 10 | ✅ | 120-minute service price |
| `rating` | float | ✅ | - | ❌ | Average rating (0-5) |
| `reviewCount` | integer | ✅ | - | ❌ | Number of reviews |
| `isLive` | boolean | ✅ | - | ❌ | Service availability |
| `status` | string | ✅ | 50 | ❌ | Account status |
| `isVerified` | boolean | ✅ | - | ❌ | Verification status |
| `$createdAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |
| `$updatedAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |

---

## Collection: `users`

**Purpose**: Customer user accounts and profiles

| Field | Type | Required | Size | Nullable | Description |
|-------|------|----------|------|----------|-------------|
| `$id` | string | Auto | - | ❌ | Appwrite document ID |
| `name` | string | ✅ | 255 | ❌ | User full name |
| `email` | string | ✅ | 255 | ❌ | User email address |
| `phone` | string | ❌ | 20 | ✅ | Phone number |
| `profileImage` | string | ❌ | 500 | ✅ | Profile photo URL |
| `language` | string | ✅ | 10 | ❌ | Preferred language (en/id) |
| `location` | string | ❌ | 255 | ✅ | User location |
| `coordinates` | string | ❌ | 100 | ✅ | GPS coordinates JSON |
| `isActive` | boolean | ✅ | - | ❌ | Account status |
| `$createdAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |
| `$updatedAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |

---

## Collection: `bookings`

**Purpose**: Service booking records and transaction history

| Field | Type | Required | Size | Nullable | Description |
|-------|------|----------|------|----------|-------------|
| `$id` | string | Auto | - | ❌ | Appwrite document ID |
| `customerId` | string | ✅ | 255 | ❌ | Customer user ID |
| `customerName` | string | ✅ | 255 | ❌ | Customer name |
| `therapistId` | string | ❌ | 255 | ✅ | Assigned therapist ID |
| `therapistName` | string | ❌ | 255 | ✅ | Assigned therapist name |
| `placeId` | string | ❌ | 255 | ✅ | Assigned place ID |
| `placeName` | string | ❌ | 255 | ✅ | Assigned place name |
| `serviceType` | string | ✅ | 50 | ❌ | Service type (therapist/place) |
| `duration` | integer | ✅ | - | ❌ | Service duration (minutes) |
| `totalCost` | integer | ✅ | - | ❌ | Total booking cost |
| `location` | string | ✅ | 255 | ❌ | Service location |
| `coordinates` | string | ❌ | 100 | ✅ | Service coordinates JSON |
| `scheduledTime` | datetime | ✅ | - | ❌ | Scheduled service time |
| `status` | string | ✅ | 50 | ❌ | Booking status |
| `paymentStatus` | string | ✅ | 50 | ❌ | Payment status |
| `notes` | string | ❌ | 500 | ✅ | Special instructions |
| `$createdAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |
| `$updatedAt` | datetime | Auto | - | ❌ | Appwrite auto timestamp |

**Booking Status**: `pending`, `confirmed`, `in_progress`, `completed`, `cancelled`
**Payment Status**: `pending`, `paid`, `refunded`

---

## ⚡ Schema Validation Rules

1. **ID Fields**: All `*Id` fields must be valid Appwrite document IDs (strings)
2. **Timestamps**: Use ISO 8601 format for all datetime fields
3. **JSON Fields**: Coordinates, service areas, etc. must be valid JSON strings
4. **Enums**: Status fields must use only predefined values listed above
5. **Size Limits**: Respect field size constraints to prevent data truncation
6. **Nullability**: Only fields marked nullable can accept null/undefined values

---

## 🔒 Development Guidelines

- **READ ONLY**: This schema reflects production database structure
- **NO MODIFICATIONS**: Contact database admin before schema changes
- **VALIDATION**: All code must validate against these exact field definitions
- **COMPATIBILITY**: New features must work within existing constraints
- **TESTING**: Use schema-compliant test data only

---

**Last Updated**: January 20, 2026  
**Schema Version**: Production v2.1  
**Database**: Appwrite Cloud (syd.cloud.appwrite.io)  
**Project ID**: 68f23b11000d25eb3664