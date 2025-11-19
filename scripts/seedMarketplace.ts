/*
  Marketplace Seeder
  - Creates a demo seller and a demo product in Appwrite, using only attributes
    that exist in your current collection schemas to avoid write rejections.

  Configuration:
  - Uses APPWRITE_CONFIG for endpoint, project, database and collection IDs
  - Requires APPWRITE_API_KEY in env for server-side access

  Run:
    npm run seed:marketplace

  Env vars (PowerShell):
    $env:APPWRITE_API_KEY = "your_api_key_here"
*/

import { Client, Databases, Query } from 'node-appwrite';
import APPWRITE_CONFIG from '../lib/appwrite.config';

function getEnv(name: string, fallback?: string): string {
  const v = process.env[name] || fallback;
  if (!v) throw new Error(`${name} is required`);
  return v;
}

async function listAttributeKeys(databases: Databases, dbId: string, colId: string): Promise<Set<string>> {
  try {
    // @ts-ignore - node-appwrite supports listAttributes
    const res: any = await (databases as any).listAttributes(dbId, colId);
    const keys = new Set<string>();
    for (const a of (res?.attributes || [])) {
      if (a?.key) keys.add(a.key);
    }
    return keys;
  } catch (e) {
    // Fallback: unknown, return empty set so we won't filter (risk unknown attr). Better to attempt write and catch.
    return new Set<string>();
  }
}

function intersectPayload(payload: Record<string, any>, allowed: Set<string>): Record<string, any> {
  if (allowed.size === 0) return payload; // if unknown, do not filter
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(payload)) {
    if (allowed.has(k)) out[k] = v;
  }
  return out;
}

async function main() {
  const endpoint = APPWRITE_CONFIG.endpoint;
  const projectId = APPWRITE_CONFIG.projectId;
  const apiKey = getEnv('APPWRITE_API_KEY');
  const databaseId = APPWRITE_CONFIG.databaseId;
  const sellersCol = (APPWRITE_CONFIG.collections as any).marketplaceSellers as string;
  const productsCol = (APPWRITE_CONFIG.collections as any).marketplaceProducts as string;

  if (!sellersCol || !productsCol) throw new Error('Marketplace collection IDs not configured in appwrite.config.ts');

  const client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new Databases(client);

  // Resolve attribute keys
  const sellerKeys = await listAttributeKeys(databases, databaseId, sellersCol);
  const productKeys = await listAttributeKeys(databases, databaseId, productsCol);

  // Upsert a seller by tradingName or ownerEmail
  const tradingName = 'Demo Marketplace Seller';
  const ownerEmail = 'demo.seller@indastreet.example';

  let sellerDoc: any = null;
  try {
    const q: string[] = [];
    try { q.push(Query.equal('tradingName', tradingName) as unknown as string); } catch {}
    try { q.push(Query.equal('ownerEmail', ownerEmail) as unknown as string); } catch {}
    const list = await databases.listDocuments(databaseId, sellersCol, q.length ? q : [Query.limit(1)]);
    sellerDoc = (list.documents || [])[0] || null;
  } catch {}

  if (!sellerDoc) {
    const sellerPayload = {
      sellerId: 'seed-script',
      storeName: tradingName,
      storeDescription: 'Seeded seller for marketplace demo',
      isVerified: false,
      categories: 'General',
      tradingName,
      whatsapp: '+6281234567890',
      countryCode: 'ID',
      lat: '-8.4095',
      lng: '115.1889',
      salesMode: 'local',
      shippingRates: '{}',
      ownerUserId: 'seed-script',
      ownerEmail,
      planTier: 'local',
      subscriptionStatus: 'trial',
      trialEndsAt: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      joinDate: new Date().toISOString()
    } as Record<string, any>;
    const safeSeller = intersectPayload(sellerPayload, sellerKeys);
    try {
      sellerDoc = await databases.createDocument(databaseId, sellersCol, 'unique()', safeSeller as any);
      console.log('Created seller:', sellerDoc.$id);
    } catch (e: any) {
      console.error('Failed to create seller:', e?.message || e);
      throw e;
    }
  } else {
    console.log('Using existing seller:', sellerDoc.$id);
  }

  // Upsert a product for this seller
  const productName = 'Demo Product';
  let productDoc: any = null;
  try {
    const list = await databases.listDocuments(databaseId, productsCol, [
      Query.equal('sellerId', sellerDoc.$id),
      Query.equal('name', productName),
      Query.limit(1)
    ]);
    productDoc = (list.documents || [])[0] || null;
  } catch {}

  if (!productDoc) {
    const productPayload = {
      name: productName,
      description: 'Seeded product for marketplace demo. Replace this with your real product.',
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop',
      price: 9900,
      currency: 'IDR',
      stockLevel: 10,
      sellerId: sellerDoc.$id,
      countryCode: 'ID',
      lat: -8.4095,
      lng: 115.1889,
      isActive: true
    } as Record<string, any>;
    const safeProduct = intersectPayload(productPayload, productKeys);
    try {
      productDoc = await databases.createDocument(databaseId, productsCol, 'unique()', safeProduct as any);
      console.log('Created product:', productDoc.$id);
    } catch (e: any) {
      console.error('Failed to create product:', e?.message || e);
      throw e;
    }
  } else {
    console.log('Using existing product:', productDoc.$id);
  }

  console.log('\nSeed complete.');
}

main().catch(err => {
  console.error('Seeder failed:', err?.message || err);
  process.exit(1);
});
