# Appwrite Blog Collection & Image Storage Setup

Create the **Indastreet Blog** collection and **blog images** storage bucket in [Appwrite Console](https://cloud.appwrite.io) so the blog index and view-post pages can use Appwrite.

---

## 1. Database

Use your existing database (same as news/bookings).  
Database ID is in your app config (e.g. `APPWRITE_CONFIG.databaseId`).

---

## 2. Collection: `indastreet_blog`

- **Collection ID:** `indastreet_blog`
- **Name:** Indastreet Blog (or any display name)

### Attributes (create in order)

| Attribute    | Type    | Size    | Required | Default | Notes                    |
|-------------|---------|---------|----------|---------|--------------------------|
| `title`     | string  | 500     | Yes      | -       | Article title            |
| `slug`      | string  | 255     | Yes      | -       | URL slug (unique)         |
| `excerpt`   | string  | 2000    | Yes      | -       | Short summary            |
| `body`      | string  | 100000  | Yes      | -       | Full HTML/text content   |
| `category`  | enum    | -       | Yes      | -       | See enum values below    |
| `author`    | string  | 255     | Yes      | -       | Author name              |
| `date`      | string  | 50      | Yes      | -       | Display date (e.g. Oct 20, 2025) |
| `readTime`  | string  | 50      | Yes      | -       | e.g. "8 min read"        |
| `image`     | string  | 2000    | No       | -       | Image URL (external or Appwrite view URL) |
| `imageFileId` | string | 100     | No       | -       | Appwrite Storage file ID if using blog bucket |
| `featured`  | boolean | -       | No       | false   | Show in featured section |
| `published` | boolean | -       | No       | true    | Show on site             |
| `order`     | integer | -       | No       | -       | Sort order (higher = first) |

### Enum: `category`

Values (exactly):

- `international`
- `industry`
- `techniques`
- `career`
- `wellness`

### Indexes (recommended)

- **Unique index** on `slug` (for fast get-by-slug).
- Optional: index on `published` + `order` desc for listing.

### Permissions

- **Read:** Allow "Any" (or "Users") so the blog is public.
- **Create/Update/Delete:** Restrict to your admin role or "Users" as needed.

---

## 3. Storage: Blog images bucket

- **Bucket name:** Blog Images (or any name).
- **Bucket ID:** `bogimages` (configured in app; override with `VITE_APPWRITE_BLOG_BUCKET_ID` if you use a different ID).
- **Permissions:** 
  - Read: "Any" (so images can be shown on the blog).
  - Create/Update/Delete: Admin or authenticated role as needed.
- **File size / allowed types:** Set limits as you prefer (e.g. max 5 MB, image/*).

After creation, copy the **Bucket ID** and either:

- Set env: `VITE_APPWRITE_BLOG_BUCKET_ID=<bucket_id>`, or  
- In code config, set `blogImagesBucketId` to that ID.

If you don’t set a dedicated blog bucket, the app falls back to the main storage bucket.

---

## 4. Code reference

- **Schema:** `src/config/appwriteSchema.ts` → `COLLECTIONS.INDASTREET_BLOG`, `STORAGE_BUCKETS`.
- **Config:** `src/lib/appwrite.config.ts` → `collections.indastreetBlog`, `blogImagesBucketId`.
- **Service:** `src/lib/appwrite/services/indastreetBlog.service.ts` → `listIndastreetBlog`, `getIndastreetBlogBySlug`, `uploadBlogImage`, `getBlogImageUrl`.
