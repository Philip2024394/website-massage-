/**
 * Indastreet Blog – fetch blog posts from Appwrite collection indastreet_blog.
 * Collection ID: indastreet_blog. Images: Storage bucket blogImagesBucketId.
 */

import { databases, storage, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';
import type { IndastreetBlogDocument } from '../../../config/appwriteSchema';

const DATABASE_ID = APPWRITE_CONFIG.databaseId;
const COLLECTION_ID = APPWRITE_CONFIG.collections.indastreetBlog || 'indastreet_blog';
const BUCKET_ID = (APPWRITE_CONFIG as any).blogImagesBucketId || APPWRITE_CONFIG.bucketId;
const ENDPOINT = APPWRITE_CONFIG.endpoint;
const PROJECT_ID = APPWRITE_CONFIG.projectId;

export type BlogCategory = 'international' | 'industry' | 'techniques' | 'career' | 'wellness';

export interface IndastreetBlogItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category: BlogCategory;
  author: string;
  date: string;
  readTime: string;
  image?: string;
  imageFileId?: string;
  featured: boolean;
  published: boolean;
  order?: number;
  $createdAt?: string;
  $updatedAt?: string;
}

function mapDocToItem(doc: IndastreetBlogDocument & { $id: string }): IndastreetBlogItem {
  return {
    id: doc.$id,
    title: doc.title || '',
    slug: doc.slug || '',
    excerpt: doc.excerpt || '',
    body: doc.body || '',
    category: (doc.category as BlogCategory) || 'industry',
    author: doc.author || '',
    date: doc.date || '',
    readTime: doc.readTime || '',
    image: doc.image || undefined,
    imageFileId: doc.imageFileId || undefined,
    featured: doc.featured ?? false,
    published: doc.published ?? true,
    order: doc.order,
    $createdAt: (doc as any).$createdAt,
    $updatedAt: (doc as any).$updatedAt,
  };
}

/**
 * Resolve image URL: use `image` if set (external or full URL), else build view URL from imageFileId.
 */
export function getBlogImageUrl(item: IndastreetBlogItem): string | undefined {
  if (item.image) return item.image;
  if (item.imageFileId && BUCKET_ID) {
    return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${item.imageFileId}/view?project=${PROJECT_ID}`;
  }
  return undefined;
}

/**
 * List published blog posts, by order then by $createdAt desc.
 * Returns [] if collection is missing or query fails.
 */
export async function listIndastreetBlog(limit: number = 50): Promise<IndastreetBlogItem[]> {
  if (!COLLECTION_ID || !DATABASE_ID) return [];
  try {
    const response = await databases.listDocuments<IndastreetBlogDocument & { $id: string }>(
      DATABASE_ID,
      COLLECTION_ID,
      [
        Query.equal('published', true),
        Query.orderDesc('order'),
        Query.orderDesc('$createdAt'),
        Query.limit(limit),
      ]
    );
    return (response.documents || []).map(mapDocToItem);
  } catch (err: any) {
    console.warn('[Indastreet Blog] Could not fetch list:', err?.message || err);
    return [];
  }
}

/**
 * Get a single published blog post by slug.
 * Returns null if not found or query fails.
 */
export async function getIndastreetBlogBySlug(slug: string): Promise<IndastreetBlogItem | null> {
  if (!COLLECTION_ID || !DATABASE_ID) return null;
  try {
    const response = await databases.listDocuments<IndastreetBlogDocument & { $id: string }>(
      DATABASE_ID,
      COLLECTION_ID,
      [Query.equal('slug', slug), Query.equal('published', true), Query.limit(1)]
    );
    const doc = response.documents?.[0];
    return doc ? mapDocToItem(doc) : null;
  } catch (err: any) {
    console.warn('[Indastreet Blog] Could not fetch by slug:', err?.message || err);
    return null;
  }
}

/**
 * Get a single blog post by document ID (admin or internal use).
 */
export async function getIndastreetBlogById(documentId: string): Promise<IndastreetBlogItem | null> {
  if (!COLLECTION_ID || !DATABASE_ID) return null;
  try {
    const doc = await databases.getDocument<IndastreetBlogDocument & { $id: string }>(
      DATABASE_ID,
      COLLECTION_ID,
      documentId
    );
    return doc ? mapDocToItem(doc) : null;
  } catch (err: any) {
    console.warn('[Indastreet Blog] Could not fetch by id:', err?.message || err);
    return null;
  }
}

/**
 * Upload a blog image to Appwrite Storage (blog bucket or main bucket).
 * Returns the public view URL and the file ID (store imageFileId in blog document if needed).
 */
export async function uploadBlogImage(file: File): Promise<{ url: string; fileId: string }> {
  if (!BUCKET_ID) throw new Error('Blog images bucket not configured');
  const fileId = ID.unique();
  const uploaded = await storage.createFile(BUCKET_ID, fileId, file);
  const id = (uploaded as { $id: string }).$id;
  const url = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${id}/view?project=${PROJECT_ID}`;
  return { url, fileId: id };
}
