# Marketplace Collections (Appwrite)

Create two collections and add required attributes.

## Collections
- `marketplace_products`
  - `name` (string, required)
  - `description` (string, optional)
  - `image` (string, optional) – URL to image in Appwrite Storage
  - `price` (number, required)
  - `stockLevel` (integer, optional)
  - `sellerId` (string, required) – references `marketplace_sellers.$id`
  - `countryCode` (string, required) – ISO 3166-1 alpha-2
  - `lat` (number, optional)
  - `lng` (number, optional)

- `marketplace_sellers`
  - `tradingName` (string, required)
  - `whatsapp` (string, optional) – phone in international format
  - `profileImage` (string, optional)
  - `countryCode` (string, required)
  - `lat` (number, optional)
  - `lng` (number, optional)

Set collection IDs in `lib/appwrite.config.ts`:

```ts
marketplaceProducts: 'marketplace_products'
marketplaceSellers: 'marketplace_sellers'
```

## Notes
- Payments: None. We only link to WhatsApp for contact.
- Country filtering: The app filters products by viewer `userLocation.countryCode`.
- Price labels: Use viewer’s country formatting (no currency conversion).
- Distance: Optional; if `lat/lng` present on both product and viewer, it can be computed client-side.
