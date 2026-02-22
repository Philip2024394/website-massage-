# Auto-Post Image Engine

Drop-in module: **scheduler → generator → image engine → publisher → live post**.

Generates unique, SEO-friendly images per post (Google Images, originality, engagement). Runs at **publish time** (runner), not during the daily planner, to keep the planner light.

## Env (optional)

- **`IMAGE_API_URL`** — POST endpoint that accepts `{ prompt }` and returns `{ url }` (or `data.url`).
- **`IMAGE_KEY`** or **`IMAGE_API_KEY`** — Bearer token for the image API.

If unset, the engine uses a **fallback stock image** (no API call), so the pipeline still publishes.

## Files

| File | Role |
|------|------|
| `imagePromptBuilder.ts` | Localized prompt + variation (lighting, angle, environment) to avoid duplicates. |
| `generateImage.ts` | Provider-agnostic HTTP call (OpenAI, Replicate, Stable Diffusion, etc.). |
| `imageSeo.ts` | Filename + alt text for CDN and accessibility. |
| `imageStorage.ts` | Fetch image URL → save to `public/cdn/posts/` (or CDN upload). |
| `index.ts` | Orchestrator: prompt → generate → SEO → store; optional fallback on failure. |

## SEO boost (optional later)

- WebP conversion (e.g. in `imageStorage` with sharp).
- Lazy loading + width/height on `<img>`.
- CDN caching (store returns CDN URL).
- EXIF stripped.
- `<ImageObject>` schema in post page.

## Cost-safe mode

If generation fails (or API not configured), the **runner** catches the error and uses **`getFallbackPostImage(service)`** when **`FALLBACK_POST_IMAGE_URL`** is set in env; otherwise the post publishes without an image. Optional **`FALLBACK_POST_IMAGE_ALT`** sets the fallback image alt text.
