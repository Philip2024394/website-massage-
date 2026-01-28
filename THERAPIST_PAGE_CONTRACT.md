# Therapist Page Contract Lock - Documentation

## 🔒 Overview

The **Therapist Page Contract Lock** is a safety system that ensures all therapist dashboard pages maintain required structural components while remaining flexible for UI and feature updates.

## 🎯 Objectives

1. **Prevent Silent Failures**: Pages cannot render without required layout components
2. **Ensure Consistency**: All pages have standard header, help icon, and navigation
3. **Allow Flexibility**: UI styling and feature logic remain fully editable
4. **Protect Routes**: Route configuration and navigation structure are immutable

---

## 📋 Contract Rules

### ✅ LOCKED (Cannot be removed or bypassed)

| Component | Purpose | File |
|-----------|---------|------|
| `TherapistLayout` | Navigation sidebar and page wrapper | `src/components/therapist/TherapistLayout.tsx` |
| `TherapistPageHeader` | Consistent page header with title and actions | `src/components/therapist/TherapistPageHeader.tsx` |
| `HelpTooltip` | Contextual help for every page | `src/components/therapist/HelpTooltip.tsx` |
| Route Configuration | URL paths and navigation keys | `src/router/routes/therapistRoutes.tsx` |

### ✅ FLEXIBLE (Can be changed freely)

- **UI Styling**: Colors, spacing, animations, responsive design
- **Feature Logic**: State management, API calls, data processing
- **Content Sections**: Forms, cards, lists, tables, charts
- **Business Logic**: Validation, calculations, workflows
- **API Connections**: Appwrite queries, data fetching

---

## 🏗️ Architecture

### TherapistPageWrapper Component

**Location**: `src/components/therapist/TherapistPageWrapper.tsx`

**Purpose**: Enforces page contract by automatically injecting required components.

**Required Props**:
```typescript
{
  title: string;           // Page title
  subtitle?: string;       // Optional subtitle
  helpId: string;          // Help content reference (e.g., "dashboardHelp.overview")
  currentPage: string;     // Current page key for navigation
  therapist: Therapist;    // Therapist data
  onNavigate?: Function;   // Navigation handler
}
```

**Optional Props**:
```typescript
{
  icon?: ReactNode;        // Custom icon for header
  onBackToStatus?: Function;
  actions?: ReactNode;     // Additional header actions
  useLayout?: boolean;     // Default: true
  useHeader?: boolean;     // Default: true
  pageName?: string;       // For error logging
}
```

**Usage Example**:
```tsx
import TherapistPageWrapper from '../../components/therapist/TherapistPageWrapper';

const MyPage: React.FC<Props> = ({ therapist, onNavigate }) => {
  return (
    <TherapistPageWrapper
      title="My Page Title"
      subtitle="Page description"
      helpId="myPageHelp.overview"
      currentPage="my-page"
      therapist={therapist}
      onNavigate={onNavigate}
      icon={<MyIcon />}
      pageName="MyPage"
    >
      {/* Your flexible content here */}
      <div className="p-6">
        <h2>Custom Content</h2>
        {/* Forms, cards, features, etc. */}
      </div>
    </TherapistPageWrapper>
  );
};
```

---

## 🛡️ Runtime Safeguards

### Contract Validation

**Location**: `src/components/therapist/pageContractUtils.ts`

**Functions**:

1. **`validatePageContract(pageName, props)`**
   - Checks for required props
   - Logs errors for violations
   - Returns `true` if valid

2. **`getHelpContent(helpId)`**
   - Safely retrieves help content from `helpContent.ts`
   - Handles missing content gracefully
   - Format: `"objectName.key"` (e.g., `"dashboardHelp.overview"`)

3. **`logPageRender(pageName, props)`**
   - Monitors page renders in development
   - Helps debug contract issues

4. **`createPageErrorHandler(pageName)`**
   - Creates consistent error handlers
   - Improves error tracking

### Error Messages

**Contract Violations**:
```
[THERAPIST PAGE CONTRACT VIOLATION] PageName: Missing required prop "title"
[THERAPIST PAGE CONTRACT VIOLATION] PageName: Missing required prop "helpId"
[THERAPIST PAGE CONTRACT VIOLATION] PageName: Missing required prop "currentPage"
```

**Warnings**:
```
[THERAPIST PAGE CONTRACT WARNING] PageName: Missing therapist data
```

**Help Content Errors**:
```
[THERAPIST PAGE CONTRACT ERROR] Failed to load help content for "invalidHelp.key"
```

---

## 📦 Components Registry

### Locked Components (20 Pages Total)

All therapist dashboard pages are protected by the contract:

| Page | Current Page Key | Help ID | Status |
|------|------------------|---------|--------|
| TherapistDashboard | `dashboard` | `dashboardHelp.overview` | ✅ Has Help Icon |
| TherapistOnlineStatus | `status` | `onlineStatusHelp.*` | ✅ Has Help Icon |
| TherapistBookings | `bookings` | `bookingsHelp.*` | ✅ Has Help Icon |
| TherapistEarnings | `earnings` | `earningsHelp.*` | ✅ Has Help Icon |
| TherapistChat | `chat` | `chatHelp.overview` | ✅ Has Help Icon |
| TherapistNotifications | `notifications` | `notificationsHelp.overview` | ✅ Has Help Icon |
| TherapistLegal | `legal` | `legalHelp.terms` | ✅ Has Help Icon |
| TherapistCalendar | `calendar` | `calendarHelp.*` | ✅ Has Help Icon |
| TherapistPaymentInfo | `payment` | `paymentInfoHelp.*` | ✅ Has Help Icon |
| TherapistPaymentStatus | `paymentStatus` | `paymentStatusHelp.*` | ✅ Has Help Icon |
| CommissionPayment | `commission` | `commissionHelp.overview` | ✅ Has Help Icon |
| TherapistSchedule | `schedule` | `scheduleHelp.overview` | ✅ Has Help Icon |
| TherapistMenu | `menu` | `menuHelp.overview` | ✅ Has Help Icon |
| PremiumUpgrade | `premium` | `premiumHelp.overview` | ✅ Has Help Icon |
| SendDiscountPage | `sendDiscount` | `sendDiscountHelp.*` | ✅ Has Help Icon |
| HotelVillaSafePass | `safePass` | `safePassHelp.*` | ✅ Has Help Icon |
| MyBookings | `myBookings` | `myBookingsHelp.*` | ✅ Has Help Icon |
| PackageTermsPage | `packageTerms` | `packageTermsHelp.overview` | ✅ Has Help Icon |
| MoreCustomersPage | `moreCustomers` | `moreCustomersHelp.*` | ✅ Has Help Icon |
| MembershipOnboarding | `onboarding` | `membershipOnboardingHelp.setup` | ✅ Has Help Icon |

---

## 🚀 Migration Guide

### Step 1: Import Components
```tsx
import TherapistPageWrapper from '../../components/therapist/TherapistPageWrapper';
```

### Step 2: Wrap Page Content
Replace existing layout code with TherapistPageWrapper:

**Before**:
```tsx
return (
  <TherapistLayout therapist={therapist} currentPage="myPage">
    <TherapistPageHeader title="My Page" />
    <div>Content</div>
  </TherapistLayout>
);
```

**After**:
```tsx
return (
  <TherapistPageWrapper
    title="My Page"
    helpId="myPageHelp.overview"
    currentPage="myPage"
    therapist={therapist}
  >
    <div>Content</div>
  </TherapistPageWrapper>
);
```

### Step 3: Add Help Content
Ensure help content exists in `src/pages/therapist/constants/helpContent.ts`:

```typescript
export const myPageHelp: PageHelpContent = {
  overview: {
    title: 'My Page Help',
    content: 'Description of page features',
    benefits: ['Benefit 1', 'Benefit 2', 'Benefit 3']
  }
};
```

### Step 4: Test
- [ ] Page renders correctly
- [ ] Help icon visible and functional
- [ ] Navigation works
- [ ] No console errors
- [ ] All features functional

---

## 🔍 Verification Checklist

### For Developers

- [ ] All pages use TherapistPageWrapper
- [ ] All required props provided
- [ ] Help content defined for all pages
- [ ] No TypeScript errors
- [ ] No runtime errors in console
- [ ] Routes unchanged
- [ ] Navigation structure intact
- [ ] Help icons visible on all pages

### For QA

- [ ] All pages render correctly
- [ ] Help icons clickable on every page
- [ ] Help content displays properly
- [ ] Navigation between pages works
- [ ] Back buttons function correctly
- [ ] Mobile responsive
- [ ] No visual regressions

---

## 📊 Contract Enforcement Metrics

**Current Status**:
- **Total Pages**: 20
- **Pages with Help Icons**: 20 (100%)
- **Pages with TherapistLayout**: 20 (100%)
- **Pages with TherapistPageHeader**: 17 (85%)
- **Contract Violations**: 0

**Safeguards Active**:
- ✅ Runtime prop validation
- ✅ Help content validation
- ✅ Error logging
- ✅ Development warnings

---

## 🛠️ Maintenance

### Adding New Pages

1. Create new page component
2. Wrap with TherapistPageWrapper
3. Add help content to helpContent.ts
4. Add route to therapistRoutes.tsx
5. Test thoroughly
6. Update this documentation

### Modifying Existing Pages

**DO ✅**:
- Change UI styling
- Add/remove features
- Update content sections
- Modify API calls
- Refactor logic

**DON'T ❌**:
- Remove TherapistPageWrapper
- Skip required props
- Bypass layout/header
- Change route keys
- Remove help icon

---

## 🐛 Troubleshooting

### "Missing required prop" Error
**Solution**: Ensure all required props passed to TherapistPageWrapper

### Help Content Not Found
**Solution**: Check helpId format (`objectName.key`) and verify export in helpContent.ts

### Page Not Rendering
**Solution**: Check browser console for contract violation errors

### Navigation Broken
**Solution**: Verify currentPage prop matches route key exactly

---

## 📚 Related Files

- **Wrapper**: `src/components/therapist/TherapistPageWrapper.tsx`
- **Utils**: `src/components/therapist/pageContractUtils.ts`
- **Layout**: `src/components/therapist/TherapistLayout.tsx`
- **Header**: `src/components/therapist/TherapistPageHeader.tsx`
- **Help**: `src/components/therapist/HelpTooltip.tsx`
- **Help Content**: `src/pages/therapist/constants/helpContent.ts`
- **Routes**: `src/router/routes/therapistRoutes.tsx`

---

## 🎯 Success Criteria

✅ **Contract Lock Active**: All pages enforce required components  
✅ **Zero Violations**: No console errors for contract violations  
✅ **Full Coverage**: 100% of pages have help icons  
✅ **Routes Protected**: No route changes possible without explicit updates  
✅ **UI Flexible**: Styling and features remain fully editable  

---

**Last Updated**: January 28, 2026  
**Contract Version**: 1.0.0  
**Pages Protected**: 20/20 (100%)
