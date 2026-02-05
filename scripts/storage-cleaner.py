#!/usr/bin/env python3
"""
Appwrite Storage Cleaner
Automatically removes old, orphaned, or unused files from Appwrite storage buckets.

Features:
- Identifies files older than specified days
- Finds orphaned files not referenced in database
- Removes temporary/test files
- Generates cleanup reports
- Dry-run mode for safe testing

Usage:
    python storage-cleaner.py --dry-run
    python storage-cleaner.py --days 30 --bucket payment_proofs
    python storage-cleaner.py --orphaned-only
"""

import os
import sys
from datetime import datetime, timedelta
from typing import List, Dict, Set
import argparse
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

try:
    from appwrite.client import Client
    from appwrite.services.storage import Storage
    from appwrite.services.databases import Databases
    from appwrite.query import Query
except ImportError:
    print("❌ Error: appwrite package not installed")
    print("Install with: pip install appwrite")
    sys.exit(1)

# Appwrite Configuration
APPWRITE_ENDPOINT = os.getenv('VITE_APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
APPWRITE_PROJECT_ID = os.getenv('VITE_APPWRITE_PROJECT_ID')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY')  # Server API key with storage permissions
DATABASE_ID = os.getenv('VITE_APPWRITE_DATABASE_ID', '68f76ee1000e64ca8d05')

# Storage Buckets
BUCKETS = {
    'payment_proofs': '67a3a0f5001a05f4c982',
    'chat_files': '67c5f85a00262bb6ea19'
}

# Collection IDs for reference checking
COLLECTIONS = {
    'bookings': 'bookings_collection_id',
    'chat_messages': 'chat_messages_collection_id',
    'therapists': 'therapists_collection_id'
}

class AppwriteStorageCleaner:
    def __init__(self, dry_run: bool = True):
        """Initialize Appwrite Storage Cleaner"""
        self.dry_run = dry_run
        self.stats = {
            'scanned': 0,
            'deleted': 0,
            'errors': 0,
            'space_freed': 0
        }
        
        # Validate configuration
        if not APPWRITE_PROJECT_ID:
            raise ValueError("VITE_APPWRITE_PROJECT_ID not found in environment")
        if not APPWRITE_API_KEY:
            raise ValueError("APPWRITE_API_KEY not found in environment (use server API key)")
        
        # Initialize Appwrite client
        self.client = Client()
        self.client.set_endpoint(APPWRITE_ENDPOINT)
        self.client.set_project(APPWRITE_PROJECT_ID)
        self.client.set_key(APPWRITE_API_KEY)
        
        self.storage = Storage(self.client)
        self.databases = Databases(self.client)
        
        print(f"🔧 Initialized Appwrite Storage Cleaner")
        print(f"📊 Mode: {'DRY RUN (no files will be deleted)' if dry_run else 'LIVE (files will be deleted)'}")
        print(f"🌐 Endpoint: {APPWRITE_ENDPOINT}")
        print(f"📦 Project: {APPWRITE_PROJECT_ID}")
        print()
    
    def get_bucket_files(self, bucket_id: str, limit: int = 100) -> List[Dict]:
        """Get all files from a storage bucket"""
        files = []
        offset = 0
        
        while True:
            try:
                result = self.storage.list_files(
                    bucket_id=bucket_id,
                    queries=[
                        Query.limit(limit),
                        Query.offset(offset)
                    ]
                )
                
                batch = result['files']
                files.extend(batch)
                
                if len(batch) < limit:
                    break
                    
                offset += limit
                
            except Exception as e:
                print(f"❌ Error fetching files from bucket {bucket_id}: {e}")
                break
        
        return files
    
    def get_referenced_file_ids(self) -> Set[str]:
        """Get all file IDs referenced in database documents"""
        referenced_ids = set()
        
        # Check bookings collection for payment proof file IDs
        try:
            bookings = self.databases.list_documents(
                database_id=DATABASE_ID,
                collection_id=COLLECTIONS['bookings'],
                queries=[Query.limit(1000)]
            )
            
            for booking in bookings['documents']:
                if 'paymentProofFileId' in booking and booking['paymentProofFileId']:
                    referenced_ids.add(booking['paymentProofFileId'])
                    
            print(f"✅ Found {len(referenced_ids)} referenced files in bookings")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not check bookings: {e}")
        
        # Check chat messages for file attachments
        try:
            messages = self.databases.list_documents(
                database_id=DATABASE_ID,
                collection_id=COLLECTIONS['chat_messages'],
                queries=[Query.limit(1000)]
            )
            
            chat_files = 0
            for message in messages['documents']:
                if 'fileId' in message and message['fileId']:
                    referenced_ids.add(message['fileId'])
                    chat_files += 1
                    
            print(f"✅ Found {chat_files} referenced files in chat messages")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not check chat messages: {e}")
        
        # Check therapists for profile images
        try:
            therapists = self.databases.list_documents(
                database_id=DATABASE_ID,
                collection_id=COLLECTIONS['therapists'],
                queries=[Query.limit(100)]
            )
            
            profile_images = 0
            for therapist in therapists['documents']:
                if 'imageFileId' in therapist and therapist['imageFileId']:
                    referenced_ids.add(therapist['imageFileId'])
                    profile_images += 1
                    
            print(f"✅ Found {profile_images} referenced files in therapist profiles")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not check therapists: {e}")
        
        return referenced_ids
    
    def is_file_old(self, file: Dict, days_threshold: int) -> bool:
        """Check if file is older than threshold"""
        try:
            # Parse created date (ISO 8601 format: 2026-01-15T10:30:00.000+00:00)
            created_at = datetime.fromisoformat(file['$createdAt'].replace('Z', '+00:00'))
            threshold_date = datetime.now(created_at.tzinfo) - timedelta(days=days_threshold)
            return created_at < threshold_date
        except Exception as e:
            print(f"⚠️  Could not parse date for file {file['$id']}: {e}")
            return False
    
    def is_temp_file(self, file: Dict) -> bool:
        """Check if file is a temporary/test file"""
        name = file.get('name', '').lower()
        temp_patterns = ['test', 'temp', 'tmp', 'debug', 'demo', 'sample']
        return any(pattern in name for pattern in temp_patterns)
    
    def clean_bucket(
        self,
        bucket_id: str,
        bucket_name: str,
        days_old: int = None,
        orphaned_only: bool = False,
        remove_temp: bool = True
    ):
        """Clean files from a storage bucket"""
        print(f"\n{'='*60}")
        print(f"🧹 Cleaning bucket: {bucket_name} ({bucket_id})")
        print(f"{'='*60}")
        
        # Get all files
        files = self.get_bucket_files(bucket_id)
        print(f"📁 Found {len(files)} files in bucket")
        
        if len(files) == 0:
            print("✅ Bucket is empty")
            return
        
        # Get referenced files if checking for orphans
        referenced_ids = set()
        if orphaned_only:
            print("\n🔍 Checking for orphaned files...")
            referenced_ids = self.get_referenced_file_ids()
        
        # Process each file
        files_to_delete = []
        
        for file in files:
            self.stats['scanned'] += 1
            should_delete = False
            reason = []
            
            # Check if orphaned
            if orphaned_only and file['$id'] not in referenced_ids:
                should_delete = True
                reason.append("orphaned")
            
            # Check if old
            if days_old and self.is_file_old(file, days_old):
                should_delete = True
                reason.append(f"older than {days_old} days")
            
            # Check if temp file
            if remove_temp and self.is_temp_file(file):
                should_delete = True
                reason.append("temporary/test file")
            
            if should_delete:
                files_to_delete.append({
                    'file': file,
                    'reason': ', '.join(reason)
                })
        
        # Report findings
        print(f"\n📊 Found {len(files_to_delete)} files to delete")
        
        if len(files_to_delete) == 0:
            print("✅ No files need cleaning")
            return
        
        # Show preview
        print("\n📋 Files to be deleted:")
        for item in files_to_delete[:10]:  # Show first 10
            file = item['file']
            size_mb = file['sizeOriginal'] / (1024 * 1024)
            print(f"  • {file['name']} ({size_mb:.2f} MB) - {item['reason']}")
        
        if len(files_to_delete) > 10:
            print(f"  ... and {len(files_to_delete) - 10} more")
        
        # Calculate total size
        total_size = sum(f['file']['sizeOriginal'] for f in files_to_delete)
        total_size_mb = total_size / (1024 * 1024)
        print(f"\n💾 Total space to free: {total_size_mb:.2f} MB")
        
        # Delete files
        if self.dry_run:
            print("\n🔒 DRY RUN: No files were deleted")
            print("   Run without --dry-run to actually delete files")
        else:
            print("\n🗑️  Deleting files...")
            for item in files_to_delete:
                file = item['file']
                try:
                    self.storage.delete_file(
                        bucket_id=bucket_id,
                        file_id=file['$id']
                    )
                    self.stats['deleted'] += 1
                    self.stats['space_freed'] += file['sizeOriginal']
                    print(f"  ✅ Deleted: {file['name']}")
                except Exception as e:
                    self.stats['errors'] += 1
                    print(f"  ❌ Failed to delete {file['name']}: {e}")
    
    def clean_all_buckets(self, **kwargs):
        """Clean all configured storage buckets"""
        for bucket_name, bucket_id in BUCKETS.items():
            self.clean_bucket(bucket_id, bucket_name, **kwargs)
    
    def print_summary(self):
        """Print cleanup summary"""
        print(f"\n{'='*60}")
        print("📊 CLEANUP SUMMARY")
        print(f"{'='*60}")
        print(f"Files scanned:  {self.stats['scanned']}")
        print(f"Files deleted:  {self.stats['deleted']}")
        print(f"Errors:         {self.stats['errors']}")
        print(f"Space freed:    {self.stats['space_freed'] / (1024 * 1024):.2f} MB")
        
        if self.dry_run:
            print(f"\n🔒 DRY RUN: No actual changes were made")

def main():
    parser = argparse.ArgumentParser(
        description='Clean up old and orphaned files from Appwrite storage',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Run in dry-run mode (no files deleted)'
    )
    
    parser.add_argument(
        '--days',
        type=int,
        help='Delete files older than N days'
    )
    
    parser.add_argument(
        '--bucket',
        choices=list(BUCKETS.keys()) + ['all'],
        default='all',
        help='Specific bucket to clean (default: all)'
    )
    
    parser.add_argument(
        '--orphaned-only',
        action='store_true',
        help='Only delete orphaned files (not referenced in database)'
    )
    
    parser.add_argument(
        '--no-temp',
        action='store_true',
        help='Skip deletion of temporary/test files'
    )
    
    args = parser.parse_args()
    
    try:
        # Initialize cleaner
        cleaner = AppwriteStorageCleaner(dry_run=args.dry_run)
        
        # Clean specified bucket(s)
        if args.bucket == 'all':
            cleaner.clean_all_buckets(
                days_old=args.days,
                orphaned_only=args.orphaned_only,
                remove_temp=not args.no_temp
            )
        else:
            bucket_id = BUCKETS[args.bucket]
            cleaner.clean_bucket(
                bucket_id=bucket_id,
                bucket_name=args.bucket,
                days_old=args.days,
                orphaned_only=args.orphaned_only,
                remove_temp=not args.no_temp
            )
        
        # Print summary
        cleaner.print_summary()
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
