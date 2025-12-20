# FacialDashboard.tsx Refactoring Plan

## Current State
- **File Size**: 151KB (2543 lines)
- **Target**: < 15KB per component
- **Status**: ⚠️ Critical - 10x over limit

## Refactoring Strategy

### Phase 1: Extract Reusable Components ✅ STARTED
Created smaller, focused components:

1. **AnalyticsCard.tsx** (~1KB)
   - Displays metric cards
   - Reusable across dashboards
   - ✅ Extracted

2. **BookingCard.tsx** (~2KB)
   - Shows booking details
   - Handles status updates
   - ✅ Extracted

### Phase 2: Extract State Management ✅ STARTED
3. **useDashboardState.ts** (~5KB)
   - Centralized state management hook
   - All dashboard state in one place
   - ✅ Extracted

### Phase 3: Extract Feature Sections (TODO)

4. **ProfileSection.tsx** (~12KB estimated)
   - Name, description, images
   - Contact information
   - Profile picture management

5. **PricingSection.tsx** (~8KB estimated)
   - Pricing configuration
   - Hotel/villa pricing
   - Discount management

6. **ServicesSection.tsx** (~10KB estimated)
   - Facial types selection
   - Additional services
   - Therapist gender, languages
   - Years established

7. **LocationSection.tsx** (~10KB estimated)
   - Location picker
   - City selection
   - Google Maps integration
   - Coordinates management

8. **GallerySection.tsx** (~8KB estimated)
   - Gallery images
   - Image upload/cropping
   - Captions and descriptions

9. **WebsiteSection.tsx** (~6KB estimated)
   - Website information
   - Social media links
   - Instagram/Facebook posts

10. **HoursSection.tsx** (~4KB estimated)
    - Opening/closing times
    - Business hours configuration

### Phase 4: Extract Complex Features

11. **PWAInstaller.tsx** (~5KB)
    - PWA install prompt
    - Install handling
    - Status management

12. **NotificationsPanel.tsx** (~8KB)
    - Notifications display
    - Notification actions
    - Sound settings

13. **PaymentModal.tsx** (~6KB)
    - Payment proof upload
    - Payment status
    - Modal management

14. **ValidationPopup.tsx** (~3KB)
    - Form validation
    - Missing fields display
    - Error handling

### Phase 5: Extract Navigation & Layout

15. **DashboardSidebar.tsx** (~8KB)
    - Navigation menu
    - Tab switching
    - User info display

16. **DashboardHeader.tsx** (~5KB)
    - Header bar
    - Notifications bell
    - Logout button

17. **MobileDrawer.tsx** (~6KB)
    - Mobile navigation
    - Drawer toggle
    - Responsive menu

### Phase 6: Extract Business Logic Hooks

18. **usePlaceData.ts** (~6KB)
    - Place data loading
    - Save functionality
    - Data initialization

19. **useImageUpload.ts** (~5KB)
    - Image upload logic
    - Cropping integration
    - Gallery management

20. **useLocationPicker.ts** (~7KB)
    - Google Maps integration
    - Geolocation
    - City matching

21. **useDiscountManagement.ts** (~4KB)
    - Discount activation
    - Timer management
    - Discount calculation

22. **useBookingManagement.ts** (~5KB)
    - Booking status updates
    - Booking filters
    - Booking actions

### Phase 7: Extract Utilities

23. **dashboardHelpers.ts** (~4KB)
    - Form validation
    - Data sanitization
    - Helper functions

24. **dashboardConstants.ts** (~3KB)
    - Status colors
    - Default values
    - Configuration

## File Structure After Refactoring

```
apps/facial-dashboard/src/
├── pages/
│   └── FacialDashboard.tsx          # Main orchestrator (~20KB)
├── components/
│   ├── dashboard/
│   │   ├── AnalyticsCard.tsx        # ✅ Extracted
│   │   ├── BookingCard.tsx          # ✅ Extracted
│   │   ├── ProfileSection.tsx       # TODO
│   │   ├── PricingSection.tsx       # TODO
│   │   ├── ServicesSection.tsx      # TODO
│   │   ├── LocationSection.tsx      # TODO
│   │   ├── GallerySection.tsx       # TODO
│   │   ├── WebsiteSection.tsx       # TODO
│   │   ├── HoursSection.tsx         # TODO
│   │   ├── PWAInstaller.tsx         # TODO
│   │   ├── NotificationsPanel.tsx   # TODO
│   │   ├── PaymentModal.tsx         # TODO
│   │   └── ValidationPopup.tsx      # TODO
│   └── layout/
│       ├── DashboardSidebar.tsx     # TODO
│       ├── DashboardHeader.tsx      # TODO
│       └── MobileDrawer.tsx         # TODO
├── hooks/
│   ├── useDashboardState.ts         # ✅ Extracted
│   ├── usePlaceData.ts              # TODO
│   ├── useImageUpload.ts            # TODO
│   ├── useLocationPicker.ts         # TODO
│   ├── useDiscountManagement.ts     # TODO
│   └── useBookingManagement.ts      # TODO
└── utils/
    ├── dashboardHelpers.ts          # TODO
    └── dashboardConstants.ts        # TODO
```

## Size Reduction Projection

| Phase | Current | After | Reduction |
|-------|---------|-------|-----------|
| Before | 151 KB | - | - |
| Phase 1-2 | 151 KB | 143 KB | 8 KB |
| Phase 3 | 143 KB | 85 KB | 58 KB |
| Phase 4 | 85 KB | 63 KB | 22 KB |
| Phase 5 | 63 KB | 44 KB | 19 KB |
| Phase 6 | 44 KB | 17 KB | 27 KB |
| Phase 7 | 17 KB | **~12 KB** | 5 KB |

**Final Target**: Main dashboard file < 15KB ✅

## Benefits After Refactoring

### Performance
- ✅ VS Code responsive
- ✅ Fast IntelliSense
- ✅ Quick file loading
- ✅ Better tree-shaking

### Maintainability
- ✅ Easier to test
- ✅ Reusable components
- ✅ Clear separation of concerns
- ✅ Easier code reviews

### Developer Experience
- ✅ Faster navigation
- ✅ Better organization
- ✅ Easier debugging
- ✅ Simpler onboarding

## Progress Tracking

### Completed ✅
- [x] AnalyticsCard component
- [x] BookingCard component
- [x] useDashboardState hook

### In Progress 🚧
- [ ] ProfileSection component
- [ ] Extract main dashboard logic

### TODO 📋
- [ ] All other sections (18 remaining)
- [ ] Integration testing
- [ ] Documentation
- [ ] Performance validation

## Testing Strategy

### Unit Tests
- Test each extracted component
- Test each custom hook
- Test utility functions

### Integration Tests
- Test component interactions
- Test data flow
- Test state management

### Performance Tests
- Measure file load times
- Measure render performance
- Validate bundle sizes

## Migration Steps

1. **Extract components one by one**
   - Create new component file
   - Move JSX and logic
   - Update imports in main file
   - Test functionality

2. **Extract hooks**
   - Identify state logic
   - Create hook file
   - Move state and effects
   - Update main file

3. **Update main file**
   - Replace inline components with imports
   - Use extracted hooks
   - Simplify main component logic

4. **Test thoroughly**
   - Verify all functionality works
   - Check for regressions
   - Performance validation

## Notes

- Keep backward compatibility during migration
- Test after each extraction
- Maintain consistent naming conventions
- Document breaking changes
- Update imports incrementally

---

**Status**: Phase 1-2 Complete (3/24 items)  
**Progress**: 13% Complete  
**Next**: Extract ProfileSection.tsx  
**Target Completion**: January 2025