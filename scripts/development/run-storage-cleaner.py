#!/usr/bin/env python3
"""
Local Storage Cleaner Runner
Development utility to run storage cleaner locally with common presets.

Usage:
    python scripts/development/run-storage-cleaner.py --preset test
    python scripts/development/run-storage-cleaner.py --preset production
    python scripts/development/run-storage-cleaner.py --custom --days 30
"""

import os
import sys
import argparse
import subprocess
from pathlib import Path

# Project root
PROJECT_ROOT = Path(__file__).parent.parent.parent
CLEANER_SCRIPT = PROJECT_ROOT / 'scripts' / 'storage-cleaner.py'

PRESETS = {
    'test': {
        'description': 'Test mode - dry run with temp files',
        'args': ['--dry-run', '--no-temp', '--orphaned-only']
    },
    'dev': {
        'description': 'Development - clean old test files (30 days)',
        'args': ['--days', '30', '--bucket', 'all']
    },
    'staging': {
        'description': 'Staging - clean old files (60 days) with dry-run',
        'args': ['--dry-run', '--days', '60', '--bucket', 'all']
    },
    'production': {
        'description': 'Production - clean very old files (90 days)',
        'args': ['--days', '90', '--bucket', 'all']
    },
    'orphaned': {
        'description': 'Remove only orphaned files (dry-run)',
        'args': ['--dry-run', '--orphaned-only']
    },
    'payment-proofs': {
        'description': 'Clean old payment proofs (60 days)',
        'args': ['--days', '60', '--bucket', 'payment_proofs']
    }
}

def run_cleaner(args: list, dry_run: bool = True):
    """Run the storage cleaner with specified arguments"""
    cmd = [sys.executable, str(CLEANER_SCRIPT)] + args
    
    if dry_run and '--dry-run' not in args:
        cmd.append('--dry-run')
    
    print(f"🚀 Running: {' '.join(cmd)}\n")
    print(f"{'='*60}\n")
    
    try:
        result = subprocess.run(cmd, cwd=PROJECT_ROOT)
        return result.returncode
    except KeyboardInterrupt:
        print("\n\n⚠️  Interrupted by user")
        return 1
    except Exception as e:
        print(f"\n❌ Error running cleaner: {e}")
        return 1

def main():
    parser = argparse.ArgumentParser(
        description='Run storage cleaner with common presets',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=f"""
Available Presets:
{'='*60}
""" + '\n'.join(f"  {name:15} - {info['description']}" for name, info in PRESETS.items())
    )
    
    parser.add_argument(
        '--preset',
        choices=list(PRESETS.keys()),
        help='Run with a preset configuration'
    )
    
    parser.add_argument(
        '--custom',
        action='store_true',
        help='Run with custom arguments'
    )
    
    parser.add_argument(
        '--days',
        type=int,
        help='Delete files older than N days'
    )
    
    parser.add_argument(
        '--bucket',
        choices=['payment_proofs', 'chat_files', 'all'],
        help='Specific bucket to clean'
    )
    
    parser.add_argument(
        '--orphaned-only',
        action='store_true',
        help='Only delete orphaned files'
    )
    
    parser.add_argument(
        '--live',
        action='store_true',
        help='Actually delete files (disable dry-run)'
    )
    
    args = parser.parse_args()
    
    # Check if cleaner script exists
    if not CLEANER_SCRIPT.exists():
        print(f"❌ Error: Storage cleaner not found at {CLEANER_SCRIPT}")
        sys.exit(1)
    
    # Build command arguments
    cleaner_args = []
    
    if args.preset:
        # Use preset
        preset = PRESETS[args.preset]
        print(f"📋 Using preset: {args.preset}")
        print(f"   {preset['description']}\n")
        cleaner_args = preset['args'].copy()
        
    elif args.custom:
        # Build custom arguments
        if args.days:
            cleaner_args.extend(['--days', str(args.days)])
        if args.bucket:
            cleaner_args.extend(['--bucket', args.bucket])
        if args.orphaned_only:
            cleaner_args.append('--orphaned-only')
    else:
        # Default to test mode
        print("📋 No preset specified, using 'test' mode (dry-run)\n")
        cleaner_args = PRESETS['test']['args'].copy()
    
    # Run cleaner
    returncode = run_cleaner(cleaner_args, dry_run=not args.live)
    
    if returncode == 0:
        print("\n✅ Storage cleaner completed successfully")
    else:
        print(f"\n❌ Storage cleaner exited with code {returncode}")
    
    sys.exit(returncode)

if __name__ == '__main__':
    main()
