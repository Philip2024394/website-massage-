# Post Ranking — Critical Path Build Tasks

**Platform:** IndaStreet  
**Purpose:** The only missing components preventing posts from ranking on Google. Complete these in order to make social posts searchable web pages.

---

## Summary: What’s Missing vs What You Have

| You have | You need |
|----------|-----------|
| Feed (JS/API), post data, SEO checklist, auto-post spec | Public `/post/:slug` route, slug in DB, **HTML in initial response**, sitemap for posts, robots allowing `/post/` |

**Verdict:** System architecture is correct and viable. You are not redesigning — only completing the last SEO layer. Once `/post/:slug` + HTML rendering exists, social posts become indexable.

---

## 1 — Post Route

**Create route:**

```
/post/:slug
```

**Slug must be:**

- **Unique** (no two posts share the same slug).
- **Readable** (human- and keyword-friendly).
- **Keyword-based** (supports ranking).

**Example:** `https://indastreetmassage.com/post/home-massage-benefits-jakarta`

**Implementation:** Register `/post/:slug` in router (path-based, not hash). Resolve post by `slug`; return 404 if not found. No login required for GET.

---

## 2 — Add Slug Field to Database

**Posts table must have:**

| Field | Type | Constraints |
|-------|------|-------------|
| `slug` | VARCHAR | UNIQUE, INDEXED |

**Generation rule:**

```
slug = slugify(titleOrFirstLine + location + shortId)
```

- `slugify`: lowercase, replace spaces with `-`, remove special chars, collapse multiple hyphens.
- `shortId`: first 6–8 chars of post ID or nanoid for uniqueness.
- Ensure no duplicate slugs (check before insert; append suffix if collision).

**When to set:** On post create; optionally on post edit (with 301 from old slug if slug changes).

---

## 3 — Render Post HTML Server-Side

**Google must receive in the initial HTML response:**

- Post text (body)
- Images (with `src` and alt)
- Author (name, link if applicable)
- Title (e.g. in `<h1>` and `<title>`)
- Schema (JSON-LD in `<head>`)

**Three valid implementation options:**

| Method | Difficulty | Speed | Recommended |
|--------|------------|-------|-------------|
| **Edge render** | Medium | Fast | ⭐ BEST for you |
| **SSR endpoint** | Easy | Medium | Good |
| **Static pre-render** | Hard | Fastest | Best at scale |

**Recommended:** You already use Netlify edge functions (e.g. meta-injector for therapist profiles). **Extend the edge meta injector → full post renderer** for `/post/*`: on request to `/post/:slug`, fetch post by slug, render full HTML (content + meta + schema), return that HTML. Same pattern, larger payload.

**Flow:**

1. Request hits `/post/:slug`.
2. Edge (or SSR) fetches post by slug from DB/API.
3. Build HTML: `<title>`, `<meta name="description">`, `<link rel="canonical">`, post body in `<article>`, author block, images with alt, `<script type="application/ld+json">` for SocialMediaPosting/Article.
4. Return HTML (or serve SPA shell with this HTML for crawler/bot when detected).
5. Cache response at CDN (e.g. key `post:{slug}`).

---

## 4 — Auto Add Posts to Sitemap

**Sitemap must include post URLs.**

- **File:** e.g. `/sitemap-posts.xml` (or append to existing sitemap index).
- **Contents:** List every public post URL: `https://indastreetmassage.com/post/{slug}`.
- **Trigger:** Regenerate (or append) when:
  - Post is **published**.
  - Post is **edited** (slug/visibility change).

**Implementation:** In `scripts/generate-sitemap.mjs` (or equivalent), query all posts with a slug and status = published; write to `sitemap-posts.xml`. Reference it from main `sitemap-index.xml`. Optionally run on publish webhook or cron.

---

## 5 — Ensure Robots Allows Posts

**`robots.txt` must NOT block:**

```
/post/
```

**Check:** No `Disallow: /post/` (and no broad rule that accidentally disallows `/post`). Allow crawlers to reach post pages. Default `User-agent: *` with `Allow: /post/` if you use Allow, or simply omit Disallow for `/post/`.

---

## Optimal Architecture (Recommended Final Design)

| Component | Method |
|-----------|--------|
| **Feed** | JS/API (unchanged) |
| **Post pages** | Edge-rendered HTML |
| **SEO tags** | Dynamic (per post in edge response) |
| **Schema** | Dynamic (JSON-LD in edge response) |
| **Cache** | CDN (cache edge response by slug) |
| **Images** | Optimized (existing pipeline) |

**Result:** Fast feed, indexable SEO pages, low server load.

---

## Internal Linking (Often Forgotten)

**Each post page should show:**

- **Related posts** (same category, same location, or same author).

**Why:** Google discovers pages through links, not only through the sitemap. Internal links pass relevance and help crawlers find new posts faster.

**Implementation:** On post page, query 3–6 related posts (by tag, city, or author); render a “Related posts” block with links to `/post/{slug}`.

---

## Pro-Level Boost (After Launch)

**Structured breadcrumbs:**

- JSON-LD `BreadcrumbList`: **Home → Country → Category → Post** (or equivalent hierarchy).
- Helps Google understand site structure and can improve ranking/sitelinks.

**Example structure:**

```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://indastreetmassage.com/" },
    { "@type": "ListItem", "position": 2, "name": "Indonesia", "item": "https://indastreetmassage.com/indonesia" },
    { "@type": "ListItem", "position": 3, "name": "Massage Tips", "item": "https://indastreetmassage.com/indonesia/tips" },
    { "@type": "ListItem", "position": 4, "name": "Post title", "item": "https://indastreetmassage.com/post/..." }
  ]
}
```

---

## Deployment Order (Exact Build Sequence)

Build in this order:

| Step | Task |
|------|------|
| 1 | Add `slug` column to posts table (unique, indexed). |
| 2 | Create `/post/:slug` route (resolve post by slug). |
| 3 | Edge-render full HTML for post pages (content + meta + schema). |
| 4 | Inject dynamic meta + schema in that HTML. |
| 5 | Add `sitemap-posts.xml` and include post URLs; trigger on publish/edit. |
| 6 | Submit sitemap (and sitemap index) to Google Search Console. |

Following this sequence gives the fastest path to indexing.

---

## Realistic Results Timeline

| Time | Result |
|------|--------|
| **2–4 weeks** | Posts indexed (after sitemap submit and crawl). |
| **4–8 weeks** | Keyword ranking starts (depends on competition and content). |
| **2–4 months** | Traffic growth (with consistent quality and internal linking). |

---

## Checklist (Critical Path Only)

- [ ] **1** — Create `/post/:slug` route; slug unique, readable, keyword-based.
- [ ] **2** — Add `slug` to posts table (VARCHAR, UNIQUE, INDEXED); generate with `slugify(title + location + shortId)`.
- [ ] **3** — Render post HTML server-side (edge or SSR): post text, images, author, title, schema in initial response.
- [ ] **4** — Auto-add post URLs to sitemap (`sitemap-posts.xml`); trigger on post publish/edit.
- [ ] **5** — Ensure `robots.txt` does not block `/post/`.
- [ ] **6** — Related posts block on each post page (internal linking).
- [ ] **7** — (After launch) Breadcrumb JSON-LD: Home → Country → Category → Post.
- [ ] **8** — Submit sitemap to Search Console.

---

**Related docs:**

- [POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md](./POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md) — Six requirements that must all be true for posts to rank.
- [ELITE-AUTO-POST-SYSTEM-SPEC.md](./ELITE-AUTO-POST-SYSTEM-SPEC.md) — Auto-post content; ensure each auto-post gets a slug and is included in sitemap.
- [SEO-SOCIAL-FEED-AUDIT-CHECKLIST.md](./SEO-SOCIAL-FEED-AUDIT-CHECKLIST.md) — Full SEO audit.

*End of doc.*
