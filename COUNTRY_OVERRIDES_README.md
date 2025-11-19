# Country-Specific Pages (Overrides)

This app can render country-specific versions of pages without forking the whole codebase. Overrides are resolved at runtime using Vite's `import.meta.glob`.

## Structure

- Base pages live in `pages/` (e.g., `pages/MarketplacePageBase.tsx`).
- Country overrides live in `country/<CODE>/pages/` with the same page filename (e.g., `country/ID/pages/MarketplacePage.tsx`).
- The export must be a default React component with the same props as the base page.

```
country/
  ID/
    pages/
      MarketplacePage.tsx   # Indonesia-specific marketplace page
  GB/
    pages/
      MarketplacePage.tsx   # (optional) UK-specific marketplace page
```

## How it works

- `pages/MarketplacePage.tsx` is a thin wrapper that:
  - Detects the viewer's `countryCode`
  - Tries to lazily load `country/<CODE>/pages/MarketplacePage.tsx`
  - Falls back to `pages/MarketplacePageBase.tsx` if no override or if locked
- Global settings in `config/countryLocks.ts` control whether overrides are allowed and which countries are locked.

## Currency & Multi-Market Selling

Products are stored in the seller's local currency. When a buyer from a different country views the product:
- **Product Card**: Shows converted price (approximate) + small original price note
- **Product Detail Page**: Displays both original seller price (final) and converted local price with a disclaimer about exchange rates

### Currency Conversion

`lib/currencyConversion.ts` provides:
- `convertCurrency(amount, fromCurrency, toCurrency)`: Converts using approximate daily rates
- `formatCurrency(amount, currencyCode, countryCode)`: Formats with locale and currency symbol
- `formatCurrencyCompact(amount, currencyCode)`: Compact display (e.g., £1.5M, Rp 280K)

Exchange rates are approximate and can be replaced with a live API (Open Exchange Rates, Fixer.io) for production.

### Seller Workflow

- Seller lists products in their local currency (e.g., IDR for Indonesia)
- For global sales, seller sets `shippingRates` per country in the Seller Dashboard
- Product price is displayed to buyers in:
  - **Seller's currency** (original, final price)
  - **Buyer's local currency** (approximate conversion)

## Feature Flags

Each country has a config file in `config/countries/<CODE>.ts` specifying:
- `currencyCode`: Currency for that market (e.g., `'GBP'`, `'IDR'`)
- `currencyLocale`: Locale for formatting (e.g., `'en-GB'`, `'id-ID'`)
- `features`: Boolean flags for country-specific features

### Example: Agents only in Indonesia

```typescript
// config/countries/ID.ts
const ID: CountryAppConfig = {
  code: 'ID',
  name: 'Indonesia',
  currencyCode: 'IDR',
  currencyLocale: 'id-ID',
  features: {
    agents: true,
    commissions: true,
    marketplace: true,
  },
};

// config/countries/GB.ts
const GB: CountryAppConfig = {
  code: 'GB',
  name: 'United Kingdom',
  currencyCode: 'GBP',
  currencyLocale: 'en-GB',
  features: {
    agents: false,
    commissions: false,
    marketplace: true,
  },
};
```

**Usage in code:**

```tsx
import { getCountryConfig } from '../lib/countryConfig';

const countryConfig = getCountryConfig(userLocation?.countryCode);

if (countryConfig.features.agents) {
  // Show agent portal link, commission panels, etc.
}
```

## Dashboards by Country

Dashboards can be overridden the same way as pages:
- Extract base to `pages/TherapistDashboardPageBase.tsx`
- Create thin wrapper in `pages/TherapistDashboardPage.tsx` that loads `country/<CODE>/pages/TherapistDashboardPage.tsx` if present
- Indonesia version includes Agent and Commission panels; GB/US/AU versions hide them

Currency formatting in dashboards should use:
```tsx
import { formatCurrency } from '../lib/currencyConversion';
import { getCountryConfig } from '../lib/countryConfig';

const countryConfig = getCountryConfig(userLocation?.countryCode);
const displayAmount = formatCurrency(amount, countryConfig.currencyCode, userLocation?.countryCode);
```

## Protections (no unwanted changes)

- `config/countryLocks.ts`:
  - `ALLOW_OVERRIDES = true|false` globally enables/disables all overrides.
  - `LOCKED_COUNTRIES = ['GB']` disallows overrides for listed countries (base page is always used).
- Git workflow:
  - Create PRs for any changes under `country/**`.
  - Enable branch protection rules (required review) on `main` in GitHub → Settings → Branches.
- Optional local protection (Windows):
  - Use `protect-code.ps1` or a custom script to set files read-only locally.

## Add a new country override

1) Copy the base page component and customize:

- File: `country/ID/pages/MarketplacePage.tsx`
- Import and reuse `MarketplacePageBase` if you only want minor changes, or fork the layout fully.

2) Test

- Select the country in the Marketplace header selector.
- You should see the country banner and page changes.

3) Lock or unlock

- Update `config/countryLocks.ts` to prevent overrides for sensitive markets until approved.

## Extending to more pages

- Wrap another page similarly:
  - Extract base to `pages/<Name>Base.tsx`
  - Replace `pages/<Name>.tsx` with a thin wrapper that loads `country/<CODE>/pages/<Name>.tsx` if present

This keeps country logic isolated and safe to ship incrementally.
