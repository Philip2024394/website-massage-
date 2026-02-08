# SafePass System Documentation

## Overview

The SafePass system is a comprehensive certification platform for therapists and places (hotels, villas, etc.) that ensures compliance with safety and quality standards for massage services.

## Architecture

### Components

1. **SafePass Service** (`src/services/safePassService.ts`)
   - Handles all CRUD operations for SafePass applications
   - Manages file uploads for supporting documents
   - Provides application status management

2. **Admin Management Page** (`src/pages/admin/AdminSafePassManagement.tsx`)
   - View all SafePass applications
   - Filter by status (pending, approved, active, rejected)
   - Approve/reject applications
   - Activate SafePass certificates
   - Revoke active SafePass

3. **Therapist Application Page** (`src/pages/therapist/TherapistSafePassApplication.tsx`)
   - Submit SafePass application
   - Upload supporting documents
   - View application status
   - Track approval progress

4. **Place Application Page** (`src/pages/place/PlaceSafePassApplication.tsx`)
   - Submit SafePass application for establishments
   - Upload business documents
   - Monitor application status

### Database Schema

**Collection:** `safepass`

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| `$id` | string | ✅ | Document ID |
| `entityType` | enum | ✅ | 'therapist' or 'place' |
| `entityId` | string | ✅ | Reference to therapist/place ID |
| `entityName` | string | ✅ | Name for display |
| `hotelVillaSafePassStatus` | enum | ✅ | 'pending', 'approved', 'active', 'rejected' |
| `hasSafePassVerification` | boolean | ✅ | Display badge flag |
| `hotelVillaLetters` | string (200) | ⚪ | JSON array of document URLs |
| `safePassSubmittedAt` | datetime | ✅ | Submission timestamp |
| `safePassApprovedAt` | datetime | ⚪ | Approval timestamp |
| `safePassApprovedBy` | string (200) | ⚪ | Admin ID |
| `safePassRejectionReason` | string (400) | ⚪ | Rejection reason |
| `safePassIssuedAt` | datetime | ✅ | Issuance timestamp |
| `safePassExpiry` | datetime | ✅ | Expiry date (2 years) |
| `safePassCardUrl` | string (250) | ⚪ | SafePass card image URL |
| `safePassPaymentId` | string (250) | ⚪ | Payment reference |
| `$createdAt` | datetime | ✅ | Auto-generated |
| `$updatedAt` | datetime | ✅ | Auto-generated |

## Workflow

### 1. Application Submission

**Therapist/Place:**
1. Navigate to SafePass application page
2. Fill in payment reference ID
3. Upload supporting documents:
   - Company letter/business license
   - Police clearance certificate (SKCK)
   - Health certificate
   - Facility photos (for places)
4. Submit application

**System:**
- Creates SafePass record with status `'pending'`
- Sets initial expiry date (2 years from submission)
- Stores document URLs

### 2. Admin Review

**Admin:**
1. Access Admin SafePass Management page
2. View all pending applications
3. Review submitted documents
4. Make decision:
   - **Approve:** Status → `'approved'`
   - **Reject:** Status → `'rejected'` + reason

### 3. SafePass Activation

**Admin (for approved applications):**
1. Click "Activate SafePass"
2. Optionally upload SafePass card image
3. Confirm activation

**System:**
- Status → `'active'`
- `hasSafePassVerification` → `true`
- Updates issue date and expiry date
- SafePass valid for 2 years

### 4. SafePass Revocation

**Admin:**
1. For any active SafePass
2. Click "Revoke SafePass"
3. Provide revocation reason
4. Confirm

**System:**
- Status → `'rejected'`
- `hasSafePassVerification` → `false`
- Stores revocation reason

## Routes

### Admin Routes

```typescript
// Admin SafePass Management
/admin/safepass
```

### Therapist Routes

```typescript
// Existing SafePass info page (legacy)
/therapist/hotel-villa-safe-pass

// New SafePass Application
/therapist/safepass-apply
```

### Place Routes

```typescript
// SafePass Application
/place/safepass-apply
```

## API Usage

### Submit Application

```typescript
import safePassService from '@/services/safePassService';

const application = await safePassService.submitApplication({
    entityType: 'therapist', // or 'place'
    entityId: 'therapist-123',
    entityName: 'John Doe',
    hotelVillaLetters: ['url1', 'url2'],
    safePassPaymentId: 'PAY-123456'
});
```

### Upload Document

```typescript
const file = document.querySelector('input[type="file"]').files[0];
const url = await safePassService.uploadLetter(file);
```

### Get Application by Entity

```typescript
const application = await safePassService.getApplicationByEntity(
    'therapist',
    'therapist-123'
);
```

### Approve Application

```typescript
await safePassService.approveApplication({
    applicationId: 'app-123',
    approved: true,
    adminId: 'admin-456'
});
```

### Reject Application

```typescript
await safePassService.approveApplication({
    applicationId: 'app-123',
    approved: false,
    adminId: 'admin-456',
    rejectionReason: 'Incomplete documentation'
});
```

### Activate SafePass

```typescript
await safePassService.activateApplication({
    applicationId: 'app-123',
    safePassCardUrl: 'https://example.com/card.jpg'
});
```

### Revoke SafePass

```typescript
await safePassService.revokeApplication(
    'app-123',
    'Policy violation'
);
```

## Environment Variables

```env
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=68f23b11000d25eb3664
VITE_APPWRITE_DATABASE_ID=68f76ee1000e64ca8d05
VITE_APPWRITE_BUCKET_ID=default
```

## Status Flow

```
pending → approved → active
   ↓         ↓         ↓
rejected  rejected  rejected
```

## Features

### Admin Dashboard
- ✅ View all applications with filtering
- ✅ Statistics cards (total, pending, approved, active, rejected)
- ✅ Document preview
- ✅ Approve/reject workflow
- ✅ Activation with card upload
- ✅ Revocation with reason

### Therapist/Place Dashboard
- ✅ Application submission form
- ✅ Document upload with preview
- ✅ Payment reference tracking
- ✅ Real-time status display
- ✅ Rejection reason display
- ✅ Certificate download (when active)

## Security

- All routes require authentication (`requiresAuth: true`)
- Admin routes require admin role (`requiresAdmin: true`)
- Document uploads are validated
- File size limits enforced (10MB max)
- Only authorized admins can approve/activate

## Integration with Existing System

The SafePass system integrates seamlessly with:

1. **Therapist Dashboard:** New application page accessible from menu
2. **Place Dashboard:** New application page for establishments
3. **Admin Dashboard:** New management page for oversight
4. **Existing SafePass Page:** Legacy page remains functional

## Future Enhancements

- [ ] Email notifications for status changes
- [ ] Automatic expiry reminders
- [ ] Renewal workflow
- [ ] Bulk approval operations
- [ ] Advanced filtering and search
- [ ] Export applications to CSV
- [ ] SafePass card generator
- [ ] QR code verification

## Support

For issues or questions about the SafePass system, contact the development team.

## Changelog

### Version 1.0.0 (2026-02-07)
- Initial SafePass system implementation
- Admin management dashboard
- Therapist application page
- Place application page
- Complete workflow from submission to activation
