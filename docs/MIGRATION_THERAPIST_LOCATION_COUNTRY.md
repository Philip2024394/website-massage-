# Secure Therapist Migration (locationId & country)

Production-safe, one-time migration to normalize therapist `locationId` and `country` in Appwrite so the directory shows results when users filter by city.

---

## File structure overview

```
project root/
├── .env.migration          # Migration env (never commit real API key). In .gitignore.
├── .env                    # Optional override; can hold APPWRITE_API_KEY only.
├── scripts/
│   └── migrate-therapist-location-country.mjs
├── docs/
│   └── MIGRATION_THERAPIST_LOCATION_COUNTRY.md  # This file
└── package.json            # Scripts: migrate:therapist-location, migrate:therapist-location:apply
```

---

## 1. `.env.migration` (project root)

This file **must** exist and contain these variables (values from your Appwrite project):

| Variable | Description |
|----------|-------------|
| `APPWRITE_ENDPOINT` | Appwrite API endpoint (e.g. `https://xxx.cloud.appwrite.io/v1`) |
| `APPWRITE_PROJECT_ID` | Your project ID |
| `DATABASE_ID` | Database ID that contains the Therapists collection |
| `THERAPISTS_COLLECTION_ID` | Therapists collection ID |
| `APPWRITE_API_KEY` | **Leave empty by default.** Set once with your dev key (see below). |

**Important:**

- **Leave `APPWRITE_API_KEY=` empty** in the committed/template version.
- This file **must** be in **`.gitignore`** so it is never committed with real keys.
- Never commit real API keys. Use a secret manager or local-only env for production.

---

## 2. Environment loading (how it works)

The migration script loads env in this order:

1. **`.env.migration`** is loaded first (project root).
2. **`.env`** is loaded second. Any variable present in `.env` **overrides** the same variable from `.env.migration`.

So:

- You can put **all** migration variables in `.env.migration` and only add the API key there, or
- You can keep app vars (endpoint, project, database, collection) in `.env` and add **only** `APPWRITE_API_KEY` to `.env`; the script will use the overrides from `.env`.

The script **never logs or prints** API keys or full env contents. It only logs mode, endpoint, project ID, database ID, and collection ID.

---

## 3. API key: add once (two options)

After revoking any previously exposed key, create a **new** Appwrite API key:

1. Appwrite Console → your project → **API Keys** → Create API Key.
2. Name it (e.g. "Migration" or "Dev").
3. Scopes: **`databases.read`**, **`databases.write`** (or full access).
4. Copy the **secret** once (it is shown only once).

Then set it **in one place only**:

**Option A – Add to `.env`**

- In project root, open (or create) **`.env`**.
- Add or set:
  ```bash
  APPWRITE_API_KEY=paste_your_new_dev_key_secret_here
  ```
- If your app already uses `.env` for `VITE_APPWRITE_*`, the script will also use those for endpoint/project/database/collection if you did not set them in `.env.migration`. You only need to add this one line.

**Option B – Add to `.env.migration`**

- Open **`.env.migration`** in project root.
- Set:
  ```bash
  APPWRITE_API_KEY=paste_your_new_dev_key_secret_here
  ```
- Ensure the other variables in `.env.migration` are filled (endpoint, project ID, database ID, therapists collection ID) from your Appwrite Console.

**Only the API key needs to be added once.** Other vars may already be in `.env` (Option A) or you fill them in `.env.migration` (Option B).

---

## 4. Security warning

- **Never** commit `.env` or `.env.migration` with real keys. Both are in `.gitignore`.
- **Never** log or print API keys. The migration script does not log them.
- **Never** paste API keys in chat, docs, or code. Store only in env or a secret manager.
- If a key was ever exposed, **revoke it** in Appwrite and create a new one.
- This migration is safe for production (100+ therapists, live traffic): dry run by default, minimal writes, idempotent.

---

## 5. What the script does

- **Fetches** all therapist documents (paginated).
- **Normalizes `locationId`**: lowercase, trim, remove `", indonesia"`, map to canonical slug (e.g. `Yogyakarta` → `yogyakarta`, `yogyakarta, indonesia` → `yogyakarta`).
- **Standardizes `country`**: set to `"Indonesia"` when missing or different.
- **Updates only when needed**: skips documents already correct. Does **not** change `isLive` or any other field.
- **Logs**: each document that would be or is updated (id, name, old → new); summary with **total scanned**, **total updated**, **total unchanged**. No API keys or full env are ever logged.

---

## 6. How to preview (dry run)

**Default behavior is DRY RUN.** No documents are modified.

From project root:

```bash
pnpm run migrate:therapist-location
```

- Uses **`--apply`** only when you run the apply script below; this command does **not** pass `--apply`.
- Check the log: it lists each document that **would** be updated and the before/after values.
- Summary shows: Total scanned, Total updated, Total unchanged.

---

## 7. How to apply (write changes)

Only after you are satisfied with the dry-run output:

```bash
pnpm run migrate:therapist-location:apply
```

- This runs the same script with the **`--apply`** flag. Documents are updated in Appwrite.
- Safe on Windows: no inline env syntax (e.g. `VAR=value`) is required; everything comes from `.env.migration` and `.env`.

---

## 8. package.json scripts

| Script | Behavior |
|--------|----------|
| `pnpm run migrate:therapist-location` | Preview only (dry run). No changes. |
| `pnpm run migrate:therapist-location:apply` | Apply migration (writes to Appwrite). |

---

## 9. Rollback

- There is **no automatic rollback**. Back up (e.g. export therapist `$id`, `locationId`, `country`) before applying.
- To revert: restore from backup or manually set `locationId` and `country` per document (Console or a small script using the Appwrite API).

---

## 10. Summary

| Item | Description |
|------|-------------|
| **Script** | `scripts/migrate-therapist-location-country.mjs` |
| **Default** | Dry run (preview only). |
| **Apply** | `pnpm run migrate:therapist-location:apply` |
| **Env** | `.env.migration` first, then `.env` (`.env` overrides). |
| **API key** | Set once in `.env` (Option A) or `.env.migration` (Option B). Never committed. |
| **Updates** | Only `locationId` and `country`; `isLive` and other fields unchanged. |
| **Frontend** | No change; keep strict filters as they are. |
