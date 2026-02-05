#!/usr/bin/env python3
"""
Appwrite Storage Population Script
Generates test files in storage buckets for development and testing purposes.

Usage:
    python scripts/development/populate-storage.py --bucket payment_proofs --count 50
    python scripts/development/populate-storage.py --all --count 100
"""

import os
import sys
import argparse
import random
from datetime import datetime, timedelta
from io import BytesIO
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

load_dotenv()

try:
    from appwrite.client import Client
    from appwrite.services.storage import Storage
    from appwrite.input_file import InputFile
    from appwrite.id import ID
except ImportError:
    print("❌ Error: appwrite package not installed")
    print("Install with: pip install appwrite")
    sys.exit(1)

# Configuration
APPWRITE_ENDPOINT = os.getenv('VITE_APPWRITE_ENDPOINT', 'https://cloud.appwrite.io/v1')
APPWRITE_PROJECT_ID = os.getenv('VITE_APPWRITE_PROJECT_ID')
APPWRITE_API_KEY = os.getenv('APPWRITE_API_KEY')

BUCKETS = {
    'payment_proofs': '67a3a0f5001a05f4c982',
    'chat_files': '67c5f85a00262bb6ea19'
}

class StoragePopulator:
    def __init__(self):
        """Initialize storage populator"""
        if not APPWRITE_PROJECT_ID or not APPWRITE_API_KEY:
            raise ValueError("Missing APPWRITE_PROJECT_ID or APPWRITE_API_KEY")
        
        self.client = Client()
        self.client.set_endpoint(APPWRITE_ENDPOINT)
        self.client.set_project(APPWRITE_PROJECT_ID)
        self.client.set_key(APPWRITE_API_KEY)
        
        self.storage = Storage(self.client)
        print(f"🔧 Initialized Storage Populator")
        print(f"📦 Project: {APPWRITE_PROJECT_ID}\n")
    
    def generate_test_image(self, size_kb: int = 100) -> bytes:
        """Generate a simple test image file"""
        # Create a simple bitmap header + random data
        size_bytes = size_kb * 1024
        header = b'BM' + size_bytes.to_bytes(4, 'little') + b'\x00' * 8
        data = os.urandom(size_bytes - len(header))
        return header + data
    
    def generate_random_date(self, days_back: int = 90) -> datetime:
        """Generate a random date in the past"""
        days_ago = random.randint(0, days_back)
        return datetime.now() - timedelta(days=days_ago)
    
    def populate_bucket(self, bucket_id: str, bucket_name: str, count: int):
        """Populate a bucket with test files"""
        print(f"{'='*60}")
        print(f"📁 Populating bucket: {bucket_name}")
        print(f"{'='*60}\n")
        
        file_types = {
            'payment_proofs': [
                'payment_proof_', 
                'transfer_', 
                'receipt_',
                'test_payment_',
                'temp_proof_'
            ],
            'chat_files': [
                'chat_image_',
                'attachment_',
                'shared_file_',
                'test_upload_'
            ]
        }
        
        prefixes = file_types.get(bucket_name, ['test_file_'])
        extensions = ['jpg', 'png', 'pdf', 'jpeg']
        
        uploaded = 0
        errors = 0
        
        for i in range(count):
            try:
                # Generate file metadata
                prefix = random.choice(prefixes)
                extension = random.choice(extensions)
                size_kb = random.randint(50, 500)  # 50KB to 500KB
                
                filename = f"{prefix}{random.randint(1000, 9999)}.{extension}"
                
                # Generate file content
                content = self.generate_test_image(size_kb)
                
                # Upload file
                file_id = ID.unique()
                
                result = self.storage.create_file(
                    bucket_id=bucket_id,
                    file_id=file_id,
                    file=InputFile.from_bytes(content, filename=filename)
                )
                
                uploaded += 1
                print(f"  ✅ [{uploaded}/{count}] Uploaded: {filename} ({size_kb} KB)")
                
            except Exception as e:
                errors += 1
                print(f"  ❌ Error uploading file {i+1}: {e}")
        
        print(f"\n{'='*60}")
        print(f"📊 SUMMARY for {bucket_name}")
        print(f"{'='*60}")
        print(f"✅ Uploaded: {uploaded}/{count}")
        print(f"❌ Errors:   {errors}")
        print()
    
    def populate_all(self, count_per_bucket: int):
        """Populate all buckets"""
        for bucket_name, bucket_id in BUCKETS.items():
            self.populate_bucket(bucket_id, bucket_name, count_per_bucket)

def main():
    parser = argparse.ArgumentParser(
        description='Populate Appwrite storage buckets with test files'
    )
    
    parser.add_argument(
        '--bucket',
        choices=list(BUCKETS.keys()) + ['all'],
        default='all',
        help='Bucket to populate (default: all)'
    )
    
    parser.add_argument(
        '--count',
        type=int,
        default=20,
        help='Number of files to create per bucket (default: 20)'
    )
    
    args = parser.parse_args()
    
    try:
        populator = StoragePopulator()
        
        if args.bucket == 'all':
            populator.populate_all(args.count)
        else:
            bucket_id = BUCKETS[args.bucket]
            populator.populate_bucket(bucket_id, args.bucket, args.count)
        
        print("✅ Population complete!")
        
    except Exception as e:
        print(f"\n❌ Fatal error: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
