# Global Drawer Migration Guide

## ✅ COMPLETED

### 1. Created Global AppDrawer Component
**File:** `components/AppDrawer.tsx`

A reusable drawer component that consolidates all navigation across the entire app.

**Features:**
- Fixed overlay with slide-in panel from right
- Responsive width: `w-[70%] sm:w-80`
- Beautiful gradient background
- 8 organized sections:
  - Job Posting (Massage Jobs, Therapist Jobs)
  - Login/Create Account (Hotel, Villa, Therapists, Massage Spa, Agent, Customer)
  - Company (About, How It Works, Blog, Contact)
  - Locations (Massage in Bali with count)
  - Services (Balinese Massage, Deep Tissue)
  - Help & Support (FAQ)
  - Admin Portal
  - Custom Links from Appwrite
- Footer with Terms/Privacy links
- Auto-closes after navigation
- Smooth animations

**Props Interface:**
```typescript
interface AppDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    
    // Navigation callbacks
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onHotelPortalClick: () => void;
    onVillaPortalClick: () => void;
    onTherapistPortalClick: () => void;
    onMassagePlacePortalClick: () => void;
    onAgentPortalClick: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick: () => void;
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    
    // Data for display
    therapists?: any[];
    places?: any[];
    customLinks?: any[];
}
```

### 2. Updated HomePage
**File:** `pages/HomePage.tsx`

**Changes Made:**
- ✅ Imported `AppDrawer` component
- ✅ Removed unused icon imports (HomeIcon, CloseIcon, BriefcaseIcon, UserSolidIcon)
- ✅ Removed unused local icon components (UsersIcon, BuildingIcon, SparklesIcon)
- ✅ Kept ChevronDownIcon for massage type filter
- ✅ Replaced 300+ lines of drawer JSX with clean AppDrawer component call
- ✅ Passes all required callbacks to AppDrawer
- ✅ Passes therapists, places, and customLinks data

**Result:** Clean, maintainable code with global navigation

### 3. Updated MassagePlaceProfilePage
**File:** `pages/MassagePlaceProfilePage.tsx`

**Changes Made:**
- ✅ Imported `AppDrawer` and `customLinksService`
- ✅ Added `useEffect` import for custom links fetching
- ✅ Removed unused icon imports (X, Home, User, Settings, LogOut)
- ✅ Added all navigation callback props to interface
- ✅ Added `therapists` and `places` props
- ✅ Added `customLinks` state with useEffect to fetch from Appwrite
- ✅ Replaced simple drawer with AppDrawer component
- ✅ Passes all navigation callbacks (with fallback empty functions for required ones)
- ✅ Removed old drawer JSX (80+ lines)

**Result:** Consistent navigation experience across profile pages

---

## 🔄 PENDING PAGES TO UPDATE

The following pages still have local `isMenuOpen` drawers that need to be replaced with the global `AppDrawer`:

### Public Pages (12 files)
1. `pages/PaymentInfoPage.tsx`
2. `pages/MassageBaliPage.tsx`
3. `pages/blog/TraditionalBalineseMassagePage.tsx`
4. `pages/AboutUsPage.tsx`
5. `pages/ContactUsPage.tsx`
6. `pages/TherapistInfoPage.tsx`
7. `pages/HotelInfoPage.tsx`
8. `pages/EmployerInfoPage.tsx`
9. `pages/PartnershipInquiriesPage.tsx`
10. `pages/BalineseMassagePage.tsx`
11. `pages/JobUnlockPaymentPage.tsx`
12. `pages/HowItWorksPage.tsx`

### Steps for Each Page:

#### 1. Update Imports
```typescript
// ADD:
import { AppDrawer } from '../components/AppDrawer';
import { customLinksService } from '../lib/appwriteService';
import { useState, useEffect } from 'react'; // if not already imported

// REMOVE (if no longer used elsewhere):
import { X, Home, User, Settings, LogOut, etc... } from 'lucide-react';
```

#### 2. Add Props to Interface
```typescript
interface YourPageProps {
    // ... existing props
    
    // ADD Navigation callbacks:
    onMassageJobsClick?: () => void;
    onTherapistJobsClick?: () => void;
    onHotelPortalClick?: () => void;
    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}
```

#### 3. Add Custom Links State
```typescript
const YourPage: React.FC<YourPageProps> = ({ 
    // ... existing props,
    // Destructure new props
    onMassageJobsClick,
    onTherapistJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onNavigate,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [customLinks, setCustomLinks] = useState<any[]>([]);
    
    // ADD: Fetch custom links
    useEffect(() => {
        customLinksService.getCustomLinks()
            .then(links => setCustomLinks(links))
            .catch(err => console.error('Failed to fetch custom links:', err));
    }, []);
    
    // ... rest of component
```

#### 4. Replace Drawer JSX
**Find and remove:**
```typescript
{isMenuOpen && (
    <>
        <div className="fixed inset-0 bg-black bg-opacity-50..." onClick={() => setIsMenuOpen(false)} />
        <div className="fixed right-0 top-0...">
            {/* 50-100+ lines of menu items */}
        </div>
    </>
)}
```

**Replace with:**
```typescript
<AppDrawer
    isOpen={isMenuOpen}
    onClose={() => setIsMenuOpen(false)}
    onMassageJobsClick={onMassageJobsClick}
    onTherapistJobsClick={onTherapistJobsClick}
    onHotelPortalClick={onHotelPortalClick || (() => {})}
    onVillaPortalClick={onVillaPortalClick || (() => {})}
    onTherapistPortalClick={onTherapistPortalClick || (() => {})}
    onMassagePlacePortalClick={onMassagePlacePortalClick || (() => {})}
    onAgentPortalClick={onAgentPortalClick || (() => {})}
    onCustomerPortalClick={onCustomerPortalClick}
    onAdminPortalClick={onAdminPortalClick || (() => {})}
    onNavigate={onNavigate}
    onTermsClick={onTermsClick}
    onPrivacyClick={onPrivacyClick}
    therapists={therapists}
    places={places}
    customLinks={customLinks}
/>
```

#### 5. Update Parent Component Calls
When these pages are called from App.tsx or router, add the new props:
```typescript
<YourPage
    // ... existing props
    onMassageJobsClick={() => {/* navigate to massage jobs */}}
    onTherapistJobsClick={() => {/* navigate to therapist jobs */}}
    onHotelPortalClick={() => {/* navigate to hotel portal */}}
    onVillaPortalClick={() => {/* navigate to villa portal */}}
    onTherapistPortalClick={() => {/* navigate to therapist portal */}}
    onMassagePlacePortalClick={() => {/* navigate to massage spa portal */}}
    onAgentPortalClick={() => {/* navigate to agent portal */}}
    onCustomerPortalClick={() => {/* navigate to customer portal */}}
    onAdminPortalClick={() => {/* navigate to admin portal */}}
    onNavigate={(page) => {/* handle navigation */}}
    onTermsClick={() => {/* show terms */}}
    onPrivacyClick={() => {/* show privacy */}}
    therapists={therapists}
    places={places}
/>
```

---

## 🎯 DASHBOARD HEADERS TO UPDATE

Check these dashboard files for menu/burger implementations:
1. `components/DashboardHeader.tsx`
2. `pages/TherapistDashboardPage.tsx`
3. `pages/PlaceDashboardPage.tsx`
4. `pages/CustomerDashboardPage.tsx`
5. `pages/AgentDashboardPage.tsx`
6. `pages/HotelDashboardPage.tsx`
7. `pages/VillaDashboardPage.tsx`
8. `pages/AdminDashboardPage.tsx`
9. `src/apps/admin/pages/AdminDashboard.tsx`

**Goal:** Replace their header menu with burger icon that opens the global `AppDrawer`

---

## 📋 BENEFITS OF THIS MIGRATION

1. **Code Reduction**: Eliminated 300+ lines of duplicate drawer code per page
2. **Consistency**: Same navigation experience everywhere
3. **Maintainability**: Update menu in one place, affects entire app
4. **Features**: All pages now have access to full navigation menu
5. **User Experience**: Familiar navigation pattern across all pages
6. **Custom Links**: Appwrite custom links work everywhere
7. **Dynamic Counts**: Therapist/place counts update globally
8. **Performance**: Single drawer component, less duplication

---

## 🚀 NEXT STEPS

1. Update remaining 12 public pages using the steps above
2. Update dashboard headers to use AppDrawer
3. Ensure all parent components pass required callbacks
4. Test navigation flows from all pages
5. Verify custom links work from all pages
6. Test window event listener for footer toggle (if used)

---

## 📝 NOTES

- Keep the `isMenuOpen` state in each page to control drawer visibility
- Use `() => {}` as fallback for required callbacks if page doesn't have them
- Optional callbacks can remain undefined
- The `customLinks` state should be local to each page (fetched via useEffect)
- Alternatively, could be lifted to App.tsx and passed as prop if preferred
- Burger menu icon trigger remains page-specific (in headers)
- ProfileHeader already compatible (uses onMenuClick callback)

---

## ⚠️ IMPORTANT

Before deploying, ensure all pages have been updated to avoid:
- Broken navigation on non-updated pages
- Inconsistent menu experiences
- Missing menu items on some pages
- TypeScript errors from missing props

Test checklist:
- [ ] All public pages show drawer on burger click
- [ ] All dashboard headers show drawer on burger click
- [ ] All menu items navigate correctly
- [ ] Custom links display and open
- [ ] Therapist/place counts accurate
- [ ] Footer links work
- [ ] Admin portal accessible
- [ ] Drawer closes after navigation
- [ ] Drawer closes on backdrop click
- [ ] Smooth animations working

---

**Migration Status:** 3 of 15+ pages complete (20%)
**Estimated Remaining Work:** 2-3 hours for all pages + testing
