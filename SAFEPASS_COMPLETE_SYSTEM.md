# SafePass System - Complete Guide

## Overview
The SafePass system provides certification verification for therapists and places, ensuring they meet safety and quality standards.

## Key Features

### ✅ Fully Operational
- **1-Year Validity**: SafePass certificates are valid for 1 year from activation date
- **All Entities**: Supports both therapists AND places
- **Admin Control**: Complete activate/deactivate functionality
- **Bulk Management**: View and manage all entities in one place
- **Search & Filter**: Find entities by name, email, location, type, or status
- **Real-time Stats**: Track active/inactive counts for therapists and places

## Admin Interfaces

### 1. Application Management (`/admin/safepass`)
**Purpose**: Review and process SafePass applications
**Features**:
- View submitted applications with documents
- Approve or reject applications
- Activate approved applications
- Revoke active SafePass certificates
- Track application workflow: pending → approved → active (or rejected)

### 2. All Entities Management (`/admin/safepass/all`) ⭐ NEW
**Purpose**: Manage SafePass for ALL therapists and places
**Features**:
- View all 100+ therapists and places in one interface
- Activate SafePass for any entity with one click
- Deactivate SafePass for any entity instantly
- Filter by:
  - Entity type: All / Therapists / Places
  - Status: All / Active / Inactive
  - Search: Name, email, or location
- Real-time statistics dashboard
- Bulk operations for efficient management

## Database Structure

### Collection: `safepass`
All SafePass records stored in dedicated collection for clean data separation.

**Attributes**:
```typescript
{
  entityType: string           // 'therapist' or 'place'
  entityId: string             // ID of therapist or place
  entityName: string           // Display name
  hotelVillaSafePassStatus: enum  // 'pending'|'approved'|'active'|'rejected'
  hasSafePassVerification: boolean
  safePassIssuedAt: datetime   // Activation date
  safePassExpiry: datetime     // 1 year from issuedAt
  safePassSubmittedAt: datetime
  safePassApprovedAt: datetime
  safePassApprovedBy: string   // Admin ID
  safePassRejectionReason: string
  safePassCardUrl: string
  safePassPaymentId: string
  hotelVillaLetters: string    // JSON array of document URLs
}
```

## Validity Period

**IMPORTANT**: Changed from 2 years to **1 YEAR** as requested.

When a SafePass is activated:
- `safePassIssuedAt` = Current date/time
- `safePassExpiry` = Current date + 1 year
- Example: Activated Feb 7, 2026 → Expires Feb 7, 2027

## Activated Therapists

Current active SafePass holders (as of Feb 7, 2026):
1. ✅ **Surtiningsih** - Expires Feb 7, 2027
2. ✅ **Wiwid** - Expires Feb 7, 2027
3. ✅ **Winda** - Expires Feb 7, 2027
4. ✅ **Umi sangadah** - Expires Feb 7, 2027

## Usage Guide

### For Admins

#### Activate SafePass for Specific Therapists/Places
1. Go to `/admin/safepass/all`
2. Use filters to find entities
3. Click "Activate SafePass" on any entity
4. System automatically sets:
   - Status: active
   - Issue date: Today
   - Expiry: Today + 1 year
   - Verification: true

#### Deactivate SafePass
1. Go to `/admin/safepass/all`
2. Find active entity
3. Click "Deactivate SafePass"
4. Confirm action
5. Status changed to 'rejected', verification removed

#### Manage Applications
1. Go to `/admin/safepass`
2. Review submitted applications
3. Approve/reject with reasons
4. Activate approved applications
5. Upload SafePass card URL (optional)

#### Bulk Activation (Script)
For activating multiple therapists at once:
```bash
# Edit activate-safepass.cjs to add therapist names
# Then run:
$env:APPWRITE_API_KEY="YOUR_API_KEY"
node activate-safepass.cjs
```

### For Therapists
1. Navigate to `/therapist/safepass-apply`
2. Upload required documents:
   - Hotel/villa partnership letters
   - Certifications
   - Training certificates
3. Submit payment ID
4. Track application status (pending/approved/active/rejected)

### For Places
1. Navigate to `/place/safepass-apply`
2. Upload business documents:
   - Business registration
   - Safety certificates
   - Insurance documentation
3. Submit payment ID
4. Track application status

## Technical Implementation

### Frontend Pages
1. **AdminSafePassManagement.tsx**: Application workflow management
2. **AdminSafePassManagementAll.tsx**: All entities management ⭐
3. **TherapistSafePassApplication.tsx**: Therapist application form
4. **PlaceSafePassApplication.tsx**: Place application form

### Backend Services
- **safePassService.ts**: Complete CRUD operations for SafePass
  - submitApplication()
  - uploadLetter()
  - getApplication()
  - listApplications()
  - approveApplication()
  - activateApplication()
  - revokeApplication()
  - getStats()

### Scripts
- **activate-safepass.cjs**: Bulk activation for specific therapists
- **verify-safepass-setup.cjs**: Verify SafePass configuration
- **test-safepass-creation.cjs**: Test SafePass record creation
- **fix-safepass-enum.cjs**: Fix enum attribute issues

### Routes
- `/admin/safepass` - Application management
- `/admin/safepass/all` - All entities management ⭐
- `/therapist/safepass-apply` - Therapist application
- `/place/safepass-apply` - Place application

## API Integration

### Appwrite Configuration
```typescript
Database: 68f76ee1000e64ca8d05
Project: 68f23b11000d25eb3664
Endpoint: https://syd.cloud.appwrite.io/v1

Collections:
- safepass (SafePass records)
- therapists_collection_id (Therapists)
- places_collection_id (Places)
```

### API Key Scopes Required
For admin operations:
- ✅ documents.read
- ✅ documents.write
- ✅ collections.read
- ⚠️ collections.write (only for schema modifications)

## Business Logic

### Validation Flow
```
1. Entity applies for SafePass
   → Status: pending
   → Documents uploaded to storage
   → Payment ID recorded

2. Admin reviews application
   → Approve: Status → approved
   → Reject: Status → rejected (with reason)

3. Admin activates approved application
   → Status → active
   → Issue date set
   → Expiry set to +1 year
   → Verification flag enabled

4. Admin can revoke active SafePass
   → Status → rejected
   → Verification disabled
   → Reason recorded
```

### Direct Activation (Admin)
Admins can bypass application workflow:
```
1. Admin selects entity from /admin/safepass/all
2. Clicks "Activate SafePass"
3. System creates active SafePass immediately
   → No application workflow needed
   → Instant activation
   → 1-year validity
```

## Statistics

### Real-time Metrics
- Total therapists in database
- Active therapists with SafePass
- Total places in database
- Active places with SafePass
- Pending applications
- Rejected applications
- Expiring certificates (coming soon)

## File Uploads

### Storage
Documents stored in Appwrite Storage:
- Bucket ID from environment variables
- URLs saved in `hotelVillaLetters` as JSON array
- Support for multiple documents per application

### Document Types
**Therapists**:
- Hotel partnership letters
- Villa collaboration agreements
- Professional certifications
- Training certificates

**Places**:
- Business registration
- Safety certificates
- Insurance documentation
- Health permits

## Best Practices

### For Admins
1. **Regular Reviews**: Check `/admin/safepass` weekly for new applications
2. **Bulk Management**: Use `/admin/safepass/all` for efficient activation
3. **Documentation**: Request clear documents before approval
4. **Communication**: Provide detailed rejection reasons
5. **Renewal Tracking**: Monitor expiring certificates (expiry date shown in list)

### For Developers
1. **API Key Security**: Never commit API keys to repository
2. **Error Handling**: All operations wrapped in try-catch
3. **User Feedback**: Show loading states and success/error messages
4. **Data Validation**: Validate inputs before submission
5. **Permission Checks**: Verify admin role before operations

## Troubleshooting

### Common Issues

**Issue**: Cannot activate SafePass
**Solution**: Check enum attribute is properly configured with ['pending', 'approved', 'active', 'rejected']

**Issue**: API key permission error
**Solution**: Ensure API key has required scopes (documents.read, documents.write)

**Issue**: Collection not found
**Solution**: Verify collection IDs match Appwrite configuration

**Issue**: Documents not uploading
**Solution**: Check storage bucket configuration and permissions

## Future Enhancements

### Planned Features
- 🔄 Automatic expiry notifications (30 days before)
- 📧 Email notifications for status changes
- 📊 Advanced analytics and reporting
- 🎫 Digital SafePass card generator
- 📱 QR code verification system
- 🔍 Public verification lookup
- 📅 Renewal workflow automation
- 💰 Payment integration

## Support

### Documentation Files
- `SAFEPASS_SYSTEM_DOCUMENTATION.md` - System overview
- `SAFE PASS_APPWRITE_SETUP.md` - Appwrite configuration
- `SAFEPASS_ATTRIBUTES_NEEDED.md` - Database schema
- `FIX_SAFEPASS_ENUM.md` - Troubleshooting guide

### Scripts
Run verification after changes:
```bash
$env:APPWRITE_API_KEY="YOUR_KEY"
node verify-safepass-setup.cjs
```

## Summary

✅ **Complete SafePass System Features**:
- 1-year validity period from activation
- Admin control for ALL therapists and places
- Activate/deactivate functionality
- Search and filter capabilities
- Real-time statistics
- Application workflow management
- Document upload support
- Bulk operations via scripts

🎯 **Quick Access**:
- Applications: http://localhost:3000/admin/safepass
- All Entities: http://localhost:3000/admin/safepass/all ⭐

📊 **Current Status**:
- 4 therapists activated (Feb 7, 2026)
- System fully operational
- All collections configured
- Admin interfaces complete
