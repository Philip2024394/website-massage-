# Appwrite Storage Cleaner

Automatically clean up old, orphaned, and temporary files from Appwrite storage buckets.

## Features

- ✅ Delete files older than specified days
- ✅ Remove orphaned files (not referenced in database)
- ✅ Clean up temporary/test files
- ✅ Dry-run mode for safe testing
- ✅ Detailed reporting and statistics
- ✅ Multi-bucket support

## Setup

### 1. Install Dependencies

```bash
pip install -r scripts/requirements.txt
```

### 2. Configure Environment

Create `.env` file with your Appwrite credentials:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=68f76ee1000e64ca8d05
APPWRITE_API_KEY=your_server_api_key
```

**Important:** Use a **server API key** with storage permissions:
- Go to Appwrite Console → Project Settings → API Keys
- Create new key with `storage.read` and `storage.write` scopes

## Usage

### Basic Commands

**Dry run (safe preview):**
```bash
python scripts/storage-cleaner.py --dry-run
```

**Delete files older than 30 days:**
```bash
python scripts/storage-cleaner.py --days 30
```

**Remove orphaned files only:**
```bash
python scripts/storage-cleaner.py --orphaned-only
```

**Clean specific bucket:**
```bash
python scripts/storage-cleaner.py --bucket payment_proofs --days 60
```

**Live cleanup (actually deletes files):**
```bash
python scripts/storage-cleaner.py --days 30  # No --dry-run flag
```

### Advanced Examples

**Clean old payment proofs:**
```bash
python scripts/storage-cleaner.py --bucket payment_proofs --days 90
```

**Remove all orphaned chat files:**
```bash
python scripts/storage-cleaner.py --bucket chat_files --orphaned-only
```

**Clean everything older than 2 months:**
```bash
python scripts/storage-cleaner.py --days 60 --bucket all
```

## Options

| Option | Description |
|--------|-------------|
| `--dry-run` | Preview changes without deleting files |
| `--days N` | Delete files older than N days |
| `--bucket NAME` | Clean specific bucket (payment_proofs, chat_files, or all) |
| `--orphaned-only` | Only delete files not referenced in database |
| `--no-temp` | Skip deletion of temporary/test files |

## How It Works

1. **Scans storage buckets** - Lists all files in specified buckets
2. **Checks database references** - Queries bookings, chat messages, and therapist profiles
3. **Identifies candidates** - Finds old, orphaned, or temporary files
4. **Reports findings** - Shows detailed preview of files to delete
5. **Executes cleanup** - Deletes files (unless in dry-run mode)
6. **Provides summary** - Shows statistics and space freed

## Safety Features

- **Dry-run by default** - Must explicitly remove flag to delete
- **Reference checking** - Won't delete files still referenced in database
- **Detailed logging** - Shows what will be deleted and why
- **Error handling** - Continues on errors, reports issues
- **Preview mode** - See exactly what will be deleted before committing

## Scheduled Cleanup

Run automatically with cron/Task Scheduler:

**Linux/Mac (crontab):**
```bash
# Run weekly on Sunday at 2 AM
0 2 * * 0 cd /path/to/website-massage- && python scripts/storage-cleaner.py --days 60
```

**Windows (Task Scheduler):**
1. Open Task Scheduler
2. Create Basic Task
3. Set trigger (e.g., weekly)
4. Action: Start Program
5. Program: `python`
6. Arguments: `C:\path\to\website-massage-\scripts\storage-cleaner.py --days 60`

## Troubleshooting

**❌ Error: appwrite package not installed**
```bash
pip install appwrite python-dotenv
```

**❌ Error: APPWRITE_API_KEY not found**
- Make sure `.env` file exists with valid API key
- Use server API key (not client SDK key)

**❌ Error: Could not check bookings**
- Verify collection IDs match your Appwrite setup
- Check API key has database read permissions

## Storage Buckets

Current configured buckets:
- `payment_proofs` - Payment confirmation screenshots
- `chat_files` - Chat message attachments

To add more buckets, edit `BUCKETS` dictionary in `storage-cleaner.py`.

## Example Output

```
🔧 Initialized Appwrite Storage Cleaner
📊 Mode: DRY RUN (no files will be deleted)
🌐 Endpoint: https://cloud.appwrite.io/v1
📦 Project: your_project_id

============================================================
🧹 Cleaning bucket: payment_proofs (67a3a0f5001a05f4c982)
============================================================
📁 Found 156 files in bucket

🔍 Checking for orphaned files...
✅ Found 142 referenced files in bookings

📊 Found 14 files to delete

📋 Files to be deleted:
  • test_payment_1.jpg (2.34 MB) - older than 30 days, temporary/test file
  • old_proof_2.png (1.89 MB) - older than 30 days
  ... and 12 more

💾 Total space to free: 45.67 MB

🔒 DRY RUN: No files were deleted
   Run without --dry-run to actually delete files

============================================================
📊 CLEANUP SUMMARY
============================================================
Files scanned:  156
Files deleted:  0
Errors:         0
Space freed:    0.00 MB

🔒 DRY RUN: No actual changes were made
```
