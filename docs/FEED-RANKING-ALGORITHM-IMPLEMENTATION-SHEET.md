# FEED RANKING ALGORITHM — ENGINEER IMPLEMENTATION SHEET

**Platform:** IndaStreet Global Social Feed  
**Purpose:** Deterministic, scalable ranking system for country-adaptive social feed.

---

## 1. CORE RANK SCORE FORMULA

Final ranking score used for feed sorting:

```
rankScore =
  (geoWeight × geoScore)
  + (engagementWeight × engagementScore)
  + (recencyWeight × freshnessScore)
  + (relevanceWeight × relevanceScore)
  + (authorityWeight × authorScore)
  + (qualityWeight × contentQualityScore)
  + (diversityWeight × diversityScore)
```

**Recommended default weights:**

| Weight | Value | Description |
|--------|-------|-------------|
| `geoWeight` | 0.30 | Country/local priority |
| `engagementWeight` | 0.20 | Likes, comments, shares, saves |
| `recencyWeight` | 0.15 | Freshness decay |
| `relevanceWeight` | 0.15 | Tag/category/language match |
| `authorityWeight` | 0.10 | Author credibility |
| `qualityWeight` | 0.05 | Content quality signals |
| `diversityWeight` | 0.05 | Anti-repetition |

Weights must be **configurable in admin panel**.

---

## 2. GEO SCORE (Country Priority Logic)

```
if post.originCountry == user.selectedCountry:
    geoScore = 1
else:
    geoScore = 0.3
```

**Optional distance-based logic:**

```
geoScore = 1 / (1 + distance(userCountry, postCountry))
```

---

## 3. ENGAGEMENT SCORE

```
engagementScore_raw =
  (likeCount × 1)
  + (commentCount × 2)
  + (shareCount × 3)
  + (saveCount × 4)

engagementScore = log(1 + engagementScore_raw)
```

*Reason:* Prevents viral posts from dominating forever.

---

## 4. FRESHNESS SCORE

```
ageHours = (currentTime - post.createdAt) / 3600000

freshnessScore = 1 / (1 + ageHours^0.5)
```

**Alternative decay model:**

```
freshnessScore = e^(-decayRate × ageHours)
decayRate = 0.05  // recommended
```

---

## 5. RELEVANCE SCORE

Calculated from keyword + interest match.

```
relevanceScore =
  tagMatchScore
  + categoryMatchScore
  + languageMatchScore
  + searchHistoryMatch
```

Each subscore in range `[0, 1]`. Final:

```
relevanceScore = average(all subscores)
```

---

## 6. AUTHOR AUTHORITY SCORE

```
authorScore_raw =
  followerScore
  + verificationScore
  + consistencyScore
  + reportPenalty
```

**Components:**

| Component | Formula |
|-----------|---------|
| `followerScore` | `log(1 + followers) / 10` |
| `verificationScore` | `1` if verified else `0.2` |
| `consistencyScore` | `postsLast30Days / 30` |
| `reportPenalty` | `-0.5` if flagged frequently |

```
authorScore = clamp(authorScore_raw, 0, 1)
```

---

## 7. CONTENT QUALITY SCORE

```
contentQualityScore =
  textLengthScore
  + mediaPresenceScore
  + originalityScore
  + readabilityScore
```

**Examples:**

| Signal | Formula |
|--------|---------|
| `textLengthScore` | `min(wordCount / 300, 1)` |
| `mediaPresenceScore` | `1` if image/video else `0.3` |
| `originalityScore` | plagiarism-check result (0–1) |
| `readabilityScore` | grammar/readability score (0–1) |

---

## 8. DIVERSITY SCORE (Anti-Repetition Logic)

Prevents same author or topic dominating feed.

```
recentAppearancePenalty = postsFromSameAuthorInLast20 × 0.1

diversityScore = 1 − recentAppearancePenalty

diversityScore = clamp(diversityScore, 0, 1)
```

---

## 9. FEED MIX ENFORCEMENT RULE (Country Balance)

After scoring, enforce composition:

- **Local posts:** top 90% of slots (by rankScore)
- **International posts:** top 10% of slots

**Interleave pattern (example):**

```
L L L L L L L L I L  (repeat)
```

Where `L` = local, `I` = international.

*When global discovery mode is on:* use 50% local / 50% international and same interleave logic.

---

## 10. MUTED COUNTRY FILTER

Before ranking:

```
if post.originCountry in user.mutedCountries:
    exclude post
```

---

## 11. TRANSLATION PRIORITY BOOST

Posts already translated into user language get a small boost:

```
if post.translationVersions[user.preferredLanguage] exists and not stale:
    rankScore += 0.05
```

*Reason:* Improves UX and load speed.

---

## 12. TRENDING BOOST

Posts with rapid engagement growth:

```
velocity = engagementLast10Min − engagementPrevious10Min

trendBoost = log(1 + velocity) × 0.1
rankScore += trendBoost
```

---

## 13. FINAL SORT LOGIC

```
posts.sort(descending by rankScore)
```

**Pagination (cursor):**

```
cursor = encode(lastPost.rankScore, lastPost.id)
```

Decode on next request to fetch posts with `rankScore < cursor.rankScore` or equivalent.

---

## 14. PERFORMANCE RULES

The engine must:

| Rule | Implementation |
|------|----------------|
| Compute scores server-side | No client-side ranking; API returns pre-sorted list. |
| Cache ranked batches | Edge cache by `country + lang + mutedCountriesHash` (see main spec). |
| Precompute | `engagementScore`, `authorScore` (and optionally `contentQualityScore`) stored or updated on write/engagement. |
| Lazy compute | `relevanceScore` at read time (user/session-dependent). |
| Dynamic | `freshnessScore` (and optionally `diversityScore`) recomputed at request time. |

---

## 15. REAL-TIME UPDATE TRIGGERS

Recalculate or invalidate score/cache when:

- New like / comment / share / save
- Post edit
- User country change
- User mute list change

---

## 16. SAFETY LIMITERS

Hard caps (configurable):

| Limiter | Value | Description |
|---------|-------|-------------|
| `maxPostsPerAuthorPerFeed` | 3 | Max posts from same author in one feed page. |
| `maxPostsPerCountryForeign` | 10% | Max share of international slot from a single foreign country. |
| `maxRepeatedTagPosts` | 5 | Max consecutive posts sharing same tag/topic. |

Apply after scoring, before interleave (e.g. cap author count, then fill remaining with next-best; cap per-country in international pool).

---

## 17. Recommended Final Additions (High-Impact Upgrades)

*Advanced optimizations that push the system from excellent → elite platform grade. Optional / post-MVP.*

### 17.1 Weight auto-learning layer (optional AI)

**Current:** Weights are manual (e.g. `geoWeight = 0.30`, `engagementWeight = 0.20`).

**Upgrade:** Optional adaptive system:

```
effectiveWeight = baseWeight × performanceMultiplier
```

**Performance signals (per country or globally):**

- Scroll depth
- Dwell time
- Hide rate
- Like rate

Use to tune weights over time so the algorithm self-optimizes per country. Store multipliers in config; recompute periodically (e.g. daily).

---

### 17.2 Cold-start boost logic

New posts need temporary visibility or new creators never get exposure.

```
if postAgeMinutes < 30:
    rankScore += 0.15
```

Apply in **Adjustments** stage (see Section 18). Tune threshold and boost via admin.

---

### 17.3 Anti-viral lock system

Prevents one post dominating the feed for too long.

```
if post.impressions > viralThreshold:
    rankScore *= decayMultiplier   // e.g. 0.7 or decay with overshoot
```

Keeps feed fresh. `viralThreshold` and `decayMultiplier` configurable.

---

### 17.4 Personalization layer (future-ready)

Optional user-preference multiplier:

```
rankScore += interestMatchScore × 0.1
```

**Sources for `interestMatchScore` (0–1):**

- Categories viewed
- Posts liked
- Services booked

Creates stickier, personalized feeds. Can be lazy-computed at read time.

---

### 17.5 Session diversity controller

Prevent monotony within one scroll session:

```
if last3PostsSameCategory:
    suppress or down-rank next similar post (same category/tag)
```

Improves perceived content quality. Implement in **Mixing** or **Sort** stage using session/slate state.

---

### 17.6 Quality gate before ranking

Before scoring, filter out low-quality posts to protect feed integrity.

**Reject post if any:**

| Condition | Example threshold |
|-----------|--------------------|
| `wordCount < minWords` | e.g. 5 |
| `spamScore > spamThreshold` | From spam detector |
| `duplicateScore > duplicateThreshold` | Near-duplicate of existing post |

Run in **Filter** stage (Section 18); no score computed for rejected posts.

---

### 17.7 Shadow score (anti-spam protection)

Maintain a **hidden** trust score (never shown to users):

```
shadowScore = trustRank × behaviorScore × reportHistoryFactor

rankScore *= shadowScore
```

- `trustRank`: historical account trust (new vs aged, verification, etc.).
- `behaviorScore`: inauthentic behavior signals.
- `reportHistoryFactor`: penalty for repeated reports.

Multiply final `rankScore` before sort. Users never see `shadowScore`; use for ranking only.

---

### 17.8 Regional trend injection

Small boost for posts trending in **nearby** countries (e.g. same region):

```
if post is trending in a nearby country (e.g. same region):
    rankScore += 0.05
```

Improves discovery while keeping local relevance. Requires regional trend data (see main spec Section 11.4).

---

## 18. Ranking Pipeline (Recommended Implementation Flow)

Execute stages in this order to avoid wasted compute and keep behavior clear:

| Stage | What runs |
|-------|------------|
| **1. Filter** | Safety filters, muted countries, spam/quality gate (Section 17.6). Exclude posts that must not appear. |
| **2. Precompute** | Load or compute `engagementScore`, `authorScore` (and optionally `contentQualityScore`). |
| **3. Score** | Full formula (Section 1): geo, engagement, freshness, relevance, authority, quality, diversity. |
| **4. Adjustments** | Boosts and penalties: translation boost (§11), trending boost (§12), cold-start (§17.2), anti-viral (§17.3), personalization (§17.4), regional trend (§17.8), shadow score (§17.7). |
| **5. Mixing** | Enforce 90/10 (or 50/50) local/international; apply session diversity (§17.5) and safety limiters (§16). |
| **6. Sort** | `rankScore` DESC. |
| **7. Delivery** | Cursor pagination; optional edge cache; return ordered list. |

This sequence prevents scoring posts that are later filtered and keeps the pipeline explainable and cache-friendly.

---

## 19. Engineering Grade Assessment

**Current spec (Sections 1–16):** Already **production-deployable** with **high-scale readiness**.

**With Section 17 (Recommended Final Additions) and Section 18 (Pipeline):** The system becomes an **enterprise-grade intelligent feed engine** — equivalent in architecture class to platforms that support **millions of users**.

---

## FINAL ENGINEERING PRINCIPLE

This ranking system must be:

- **Deterministic** — Same inputs → same order (no random shuffle in production).
- **Tunable** — Weights and limiters configurable via admin.
- **Explainable** — Log or expose score components for debugging and trust.
- **Cache-friendly** — Cache key includes all ranking inputs (country, lang, muted, feedMix).
- **Horizontally scalable** — Stateless scoring; cache and DB scale independently.

---

**Related docs:**  
- [GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md](./GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md) (Sections 3, 11.1, 11.4, 12).  
- [FEED-INFRASTRUCTURE-SCALING-SPEC.md](./FEED-INFRASTRUCTURE-SCALING-SPEC.md) (cache tiers, precompute schedule, queues, failover).

*End of spec.*
