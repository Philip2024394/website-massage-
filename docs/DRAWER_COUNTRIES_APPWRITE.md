# Drawer Countries – Appwrite Connection

This doc describes how **IndaStreet Countries** in the home page side drawer are connected to Appwrite and how each country opens its social media page.

## Connection chain

1. **Data source**  
   `useDrawerCountries()` loads countries from Appwrite via `fetchDrawerCountries()` (from `src/lib/appwrite/services/countries.service.ts`). If the collection is missing or empty, it falls back to the static list in `src/constants/drawerCountries.ts`.

2. **Country → page id**  
   For each country, the drawer uses:
   - `COUNTRY_PAGE_IDS.has(country.id)` to decide if the country has an in-app social page.
   - `getSafeDrawerPage(country.id)` to get the canonical page id (e.g. `united-kingdom` → `uk`).

3. **Navigation**  
   When the user clicks a country, `onNavigate(navigateTo)` is called (e.g. `state.setPage('uk')`). `AppRouter` has a `case` for each country page and renders the corresponding country social page (same experience as Indonesia, with hero and country name).

## Appwrite setup

- **Collection:** `countries` (id in app: `src/lib/appwrite.config.ts` → `collections.countries`).
- **Required attributes:** `code` (string), `name` (string), `flag` (string), `active` (boolean, default true). Optional: `linkedWebsite` (string).
- **Code → id mapping:** The app derives drawer `id` from `code` in `countries.service.ts` (`slugFromCode`). Supported codes: `ID`, `MY`, `SG`, `TH`, `PH`, `VN`, `GB`, `US`, `AU`, `DE` (same as `DRAWER_COUNTRIES_LIST`).

To create the collection and attributes:

```bash
APPWRITE_API_KEY=your_key npx ts-node scripts/setup-countries-collection.ts
```

To seed the 10 drawer countries so the app can load them from Appwrite:

```bash
APPWRITE_API_KEY=your_key npx ts-node scripts/seed-drawer-countries.ts
```

Use the same collection id in the app config as the one you created (or the script will report 404).

## Verification

In **development**, when the app loads the drawer, `useDrawerCountries` runs `verifyDrawerCountriesConnection()`. If any drawer country does not resolve to a valid social page, a warning is logged in the console.

To verify programmatically:

```ts
import { verifyDrawerCountriesConnection } from './utils/drawerCountriesVerification';

const { ok, errors } = verifyDrawerCountriesConnection();
if (!ok) console.warn('Drawer countries connection:', errors);
```

## Adding a new country

1. Add the country to `DRAWER_COUNTRIES_LIST` and `COUNTRY_PAGE_IDS` in `src/constants/drawerCountries.ts`.
2. Add the `code` → slug mapping in `slugFromCode()` in `src/lib/appwrite/services/countries.service.ts`.
3. Add the page id to `DRAWER_PAGE_IDS` in `src/config/drawerConfig.ts` and, if the drawer uses a different slug (e.g. `united-kingdom` → `uk`), add an entry in `ALIASES`.
4. Add the `Page` type in `src/types/pageTypes.ts` and a `case` in `src/AppRouter.tsx` that renders the country social page.
5. Add the country to `publicRoutes` and the country component.
6. Run `scripts/seed-drawer-countries.ts` or add the document in Appwrite Console (same `code` / `name` / `flag` / `active`).
