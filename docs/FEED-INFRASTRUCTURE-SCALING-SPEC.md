# FEED INFRASTRUCTURE SCALING SPEC

**Platform:** IndaStreet Global Social Feed  
**Document type:** Distributed systems architecture specification  
**Goal:** Design infrastructure capable of scaling from thousands → millions of concurrent users with low latency and high reliability.

---

## 1. ARCHITECTURE PRINCIPLES

The system must be:

| Principle | Description |
|-----------|-------------|
| **Horizontally scalable** | Add nodes to handle load; no single bottleneck. |
| **Stateless at API layer** | Any API instance can serve any request; session in token/cookie or DB. |
| **Region-aware** | Route and replicate by region; minimize cross-region latency. |
| **Cache-first** | Serve from cache when possible; reduce DB and compute load. |
| **Event-driven** | Async processing via events/queues; decouple write path from read path. |
| **Fault tolerant** | Failover, fallbacks, and graceful degradation. |
| **Queue buffered** | Writes and heavy work go through queues; absorb spikes. |
| **Read-optimized** | Feed reads from replicas/cache; writes to primary then propagate. |

---

## 2. HIGH-LEVEL SYSTEM FLOW

```
Client Request
       ↓
CDN Edge
       ↓
Load Balancer
       ↓
Feed API Layer (stateless instances)
       ↓
Feed Service Layer
       ↓
Cache Layer  ─── if hit → return
       ↓ (miss)
Ranking Engine
       ↓
Database Cluster
       ↓
Return Feed
```

---

## 3. SHARDING STRATEGY

### 3.1 Post storage sharding

Shard posts by:

```
shardKey = hash(postId)
```

**Reason:** Uniform distribution; prevents hot partitions.

---

### 3.2 Country index sharding

Separate index for country-scoped queries:

```
countryShard = countryCode
```

**Enables:** Fast country feed queries; efficient geo filtering.

---

### 3.3 User graph sharding

User relationships (followers, etc.) stored by:

```
userShard = hash(userId)
```

**Prevents:** Follower lookup bottlenecks; profile hot spots.

---

### 3.4 Trending data shard

Trend calculations sharded by:

```
trendShard = country + category
```

---

## 4. CACHE LAYER ARCHITECTURE

Multi-tier caching is required.

### 4.1 Edge cache (CDN)

**Caches:** Feed responses, media, translated post content.

**Cache key:**

```
feed:{country}:{language}:{cursor}:{muteHash}
```

**TTL:** 15–60 seconds.

---

### 4.2 Distributed memory cache (Redis / memory grid)

**Stores:**

| Data | TTL | Notes |
|------|-----|-------|
| Ranked feed batches | 30s | Per country/lang/mute combo. |
| Author score | 5m | Precomputed; see ranking spec. |
| Engagement counters | Realtime | Or short TTL; invalidate on write. |
| Translation results | 7 days | In `translationVersions` or cache. |

---

### 4.3 Local instance cache

Short-lived **LRU cache** on each API/worker instance.

**Purpose:** Reduce repeated computation during traffic spikes.

**TTL:** ~5 seconds.

---

## 5. QUEUE SYSTEM ARCHITECTURE

Use message queues for asynchronous processing.

### 5.1 Event bus topics

```
post_created
post_updated
like_added
comment_added
share_added
report_flagged
translation_requested
```

---

### 5.2 Worker types

| Worker type | Responsibility |
|-------------|----------------|
| **Ranking workers** | Recompute scores; update cache. |
| **Translation workers** | Generate translations; store results (e.g. pre-gen top N languages). |
| **Moderation workers** | Spam detection; policy validation. |
| **Trend workers** | Calculate velocity; update trending lists per country/category. |

---

### 5.3 Queue priority levels

| Priority | Task examples |
|----------|----------------|
| High | Likes, comments (affect ranking quickly). |
| Medium | New posts (feed inclusion, precompute). |
| Low | Analytics, batch jobs. |

---

## 6. LOAD DISTRIBUTION

### 6.1 Global traffic routing

Use **geo-DNS** (or global load balancer) so:

```
User → nearest region server
```

**Reduces:** Latency; cross-region calls.

---

### 6.2 Regional clusters

Each region runs:

- API nodes
- Cache nodes
- Worker nodes
- Database replica(s)

Regions sync **asynchronously** (eventual consistency).

---

### 6.3 Read vs write separation

| Path | Target |
|------|--------|
| **Writes** | Primary DB. |
| **Reads** | Replicas (and cache). |

Feed reads must **never** hit the primary DB for normal serving.

---

### 6.4 Hot post protection

When a post goes viral:

- Move to a dedicated cache bucket (or hot key).
- Serve from cache only for that post/slate.
- Optionally temporarily throttle or batch score recomputation to avoid thundering herd.

---

## 7. DATABASE ARCHITECTURE

### 7.1 Storage model

Use a **hybrid** database approach:

| Data | Storage type | Rationale |
|------|--------------|-----------|
| Posts | Distributed SQL | Consistency, queries, sharding by postId/country. |
| Engagement counters | NoSQL / KV | High write throughput; increment ops. |
| Relationships | Graph DB (or relational) | Follow graph, social queries. |
| Search / discovery | Index engine (e.g. Elasticsearch) | Full-text, filters, aggregations. |

---

### 7.2 Replication strategy

```
Primary → regional replicas → edge replicas (if used)
```

**Consistency model:** **Eventual consistency** for feed reads.

**Reason:** Feed systems prioritize speed and availability over strict consistency; short staleness is acceptable.

---

## 8. FAILOVER DESIGN

### Automatic failover rules

| Failure | Action |
|---------|--------|
| **Region fails** | Traffic routed to nearest healthy region. |
| **Cache fails** | Fallback to database read (degraded latency). |
| **Worker fails** | Job requeued; another worker picks up. |
| **DB primary fails** | Promote replica to primary (automated or manual runbook). |

---

## 9. RATE LIMITING

Protect the system from abuse.

**Suggested limits (tunable):**

| Resource | Limit | Algorithm |
|----------|-------|-----------|
| Feed requests per user | 60/min | Token bucket. |
| Post creation | 20/hour | Token bucket. |
| Likes | 300/hour | Token bucket. |

Use **token bucket** (or sliding window) per user/IP; return 429 when exceeded.

---

## 10. PRECOMPUTATION LAYER

Certain scores must be computed **before** requests to keep latency low.

**Precompute:**

- `engagementScore`
- `authorScore`
- `trendScore` (or trending list)

**Schedule:** Every **30 seconds** (or on event for critical paths). See [FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md](./FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md) §14.

---

## 11. FEED DELIVERY MODES

The system must support multiple modes over the same infrastructure:

| Mode | Description |
|------|-------------|
| **Standard** | Ranked feed (90/10 or 50/50 by country; see main spec). |
| **Discovery** | More global / exploratory (e.g. 50/50 mix). |
| **Following** | Follower-only feed. |
| **Trending** | Velocity-based; per country/category. |

Each mode uses the same pipeline and cache shape but **different weight config** (and possibly different filters).

---

## 12. MONITORING & ALERTING

**Track metrics:**

- p95 latency (feed API, ranking, DB read)
- Cache hit rate (edge + Redis)
- Queue delay (per topic/worker)
- Ranking compute time
- DB read time

**Alert thresholds (example):**

| Metric | Alert if |
|--------|----------|
| Feed p95 latency | > 300 ms |
| Cache hit rate | < 80% |
| Queue delay | > 2 s |

---

## 13. SECURITY HARDENING

Must include:

- **Signed request tokens** — Prevent tampering and replay.
- **Bot detection** — Rate limits, behavior signals, challenge when needed.
- **Anomaly scoring** — Unusual request patterns; flag or throttle.
- **IP reputation filtering** — Block or throttle bad IPs.
- **Request fingerprinting** — Detect abuse and multi-accounting.

---

## 14. CAPACITY PLANNING MODEL

**Scaling formula (conceptual):**

```
serversNeeded =
  (activeUsers × requestsPerSecond × computeCostPerRequest)
  ÷ serverCapacity
```

**Provisioning rule:** Always provision **+30% headroom** for spikes and growth.

---

## 15. FINAL ENGINEERING STANDARD

The infrastructure must guarantee:

| Requirement | Target / behavior |
|-------------|--------------------|
| **Latency** | Sub-200 ms feed load (p95). |
| **Availability** | No single point of failure; failover automated. |
| **Scaling** | Instant horizontal scaling (add API/cache/worker nodes). |
| **Regions** | Region independence; cross-region failover. |
| **Degradation** | Graceful degradation under load (e.g. fallback to DB if cache down). |

---

## FINAL SUMMARY

This infrastructure design ensures:

- **Real-time feeds** — Cache-first, precomputed scores, event-driven updates.
- **Global scaling** — Sharding, regional clusters, geo routing.
- **High reliability** — Failover, queues, read/write separation.
- **Cost efficiency** — Cache reduces DB/compute; right storage per data type.
- **Future AI integration readiness** — Event bus and workers support ranking/personalization pipelines.

---

**Related docs:**

- [GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md](./GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md) — Feed product and ranking overview; edge cache key.
- [FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md](./FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md) — Ranking formula, pipeline, precompute, cache.

*End of spec.*
