# Add `approved` Attribute to Therapists Collection

The app filters consumer-facing therapist lists by `approved === true` (see `therapist.service.ts` → `getTherapists()` / `getAll(..., { liveOnly: true })`). Add this attribute in Appwrite so the query works.

## Steps in Appwrite Console

1. Open **Appwrite Console** → **Database**.
2. Select your database, then open the **therapists** collection (ID from env: `VITE_THERAPISTS_COLLECTION_ID` or fallback `therapists_collection_id`).
3. Go to **Attributes**.
4. Click **Add attribute** and use:

   | Field    | Value     |
   |----------|-----------|
   | **Name** | `approved` |
   | **Type** | Boolean   |
   | **Required** | No (false) |
   | **Default** | Yes / `true` |

5. Save. Appwrite will add the attribute.

---

## 1️⃣ Confirm Attribute Status = **Available**

In **Appwrite → Database → therapists collection → Attributes**:

- Ensure **`approved`** shows **Status: Available**.
- If it shows **Processing**, wait until it completes before testing or creating the index.
- Do not run queries or backfill until status is **Available**.

---

## 2️⃣ Add an Index on `approved`

`Query.equal('approved', true)` **must** use an index. Without it, the query may return 0 or behave oddly.

1. Go to **Database → therapists collection → Indexes**.
2. If there is **no** index that includes `approved`, create one:
   - **Type:** Key  
   - **Attributes:** `approved`  
   - **Order:** ASC  

Create the index and wait until it is built before relying on filtered queries.

---

## 3️⃣ Backfill Existing Therapists

**Default = true** often does **not** apply to documents that already existed before the attribute was added. Those docs can have `approved` as **null**, and:

- `Query.equal('approved', true)` **does not match null.**

**Check:**

1. Go to **Database → therapists collection → Documents**.
2. Open one or two existing therapist documents.
3. Confirm you see **`approved: true`**.
   - If you **don’t** see it on existing docs, they are effectively null and must be backfilled.

**Fix:**

- **Small number:** Manually edit each document in the Console and set `approved` to `true`.
- **Larger number:** Run the backfill script (see below).

---

## Backfill Script (set missing `approved` to `true`)

From the project root, with an API key that can write to the therapists collection:

```bash
APPWRITE_API_KEY=your_key pnpm tsx scripts/backfill-therapists-approved.ts
```

Dry run (report only):

```bash
APPWRITE_API_KEY=your_key pnpm tsx scripts/backfill-therapists-approved.ts --dry-run
```

Script location: **`scripts/backfill-therapists-approved.ts`**.

---

## After Adding the Attribute

- **Redeploy** your app (frontend/hosting) once the attribute is Available, the index exists, and (if needed) backfill is done.
- Code already uses `Query.equal('approved', true)` in `therapist.service.ts` when `liveOnly: true`; no code change required.

## Code Reference

- **Query in use:** `src/lib/appwrite/services/therapist.service.ts` → `getAll(..., { liveOnly: true })` calls:
  - Baseline: `databases.listDocuments(DATABASE_ID, THERAPISTS_COLLECTION_ID, [Query.limit(200)])`
  - With filters (step 1–3): adds `Query.equal('approved', true)`, then `Query.equal('status', 'online')`, then `Query.equal('availability', 'available')` per `VITE_THERAPIST_FILTER_STEP`.

**Baseline and filter steps** (to confirm therapists load, then reintroduce filters one at a time):
- **Baseline (no filters):** Set `VITE_THERAPIST_FILTER_STEP=0` (or leave unset; default is 0). Consumer list uses only `Query.limit(200)`. Confirm therapists load.
- **Step 1:** Set `VITE_THERAPIST_FILTER_STEP=1` → adds `Query.equal('approved', true)`.
- **Step 2:** Set `VITE_THERAPIST_FILTER_STEP=2` → adds `Query.equal('status', 'online')`.
- **Step 3:** Set `VITE_THERAPIST_FILTER_STEP=3` → adds `Query.equal('availability', 'available')` (full live filter).
- For production, set `VITE_THERAPIST_FILTER_STEP=3` once data types and indexes are verified.

---

## Empty list debugging (consumer list returns 0 therapists)

The service logs to the console in **development** so you can see exactly what is sent and returned.

1. **Console logs (dev only)**  
   On each `listDocuments` call you get:
   - `[APPWRITE therapists] listDocuments config:` — `DATABASE_ID`, `THERAPISTS_COLLECTION_ID`, `filters`, `queryCount`
   - `[APPWRITE therapists] listDocuments response:` — `total`, `documentsLength`, `filtersUsed`
   - If `documentsLength > 0`: `first document sample (verify types)` — `approved`/`status`/`availability` and their **typeof** (must be boolean / string as below)
   - If `documentsLength === 0`: a warning reminding you to check attribute names, values, index, and permissions

2. **Reintroduce filters one at a time**  
   Set **`VITE_THERAPIST_FILTER_STEP`** in `.env` and restart dev server:
   - **`0`** (default) — baseline: only `Query.limit(200)` (no live filters)
   - **`1`** — add `Query.equal('approved', true)`
   - **`2`** — add `Query.equal('status', 'online')`
   - **`3`** — add `Query.equal('availability', 'available')` (full filter)  
   Compare which step returns documents and which returns 0 to see which condition causes the empty result.

3. **Verify attribute types and values**  
   Use the “first document sample” log:
   - **approved**: must be boolean **`true`** (not string `"true"`)
   - **status**: must be string **`"online"`** (exact, case-sensitive in Appwrite)
   - **availability**: must be string **`"available"`** (exact, case-sensitive)

4. **Confirm collection permissions**  
   The therapists collection **must** allow **Read** for at least one of:
   - **Role: Any** (public read), or  
   - **Role: Users**  
   In Appwrite Console → Database → therapists collection → **Settings** (or Permissions), add **Read** for the role your app uses. Without read access, the query can return 0 or throw.

5. **Confirm env and IDs**  
   The app logs runtime values in dev: **`VITE_APPWRITE_DATABASE_ID`** and **`VITE_THERAPISTS_COLLECTION_ID`** (see `[APPWRITE therapists] env (runtime)` and `listDocuments response`). Confirm they match the database and collection in the Console.
