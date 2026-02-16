# Storage & Cursor OOM Fixes

This doc summarizes changes made to reduce Cursor/IDE crashes and storage issues so you can keep building the app.

## What was done in code

1. **Storage**
   - `localStorage` for app state (e.g. selected place/therapist) stays **disabled** (no-op in `useAppState.ts`) to avoid quota and large-object retention.
   - If you re-enable persistence later: **never store full place/therapist objects**; store only IDs and look up from state. A 50KB cap per key is defined in `useAppState.ts` and `localStorageCleanup.ts`.
   - `localStorageCleanup.ts`: on load, we remove any key whose value is >50KB and fix/remove corrupted entries (no verbose logging).

2. **Logging**
   - Verbose logging in `useAppState` (language init, setLanguage, setPage, getInitialPage, venue ID) was reduced or gated behind **dev-only** `devLog()` so production and heavy sessions don’t retain large refs in console.
   - Hot paths (setPage, initial page) no longer log on every navigation.

3. **IDE / Cursor**
   - `.vscode/settings.json`: duplicate high memory setting removed; `files.maxMemoryForLargeFilesMB` set to 4096. Existing watcher/search exclusions and TS server settings are kept.
   - Caches: `scripts/clearAllCaches.ts` now also removes `.vite`. Use the existing **PowerShell** script when Cursor is closed: `scripts/cleanup-vscode-emergency.ps1`.

## What you can do when Cursor keeps crashing

1. **Free disk on C:**
   - Run `scripts/cleanup-vscode-emergency.ps1` (with Cursor closed), or `npx tsx scripts/clearAllCaches.ts`.
   - Clear Cursor cache: File → Preferences → Clear Editor History / Caches (or equivalent in your Cursor version).
   - Move the project to **D:** — see [Move project to D:](#move-project-to-d) below.

2. **Use fewer editors**
   - Rely on “workbench.editor.limit” (already set to 5 in `.vscode/settings.json`). Prefer closing unused tabs.

3. **If OOM persists**
   - Lower `typescript.tsserver.maxTsServerMemory` in `.vscode/settings.json` (e.g. from 8192 to 4096).
   - Disable or limit extensions that index the whole repo or use a lot of memory.

## Move project to D:

1. **Close Cursor** completely.
2. **Copy** the whole project folder (e.g. `C:\Users\Victus\website-massage-`) to **D:**, for example:
   - `D:\website-massage` or `D:\projects\website-massage`
3. **Open Cursor** → **File → Open Folder** → choose the **new folder on D:** (e.g. `D:\website-massage`).
4. In the project root, run:
   ```bash
   npm install
   ```
5. Use the new path from now on. The cleanup script `scripts/cleanup-vscode-emergency.ps1` now detects the project root automatically, so it works from D: as well.

You can delete the old folder on C: after you’ve confirmed everything works from D:.

## Quick reference

| Item | Location |
|------|----------|
| Storage no-op / 50KB cap comment | `src/hooks/useAppState.ts` |
| Safe cleanup (quota, corrupted keys) | `src/utils/localStorageCleanup.ts` |
| Dev-only logging | `src/hooks/useAppState.ts` (`devLog`) |
| Cache cleanup (Node) | `npx tsx scripts/clearAllCaches.ts` |
| Emergency cleanup (PowerShell) | `scripts/cleanup-vscode-emergency.ps1` |
