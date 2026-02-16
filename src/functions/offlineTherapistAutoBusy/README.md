# Offline Therapist Auto-Busy

Appwrite scheduled function: therapists who stay **offline for 24+ hours** are automatically set to **busy** for **12 hours** (end time randomized within that window). After 12 hours they are set back to **offline**. This avoids offline therapists staying that way indefinitely in listings (they are shown as "Busy" in the UI).

## Env vars (required)

- `APPWRITE_FUNCTION_API_ENDPOINT`
- `APPWRITE_FUNCTION_PROJECT_ID`
- `APPWRITE_API_KEY`
- `DATABASE_ID` – your Appwrite database ID
- `THERAPISTS_COLLECTION_ID` – therapists collection ID (e.g. `therapists_collection_id` or your env value)

## Schedule

Recommended: **hourly**, e.g. `0 * * * *`.

## Deployment (Appwrite CLI)

1. In this folder: `appwrite init function` (ID: `offlineTherapistAutoBusy`, entrypoint: `index.js`, runtime: `node-18.0`).
2. Add the env vars above in Console or via CLI.
3. Set schedule to `0 * * * *` and enable it.

## Behaviour

- **Offline 24h+**: status set to `busy`, `availability` to `Busy`, `isLive` true; description gets `[AUTO_BUSY_UNTIL:<ISO date>` (now + 12h + 0–2h random).
- **Busy with `[AUTO_BUSY_UNTIL:...]` in the past**: status set back to `offline`, `availability` to `Offline`, `isLive` false; tag removed from description.

No new collection attributes; the tag is stored in the existing `description` field.
