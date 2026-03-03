/**
 * Indastreet Warehouse — Shop Service
 * Handles all Appwrite data operations for the shop:
 *   - Products   → shop_products   collection
 *   - Orders     → shop_orders     collection
 *   - Bank info  → shop_config     collection
 *   - File upload → shop_payments  storage bucket
 *
 * Every method falls back gracefully when the collection / bucket does not
 * yet exist in Appwrite (collection not found = 404), so the UI always
 * renders — it just uses local defaults until the CMS is populated.
 *
 * ── Appwrite collection schemas ─────────────────────────────────────────────
 *
 *  shop_products
 *    name         String  required
 *    category     String  required  (Scaffolding | Plastering | Drywall | Plumbing | Painting)
 *    description  String  required
 *    price        Integer required
 *    rating       Float   required
 *    reviewCount  Integer required
 *    images       String[]           (up to 4 URLs)
 *    unit         String  required
 *    isActive     Boolean default true
 *    sortOrder    Integer default 0
 *
 *  shop_orders
 *    orderRef        String  required
 *    customerName    String  required
 *    customerPhone   String  required
 *    deliveryAddress String  required
 *    items           String  required  (JSON stringified CartItem[])
 *    subtotal        Integer required
 *    seaFreight      Integer required
 *    total           Integer required
 *    selfPickup      Boolean default false
 *    pickupDate      String
 *    pickupTime      String
 *    proofOfPaymentUrl String
 *    status          String  default 'pending'
 *    createdAt       String  required  (ISO date)
 *
 *  shop_config  (single document, $id = 'bank_details')
 *    bankName        String
 *    accountName     String
 *    accountNumber   String
 *    branchCode      String
 *    swiftCode       String
 *    whatsappNumber  String
 *
 *  Storage bucket: shop_payments_bucket
 *    Stores proof-of-payment images uploaded by customers.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { ID, Query } from 'appwrite';
import { databases, storage } from '../config';
import { DATABASE_ID } from '../../appwrite';

// ─── Collection / Bucket IDs ──────────────────────────────────────────────────

export const SHOP_COLLECTION_IDS = {
  PRODUCTS: 'shop_products',
  ORDERS:   'shop_orders',
  CONFIG:   'shop_config',
} as const;

export const SHOP_BUCKET_ID = 'shop_payments_bucket';

// ─── Local types (mirrored in ShopPage) ───────────────────────────────────────

export interface AppwriteProduct {
  $id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  unit: string;
  isActive: boolean;
  sortOrder: number;
}

export interface AppwriteOrder {
  orderRef: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  items: string;          // JSON stringified
  subtotal: number;
  seaFreight: number;
  total: number;
  selfPickup: boolean;
  pickupDate?: string;
  pickupTime?: string;
  proofOfPaymentUrl?: string;
  status: string;
  createdAt: string;
}

export interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchCode: string;
  swiftCode: string;
  whatsappNumber: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Returns true if an Appwrite error means "collection / document not found". */
function isNotFound(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const code = (err as { code?: number | string }).code;
  // 404 = document / collection not found; 401 = permission denied (collection exists but no read)
  return code === 404 || code === '404' || code === 401 || code === '401';
}

// ─── Products ─────────────────────────────────────────────────────────────────

/**
 * Fetch all active products from Appwrite.
 * Returns an empty array (not an error) when the collection does not exist yet.
 */
export async function fetchShopProducts(): Promise<AppwriteProduct[]> {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      SHOP_COLLECTION_IDS.PRODUCTS,
      [
        Query.equal('isActive', true),
        Query.orderAsc('sortOrder'),
        Query.limit(100),
      ]
    );
    return res.documents as unknown as AppwriteProduct[];
  } catch (err) {
    if (isNotFound(err)) {
      console.info('[ShopService] shop_products collection not found — using static data');
      return [];
    }
    console.error('[ShopService] fetchShopProducts error:', err);
    return [];
  }
}

// ─── Orders ───────────────────────────────────────────────────────────────────

/**
 * Save a completed customer order to Appwrite.
 * Returns the created document $id on success, null on failure.
 */
export async function createShopOrder(order: AppwriteOrder): Promise<string | null> {
  try {
    const doc = await databases.createDocument(
      DATABASE_ID,
      SHOP_COLLECTION_IDS.ORDERS,
      ID.unique(),
      order
    );
    console.info('[ShopService] Order created:', doc.$id);
    return doc.$id;
  } catch (err) {
    if (isNotFound(err)) {
      console.warn('[ShopService] shop_orders collection not found — order not saved to Appwrite');
      return null;
    }
    console.error('[ShopService] createShopOrder error:', err);
    return null;
  }
}

// ─── Proof of Payment Upload ──────────────────────────────────────────────────

/**
 * Upload a proof-of-payment file to the shop_payments_bucket.
 * Returns the public view URL on success, null on failure.
 */
export async function uploadProofOfPayment(file: File, orderRef: string): Promise<string | null> {
  try {
    const safeRef = orderRef.replace(/[^a-z0-9_.-]/gi, '_');
    const fileId = `${safeRef}_${Date.now()}`;

    const uploaded = await storage.createFile(
      SHOP_BUCKET_ID,
      fileId,
      file
    );

    // Build the Appwrite file preview URL
    const endpoint = 'https://syd.cloud.appwrite.io/v1';
    const projectId = '68f23b11000d25eb3664';
    const url = `${endpoint}/storage/buckets/${SHOP_BUCKET_ID}/files/${uploaded.$id}/view?project=${projectId}`;

    console.info('[ShopService] Proof uploaded:', url);
    return url;
  } catch (err) {
    if (isNotFound(err)) {
      console.warn('[ShopService] shop_payments_bucket not found — file not uploaded to Appwrite');
      return null;
    }
    console.error('[ShopService] uploadProofOfPayment error:', err);
    return null;
  }
}

// ─── Bank / Config ────────────────────────────────────────────────────────────

/** Default bank details shown when the shop_config collection is not set up. */
export const DEFAULT_BANK_DETAILS: BankDetails = {
  bankName:       'First National Construction Bank',
  accountName:    'Indastreet Supplies Pty Ltd',
  accountNumber:  '1234 5678 9012',
  branchCode:     '632005',
  swiftCode:      'FNCBZAJJ',
  whatsappNumber: '27000000000', // ← Replace with real number in Appwrite shop_config
};

/**
 * Fetch bank / contact details from the shop_config collection.
 * Falls back to DEFAULT_BANK_DETAILS when the collection or document is absent.
 */
export async function fetchShopConfig(): Promise<BankDetails> {
  try {
    const doc = await databases.getDocument(
      DATABASE_ID,
      SHOP_COLLECTION_IDS.CONFIG,
      'bank_details'
    );
    return {
      bankName:       doc.bankName       || DEFAULT_BANK_DETAILS.bankName,
      accountName:    doc.accountName    || DEFAULT_BANK_DETAILS.accountName,
      accountNumber:  doc.accountNumber  || DEFAULT_BANK_DETAILS.accountNumber,
      branchCode:     doc.branchCode     || DEFAULT_BANK_DETAILS.branchCode,
      swiftCode:      doc.swiftCode      || DEFAULT_BANK_DETAILS.swiftCode,
      whatsappNumber: doc.whatsappNumber || DEFAULT_BANK_DETAILS.whatsappNumber,
    };
  } catch (err) {
    if (isNotFound(err)) {
      console.info('[ShopService] shop_config not found — using default bank details');
      return DEFAULT_BANK_DETAILS;
    }
    console.error('[ShopService] fetchShopConfig error:', err);
    return DEFAULT_BANK_DETAILS;
  }
}
