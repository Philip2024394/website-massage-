# 🧹 Appwrite Storage Cleanup Guide

## Overview

This guide helps you identify and remove unused files from your Appwrite storage bucket to free up space and reduce costs.

---

## 📋 What Gets Cleaned Up

The cleanup script scans for:

- **Orphaned images**: Profile pictures, main images, thumbnails that are no longer referenced
- **Deleted user uploads**: Files from deleted therapists, places, or hotels
- **Old login backgrounds**: Replaced background images
- **Migration leftovers**: Files from old imagekit.io migrations
- **Chat attachments**: Files from deleted messages
- **Test uploads**: Files uploaded during development/testing

---

## 🔧 Prerequisites

### 1. Get Your Appwrite API Key

1. Go to your Appwrite Console: https://syd.cloud.appwrite.io
2. Navigate to your project: `68f23b11000d25eb3664`
3. Go to **Settings** → **API Keys**
4. Create a new API key with the following scopes:
   - ✅ `databases.read`
   - ✅ `files.read`
   - ✅ `files.write` (needed for deletion)
5. Copy the API key

### 2. Set the API Key

**Option A: Environment Variable (Temporary)**
```powershell
$env:APPWRITE_API_KEY="your-api-key-here"
```

**Option B: .env File (Recommended)**
Create or edit `.env` in your project root:
```env
APPWRITE_API_KEY=your-api-key-here
```

---

## 🚀 Usage

### Step 1: Scan for Unused Files (Dry Run)

First, run the script in **dry run mode** to see what would be deleted WITHOUT actually deleting anything:

```powershell
npx tsx scripts/cleanupUnusedFiles.ts
```

This will:
- ✅ List all files in your storage bucket
- ✅ Scan all database collections for file references
- ✅ Show which files are unused
- ✅ Display potential storage savings
- ❌ **NOT delete anything**

### Step 2: Review the Results

The script will output something like:

```
📊 SCAN RESULTS
═══════════════════════════════════════════════════
Total files in storage:     156
Files referenced in DB:     98
Unused files:               58
Total storage used:         45.2 MB
Unused storage:             12.8 MB
Potential savings:          12.8 MB (28.32%)
═══════════════════════════════════════════════════

🔍 DRY RUN MODE - No files will be deleted

Files that WOULD be deleted:
1. old-profile-1234.jpg (234 KB) - 68fe4181001758526d84
   Created: 10/15/2025, 3:45:12 PM
2. deleted-therapist-pic.jpg (456 KB) - 68fe4182001d05a11a19
   Created: 10/16/2025, 9:22:33 AM
...
```

### Step 3: Delete Unused Files (CAREFUL!)

⚠️ **WARNING**: This will permanently delete files from Appwrite storage!

Make sure you've reviewed the dry run results first, then run:

```powershell
npx tsx scripts/cleanupUnusedFiles.ts --delete
```

This will:
- ❌ Permanently delete all unused files
- ✅ Show progress for each file
- ✅ Report success/failure counts

---

## 📊 How It Works

### 1. **Storage Scan**
The script fetches all files from your Appwrite storage bucket:
```
Bucket ID: 68f76bdd002387590584
```

### 2. **Database Scan**
The script scans ALL collections for file references:

| Collection | Fields Scanned |
|------------|----------------|
| `therapists` | profilePicture, mainImage, thumbnailImages |
| `places` | mainImage, thumbnailImages, profilePicture |
| `hotels` | mainImage, images |
| `massage_types` | imageUrl |
| `login_backgrounds` | url, fileId |
| `image_assets` | url, fileId |
| `chat_messages` | fileUrl, attachments |
| All others | All string/JSON fields |

### 3. **Reference Extraction**
The script extracts file IDs from URLs like:
```
https://syd.cloud.appwrite.io/v1/storage/buckets/{bucketId}/files/{fileId}/view
                                                                     ^^^^^^^^
                                                                  Extracted ID
```

### 4. **Comparison**
- Files in storage: 156
- Files referenced in DB: 98
- **Unused files**: 58 (156 - 98)

### 5. **Deletion (if --delete flag)**
Unused files are permanently removed from Appwrite storage.

---

## 🛡️ Safety Features

### ✅ Dry Run by Default
The script will **NEVER delete files** unless you explicitly add the `--delete` flag.

### ✅ Detailed Logging
Every file deletion is logged with success/failure status.

### ✅ Error Handling
If a file can't be deleted (permissions, network error), the script continues and reports the error.

### ✅ No Database Changes
The script is **read-only** for the database. It only deletes from storage.

---

## 📝 Common Scenarios

### Scenario 1: After Deleting Therapists/Places
When you delete a therapist or place from the database, their profile pictures and images remain in storage.

**Solution**: Run the cleanup script to remove orphaned images.

### Scenario 2: After Changing Profile Pictures
When a user uploads a new profile picture, the old one stays in storage.

**Solution**: Run cleanup periodically (weekly/monthly).

### Scenario 3: After Migration
After migrating from imagekit.io to Appwrite, old test uploads may remain.

**Solution**: Run cleanup once after migration is complete.

### Scenario 4: Development/Testing
During development, many test files may be uploaded.

**Solution**: Run cleanup before going to production.

---

## ⏰ Recommended Schedule

### Manual Cleanup
Run the script manually when you notice high storage usage:
```powershell
npx tsx scripts/cleanupUnusedFiles.ts
```

### Periodic Cleanup
Consider running cleanup:
- **Weekly**: If you have high user activity
- **Monthly**: For normal usage
- **After major changes**: Migrations, bulk deletions, etc.

### Automated Cleanup (Advanced)
You could set up a cron job or scheduled task:
```powershell
# Windows Task Scheduler (run monthly)
schtasks /create /tn "Appwrite Cleanup" /tr "npx tsx scripts/cleanupUnusedFiles.ts --delete" /sc monthly
```

---

## 🔍 Troubleshooting

### Error: APPWRITE_API_KEY not set

**Problem**: No API key configured

**Solution**:
```powershell
$env:APPWRITE_API_KEY="your-api-key-here"
```

### Error: 401 Unauthorized

**Problem**: Invalid or expired API key

**Solution**:
1. Check the API key is correct
2. Verify the API key has `files.read` and `files.write` permissions
3. Create a new API key if needed

### Error: Network timeout

**Problem**: Too many files or slow connection

**Solution**:
1. Run the script with a stable internet connection
2. The script automatically handles pagination
3. Wait for it to complete (may take a few minutes for large buckets)

### No files detected as unused (but you know there are orphaned files)

**Problem**: Files might be referenced in JSON fields that weren't detected

**Solution**:
1. Check the script logs to see which collections were scanned
2. The script scans JSON fields, but verify your data structure
3. You may need to manually delete specific files from the Appwrite console

---

## 📸 What Happens to Images?

### Before Cleanup
```
Storage Bucket (156 files, 45.2 MB)
├── therapist-profile-1.jpg ✅ (referenced in therapists)
├── therapist-profile-2.jpg ❌ (deleted therapist)
├── old-background-1.jpg ❌ (replaced)
├── place-image-1.jpg ✅ (referenced in places)
├── test-upload-1.jpg ❌ (test file)
└── ...
```

### After Cleanup
```
Storage Bucket (98 files, 32.4 MB)
├── therapist-profile-1.jpg ✅ (referenced in therapists)
├── place-image-1.jpg ✅ (referenced in places)
└── ... (only files referenced in database)

Saved: 12.8 MB (28.32%)
```

---

## ⚠️ Important Notes

### Files That Will NEVER Be Deleted
The script only deletes files that have **ZERO** references in any database collection. If a file is referenced anywhere (even in old/archived data), it will be kept.

### Backup Recommendation
Before running with `--delete` flag:
1. Take a backup of your Appwrite project (Settings → Backups)
2. OR manually export important files
3. Run dry run first to verify what will be deleted

### Storage Pricing
Appwrite storage pricing (as of 2025):
- Free tier: 2 GB
- Pro tier: $15 per 100 GB/month

**Regular cleanup can save money on storage costs!**

---

## 🎯 Quick Reference

| Command | Action |
|---------|--------|
| `npx tsx scripts/cleanupUnusedFiles.ts` | Scan only (dry run) |
| `npx tsx scripts/cleanupUnusedFiles.ts --delete` | Scan and delete |
| `$env:APPWRITE_API_KEY="key"` | Set API key (PowerShell) |

---

## 📞 Support

If you encounter issues:

1. **Check the console output** - The script provides detailed logging
2. **Verify API key permissions** - Ensure `files.read` and `files.write` scopes
3. **Run dry run first** - Always review before deleting
4. **Check Appwrite console** - Verify file counts match

---

**Last Updated**: October 31, 2025  
**Script Location**: `scripts/cleanupUnusedFiles.ts`  
**Bucket ID**: `68f76bdd002387590584`  
**Database ID**: `68f76ee1000e64ca8d05`
