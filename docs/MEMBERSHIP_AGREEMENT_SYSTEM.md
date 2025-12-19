# Membership Agreement System

## Overview
Complete membership management system with pricing tiers, upgrade policies, verified badges, and binding agreements for therapists, massage places, and facial places.

**Language Policy:**
- **Member-facing pages**: Bilingual (English/Indonesian) for clarity and legal compliance
- **Admin dashboard**: English only for administrative efficiency
- **Country**: Indonesia (IDR) - ready for multi-country expansion

---

## Pricing Structure

### Standard Membership Progression (Indonesia - IDR)
- **Month 1**: FREE (Trial Period)
- **Month 2**: Rp 100,000/month
- **Month 3**: Rp 135,000/month
- **Month 4**: Rp 175,000/month
- **Month 5**: Rp 200,000/month
- **Month 6+**: Rp 200,000/month (continues at this rate)

### Lead-Based Model (Fallback)
- **Cost per Lead**: 25% of booking price per accepted booking
- **Applies when**: 
  - Payment not received by the 10th of the month
  - Member chooses not to pay monthly subscription
  - Account automatically switches from subscription to per-lead
- **How it works**:
  - No monthly fee
  - Pay only for bookings you accept (25% of booking price each)
  - Can upgrade to Premium (Rp 275,000/month) at any time

### Premium Upgrade Pricing
- **Lead → Membership Upgrade**: Rp 275,000/month (FIXED)
- **Condition**: Available only to members who:
  - Previously opted for leads instead of accepting next month's membership
  - Let their account subscription lapse
- **Benefits**: 
  - Verified badge
  - Unlimited booking requests (no per-lead charges)
  - Priority support
  - Enhanced profile visibility

---

## Membership Agreement Terms

### 1. Free Trial Commitment
**By accepting the FREE Month 1 trial, members agree to:**
- Pay monthly subscription fees through Month 5 at increasing rates
- Cannot cancel without paying all outstanding dues
- Must fulfill 5-month minimum commitment
- Subscription auto-renews at Month 5 pricing (Rp 200,000/month) unless upgraded to premium

### 2. Payment Schedule (Indonesia - IDR)
- **Payment Due Date**: 1st of each month
- **Grace Period**: Until the 5th (no penalty)
- **After 5th**: Late fee of Rp 25,000 applied
- **After 10th**: Account automatically switched to lead-based model (Rp 50k per booking)
- **Month 5 onwards**: All payments remain at Rp 200,000/month
- **Reminders sent**: 7, 3, and 1 days before due date via WhatsApp

**Example Timeline:**
- Dec 1: Payment due (Rp 200,000 for Month 5+)
- Dec 1-5: Grace period (no late fee)
- Dec 6-10: Late fee applies (Rp 25,000 added)
- Dec 11: If still unpaid, account switches to lead-based (pay Rp 50k per accepted booking only)

### 3. Upgrade Policy
**From Lead-Based to Premium Membership:**
- One-time upgrade fee: Rp 275,000/month
- Upgrade is permanent (cannot downgrade back to lead-based)
- Verified badge granted immediately upon upgrade
- Must pay current month + next month upfront
- All outstanding lead charges must be cleared before upgrade

### 4. Deactivation Policy
**Members requesting account deactivation must:**
- Pay ALL outstanding membership fees through contracted period
- Pay ALL outstanding lead charges
- Provide 30-day notice
- Cannot reactivate for 90 days after deactivation
- Lose verified badge and priority status
- Re-registration subject to approval and premium pricing only

### 5. Verified Badge Requirements
**Verified badge automatically displayed when:**
- Active paid membership (Month 2+)
- No outstanding payment dues
- Premium upgrade completed
- Account in good standing

**Badge removed when:**
- Subscription lapses or not paid by 5th
- Account switched to lead-based model
- Outstanding payments exist
- Account deactivated

---

## Database Schema Updates

### Member Collections (therapists, places, facial_places)

```javascript
// Additional attributes for membership system
{
  // Membership Status
  subscriptionStatus: 'trial' | 'active' | 'suspended' | 'lead_based' | 'premium' | 'deactivated',
  subscriptionEndDate: '2025-02-01T00:00:00.000Z', // ISO string
  paymentModel: 'subscription' | 'lead_based' | 'premium',
  membershipMonth: 1, // Current month in progression (1-5+)
  
  // Verified Badge
  isVerified: true, // Auto-calculated based on payment status
  verifiedSince: '2025-01-15T00:00:00.000Z', // When badge was granted
  
  // Agreement
  agreementAccepted: true,
  agreementAcceptedDate: '2025-01-01T00:00:00.000Z',
  agreementVersion: '1.0',
  
  // Upgrade Tracking
  upgradedToPremium: false,
  premiumUpgradeDate: null,
  previousPaymentModel: null, // 'lead_based' if upgraded from leads
  
  // Deactivation
  deactivationRequested: false,
  deactivationRequestDate: null,
  deactivationEffectiveDate: null,
  deactivationReason: null,
  
  // Financial
  outstandingDues: 0, // Total amount owed (membership + leads)
  lastPaymentDate: '2025-01-01T00:00:00.000Z',
  lastPaymentAmount: 100000,
  totalPaidToDate: 100000,
  
  // Commitment
  commitmentEndDate: '2025-06-01T00:00:00.000Z', // End of 5-month period
  canCancelAfter: '2025-06-01T00:00:00.000Z',
  
  // Contact
  memberPhone: '+6281234567890', // WhatsApp number
  memberEmail: 'member@example.com'
}
```

### New Collection: membership_agreements

```javascript
{
  $id: 'unique()',
  memberId: 'member_xxx', // Reference to therapist/place/facial_place
  memberType: 'therapist' | 'massage_place' | 'facial_place',
  
  // Agreement Details
  agreementVersion: '1.0',
  acceptedDate: '2025-01-01T00:00:00.000Z',
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0...',
  
  // Terms Acknowledged
  termsAcknowledged: [
    'five_month_commitment',
    'payment_schedule',
    'deactivation_policy',
    'upgrade_pricing',
    'verified_badge_policy'
  ],
  
  // Pricing Acknowledged
  pricingTierAcknowledged: {
    month1: 0,
    month2: 100000,
    month3: 135000,
    month4: 175000,
    month5Plus: 200000,
    premiumUpgrade: 275000
  },
  
  // Status
  isActive: true,
  terminatedDate: null,
  terminationReason: null
}
```

### New Collection: membership_upgrades

```javascript
{
  $id: 'unique()',
  memberId: 'member_xxx',
  memberType: 'therapist' | 'massage_place' | 'facial_place',
  
  // Upgrade Details
  upgradeDate: '2025-03-15T00:00:00.000Z',
  previousModel: 'lead_based',
  newModel: 'premium',
  upgradeFee: 275000,
  
  // Payment
  paymentStatus: 'pending' | 'paid' | 'failed',
  paymentDate: '2025-03-15T10:30:00.000Z',
  paymentMethod: 'stripe' | 'bank_transfer',
  paymentReference: 'stripe_pi_xxx',
  
  // Outstanding Dues Cleared
  outstandingDuesCleared: 125000, // Lead charges paid before upgrade
  totalPaidAtUpgrade: 400000, // Upgrade fee + outstanding dues
  
  // Badge
  verifiedBadgeGranted: true,
  verifiedBadgeDate: '2025-03-15T10:35:00.000Z',
  
  // Notes
  adminNotes: 'Approved by admin',
  memberNotes: 'Want to upgrade for verified badge'
}
```

### New Collection: deactivation_requests

```javascript
{
  $id: 'unique()',
  memberId: 'member_xxx',
  memberType: 'therapist' | 'massage_place' | 'facial_place',
  
  // Request Details
  requestDate: '2025-06-01T00:00:00.000Z',
  requestedBy: 'user_xxx',
  reason: 'Moving to different city',
  
  // Status
  status: 'pending' | 'approved' | 'rejected' | 'completed',
  reviewedBy: 'admin_xxx',
  reviewedDate: '2025-06-02T00:00:00.000Z',
  reviewNotes: 'All dues paid, approved',
  
  // Financial Clearance
  outstandingDuesAtRequest: 0,
  duesPaidBeforeDeactivation: 350000,
  clearanceCertificateIssued: true,
  
  // Effective Dates
  noticeProvidedDate: '2025-06-01T00:00:00.000Z',
  effectiveDate: '2025-07-01T00:00:00.000Z', // 30 days after request
  canReactivateAfter: '2025-10-01T00:00:00.000Z', // 90 days after deactivation
  
  // Reactivation Terms
  reactivationFeeRequired: 275000, // Premium pricing only
  reactivationRequiresApproval: true
}
```

---

## Service Layer Implementation

### lib/appwriteService.ts - membershipService

```typescript
export const membershipService = {
  // Pricing constants
  PRICING: {
    TRIAL: 0,
    MONTH_2: 100000,
    MONTH_3: 135000,
    MONTH_4: 175000,
    MONTH_5_PLUS: 200000,
    PREMIUM_UPGRADE: 275000,
    LEAD_COST: 50000,
    LATE_FEE: 25000,
    REACTIVATION_FEE: 275000
  },

  /**
   * Get pricing for current membership month
   */
  getPricingForMonth: (month: number): number => {
    if (month === 1) return membershipService.PRICING.TRIAL;
    if (month === 2) return membershipService.PRICING.MONTH_2;
    if (month === 3) return membershipService.PRICING.MONTH_3;
    if (month === 4) return membershipService.PRICING.MONTH_4;
    return membershipService.PRICING.MONTH_5_PLUS;
  },

  /**
   * Check if member is verified (has badge)
   */
  isVerified: (member: any): boolean => {
    return member.isVerified && 
           member.subscriptionStatus !== 'suspended' &&
           member.subscriptionStatus !== 'deactivated' &&
           member.outstandingDues === 0;
  },

  /**
   * Calculate outstanding dues for member
   */
  calculateOutstandingDues: async (memberId: string, memberType: string) => {
    try {
      // Get membership payments owed
      const member = await databases.getDocument(
        appwriteConfig.databaseId,
        memberType === 'therapist' ? appwriteConfig.therapistsCollectionId :
        memberType === 'massage_place' ? appwriteConfig.placesCollectionId :
        appwriteConfig.facialPlacesCollectionId,
        memberId
      );

      let totalDues = 0;

      // Add unpaid subscription fees
      const currentMonth = member.membershipMonth;
      const pricing = membershipService.getPricingForMonth(currentMonth);
      
      if (member.subscriptionStatus === 'active' && !member.lastPaymentDate) {
        totalDues += pricing;
      }

      // Add unpaid lead charges
      const unpaidLeads = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.leadGenerations,
        [
          Query.equal('memberId', memberId),
          Query.equal('status', 'accepted'),
          Query.equal('paymentStatus', 'unpaid')
        ]
      );

      unpaidLeads.documents.forEach(lead => {
        totalDues += lead.leadCost;
      });

      return totalDues;
    } catch (error) {
      console.error('Error calculating outstanding dues:', error);
      throw error;
    }
  },

  /**
   * Accept membership agreement
   */
  acceptAgreement: async (memberId: string, memberType: string, agreementData: any) => {
    try {
      // Create agreement record
      const agreement = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membershipAgreements,
        ID.unique(),
        {
          memberId,
          memberType,
          agreementVersion: '1.0',
          acceptedDate: new Date().toISOString(),
          ipAddress: agreementData.ipAddress,
          userAgent: agreementData.userAgent,
          termsAcknowledged: [
            'five_month_commitment',
            'payment_schedule',
            'deactivation_policy',
            'upgrade_pricing',
            'verified_badge_policy'
          ],
          pricingTierAcknowledged: {
            month1: 0,
            month2: 100000,
            month3: 135000,
            month4: 175000,
            month5Plus: 200000,
            premiumUpgrade: 275000
          },
          isActive: true
        }
      );

      // Update member document
      await databases.updateDocument(
        appwriteConfig.databaseId,
        memberType === 'therapist' ? appwriteConfig.therapistsCollectionId :
        memberType === 'massage_place' ? appwriteConfig.placesCollectionId :
        appwriteConfig.facialPlacesCollectionId,
        memberId,
        {
          agreementAccepted: true,
          agreementAcceptedDate: new Date().toISOString(),
          agreementVersion: '1.0',
          subscriptionStatus: 'trial',
          membershipMonth: 1,
          commitmentEndDate: new Date(Date.now() + 150 * 24 * 60 * 60 * 1000).toISOString() // 5 months
        }
      );

      return agreement;
    } catch (error) {
      console.error('Error accepting agreement:', error);
      throw error;
    }
  },

  /**
   * Request upgrade from lead-based to premium
   */
  requestPremiumUpgrade: async (memberId: string, memberType: string) => {
    try {
      // Check if member is eligible
      const member = await databases.getDocument(
        appwriteConfig.databaseId,
        memberType === 'therapist' ? appwriteConfig.therapistsCollectionId :
        memberType === 'massage_place' ? appwriteConfig.placesCollectionId :
        appwriteConfig.facialPlacesCollectionId,
        memberId
      );

      if (member.paymentModel !== 'lead_based') {
        throw new Error('Only lead-based members can upgrade to premium');
      }

      // Calculate outstanding dues
      const outstandingDues = await membershipService.calculateOutstandingDues(memberId, memberType);
      const totalUpgradeCost = membershipService.PRICING.PREMIUM_UPGRADE + outstandingDues;

      // Create upgrade request
      const upgrade = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membershipUpgrades,
        ID.unique(),
        {
          memberId,
          memberType,
          upgradeDate: new Date().toISOString(),
          previousModel: 'lead_based',
          newModel: 'premium',
          upgradeFee: membershipService.PRICING.PREMIUM_UPGRADE,
          outstandingDuesCleared: outstandingDues,
          totalPaidAtUpgrade: totalUpgradeCost,
          paymentStatus: 'pending',
          verifiedBadgeGranted: false
        }
      );

      return {
        upgrade,
        totalCost: totalUpgradeCost,
        outstandingDues,
        upgradeFee: membershipService.PRICING.PREMIUM_UPGRADE
      };
    } catch (error) {
      console.error('Error requesting premium upgrade:', error);
      throw error;
    }
  },

  /**
   * Complete premium upgrade after payment
   */
  completePremiumUpgrade: async (upgradeId: string) => {
    try {
      const upgrade = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membershipUpgrades,
        upgradeId
      );

      // Update upgrade record
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.membershipUpgrades,
        upgradeId,
        {
          paymentStatus: 'paid',
          paymentDate: new Date().toISOString(),
          verifiedBadgeGranted: true,
          verifiedBadgeDate: new Date().toISOString()
        }
      );

      // Update member record
      const collectionId = upgrade.memberType === 'therapist' ? appwriteConfig.therapistsCollectionId :
                          upgrade.memberType === 'massage_place' ? appwriteConfig.placesCollectionId :
                          appwriteConfig.facialPlacesCollectionId;

      await databases.updateDocument(
        appwriteConfig.databaseId,
        collectionId,
        upgrade.memberId,
        {
          subscriptionStatus: 'premium',
          paymentModel: 'premium',
          previousPaymentModel: 'lead_based',
          upgradedToPremium: true,
          premiumUpgradeDate: new Date().toISOString(),
          isVerified: true,
          verifiedSince: new Date().toISOString(),
          outstandingDues: 0
        }
      );

      // Mark all outstanding leads as paid
      await leadGenerationService.markLeadsPaid(upgrade.memberId, new Date().toISOString());

      return upgrade;
    } catch (error) {
      console.error('Error completing premium upgrade:', error);
      throw error;
    }
  },

  /**
   * Request account deactivation
   */
  requestDeactivation: async (memberId: string, memberType: string, reason: string) => {
    try {
      // Check outstanding dues
      const outstandingDues = await membershipService.calculateOutstandingDues(memberId, memberType);

      if (outstandingDues > 0) {
        throw new Error(`Cannot deactivate account with outstanding dues: Rp ${outstandingDues.toLocaleString()}`);
      }

      // Create deactivation request
      const request = await databases.createDocument(
        appwriteConfig.databaseId,
        appwriteConfig.deactivationRequests,
        ID.unique(),
        {
          memberId,
          memberType,
          requestDate: new Date().toISOString(),
          reason,
          status: 'pending',
          outstandingDuesAtRequest: outstandingDues,
          noticeProvidedDate: new Date().toISOString(),
          effectiveDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
          canReactivateAfter: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 90 days after
          reactivationFeeRequired: membershipService.PRICING.REACTIVATION_FEE,
          reactivationRequiresApproval: true
        }
      );

      // Update member record
      const collectionId = memberType === 'therapist' ? appwriteConfig.therapistsCollectionId :
                          memberType === 'massage_place' ? appwriteConfig.placesCollectionId :
                          appwriteConfig.facialPlacesCollectionId;

      await databases.updateDocument(
        appwriteConfig.databaseId,
        collectionId,
        memberId,
        {
          deactivationRequested: true,
          deactivationRequestDate: new Date().toISOString()
        }
      );

      return request;
    } catch (error) {
      console.error('Error requesting deactivation:', error);
      throw error;
    }
  },

  /**
   * Approve deactivation request
   */
  approveDeactivation: async (requestId: string, adminId: string, notes: string) => {
    try {
      const request = await databases.getDocument(
        appwriteConfig.databaseId,
        appwriteConfig.deactivationRequests,
        requestId
      );

      // Update request
      await databases.updateDocument(
        appwriteConfig.databaseId,
        appwriteConfig.deactivationRequests,
        requestId,
        {
          status: 'approved',
          reviewedBy: adminId,
          reviewedDate: new Date().toISOString(),
          reviewNotes: notes,
          clearanceCertificateIssued: true
        }
      );

      // Update member record
      const collectionId = request.memberType === 'therapist' ? appwriteConfig.therapistsCollectionId :
                          request.memberType === 'massage_place' ? appwriteConfig.placesCollectionId :
                          appwriteConfig.facialPlacesCollectionId;

      await databases.updateDocument(
        appwriteConfig.databaseId,
        collectionId,
        request.memberId,
        {
          subscriptionStatus: 'deactivated',
          deactivationEffectiveDate: request.effectiveDate,
          isVerified: false,
          verifiedSince: null
        }
      );

      return request;
    } catch (error) {
      console.error('Error approving deactivation:', error);
      throw error;
    }
  },

  /**
   * Get membership stats for admin dashboard
   */
  getMembershipStats: async () => {
    try {
      const stats = {
        totalMembers: 0,
        trialMembers: 0,
        activeMembers: 0,
        premiumMembers: 0,
        leadBasedMembers: 0,
        suspendedMembers: 0,
        deactivatedMembers: 0,
        verifiedMembers: 0,
        totalRevenue: 0,
        pendingUpgrades: 0,
        pendingDeactivations: 0
      };

      // Get counts from all collections
      const collections = [
        appwriteConfig.therapistsCollectionId,
        appwriteConfig.placesCollectionId,
        appwriteConfig.facialPlacesCollectionId
      ];

      for (const collectionId of collections) {
        const members = await databases.listDocuments(
          appwriteConfig.databaseId,
          collectionId
        );

        members.documents.forEach(member => {
          stats.totalMembers++;
          if (member.subscriptionStatus === 'trial') stats.trialMembers++;
          if (member.subscriptionStatus === 'active') stats.activeMembers++;
          if (member.subscriptionStatus === 'premium') stats.premiumMembers++;
          if (member.subscriptionStatus === 'lead_based') stats.leadBasedMembers++;
          if (member.subscriptionStatus === 'suspended') stats.suspendedMembers++;
          if (member.subscriptionStatus === 'deactivated') stats.deactivatedMembers++;
          if (member.isVerified) stats.verifiedMembers++;
          stats.totalRevenue += member.totalPaidToDate || 0;
        });
      }

      // Get pending upgrades
      const upgrades = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.membershipUpgrades,
        [Query.equal('paymentStatus', 'pending')]
      );
      stats.pendingUpgrades = upgrades.total;

      // Get pending deactivations
      const deactivations = await databases.listDocuments(
        appwriteConfig.databaseId,
        appwriteConfig.deactivationRequests,
        [Query.equal('status', 'pending')]
      );
      stats.pendingDeactivations = deactivations.total;

      return stats;
    } catch (error) {
      console.error('Error getting membership stats:', error);
      throw error;
    }
  }
};
```

---

## Frontend Components

### 1. pages/MembershipTermsPage.tsx
Complete membership agreement page with terms, pricing, and accept/decline.

### 2. src/apps/admin/components/MembershipManagement.tsx
Admin dashboard for tracking memberships, upgrades, and deactivations.

### 3. src/apps/admin/components/UpgradeRequests.tsx
Admin interface to process premium upgrade requests.

### 4. src/apps/admin/components/DeactivationRequests.tsx
Admin interface to review and approve deactivation requests.

### 5. components/VerifiedBadge.tsx
Visual badge component displayed on member profiles.

---

## Workflow Diagrams

### Membership Lifecycle

```
New Member Registration
         ↓
Accept Membership Agreement (Month 1 - FREE)
         ↓
Auto-advance to Month 2 (Rp 100k)
         ↓
Payment Due on 1st, Grace until 5th
         ↓
    ┌────┴────┐
   PAID    NOT PAID
    ↓         ↓
Continue  Suspended → Lead-Based Model
Month 3      ↓
(135k)    Pay 50k per accepted lead
    ↓         ↓
Month 4   Option to Upgrade to Premium (275k)
(175k)      ↓
    ↓    Premium Member (Verified Badge)
Month 5+     ↓
(200k)   Unlimited bookings, no lead charges
```

### Premium Upgrade Flow

```
Lead-Based Member
       ↓
Request Premium Upgrade
       ↓
System calculates:
  - Upgrade fee: 275k
  - Outstanding lead charges
  - Total: 275k + outstanding
       ↓
Generate Stripe Payment Link
       ↓
Member pays via Stripe
       ↓
Webhook confirms payment
       ↓
System updates:
  - Status: premium
  - Verified: true
  - Clear all lead charges
       ↓
Premium Member (Verified Badge Granted)
```

### Deactivation Flow

```
Member requests deactivation
         ↓
System checks outstanding dues
         ↓
    ┌────┴────┐
 DUES=0   DUES>0
    ↓         ↓
 Allow    Reject (must pay first)
    ↓
Create deactivation request
    ↓
Admin reviews request
    ↓
Approve → 30 day notice period
    ↓
Deactivation effective
    ↓
Cannot reactivate for 90 days
    ↓
Reactivation: 275k fee + admin approval
```

---

## Testing Checklist

### Agreement Testing
- [ ] Display membership terms correctly
- [ ] Show pricing tiers clearly
- [ ] Accept agreement creates database record
- [ ] Member document updated with agreement fields
- [ ] Agreement version tracked
- [ ] IP address and user agent captured

### Payment Testing
- [ ] Month 1 free trial works
- [ ] Month 2-5 pricing correct
- [ ] Premium upgrade pricing (275k) enforced
- [ ] Outstanding dues calculated correctly
- [ ] Late fees applied after 5th
- [ ] Stripe payment links generate correctly

### Verified Badge Testing
- [ ] Badge displays for paid members
- [ ] Badge hidden for trial members
- [ ] Badge hidden for lead-based members
- [ ] Badge displays for premium members
- [ ] Badge removed on suspension
- [ ] Badge removed on deactivation

### Upgrade Testing
- [ ] Only lead-based members can upgrade
- [ ] Total cost includes outstanding dues
- [ ] Stripe payment processed correctly
- [ ] Member status updated to premium
- [ ] Verified badge granted
- [ ] Lead charges cleared

### Deactivation Testing
- [ ] Cannot deactivate with outstanding dues
- [ ] 30-day notice period enforced
- [ ] Admin approval required
- [ ] Member status updated correctly
- [ ] Verified badge removed
- [ ] 90-day reactivation lock enforced

### Admin Dashboard Testing
- [ ] Membership stats display correctly
- [ ] Pending upgrades show in queue
- [ ] Pending deactivations show in queue
- [ ] Revenue calculations accurate
- [ ] Member type filtering works
- [ ] Date range filtering works

---

## Deployment Steps

### 1. Create Appwrite Collections

**membership_agreements:**
```bash
Collection ID: membership_agreements
Attributes:
- memberId (string, 255, required)
- memberType (enum: therapist|massage_place|facial_place)
- agreementVersion (string, 10, required)
- acceptedDate (datetime, required)
- ipAddress (string, 50)
- userAgent (string, 500)
- termsAcknowledged (string[], 500)
- pricingTierAcknowledged (json)
- isActive (boolean)
- terminatedDate (datetime)
- terminationReason (string, 1000)

Indexes:
- member_agreements_idx: memberId (ASC)
- active_agreements_idx: isActive (ASC)
```

**membership_upgrades:**
```bash
Collection ID: membership_upgrades
Attributes:
- memberId (string, 255, required)
- memberType (enum: therapist|massage_place|facial_place)
- upgradeDate (datetime, required)
- previousModel (string, 50)
- newModel (string, 50)
- upgradeFee (integer, required)
- paymentStatus (enum: pending|paid|failed)
- paymentDate (datetime)
- paymentMethod (string, 50)
- paymentReference (string, 255)
- outstandingDuesCleared (integer)
- totalPaidAtUpgrade (integer)
- verifiedBadgeGranted (boolean)
- verifiedBadgeDate (datetime)
- adminNotes (string, 1000)
- memberNotes (string, 1000)

Indexes:
- member_upgrades_idx: memberId (ASC)
- payment_status_idx: paymentStatus (ASC)
```

**deactivation_requests:**
```bash
Collection ID: deactivation_requests
Attributes:
- memberId (string, 255, required)
- memberType (enum: therapist|massage_place|facial_place)
- requestDate (datetime, required)
- requestedBy (string, 255)
- reason (string, 2000)
- status (enum: pending|approved|rejected|completed)
- reviewedBy (string, 255)
- reviewedDate (datetime)
- reviewNotes (string, 2000)
- outstandingDuesAtRequest (integer)
- duesPaidBeforeDeactivation (integer)
- clearanceCertificateIssued (boolean)
- noticeProvidedDate (datetime)
- effectiveDate (datetime)
- canReactivateAfter (datetime)
- reactivationFeeRequired (integer)
- reactivationRequiresApproval (boolean)

Indexes:
- member_deactivations_idx: memberId (ASC)
- status_idx: status (ASC)
- effective_date_idx: effectiveDate (ASC)
```

### 2. Update Existing Collections

Add these attributes to **therapists**, **places**, and **facial_places** collections:

```bash
New Attributes:
- subscriptionStatus (enum: trial|active|suspended|lead_based|premium|deactivated)
- subscriptionEndDate (datetime)
- paymentModel (enum: subscription|lead_based|premium)
- membershipMonth (integer)
- isVerified (boolean)
- verifiedSince (datetime)
- agreementAccepted (boolean)
- agreementAcceptedDate (datetime)
- agreementVersion (string, 10)
- upgradedToPremium (boolean)
- premiumUpgradeDate (datetime)
- previousPaymentModel (string, 50)
- deactivationRequested (boolean)
- deactivationRequestDate (datetime)
- deactivationEffectiveDate (datetime)
- deactivationReason (string, 1000)
- outstandingDues (integer)
- lastPaymentDate (datetime)
- lastPaymentAmount (integer)
- totalPaidToDate (integer)
- commitmentEndDate (datetime)
- canCancelAfter (datetime)
- memberPhone (string, 20)
- memberEmail (email)

New Indexes:
- subscription_status_idx: subscriptionStatus (ASC)
- payment_model_idx: paymentModel (ASC)
- verified_members_idx: isVerified (ASC)
```

### 3. Update Configuration

Update `lib/appwrite.config.ts`:
```typescript
export const appwriteConfig = {
  // ... existing config
  membershipAgreements: 'membership_agreements',
  membershipUpgrades: 'membership_upgrades',
  deactivationRequests: 'deactivation_requests'
};
```

### 4. Deploy Components

- Copy membership pages to `pages/`
- Copy admin components to `src/apps/admin/components/`
- Update `AppRouter.tsx` with new routes
- Update `AdminDashboardPage.tsx` with new menu items

### 5. Test End-to-End

Complete testing checklist before production deployment.

---

## Admin Dashboard Integration

Add to `AdminDashboardPage.tsx`:

```typescript
// Add to activeView type
type ActiveView = 'overview' | 'therapists' | 'places' | 'facials' | 
                  'leads' | 'memberships' | 'upgrades' | 'deactivations';

// Add menu items
<button
  className={`menu-button ${activeView === 'memberships' ? 'active' : ''}`}
  onClick={() => setActiveView('memberships')}
>
  <Shield className="icon" />
  <div>
    <div className="menu-title">Membership Management</div>
    <div className="menu-description">Track subscriptions & verified badges</div>
  </div>
</button>

<button
  className={`menu-button ${activeView === 'upgrades' ? 'active' : ''}`}
  onClick={() => setActiveView('upgrades')}
>
  <TrendingUp className="icon" />
  <div>
    <div className="menu-title">Premium Upgrades</div>
    <div className="menu-description">Process 275k upgrade requests</div>
  </div>
</button>

<button
  className={`menu-button ${activeView === 'deactivations' ? 'active' : ''}`}
  onClick={() => setActiveView('deactivations')}
>
  <UserX className="icon" />
  <div>
    <div className="menu-title">Deactivation Requests</div>
    <div className="menu-description">Review account closures</div>
  </div>
</button>

// Add view rendering
{activeView === 'memberships' && <MembershipManagement />}
{activeView === 'upgrades' && <UpgradeRequests />}
{activeView === 'deactivations' && <DeactivationRequests />}
```

---

## WhatsApp Message Templates

### Upgrade Confirmation
```
🎉 UPGRADE BERHASIL / UPGRADE SUCCESSFUL

Terima kasih telah upgrade ke Premium Membership!
Thank you for upgrading to Premium Membership!

✅ Status: Premium Member
🏅 Verified Badge: Aktif
💰 Biaya Bulanan: Rp 275,000/bulan
📅 Berlaku mulai: [DATE]

Keuntungan Premium:
✅ Unlimited booking requests
✅ Verified badge di profil
✅ Priority customer support
✅ No per-lead charges

Terima kasih! / Thank you!
[COMPANY NAME]
```

### Deactivation Approved
```
✅ DEACTIVATION APPROVED

Permintaan deactivation Anda telah disetujui.
Your deactivation request has been approved.

📅 Efektif tanggal: [DATE]
💰 Semua tagihan: LUNAS / PAID
🔒 Dapat reaktivasi setelah: [DATE] (90 hari)

Biaya reaktivasi: Rp 275,000
Memerlukan persetujuan admin.

Terima kasih atas kerjasama Anda!
Thank you for your cooperation!

[COMPANY NAME]
```

---

## Future Enhancements

1. **Referral Program**: Premium members get discounts for referrals
2. **Annual Plans**: Discounted yearly premium pricing (275k × 10 = 2,750k/year)
3. **Grace Period Extensions**: Allow one-time payment extensions
4. **Performance Bonuses**: High-rated members get discount on renewals
5. **Family Plans**: Multiple therapists under one membership
6. **Custom Packages**: Enterprise pricing for large massage places

---

## System Complete ✅

All components, database schemas, and workflows documented and ready for implementation.
