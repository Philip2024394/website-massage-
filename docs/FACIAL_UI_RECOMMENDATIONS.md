# Facial / Skin Clinic UI Recommendations

**Perspective:** Experienced facial therapist + customer. Goal: highly professional, trust-building, conversion-focused experience.

---

## 1. Facial home page – therapist/clinic card

### Current state (brief)
- Card mirrors massage therapist layout: main image, overlapping profile circle (same image), star rating, orders badge, location, treatments/languages, 60/90/120 price boxes, “View profile”.
- Badges: “Beauty Portal”, “Facial • Skin clinic”, “Facial treatment massage & skin care”.

### Recommended changes (card)

| Area | Suggestion | Rationale |
|------|------------|-----------|
| **Visual identity** | Use a **clinic logo** in the overlap circle when available (dashboard field), fallback to main image. Differentiates “clinic brand” from “hero photo”. | Customers and therapists expect skin clinics to have a brand; logo builds recognition. |
| **Specialty at a glance** | Add a **short specialty line** under the name, e.g. “Anti-aging & hydrating facials” or “Acne & brightening”. From dashboard: `tagline` or `specialty` (max ~40 chars). | Reduces need to open profile to see if the clinic fits their concern. |
| **Social proof** | Keep “X+ treatments” but consider **“X+ clients”** or **“X reviews”** as primary/secondary. Option to show a **mini review snippet** (e.g. one line) on the card. | “Treatments” is vague; “clients”/“reviews” and a quote build trust. |
| **Price clarity** | Keep 60/90/120 but add **“From IDR XXX”** (cheapest) near the main CTA so “starting price” is visible without reading three boxes. | Common pattern on booking sites; reduces hesitation. |
| **Trust on card** | Small **“Verified clinic”** or **“Licensed”** pill (when verified/license data exists). | Skin treatments are sensitive; trust signals matter more than for massage. |
| **CTA wording** | Change “View profile” to **“See clinic & book”** or **“View clinic”** so intent is clearly “see more and book”. | Aligns with user goal and improves CTR. |
| **Layout** | Optional: **slightly larger main image** and **one clear primary CTA** (e.g. “See clinic & book”) with a secondary “Share”. Keep layout simple; avoid crowding. | Clean, premium feel; mobile-first. |

### Layout / list design (facial home)

- **Filter/sort:** “Sort by: Rating | Distance | Price” and optional “Verified only” so serious customers can narrow down.
- **Section title:** e.g. “Skin clinics near you” or “Facial & skin care” with a short subtitle: “Verified clinics • Book via WhatsApp”.
- **Card density:** Enough spacing between cards so each clinic feels like a distinct choice; avoid a cramped “massage list” look.
- **Empty state:** If no clinics in area: “No clinics in [city] yet. Check back or try another area.” + clear city/area selector.

---

## 2. Profile page (after “View profile”) – skin clinic

### Overall principle
The profile should answer: **Is this clinic legitimate? What do they do? What does it cost? How do I book?**  
Structure and content should feel like a **clinic website**, not a generic listing.

### Recommended structure and content

#### 2.1 Hero and identity
- **Hero:** One strong hero image (or short slider). Optional gradient overlay so name/rating stay readable.
- **Below hero:** Clinic name, **tagline/specialty** (e.g. “Professional anti-aging & hydrating facials”), rating + review count, **Verified clinic** badge if applicable.
- **No** duplicate large circular “profile” image if it’s the same as hero; if used, make it a **clinic logo** and smaller.

#### 2.2 Trust and credentials (high priority for skin)
- **Dedicated “About the clinic” block:** Short paragraph (from dashboard). Tone: professional, hygiene and safety mentioned.
- **Licenses / certifications:** Section “Licenses & certifications” with **photos of certificates** (you already have `licenseCertImages`-style data in `FacialClinicProfilePage`). Show 2–5 items with thumbnails; click to enlarge.
- **Hygiene / safety:** Short bullet list, e.g. “Single-use disposables where applicable”, “Sterilised equipment”, “Patch test available for first-time treatments”. From dashboard or sensible defaults.
- **Years in business** (if available): e.g. “Serving clients since 20XX”.

#### 2.3 Treatments and services
- **“Facial treatment types”** (or “Our treatments”): List from `facialTypes` with clear names. Optional: **short description per treatment** (1 line) and **from–price** (e.g. “From IDR 350K”).
- **“Other services”:** e.g. Consultation, skin analysis, aftercare, body treatments. Keep as tags or a short list.
- **Pricing:** Keep 60/90/120 if that’s the model. Add **“All prices in IDR”** and **“Price may vary by treatment; confirm when booking.”** Option: **treatment-specific prices** in a table (treatment name | 60 min | 90 min | 120 min) for power users.

#### 2.4 Gallery and environment
- **“Clinic gallery”:** Photos of space, treatment room, maybe one “ambiance” shot. Each with optional caption (e.g. “Treatment room”, “Reception”). Lightbox on tap.
- **Before/after:** If the clinic provides B/A (with consent), a **separate “Results” section** with clear disclaimer. Many skin clients look for this.

#### 2.5 Location, hours, contact
- **Address:** Full address with **“Open in Maps”** link.
- **Opening hours:** Clear list (e.g. Mon–Fri 10:00–20:00, Sat 10:00–18:00). Use `operatingHours` or structured fields.
- **Contact:** WhatsApp (primary), phone, email if available. **One-tap WhatsApp** with prefill: “Hi, I’d like to book a treatment at [Clinic name]. I’m interested in [e.g. facial / skin consultation].”

#### 2.6 Booking and CTAs
- **Sticky bottom bar:** Keep **WhatsApp** + **Book now** (or “Inquire”). Same as now; ensure labels are clear (e.g. “Chat on WhatsApp”, “Book / Inquire”).
- **Above the fold:** One clear primary CTA (e.g. “Book or inquire via WhatsApp”) so users don’t have to scroll to act.
- **Schedule / deposit:** If you support scheduled bookings and deposit, show a short line: “You can schedule and pay a deposit for your visit.”

#### 2.7 Reviews (if/when you have them)
- **Reviews section:** Rating summary (e.g. 4.8 from 24 reviews) + **3–5 short reviews** with name (or “Anonymous”), date, and 1–2 lines. “Read more” can open full list or modal.
- **Response from clinic:** If clinic can reply to reviews, show it; builds professionalism.

#### 2.8 Legal and policies (skin-specific)
- **Cancellation policy:** e.g. “Cancel or reschedule at least X hours in advance.”
- **Patch test:** “First-time colour or chemical treatments: patch test recommended.”
- **Disclaimer:** Short line that results may vary and treatments are subject to consultation.

### Profile page layout order (suggested)

1. Hero + name, tagline, rating, verified.
2. Primary CTA (WhatsApp / Book).
3. About the clinic (short intro).
4. Licenses & certifications (with images).
5. Facial treatment types (+ optional descriptions/prices).
6. Other services.
7. Treatment pricing (60/90/120 or table).
8. Clinic gallery.
9. (Optional) Before/after (with disclaimer).
10. Location + map link, opening hours, contact.
11. Reviews (if available).
12. Policies (cancellation, patch test, disclaimer).
13. Sticky bottom: WhatsApp + Book now.

### UI polish (profile)
- **Typography:** Clear hierarchy (one H1, consistent H2 for sections). Slightly softer, “spa/clinic” feel (e.g. clean sans-serif).
- **Colours:** Keep orange as primary CTA; use neutral (slate/gray) for text and cards so the page doesn’t feel “massage-only”.
- **Spacing:** Generous padding and section spacing so the profile doesn’t feel cramped.
- **Images:** Rounded corners, consistent aspect ratios; certificates in a simple grid that opens in lightbox.

---

## 3. Data and dashboard (for clinics)

To support the above, clinics need to provide (via dashboard or backend):

- **Tagline / specialty** (short line).
- **Clinic logo** (for card and profile).
- **About the clinic** (rich text or paragraph).
- **License/certification images** (2–5) with optional title/caption.
- **Hygiene/safety** bullets (checkboxes or short list).
- **Per-treatment descriptions** (optional) and **per-treatment or tiered pricing** (optional).
- **Operating hours** (structured).
- **Cancellation policy** (text or template).

---

## 4. Summary

| Where | Focus |
|-------|--------|
| **Home card** | Logo in circle, specialty line, “From IDR XXX”, verified pill, “See clinic & book”, clear spacing. |
| **Profile** | Trust first (about, licenses, hygiene), then treatments and pricing, gallery, location/hours/contact, then policies. One clear primary CTA + sticky WhatsApp/Book. |
| **Tone** | Professional, clean, safety-aware; differentiate from generic massage listing. |

These changes position the facial flow as a **skin clinic** experience that both therapists and customers will perceive as professional and trustworthy.
