# Fix Cursor OOM (Out of Memory) Crashes

Do these in order. **Close Cursor completely** before Step 2.

---

## Step 1: Clear the bloated state database (biggest impact)

1. **Quit Cursor** (File → Exit or close all windows).
2. Open **PowerShell** (Win + X → Windows PowerShell).
3. Run:
   ```powershell
   cd "C:\Users\Victus\website-massage-"
   .\fix-cursor-oom-clear-state.ps1
   ```
   If you get "script execution disabled", run once:
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
   ```
4. Script will **back up** then **delete** `state.vscdb`. Cursor will create a new one on next launch.
5. **Start Cursor again** (normal icon or Step 2).

**Note:** Chat history / UI state may reset. Your code and projects are not touched.

---

## Step 2: Launch Cursor with more memory (prevent future OOM)

**Option A – Use the launcher (no system settings):**

- Double‑click **`cursor-launch-more-memory.bat`** whenever you want to open Cursor with 8 GB heap.
- Or from a terminal:  
  `.\cursor-launch-more-memory.bat`

**Option B – Set permanently (all apps using Node will use it):**

1. Win + R → type `sysdm.cpl` → Enter.
2. **Advanced** tab → **Environment Variables**.
3. Under "User variables" → **New**:
   - Variable name: `NODE_OPTIONS`
   - Variable value: `--max-old-space-size=8192`
4. OK, then **restart Cursor** (and any terminal).

Use **8192** for 16 GB RAM; use **4096** for 8 GB RAM.

---

## If it still crashes

- Run Cursor with extensions disabled:  
  `cursor --disable-extensions`  
  (in a terminal where Cursor is on PATH, or use full path to Cursor.exe.)
- Keep fewer editor tabs and Cursor windows open.
- Restart Cursor after very long AI/agent sessions.

These steps address the main causes of Cursor OOM on your machine (state DB bloat + low heap limit).
