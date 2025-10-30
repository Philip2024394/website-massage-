# Hotel & Villa Membership System

## Overview
Extended the membership pricing system to include hotels and villas with dedicated packages and FREE option.

## Changes Made

### 1. MembershipPricingPage.tsx - Admin Management
**Added:**
- Category tabs: Therapist & Place, Hotel, Villa
- Hotel packages: 3m (Rp 500k), 6m (Rp 900k), 1y (Rp 1.6M), FREE
- Villa packages: 3m (Rp 500k), 6m (Rp 900k), 1y (Rp 1.6M), FREE
- Category filtering in package list
- Context-aware info banner based on selected category
- Updated icons: Building (Hotel), Home (Villa)

**Interface Updates:**
```typescript
interface MembershipPackage {
  // ... existing fields
  category: 'therapist' | 'place' | 'hotel' | 'villa';
}
```

**State Management:**
```typescript
const [activeCategory, setActiveCategory] = useState<'therapist' | 'hotel' | 'villa'>('therapist');

// Filter packages by category
.filter(pkg => 
  activeCategory === 'therapist' 
    ? pkg.category === 'therapist' || pkg.category === 'place'
    : pkg.category === activeCategory
)
```

**Default Packages:**
- **Hotel Packages:**
  - FREE: Rp 0 (unlimited, complimentary partner access)
  - 3 Months: Rp 500,000
  - 6 Months: Rp 900,000 (Save Rp 100k) ⭐ BEST VALUE
  - 1 Year: Rp 1,600,000 (Save Rp 400k)

- **Villa Packages:**
  - FREE: Rp 0 (unlimited, complimentary partner access)
  - 3 Months: Rp 500,000
  - 6 Months: Rp 900,000 (Save Rp 100k) ⭐ BEST VALUE
  - 1 Year: Rp 1,600,000 (Save Rp 400k)

### 2. HotelDashboardPage.tsx - Hotel Membership Display
**Added:**
- 'membership' to tab types
- Package icon import
- Membership tab button in navigation
- Complete membership section with:
  - Current plan banner (Free Access)
  - 3 upgrade packages (3m, 6m, 1y)
  - WhatsApp subscription links
  - Feature comparison
  - Best Value badge on 6-month plan

**Features per Package:**
```
3 Months (Rp 500k):
✓ Full platform access
✓ Priority listing
✓ QR menu builder
✓ Analytics dashboard

6 Months (Rp 900k) ⭐ BEST VALUE:
✓ All 3-month features
✓ Featured placement
✓ Save Rp 100,000

1 Year (Rp 1.6M):
✓ All 6-month features
✓ Premium support
✓ Save Rp 400,000
```

**WhatsApp Integration:**
```tsx
<a
  href="https://wa.me/6281234567890?text=I%20want%20to%20upgrade%20to%20[duration]%20hotel%20membership"
  target="_blank"
  rel="noopener noreferrer"
>
  Subscribe via WhatsApp
</a>
```

### 3. VillaDashboardPage.tsx - Villa Membership Display
**Changes:** Identical to HotelDashboardPage with "villa" branding
- Same package structure (3m, 6m, 1y + FREE)
- Same pricing (Rp 500k, 900k, 1.6M)
- WhatsApp links say "villa membership"
- Header says "Choose the best plan for your villa"

## User Journey

### Admin Workflow:
1. Navigate to Admin Dashboard → Membership Pricing
2. Click category tab (Therapist & Place / Hotel / Villa)
3. View existing packages for that category
4. Click "Add Package" to create new package
5. Edit package details (title, duration, price, description)
6. Toggle "Best Value" badge
7. Save package (updates all dashboards)
8. Delete package if needed

### Hotel/Villa Workflow:
1. Login to hotel/villa dashboard
2. Click "Membership" tab
3. View current plan (FREE by default)
4. Browse upgrade packages (3m, 6m, 1y)
5. Click "Subscribe via WhatsApp" on desired package
6. Complete payment via WhatsApp
7. Admin activates paid membership

### Agent Workflow (To Be Implemented):
1. Register new hotel/villa client
2. Select membership package from dropdown
3. Options: FREE, 3 months, 6 months, 1 year
4. Agent commission calculated based on paid package
5. Client receives membership confirmation

## Technical Details

### Pricing Structure:
| Package | Therapist/Place | Hotel/Villa | Savings |
|---------|----------------|-------------|---------|
| 1 Month | Rp 150,000 | N/A | - |
| 3 Months | Rp 400,000 | Rp 500,000 | Rp 50k / Rp 0 |
| 6 Months | Rp 750,000 | Rp 900,000 | Rp 150k / Rp 100k |
| 1 Year | Rp 1,400,000 | Rp 1,600,000 | Rp 400k / Rp 400k |
| FREE | N/A | Rp 0 | N/A |

### Category System:
```typescript
// MembershipPackage.category values:
'therapist' - Shared with 'place' (shown together)
'hotel'     - Separate category
'villa'     - Separate category

// Tab filtering logic:
activeCategory === 'therapist' 
  ? pkg.category === 'therapist' || pkg.category === 'place'
  : pkg.category === activeCategory
```

### WhatsApp Numbers:
Currently using placeholder: `6281234567890`
**TODO:** Replace with actual business WhatsApp number

## Next Steps

### Priority 1 - Agent Dashboard Integration:
- [ ] Add hotel/villa package dropdown in AgentDashboardPage
- [ ] Show FREE option prominently
- [ ] Display pricing for commission calculation
- [ ] Update registration flow

### Priority 2 - Backend Integration:
- [ ] Create Appwrite collection: `hotel_villa_memberships`
- [ ] Store package subscriptions
- [ ] Track payment status
- [ ] Implement expiry dates
- [ ] Send renewal reminders

### Priority 3 - Features:
- [ ] Payment gateway integration (not just WhatsApp)
- [ ] Automatic membership activation
- [ ] Email confirmations
- [ ] Invoice generation
- [ ] Membership cards/certificates

### Priority 4 - Analytics:
- [ ] Track conversion rates by package
- [ ] Monitor FREE to paid upgrades
- [ ] Revenue reporting
- [ ] Popular package analysis

## Files Modified

```
pages/MembershipPricingPage.tsx  - Extended with hotel/villa packages
pages/HotelDashboardPage.tsx     - Added membership tab
pages/VillaDashboardPage.tsx     - Added membership tab
```

## Testing Checklist

- [x] Admin can switch between category tabs
- [x] Hotel packages display correctly
- [x] Villa packages display correctly
- [x] FREE option shows Rp 0
- [x] Best Value badge on 6-month plans
- [x] WhatsApp links formatted correctly
- [x] Responsive design (mobile-friendly)
- [x] Savings calculations accurate
- [ ] Add Package button works for hotel/villa
- [ ] Save/Delete works for hotel/villa packages
- [ ] Agent dashboard shows hotel/villa options

## Notes

1. **FREE Option:** Hotels and villas start with FREE access as complimentary partners
2. **Pricing Strategy:** Hotel/villa packages slightly higher than therapist/place (premium positioning)
3. **Upgrade Path:** Clear value proposition with savings indicators
4. **WhatsApp First:** Simple subscription flow via WhatsApp before implementing complex payment gateway
5. **Scalability:** Category system allows easy addition of new membership types (e.g., 'spa', 'gym')

## Future Considerations

1. **Tier System:**
   - Basic (FREE)
   - Standard (3m/6m)
   - Premium (1y)
   - Enterprise (custom)

2. **Feature Gating:**
   - FREE: Basic listing
   - Paid: QR codes, analytics, priority listing
   - Premium: Featured placement, premium support

3. **Promotional Offers:**
   - Launch discounts
   - Seasonal promotions
   - Referral bonuses
   - Bulk purchase (multiple properties)

4. **Commission Structure:**
   - Agent commission on paid upgrades
   - Recurring revenue share
   - Performance bonuses

---

**Status:** ✅ Complete (Admin + Dashboard Display)
**Next:** Agent dashboard integration
**Updated:** 2024
