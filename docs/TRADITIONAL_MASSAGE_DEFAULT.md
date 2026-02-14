# Traditional Massage – Default Service and Pricing

## Summary

**Traditional Massage** is the standard default service name used only in these places:

1. **Dashboard profile (therapist and massage place)** – The 3 price fields (60 / 90 / 120 min) on the profile upload page are labeled as **Traditional Massage**. This is the only place where new accounts set these prices. **Therapists (and places, when they have the same flow) cannot save their profile unless all 3 container prices are set** – so every saved profile always has Traditional Massage prices for the 3 containers.
2. **Price slider** – When a therapist (or place) has set those 3 prices on the dashboard, a **Traditional Massage** entry is added to the price slider with those prices, alongside the 5 sample/default menu items (or 4 other samples when profile prices are set).
3. **Profile and home cards** – When Traditional Massage (from dashboard prices) is the **lowest** among all menu items, it is the one displayed in the 3 price containers and as the service name on therapist/place profile pages.

## Flow

- **New account:** Therapist sets 3 prices on dashboard → saved as `price60`, `price90`, `price120` on the therapist document.
- **Price slider:** When the price list modal is opened, the enhanced menu is loaded. If the therapist has profile prices (all three > 0), the first item in the default/sample list is **Traditional Massage** with those prices, plus 4 other sample services (5 items total). If they have no profile prices, 5 sample items are shown (one of which may be “Traditional Massage” with sample prices).
- **Profile/card:** If the therapist has no custom menu in `therapist_menus`, the card uses therapist doc prices and displays “Traditional Massage” (from `TherapistPricingGrid` / `getServiceName`). If they have a menu, the **cheapest** menu item (by 60‑min price) is used for the 3 containers and name; when that cheapest item is the profile-injected Traditional Massage, it is shown.

## Code references

- **Dashboard label:** `TherapistDashboardPage.tsx` / `TherapistDashboard.tsx` – “Traditional Massage – 3 prices”.
- **Slider injection:** `EnhancedMenuDataService.getDefaultMenuData(therapistId, profilePrices)` – when `profilePrices` is set, first item is Traditional Massage with those prices.
- **Hook:** `useCompatibleMenuData(therapistId, therapist)` – passes `therapist.price60/90/120` so the enhanced menu can inject Traditional Massage.
- **Profile/card name fallback:** `TherapistPricingGrid.getServiceName()`, `TherapistHomeCard.getServiceName()`, `getMenuItemDisplayName()` in `therapistCardHelpers.ts` – default name “Traditional Massage” when no menu or no name.
- **Sample names:** `samplePriceUtils.ts` – `SAMPLE_MASSAGE_NAMES` includes “Traditional Massage”; when profile prices are used, that name is reserved for the dashboard-injected item.

## Massage places

The same concept applies to massage places: dashboard 3 prices are the standard default and can be labeled Traditional Massage; if the place dashboard exposes the same 3 price fields, they should be treated the same way (only place that “sets” Traditional Massage, and that entry appears in the place’s price slider and on the place profile when it is the lowest).
