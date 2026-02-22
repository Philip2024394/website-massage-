# Auto-Post Scheduler — Activation Guide

The content engine (generator, publisher, datasets, rules) is complete. To go live you need **one timed process** that runs the system daily.

---

## Final component: scheduler runner

You must run two things on a schedule:

| What | When | Command |
|------|------|--------|
| **Daily planner** | Once per day (e.g. 00:01) | Creates today's jobs in `AUTO_POST_JOBS` |
| **Runner** | Every 15 minutes | Processes due jobs (generate + publish) |

### Option A — Server cron (simplest)

On your server, add to crontab (`crontab -e`):

```cron
# Daily: create today's posts (once at 00:01)
1 0 * * * cd /path/to/website-massage && node scripts/run-daily-auto-posts.mjs

# Runner: process due jobs every 15 minutes
*/15 * * * * cd /path/to/website-massage && node scripts/run-auto-post-runner.mjs
```

Or use pnpm (ensure cron has correct PATH for pnpm/tsx):

```cron
1 0 * * * cd /path/to/website-massage && pnpm run auto-post:daily
*/15 * * * * cd /path/to/website-massage && pnpm run auto-post:runner
```

**Entry scripts (cron-friendly, Node-only):**

- `node scripts/run-daily-auto-posts.mjs` → runs daily planner
- `node scripts/run-auto-post-runner.mjs` → runs runner  
- Or: `pnpm run run-daily-global-posts` / `pnpm run run-auto-post-runner`

### Option B — Serverless scheduler

Trigger the same logic on a schedule:

- **Vercel:** Cron in `vercel.json` or serverless function that runs at 00:01 and calls your API / invokes the daily script in a build step.
- **Netlify:** Scheduled functions or build hook called by external cron (e.g. cron-job.org).
- **Cloudflare Workers:** Cron trigger (e.g. `0 0 * * *`) that calls an endpoint which runs the daily job; runner can be another cron or a separate worker.
- **AWS EventBridge:** Rule with schedule `cron(1 0 * * * ? *)` targeting Lambda that runs the daily script; second rule every 15 min for runner.

Ensure the runtime has `APPWRITE_ENDPOINT`, `APPWRITE_PROJECT_ID`, `APPWRITE_API_KEY`, `APPWRITE_DATABASE_ID` and can run `tsx` (or pre-compile and run with Node).

### Option C — Worker queue (best for scale)

Flow: **Daily planner** (once/day) → **Queue** → **Workers** → **Publisher**.

- One scheduled job (cron or serverless) runs the daily planner and pushes each due “slot” or job ID to a queue (e.g. SQS, Bull, Inngest).
- Workers pull from the queue and run the same logic as `scripts/auto-post-runner.ts` (generate + publish).
- Scales when you add many countries or high volume.

---

## Safe activation order (do this exactly)

| Phase | Duration | Countries | Posts/day | Goal |
|-------|----------|-----------|-----------|------|
| **Phase 1 — Soft launch** | 7–14 days | Indonesia only | 2/day | Let Google crawl pages, build domain trust, test logs |
| **Phase 2 — Expansion** | After Phase 1 | Add UK | 3/day | Ramp volume for two regions |
| **Phase 3 — Scale** | After Phase 2 | Add Middle East | 3–5/day | Full rollout |

**How to set posts/day:** use env vars (no code change):

```bash
# Phase 1 (7–14 days): 2 posts per day
export AUTO_POST_MIN_PER_DAY=2
export AUTO_POST_MAX_PER_DAY=2

# Phase 2: 3 posts per day
export AUTO_POST_MIN_PER_DAY=3
export AUTO_POST_MAX_PER_DAY=3

# Phase 3: default (3–5)
unset AUTO_POST_MIN_PER_DAY AUTO_POST_MAX_PER_DAY
```

Set these in your cron environment, serverless config, or `.env` when running the daily script.

**Current code:** The daily script is **Indonesia-focused** first. When adding UK and Middle East, extend the daily planner to use the global content engine for the active countries (or run a separate daily job per country).

---

## Monitoring signals (watch daily)

| Metric | What to watch |
|--------|----------------|
| **Sitemap indexed pages** | Growth in GSC “Sitemaps” / indexed URLs |
| **Impressions** | Search Console impressions trend |
| **Crawl frequency** | How often Google hits the site |
| **Post indexing speed** | Time from publish to “URL is on Google” |
| **Server load** | CPU/memory during runner and sitemap generation |

If indexing and impressions rise steadily → system healthy. If crawl drops or errors spike → pause or reduce posts/day and check logs.

---

## Safety check (runner failure guard)

The runner script includes a **failure guard** so one bad publish does not block the queue:

- If **publish** fails: **retry up to 3 times** (with a short delay between attempts).
- After 3 failures: **log error**, mark the job as `failed`, and **skip** (continue to the next job).

So the queue never blocks on a single failing job; you can inspect failed jobs in `AUTO_POST_JOBS` and fix or retry manually.

---

## System readiness

| Layer | Status |
|-------|--------|
| Architecture | Complete |
| Content engine | Complete |
| Localization | Complete |
| SEO logic | Complete |
| Publishing | Complete |
| **Scheduler** | **Add cron/serverless/worker above** |

**Overall:** Ready to go live once the scheduler runner is active (Option A, B, or C).

---

## Quick reference

- **Daily planner (once/day):** `node scripts/run-daily-auto-posts.mjs` or `pnpm run run-daily-global-posts` or `pnpm run auto-post:daily`
- **Runner (every 15 min):** `node scripts/run-auto-post-runner.mjs` or `pnpm run run-auto-post-runner` or `pnpm run auto-post:runner`
- **Safe launch (2 posts/day):** `AUTO_POST_MIN_PER_DAY=2 AUTO_POST_MAX_PER_DAY=2` when running the daily script
