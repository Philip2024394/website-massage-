# White Space Fix – Quick Reference

> **If you see white space at the top of a therapist page (under the header), use this guide.**

## Root cause

**Wrapping page content in `TherapistLayout`** (or extra layout/div wrappers) creates white space at the top.

- `TherapistLayout` adds `main.therapist-layout-content` and `div.therapist-content-wrapper` around children
- These wrappers introduce margin, padding, or flex behavior that shows up as a visible gap
- Pages that sit correctly (How it works, Hotel Safe Pass) use a **simple structure** without the layout wrapper

## Fix: use a simple structure

For pages that show white space, convert them to the same structure as How it works and Hotel Safe Pass:

```jsx
// ❌ CAUSES WHITE SPACE – wrapping in TherapistLayout
return (
  <TherapistLayout therapist={...} currentPage="..." onNavigate={...}>
    <TherapistPageHeader ... />
    <div>content</div>
  </TherapistLayout>
);

// ✅ NO WHITE SPACE – simple structure
return (
  <div 
    className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50"
    style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}
  >
    <TherapistPageHeader ... />
    <div>content</div>
  </div>
);
```

## What changes when you switch

| With TherapistLayout | With simple structure |
|----------------------|------------------------|
| Sidebar, FAB, dashboard chrome | No sidebar by default |
| Built-in navigation | Add Menu button + EnhancedNavigation if needed |
| White space at top | Content sits directly under header |

## Pages that use simple structure (reference)

- **Status page** – `TherapistOnlineStatus.tsx` – has Menu icon in header to open `EnhancedNavigation`
- **How it works** – `HowItWorksPage.tsx`
- **Hotel Safe Pass** – `TherapistHotelVillaSafePassPage.tsx`

## If a page needs navigation

1. Add a Menu button in `TherapistPageHeader` `actions` prop
2. Use `EnhancedNavigation` in a conditional overlay when Menu is clicked
3. Resolve sidebar ids with `getTherapistSidebarPage()` before calling `onNavigate`

## Related docs

- `docs/THERAPIST_STATUS_PAGE_WHITE_SPACE_REPORT.md` – earlier SmartBreadcrumb fix
- `src/styles/height-lock-elimination.css` – CSS overrides (margin-top: 0, etc.) – may help but **structure change** is the reliable fix

---

*Last updated: Feb 2026*
