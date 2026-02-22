# Indonesia SEO Dataset — Geo Keywords & Content Pool

**Purpose:** Primary geo keywords and 100 SEO topics for the auto-post engine. Use **Topic + City + Service = Post** to generate thousands of unique, indexable pages.

**Code:** `src/data/indonesiaSeoDataset.ts`

---

## Geo Keywords (Target Locations)

### Tier 1 — Highest search volume

Jakarta, Surabaya, Bandung, Medan, Bekasi, Tangerang, Depok, Semarang, Palembang, Makassar.

### Tier 2 — High demand service cities

Denpasar, Malang, Yogyakarta, Bogor, Batam, Pekanbaru, Bandar Lampung, Padang, Balikpapan, Pontianak.

### Tier 3 — Fast growing

Samarinda, Banjarmasin, Manado, Kupang, Jayapura, Mataram, Cirebon, Tasikmalaya, Serang, Jambi.

### Tier 4 — Local SEO expansion

Kediri, Blitar, Probolinggo, Pasuruan, Tegal, Magelang, Salatiga, Binjai, Langsa, Palu.

**Usage:** Prefer Tier 1 more often in autoposter; use `SEO_CITIES_BY_TIER` or `SEO_CITIES_ALL` from the dataset.

---

## 100 SEO Topics (Content Pool)

| Category        | Count | Use for                          |
|-----------------|-------|-----------------------------------|
| **Massage**     | 20    | Tips, benefits, myths, comparison |
| **Beauty/Facial** | 20  | Facials, skin, anti-aging         |
| **Spa**         | 10    | Spa therapy, relaxation           |
| **Home service**| 10    | Home massage, mobile therapist    |
| **Authority**   | 10    | Educational, safety, how to choose|
| **Engagement**  | 10    | Questions, polls                  |
| **Conversion**  | 10    | Why invest, quality, long-term    |
| **Trending**    | 10    | Trends, viral-style               |

**Exports:** `SEO_TOPICS_BY_CATEGORY`, `SEO_TOPICS_ALL`, `SEO_TOPIC_COUNTS`. Rotate category (never same twice in a row) per [ELITE-AUTO-POST-SYSTEM-SPEC.md](./ELITE-AUTO-POST-SYSTEM-SPEC.md).

---

## How to use

**Autoposter formula:**

```
postTitle = `${topic} in ${city}`  // e.g. "Benefits of deep tissue massage in Bandung"
```

Or combine with a service type:

```
postTitle = `${topic} for ${audience} in ${city}`  // e.g. "Massage for office workers in Surabaya"
```

**Example combinations:**

- *Benefits of deep tissue massage in Bandung*
- *Facial benefits for skin health in Jakarta*
- *Home massage vs spa massage in Denpasar*
- *Wellness trends in Indonesia* (topic already includes “Indonesia”; can omit city or use “Indonesia” as location)

This dataset is ready to plug into the automation engine.

---

**Related:** [ELITE-AUTO-POST-SYSTEM-SPEC.md](./ELITE-AUTO-POST-SYSTEM-SPEC.md) §10 (Content source generator).
