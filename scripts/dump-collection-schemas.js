/*
 Dump attributes and indexes for all collections into a report.

 Usage (PowerShell):
 $env:APPWRITE_ENDPOINT="https://syd.cloud.appwrite.io/v1"
 $env:APPWRITE_PROJECT_ID="68f23b11000d25eb3664"
 $env:APPWRITE_DATABASE_ID="68f76ee1000e64ca8d05"
 $env:APPWRITE_API_KEY="<api_key_with_databases.*>"
 node scripts/dump-collection-schemas.js
*/

const fs = require('fs');
const path = require('path');
const { Client, Databases } = require('node-appwrite');

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

  const report = {
    projectId,
    databaseId,
    endpoint,
    generatedAt: new Date().toISOString(),
    collections: []
  };

  try {
    const list = await databases.listCollections(databaseId);
    for (const col of list.collections) {
      const entry = {
        $id: col.$id,
        name: col.name,
        enabled: col.enabled,
        documentSecurity: col.documentSecurity,
        attributes: [],
        indexes: []
      };
      try {
        if (typeof databases.listAttributes === 'function') {
          const attrs = await databases.listAttributes(databaseId, col.$id);
          entry.attributes = (attrs.attributes || []).map(a => ({
            key: a.key,
            type: a.type,
            size: a.size,
            required: a.required,
            array: a.array,
            elements: a.elements,
            min: a.min,
            max: a.max,
            default: a.default
          }));
        }
      } catch (e) {
        entry.attributesError = e.message || String(e);
      }
      try {
        if (typeof databases.listIndexes === 'function') {
          const idx = await databases.listIndexes(databaseId, col.$id);
          entry.indexes = (idx.indexes || []).map(ix => ({
            key: ix.key,
            type: ix.type,
            attributes: ix.attributes,
            orders: ix.orders
          }));
        }
      } catch (e) {
        entry.indexesError = e.message || String(e);
      }
      report.collections.push(entry);
    }
  } catch (e) {
    console.error('❌ Failed to list collections:', e.message || String(e));
    process.exit(1);
  }

  const outDir = path.resolve(__dirname, '..', 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, 'appwrite-schema.json');
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), 'utf8');
  console.log(`\n📝 Schema report written to: ${outFile}`);
})();
