# Referral & Attribution Extension: Therapists / Places Collections

This chart-style spec lists additional attributes to add to existing `therapists_collection_id` and `places_collection_id` to enable agent referral tracking, performance analytics, and future commission attribution.

---
## 1. Mandatory New Attributes

| Attribute Key | Type | Size | Required | Default | Index | Applies To | Description | Purpose |
|---------------|------|------|----------|---------|-------|------------|-------------|---------|
| `agentCode` | String | 20 | ❌ (Yes on agent-referred signup) | "" | Key | Therapists, Places | Agent referral code captured at registration (uppercase) | Links signup to agent for commission & metrics |
| `referredByAgentId` | String | 255 | ❌ | null | Key | Therapists, Places | Internal agent document ID (if known) | Direct foreign key reference for joins |
| `referralAt` | DateTime | - | ❌ | null | Key (optional) | Therapists, Places | Timestamp of referral capture | Time-based attribution & cohort analysis |
| `referralSource` | Enum (`agent`,`direct`,`campaign`,`unknown`) | - | ✅ | `unknown` | Key | Therapists, Places | Origin classification | Distinguish organic vs agent vs marketing |
| `referralCampaignId` | String | 64 | ❌ | null | Key (optional) | Therapists, Places | If source=`campaign` store campaign ID | Multi-channel attribution |
| `referralStatus` | Enum (`pending`,`validated`,`duplicate`,`flagged`) | - | ✅ | `pending` | Key | Therapists, Places | Status of referral validity | Fraud prevention & review workflow |

---
## 2. Recommended Performance / Analytics Attributes

| Attribute Key | Type | Size | Required | Default | Index | Applies To | Description | Purpose |
|---------------|------|------|----------|---------|-------|------------|-------------|---------|
| `firstBookingAt` | DateTime | - | ❌ | null | Key | Therapists, Places | Timestamp of first booking after signup | Activation metric & conversion timing |
| `bookingsCount` | Integer | - | ✅ | 0 | Key | Therapists, Places | Total completed bookings | Agent quality scoring & LTV |
| `membershipRenewalsCount` | Integer | - | ✅ | 0 | Key | Therapists, Places | Number of membership renewals | Recurring performance attribution |
| `lastActiveAt` | DateTime | - | ❌ | null | Key | Therapists, Places | Last time provider was active (booking or login) | Churn prediction |
| `agentAttributionLocked` | Boolean | - | ✅ | false | Key | Therapists, Places | True once referral validated (prevents code swaps) | Stabilizes commission source |

---
## 3. Derived / System-Managed (No direct user input)

| Attribute Key | Type | Required | Applies To | Derivation | Description |
|---------------|------|----------|------------|------------|-------------|
| `referralValidationNotes` | String (1000) | ❌ | Both | Manual/admin input | Notes explaining validation or flag reason |
| `referralValidatedAt` | DateTime | ❌ | Both | Set when `referralStatus`→`validated` | Proven attribution timestamp |
| `referralFlaggedAt` | DateTime | ❌ | Both | Set when `referralStatus`→`flagged` | Investigation tracking |
| `referralDuplicateOfId` | String (255) | ❌ | Both | Duplicate reference | Links to canonical provider entry |

---
## 4. Index Plan (Add Where Needed)

| Index Key | Attributes | Type | Order | Reason |
|-----------|-----------|------|-------|--------|
| `idx_agentCode` | `agentCode` | Key | ASC | Fast lookups by agent code |
| `idx_referredByAgentId` | `referredByAgentId` | Key | ASC | Agent → providers listing |
| `idx_referralAt` | `referralAt` | Key | DESC | Recent referrals reporting |
| `idx_referralSource` | `referralSource` | Key | ASC | Filter by acquisition channel |
| `idx_referralStatus` | `referralStatus` | Key | ASC | Review queue segmentation |
| `idx_firstBookingAt` | `firstBookingAt` | Key | DESC | Activation funnel timing |
| `idx_lastActiveAt` | `lastActiveAt` | Key | DESC | Dormant provider detection |

Add only required indexes initially (`agentCode`, `referredByAgentId`, `referralStatus`, `referralSource`). Expand as query patterns emerge.

---
## 5. Validation Rules
| Rule | Description |
|------|-------------|
| Agent Code Format | Regex: `^[A-Z0-9]{6,12}$` (reject lowercase; normalize to uppercase) |
| Immutable On Lock | When `agentAttributionLocked=true`, block updates to `agentCode` / `referredByAgentId` |
| Referral Timestamp | `referralAt` auto-set on first save with a valid `agentCode` |
| Status Transitions | Allowed flows: `pending→validated`, `pending→flagged`, `pending→duplicate`, `validated→flagged` (others rejected) |
| Duplicate Handling | Setting `referralStatus=duplicate` requires `referralDuplicateOfId` present |
| Campaign ID Requirement | If `referralSource=campaign`, `referralCampaignId` must be non-empty |

---
## 6. Migration Steps (Existing Documents)
1. Add attributes with defaults (Appwrite backfills automatically).
2. Backfill `referralSource='direct'` where `agentCode` empty; set `referralStatus='validated'` for legacy entries to avoid noise.
3. For documents that already have an agent code, set `referralAt` to their `createdAt`.
4. Generate index creation sequence (Console or API).

---
## 7. Sample Therapist Document (Extended)
```json
{
  "$id": "thera_673abc9100e1",
  "name": "Sari Dewi",
  "whatsappNumber": "+628123456789",
  "email": "sari@example.com",
  "pricing": "{\"60\":250,\"90\":350}",
  "status": "Available",
  "isLive": true,
  "createdAt": "2025-11-15T08:21:11.000Z",
  "agentCode": "AGT00A7",
  "referredByAgentId": "agent_673aa91000e1",
  "referralAt": "2025-11-15T08:21:11.000Z",
  "referralSource": "agent",
  "referralStatus": "validated",
  "bookingsCount": 0,
  "membershipRenewalsCount": 0,
  "agentAttributionLocked": true
}
```

---
## 8. Sample Place Document (Extended)
```json
{
  "$id": "place_673abd2200f3",
  "name": "Lotus Spa",
  "email": "lotus@example.com",
  "pricing": "{\"60\":300,\"90\":420}",
  "status": "Open",
  "createdAt": "2025-11-15T09:02:44.000Z",
  "agentCode": "AGT012B",
  "referredByAgentId": "agent_673aa91000e1",
  "referralAt": "2025-11-15T09:02:44.000Z",
  "referralSource": "agent",
  "referralStatus": "pending",
  "bookingsCount": 3,
  "membershipRenewalsCount": 0,
  "agentAttributionLocked": false
}
```

---
## 9. API Snippets
```typescript
// Capture referral on signup
await databases.createDocument(DB_ID, 'therapists_collection_id', 'unique()', {
  name, email, pricing: JSON.stringify(pricing), /* other base fields */
  agentCode: inputAgentCode || '',
  referralSource: inputAgentCode ? 'agent' : 'direct',
  referralStatus: inputAgentCode ? 'pending' : 'validated',
  referralAt: inputAgentCode ? new Date().toISOString() : null
});

// Lock attribution after validation
await databases.updateDocument(DB_ID, 'therapists_collection_id', therapistId, {
  referralStatus: 'validated',
  agentAttributionLocked: true
});

// Query all pending referrals for review
const pending = await databases.listDocuments(DB_ID, 'places_collection_id', [
  Query.equal('referralStatus', 'pending'),
  Query.limit(100),
  Query.orderDesc('referralAt')
]);
```

---
## 10. Minimal Initial Set (If You Want To Start Small)
Implement only: `agentCode`, `referralAt`, `referralSource`, `referredByAgentId`, `referralStatus`, index on `agentCode` & `referralStatus`. Add the rest incrementally.

---
*Referral extension chart complete – ready for console implementation.*
