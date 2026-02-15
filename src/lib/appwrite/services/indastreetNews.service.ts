/**
 * Indastreet News – fetch news posts from Appwrite collection indastreet_news.
 *
 * APPWRITE COLLECTION: indastreet_news (same database as app).
 * If the collection does not exist, run: APPWRITE_API_KEY=... npx ts-node scripts/setup-indastreet-news-collection.ts
 *
 * REQUIRED ATTRIBUTES (canonical – must match Appwrite collection):
 * - headline (string, 500, required)
 * - excerpt (string, 2000, required)
 * - date (string, 50, required)
 * - category (enum, required): techniques | producers | places-opening | places-closing | good-news | negative | headlines
 * - imageSrc (string, 1000, optional)
 * - published (boolean, optional, default true)
 * - order (integer, optional)
 */

import { databases, Query } from '../../appwrite';
import { APPWRITE_CONFIG } from '../../appwrite.config';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTION_ID = APPWRITE_CONFIG.collections.indastreetNews || 'indastreet_news';

export type NewsCategory = 'techniques' | 'producers' | 'places-opening' | 'places-closing' | 'good-news' | 'negative' | 'headlines';

export interface IndastreetNewsDocument {
  $id: string;
  headline: string;
  excerpt: string;
  date: string;
  category: NewsCategory;
  imageSrc?: string;
  published?: boolean;
  order?: number;
  $createdAt?: string;
  $updatedAt?: string;
}

export interface IndastreetNewsItem {
  id: string;
  headline: string;
  excerpt: string;
  date: string;
  category: NewsCategory;
  imageSrc?: string;
}

function mapDocToItem(doc: IndastreetNewsDocument): IndastreetNewsItem {
  return {
    id: doc.$id,
    headline: doc.headline || '',
    excerpt: doc.excerpt || '',
    date: doc.date || '',
    category: doc.category || 'headlines',
    imageSrc: doc.imageSrc || undefined,
  };
}

/**
 * List published news posts, newest first.
 * When collection has a `published` attribute, only documents with published=true are returned.
 * Returns [] if collection is missing or query fails (page still opens with fallback sample data).
 */
export async function listIndastreetNews(limit: number = 50): Promise<IndastreetNewsItem[]> {
  if (!COLLECTION_ID || !DATABASE_ID) {
    return [];
  }
  try {
    const queries = [Query.orderDesc('$createdAt'), Query.limit(limit)];
    const response = await databases.listDocuments<IndastreetNewsDocument>(
      DATABASE_ID,
      COLLECTION_ID,
      queries
    );
    const docs = response.documents || [];
    const published = docs.filter((d) => d.published !== false);
    return published.map(mapDocToItem);
  } catch (err: any) {
    const msg = err?.message || String(err);
    const is404 = msg.includes('404') || err?.code === 404;
    console.warn(
      '[Indastreet News]',
      is404 ? 'Collection indastreet_news not found. Run scripts/setup-indastreet-news-collection.ts or create it in Appwrite Console.' : 'Could not fetch from Appwrite:',
      msg
    );
    return [];
  }
}
