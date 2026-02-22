# IndaStreet — Global Social Feed Localization & Country Logic Specification

**Document type:** Technical specification (production-ready)  
**Scope:** Global social feed — one unified network, country-adaptive UI and filtering  
**Platform:** IndaStreet (wellness / beauty)

---

## 1. Global Platform Rule

| Rule | Description |
|------|-------------|
| **Single database** | There is exactly one unified social network database worldwide. No per-country databases or separate “IndaStreet Indonesia” vs “IndaStreet UK” backends. |
| **Filtering only** | All posts exist in one system. Country-specific views are achieved by filtering and ranking at read time, not by data isolation. |
| **Scalability** | Design must support adding new countries without schema or topology changes: add country to config, add locale, deploy. |

---

## 2. Data Architecture — Post & User Fields

### 2.1 Post document/table (required fields for global feed)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | Unique post ID (e.g. UUID or `post_{timestamp}_{uuid}`). |
| `authorId` | string | Yes | References user/profile. |
| `originCountry` | string (ISO 3166-1 alpha-2) | Yes | Country where post was created / author’s country at post time. E.g. `ID`, `GB`. |
| `originalLanguage` | string (BCP 47) | Yes | Language of post body at creation. E.g. `id`, `en-GB`. |
| `content` | string (or rich text) | Yes | Original post body. |
| `translationVersions` | map / object | No | Key = locale (e.g. `en`, `id`), value = `{ text: string, translatedAt: number, provider?: string, translationConfidence?: 'high' \| 'medium' \| 'low' }`. |
| `translationStatus` | enum | No | `none` \| `pending` \| `done` \| `failed`. For async translation pipeline. |
| `translationCacheTimestamp` | number (ms) | No | Last time translations were refreshed (for cache invalidation). |
| `crossCountryRelevanceScore` | number (0–1) | No | Soft cultural relevance for surfacing abroad. Low = local slang/promos; high = universally relevant. Used in ranking. |
| `mediaUrls` | string[] | No | Image URLs. |
| `videoLink` | string | No | Video URL. |
| `attachment` | object | No | File attachment. |
| `jobBadge` | string | No | `Job Offered` \| `Position Required` \| null. |
| `postType` | string | No | `video` \| `article` \| `buy-sell` \| `job-offered` \| `job-wanted` \| `post`. |
| `createdAt` | number (ms) | Yes | Publish time. |
| `updatedAt` | number (ms) | No | Last edit or last translation update. |
| `engagementScore` | number | No | Computed or stored score for ranking (likes, comments, shares, recency). |

### 2.2 User/Profile (relevant fields for feed)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | string | Yes | User/profile ID. |
| `country` | string (ISO) | No | User’s selected or detected country for feed preference. |
| `mutedCountries` | string[] | No | List of country codes for “Hide posts from this country”. Persisted in profile/settings. |
| `preferredLanguage` | string (BCP 47) | No | UI and preferred translation target (e.g. `id`, `en-GB`). |
| `globalDiscoveryMode` | boolean | No | When true, feed mix is 50/50 (local/international) instead of 90/10. “Explore Global Posts” toggle. |

### 2.3 Country/locale config (application layer)

| Item | Description |
|------|-------------|
| **Supported countries** | e.g. `ID`, `GB` (expandable). Each has: `code`, `name`, `flagEmoji` or `flagAssetUrl`, `defaultLanguage`, `slug` (e.g. `indonesia`, `uk`). |
| **Supported languages** | e.g. `id`, `en`, `en-GB`. Map country → default language for UI and “translate to” target. |

---

## 3. Feed Algorithm Logic

### 3.1 Inputs

- `selectedCountry`: string (e.g. `ID`, `GB`)
- `userPreferredLanguage`: string (e.g. `id`, `en-GB`)
- `mutedCountries`: string[] (from user profile)
- `cursor` / `page` for pagination
- `limit`: number (e.g. 20 per request)

### 3.2 Ranking priority (order of application)

1. **Exclude muted**  
   Filter out any post where `originCountry` is in `mutedCountries`.

2. **Segment by origin**  
   - **Local:** `originCountry === selectedCountry`  
   - **International:** `originCountry !== selectedCountry`

3. **Composition rule (per page)**  
   - **90% local (or 50% when global discovery mode is on):** Fill slots with posts from `selectedCountry`, ordered by `engagementScore` (or `createdAt` + engagement).  
   - **10% international (or 50% when global discovery mode is on):** Fill remaining with posts from other countries, same ordering.  
   - If local posts are exhausted, fill remaining with international (and vice versa if ever needed).  
   - *For a stronger ranking formula (geo-relevance + engagement + freshness + relevance + author authority), see **Section 11.1**.*

4. **Within each segment, sort by**  
   - Primary: `engagementScore` (or composite: recency + likes + comments + shares)  
   - Secondary: `createdAt` descending  

5. **Optional: category/topic relevance**  
   If “Relevant category” is used, boost posts whose topic/category matches user’s recent views or profile. Can be a multiplier on `engagementScore`.

### 3.3 Pseudocode (server or client orchestration)

```
function getFeedPage(selectedCountry, mutedCountries, userLang, cursor, limit):
  localLimit  = round(limit * 0.9)
  globalLimit = limit - localLimit

  localPosts = query(
    originCountry == selectedCountry,
    originCountry not in mutedCountries,
    orderBy: [engagementScore desc, createdAt desc],
    limit: localLimit,
    cursor
  )

  globalPosts = query(
    originCountry != selectedCountry,
    originCountry not in mutedCountries,
    orderBy: [engagementScore desc, createdAt desc],
    limit: globalLimit,
    cursor
  )

  merged = interleaveByPriority(localPosts, globalPosts, ratio: 0.9/0.1)
  return enrichWithTranslations(merged, userLang)
```

**Interleave:** For a smooth UX, interleave rather than “all local then all global” (e.g. 9 local, 1 global, 9 local, 1 global, or weighted random insertion of global into local stream).

### 3.4 Lazy-loading and performance

- Load first page (e.g. 20 items) with 90/10 mix.
- Next page: same logic with cursor; optional **lazy-load** of translation only when post enters viewport (see Section 7).
- Cache feed response per `[selectedCountry, cursor]` for a short TTL (e.g. 60s) to avoid duplicate work.

---

## 4. Country Personalization — Hero & Selector

### 4.1 Hero section

- **Dynamic headline:** One hero component; copy depends on `selectedCountry`.
  - **Indonesia:** e.g. “IndaStreet Indonesia Community” (or “Komunitas IndaStreet Indonesia” if UI lang is ID).
  - **UK:** e.g. “IndaStreet UK Community”.
- **Data source:** `selectedCountry` from global state (or URL). Map `countryCode` → `countryName` (and optional localized string key).
- **No separate pages for “Indonesia feed” vs “UK feed” by default:** Same route (e.g. `/indonesia` or `/uk`), with country coming from selector or URL.

### 4.2 Country selector (side drawer)

- **Placement:** In the main app drawer (e.g. “IndaStreet Countries” or “Select region”).
- **Behavior:**
  - List of supported countries: e.g. Indonesia, United Kingdom (and future countries).
  - On select:
    1. Persist `selectedCountry` (URL + user preference/store).
    2. Optionally persist to user profile if logged in (`user.country = selectedCountry`).
    3. Refresh feed with new `selectedCountry` (and same `mutedCountries`).
    4. Update hero headline and any “Your community” labels.
- **State:** `selectedCountry` is global (context or store); URL can reflect it (e.g. `/indonesia`, `/uk`) for shareability and SEO.

---

## 5. Foreign Post Handling & Translation

### 5.1 When a post is “foreign”

- **Foreign:** `post.originCountry !== selectedCountry`.
- **Display language:** Show post in `userPreferredLanguage` (or selected country’s default language). If `post.originalLanguage` matches that, show original; else show translated version.

### 5.2 Translation flow

1. **Resolve target language:** e.g. `targetLang = userPreferredLanguage || countryToLanguage(selectedCountry)`.
2. **Need translation?** `post.originalLanguage !== targetLang`.
3. **Get text:**  
   - If translation exists in `post.translationVersions[targetLang]`, use it and set `displayedTranslation = true`.  
   - Else:
     - Trigger translation (async): call translation API, write result to `translationVersions[targetLang]`, set `translationCacheTimestamp`, `translationStatus = 'done'`.
     - Until done, show original content and optionally “Translating…” or show original with “Translation pending”.
4. **Cache:** Same post + same target language must not be translated again; always read from `translationVersions` first. Cache key effectively `postId + targetLang`.

### 5.3 Translation disclosure (required)

- **Translation icon (e.g. language or “Aa” icon):** Shown when the post is displayed in a translated language (`displayedTranslation === true`).
- **On click:** Open a modal (or inline expand) with exactly this message (or localized equivalent):
  - *“This post was automatically translated. Translation may not be 100% accurate due to grammar and sentence structure differences.”*
- **Placement:** On the post card, near the “From [Country]” label or in the post header. Must be visible but not overwhelming.

### 5.4 Metadata on foreign posts

- **Original country name:** Stored in config by `originCountry` (e.g. “Indonesia”, “United Kingdom”). Shown in metadata (e.g. “From United Kingdom”).
- **Small country flag:** Icon or emoji for `originCountry` on the post card (e.g. top-right or next to author).
- **Original language:** Optional tooltip or metadata “Originally in English” for transparency.

---

## 6. Country Filtering Control — “Hide posts from this country”

### 6.1 UI

- **Control:** Small country or “globe” icon on each **foreign** post card (e.g. next to the flag or in the card menu).
- **On click:** Open a small popover/menu with one main option: **“Hide posts from [Country name]”** (e.g. “Hide posts from United Kingdom”).

### 6.2 Action

- On “Hide posts from [Country]”:
  1. Add `originCountry` to user’s `mutedCountries` (e.g. `mutedCountries = [...mutedCountries, post.originCountry]`).
  2. Persist to user profile/settings (API: e.g. `PATCH /me/settings { mutedCountries }`).
  3. Remove or hide that post from current feed view (and all future feed requests use updated `mutedCountries`).
  4. Optional: toast “Posts from [Country] hidden. You can change this in Settings.”

### 6.3 State management

- **Logged-in:** `mutedCountries` from server (user profile); after mutation, refetch or update local state and refetch feed.
- **Guest:** Store `mutedCountries` in local storage (or session) keyed by something stable (e.g. device). On login, optionally merge with server `mutedCountries`.

### 6.4 Reverting

- In **Settings** (or profile), expose “Hidden countries” or “Muted regions” with a list of muted countries and “Show posts from [Country] again”. Removing a country from `mutedCountries` and saving restores those posts in the feed.

---

## 7. UI Component Logic — Post Card (foreign vs local)

### 7.1 Post card props (conceptual)

- `post`: full post object (with `originCountry`, `originalLanguage`, `translationVersions`, content, author, media, etc.)
- `selectedCountry`: string
- `userPreferredLanguage`: string
- `displayedContent`: string (already resolved: either original or translated text)
- `isTranslated`: boolean (true if displayed content is from translation)
- `countryName`: string (display name for `post.originCountry`)
- `isForeign`: boolean (`post.originCountry !== selectedCountry`)

### 7.2 Visual treatment for foreign posts

| Element | Requirement |
|--------|--------------|
| **Flag** | Small flag icon (or emoji) in top corner of card (e.g. top-right). Represents `originCountry`. |
| **Label** | Subtle label: “From [Country]” (e.g. “From United Kingdom”). Place near flag or under author. |
| **Border** | Slightly lighter or different border tone (e.g. neutral gray vs amber) so foreign cards are distinguishable without being loud. |
| **Translation icon** | Shown only when `isTranslated`. Click opens disclosure modal (see 5.3). |
| **Country control icon** | Small icon (e.g. globe or flag) that opens “Hide posts from this country” menu (see Section 6). Shown only when `isForeign`. |

Keep layout clean: one line for “From [Country]” + translation icon + country-control icon; flag in corner. No duplicate info.

### 7.3 Local posts

- No flag, no “From [Country]”, no translation icon, no “Hide from this country” (or hide that control). Optional subtle “Local” or nothing.

---

## 8. State Management Logic

### 8.1 Global / feed-level state

| State | Source | Description |
|-------|--------|-------------|
| `selectedCountry` | URL + drawer selector | Current country for feed and hero. Sync to URL (e.g. `/indonesia`). |
| `userPreferredLanguage` | User profile or browser/settings | Language for UI and translation target. |
| `mutedCountries` | User profile (or local storage for guest) | List of country codes to exclude from feed. |
| `feedItems` | API | Current page of posts (already merged 90/10 and filtered by muted). |
| `translationCache` | Client (optional) | In-memory map `postId+lang → text` to avoid re-requesting same translation in session. |

### 8.2 Per-post derived state (computed)

- `isForeign = post.originCountry !== selectedCountry`
- `targetLang = userPreferredLanguage || countryDefaultLang(selectedCountry)`
- `displayedContent = translationVersions[targetLang]?.text ?? post.content` (if originalLanguage !== targetLang, else post.content)
- `isTranslated = (post.originalLanguage !== targetLang) && !!translationVersions[targetLang]`

### 8.3 Events / actions

- **Country selected (drawer):** Set `selectedCountry`, update URL, refetch feed, update hero.
- **Hide posts from country:** Update `mutedCountries`, persist, refetch feed (or filter client-side for instant feedback then refetch).
- **Translation icon clicked:** Open disclosure modal (no state change beyond modal open/close).
- **Language changed (if ever in UI):** Set `userPreferredLanguage`, refetch or re-resolve translations for visible posts.

---

## 9. UX Interaction Flows

### 9.1 First load (e.g. Indonesia)

1. User opens `/indonesia` (or selects Indonesia in drawer).
2. `selectedCountry = 'ID'`. Hero shows “IndaStreet Indonesia Community”.
3. Feed request: `selectedCountry=ID`, `mutedCountries=[]`, `userPreferredLanguage=id`.
4. Server returns 90% ID posts, 10% non-ID; muted excluded.
5. For each foreign post, if `originalLanguage !== id`, ensure translation (from cache or API), then render with “From [Country]”, flag, translation icon, country-control icon.
6. Local posts render with no extra badges.

### 9.2 User switches to UK

1. User opens drawer, selects “United Kingdom”.
2. URL becomes `/uk` (or similar), `selectedCountry = 'GB'`.
3. Hero updates to “IndaStreet UK Community”.
4. Feed refetches with `selectedCountry=GB`, same `mutedCountries`.
5. Feed now 90% GB, 10% other (ID, etc.). Non-GB posts show translation (if target lang e.g. `en-GB`), flag, “From Indonesia”, etc.

### 9.3 User hides posts from a country

1. User sees a post “From United Kingdom”, clicks country-control icon.
2. Menu opens: “Hide posts from United Kingdom”.
3. User selects it. `mutedCountries` becomes `['GB']`; persisted to profile/settings.
4. That post disappears from list; next feed load excludes all GB posts.
5. Optional toast: “Posts from United Kingdom are now hidden. Change in Settings.”

### 9.4 User opens translation disclosure

1. User sees translated post (translation icon visible).
2. User clicks translation icon.
3. Modal opens with: “This post was automatically translated. Translation may not be 100% accurate due to grammar and sentence structure differences.”
4. User closes modal. No other state change.

---

## 10. Performance Requirements

| Requirement | Implementation |
|-------------|----------------|
| **Cache translations** | Store in `post.translationVersions`; in client optionally cache `postId+lang → text` in memory for session. Never translate the same post+lang twice in same session. |
| **Avoid repeated translation** | Before calling translation API, check `translationVersions[targetLang]`. If present and not stale, use it. Optional: TTL per translation (e.g. 30 days) and refresh on post edit. |
| **Lazy-load international posts** | When 90/10 merge is used, international posts can be loaded in same request as local (recommended for simplicity). Alternatively: load first page as local-only, then load “international” batch and merge (more complex). Prefer single request with 90/10 to avoid extra round-trips. |
| **Lazy-load translation** | If a post is shown in original first (e.g. “Translating…”), when it enters viewport trigger translation fetch and then re-render with translated text. Otherwise translate on feed load for visible viewport only. |
| **Fast feed** | Feed API should be indexed by `(originCountry, mutedCountries)` and sorted by engagement + time; use cursor pagination. Keep response &lt; ~200ms p95. |

---

## 10. API Contract (minimal)

### Feed

- **Request:** `GET /api/feed?country={selectedCountry}&lang={userPreferredLanguage}&muted={comma-separated country codes}&cursor={cursor}&limit=20&feedMix=default|global` (optional `feedMix`: `global` = 50/50 local/international).
- **Response:**  
  `{ posts: Post[], nextCursor?: string }`  
  Each `Post` includes: `id`, `authorId`, `originCountry`, `originalLanguage`, `content`, `translationVersions` (or only `translationVersions[requestedLang]`), `mediaUrls`, `videoLink`, `createdAt`, `updatedAt`, `engagementScore`, author display name/avatar, etc.

### Translation (if on-demand)

- **Request:** `POST /api/posts/:id/translate { targetLang }`  
  Or: translation runs in background when feed is built; feed already returns translated content for requested `lang`.

### Trending (see Section 11.4)

- **Request:** `GET /api/trending?country={country}&limit=20&type=posts|topics|professionals`  
- **Response:** Trending posts, topics (hashtags/categories), or professionals for that country (signals: comment/share velocity, save rate).

### User settings

- **Get:** `GET /me/settings` → `{ mutedCountries: string[], preferredLanguage?: string, country?: string, globalDiscoveryMode?: boolean }`
- **Update:** `PATCH /me/settings` body `{ mutedCountries?: string[], preferredLanguage?: string, country?: string, globalDiscoveryMode?: boolean }`

---

## 11. High-Impact Upgrades (Recommended)

*These improvements are often missed but materially improve performance, SEO, and UX. Target for post–MVP or v2.*

### 11.1 Geo-relevance scoring layer (ranking formula)

**Problem:** Using only engagement + recency can let low-quality local posts outrank high-value posts.

**Upgrade:** Replace or combine with a composite **rank score**:

```
rankScore =
  (localBoost × countryMatch)
  + (engagementWeight × engagementScore)
  + (freshnessWeight × recencyDecay)
  + relevanceScore
  + authorAuthorityScore
```

| Term | Description | Implementation |
|------|-------------|----------------|
| `localBoost` | Multiplier when `originCountry === selectedCountry` (e.g. 1.2). | Config constant; apply only for local posts. |
| `countryMatch` | 1 if local, 0 if international (or 0.5 for “nearby” region if defined). | From `post.originCountry` vs `selectedCountry`. |
| `engagementWeight` | Weight for likes, comments, shares (e.g. 0.4). | Normalize engagement to 0–1; multiply. |
| `freshnessWeight` | Weight for recency (e.g. 0.3). | `recencyDecay = exp(-λ × ageInHours)` or similar. |
| `relevanceScore` | Topic/category match to user or session (0–1). | From user interests or recent views; optional. |
| `authorAuthorityScore` | Verified, history, follower count, etc. (0–1). | Precomputed per author; join at rank time. |

**Output:** Sort feed by `rankScore` descending. Prevents weak local posts from dominating; keeps high-quality and authoritative content competitive.

**Full implementation:** See **[FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md](./FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md)** for the complete formula (geo, engagement, freshness, relevance, authority, quality, diversity), weights, safety limiters, caching, and triggers.

---

### 11.2 Translation confidence score

**Field (per translation):** In `translationVersions[lang]` add `translationConfidence`: `'high'` \| `'medium'` \| `'low'` (from translation API or heuristic).

**Display logic:**

| Confidence | Behavior |
|------------|----------|
| **high** | Show translated content normally; no icon or subtle icon. |
| **medium** | Show translation icon; on click show disclaimer modal (existing copy). |
| **low** | Auto-expand disclaimer (e.g. inline below post or modal on first view). Increases trust when quality is uncertain. |

**Implementation:** Set confidence from provider (e.g. Google Translate confidence), word-coverage, or manual rules (e.g. very short text → medium). Store in `translationVersions[lang].translationConfidence`.

---

### 11.3 Edge cache for feed responses

**Cache key:**  
`feed:{country}:{lang}:{mutedCountriesHash}:{cursor}`  
e.g. `feed:ID:id:a1b2c3:page2`. `mutedCountriesHash` = stable hash of sorted muted list (e.g. SHA256 truncated or sorted join).

**Behavior:**  
- Cache full feed JSON at edge (CDN or Redis at edge).  
- TTL: e.g. 60–120s for first page, 300s for deeper pages.  
- Invalidate on: new post in that country (invalidate that country’s keys), or on user-specific key only for muted changes (user-scoped cache).  

**Benefit:** Reduces origin load for popular country/language combinations; sub-50ms responses from edge.

---

### 11.4 Country trend layer

**Endpoint:** `GET /api/trending?country={country}&limit=20` (optional: `type=posts|topics|professionals`).

**Returns:**  
- **Trending posts:** By comment velocity, share velocity, save rate (e.g. last 24–48h).  
- **Trending topics:** Hashtags or categories with rising post count or engagement.  
- **Trending professionals:** Authors with highest engagement or follower growth in that country.

**Signals to compute (per post/entity):**  
- Comment velocity (comments per hour).  
- Share velocity (shares per hour).  
- Save rate (saves / impressions or saves in window).

**Use in product:**  
- “Trending” widget on feed or explore.  
- Optional boost in main feed: add `trendingBoost` to rank score for items in `/api/trending` for that country.

---

### 11.5 Soft cultural relevance filter

**Field on post:** `crossCountryRelevanceScore` (number 0–1).  
- **Low (0–0.3):** Strongly local (slang, local promos, events). Prefer not to surface in other countries.  
- **High (0.7–1):** Universally relevant (tips, how-tos, general wellness). Safe to show globally.

**How to set:**  
- Rule-based: e.g. “contains location-specific promo” → low.  
- ML: classifier trained on “would this be useful to someone in another country?”  
- Default new posts to 0.5; adjust via moderation or model.

**Use in ranking:**  
- For international slot (10% or 50% in discovery mode), multiply or threshold by `crossCountryRelevanceScore` so low-relevance posts are deprioritized or excluded. Prevents local slang and irrelevant promos from appearing abroad.

---

### 11.6 Translation pre-generation queue

**Current (on-demand):** Translate when post is first requested in a language.

**Upgrade:**  
- **On post create (or shortly after):** Enqueue job to translate into **top N platform languages** (e.g. top 10: `id`, `en`, `en-GB`, etc.).  
- Store results in `post.translationVersions[lang]` with `translationConfidence` and `translatedAt`.  
- **Benefits:** Instant load (no translation API wait); predictable cost (batch job); better cache hit rate.

**Implementation:**  
- Async worker consumes queue; calls translation API in batch if supported; writes to DB.  
- If a user requests a language not yet in top N, fall back to on-demand and optionally backfill into `translationVersions` for next time.

---

### 11.7 Global discovery mode toggle

**User option (e.g. in feed header or settings):** “Explore Global Posts” or “Global discovery”.

**When OFF (default):** Feed mix 90% local / 10% international (existing behavior).

**When ON:** Feed mix **50% local / 50% international**. Same ranking and muting rules; only the composition ratio changes.

**Persistence:** Store in user settings as `globalDiscoveryMode: boolean`. Send to feed API (e.g. `feedMix=default|global`).

**Benefit:** Increases time on platform and discovery of international content for users who opt in.

---

## 12. Architecture — Layered model (gold standard)

Recommended system design to avoid bottlenecks and scale:

```
GLOBAL DATABASE
       ↓
COUNTRY FILTER LAYER   (exclude muted; segment local vs international)
       ↓
PERSONALIZATION LAYER  (user prefs: lang, muted, discovery mode; relevance signals)
       ↓
RANKING ENGINE         (rankScore: geo + engagement + freshness + relevance + authority; optional trending boost)
       ↓
TRANSLATION ENGINE     (resolve display language; pre-gen or on-demand; confidence score)
       ↓
FEED DELIVERY API      (edge cache by country+lang+mutedHash; cursor pagination; JSON response)
```

- **Global database:** Single source of truth for posts, users, translations, engagement.
- **Country filter layer:** Applies `selectedCountry`, `mutedCountries`, and (optional) `crossCountryRelevanceScore` threshold.
- **Personalization layer:** Applies user language, feed mix (90/10 vs 50/50), and any relevance/interest signals.
- **Ranking engine:** Computes `rankScore`; sorts and interleaves local/international per mix.
- **Translation engine:** Picks language; selects from `translationVersions` or triggers pre-gen/on-demand; attaches `translationConfidence`.
- **Feed delivery API:** Returns ordered list; optionally served from edge cache keyed by `country + lang + mutedCountriesHash`.

This keeps responsibilities separated and allows each layer to be optimized or replaced (e.g. ranking model, cache strategy) without rewiring the whole system. For scaling, sharding, cache tiers, queues, and failover, see **[FEED-INFRASTRUCTURE-SCALING-SPEC.md](./FEED-INFRASTRUCTURE-SCALING-SPEC.md)**.

---

## 13. Final Expert Assessment

The base spec is already **above typical startup level** and approaches **enterprise-style social platform architecture**.

With the high-impact upgrades in Section 11 and the layered design in Section 12, the system is capable of scaling to:

- **Millions of users** (edge cache, ranking engine, single global DB).
- **Multi-country rollout** (country filter + personalization + translation).
- **AI ranking systems** (rankScore formula and optional ML relevance/authority).
- **Real-time feeds** (trending layer, pre-generated translations, fast feed API).

---

## 14. Summary Checklist (implementation)

- [ ] Single global post table with `originCountry`, `originalLanguage`, `translationVersions`, `translationStatus`, `translationCacheTimestamp`.
- [ ] User profile/settings: `mutedCountries`, `preferredLanguage`, `country` (selected).
- [ ] Hero headline dynamic by `selectedCountry` (e.g. “IndaStreet [Country] Community”).
- [ ] Country selector in drawer; on select update URL + state and refetch feed.
- [ ] Feed algorithm: 90% selected country, 10% international; exclude muted; sort by engagement + time; interleave.
- [ ] Foreign posts: show “From [Country]”, flag, translated content when lang differs; translation icon + disclosure modal.
- [ ] Country control on foreign posts: “Hide posts from this country”; persist `mutedCountries` and refetch feed.
- [ ] Post card: subtle border/style difference for foreign; flag + label + icons without clutter.
- [ ] Translation: read from cache first; lazy-load or on-demand per post; never translate same post+lang twice in session.
- [ ] Settings: allow user to see and revert muted countries.

**High-impact upgrades (Section 11)**  
- [ ] Ranking engine: implement full formula per [FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md](./FEED-RANKING-ALGORITHM-IMPLEMENTATION-SHEET.md) (geo, engagement, freshness, relevance, authority, quality, diversity; configurable weights; safety limiters; pipeline order in §18; optional elite upgrades in §17).
- [ ] `translationConfidence` per translation; display: high = normal, medium = icon, low = auto-expand disclaimer.
- [ ] Edge cache for feed by `country + lang + mutedCountriesHash`.
- [ ] `GET /api/trending?country=` for trending posts/topics/professionals (comment/share velocity, save rate).
- [ ] `crossCountryRelevanceScore` on posts; use in international slot ranking/filtering.
- [ ] Translation pre-generation: on post create, translate into top 10 languages and store.
- [ ] Global discovery toggle: `globalDiscoveryMode`; 50/50 feed mix when enabled.
- [ ] Infrastructure: scaling, caching, queues, and failover per [FEED-INFRASTRUCTURE-SCALING-SPEC.md](./FEED-INFRASTRUCTURE-SCALING-SPEC.md) when moving to high scale.

---

*Spec version: 1.1 — Global Social Feed Localization & Country Logic. Includes high-impact upgrades and layered architecture. Scalable to all countries; one unified database; country-adaptive UI and filtering.*
