import fs from 'node:fs';
import path from 'node:path';

// List of stale/unreferenced local files to remove
const filesToRemove = [
  'main.tsx.backup',
  path.join('pages', 'MassagePlaceAdminDashboard_backup.tsx'),
  'debug-removeChild.html',
  'admin-test.js',
  'advanced-dom-tracker.js',
  'dom-error-diagnostic.js',
];

function removeIfExists(filePath: string) {
  const abs = path.resolve(process.cwd(), filePath);
  if (fs.existsSync(abs)) {
    try {
      const stat = fs.statSync(abs);
      if (stat.isDirectory()) {
        console.log(`Skipping directory: ${filePath}`);
        return;
      }
      fs.rmSync(abs, { force: true });
      console.log(`✓ Removed: ${filePath}`);
    } catch (err) {
      console.error(`✗ Failed to remove ${filePath}:`, err);
    }
  } else {
    console.log(`(not found) ${filePath}`);
  }
}

console.log('🧹 Removing stale local files...');
for (const f of filesToRemove) {
  removeIfExists(f);
}
console.log('Done.');
