# Appwrite Collection Schema: `monthly_agent_metrics_collection_id`

Tracks per-agent monthly performance snapshots used for commission tier decisions and historical analytics.

---
## Collection Details
- **Database ID:** `68f76ee1000e64ca8d05`
- **Collection ID:** `monthly_agent_metrics_collection_id` (assign real ID after creation)
- **Name:** Monthly Agent Metrics
- **Primary Key Strategy:** Appwrite `$id` (use `unique()`); enforce uniqueness on (`agentId`, `month`) via index

---
## Attributes

| # | Attribute Key | Type | Size | Required | Default | Description |
|---|---------------|------|------|----------|---------|-------------|
| 1 | `agentId` | String | 255 | ✅ Yes | - | Agent document ID |
| 2 | `agentCode` | String | 50 | ✅ Yes | - | Immutable referral code (copy for reporting) |
| 3 | `month` | String | 7 | ✅ Yes | - | Format `YYYY-MM` |
| 4 | `newSignUpsCount` | Integer | - | ✅ Yes | 0 | New sign‑ups attributed in month |
| 5 | `recurringSignUpsCount` | Integer | - | ✅ Yes | 0 | Renewals attributed in month |
| 6 | `targetMet` | Boolean | - | ✅ Yes | false | True if monthly target achieved (>=20 new) |
| 7 | `streakCount` | Integer | - | ✅ Yes | 0 | Consecutive target months including this one |
| 8 | `commissionRateApplied` | Float | - | ✅ Yes | 20 | Effective new sign‑up commission rate used this month |
| 9 | `calculatedAt` | DateTime | - | ✅ Yes | - | Snapshot generation timestamp |

---
## Indexes

| Index Key | Type | Attributes | Order | Purpose |
|-----------|------|-----------|-------|---------|
| `idx_agent_month` | Key | `agentId`, `month` | ASC, ASC | Uniqueness + direct lookup |
| `idx_month` | Key | `month` | DESC | Latest month queries |
| `idx_targetMet` | Key | `targetMet` | ASC | Filter by performance |

---
## Creation Steps (Console)
1. Create collection `monthly_agent_metrics_collection_id`.
2. Add attributes in exact order above (primitives first, DateTime last).
3. Create indexes (agent+month, month, targetMet).
4. Set permissions:
   - Read: `role:admin`
   - Create: server function only (or `role:admin`)
   - Update/Delete: `role:admin`

For development you may temporarily allow read for `role:all` to test dashboard rendering.

---
## Aggregation Job Outline
Monthly cron function pseudocode:
```typescript
async function aggregateMonthlyMetrics(month: string) {
  const agents = await databases.listDocuments(DB_ID, 'agents_collection_id', [Query.limit(2000)]);
  for (const agent of agents.documents) {
    const newCount = agent.newSignUpsThisMonth || 0;
    const recurringCount = agent.recurringSignUpsThisMonth || 0;
    const targetMet = newCount >= 20;
    const previousMetrics = await databases.listDocuments(DB_ID, 'monthly_agent_metrics_collection_id', [
      Query.equal('agentId', agent.$id),
      Query.orderDesc('month'),
      Query.limit(1)
    ]);
    let streakCount = targetMet ? 1 : 0;
    if (previousMetrics.documents.length) {
      const prev = previousMetrics.documents[0];
      if (targetMet) streakCount = prev.targetMet ? prev.streakCount + 1 : 1;
      else streakCount = 0;
    }
    const commissionRateApplied = agent.commissionTier === 'base23' ? 23 : 20;
    await databases.createDocument(DB_ID, 'monthly_agent_metrics_collection_id', 'unique()', {
      agentId: agent.$id,
      agentCode: agent.code,
      month,
      newSignUpsCount: newCount,
      recurringSignUpsCount: recurringCount,
      targetMet,
      streakCount,
      commissionRateApplied,
      calculatedAt: new Date().toISOString()
    });
    // Reset live counters on agent document
    await databases.updateDocument(DB_ID, 'agents_collection_id', agent.$id, {
      newSignUpsThisMonth: 0,
      recurringSignUpsThisMonth: 0,
      streakMonths: streakCount
    });
    // Tier upgrade/downgrade logic
    if (streakCount >= 3 && agent.commissionTier !== 'base23') {
      await databases.updateDocument(DB_ID, 'agents_collection_id', agent.$id, { commissionTier: 'base23' });
    } else if (!targetMet) {
      // Optional downgrade rule: two misses in a row
      if (previousMetrics.documents.length) {
        const prev = previousMetrics.documents[0];
        if (!prev.targetMet && agent.commissionTier === 'base23') {
          await databases.updateDocument(DB_ID, 'agents_collection_id', agent.$id, { commissionTier: 'base20' });
        }
      }
    }
  }
}
```

---
## Sample Document
```json
{
  "$id": "metrics_673aac910001",
  "agentId": "agent_673aa91000e1",
  "agentCode": "AGT00A7",
  "month": "2025-11",
  "newSignUpsCount": 24,
  "recurringSignUpsCount": 7,
  "targetMet": true,
  "streakCount": 2,
  "commissionRateApplied": 20,
  "calculatedAt": "2025-11-30T23:59:59.000Z"
}
```

---
## Dashboard Usage
- Show progress: `newSignUpsCount / 20` target bar.
- Use last 3 documents to visualize streak trend.
- Use `commissionRateApplied` for historical commission reproduction.

---
## Future Extensions
| Attribute | Purpose |
|-----------|---------|
| `renewalConversionRate` | Recurring / previous month new sign‑ups |
| `averageVisitToSignupDays` | Performance quality metric |
| `downgraded` | Flag if downgraded this month |

---
*Schema ready for implementation.*
