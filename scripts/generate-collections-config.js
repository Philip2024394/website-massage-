/*
 Generates a collections config from live Appwrite collections.

 It creates two files:
 - reports/appwrite-collections-list.json → flat list of { $id, name }
 - lib/appwrite.collections.json → name→id map using normalized names (lowercase, spaces→underscores)

 Usage (PowerShell):
 $env:APPWRITE_ENDPOINT="https://syd.cloud.appwrite.io/v1"
 $env:APPWRITE_PROJECT_ID="68f23b11000d25eb3664"
 $env:APPWRITE_DATABASE_ID="68f76ee1000e64ca8d05"
 $env:APPWRITE_API_KEY="<api_key_with_databases.*>"
 node scripts/generate-collections-config.js
*/

const fs = require('fs');
const path = require('path');
const { Client, Databases } = require('node-appwrite');

function normalizeName(name) {
  return String(name || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

(async () => {
  const endpoint = process.env.APPWRITE_ENDPOINT || 'https://syd.cloud.appwrite.io/v1';
  const projectId = process.env.APPWRITE_PROJECT_ID || '68f23b11000d25eb3664';
  const databaseId = process.env.APPWRITE_DATABASE_ID || '68f76ee1000e64ca8d05';
  const apiKey = process.env.APPWRITE_API_KEY;

  if (!apiKey) {
    console.error('❌ APPWRITE_API_KEY is required.');
    process.exit(1);
  }

  const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
  const databases = new Databases(client);

  const outDirReports = path.resolve(__dirname, '..', 'reports');
  const outDirLib = path.resolve(__dirname, '..', 'lib');
  fs.mkdirSync(outDirReports, { recursive: true });
  fs.mkdirSync(outDirLib, { recursive: true });

  try {
    const list = await databases.listCollections(databaseId);
    const all = list.collections.map(c => ({ $id: c.$id, name: c.name }));

    const listFile = path.join(outDirReports, 'appwrite-collections-list.json');
    fs.writeFileSync(listFile, JSON.stringify({ projectId, databaseId, endpoint, generatedAt: new Date().toISOString(), collections: all }, null, 2), 'utf8');

    const map = {};
    for (const c of all) {
      map[normalizeName(c.name)] = c.$id;
    }

    const cfgFile = path.join(outDirLib, 'appwrite.collections.json');
    fs.writeFileSync(cfgFile, JSON.stringify(map, null, 2), 'utf8');

    console.log('📝 Wrote:', listFile);
    console.log('📝 Wrote:', cfgFile);
    console.log('\nTip: You can import appwrite.collections.json at build time to avoid hardcoding IDs.');
  } catch (e) {
    console.error('❌ Failed to generate collections config:', e.message || String(e));
    process.exit(1);
  }
})();
