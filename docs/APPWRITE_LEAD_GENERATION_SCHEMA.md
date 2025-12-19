# Lead Generation System - Appwrite Schema

## Overview
This system handles pay-per-lead billing for members without active subscriptions. When a member doesn't activate a paid plan after 30 days, they automatically switch to a lead-based model where they pay 50,000 IDR per accepted lead.

---

## Collection: `lead_generations`

### Purpose
Tracks all booking leads sent to members without active subscriptions, including acceptance/decline status and billing.

### Attributes

| Attribute | Type | Size | Required | Description |
|-----------|------|------|----------|-------------|
| leadId | String | 100 | ✅ | Unique lead identifier (auto-generated) |
| memberId | String | 100 | ✅ | ID of therapist/place/facial_place |
| memberType | String | 50 | ✅ | 'therapist', 'massage_place', 'facial_place' |
| memberName | String | 255 | ✅ | Name for display |
| memberWhatsApp | String | 20 | ✅ | WhatsApp number to receive lead |
| customerName | String | 255 | ✅ | Customer who requested booking |
| customerWhatsApp | String | 20 | ✅ | Customer WhatsApp number |
| customerLocation | String | 500 | ❌ | Customer location details |
| hotelVillaName | String | 255 | ❌ | Hotel/Villa name if applicable |
| roomNumber | String | 50 | ❌ | Room number if applicable |
| serviceType | String | 100 | ✅ | 'massage', 'facial', etc. |
| duration | Integer | - | ✅ | Service duration in minutes (60/90/120) |
| requestedDateTime | String | 100 | ✅ | When customer wants service |
| leadCost | Integer | - | ✅ | Cost per lead (default 50000 IDR) |
| status | String | 50 | ✅ | 'pending', 'accepted', 'declined', 'expired' |
| sentAt | String | 100 | ✅ | Timestamp when lead was sent |
| respondedAt | String | 100 | ❌ | When member accepted/declined |
| expiresAt | String | 100 | ✅ | 5-minute expiry time |
| acceptUrl | String | 500 | ✅ | Unique URL to accept lead |
| declineUrl | String | 500 | ✅ | Unique URL to decline lead |
| notes | String | 1000 | ❌ | Additional booking notes |
| billed | Boolean | - | ✅ | Whether lead has been billed |
| billedAt | String | 100 | ❌ | When billing occurred |
| paymentStatus | String | 50 | ✅ | 'pending', 'paid', 'overdue' |

### Indexes

1. **member_leads_idx**
   - Type: Key
   - Attributes: memberId (ASC), sentAt (DESC)
   - Purpose: Quick lookup of all leads for a member

2. **status_idx**
   - Type: Key
   - Attribute: status (ASC)
   - Purpose: Filter by lead status

3. **payment_status_idx**
   - Type: Key
   - Attributes: paymentStatus (ASC), billed (ASC)
   - Purpose: Track unpaid leads

4. **expires_idx**
   - Type: Key
   - Attribute: expiresAt (ASC)
   - Purpose: Clean up expired leads

5. **date_idx**
   - Type: Key
   - Attributes: sentAt (DESC)
   - Purpose: Sort by date for admin dashboard

### Permissions

**Read:**
- Role: any (allow members to check their lead status via URL)

**Create:**
- Role: all (booking system creates leads automatically)

**Update:**
- Role: any (allow acceptance/decline via URL)

**Delete:**
- Role: admins (admin cleanup only)

---

## Collection: `lead_billing_summary`

### Purpose
Monthly billing summary per member for lead-based revenue.

### Attributes

| Attribute | Type | Size | Required | Description |
|-----------|------|------|----------|-------------|
| memberId | String | 100 | ✅ | ID of member |
| memberType | String | 50 | ✅ | Type of member |
| memberName | String | 255 | ✅ | Display name |
| billingMonth | String | 10 | ✅ | YYYY-MM format |
| totalLeads | Integer | - | ✅ | Total leads sent |
| acceptedLeads | Integer | - | ✅ | Leads accepted |
| declinedLeads | Integer | - | ✅ | Leads declined |
| expiredLeads | Integer | - | ✅ | Leads that expired |
| totalOwed | Integer | - | ✅ | Total amount owed (acceptedLeads * 50000) |
| totalPaid | Integer | - | ✅ | Amount already paid |
| balance | Integer | - | ✅ | Outstanding balance |
| lastUpdated | String | 100 | ✅ | Last calculation timestamp |

### Indexes

1. **member_billing_idx**
   - Type: Key
   - Attributes: memberId (ASC), billingMonth (DESC)
   - Purpose: Monthly billing per member

2. **month_idx**
   - Type: Key
   - Attribute: billingMonth (DESC)
   - Purpose: All billing for a specific month

### Permissions

**Read:**
- Role: admins

**Create/Update:**
- Role: admins

**Delete:**
- Role: admins

---

## Subscription Status Check

### Add to Existing Collections

Update `therapists`, `places`, `facial_places` collections:

**New Attributes:**
- `subscriptionStatus`: String - 'active', 'inactive', 'lead_based'
- `subscriptionEndDate`: String - ISO timestamp of subscription end
- `paymentModel`: String - 'subscription' or 'lead_based'

---

## WhatsApp Lead Message Format

```
🎯 NEW BOOKING LEAD - INDASTREET

👤 Customer: [Name]
📱 WhatsApp: [Phone]
📍 Location: [Location/Hotel/Room]
⏰ Requested: [Date & Time]
⏱️ Duration: [60/90/120] minutes
💆 Service: [massage/facial]

💰 LEAD COST: Rp 50,000
   (Billed only if accepted)

✅ ACCEPT LEAD (Rp 50k charged):
   [Accept URL]

❌ DECLINE LEAD (No charge):
   [Decline URL]

⏰ RESPOND WITHIN 5 MINUTES
   After 5 min, lead will be sent to other providers

📞 Questions? Contact IndaStreet Support
```

---

## Lead Acceptance Flow

1. **Customer clicks Book Now/Schedule**
2. **System checks subscription status**
   - If `subscriptionStatus === 'inactive'` → Generate lead
3. **Create lead document** in `lead_generations`
4. **Generate unique URLs**:
   - Accept: `https://indastreet.id/lead/accept/[leadId]?token=[uuid]`
   - Decline: `https://indastreet.id/lead/decline/[leadId]?token=[uuid]`
5. **Send WhatsApp message** to member with lead details
6. **Start 5-minute timer**
7. **Monitor response**:
   - If accepted → Update status, bill 50k, send customer notification
   - If declined → Update status, send to next provider, notify customer
   - If no response → Auto-decline, send to next provider

---

## Admin Dashboard Views

### Lead Management Page

**Filters:**
- Date range
- Member type (therapist/massage/facial)
- Status (pending/accepted/declined/expired)
- Payment status (pending/paid/overdue)

**Table Columns:**
- Lead ID
- Date & Time
- Member Name
- Customer Name
- Customer WhatsApp
- Service Details
- Status (color-coded badge)
- Response Time
- Amount (Rp 50,000 if accepted)
- Payment Status
- Actions (View Details, Mark Paid)

**Summary Cards:**
- Total leads this month
- Accepted leads
- Decline rate
- Total revenue from leads
- Outstanding payments

---

## Billing & Payment Tracking

### Monthly Invoice Generation

Automatically create invoices at month-end:
1. Query all accepted leads for the month
2. Group by memberId
3. Calculate total: acceptedLeads × 50,000
4. Generate payment link/invoice
5. Send WhatsApp reminder to member
6. Track payment status

### Payment Reminder Schedule

- Day 1: Invoice sent via WhatsApp
- Day 7: First reminder
- Day 14: Second reminder  
- Day 30: Overdue notice
- Day 45: Account suspension warning

---

## Migration Script

```javascript
// Run this after creating collections to initialize existing members
const { databases, Query } = require('node-appwrite');

async function initializeLeadSystem() {
    // Get all therapists
    const therapists = await databases.listDocuments(
        'databaseId',
        'therapists_collection_id',
        [Query.limit(500)]
    );
    
    // Get all places
    const places = await databases.listDocuments(
        'databaseId',
        'places_collection_id',
        [Query.limit(500)]
    );
    
    // Get all facial places
    const facialPlaces = await databases.listDocuments(
        'databaseId',
        'facial_places_collection',
        [Query.limit(500)]
    );
    
    // Update each with default status
    const allMembers = [
        ...therapists.documents.map(d => ({ ...d, type: 'therapist' })),
        ...places.documents.map(d => ({ ...d, type: 'massage_place' })),
        ...facialPlaces.documents.map(d => ({ ...d, type: 'facial_place' }))
    ];
    
    for (const member of allMembers) {
        await databases.updateDocument(
            'databaseId',
            member.type === 'therapist' ? 'therapists_collection_id' 
                : member.type === 'massage_place' ? 'places_collection_id'
                : 'facial_places_collection',
            member.$id,
            {
                subscriptionStatus: 'active', // Default to active
                paymentModel: 'subscription',
                subscriptionEndDate: new Date(Date.now() + 30*24*60*60*1000).toISOString()
            }
        );
    }
    
    console.log(`✅ Initialized ${allMembers.length} members for lead system`);
}
```

---

## Configuration Constants

```typescript
export const LEAD_CONFIG = {
    COST_PER_LEAD: 50000, // IDR
    RESPONSE_TIMEOUT: 5 * 60 * 1000, // 5 minutes in ms
    GRACE_PERIOD_DAYS: 7, // Days after subscription ends before switching to leads
    AUTO_SUSPEND_DAYS: 45, // Days of non-payment before account suspension
    MAX_LEADS_PER_MEMBER_PER_DAY: 20, // Prevent spam
};
```

---

## Testing Checklist

- [ ] Create `lead_generations` collection with all attributes
- [ ] Create `lead_billing_summary` collection
- [ ] Add subscription fields to therapists/places/facial_places
- [ ] Run migration script to initialize existing members
- [ ] Test lead generation flow
- [ ] Test WhatsApp message sending with accept/decline URLs
- [ ] Test 5-minute expiry timer
- [ ] Test acceptance flow (billing + customer notification)
- [ ] Test decline flow (re-assignment to next provider)
- [ ] Test admin dashboard lead view
- [ ] Test monthly billing summary calculation
- [ ] Test payment tracking and reminders
