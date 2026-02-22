# Post Pages SEO — Requirement Checklist (Must ALL Be True)

**Platform:** IndaStreet (indastreetmassage.com)  
**Goal:** User posts can rank on Google only if every post page meets all requirements below.

**→ For the exact build sequence (slug, route, edge render, sitemap, robots), see [POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md](./POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md).**

---

## Can We Set This Up? ✅ Yes

You can meet every requirement with a **hybrid setup**:

| Component | Method | Why |
|-----------|--------|-----|
| **Feed** | API + JS (current) | Feed can stay client-rendered; Google does not need to index the whole feed. |
| **Post pages** | **Server-rendered** (or pre-rendered) | Each post gets a public URL with full HTML in the initial response. |
| **Sitemap** | Auto-updated | List all post URLs so crawlers discover them. |
| **Meta + schema** | Dynamic per post | Title, description, canonical, JSON-LD generated from post data. |
| **Cache** | CDN | Fast delivery for server-rendered post pages. |

This is the same pattern used by major platforms for indexable post URLs.

---

## 1. Public URL ✅ Achievable

**Requirement:** Each post must open at a URL like:

- ✅ `https://indastreetmassage.com/post/deep-tissue-benefits-jakarta`
- ❌ NOT `/feed?id=728373`

**Must be:** Unique | Load directly | Work without login.

| Current state | What to do |
|---------------|------------|
| No dedicated `/post/:slug` route yet; feed is in-page (e.g. Indonesia landing). | Add route `/post/:slug` (or `/indonesia/post/:slug`). Resolve post by slug server-side. |
| Posts may use internal `id` only. | Add and store a **slug** per post (e.g. from first line of content + `-{shortId}` for uniqueness). Generate on create/update. |

**Implementation:** Define `slug` in post schema; create route that loads post by slug; ensure URL is path-based (no `?id=`). No login required for GET.

---

## 2. Crawlable HTML ✅ Achievable

**Requirement:** View page source → must see **in the HTML**:

- Actual post text  
- Title  
- Author name  
- Image tags  

If content only appears after JavaScript loads → Google may ignore it.

**Best method:** **Server-Side Rendering (SSR)** or **Static/Pre-rendering** for post pages only.

| Current state | What to do |
|---------------|------------|
| Main app is client-side (Vite/React). Meta injection edge function exists for therapist profiles. | **Option A:** Add SSR for `/post/:slug` only (e.g. Vite SSR, or a small Node/Netlify server that renders HTML for that path). **Option B:** Extend Netlify edge (or similar) to fetch post by slug and inject full HTML + meta for `/post/*` when request is from crawler or first load. **Option C:** Pre-render post pages at publish time and serve static HTML from CDN. |
| Feed can stay JS. | No change needed for feed; only post detail needs initial HTML. |

**Implementation:** For every request to `/post/:slug`, the response body must contain the post content in plain HTML (e.g. `<article>`, `<h1>`, author, `<img>` with src). Use the same pattern as your existing meta-injector: detect path, fetch post, render HTML.

---

## 3. Indexing Allowed ✅ Achievable

**Requirement:**

- Page source must **not** contain: `<meta name="robots" content="noindex">` on post pages.  
- `robots.txt` must **not** block `/post/`.

| Current state | What to do |
|---------------|------------|
| Root `index.html` has `robots` content="index, follow". | Keep it; ensure **post pages** (when rendered) do not emit `noindex`. Default for post view = `index, follow`. |
| Sitemap script exists (therapists, places, blog). | Add post URLs to sitemap (or separate `sitemap-posts.xml`); ensure `robots.txt` does not disallow `/post/`. |

**Implementation:** When rendering post page HTML (SSR/edge/pre-render), emit `<meta name="robots" content="index, follow">` or omit robots meta (inherit from default). Audit `robots.txt`: no `Disallow: /post/`.

---

## 4. SEO Metadata Present ✅ Achievable

**Requirement:** Each post page must dynamically generate:

- `<title>Deep Tissue Massage Benefits in Jakarta | IndaStreet</title>`
- `<meta name="description" content="Discover benefits of deep tissue massage in Jakarta...">`
- `<link rel="canonical" href="https://indastreetmassage.com/post/...">`

| Current state | What to do |
|---------------|------------|
| `seoSchema.ts` has `setMetaTag`, `setCanonical`, etc. (client-side). | For post pages, set these **in the initial HTML** (server/edge/pre-render), not only after JS runs. Use post title + truncated body for description; canonical = final post URL. |
| Country/landing SEO in `seoConfig.ts`. | Reuse pattern: build title/description from post + brand; canonical = `https://indastreetmassage.com/post/{slug}`. |

**Implementation:** In the code path that outputs post page HTML, inject `<title>`, `<meta name="description">`, and `<link rel="canonical">` from post data. Keep title ~60 chars; description ~150–160.

---

## 5. Structured Data (JSON-LD) ✅ Achievable

**Requirement:** Add schema for ranking boost:

- **Article** (or **SocialMediaPosting**)  
- **Review** (if applicable)  
- **LocalBusiness** reference (if post relates to a place)

| Current state | What to do |
|---------------|------------|
| `seoSchema.ts` has `injectArticleSchema()` and other helpers. | Emit JSON-LD **in the initial HTML** for post pages (same response that contains crawlable content). Use Article or SocialMediaPosting; add Review if post has ratings; link to LocalBusiness when relevant. |
| Client-side injection is too late for crawlers. | Include `<script type="application/ld+json">` in the server/edge-rendered HTML. |

**Implementation:** In post page render, build JSON-LD from post (headline, description, image, author, datePublished, url). Add to `<head>` in the same response as the post body.

---

## 6. Crawlable Pagination / Sitemap ✅ Achievable

**Requirement:** If the feed is infinite scroll only, Google cannot scroll. You must also provide:

- `/feed/page/1`, `/feed/page/2`, … **OR**
- **Sitemap** listing all post URLs.

**Pro insight:** You do **not** need the whole feed indexed. You only need **individual post pages** indexed. The feed itself can stay JS.

| Current state | What to do |
|---------------|------------|
| Sitemap script includes static pages and blog slugs; not yet social posts. | Add a **sitemap of post URLs** (e.g. `sitemap-posts.xml` or include in existing generator). Update when posts are published/updated. List URLs like `https://indastreetmassage.com/post/{slug}`. |
| Optional: crawlable feed pages. | If you want feed pages indexable too, add `/feed/page/1` etc. and ensure they return crawlable HTML. For “posts rank on Google”, sitemap of post URLs is sufficient. |

**Implementation:** In `scripts/generate-sitemap.mjs` (or equivalent), query posts with a public slug; append to sitemap with priority/changefreq. Reference from main sitemap index. Ensure `robots.txt` allows `/post/`.

---

## Quick Verification (How to Test)

1. **Paste a post URL into** [Google Search Console → URL inspection](https://search.google.com/search-console).  
2. **Or** open `view-source:https://yourposturl` in the browser.  

**If you don’t see the post text and title in the HTML → Google won’t either.**  
After implementing SSR/edge/pre-render for `/post/:slug`, repeat the test; you should see full content in source.

---

## Biggest Mistake to Avoid

Building the feed like an app only:

- **React app → API → render posts in JS**  
- **Google sees:** empty page (or only shell).

**Solution:** Pre-render (or server-render) **post pages** so the first response contains the post. Feed can remain API + JS.

---

## Summary: Requirement Checklist (Must ALL Be True)

| # | Requirement | Status | Action |
|---|-------------|--------|--------|
| 1 | Public URL: `/post/{slug}`, unique, direct load, no login | ⬜ | Add `/post/:slug` route + slug on posts |
| 2 | Crawlable HTML: post text, title, author, images in initial HTML | ⬜ | SSR or edge/pre-render for post pages only |
| 3 | Indexing allowed: no `noindex` on post pages; `robots.txt` allows `/post/` | ⬜ | Emit `index, follow` (or omit); audit robots.txt |
| 4 | SEO metadata: dynamic title, description, canonical per post | ⬜ | Set in initial HTML when rendering post page |
| 5 | Structured data: Article/SocialMediaPosting + Review/LocalBusiness as needed | ⬜ | JSON-LD in initial HTML |
| 6 | Crawlable discovery: sitemap (or paginated feed) listing post URLs | ⬜ | Add post URLs to sitemap; no need to index full feed |

**When all six are true for every post page, user posts can rank on Google.**

---

**Related docs:**

- [SEO-SOCIAL-FEED-AUDIT-CHECKLIST.md](./SEO-SOCIAL-FEED-AUDIT-CHECKLIST.md) — Full audit (crawlability, on-page, internal linking, media, UGC, performance).
- [GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md](./GLOBAL-SOCIAL-FEED-LOCALIZATION-SPEC.md) — Feed product and data model (add `slug` to post if not present).
- [ELITE-AUTO-POST-SYSTEM-SPEC.md](./ELITE-AUTO-POST-SYSTEM-SPEC.md) — Auto-generated SEO posts (3–5/day, rotation, keywords, schema, quality filter).
- [POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md](./POST-RANKING-CRITICAL-PATH-BUILD-TASKS.md) — Build order: slug, `/post/:slug`, edge render, sitemap, robots, internal linking.
