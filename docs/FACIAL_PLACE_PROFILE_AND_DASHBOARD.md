# Facial Place Profile Page & Dashboard – Setup and Testing

## 1. Confirmation: What’s connected

### Profile page (public)

- **Route:** `facial-place-profile` → URL `/#/profile/facial/{id}` or `/profile/facial/{id}`.
- **Component chain:** `AppRouter` → `profileRoutes.facialPlace.component` → **FacialPlaceToClinicProfileAdapter** → **FacialClinicProfilePage**.
- **Data:**
  - **From list:** When the user clicks a facial place card on the home page, `selectedPlace` is set and the profile receives `place` + `placeId`.
  - **From URL (e.g. refresh / direct link):** If `place` is missing but `placeId` is in the URL, the adapter calls **facialPlaceService.getByProviderId(placeId)** and loads the place from Appwrite. So the profile works on direct URL and refresh.
- **Appwrite:** All live data comes from the **facial_places** collection via `src/lib/appwrite/services/facial.service.ts` (`getAll()`, `getByProviderId()`). Config: `VITE_FACIAL_PLACES_COLLECTION_ID` (default `facial_places_collection`), same database as the rest of the app.

### Home / listing

- **Data fetch:** `useDataFetching` → `facialPlaceService.getAll()` → Appwrite **facial_places**.
- **Fallback:** If the collection is empty or the request fails, the app returns **one mock place** (`MOCK_FACIAL_PLACE` from `src/constants/mockFacialPlace.ts`) so the home page and profile still work for testing.
- **Profile for mock:** Mock ID is `mock-facial-clinic-1`. Profile URL: `/#/profile/facial/mock-facial-clinic-1` (or with slug `mock-facial-clinic-1-glow-skin-clinic`).

### Dashboard (facial place owner)

- **Route:** `facial-place-dashboard` → URL `/#/dashboard/facial-place` (or `/dashboard/facial-place`).
- **Component:** `DashboardTermsGate` → **facialRoutes.dashboard.component** (Facial App from `apps/facial-dashboard`).
- **Auth:** User signs in as “facial place”; app resolves the provider document (e.g. by email) and passes it as `loggedInProvider` / `place` into the dashboard.
- **Saving:** Dashboard save uses **facialPlaceService.update(placeId, payload)** so changes are written to the same **facial_places** collection in Appwrite.

So: **profile page**, **home listing**, and **facial place dashboard** are all wired to the same Appwrite **facial_places** collection and `facialPlaceService`.

---

## 2. Testing with the in-app mock (no Appwrite document)

1. Ensure **facial_places** is empty or not used (or that the app can fall back to mock).
2. Open the app → Home → switch to **Facial / Skin** (or “Facial Places”) tab. You should see **one card** (“Glow Skin Clinic”).
3. Click the card → profile opens (FacialClinicProfilePage).
4. Direct URL: open `/#/profile/facial/mock-facial-clinic-1`. Profile should load (router resolves mock by ID).

No seed in Appwrite is required for this.

---

## 3. Real data in Appwrite + “View profile” opens the facial place profile page

To have **real data** in Appwrite and open the **facial place profile page** when clicking the card or **“View profile”**:

1. **Create the collection (if needed)**  
   In Appwrite Console → your database → create a collection with ID **`facial_places_collection`** (or set `VITE_FACIAL_PLACES_COLLECTION_ID` in `.env` to your collection ID). Add attributes as needed or use a flexible schema.

2. **Env**  
   In project root `.env` set at least:
   - `APPWRITE_API_KEY` (server API key with write access).
   - Optionally: `VITE_APPWRITE_DATABASE_ID`, `VITE_FACIAL_PLACES_COLLECTION_ID`, `VITE_APPWRITE_ENDPOINT`, `VITE_APPWRITE_PROJECT_ID` (must match the app’s config so the app and seed use the same database/collection).

3. **Seed one facial place**
   ```bash
   node scripts/seed-facial-place.cjs
   ```
   This creates **one** document (e.g. “Glow Skin Clinic”) in the **facial_places** collection.

4. **Open the app**  
   Home → switch to the **Facial / Skin** (or “Facial Places”) tab. You should see one card with the seeded place.

5. **Open the facial place profile**  
   Click the card **or** click **“View profile”** on the card. The app will:
   - Call `handleSetSelectedPlace(place)` with the place from Appwrite (with `type: 'facial'`).
   - Set page to `facial-place-profile` and update the URL to `/#/profile/facial/{id}-{slug}`.
   - Render the facial place profile page (FacialPlaceToClinicProfileAdapter → FacialClinicProfilePage) with that place.

6. **Direct link**  
   You can also open `/#/profile/facial/{docId}` (or with slug). If the place is not in memory (e.g. after refresh), the adapter fetches it by ID via `facialPlaceService.getByProviderId(placeId)` and then shows the profile.

---

## 4. Files reference

| What | File(s) |
|------|--------|
| Profile adapter (resolve place from list or fetch by ID) | `src/pages/FacialPlaceToClinicProfileAdapter.tsx` |
| Profile UI (clinic view) | `src/pages/FacialClinicProfilePage.tsx` |
| Appwrite facial service | `src/lib/appwrite/services/facial.service.ts` |
| Mock constant | `src/constants/mockFacialPlace.ts` |
| Router (facial-place-profile, facial-place-dashboard) | `src/AppRouter.tsx` |
| Facial dashboard app | `apps/facial-dashboard` (wired via `src/router/routes/facialRoutes.tsx`) |
| Seed script | `scripts/seed-facial-place.cjs` |

---

## 5. Summary

- **Facial place profile page** is set up and **connected to Appwrite** (facial_places collection) and works from both **list selection** and **direct URL/refresh** (fetch by ID in the adapter).
- **Facial places dashboard** is connected to the same Appwrite collection via **facialPlaceService.update**.
- **One mock facial place** is available for testing without Appwrite data (**MOCK_FACIAL_PLACE**); for one **real** test document in Appwrite, run **`node scripts/seed-facial-place.cjs`**.
