# Auto-Translation Setup - Quick Checklist ✅

Print this or keep it open during setup!

---

## ☁️ Step 1: Google Cloud Setup (5 min)

### Create Project
- [ ] Go to https://console.cloud.google.com/
- [ ] Click "Create Project"
- [ ] Name: `massage-booking-translations`
- [ ] Click "Create"

### Enable API
- [ ] Go to "APIs & Services" → "Library"
- [ ] Search "Cloud Translation API"
- [ ] Click "Enable"

### Get API Key
- [ ] Go to "APIs & Services" → "Credentials"
- [ ] Click "Create Credentials" → "API Key"
- [ ] Copy the key (starts with `AIza...`)
- [ ] Click "Restrict Key"
- [ ] Under "API restrictions" → "Restrict key"
- [ ] Select "Cloud Translation API"
- [ ] Click "Save"

### Add to .env
- [ ] Open `.env` file in project root (create if doesn't exist)
- [ ] Add: `VITE_GOOGLE_TRANSLATE_API_KEY=AIza...YOUR_KEY_HERE`
- [ ] Save file
- [ ] Restart dev server if running

---

## 🗄️ Step 2: Appwrite Collection (5 min)

### Login & Navigate
- [ ] Go to https://cloud.appwrite.io/console
- [ ] Open project: **Indamassage** (ID: `68f23b11000d25eb3664`)
- [ ] Go to "Databases"
- [ ] Open database (ID: `68f76ee1000e64ca8d05`)

### Create Collection
- [ ] Click "Add Collection"
- [ ] Collection ID: `translations_collection_id` ⚠️ MUST BE EXACT
- [ ] Collection Name: `Translations`
- [ ] Click "Create"

### Add Attributes (Click "Attributes" tab)
- [ ] String: `key` (size: 255, required: YES)
- [ ] String: `en` (size: 1000, required: YES)
- [ ] String: `id` (size: 1000, required: YES)
- [ ] String: `zh` (size: 1000, required: YES)
- [ ] String: `ja` (size: 1000, required: YES)
- [ ] String: `ko` (size: 1000, required: YES)
- [ ] String: `ru` (size: 1000, required: YES)
- [ ] String: `fr` (size: 1000, required: YES)
- [ ] String: `de` (size: 1000, required: YES)
- [ ] String: `lastUpdated` (size: 50, required: NO)
- [ ] Boolean: `autoTranslated` (required: YES, default: `true`)

### Create Index (Click "Indexes" tab)
- [ ] Click "Add Index"
- [ ] Index Key: `key_unique`
- [ ] Type: **Unique**
- [ ] Attributes: Select `key`
- [ ] Order: ASC
- [ ] Click "Create"

### Set Permissions (Click "Settings" tab)
- [ ] Read access: `Role: Any`
- [ ] Create access: `Role: Users`
- [ ] Update access: `Role: Users`
- [ ] Delete access: `Role: Admin`

---

## 🚀 Step 3: Initialize Translations (2 min)

### Install Dependencies (if needed)
- [ ] Open terminal
- [ ] Run: `npm install -D ts-node`

### Run Script
- [ ] Run: `npx ts-node scripts/initializeTranslations.ts`
- [ ] Wait ~2 minutes (translating 70 phrases × 7 languages)
- [ ] Look for "✅ Initialization complete!"
- [ ] Note: Success count should be 70

### Verify in Appwrite
- [ ] Go back to Appwrite Console
- [ ] Open "Translations" collection
- [ ] Click "Documents" tab
- [ ] Should see 70 documents with all language fields filled

---

## 🧪 Step 4: Test (3 min)

### Start Dev Server
- [ ] Run: `npm run dev`
- [ ] Open browser to localhost

### Test Language Switching
- [ ] Navigate to Hotel/Villa Guest Booking page
- [ ] Switch language to:
  - [ ] 🇬🇧 English (should work immediately)
  - [ ] 🇮🇩 Indonesian (should work immediately)
  - [ ] 🇨🇳 Chinese (may take 1 sec first time, then instant)
  - [ ] 🇯🇵 Japanese (may take 1 sec first time, then instant)
  - [ ] 🇰🇷 Korean (may take 1 sec first time, then instant)
  - [ ] 🇷🇺 Russian (may take 1 sec first time, then instant)
  - [ ] 🇫🇷 French (may take 1 sec first time, then instant)
  - [ ] 🇩🇪 German (may take 1 sec first time, then instant)

### Verify Translations
- [ ] Check these fields translate:
  - [ ] "Guest Name" label
  - [ ] "Room Number" label
  - [ ] "Select Date" label
  - [ ] "Select Time" label
  - [ ] "Confirm Booking" button
  - [ ] "Charge to my room" checkbox

### Test Auto-Translation (Optional)
- [ ] Open DevTools → Console
- [ ] Add new translation in code: `t('test.hello', 'Hello World')`
- [ ] Reload page
- [ ] Check Appwrite → Should see new document with key `test.hello`

---

## ✅ Success Checklist

You're done when:
- [ ] Google Translate API key is in `.env`
- [ ] Appwrite collection `translations_collection_id` exists
- [ ] Appwrite collection has 11 attributes + 1 index
- [ ] Initialization script completed successfully (70/70)
- [ ] All 8 languages display correctly in booking page
- [ ] Switching languages updates text instantly

---

## 🐛 Troubleshooting

### "API key not found" error
- ✅ Check `.env` file exists in project root
- ✅ Verify key starts with `VITE_GOOGLE_TRANSLATE_API_KEY=`
- ✅ Restart dev server after creating `.env`

### "Collection not found" error
- ✅ Verify collection ID is exactly `translations_collection_id`
- ✅ Check you're in the correct database (ID: `68f76ee1000e64ca8d05`)

### "Unauthorized" error
- ✅ Check Appwrite permissions (Read: Any, Create: Users)
- ✅ Make sure you're logged in to Appwrite

### Translations not appearing
- ✅ Open browser DevTools → Console tab
- ✅ Look for error messages
- ✅ Check Network tab for failed requests

### "Rate limit exceeded"
- ✅ Edit `scripts/initializeTranslations.ts`
- ✅ Change delay from `200` to `500` ms
- ✅ Re-run initialization script

---

## 📊 Expected Results

### After Initialization
- **Appwrite Documents**: 70 translation entries
- **API Calls**: ~490 (70 phrases × 7 languages)
- **Cost**: ~$0.20 (one-time)
- **Time**: ~2 minutes

### In Production
- **Languages**: 8 (EN, ID, ZH, JA, KO, RU, FR, DE)
- **Load Time**: <50ms (cached), <1s (first time)
- **Monthly Cost**: ~$0.14 (for new features)
- **Annual Cost**: ~$2.00

---

## 🎉 You're Done!

Once all checkboxes are complete, your platform supports 8 languages with:
- ✅ Auto-translation for new features
- ✅ Permanent storage in Appwrite
- ✅ Instant loading from cache
- ✅ Manual override capability
- ✅ ~$2/year cost

**Next**: Read `docs/TRANSLATION_USAGE_GUIDE.md` to learn how to add translations to other pages!

---

**Need help?** See `docs/AUTO_TRANSLATION_SETUP.md` for detailed instructions.

**Estimated total time**: 15 minutes ⏱️
