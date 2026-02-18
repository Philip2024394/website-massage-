# Appwrite Collections Schema for Member Management System

## 1. Collection: `member_stats`
**Database ID**: `indastreet-db`  
**Collection ID**: `member_stats`

### Purpose
Track monthly performance metrics for all member types (therapists, massage places, facial places).

### Attributes

| Attribute Name | Type | Size | Required | Array | Default | Description |
|---------------|------|------|----------|-------|---------|-------------|
| memberId | string | 255 | Yes | No | - | Foreign key to therapist/place $id |
| memberType | string | 50 | Yes | No | - | Type: 'therapist', 'massage_place', 'facial_place' |
| month | string | 20 | Yes | No | - | Format: YYYY-MM (e.g., "2025-12") |
| clicksCount | integer | - | Yes | No | 0 | Number of profile clicks this month |
| viewsCount | integer | - | Yes | No | 0 | Number of profile views this month |
| bookingsCount | integer | - | Yes | No | 0 | Number of bookings received this month |
| revenue | integer | - | Yes | No | 0 | Revenue generated this month (in IDR) |
| lastUpdated | datetime | - | Yes | No | - | Last time stats were updated |

### Indexes
- `memberId_month_unique`: Unique index on (memberId, month)
- `memberType_month`: Index on (memberType, month) for filtering
- `month`: Index on month for monthly reports

### Permissions
**Document Security**: Enabled

**Create**:
- Role: `team:admin` (only admins can create stats)
- Role: `users` (system can auto-create on first click)

**Read**:
- Role: `team:admin`
- Document User: User can read their own stats

**Update**:
- Role: `team:admin`
- Role: `users` (system can increment counters)

**Delete**:
- Role: `team:admin`

---

## 2. Collection: `member_subscriptions`
**Database ID**: `indastreet-db`  
**Collection ID**: `member_subscriptions`

### Purpose
Track membership billing cycles, payment history, and subscription status for all paid members.

### Attributes

| Attribute Name | Type | Size | Required | Array | Default | Description |
|---------------|------|------|----------|-------|---------|-------------|
| memberId | string | 255 | Yes | No | - | Foreign key to therapist/place $id |
| memberType | string | 50 | Yes | No | - | Type: 'therapist', 'massage_place', 'facial_place' |
| memberName | string | 255 | Yes | No | - | Member name for quick reference |
| memberLocation | string | 255 | Yes | No | - | Member location/city |
| activationDate | datetime | - | Yes | No | - | Date member was activated (started billing) |
| currentMonth | integer | - | Yes | No | 1 | Current billing month (1, 2, 3, etc.) |
| monthlyFee | integer | - | Yes | No | 0 | Current month's fee in IDR |
| nextPaymentDate | datetime | - | Yes | No | - | Date next payment is due |
| subscriptionStatus | string | 50 | Yes | No | active | Status: 'active', 'inactive', 'overdue', 'cancelled' |
| paymentMethod | string | 100 | No | No | - | Payment method used |
| notes | string | 1000 | No | No | - | Admin notes about subscription |

### Indexes
- `memberId_unique`: Unique index on memberId
- `nextPaymentDate`: Index on nextPaymentDate for due date queries
- `subscriptionStatus`: Index on subscriptionStatus
- `memberType`: Index on memberType

### Permissions
**Document Security**: Enabled

**Create**:
- Role: `team:admin`

**Read**:
- Role: `team:admin`
- Document User: User can read their own subscription

**Update**:
- Role: `team:admin`

**Delete**:
- Role: `team:admin`

---

## 3. Collection: `payment_records`
**Database ID**: `indastreet-db`  
**Collection ID**: `payment_records`

### Purpose
Store detailed payment history for each member's monthly subscription.

### Attributes

| Attribute Name | Type | Size | Required | Array | Default | Description |
|---------------|------|------|----------|-------|---------|-------------|
| memberId | string | 255 | Yes | No | - | Foreign key to therapist/place $id |
| subscriptionId | string | 255 | Yes | No | - | Foreign key to member_subscriptions $id |
| monthNumber | integer | - | Yes | No | - | Billing month (1, 2, 3, etc.) |
| amount | integer | - | Yes | No | - | Amount charged in IDR |
| dueDate | datetime | - | Yes | No | - | Date payment was due |
| paidDate | datetime | - | No | No | - | Date payment was received (null if unpaid) |
| paymentStatus | string | 50 | Yes | No | pending | Status: 'paid', 'pending', 'overdue', 'cancelled' |
| paymentMethod | string | 100 | No | No | - | Method: 'bank_transfer', 'cash', 'other' |
| transactionId | string | 255 | No | No | - | Bank transaction reference |
| receiptUrl | string | 500 | No | No | - | URL to payment receipt/proof |
| notes | string | 1000 | No | No | - | Admin notes about payment |

### Indexes
- `memberId_month`: Index on (memberId, monthNumber)
- `subscriptionId`: Index on subscriptionId
- `dueDate`: Index on dueDate for due date reports
- `paymentStatus`: Index on paymentStatus
- `paidDate`: Index on paidDate

### Permissions
**Document Security**: Enabled

**Create**:
- Role: `team:admin`

**Read**:
- Role: `team:admin`
- Document User: User can read their own payments

**Update**:
- Role: `team:admin`

**Delete**:
- Role: `team:admin`

---

## 4. Extension to Existing Collections

### Collection: `therapists`
**Add these attributes**:

| Attribute Name | Type | Required | Default | Description |
|---------------|------|----------|---------|-------------|
| verified | boolean | Yes | false | Admin-verified badge status |
| visibleOnHomepage | boolean | Yes | true | Show/hide on homepage |
| subscriptionId | string | No | - | Link to member_subscriptions |

### Collection: `places` (Massage Places)
**Add these attributes**:

| Attribute Name | Type | Required | Default | Description |
|---------------|------|----------|---------|-------------|
| verified | boolean | Yes | false | Admin-verified badge status |
| visibleOnHomepage | boolean | Yes | true | Show/hide on homepage |
| subscriptionId | string | No | - | Link to member_subscriptions |

### Collection: `facial_places`
**Add these attributes**:

| Attribute Name | Type | Required | Default | Description |
|---------------|------|----------|---------|-------------|
| verified | boolean | Yes | false | Admin-verified badge status |
| visibleOnHomepage | boolean | Yes | true | Show/hide on homepage |
| subscriptionId | string | No | - | Link to member_subscriptions |

---

## Setup Instructions

### Step 1: Create Collections via Appwrite Console

1. Navigate to your Appwrite project → Database → `indastreet-db`
2. Create three new collections: `member_stats`, `member_subscriptions`, `payment_records`
3. Add attributes as specified above
4. Create indexes for performance
5. Set permissions according to the schema

### Step 2: Update Existing Collections

1. Go to `therapists` collection → Add attributes: `verified`, `visibleOnHomepage`, `subscriptionId`, `terms_acknowledged` (boolean, optional – dashboard T&C gate; app works without it using localStorage)
2. Go to `places` collection → Add attributes: `verified`, `visibleOnHomepage`, `subscriptionId`
3. Go to `facial_places` collection → Add attributes: `verified`, `visibleOnHomepage`, `subscriptionId`, `terms_acknowledged` (boolean, optional)

### Step 3: Create Appwrite Functions (Optional but Recommended)

**Function: Auto-increment stats**
- Trigger: On document create in `bookings` collection
- Action: Increment `clicksCount`, `bookingsCount`, `revenue` in `member_stats`

**Function: Update subscription month**
- Trigger: Scheduled (daily at midnight)
- Action: Check `nextPaymentDate`, increment `currentMonth`, update `monthlyFee`, create new `payment_records`

**Function: Mark overdue payments**
- Trigger: Scheduled (daily)
- Action: Check `payment_records` where `paymentStatus='pending'` and `dueDate < today`, update to `overdue`

### Step 4: Migration Script

Run this script to initialize subscriptions for existing members:

```javascript
// scripts/initializeMemberSubscriptions.cjs
const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY); // Admin API key

const databases = new sdk.Databases(client);

async function initializeSubscriptions() {
    // Fetch all members
    const therapists = await databases.listDocuments('indastreet-db', 'therapists');
    const places = await databases.listDocuments('indastreet-db', 'places');
    const facialPlaces = await databases.listDocuments('indastreet-db', 'facial_places');
    
    const allMembers = [
        ...therapists.documents.map(d => ({ ...d, type: 'therapist' })),
        ...places.documents.map(d => ({ ...d, type: 'massage_place' })),
        ...facialPlaces.documents.map(d => ({ ...d, type: 'facial_place' }))
    ];
    
    for (const member of allMembers) {
        // Create subscription record
        await databases.createDocument(
            'indastreet-db',
            'member_subscriptions',
            'unique()',
            {
                memberId: member.$id,
                memberType: member.type,
                memberName: member.name,
                memberLocation: member.location || 'Unknown',
                activationDate: member.$createdAt, // Use creation date
                currentMonth: 1,
                monthlyFee: 0, // First month free
                nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                subscriptionStatus: 'active'
            }
        );
        
        // Create initial stats record
        const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
        await databases.createDocument(
            'indastreet-db',
            'member_stats',
            'unique()',
            {
                memberId: member.$id,
                memberType: member.type,
                month: currentMonth,
                clicksCount: 0,
                viewsCount: 0,
                bookingsCount: 0,
                revenue: 0,
                lastUpdated: new Date().toISOString()
            }
        );
    }
    
    console.log(`Initialized subscriptions for ${allMembers.length} members`);
}

initializeSubscriptions().catch(console.error);
```

---

## Usage in Admin Dashboard

The admin dashboard will:

1. **Fetch member stats** from `member_stats` for current month
2. **Fetch subscription data** from `member_subscriptions` to show billing info
3. **Calculate due dates** using `nextPaymentDate` field
4. **Filter members** with payments due within 7 days
5. **Toggle verified badge** by updating `verified` field in member collections
6. **Toggle homepage visibility** by updating `visibleOnHomepage` field
7. **View payment history** from `payment_records` collection

## API Endpoints Needed

Create these service functions in `lib/appwriteService.ts`:

```typescript
export const memberStatsService = {
    getStatsByMonth: (memberId: string, month: string) => { /* ... */ },
    incrementClicks: (memberId: string) => { /* ... */ },
    updateRevenue: (memberId: string, amount: number) => { /* ... */ }
};

export const subscriptionService = {
    getSubscription: (memberId: string) => { /* ... */ },
    updateSubscription: (subscriptionId: string, data: any) => { /* ... */ },
    getDueSoon: (days: number) => { /* ... */ }
};

export const paymentService = {
    createPayment: (data: any) => { /* ... */ },
    markAsPaid: (paymentId: string, transactionId: string) => { /* ... */ },
    getPaymentHistory: (memberId: string) => { /* ... */ }
};
```
