# Therapist Dashboard — Header Standardization Audit

## Step 1 — Official Header (Status Page Reference)

| Property | Value |
|----------|-------|
| **Component** | `TherapistPageHeader` |
| **File** | `src/components/therapist/TherapistPageHeader.tsx` |
| **Classes** | `bg-white border-b border-gray-200 sticky top-0 z-10` |
| **Inner** | `max-w-7xl mx-auto px-4 py-4` |
| **Height** | ~68px (py-4 × 2 + content) |
| **Structure** | Icon + title/subtitle + Home button + optional actions |

**Status Page Structure (canonical):**
```jsx
<TherapistLayout>
  <TherapistPageHeader title={...} subtitle={...} onBackToStatus={...} icon={...} />
  <div className="bg-white">
    <div className="max-w-sm mx-auto px-4 pt-0 pb-3 space-y-4">
      {/* content */}
    </div>
  </div>
</TherapistLayout>
```

---

## Step 2 — Audit Results (Post-Cleanup)

### ✅ Pages Using Correct Shared Header

| Page | File |
|------|------|
| Status | TherapistOnlineStatus.tsx |
| Earnings | TherapistEarningsPage.tsx |
| Bookings | TherapistBookingsPage.tsx |
| Menu | TherapistMenuPage.tsx |
| Payment | TherapistPaymentInfoPage.tsx |
| Dashboard (Profile) | TherapistDashboard.tsx |
| Customers | TherapistCustomersPage.tsx |
| Analytics | TherapistAnalyticsPage.tsx |
| Banner Discount | BannerDiscountPage.tsx |
| Legal | TherapistLegalPage.tsx |

### ❌ Pages With Extra Header Containers (FIXED)

All listed pages have been standardized to use TherapistPageHeader as first child.

### 🧹 Containers Removed

| File | Change |
|------|--------|
| TherapistEarningsPage.tsx | Removed "Standardized Status Header" card (h2 + status grid); added TherapistPageHeader |
| TherapistBookingsPage.tsx | Removed "Standardized Status Header" card; added TherapistPageHeader |
| TherapistMenuPage.tsx | Removed empty Content Area block, "Page Header" card, main.min-h wrapper; added TherapistPageHeader |
| TherapistPaymentInfoPage.tsx | Removed "Standardized Status Header" card + status grid; added TherapistPageHeader |
| TherapistDashboard.tsx | Removed "Page Header with Status Badge" card (h2 + status grid); added TherapistPageHeader |
| TherapistCustomersPage.tsx | Removed custom "Header" div (h1); added TherapistPageHeader |
| TherapistAnalyticsPage.tsx | Removed custom "Header" div (h1); added TherapistPageHeader |
| BannerDiscountPage.tsx | Removed custom "Header" div (h1 + back button); added TherapistPageHeader |
| TherapistLegalPage.tsx | Removed min-h wrapper; added TherapistPageHeader |

---

## Step 3 — Duplicate Headers Removed

All duplicate page headers have been replaced with TherapistPageHeader.

---

## Step 4 — Status Page Hidden Space Check

Status page immediate children under TherapistLayout:
1. TherapistPageHeader — ✓ visible
2. div.bg-white — wrapper, no pt/mt, serves as content container
3. div.max-w-sm.mx-auto.px-4.pt-0.pb-3.space-y-4 — content

**Verdict:** No hidden spacers. pt-0 on inner div confirms no top padding.

---

## 📏 Confirmation

- [x] All dashboard pages now start content immediately under TherapistPageHeader
- [x] No hidden containers (empty blocks, spacer divs removed)
- [x] No duplicate header bars (custom h1/h2 header blocks removed)
- [x] No structural spacers (min-h wrappers removed or overridden)
- [x] Structural consistency across entire dashboard
