# Auto-Post System — What You Still Need to Build

**Status:** ~90% done. Datasets, topics, cities, and specs exist. Only **3 system components** remain.

**You do NOT need:** More datasets, more topics, or more cities.

**You ONLY need:** Scheduler + Content Generator + Publisher. Once those exist, the platform becomes a self-growing SEO machine.

---

## 1️⃣ Scheduler (Daily Planner)

**Runs once per day** and decides:

- How many posts today (3–5, random).
- What time to publish each.
- Which topic + city + service combo per slot.

**Output:** Scheduled post jobs (queue or DB rows with `runAt`).

**Example output:**

```json
[
  { "time": "09:14", "topic": "Benefits of deep tissue massage", "city": "Bandung" },
  { "time": "13:42", "topic": "Facial benefits for skin health", "city": "Jakarta" },
  { "time": "19:06", "topic": "Home massage vs spa visit", "city": "Surabaya" }
]
```

**Best options:**

| Option | Pros |
|--------|------|
| **Cron job** | Simple, reliable, runs on your server. |
| **Serverless scheduled function** | No server to maintain (e.g. Netlify/Appwrite scheduled, AWS EventBridge). |
| **Background worker** | Fits if you already have a job queue (e.g. Bull, Inngest). |

**Rules (from [ELITE-AUTO-POST-SYSTEM-SPEC.md](./ELITE-AUTO-POST-SYSTEM-SPEC.md)):** Posts spaced 2–4 hours apart; times vary daily (no fixed 9:00, 12:00); never repeat same topic type twice in a row.

---

## 2️⃣ Content Generator (AI Writer)

**Runs when the scheduler triggers** (at each publish time). Creates:

| Field | Example |
|-------|---------|
| **title** | Benefits of Deep Tissue Massage in Bandung |
| **body text** | Hook + helpful content + local relevance + CTA (see ELITE-AUTO-POST §4). |
| **SEO description** | Discover how deep tissue massage improves muscle recovery… |
| **hashtags** | From topic/city (e.g. #MassageBandung #DeepTissue). |
| **slug** | `deep-tissue-massage-bandung` (unique, from title + shortId). |

**Options:**

| Option | Pros / cons |
|--------|------------------|
| **GPT API** | Flexible, human-like; cost per post. |
| **Template generator** | No API cost; fill slots from [indonesiaSeoDataset](../src/data/indonesiaSeoDataset.ts). |
| **Hybrid (recommended)** | Templates for structure + optional LLM for variation/expansion. |

**Inputs:** `topic`, `city`, optional `service` from scheduler output; use `SEO_TOPICS_*` and `SEO_CITIES_*` from `src/data/indonesiaSeoDataset.ts`.

---

## 3️⃣ Publisher (Post Creator)

**Writes to your database and site.** Must:

| Step | Action |
|------|--------|
| **Insert post** | Create document in posts table with title, body, slug, author (system), originCountry, createdAt, etc. |
| **Generate slug** | `slugify(title + location + shortId)`; ensure unique (see [POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md](./POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md)). |
| **Mark published** | Status = published; no draft. |
| **Trigger sitemap update** | Append or regenerate `sitemap-posts.xml` so new URL is discoverable. |
| **Clear CDN cache** | Invalidate cache for `/post/{slug}` (and optionally feed cache keys) so new post appears. |

**Dependencies:** Posts table with `slug` (unique, indexed); [POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md](./POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md) for route + edge render + sitemap.

---

## How the Full System Flows

```
00:01 daily
    ↓
Scheduler runs
    ↓
Creates today's post plan (3–5 jobs with time + topic + city)
    ↓
At each publish time
    ↓
Content Generator creates title, body, description, hashtags, slug
    ↓
Publisher saves post to DB
    ↓
Publisher triggers sitemap update + cache clear
    ↓
Post page is available at /post/{slug} (edge-rendered)
    ↓
Google crawls (sitemap + internal links)
```

No human needed after deployment.

---

## Simple Implementation Stack (Recommended)

| Component | Recommended choice |
|-----------|---------------------|
| **Scheduler** | Server cron (e.g. `0 0 * * *` at midnight) or serverless scheduled function. |
| **Generator** | API function or serverless (Node) that takes topic/city, returns content. |
| **Publisher** | DB insert (Appwrite/Postgres/etc.) + call to sitemap regeneration + cache purge. |

**You could build this in:**

- Node server (existing or small microservice).
- Serverless function (Netlify, Vercel, Appwrite scheduled function).
- Edge worker (if generator is light or calls external API).

---

## Minimal Pseudocode (Copy for Dev)

```text
dailyJob():
  postsToday = random(3, 5)
  previousTopicCategory = null

  for i in 1..postsToday:
    time = randomTimeToday(minGapMinutes: 120, maxGapMinutes: 240)
    category = randomCategory(exclude: previousTopicCategory)
    topic = random(SEO_TOPICS_BY_CATEGORY[category])
    city = random(SEO_CITIES_ALL)   // or weight by tier
    previousTopicCategory = category

    queueJob({
      runAt: time,
      task: "createPost",
      payload: { topic, city }
    })


createPost(payload):
  topic = payload.topic
  city = payload.city
  service = random(SERVICES)   // optional: e.g. "deep tissue", "Swedish"

  content = generateContent(topic, city, service)   // title, body, description, hashtags, slug
  content.slug = slugify(content.title) + "-" + shortId()   // ensure unique

  savePost(content)   // DB insert, status = published
  triggerSitemapUpdate()
  clearCache("/post/" + content.slug)
```

**Data source:** Import `SEO_TOPICS_BY_CATEGORY`, `SEO_TOPICS_ALL`, `SEO_CITIES_ALL` (or `SEO_CITIES_BY_TIER`) from `src/data/indonesiaSeoDataset.ts`.

---

## Pro Growth Mode (Optional, Later)

Add these for stronger results (can increase ranking speed 5–10×):

| Feature | Purpose |
|---------|---------|
| Keyword density optimizer | Keep primary keyword in range (e.g. &lt;3%); avoid spam. |
| Competitor keyword scraping | Discover gaps and trending phrases. |
| Auto internal linking | Link new post to related posts (same city/topic). |
| Image generator | Unique image per post (AI or stock) per ELITE-AUTO-POST §6. |
| Trending keyword injector | Blend in current search trends. |
| Search volume weighting | Prefer high-volume city/topic combos in scheduler. |

---

## Checklist (Remaining Build)

- [ ] **Scheduler:** Runs once per day; outputs 3–5 jobs with `runAt`, `topic`, `city` (and optional `service`); times 2–4h apart; no same category twice in a row.
- [ ] **Content Generator:** Given topic + city (+ service), returns title, body, SEO description, hashtags, slug; uses `indonesiaSeoDataset`; optional GPT or hybrid.
- [ ] **Publisher:** Inserts post (with slug), marks published, triggers sitemap update, clears CDN cache for new post URL.
- [ ] **Queue or cron at time:** Something that at each `runAt` calls `createPost` (cron per slot, or job queue with delay).

---

## Final Verdict

You are **~90% done**. Only **scheduler + generator + publisher** remain. Once those exist, the platform becomes a self-growing SEO machine with no extra datasets or cities required.

**Related docs:**

- [ELITE-AUTO-POST-SYSTEM-SPEC.md](./ELITE-AUTO-POST-SYSTEM-SPEC.md) — Full auto-post spec (rotation, SEO formula, quality filter).
- [INDONESIA-SEO-DATASET.md](./INDONESIA-SEO-DATASET.md) / `src/data/indonesiaSeoDataset.ts` — Topics and cities.
- [POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md](./POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md) — Slug, `/post/:slug`, sitemap, cache.

*End of doc.*
