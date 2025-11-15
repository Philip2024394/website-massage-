# Appwrite Collection Schema Extension: `agents_collection_id`

This document extends the existing Agents collection to support referral codes, agreement compliance, payout readiness, and performance tracking.

---
## Added / Updated Attributes

| # | Attribute Key | Type | Size | Required | Default | Description |
|---|---------------|------|------|----------|---------|-------------|
| 1 | `code` | String | 20 | ✅ Yes | - | Unique agent referral code (uppercase, immutable) |
| 2 | `commissionTier` | Enum | - | ✅ Yes | `base20` | Current tier: `base20` or `base23` |
| 3 | `streakMonths` | Integer | - | ✅ Yes | 0 | Consecutive months meeting target |
| 4 | `newSignUpsThisMonth` | Integer | - | ✅ Yes | 0 | New sign‑ups attributed this month |
| 5 | `recurringSignUpsThisMonth` | Integer | - | ✅ Yes | 0 | Recurring renewals attributed this month |
| 6 | `termsAccepted` | Boolean | - | ✅ Yes | false | Has accepted general terms |
| 7 | `complianceAccepted` | Boolean | - | ✅ Yes | false | Has accepted compliance agreement |
| 8 | `marketingAccepted` | Boolean | - | ✅ Yes | false | Accepted optional marketing terms |
| 9 | `termsAcceptedAt` | DateTime | - | ❌ No | null | Timestamp of terms acceptance |
| 10 | `complianceAcceptedAt` | DateTime | - | ❌ No | null | Timestamp of compliance acceptance |
| 11 | `marketingAcceptedAt` | DateTime | - | ❌ No | null | Timestamp of marketing acceptance |
| 12 | `bankIban` | String | 50 | ❌ No | null | IBAN / account number (encrypted at rest) |
| 13 | `bankSwift` | String | 20 | ❌ No | null | SWIFT / BIC (encrypted at rest) |
| 14 | `payoutEnabled` | Boolean | - | ✅ Yes | false | True if agreements + bank details + active status |
| 15 | `totalEarnings` | Float | - | ❌ No | 0 | Lifetime commission earnings |
| 16 | `createdAt` | DateTime | - | ✅ Yes | - | Creation timestamp |

---
## Indexes To Create

| Index Key | Type | Attributes | Order | Purpose |
|-----------|------|-----------|-------|---------|
| `idx_code_unique` | Unique | `code` | ASC | Ensure referral code uniqueness |
| `idx_commissionTier` | Key | `commissionTier` | ASC | Filter agents by tier |
| `idx_createdAt` | Key | `createdAt` | DESC | Recent registrations |

---
## Referral Code Rules
1. Code generated at registration (pattern: `AGT` + zero‑padded sequence or hash segment).
2. Must be uppercase A–Z0–9, length 6–12 (recommended 8).
3. Immutable after creation.
4. Unique constraint enforced via index.

---
## Commission Logic (Display Layer)
- Base tier: `base20` (20% on new sign‑ups).
- Monthly recurring bonus: Add 10% on recurring renewals if monthly target (≥20 new sign‑ups) achieved.
- Upgrade: After 3 consecutive target months, tier becomes `base23` (23% new sign‑ups + recurring bonus rule continues).
- Downgrade: Miss target 2 consecutive months → revert to `base20` and reset `streakMonths`.

---
## Payout Enablement Conditions
`payoutEnabled = termsAccepted && complianceAccepted && bankIban && bankSwift && isActive`

---
## Agreement Acceptance Flow
On acceptance mutation:
1. Update boolean flag.
2. Set corresponding `...AcceptedAt` timestamp.
3. Recompute `payoutEnabled`.
4. Log audit entry (future: `admin_agent_actions`).

---
## Sample Document
```json
{
  "$id": "673abc91000e12345678",
  "name": "Rina Putri",
  "email": "rina@example.com",
  "password": "hashed$...",
  "whatsappNumber": "+6281234567890",
  "code": "AGT00A7",
  "commissionTier": "base20",
  "streakMonths": 2,
  "newSignUpsThisMonth": 21,
  "recurringSignUpsThisMonth": 6,
  "termsAccepted": true,
  "complianceAccepted": true,
  "marketingAccepted": false,
  "termsAcceptedAt": "2025-11-15T09:20:11.000Z",
  "complianceAcceptedAt": "2025-11-15T09:20:30.000Z",
  "marketingAcceptedAt": null,
  "bankIban": "ID123456789012345",
  "bankSwift": "ABCDIDJX",
  "payoutEnabled": true,
  "totalEarnings": 154320.5,
  "createdAt": "2025-10-02T03:12:44.000Z"
}
```

---
## Validation Notes
- `bankIban` & `bankSwift` must pass regex validation before persisting.
- `streakMonths` only increments within monthly aggregation job when `newSignUpsThisMonth >= 20`.
- Reset `newSignUpsThisMonth` / `recurringSignUpsThisMonth` at month rollover (store old values in `monthly_agent_metrics`).

---
## API Usage Examples
### List Top Performing Agents This Month
```typescript
const agents = await databases.listDocuments(DB_ID, 'agents_collection_id', [
  Query.orderDesc('newSignUpsThisMonth'),
  Query.limit(20)
]);
```

### Update Agreement Acceptance
```typescript
await databases.updateDocument(DB_ID, 'agents_collection_id', agentId, {
  termsAccepted: true,
  termsAcceptedAt: new Date().toISOString()
});
```

### Mark Commission Tier Upgrade
```typescript
await databases.updateDocument(DB_ID, 'agents_collection_id', agentId, {
  commissionTier: 'base23',
  streakMonths: currentStreak
});
```

---
## Migration Guidance
If existing agents lack new attributes:
1. Add all attributes (Appwrite will backfill defaults).
2. Run a migration script to set `code` (generate). Ensure uniqueness by lookup.
3. Initialize `commissionTier = 'base20'`, `streakMonths = 0`, `payoutEnabled = false` until agreements accepted.

---
## Security Considerations
- Hide banking fields in standard list queries (fetch individually or project specific fields once Appwrite selective projections available).
- Audit agreement changes and banking details in a future `admin_agent_actions` collection.
- Consider encryption layer (client-side + at rest) for `bankIban`/`bankSwift`.

---
## Next Steps
1. Add attributes & indexes in console.
2. Backfill existing documents.
3. Implement monthly metrics aggregation & streak evaluation.
4. Integrate into dashboard (replace placeholder values).

---
*Extension complete – ready for implementation.*
