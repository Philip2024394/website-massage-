# ELITE AUTO POST SYSTEM — Specification (3–5 Posts Daily)

**Platform:** IndaStreet Global Social Feed  
**Document type:** Autonomous content engine specification  
**Goal:** Generate high-quality, SEO-optimized, human-looking posts automatically at staggered times that rank in Google, look authentic, build authority, attract local traffic, and avoid spam signals.

---

## §1. Core Objective

The system must automatically produce posts that:

| Goal | Requirement |
|------|-------------|
| **Rank in Google** | SEO structure, keywords, schema, crawlable post pages (see [POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md](./POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md)). |
| **Look authentic** | Variable sentence length, tone, vocabulary, no robotic repetition (§12). |
| **Build authority** | Educational + tip + mini-guide rotation; weekly long-form (§11). |
| **Attract local traffic** | Location keywords, local provider references, city/service combos (§4–§5). |
| **Avoid spam signals** | Quality filter (§8), no over-optimization, realism engine (§12). |

---

## §2. Daily Posting Engine — Scheduler

**Runs every day.**

- **Volume:** 3–5 posts per day (configurable).
- **Spacing:** Posts spaced **2–4 hours** apart.
- **Times:** **Vary daily** (critical for realism — no fixed 9:00, 12:00, etc.).

**Example schedule (one day):**

| Slot | Time |
|------|------|
| 1 | 9:15 AM |
| 2 | 12:40 PM |
| 3 | 3:10 PM |
| 4 | 7:20 PM |
| 5 | 10:05 PM |

**Logic:**

```
select randomPostTimes(count: 3–5, minGapMinutes: 120, maxGapMinutes: 240)
publish at those times (timezone = target country or config)
```

Store next run times in DB or config; recalc each night for next day.

---

## §3. Content Rotation System

Each post must be a **different type** from the previous. Never repeat the same type twice in a row.

**Rotation pool:**

| Type | Purpose |
|------|---------|
| **Tip** | SEO + saves |
| **Educational** | Authority |
| **Local post** | Local ranking |
| **Question** | Engagement |
| **Myth buster** | Shares |
| **Mini guide** | Long dwell time |
| **Feature provider** | Conversions |

**Rule:** `currentPostType != previousPostType`. Cycle or random-select from pool excluding previous type.

**Recommended starting mix (§ below):** 70% educational, 20% local, 10% promotional (tip/feature).

---

## §4. SEO Content Generator Formula

Every post must include:

| Element | Requirement |
|--------|-------------|
| **Hook line** | First line; primary keyword included; grabs attention. |
| **Helpful content** | 2–4 sentences of value (benefits, how-to, insight). |
| **Local relevance** | City/region or “near you” reference. |
| **Call to action** | Soft CTA (e.g. explore providers, book, learn more). |

**Example format:**

> *[Hook]* Deep tissue massage in Jakarta can relieve chronic muscle tension faster than stretching alone.  
>  
> *[Helpful]* Many clients don’t realize pressure therapy improves circulation and posture. Regular sessions can also reduce stress hormone levels.  
>  
> *[CTA]* Looking for trusted therapists in Jakarta? Explore local providers today.

---

## §5. Keyword Engine (Ranking Driver)

Each post must target a defined keyword set:

| Slot | Count | Example |
|------|-------|--------|
| **Primary keyword** | 1 | home massage |
| **Semantic keywords** | 2 | mobile therapist, at-home massage service |
| **Location keyword** | 1 | Bali |

**Logic:** Topic generator (§10) picks theme; keyword engine fills primary (from service/category), semantic (from synonym/related pool), location (from city/region pool). Use naturally in hook + body; respect density limit (§8).

---

## §6. Image Generator Logic

**Selection priority:**

1. **If** local provider image exists (for feature/local posts) → use it (with rights).
2. **Else if** category = educational / guide → generate AI image (real-looking only).
3. **Else** → pull from licensed stock library.

**Image rules:**

- Real-looking only (no cartoon/illustration).
- No text overlay on image.
- Warm lighting; human subjects preferred.
- Alt text set from post context (§7); no generic “image”.

---

## §7. Google Ranking Optimization Layer

Each auto-post page must auto-create (aligned with [POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md](./POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md)):

| Element | Implementation |
|--------|-----------------|
| **Title tag** | From hook or topic + location + brand; ~60 chars. |
| **Meta description** | From first 150–160 chars of helpful content or summary. |
| **Canonical URL** | `https://indastreetmassage.com/post/{slug}`. |
| **Structured data** | JSON-LD in initial HTML. |
| **Alt text** | Per image; descriptive, from post context. |

**Schema types:**

- **SocialMediaPosting** (primary for feed posts).
- **Article** (for mini-guides / weekly long-form).
- **LocalBusiness** reference when post features or links to a place/therapist.

---

## §8. Anti-Spam Quality Filter

**Post rejected if any:**

| Condition | Threshold |
|----------|-----------|
| Length | &lt; 80 words |
| Duplicate similarity | &gt; 70% (vs recent posts in DB) |
| Keyword density | &gt; 3% (primary keyword) |
| AI detection probability | Above configured threshold (if using detector) |

**Flow:** Before publish, run filter; if reject → discard or send to review queue; do not schedule. Log reason for tuning.

---

## §9. Freshness Boost Logic

New posts receive a **temporary ranking boost** inside the feed (no fake engagement).

| Window | Boost |
|--------|-------|
| First 2 hours | +20% visibility (e.g. multiply rankScore by 1.2) |
| Next 4 hours | +10% visibility (e.g. 1.1) |
| After 6 hours | Normal |

Implement in ranking layer (see [FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md](./FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md)); use `createdAt` to apply time-window multiplier.

---

## §10. Content Source Generator

Posts pull topics from **rotating pools**:

- **Services** (e.g. Swedish, deep tissue, aromatherapy, facial).
- **Cities** (e.g. Jakarta, Bali, Surabaya, Yogyakarta).
- **Benefits** (e.g. stress relief, posture, circulation).
- **Seasonal trends** (e.g. back-to-office, holiday stress).
- **Client questions** (FAQ-style).
- **Industry tips** (technique, aftercare).

**Topic generator example:**

```
topic = random(cities) + random(services) + random(angle)
```

**Example output:** *“Benefits of Swedish massage for office workers in Surabaya”*.

Vary angle: benefits, myths, how-to, when-to, who-should.

**Indonesia SEO dataset (ready to plug in):** Use **`src/data/indonesiaSeoDataset.ts`** for geo keywords and content pool:

- **Geo:** `SEO_CITIES_TIER_1` … `SEO_CITIES_TIER_4` (Tier 1 = highest search volume: Jakarta, Surabaya, Bandung, Medan, Bekasi, etc.).
- **Topics:** `SEO_TOPICS_BY_CATEGORY` (massage, beautyFacial, spa, homeService, authority, engagement, conversion, trending) — 100 topics total.
- **Formula:** Topic + City + Service = Post, e.g. *“Benefits of deep tissue massage in Bandung”*. See [INDONESIA-SEO-DATASET.md](./INDONESIA-SEO-DATASET.md).

---

## §11. Weekly Authority Booster

**Once per week** auto-post one of:

- **Expert article** (longer, cited, authority tone).
- **Long-form guide** (step-by-step or “ultimate” style).
- **Comparison post** (e.g. “Deep tissue vs Swedish: when to choose which”).

These rank fastest on Google when paired with crawlable post pages and schema.

**Scheduling:** Reserve one slot per week (e.g. Wednesday 10:00) for authority content; rotate type weekly.

---

## §12. Realism Engine (Critical)

System must **vary** to avoid algorithm flags:

| Dimension | Implementation |
|-----------|----------------|
| Sentence length | Mix short and long; avoid fixed pattern. |
| Tone | Sometimes casual, sometimes professional; vary by type. |
| Vocabulary | Synonym rotation; avoid same phrases. |
| Emoji usage | Optional; if used, sparse and varied. |
| Punctuation style | Vary use of periods, commas, questions. |

**Without variation → automation is detectable.** Use templates with multiple variants and random selection; optionally pass through a light “humanizer” step (sentence shuffle, synonym swap).

---

## §13. Monthly Batch System (Cost-Free Mode)

**Recommended setup:**

1. **Generate ~120 posts once** (e.g. 4/day × 30 days).
2. **Store in DB** with status `scheduled` and `publishAt` set.
3. **Daily job** only selects and publishes posts where `publishAt <= now` and status = scheduled.
4. **Regenerate batch monthly** (new topics, new keywords, new dates).

**Benefit:** No per-post API cost at publish time; generation cost is one batch per month. Cost = zero ongoing for generation if using own models/templates.

---

## §14. Performance Feedback Loop

**Every week** the system analyzes:

- Most viewed posts (by impression or view event).
- Longest read time (dwell or scroll depth).
- Highest clicks (CTA, link to provider, etc.).

**Action:** Increase weight of similar topics/angles in the next topic and keyword selection. E.g. if “Bali” + “stress relief” performs best, bias the pool toward that combo.

**Result:** Self-optimizing growth toward content that resonates.

---

## Architecture Flow (Full Pipeline)

```
Topic Engine
    → Keyword Generator (primary + semantic + location)
    → Content Writer (formula: hook, helpful, local, CTA)
    → Quality Filter (length, duplicate, density, AI)
    → Image Selector (provider / AI / stock)
    → SEO Builder (title, meta, canonical, schema, alt)
    → Scheduler (random times, 2–4h apart)
    → Publisher (create post + optional post page)
    → Performance Analyzer (views, dwell, clicks)
    → Optimization Feedback (bias topic/keyword pool)
```

This forms a **closed-loop autonomous content growth engine**.

---

## Recommended Starting Settings

| Setting | Value | Rationale |
|--------|-------|------------|
| **Posts per day** | 4 | Balance volume vs quality and realism. |
| **Educational** | 70% | Ranks fastest for service marketplaces. |
| **Local** | 20% | Geo relevance and local traffic. |
| **Promotional (tip / feature)** | 10% | Conversions without overwhelming. |

Adjust after reviewing performance feedback (§14).

---

## Pro Growth Upgrade (After Traffic Grows)

**User content boost system:** Prioritize **real user posts** over auto-posts in feed ranking (e.g. separate bucket or boost multiplier for `authorType === 'user'`). Auto-posts fill gaps and keep feed fresh; user content drives community and retention. This is how platforms scale naturally while keeping the auto system for baseline authority and SEO.

---

**→ For the 3 remaining components to build (Scheduler, Content Generator, Publisher) and minimal pseudocode, see [AUTO-POST-REMAINING-BUILD-SPEC.md](./AUTO-POST-REMAINING-BUILD-SPEC.md).**

---

## Checklist (Implementation)

- [ ] Scheduler: random 3–5 times/day, 2–4h apart, timezone-aware.
- [ ] Rotation: 7 types; never same type twice in a row; 70/20/10 mix.
- [ ] SEO formula: hook, helpful, local, CTA; keyword set per post.
- [ ] Keyword engine: 1 primary, 2 semantic, 1 location per post.
- [ ] Image logic: provider → AI → stock; real-looking, no overlay.
- [ ] SEO layer: title, meta, canonical, schema (SocialMediaPosting, Article, LocalBusiness), alt.
- [ ] Quality filter: reject if &lt;80 words, &gt;70% duplicate, &gt;3% keyword density, high AI score.
- [ ] Freshness boost: +20% first 2h, +10% next 4h.
- [ ] Topic generator: pools (services, cities, benefits, seasonal, Q&A, tips); random combo.
- [ ] Weekly authority: one long-form/expert/comparison per week.
- [ ] Realism: vary sentence length, tone, vocabulary, punctuation.
- [ ] Monthly batch: generate ~120, store, schedule daily release; regenerate monthly.
- [ ] Feedback loop: weekly analysis; bias topic/keyword pool by performance.
- [ ] Later: user content boost over auto-posts in ranking.

---

**Related docs:**

- [POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md](./POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md) — Post pages must be crawlable and have meta/schema.
- [GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md](./GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md) — Feed and post data model (add `slug`, `authorType` if needed).
- [FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md](./FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md) — Freshness and ranking.

*End of spec.*
