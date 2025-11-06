# Files with onHotelPortalClick that need to be cleaned up

The following files need the `onHotelPortalClick` references removed:

1. pages/AboutUsPage.tsx
2. pages/BalineseMassagePage.tsx  
3. pages/BlogIndexPage.tsx
4. pages/FAQPage.tsx
5. pages/HowItWorksPage.tsx
6. pages/MassageBaliPage.tsx
7. pages/MassagePlaceProfilePage.tsx
8. pages/ReferralPage.tsx

For each file, we need to remove:
- `onHotelPortalClick?: () => void;` from the interface
- `onHotelPortalClick,` from the destructured props
- `onHotelPortalClick={onHotelPortalClick}` from the AppDrawer component usage

Let's fix them one by one.