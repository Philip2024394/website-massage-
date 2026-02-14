# Fix Appwrite CORS on Netlify (magenta-centaur-6443a1.netlify.app)

## What’s wrong

Requests from **https://magenta-centaur-6443a1.netlify.app** to **https://syd.cloud.appwrite.io** are blocked with:

- `No 'Access-Control-Allow-Origin' header is present on the requested resource`
- `net::ERR_FAILED` / `403 (Forbidden)`

Appwrite only allows requests from **hostnames you add as a platform**. Your Netlify hostname is not added yet, so the server doesn’t send CORS headers and the browser blocks the response.

---

## Fix (in Appwrite Console)

### 1. Open Appwrite Console

- Go to **https://cloud.appwrite.io/console**
- Open the project with ID: **`68f23b11000d25eb3664`**

### 2. Add Netlify as a Web App platform

1. In the left sidebar, open **Overview** or **Settings**.
2. Find the **Platforms** section.
3. Click **Add platform** → choose **Web App**.

### 3. Set hostname (no protocol, no path)

Use **only the hostname**:

- **Name:** `Netlify Production` (or any label you like)
- **Hostname:** `magenta-centaur-6443a1.netlify.app`  
  - No `https://`  
  - No path (e.g. no `/`)  
  - No port

Save/Create the platform.

### 4. Optional: allow all Netlify preview URLs

If you use branch/preview deploys (e.g. `branch-name--magenta-centaur-6443a1.netlify.app`), add a second Web App platform:

- **Name:** `Netlify Previews`
- **Hostname:** `*.netlify.app`

(Appwrite supports wildcards so all `*.netlify.app` subdomains are allowed.)

### 5. Wait and test

- Wait **1–2 minutes** for Appwrite to apply the new platform.
- Hard refresh the Netlify site: **Ctrl+Shift+R** (Windows) or **Cmd+Shift+R** (Mac).
- Check the browser console: CORS errors to `syd.cloud.appwrite.io` should stop and API calls should succeed.

---

## Summary

| Item        | Value |
|------------|--------|
| Appwrite project ID | `68f23b11000d25eb3664` |
| Appwrite endpoint   | `https://syd.cloud.appwrite.io/v1` |
| Netlify origin to allow | `magenta-centaur-6443a1.netlify.app` |
| Where to configure  | Appwrite Console → Project → Platforms → Add Web App |

No code or Netlify config changes are required; the fix is entirely in the Appwrite Console.

---

## References

- [Appwrite: Solving CORS errors](https://appwrite.io/blog/post/cors-error)
- Local CORS fix (same idea for localhost): `archived/docs-archive/FIX_CORS_GUIDE.md`
