# Appwrite: Indastreet News Collection

Create this collection so the **Indastreet News** page loads posts from Appwrite. The page still opens and shows sample data if the collection is missing.

## 1. Create the collection

1. In [Appwrite Console](https://cloud.appwrite.io) → your project → **Databases** → select your database (ID: same as `VITE_APPWRITE_DATABASE_ID` / `68f76ee1000e64ca8d05`).
2. Click **Create collection**.
3. **Collection ID:** `indastreet_news` (must be exactly this).
4. **Name:** Indastreet News (or any label).

## 2. Create attributes

Add these attributes (type and size as below). Order doesn’t matter.

| Attribute ID | Type    | Size  | Required | Default / Notes |
|-------------|---------|-------|----------|------------------|
| `headline`  | String  | 500   | Yes      | News headline    |
| `excerpt`   | String  | 2000  | Yes      | Short summary    |
| `date`      | String  | 50    | Yes      | e.g. "Nov 10, 2025" |
| `category`  | Enum    | -     | Yes      | See enum values below |
| `imageSrc`  | String  | 1000  | No       | Image URL (optional) |
| `published` | Boolean | -     | No       | true = show in feed |
| `order`     | Integer | -     | No       | Optional sort order |

### Category enum values

Add **one** attribute with type **Enum** and ID `category`. Add these values (exactly):

- `techniques`
- `producers`
- `places-opening`
- `places-closing`
- `good-news`
- `negative`
- `headlines`

## 3. Permissions

- **Read:** Allow **Anyone** (or the role you use for public read) so the news page can list documents without login.
- **Create / Update / Delete:** Restrict to admin or your backend (e.g. server or admin role).

## 4. Config in the app

The app already uses collection ID `indastreet_news` via `APPWRITE_CONFIG.collections.indastreetNews` in `src/lib/appwrite.config.ts`. No code change needed once the collection exists.

## 5. Add a test document (optional)

Create a document with:

- `headline`: "Test headline"
- `excerpt`: "Test excerpt"
- `date`: "Nov 10, 2025"
- `category`: "headlines"
- `imageSrc`: "" or a valid image URL

Then open **Indastreet News** in the app; you should see this post from Appwrite. If the collection is empty or missing, the page shows sample news instead.
