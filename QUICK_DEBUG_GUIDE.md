# 🚀 Quick Debug Guide - Shared Link Issue

## TEST NOW:

1. **Open console** (F12)
2. **Clear console** (Ctrl+L or console.clear())
3. **Copy a therapist share link** (e.g., `/therapist-profile/12345`)
4. **Paste in new incognito window**
5. **Watch console output**

---

## WHAT YOU'LL SEE:

### ✅ WORKING (Expected):
```
🔗 [LINK VALIDATION] URL parsed successfully
🧩 [COMPONENT LIFECYCLE] SharedTherapistProfile MOUNTED
📡 [APPWRITE SUCCESS] Document retrieved
✅ [RENDER] Rendering SUCCESS state
```

### ❌ BROKEN (Need to find):
Look for one of these:
- `💥 UNMOUNTING` (premature unmount)
- `📄 Page changed` from shared-therapist-profile → something else
- `🚫 [REDIRECT]` messages
- `❌ [APPWRITE ERROR]` (query failed)
- `❌ [LINK VALIDATION] Invalid URL`

---

## QUICK DIAGNOSIS:

| **You See** | **Problem Is** | **Location** |
|------------|----------------|--------------|
| Component unmounts immediately | Route/navigation issue | App.tsx or AppRouter.tsx |
| Appwrite error | Database/ID issue | therapist.service.ts |
| Invalid URL | URL pattern mismatch | SharedTherapistProfile.tsx |
| Page state changes | Navigation logic | App.tsx URL sync |
| Redirect triggered | URL synchronization | App.tsx useEffect |

---

## COPY THIS TO REPORT:

1. **Tested URL:** (paste the full URL)
2. **Console output:** (copy the logs showing the break)
3. **What happened:** (describe what you saw on screen)
4. **Pattern:** (which failure pattern from above)

---

**Full documentation:** See `SHARED_LINK_DEBUG_REPORT.md`
