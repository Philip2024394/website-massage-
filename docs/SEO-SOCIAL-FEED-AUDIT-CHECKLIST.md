# IndaStreet Massage — Social Media Section SEO Audit & Checklist

**Platform:** IndaStreet Massage  
**Domain:** indastreetmassage.com  
**Scope:** Community/social feed (posts, comments, images, videos)  
**Standard:** Enterprise-level, implementation-ready

**→ For the short “must ALL be true” list so post pages can rank on Google, see [POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md](./POST-PAGES-SEO-REQUIREMENT-CHECKLIST.md).**

---

## 1. Crawlability & Indexing

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 1.1 | ☐ | Each post has its own clean, static URL | Every feed post must be reachable at a unique, permanent URL (e.g. `/indonesia/post/{id}` or `/social/post/{slug}`). Prevents reliance on client-side-only rendering and ensures indexable entry points. | **Critical** | Use route like `/:country/post/:postId` or `/:country/post/:slug`. Persist `postId`/slug in DB; avoid hash-only or query-only identifiers. |
| 1.2 | ☐ | URLs use SEO-friendly slugs | URLs should include a readable slug derived from post title or first line (e.g. `/indonesia/post/123-tips-for-balinese-massage`). Improves CTR and keyword relevance in SERPs. | **Important** | Generate slug on publish: truncate/sanitize title, append `-{id}` for uniqueness. 301 redirect old ID-only URLs if migrating. |
| 1.3 | ☐ | No blocked resources in robots.txt | Ensure `/social`, `/indonesia`, `/uk`, and post paths are not disallowed. Block only admin, API, and auth paths. Allow crawlers to reach feed and post pages. | **Critical** | Audit `robots.txt`: no `Disallow: /indonesia` or `Disallow: /social`. Allow `User-agent: *` for feed and post URLs. |
| 1.4 | ☐ | Canonical tags configured | Every post and feed view must have a single canonical URL to avoid duplicate content (e.g. with/without query params, with/without trailing slash). | **Critical** | Emit `<link rel="canonical" href="https://indastreetmassage.com/indonesia/post/{id}-{slug}" />` in `<head>` per post. Use absolute URLs. |
| 1.5 | ☐ | Pagination crawlable | If feed uses pagination (e.g. `?page=2`), each page must be crawlable and link to prev/next. Avoid “load more” as the only way to reach older content. | **Important** | Provide `rel="prev"` / `rel="next"` and crawlable links (e.g. `/indonesia/feed?page=2`). Consider hybrid: “Load more” + optional paginated URLs for bots. |
| 1.6 | ☐ | Infinite scroll with paginated URLs | When using infinite scroll, ensure content is also reachable via stable URLs (e.g. hash fragments or query params that map to “pages”) so Google can request and index additional content. | **Important** | Use History API to push `?page=n` on scroll; or serve a “View all”/sitemap that lists paginated feed URLs. Document in GSC. |
| 1.7 | ☐ | XML sitemaps include posts, users, tags, media | Sitemap(s) should list feed index, individual post URLs, author/profile URLs, tag/category URLs, and key media pages so crawlers discover them efficiently. | **Critical** | Generate `sitemap-posts.xml`, `sitemap-authors.xml`, `sitemap-tags.xml`; update on publish. Reference from `sitemap-index.xml`. Max 50k URLs per sitemap. |

---

## 2. On-Page SEO for Posts

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 2.1 | ☐ | Dynamic title tag with keywords | Each post page must have a unique `<title>` (e.g. “Post title \| IndaStreet Social – Indonesia”). Include primary keyword and brand. | **Critical** | Server or client (with SSR/ pre-render) set `<title>` from post text/title + “IndaStreet” + country/section. Keep under ~60 chars. |
| 2.2 | ☐ | Meta description auto-generated from post content | A unique meta description (150–160 chars) per post, derived from first paragraph or summary. Drives CTR and keyword relevance. | **Critical** | Truncate/summarize post body; strip HTML; fallback to “Join the IndaStreet community…” if empty. One meta description per URL. |
| 2.3 | ☐ | H1 heading structure | Post view must have a single H1 (post title or first line). Sub-sections use H2/H3. Clear hierarchy helps Google understand content. | **Important** | Render post title or first line in `<h1>`. Comments/related can use `<h2>`. Avoid multiple H1s on one page. |
| 2.4 | ☐ | Open Graph + Twitter meta tags | Every post must have `og:title`, `og:description`, `og:image`, `og:url`, `og:type`; and Twitter Card equivalents. Enables rich previews when shared. | **Critical** | Populate from post + first image. `og:url` = canonical. Image min 1200×630 for OG. Use `summary_large_image` for Twitter. |
| 2.5 | ☐ | Structured data: Article / SocialPost / Review | Where applicable, output JSON-LD for Article (blog-like posts), SocialPosting (social posts), or Review (review/rating posts). Enables rich results. | **Important** | Use schema.org `Article` or `SocialMediaPosting` with `author`, `datePublished`, `mainEntityOfPage`. Add `Review`/`AggregateRating` for review content. Validate in Rich Results Test. |

---

## 3. Internal Linking Authority

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 3.1 | ☐ | Posts link back to service pages | When a post references a treatment (e.g. Balinese massage, facial), link to the relevant service/type page on the main site. | **Important** | Detect keywords (massage types, treatments); insert links to `/massage-types`, `/facial-types`, etc. Use consistent anchor text. |
| 3.2 | ☐ | Posts link to practitioner profiles | If a post mentions or is by a therapist/place, link to their profile URL (e.g. `/therapist/{id}` or `/place/{id}`). | **Important** | Author block and “mentioned” entities should link to profile pages. Ensures link equity flows to key conversion pages. |
| 3.3 | ☐ | Posts link to location pages | Link location/city names to location or directory pages (e.g. “Bali” → `/massage-bali` or location landing). | **Important** | Parse location from post or author; link to `/massage-bali`, `/indonesia`, etc. Use schema `contentLocation` where relevant. |
| 3.4 | ☐ | Keyword anchors used naturally | Internal links use descriptive, keyword-rich anchor text where it reads naturally (not “click here”). | **Optimization** | Prefer “Balinese massage tips” over “this post”. Avoid over-optimization; keep anchors varied and natural. |
| 3.5 | ☐ | Related posts module | Each post page includes a “Related posts” block linking to other posts (same tag, same author, or same topic). | **Important** | Query by tags, author, or embeddings; render 3–6 links with descriptive titles. Increases internal links and session depth. |
| 3.6 | ☐ | Category/tag linking system | Tags/categories are clickable and resolve to listing pages (e.g. `/indonesia/tag/wellness`). Listing pages are indexable. | **Important** | Each tag/category has a canonical URL. Use `rel="nofollow"` only for low-value or UGC tag pages if needed; otherwise allow follow. |

---

## 4. Media SEO Optimization

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 4.1 | ☐ | Images auto-compressed | Uploaded images are compressed (e.g. 80–85% quality, max dimension 2048px) before storage/serving. Reduces LCP and bandwidth. | **Critical** | Use server-side or CDN image pipeline (e.g. ImageKit, Cloudinary, or custom). Apply to all UGC image uploads. |
| 4.2 | ☐ | Descriptive file names | Image filenames reflect content (e.g. `balinese-massage-demo.jpg`) rather than random IDs only. | **Important** | On upload: sanitize original filename or generate from post title + index (e.g. `{postSlug}-1.jpg`). Avoid only `uuid.jpg`. |
| 4.3 | ☐ | Alt text generated | Every image has `alt` text: from user input, or auto-generated from post context/caption for accessibility and image search. | **Critical** | Require optional alt on upload; else generate from post body or “Image from [author] on IndaStreet”. Never leave alt empty for meaningful images. |
| 4.4 | ☐ | Lazy loading enabled | Images (and iframes for video) use `loading="lazy"` or equivalent so below-the-fold media don’t block LCP. | **Important** | Add `loading="lazy"` to `<img>`; native lazy load for iframes where supported. Exclude LCP image from lazy load. |
| 4.5 | ☐ | Video schema markup | Embedded videos (YouTube/Vimeo) are represented with `VideoObject` JSON-LD (title, description, thumbnail, uploadDate, embed URL). | **Important** | For each post with video, output `VideoObject` with `embedUrl`, `thumbnailUrl`, `name`, `description`, `uploadDate`. |
| 4.6 | ☐ | Video transcript indexing | Where possible, provide transcript or captions for video content and expose in markup or on-page text so Google can index spoken content. | **Optimization** | Use YouTube captions or attach transcript; render as expandable text or in `VideoObject` `transcript`. Helps featured snippets and accessibility. |

---

## 5. User Generated Content Quality Controls

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 5.1 | ☐ | Spam filtering | Automated checks (e.g. link ratio, repetition, known spam patterns) flag or block likely spam before it’s indexed. | **Critical** | Integrate Akismet, custom rules, or ML model. Block or hold for review when score exceeds threshold. Log for tuning. |
| 5.2 | ☐ | Duplicate detection | Near-duplicate posts (e.g. copy-paste) are detected and either merged, noindexed, or canonicalized to the first post. | **Important** | Hash normalized content (strip whitespace, lower case); compare against recent posts. Option: noindex duplicate or 301 to original. |
| 5.3 | ☐ | Minimum character threshold | Enforce a minimum length for post body (e.g. 10–20 chars) so empty or trivial posts don’t create thin content. | **Important** | Validate on submit; reject or prompt. Prevents thousands of “ok” or “.” posts from polluting the index. |
| 5.4 | ☐ | Profanity filter | Profanity and policy-violating terms are filtered or blocked to protect brand and avoid manual actions. | **Important** | Use blocklist or moderation API; replace with *** or block publish. Apply to post body and comments. |
| 5.5 | ☐ | Moderation system | Clear workflow for human review of reported or auto-flagged content (queue, approve/reject/edit, appeal). | **Important** | Admin UI for flagged items; actions: approve, delete, noindex. Record actions for repeat offenders. |
| 5.6 | ☐ | Content reporting feature | Users can report posts/comments; reports are logged and routed to moderators. Reduces harmful content and spam. | **Important** | “Report” button per post/comment; form with reason; store in DB and notify mods. Optionally auto-noindex after N reports. |

---

## 6. Performance & Core Web Vitals

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 6.1 | ☐ | LCP speed | Largest Contentful Paint is under 2.5s (ideally under 1.5s) on 4G for feed and post pages. LCP element is usually hero image or first post image. | **Critical** | Optimize LCP image (format, size, priority load); preload LCP resource; reduce render-blocking JS/CSS. Measure in RUM and PageSpeed. |
| 6.2 | ☐ | CLS stability | Cumulative Layout Shift is under 0.1. No layout jumps from images, ads, or late-loading content. | **Critical** | Set width/height or aspect-ratio on images and video containers; reserve space for dynamic content; avoid inserting above-the-fold content after load. |
| 6.3 | ☐ | JS bundle size | Main bundle and route chunks are code-split; feed/post route stays under a reasonable budget (e.g. &lt;200KB gzipped for initial). | **Important** | Lazy-load feed and non-critical components; tree-shake; audit with bundle analyzer. Defer non-critical JS. |
| 6.4 | ☐ | Server response time | TTFB for feed and post pages is under 600ms (ideally &lt;200ms). Enables fast LCP and good crawl efficiency. | **Critical** | Use edge caching for feed; SSR or ISR for post pages; optimize DB queries and API. Monitor TTFB in GSC and RUM. |
| 6.5 | ☐ | CDN usage | Static assets and images are served from a CDN with caching headers. Reduces latency and server load. | **Important** | Serve images and JS/CSS from CDN (e.g. CloudFront, ImageKit). Set Cache-Control; use consistent URLs for cache keys. |
| 6.6 | ☐ | Image formats (WebP/AVIF) | Images are served in modern formats (WebP, or AVIF where supported) with fallback for older browsers. | **Important** | Use `<picture>` or CDN to serve WebP/AVIF with fallback to JPEG/PNG. Reduces payload and improves LCP. |

---

## 7. Authority & Trust Signals

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 7.1 | ☐ | Author profiles | Every post displays a link to the author’s profile (member or practitioner) with name, avatar, and optional bio. | **Critical** | Author block on each post links to `/profile/{id}` or equivalent. Profile page is indexable and has its own meta and schema. |
| 7.2 | ☐ | Verified badges | Verified practitioners or places have a visible badge (e.g. checkmark); badge is marked up so crawlers can associate authority. | **Important** | Render badge in UI; in schema use `author.type: Person` or `Organization` and indicate verification (e.g. sameAs to official page). |
| 7.3 | ☐ | Posting history | Author profile or hover shows posting history or “Member since” so users and crawlers see sustained participation. | **Optimization** | Expose join date and post count on profile; optional “Recent posts” on profile page. Helps E-E-A-T. |
| 7.4 | ☐ | Trust indicators | Clear trust elements (e.g. “Community guidelines”, “Verified professional”, secure connection) are present on feed/post pages. | **Optimization** | Footer or sidebar link to guidelines; HTTPS everywhere; optional trust badges in schema or visible UI. |
| 7.5 | ☐ | Structured author schema | Post JSON-LD includes `author` with `name`, `url` (profile), and optionally `image`. Enables bylines and author attribution in SERPs. | **Important** | In Article/SocialMediaPosting schema set `author` to Person or Organization with `url` pointing to profile page. |

---

## 8. Index Growth System

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 8.1 | ☐ | New posts auto-added to sitemap | When a post is published, it is included in the posts sitemap (or sitemap index is updated) without manual steps. | **Critical** | On publish event: append URL to sitemap or regenerate sitemap-posts.xml; update lastmod. Consider sitemap per 1k posts. |
| 8.2 | ☐ | Ping search engines on publish | After publishing a post (or batch), ping Google (and Bing) with sitemap URL or URL to fetch so discovery is fast. | **Important** | Call Google Indexing API (or ping `https://www.google.com/ping?sitemap=...`) and Bing equivalent on publish. |
| 8.3 | ☐ | RSS feed generated | An RSS (or Atom) feed for the social feed is available and linked from the site (e.g. `/indonesia/feed.rss`). Helps discovery and repeat crawls. | **Important** | Generate RSS with title, link, description, pubDate per post; link in `<head>` or footer. Update on new posts. |
| 8.4 | ☐ | Archive pages created | Time-based or category-based archive pages (e.g. “Posts from March 2025”, “Wellness tag”) exist and are linked so crawlers can reach older content. | **Optimization** | Create `/indonesia/archive/2025/03` and tag pages; link from footer or sitemap. Avoid orphaned content. |

---

## 9. Mobile SEO Optimization

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 9.1 | ☐ | Mobile-first rendering | Feed and post pages render the same primary content on mobile and desktop; no separate m.-subdomain that could split signals. | **Critical** | Use responsive design; same URL and HTML for mobile. Test with Mobile-Friendly Test and real devices. |
| 9.2 | ☐ | Touch-friendly UI | Buttons and links have sufficient touch targets (min ~48px) and spacing to avoid accidental taps and satisfy usability. | **Important** | Audit tap targets; increase padding or size for key actions. Avoid hover-only critical actions on mobile. |
| 9.3 | ☐ | Font readability | Base font size and line height are readable on small screens (e.g. 16px base, 1.5 line-height). No horizontal scroll for text. | **Important** | Use relative units; min font-size 16px for body; test on 320px width. |
| 9.4 | ☐ | Responsive media | Images and video scale with viewport; no overflow. Aspect ratios preserved to avoid CLS. | **Critical** | Use max-width: 100%, aspect-ratio or explicit dimensions; responsive images with srcset if needed. |
| 9.5 | ☐ | No intrusive interstitials | No full-screen popups or overlays that block main content on first load (per Google’s intrusive interstitial guidance). | **Important** | Avoid modal on load for cookie/login unless dismissible immediately. Banners are acceptable if they don’t cover main content. |

---

## 10. Advanced Ranking Features

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 10.1 | ☐ | Featured snippets eligibility | Post content is structured (short paragraphs, lists, clear H2/H3) so that key answers can be extracted as featured snippets. | **Optimization** | Use lists and concise paragraphs for tips/how-tos; one clear answer per section. Avoid only long walls of text. |
| 10.2 | ☐ | FAQ schema blocks | Where posts contain Q&A or FAQ-style content, output FAQPage JSON-LD with question/answer pairs. | **Important** | Detect Q&A pattern or allow author to mark FAQ; output FAQPage schema. Validate in Rich Results Test. |
| 10.3 | ☐ | HowTo schema | Step-by-step or tutorial posts include HowTo schema (name, step, image per step) for potential how-to rich results. | **Optimization** | For “how to” posts, add HowTo with steps; optional totalTime and supply/tool. Use for massage/wellness tutorials. |
| 10.4 | ☐ | Location schema | Post or author has `contentLocation` or Place in schema where relevant (e.g. “Bali”, “Jakarta”) to support local SEO. | **Important** | Add `contentLocation` (Place) to Article/SocialMediaPosting when post is location-specific; link to location pages. |
| 10.5 | ☐ | Review schema | Review or rating content (e.g. star ratings, testimonials) uses Review or AggregateRating schema for star rich results. | **Important** | For review-type posts output Review with author, datePublished, reviewRating; or AggregateRating for aggregate scores. |

---

## 11. Power Features — Enterprise SEO Boosters

*High-impact features that most platforms miss. Implement these to move into enterprise SEO architecture (marketplace/social class).*

### 11.1 Topical Cluster Engine (Very Powerful)

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 11.1.1 | ☐ | Every post auto-assigned topic + subtopic | System assigns a primary topic and optional subtopic to each post (e.g. “Massage” → “Back pain”, “Facial” → “Acne”). Enables hub structure and topical authority. | **Critical** | On publish: run classifier (keyword rules, ML, or taxonomy picker). Store `topic_id`, `subtopic_id` in post. Fallback to “General” if unclear. |
| 11.1.2 | ☐ | Auto-generated category hub pages | Topic/subtopic combinations get dedicated indexable hub pages with clean URLs. Google strongly rewards topical authority hubs. | **Critical** | Create routes e.g. `/massage/back-pain/`, `/massage/sports-recovery/`, `/facial/acne/`. Each hub lists posts + intro copy + links to services. Canonical per hub. |
| 11.1.3 | ☐ | Hub pages in sitemap and internal links | All topic/subtopic hub URLs are in the sitemap and linked from nav, footer, or related-posts so crawlers and users discover them. | **Important** | Add `sitemap-topics.xml` or include hub URLs in main sitemap. Link hubs from feed filters, post sidebar, and service pages. |

### 11.2 Auto-Generated Location Pages (Local SEO Domination)

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 11.2.1 | ☐ | Dynamic geo pages per city/region | Each served location (e.g. Jakarta, Bali, Surabaya) has a dedicated indexable page. Wellness/local intent gets a clear landing. | **Critical** | Routes like `/massage/jakarta`, `/massage/bali`, `/massage/surabaya`. Generate from DB of served cities; 404 or redirect for unsupported. |
| 11.2.2 | ☐ | Location page aggregates local posts | Page pulls in posts tagged or authored from that location (or with location in content). Fresh UGC reinforces local relevance. | **Critical** | Query posts by `contentLocation`, author city, or tag. Show latest N posts; link “View all” to filtered feed. Update on new local post. |
| 11.2.3 | ☐ | Location page lists local therapists + reviews | Same page (or clear sections) lists local therapists and local reviews. One URL becomes the local authority for “massage in [city]”. | **Important** | Integrate therapist/place data by location; show profiles + aggregate rating. Add LocalBusiness/Place schema. Link to therapist profiles. |
| 11.2.4 | ☐ | Location pages in sitemap and internal links | All location URLs in sitemap; linked from footer (cities), post locations, and search. | **Important** | `sitemap-locations.xml` or include in index. Footer “Cities we serve”; link location names in posts to these pages. |

### 11.3 Semantic Keyword Expansion Engine

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 11.3.1 | ☐ | Auto-detect keywords in post content | System extracts or infers keywords (treatments, conditions, products) from post text. Powers linking and tagging without manual work. | **Important** | Use entity extraction (NER), keyword list + match, or embeddings. Store `detected_keywords` or `entity_ids` on post. Run on publish or edit. |
| 11.3.2 | ☐ | Auto-link to related services | Detected service/treatment terms become internal links to relevant service pages (e.g. “Balinese massage” → `/balinese-massage`). Turns UGC into link equity. | **Critical** | Map keywords to service URLs; inject first occurrence (or first N) as links in rendered body. Avoid over-linking; use natural anchor. |
| 11.3.3 | ☐ | Suggest internal links (editor or auto-apply) | When author writes, suggest “Add link to: Deep Tissue Massage” or auto-apply approved links. Increases internal links without heavy manual effort. | **Optimization** | Editor plugin or post-process: suggest links for detected terms; author confirms or auto-apply from whitelist. Log for tuning. |
| 11.3.4 | ☐ | Semantic tags auto-applied | Inferred topics/keywords become tags (or semantic tags) attached to the post. Feeds topic hubs and related-post logic. | **Important** | Save detected keywords as tags; use for hub assignment and “Related posts”. Expose tag pages for indexable tag URLs. |

### 11.4 Freshness Signals (Ranking Multiplier)

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 11.4.1 | ☐ | Last updated timestamp on posts | Every post shows and marks “Last updated” (edit or last meaningful activity). Google uses freshness as a ranking factor. | **Important** | Store `updated_at`; update on edit or optionally on new comments. Display in UI and in schema `dateModified`. |
| 11.4.2 | ☐ | “Active discussion” indicator | Posts with recent comments show an “Active discussion” or “X comments recently” badge. Signals freshness and engagement. | **Optimization** | Compute “active” by comment count or last comment time; show badge in feed and on post. Optional: schema `commentCount` / recent activity. |
| 11.4.3 | ☐ | Trending posts widget | Home or feed has a “Trending” block (by engagement or velocity). Surfaces fresh, popular content and gives crawlers strong URLs. | **Important** | Rank by likes/shares/comments in last 24–72h; render 5–10 posts. Link to full post URLs. Cache short TTL. |
| 11.4.4 | ☐ | Weekly crawl ping or sitemap ping | Proactively notify search engines (e.g. weekly sitemap ping or Indexing API) so new/updated content is discovered quickly. | **Important** | Cron: ping `https://www.google.com/ping?sitemap=...` and Bing; or use Indexing API for high-value URLs. Log success/failure. |

### 11.5 Authority Graph Linking (Knowledge-Graph Style)

| # | Checkbox | Item | Explanation | Priority | Implementation notes |
|---|----------|------|-------------|----------|------------------------|
| 11.5.1 | ☐ | Entity model: users, services, posts, locations, reviews | Data model explicitly represents entities and relationships (post → author, post → service, post → location, review → place). Enables graph-style linking and schema. | **Critical** | DB: posts link to user_id, place_id, service_ids, location_id; reviews link to place/therapist. Normalize locations and services. |
| 11.5.2 | ☐ | Cross-entity links in UI and sitemap | Posts link to authors, services, locations; profiles link to posts and reviews; location pages link to therapists and posts. Dense internal graph. | **Critical** | Every entity type has an indexable URL. From each page, link to related entities (e.g. “More from this therapist”, “More in Bali”). |
| 11.5.3 | ☐ | Structured data reflects graph (author, place, service, location) | JSON-LD on post/profile/location pages includes references to related entities (sameAs, author, about, contentLocation). Google favors graph-like structure. | **Important** | Article has author (Person), about (Service), contentLocation (Place). Profile has sameAs, knowsAbout. Location has LocalBusiness + offers. |
| 11.5.4 | ☐ | Breadcrumb and sitelinks from graph | Breadcrumbs (and optional sitelinks) use entity hierarchy (e.g. Home > Bali > Massage > Post). Reinforces structure and can produce sitelinks in SERPs. | **Optimization** | Emit BreadcrumbList schema and visible breadcrumbs: Country > Location or Topic > Post. Keep depth 2–4. |

---

## Ultimate SEO Advantage Strategy

If the checklist above (sections 1–10) plus **Section 11 Power Features** are implemented fully, the platform becomes:

**A self-growing SEO engine powered by users.**

- **More posts** → more indexable URLs, more long-tail keywords, more topical hubs.
- **More users** → more author profiles, more geographic and service coverage.
- **More comments** → more fresh content, more engagement signals.

This is why community and marketplace platforms scale so fast in search: every contribution adds indexable, linkable, schema-ready content that reinforces topical and local authority.

**Final verdict:** The base checklist (sections 1–10) is already enterprise-level. With **Section 11 Power Features** implemented, IndaStreet moves into **enterprise SEO architecture** — the same class as large marketplace and social platforms.

---

## Priority legend

- **Critical:** Must-have for indexing, ranking, or policy; fix before or immediately after launch.
- **Important:** Strong impact on SEO or UX; plan for first 1–2 sprints.
- **Optimization:** Incremental gain; implement as roadmap allows.

---

## Quick reference — IndaStreet social SEO

- **Canonical base:** `https://indastreetmassage.com/indonesia` (and `/uk`) for social.
- **Post URL pattern:** Prefer `https://indastreetmassage.com/indonesia/post/{id}-{slug}`.
- **Topic hubs:** `https://indastreetmassage.com/massage/{subtopic}/`, `/facial/{subtopic}/` (e.g. `/massage/back-pain/`, `/massage/sports-recovery/`).
- **Location pages:** `https://indastreetmassage.com/massage/{city}` (e.g. `/massage/jakarta`, `/massage/bali`, `/massage/surabaya`).
- **Sitemaps:** Include `/indonesia`, `/indonesia/post/*`, topic hubs, location pages, tag/archive URLs.
- **Schema:** Article or SocialMediaPosting per post; Person/Organization for author; Review/FAQ/HowTo; LocalBusiness/Place on location pages.
- **Backlinks:** All post links to main domain (indastreetmassage.com) to consolidate authority.
- **Authority graph:** Link posts ↔ authors, services, locations, reviews so the site forms a clear entity graph for Google.

---

*Checklist version: 1.1 — IndaStreet Massage Social Feed SEO Audit + Power Features. Use with GSC, PageSpeed Insights, and Rich Results Test for validation.*
