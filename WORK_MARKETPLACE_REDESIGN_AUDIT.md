# Work Marketplace Redesign – Codebase Audit

**Status:** ✅ READ COMPLETE – Ready for implementation  
**Date:** Feb 10, 2025  
**Scope:** Job Marketplace (Employers & Service Professionals)

---

## 1. EXISTING FILES – WHAT EXISTS

### 1.1 Main Marketplace Pages

| File | Route(s) | Purpose |
|------|----------|---------|
| `src/pages/MassageJobsPage.tsx` | `massage-jobs`, `massageJobs` | **Primary marketplace.** Two tabs: "Jobs for Offer" (employer postings) and "Therapist Seeking Jobs". Uses Appwrite `employer_job_postings` and `therapist_job_listings`. |
| `src/pages/BrowseJobsPage.tsx` | `browse-jobs`, `browseJobs` | Alternative marketplace. Toggle: "jobOffers" / "jobWanted". Has therapist submission form + payment flow (150,000 IDR). Uses `payment_transactions` for pending payments. |

**Entry points:** App drawer links to `massage-jobs`. `browse-jobs` is a separate route.

### 1.2 Employer & Therapist Flow

| File | Purpose |
|------|---------|
| `src/pages/EmployerJobPostingPage.tsx` | Full form for employers to post jobs. Submits to `employer_job_postings`. Calls `onNavigateToPayment(jobId)` after submit → goes to `JobPostingPaymentPage`. |
| `src/pages/JobPostingPaymentPage.tsx` | Employer job payment. Plans: **200,000 IDR** (3‑month standard), **500,000 IDR** (premium). Bank: BCA, IndaStreet Platform. Job **goes live immediately**; admin verifies via WhatsApp. |
| `src/pages/TherapistJobRegistrationPage.tsx` | Therapist availability form. Writes to `therapist_job_listings`. |
| `src/pages/TherapistJobOpportunitiesPage.tsx` | Therapist dashboard "Job Opportunities" tab. |

### 1.3 Appwrite Collections

| Collection | File reference | Usage |
|------------|----------------|-------|
| `employer_job_postings` | `APPWRITE_CONFIG.collections.employerJobPostings` | Employer job listings |
| `therapist_job_listings` | `APPWRITE_CONFIG.collections.therapistJobListings` | Therapist availability listings |
| `payment_transactions` | `APPWRITE_CONFIG.collections.paymentTransactions` | Payment records (BrowseJobs, etc.) |

See `docs/APPWRITE_COLLECTIONS_SCHEMA.md` for full schema.

---

## 2. PAYMENT & FEES – CURRENT vs REQUIRED

| Listing Type | Current | Required (per prompt) |
|--------------|---------|------------------------|
| **Therapist availability** | 150,000 IDR (BrowseJobs) | 150,000 IDR |
| **Employer job posting** | 200,000 / 500,000 IDR (JobPostingPaymentPage) | 250,000 IDR |

**Flow in place (Employer):** Submit → payment page → bank details → WhatsApp proof → listing live, admin verifies.  
**Flow in place (Therapist – BrowseJobs):** Form submit → payment record → 3h countdown → upload proof → listing live.

**Prompt requirement:** Listings go live immediately (status: pending verification). Do NOT block from going live.

---

## 3. HOME PAGE COLOR THEME (MATCH THIS)

**Tailwind config:** `tailwind.config.js`  
- Primary: `primary-50` → `primary-900` (orange scale = `#fff7ed` → `#7c2d12`)
- Accent: `orange-500` (#f97316), `orange-600` (#ea580c)

**HowItWorksPage reference (premium feel):**
```ts
const stepIconGradient = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
const glassCardClass = 'rounded-[20px] shadow-lg border border-white/20 bg-white/90 backdrop-blur-[12px] hover:shadow-xl hover:scale-[1.03] transition-all duration-300';
```

**MassageJobsPage / HomePage:**
- `text-orange-500`, `text-orange-600`, `bg-orange-600`, `border-orange-200`
- Buttons: `bg-orange-600 hover:bg-orange-700`
- Header: `Inda` (black) + `Street` (orange-500)

---

## 4. CARD DESIGN – WHAT EXISTS vs REQUIRED

### 4.1 Employer Job Card (MassageJobsPage)

**Current:** Full-width image, business name, business type, location, salary range, benefits, massage types, Apply/Unlock button.  
**Missing (per prompt):** Logo, position title, job type badge, top-corner tags (NEW / VERIFIED / URGENT), "Posted time", cleaner card shape (18–22px radius, soft shadow).

### 4.2 Therapist Card (MassageJobsPage)

**Current:** Profile image, name, job title, experience level, personal info, massage skills, work history, salary, locations, availability, Contact button.  
**Missing (per prompt):** Verification badge, specialties (max 3 tags), short intro (2 lines), "View Profile" + "Contact", status badge top-right (Verified / Pending / Featured), cleaner card.

---

## 5. FILTERS – CURRENT vs REQUIRED

**Employer browsing therapists (Find Professionals):**
- Required: Location, Experience level, Verified only, Massage type, Availability  
- Current MassageJobsPage: No filters on therapist tab (only search in BrowseJobs).

**Therapist browsing jobs (Post a Job / job listings):**
- Required: Location, Job type, Salary range, Verified employers only  
- Current: `selectedType`, `selectedLocation` exist but are effectively unused; no salary/verified filters.

---

## 6. STRUCTURE REQUIRED (per prompt)

| Section | Description |
|---------|-------------|
| **Tab 1: "Find Professionals"** | Employers browse therapists looking for work |
| **Tab 2: "Post a Job"** | Employers post staff requirement |
| **Toggle/Section: "Therapists Looking for Work"** | Therapists pay to list availability |

**Current MassageJobsPage:** Tab 1 = Jobs for Offer, Tab 2 = Therapist Seeking Jobs. Different order/labels.  
**Prompt wants:** Find Professionals first, then Post a Job, plus Therapists Looking for Work (as section or toggle).

---

## 7. DO NOT MODIFY

- Booking logic
- Appwrite core auth
- Payment logic that already works (JobPostingPaymentPage, BrowseJobs payment flow)
- Dashboard routes
- `employer_job_postings` / `therapist_job_listings` schema (unless you explicitly extend)

**If another file must be modified → ASK FIRST.**

---

## 8. ADMIN VERIFICATION (UI ONLY)

- Add text under listing: "Live – Pending Admin Verification"  
- After admin confirmation: badge → "Verified Listing"  
- Do NOT build backend verification unless a file already exists.  
- If verification needs backend changes → ASK FIRST.

---

## 9. EMPTY STATES

**Required:**  
> "Be the first to post in this area." + CTA button

**Current:** MassageJobsPage has generic "No job postings found" / "No Therapist Profiles Yet" with CTAs. Adjust copy to match.

---

## 10. HEADER COPY (per prompt)

```
Work Marketplace
"Connecting Wellness Businesses with Qualified Professionals."

Subtext:
"Post opportunities or showcase your availability in a structured, professional environment designed for the global massage and skin care industry."
```

---

## 11. RECOMMENDED APPROACH

1. **Single source of truth:** Use `MassageJobsPage.tsx` as the main Work Marketplace page (it is already the primary entry from the drawer).
2. **Tabs:** Redefine as:
   - Tab 1: **Find Professionals** (employers browse therapists)
   - Tab 2: **Post a Job** (employer job listings) + CTA to EmployerJobPostingPage
   - Section/Toggle: **Therapists Looking for Work** (therapist listings) + CTA to TherapistJobRegistrationPage or BrowseJobs submission
3. **Cards:** Refactor employer and therapist cards to match the premium spec (18–22px radius, subtle shadow, badges, View Profile/Contact/Apply).
4. **Filters:** Add sidebar/dropdown filters as specified; collapse to dropdown on mobile.
5. **Fees:** Keep therapist 150k. For employer, either:
   - Add a 250k option to JobPostingPaymentPage, or
   - Ask before changing existing 200k/500k structure.
6. **Verification UI:** Add "Live – Pending Admin Verification" / "Verified Listing" badges without backend changes.
7. **Colors:** Use `primary-*`, `orange-*`, `glassCardClass`, `stepIconGradient` from HowItWorksPage for consistency.

---

## 12. FILES TO TOUCH (when implementing)

| File | Changes |
|------|---------|
| `src/pages/MassageJobsPage.tsx` | Main redesign: tabs, header, cards, filters, empty states |
| `src/pages/BrowseJobsPage.tsx` | Possibly merge or redirect to MassageJobsPage; or keep as alternate flow |
| `src/pages/EmployerJobPostingPage.tsx` | Only if fee changes or navigation changes |
| `src/pages/JobPostingPaymentPage.tsx` | Only if adding 250k plan or changing flow |
| `src/translations/jobs.ts` | New copy for Work Marketplace, tabs, filters |

---

## 13. ROUTING & NAVIGATION

- `massage-jobs` → MassageJobsPage (primary)
- `browse-jobs` → BrowseJobsPage (alternate)
- `employer-job-posting` → EmployerJobPostingPage
- `job-posting-payment` → JobPostingPaymentPage (takes `jobId` prop)
- `therapist-job-registration` → TherapistJobRegistrationPage

All wired in `AppRouter.tsx` and `src/hooks/useURLRouting.ts`.

---

*End of audit. Proceed with implementation only after confirming approach and any fee/structure changes.*
