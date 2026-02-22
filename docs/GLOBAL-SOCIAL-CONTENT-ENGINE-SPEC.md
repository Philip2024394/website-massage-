# Global Social Media Content Engine — Specification

**System role:** Global social media content engine for a wellness & beauty platform.  
**Mission:** Generate daily posts automatically for each country feed.

---

## Global Rules

| # | Rule |
|---|------|
| 1 | Generate **3–5 posts per country per day**. |
| 2 | Each country’s posts MUST be written in that country’s **primary language**. |
| 3 | Topics must **never repeat** within the same country for **30 days**. |
| 4 | Topics must be **different across countries** on the same day. |
| 5 | Posts must sound **human-written, natural, and localized**. |
| 6 | Content must be **SEO-optimized** for that country’s Google search engine. |
| 7 | Include **city-level keywords** from that country. |
| 8 | **Tone** must match local culture and communication style. |
| 9 | Each post must provide **real value** (tip, guide, advice, trend, or benefit). |
| 10 | **No spam wording, no keyword stuffing.** |

---

## Post Structure (JSON Output)

Every generated post must return this object:

```json
{
  "country": "Indonesia",
  "language": "Bahasa Indonesia",
  "city": "Bandung",
  "topic": "Deep Tissue Benefits",
  "title": "Manfaat Deep Tissue Massage di Bandung",
  "caption": "...",
  "hashtags": ["#massagebandung", "#spabandung"],
  "seoKeywords": ["massage bandung", "pijat bandung", "spa bandung"],
  "slug": "deep-tissue-massage-bandung"
}
```

| Field | Description |
|-------|-------------|
| `country` | Country name (e.g. Indonesia, UK). |
| `language` | Primary language for that country (e.g. Bahasa Indonesia, English). |
| `city` | City from that country’s dataset; must appear in title + caption. |
| `topic` | Topic or theme (e.g. Deep Tissue Benefits). |
| `title` | Post title; **50–70 characters**. |
| `caption` | Post body/caption; **120–220 words**. |
| `hashtags` | **5–10 localized** hashtags. |
| `seoKeywords` | Array of SEO phrases (city + service, long-tail). |
| `slug` | URL-safe slug (e.g. for `/post/:slug`). |

---

## Content Rules

- **Title length:** 50–70 characters.
- **Caption length:** 120–220 words.
- **Hashtags:** 5–10, localized.
- **Service keyword:** Each post must include exactly one of:  
  `massage` | `spa` | `facial` | `beauty` | `home service`.

---

## Localization Rules

| Country | Language | Tone | Notes |
|---------|----------|------|--------|
| **Indonesia** | Bahasa Indonesia | Friendly, helpful | Use Indonesian search phrases. |
| **UK** | English | Professional, informative | British spelling and phrasing. |
| **Middle East** | Arabic or English (configurable) | Formal, culturally respectful | Avoid assumptions; respectful wording. |

---

## Variety Engine

Use **rotating categories**; never repeat the same category twice in a row for that country.

| Category | Description |
|----------|-------------|
| education | How-to, explainers. |
| tips | Practical tips. |
| benefits | Benefits of a treatment or habit. |
| myths | Myth-busting. |
| comparisons | A vs B. |
| trends | Current trends. |
| local recommendations | “Best in [city]”. |
| questions | Engagement-style questions. |

---

## City Logic

- Pick a **random city** from that country’s dataset.
- City **must appear** in both title and caption.

---

## Uniqueness Filter

Before generating a post:

1. Check the **last 100 posts** for that country.
2. If **topic similarity > 40%** with any of them → **regenerate** (pick new topic/city/category).

Similarity can be based on: same topic string, same category + city, or a simple text overlap threshold.

---

## SEO Optimization

Each post must include:

- **City keyword** (in title and caption).
- **Service keyword** (one of: massage, spa, facial, beauty, home service).
- At least one **long-tail search phrase** (e.g. “pijat deep tissue di Bandung”).

---

## Example Output

```json
{
  "country": "Indonesia",
  "language": "Bahasa Indonesia",
  "city": "Bandung",
  "topic": "Deep Tissue Benefits",
  "title": "Manfaat Deep Tissue Massage di Bandung",
  "caption": "Deep tissue massage di Bandung semakin populer untuk mengatasi nyeri otot dan stres. Banyak klien yang merasakan perbaikan sirkulasi dan postur setelah sesi rutin. Pilih terapis yang bersertifikasi dan komunikasikan area yang perlu difokuskan. Di Bandung tersedia layanan pijat ke rumah maupun di spa. IndaStreet menghubungkan Anda dengan terapis terverifikasi di Bandung.",
  "hashtags": ["#massagebandung", "#spabandung", "#pijatbandung", "#deep tissue", "#wellnessbandung"],
  "seoKeywords": ["massage bandung", "pijat bandung", "spa bandung", "deep tissue bandung"],
  "slug": "deep-tissue-massage-bandung"
}
```

---

## Integration

- The **scheduler** can create jobs per country (3–5 per country per day).
- The **content generator** uses this spec to produce the JSON payload.
- The **publisher** maps `caption` → body, `title` → title, `seoKeywords` → meta/keywords, and stores `country` / `language` for feed filtering.
- **Uniqueness:** Runner or generator checks last 100 posts for that country and skips or regenerates when similarity > 40%.

**Implementation:**

- **Config:** `src/data/globalContentEngineConfig.ts` (country configs, variety categories, service keywords, cities per country).
- **Generator:** `src/lib/autoPost/globalContentGenerator.ts` — `generateGlobalPostPayload()`, `isTopicTooSimilar()`, `getNextVarietyCategory()`, `pickServiceKeyword()`, `globalPayloadToPublishInput()`.
- **Publishing:** Use `globalPayloadToPublishInput(payload, { authorId, originCountry })` and pass the result to `publishPost()` so global posts write to the same SEO_POSTS collection with country/language preserved.

**Related:** [ELITE-AUTO-POST-SYSTEM-SPEC.md](./ELITE-AUTO-POST-SYSTEM-SPEC.md), [AUTO-POST-REMAINING-BUILD-SPEC.md](./AUTO-POST-REMAINING-BUILD-SPEC.md).
