# Appwrite Payment Confirmations Collection Schema

## Collection: `payment_confirmations`

This collection stores payment confirmation submissions from members (therapists/places/agents/hotels) with uploaded proof of payment for admin review and approval.

### Collection Settings
- **Collection ID**: `payment_confirmations`
- **Name**: Payment Confirmations
- **Permissions**: 
  - Create: Users (authenticated)
  - Read: Users (own documents) + Admin
  - Update: Admin only
  - Delete: Admin only

### Attributes

| Attribute Name | Type | Size | Required | Default | Array | Description |
|---------------|------|------|----------|---------|-------|-------------|
| confirmationId | String | 36 | Yes | - | No | Unique confirmation ID (UUID) |
| userId | String | 255 | Yes | - | No | User ID who submitted payment |
| userEmail | String | 255 | Yes | - | No | User email for notifications |
| userName | String | 255 | Yes | - | No | User's full name |
| memberType | String | 50 | Yes | - | No | Type: therapist, place, agent, hotel, lead_buyer |
| paymentType | String | 50 | Yes | - | No | Type: membership, lead_fee, commission, package_upgrade |
| packageName | String | 255 | No | null | No | Name of purchased package (if membership) |
| packageDuration | String | 50 | No | null | No | Duration: 1_month, 3_months, 6_months, 12_months |
| amount | Float | - | Yes | - | No | Payment amount in IDR |
| bankName | String | 255 | Yes | - | No | Bank name used for transfer |
| accountNumber | String | 100 | Yes | - | No | Account number transferred to |
| accountName | String | 255 | Yes | - | No | Account holder name |
| proofOfPaymentUrl | String | 2000 | Yes | - | No | URL to uploaded payment proof image |
| proofOfPaymentFileId | String | 255 | No | null | No | Appwrite Storage file ID |
| status | String | 50 | Yes | pending | No | Status: pending, approved, declined |
| reviewedBy | String | 255 | No | null | No | Admin ID who reviewed |
| reviewedAt | DateTime | - | No | null | No | When payment was reviewed |
| declineReason | String | 1000 | No | null | No | Reason if declined |
| notes | String | 2000 | No | null | No | Admin internal notes |
| submittedAt | DateTime | - | Yes | - | No | When proof was submitted |
| expiresAt | DateTime | - | Yes | - | No | Auto-decline after 7 days if not reviewed |
| notificationSent | Boolean | - | Yes | false | No | Whether notification was sent to user |
| metadata | String | 5000 | No | null | No | JSON string for additional data |

### Indexes

1. **userId_status_idx**
   - Type: Key
   - Attributes: userId (ASC), status (ASC)
   - Purpose: Fast lookup of user's payment confirmations by status

2. **status_submitted_idx**
   - Type: Key
   - Attributes: status (ASC), submittedAt (DESC)
   - Purpose: Admin dashboard - pending payments sorted by date

3. **expires_at_idx**
   - Type: Key
   - Attributes: expiresAt (ASC), status (ASC)
   - Purpose: Automated expiry checks

4. **member_type_idx**
   - Type: Key
   - Attributes: memberType (ASC), status (ASC)
   - Purpose: Filter payments by member category

### Enum Values

#### status
- `pending` - Awaiting admin review
- `approved` - Payment confirmed, membership activated
- `declined` - Payment rejected, needs resubmission

#### memberType
- `therapist` - Individual massage therapist
- `place` - Massage place/spa
- `agent` - Referral agent
- `hotel` - Hotel/Villa partner
- `lead_buyer` - Lead purchase customer

#### paymentType
- `membership` - Monthly membership package
- `lead_fee` - Payment for purchasing leads
- `commission` - Commission payment from provider
- `package_upgrade` - Upgrading membership tier

#### packageDuration
- `1_month` - 1 month subscription
- `3_months` - 3 months subscription (10% discount)
- `6_months` - 6 months subscription (15% discount)
- `12_months` - 12 months subscription (20% discount)

## Bank Details Configuration

Admin's bank account details for receiving payments:

```json
{
  "bankName": "Bank Central Asia (BCA)",
  "accountNumber": "1234567890",
  "accountName": "PT IndaStreet Indonesia",
  "branch": "Jakarta Selatan",
  "swiftCode": "CENAIDJA"
}
```

## Payment Workflow

### 1. Member Submission
1. User selects package/service
2. System displays bank transfer details
3. User completes bank transfer
4. User uploads payment proof (screenshot/photo)
5. User clicks "Send to Admin" button
6. Document created with status = `pending`
7. `expiresAt` set to 7 days from submission
8. Admin receives notification

### 2. Admin Review (within 7 days)
- **Approve**: 
  - Status → `approved`
  - Membership activated
  - User receives confirmation email
  - `reviewedAt` timestamp set
  
- **Decline**:
  - Status → `declined`
  - `declineReason` required
  - User receives email: "Payment not received, please check attachment"
  - User can resubmit with new proof

### 3. Auto-Decline (after 7 days)
- If not reviewed after 7 days
- Status → `declined`
- `declineReason` = "No response from admin within 7 days"
- Automated email sent to user

## Security Considerations

1. **File Upload Validation**
   - Allowed formats: JPG, JPEG, PNG, PDF
   - Max file size: 5 MB
   - Virus scanning on upload
   - Generate unique filename to prevent overwrites

2. **Payment Amount Verification**
   - Admin compares uploaded proof with expected amount
   - Tolerance: ±IDR 1,000 (for bank fees)

3. **Fraud Prevention**
   - Track IP address on submission
   - Limit resubmissions: 3 per day
   - Flag suspicious patterns (same proof used multiple times)

4. **Data Privacy**
   - Payment proofs auto-deleted after 90 days (GDPR compliance)
   - PCI-DSS not required (no card data stored)

## Admin Dashboard Features

### Pending Payments View
- Sort by: Date submitted, Amount, Member type
- Filter by: Member type, Payment type, Date range
- Bulk actions: Approve selected, Decline selected
- Quick actions: View proof, Approve, Decline

### Payment History
- Searchable by user name, email, confirmation ID
- Export to CSV
- Analytics: Approval rate, average review time, revenue by month

## Notifications

### User Notifications
1. **Submission Confirmed**
   - Subject: "Payment Proof Received"
   - Body: "Your payment proof has been submitted. Review within 7 days."

2. **Payment Approved**
   - Subject: "Payment Confirmed - Membership Activated"
   - Body: "Your payment has been verified. Membership is now active."

3. **Payment Declined**
   - Subject: "Payment Not Received - Please Resubmit"
   - Body: "Reason: [declineReason]. Please upload new proof."

### Admin Notifications
1. **New Payment Proof**
   - Real-time notification in admin dashboard
   - Email digest: Daily summary of pending payments

## Implementation Notes

1. Use Appwrite Storage for payment proof files
2. Generate thumbnails for quick preview
3. Implement client-side image compression before upload
4. Add watermark with timestamp on proof images
5. Create scheduled function for auto-decline after 7 days
6. Integrate with email service (Resend/SendGrid)
7. Add audit log for all status changes

## Migration Plan

1. Create collection in Appwrite console
2. Set up Storage bucket for payment proofs
3. Configure permissions and indexes
4. Deploy cloud function for auto-expiry
5. Test with staging data
6. Go live with production
