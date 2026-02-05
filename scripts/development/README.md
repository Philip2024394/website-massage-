# Development Utilities

Local development scripts for testing and managing Appwrite storage.

## Storage Population Script

Generate test files in storage buckets for development.

### Usage

```bash
# Populate all buckets with 20 files each
python scripts/development/populate-storage.py --all --count 20

# Populate specific bucket
python scripts/development/populate-storage.py --bucket payment_proofs --count 50

# Large test dataset
python scripts/development/populate-storage.py --all --count 100
```

### Generated Files

- **payment_proofs bucket**: Payment receipts, transfer confirmations, test proofs
- **chat_files bucket**: Chat images, attachments, shared files
- File sizes: 50KB - 500KB
- Random dates: 0-90 days old
- Various formats: JPG, PNG, PDF

## Storage Cleaner Runner

Run storage cleaner with convenient presets.

### Usage

```bash
# Test mode (dry-run, safe)
python scripts/development/run-storage-cleaner.py --preset test

# Development cleanup (30 days)
python scripts/development/run-storage-cleaner.py --preset dev

# Production cleanup (90 days)
python scripts/development/run-storage-cleaner.py --preset production --live

# Custom arguments
python scripts/development/run-storage-cleaner.py --custom --days 30 --bucket payment_proofs

# Live mode (actually deletes files)
python scripts/development/run-storage-cleaner.py --preset dev --live
```

### Available Presets

| Preset | Description | Safety |
|--------|-------------|---------|
| `test` | Dry-run with orphaned files only | 🟢 Safe |
| `dev` | Clean test files older than 30 days | 🟡 Caution |
| `staging` | Clean files older than 60 days (dry-run) | 🟢 Safe |
| `production` | Clean very old files (90+ days) | 🔴 Live |
| `orphaned` | Remove only orphaned files (dry-run) | 🟢 Safe |
| `payment-proofs` | Clean old payment proofs (60 days) | 🟡 Caution |

## Complete Development Workflow

### 1. Setup

```bash
pip install -r scripts/requirements.txt
```

### 2. Populate Test Data

```bash
python scripts/development/populate-storage.py --all --count 50
```

### 3. Test Cleaner

```bash
# Dry-run first (safe)
python scripts/development/run-storage-cleaner.py --preset test

# Preview what would be deleted
python scripts/development/run-storage-cleaner.py --preset dev
```

### 4. Run Cleanup

```bash
# When ready, run live
python scripts/development/run-storage-cleaner.py --preset dev --live
```

## Configuration

Both scripts use environment variables from `.env`:

```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your_project_id
VITE_APPWRITE_DATABASE_ID=68f76ee1000e64ca8d05
APPWRITE_API_KEY=your_server_api_key
```

## Safety Features

- **Dry-run by default**: Must explicitly use `--live` flag
- **Preset validation**: Pre-configured safe defaults
- **Progress reporting**: See exactly what's happening
- **Error handling**: Continues on failures, reports issues

## Tips

1. **Always test first**: Run with `--preset test` before live cleanup
2. **Start small**: Use low `--count` values when populating
3. **Check results**: Verify in Appwrite Console before/after
4. **Backup important data**: Storage operations are irreversible
5. **Use presets**: Safer than custom commands for beginners
