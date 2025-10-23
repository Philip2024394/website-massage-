#!/usr/bin/env node

/**
 * Migration Script for IndoStreet Massage Platform
 * This script helps migrate from the old flat structure to the new modular architecture
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIGRATION_STEPS = [
  {
    name: 'Backup Current Configuration',
    action: () => {
      if (fs.existsSync('package.json')) {
        fs.copyFileSync('package.json', 'package-backup.json');
        console.log('✅ Backed up package.json');
      }
      if (fs.existsSync('tsconfig.json')) {
        fs.copyFileSync('tsconfig.json', 'tsconfig-backup.json');
        console.log('✅ Backed up tsconfig.json');
      }
      if (fs.existsSync('vite.config.ts')) {
        fs.copyFileSync('vite.config.ts', 'vite.config-backup.ts');
        console.log('✅ Backed up vite.config.ts');
      }
    }
  },
  {
    name: 'Update Configuration Files',
    action: () => {
      if (fs.existsSync('package-new.json')) {
        fs.copyFileSync('package-new.json', 'package.json');
        console.log('✅ Updated package.json');
      }
      if (fs.existsSync('tsconfig-new.json')) {
        fs.copyFileSync('tsconfig-new.json', 'tsconfig.json');
        console.log('✅ Updated tsconfig.json');
      }
      if (fs.existsSync('vite.config-new.ts')) {
        fs.copyFileSync('vite.config-new.ts', 'vite.config.ts');
        console.log('✅ Updated vite.config.ts');
      }
    }
  },
  {
    name: 'Create Mobile Directory Structure',
    action: () => {
      const mobileDirs = [
        'mobile',
        'mobile/android',
        'mobile/ios',
        'mobile/src',
        'mobile/src/components',
        'mobile/src/screens',
        'mobile/src/navigation',
        'mobile/src/services'
      ];

      mobileDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
          console.log(`✅ Created ${dir}/`);
        }
      });
    }
  },
  {
    name: 'Generate Migration Report',
    action: () => {
      const report = {
        timestamp: new Date().toISOString(),
        oldStructure: {
          pages: fs.existsSync('pages') ? fs.readdirSync('pages') : [],
          components: fs.existsSync('components') ? fs.readdirSync('components') : [],
          lib: fs.existsSync('lib') ? fs.readdirSync('lib') : []
        },
        newStructure: {
          apps: fs.existsSync('src/apps') ? fs.readdirSync('src/apps') : [],
          shared: fs.existsSync('src/shared') ? fs.readdirSync('src/shared') : []
        },
        migrationStatus: 'Configuration Updated - Ready for File Migration'
      };

      fs.writeFileSync('migration-report.json', JSON.stringify(report, null, 2));
      console.log('✅ Generated migration report');
    }
  }
];

async function runMigration() {
  console.log('🚀 Starting IndoStreet Platform Migration...\n');

  for (const step of MIGRATION_STEPS) {
    console.log(`📋 ${step.name}`);
    try {
      await step.action();
      console.log('');
    } catch (error) {
      console.error(`❌ Error in ${step.name}:`, error.message);
      process.exit(1);
    }
  }

  console.log('✅ Migration setup completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Run: npm install');
  console.log('2. Move files according to MIGRATION.md');
  console.log('3. Update import paths');
  console.log('4. Test each app individually');
  console.log('5. Run: npm run dev');
  console.log('\n📖 See MIGRATION.md for detailed instructions');
}

// Check if this is the main module
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  runMigration().catch(console.error);
}

export { runMigration };