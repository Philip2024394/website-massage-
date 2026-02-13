# Report: Why Cheapest Prices and Massage Type Name May Not Display

## Where the data is supposed to come from

- **60 / 90 / 120 min prices:** From the **cheapest menu service** (by total 60+90+120) in `therapist_menus.menuData`, or fallback to therapist doc `price60`/`price90`/`price120` (or `pricing` JSON), or sample pricing.
- **Massage type name:** From that same **cheapest menu service**’s `name` / `serviceName` / `title`, or fallback `"Traditional Massage"`.

Used in:
- **Home:** `TherapistHomeCard` (pricing + `getServiceName()`).
- **Profile:** `TherapistCard` (pricing + same logic for name in price grid / slider).

---

## Root causes (check in this order)

### 1. Bulk prefetch not using the same config (fixed)

- **Issue:** `bulkDataService` used only env vars: `VITE_APPWRITE_DATABASE_ID`, `VITE_THERAPIST_MENUS_COLLECTION_ID`. If `VITE_THERAPIST_MENUS_COLLECTION_ID` was missing, prefetch returned an empty map, so home cards never got prefetched menus.
- **Fix applied:** Bulk service now falls back to `APPWRITE_CONFIG.databaseId` and `APPWRITE_CONFIG.collections.therapistMenus` when env vars are missing, so prefetch uses the same config as `therapistMenusService.getByTherapistId`.

### 2. No menu document for the therapist

- If the therapist has no row in the **`therapist_menus`** collection, both home and profile will have empty `menuData` and fall back to therapist-doc or sample pricing, and name will be `"Traditional Massage"`.
- **Check:** Appwrite → Database → `therapist_menus` → filter by `therapistId` = therapist’s `$id`. Ensure the therapist has at least one menu doc with `menuData` set.

### 3. Menu document has wrong or missing `menuData` attribute

- Code expects the menu document to have a **`menuData`** attribute (stringified JSON array). If the collection uses another name (e.g. `menu_data`, `services`) or `menuData` is empty, parsed menu will be empty.
- **Check:** Open a menu document in Appwrite. Confirm attribute name is `menuData` and value is a JSON string of an array of services.

### 4. Menu item structure doesn’t match what the UI expects

- Each item in the parsed array must have **`price60`**, **`price90`**, **`price120`** (all present and > 0) to be used for the three containers and for “cheapest” selection. Name comes from **`name`**, **`serviceName`**, or **`title`**.
- If items use different keys (e.g. `price_60`, or prices in a nested object), `servicesWithFullPricing` will be empty, so no menu-based prices or name.
- **Check:** In Therapist Dashboard → Menu (TherapistMenu), saved format is array of `{ serviceName, price60, price90, price120 }` (prices in thousands, e.g. 250 = 250k). Ensure your menu is saved in this shape.

### 5. Profile: menu not loaded yet (`menuLoadAttempted`)

- On the **profile page** (`TherapistCard`), `getPricing()` returns **0,0,0** until **`menuLoadAttempted`** is true, so the three containers can show zeros until the first menu load (success or fail) completes.
- After that, if menu is empty or invalid, fallback is therapist doc or sample pricing; name stays `"Traditional Massage"` if no valid menu item with name.

### 6. Home: prefetch key mismatch

- Home passes **`prefetchedMenu={prefetchedData?.menus.get(String(therapist.$id || therapist.id))}`**. The bulk fetch map is keyed by **`menu.therapistId`** (from the menu document).
- If **`therapist.$id`** / **`therapist.id`** doesn’t match the **`therapistId`** stored in the menu doc (e.g. type or format difference), the card gets `prefetchedMenu === undefined` and falls back to per-card load. That can still work, but if the per-card load also fails (e.g. network, permissions), you get no menu data.
- **Check:** Log or verify that `therapist.$id` (or `id`) and the menu document’s `therapistId` are the same string.

### 7. Therapist document has no fallback prices

- When there is no valid menu (or no menu at all), the cards use the **therapist document**: **`price60`**, **`price90`**, **`price120`** (or **`pricing`** JSON). If those are missing or zero, and sample pricing is not applied (e.g. `hasActualPricing(therapist)` is true but values are 0), the three containers can show 0 or wrong values.
- **Check:** In Appwrite, therapist doc should have either `price60`/`price90`/`price120` or a valid `pricing` JSON with keys `"60"`, `"90"`, `"120"`.

### 8. Permissions / collection ID

- **`therapist_menus`** (or the ID in `APPWRITE_CONFIG.collections.therapistMenus`) must be readable by the client (e.g. “Any” or appropriate role). Otherwise `listDocuments` / `getByTherapistId` returns empty or errors and menu is never set.
- **Check:** Appwrite Console → Collection → Settings → Permissions; ensure read access for unauthenticated or your app role.

---

## Quick checklist

| Check | Where |
|-------|--------|
| Menu doc exists for therapist | Appwrite → `therapist_menus` → filter by `therapistId` |
| Doc has `menuData` (string, JSON array) | Same document → Attributes |
| Each item has `price60`, `price90`, `price120` (all > 0) and one of `name`/`serviceName`/`title` | Content of `menuData` |
| Bulk prefetch uses same DB/collection as rest of app | Env or `APPWRITE_CONFIG` (fix applied in code) |
| Therapist doc has `price60`/`price90`/`price120` or `pricing` as fallback | Appwrite → therapists collection |
| Collection read permissions | Appwrite → therapist_menus → Permissions |

---

## Code references

- **Home card pricing + name:** `src/components/TherapistHomeCard.tsx` — `getPricing()`, `getServiceName()`, menu from `prefetchedMenu` or `therapistMenusService.getByTherapistId`.
- **Profile card pricing + name:** `src/components/TherapistCard.tsx` — `getPricing()`, same menu logic; menu from `therapistMenusService.getByTherapistId` in `useEffect`; `menuLoadAttempted` gates showing non-zero.
- **Cheapest service:** `src/utils/therapistCardHelpers.ts` — `getCheapestServiceByTotalPrice()` (lowest total of 60+90+120).
- **Bulk prefetch:** `src/lib/services/bulkDataService.ts` — `prefetchTherapistCardData()` / `bulkFetchTherapistMenus()`; now falls back to `APPWRITE_CONFIG` when env vars are missing.
- **Menu save shape:** `src/pages/therapist/TherapistMenu.tsx` — saves array of `{ serviceName, price60, price90, price120 }` as `menuData` string.
