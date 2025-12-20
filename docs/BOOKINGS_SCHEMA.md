# Bookings Collection Schema Update

## Required Attributes for My Bookings Feature

Add these attributes to your **bookings** collection in Appwrite:

### New Attributes:

| Attribute | Type | Size/Limits | Required | Default | Description |
|-----------|------|-------------|----------|---------|-------------|
| `source` | String | 20 | No | `platform` | Source of booking: `platform` or `manual` |
| `customerPhone` | String | 20 | No | NULL | Customer phone number for manual bookings |
| `location` | String | 255 | No | NULL | Booking location (hotel, address, etc.) |
| `notes` | String | 500 | No | NULL | Additional notes from therapist |
| `oneHourNotice` | Boolean | - | No | false | Customer acknowledged 1-hour minimum |

### Existing Attributes (verify these exist):

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookingId` | String (36) | Yes | Unique booking identifier |
| `bookingDate` | DateTime | Yes | Date of booking |
| `startTime` | String | Yes | Start time (HH:MM format) |
| `duration` | Integer | Yes | Duration in minutes |
| `providerId` | String | Yes | Therapist/place ID |
| `providerType` | String | Yes | 'therapist' or 'place' |
| `providerName` | String | Yes | Provider name |
| `userName` | String | No | Customer name from platform |
| `customerName` | String | No | Customer name (manual or platform) |
| `service` | String | Yes | Service duration ('60', '90', '120') |
| `status` | String | Yes | Booking status |
| `totalCost` | Integer | No | Total cost in IDR |
| `paymentMethod` | String | No | Payment method |
| `userId` | String | No | User ID from platform |
| `hotelId` | String | No | Hotel ID if hotel booking |
| `hotelGuestName` | String | No | Guest name if hotel |
| `hotelRoomNumber` | String | No | Room number if hotel |
| `responseDeadline` | DateTime | No | Therapist response deadline |
| `price` | Integer | No | Price in thousands |
| `createdAt` | DateTime | Auto | Creation timestamp |

## Permissions

Set these permissions on the bookings collection:

- **Read**: Any authenticated user
- **Create**: Any authenticated user
- **Update**: Any authenticated user (for status changes)
- **Delete**: Admins only

## Indexes

Create these indexes for better performance:

1. **providerId_index**: `providerId` (ASC) + `bookingDate` (DESC)
2. **date_index**: `bookingDate` (DESC)
3. **status_index**: `status` (ASC)
4. **source_index**: `source` (ASC)

## Implementation Notes

### 1-Hour Minimum Enforcement:
- All bookings validate startTime must be >= 1 hour from current time
- Validation occurs in `bookingService.create()`
- Error message: "Bookings require minimum 1 hour advance notice for preparation and travel time"

### Manual Booking Flow:
1. Therapist opens "My Bookings" page
2. Clicks "Add External Booking"
3. Fills form with customer details
4. System validates:
   - Required fields
   - 1-hour minimum time
   - No conflicts with existing bookings
5. Creates booking with `source: 'manual'`

### Conflict Detection:
- Checks all existing bookings for selected date
- Prevents overlapping time slots
- Shows clear error if conflict detected

### Customer Notifications:
- Platform bookings auto-notify about 1-hour requirement
- `oneHourNotice: true` flag confirms customer acknowledgment
- Therapist receives notification about new bookings
