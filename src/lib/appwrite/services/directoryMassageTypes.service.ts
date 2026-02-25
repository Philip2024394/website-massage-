/**
 * Directory Massage Types – fetch massage types directory from Appwrite.
 *
 * Collection: directory_massage_types_
 * Used by: Massage Types Directory page, PriceCardInfoPopover (when refactored to use Appwrite).
 *
 * When the collection is empty or the request fails, the app falls back to static constants
 * in massageDirectoryTraditional, massageDirectorySports, massageDirectoryTherapeutic, massageDirectoryWellness.
 */

import { databases } from '../config';
import { APPWRITE_CONFIG } from '../../appwrite.config';
import { Query } from 'appwrite';

export type DirectoryMassageCategory = 'traditional' | 'sports' | 'therapeutic' | 'wellness' | 'couples' | 'body_scrub' | 'prenatal' | 'head_scalp';

export interface DirectoryMassageTypeEntry {
  /** Appwrite document ID */
  id: string;
  /** Display name (e.g. "Office Relief Massage") */
  name: string;
  category: DirectoryMassageCategory;
  shortDescription: string;
  recommendedDuration: string;
  pressureLevel: string;
  focusAreas: string;
  idealFor: string;
  suggestedFrequency: string;
  techniqueStyle: string;
  postTreatmentNotes: string;
  recommendedAddOns: string;
  whatToExpect: string;
  imageThumbnail: string;
  /** If true, only show for place variant (spa), not home service */
  placeOnly?: boolean;
}

/** Appwrite document shape (attribute names can be snake_case in Appwrite). */
interface DirectoryMassageTypeDoc {
  $id: string;
  name: string;
  category: string;
  short_description?: string;
  shortDescription?: string;
  recommended_duration?: string;
  recommendedDuration?: string;
  pressure_level?: string;
  pressureLevel?: string;
  focus_areas?: string;
  focusAreas?: string;
  ideal_for?: string;
  idealFor?: string;
  suggested_frequency?: string;
  suggestedFrequency?: string;
  technique_style?: string;
  techniqueStyle?: string;
  post_treatment_notes?: string;
  postTreatmentNotes?: string;
  recommended_add_ons?: string;
  recommendedAddOns?: string;
  what_to_expect?: string;
  whatToExpect?: string;
  image_thumbnail?: string;
  imageThumbnail?: string;
  place_only?: boolean;
  placeOnly?: boolean;
}

function getStr(doc: DirectoryMassageTypeDoc, ...keys: (keyof DirectoryMassageTypeDoc)[]): string {
  for (const k of keys) {
    const v = (doc as any)[k];
    if (v != null && typeof v === 'string' && v.trim() !== '') return v.trim();
  }
  return '';
}

function mapDocToEntry(doc: DirectoryMassageTypeDoc): DirectoryMassageTypeEntry {
  const category = (getStr(doc, 'category') || 'traditional').toLowerCase() as DirectoryMassageCategory;
  const validCategory: DirectoryMassageCategory =
    category === 'sports' || category === 'therapeutic' || category === 'wellness' || category === 'couples' || category === 'body_scrub' || category === 'prenatal' || category === 'head_scalp' ? category : 'traditional';
  return {
    id: doc.$id,
    name: getStr(doc, 'name') || 'Unnamed',
    category: validCategory,
    shortDescription: getStr(doc, 'shortDescription', 'short_description'),
    recommendedDuration: getStr(doc, 'recommendedDuration', 'recommended_duration'),
    pressureLevel: getStr(doc, 'pressureLevel', 'pressure_level'),
    focusAreas: getStr(doc, 'focusAreas', 'focus_areas'),
    idealFor: getStr(doc, 'idealFor', 'ideal_for'),
    suggestedFrequency: getStr(doc, 'suggestedFrequency', 'suggested_frequency'),
    techniqueStyle: getStr(doc, 'techniqueStyle', 'technique_style'),
    postTreatmentNotes: getStr(doc, 'postTreatmentNotes', 'post_treatment_notes'),
    recommendedAddOns: getStr(doc, 'recommendedAddOns', 'recommended_add_ons'),
    whatToExpect: getStr(doc, 'whatToExpect', 'what_to_expect'),
    imageThumbnail: getStr(doc, 'imageThumbnail', 'image_thumbnail'),
    placeOnly: doc.place_only ?? doc.placeOnly ?? false,
  };
}

const COLLECTION_ID = APPWRITE_CONFIG.collections?.directoryMassageTypes;
const DATABASE_ID = APPWRITE_CONFIG.databaseId;

/**
 * Fetches all directory massage types from Appwrite.
 * Returns empty array if collection is not configured, missing, or request fails.
 */
export async function listDirectoryMassageTypes(options?: {
  category?: DirectoryMassageCategory;
  placeOnly?: boolean;
}): Promise<DirectoryMassageTypeEntry[]> {
  if (!COLLECTION_ID || !DATABASE_ID) {
    if (import.meta.env?.DEV) {
      console.log('[DirectoryMassageTypes] Collection not configured (directoryMassageTypes).');
    }
    return [];
  }
  try {
    const queries: string[] = [Query.limit(500)];
    if (options?.category) {
      queries.push(Query.equal('category', options.category));
    }
    if (options?.placeOnly != null) {
      queries.push(Query.equal('place_only', options.placeOnly));
    }
    const response = await databases.listDocuments<DirectoryMassageTypeDoc>(
      DATABASE_ID,
      COLLECTION_ID,
      queries
    );
    const docs = response.documents || [];
    return docs.map(mapDocToEntry);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const is404 = msg.includes('404') || (err as { code?: number })?.code === 404;
    if (import.meta.env?.DEV) {
      console.warn(
        '[DirectoryMassageTypes]',
        is404
          ? 'Collection "directory_massage_types_" not found. Create it in Appwrite Console (see docs/directory_massage_types_schema.md).'
          : 'Failed to fetch directory massage types:',
        msg
      );
    }
    return [];
  }
}

/**
 * Looks up a single directory entry by exact name (case-insensitive).
 * Uses Appwrite when available; returns undefined when collection is empty or fails.
 */
export async function getDirectoryMassageTypeByName(
  name: string,
  category?: DirectoryMassageCategory
): Promise<DirectoryMassageTypeEntry | undefined> {
  const list = await listDirectoryMassageTypes(category ? { category } : undefined);
  const normalized = (name || '').toLowerCase().trim();
  return list.find((e) => e.name.toLowerCase().trim() === normalized);
}

export const directoryMassageTypesService = {
  listDirectoryMassageTypes,
  getDirectoryMassageTypeByName,
};

/**
 * Builds the Appwrite Storage view URL for a directory thumbnail file.
 * Use this after uploading an image to the directory thumbnails bucket; store the returned URL in the document's image_thumbnail attribute.
 */
export function getDirectoryThumbnailViewUrl(fileId: string, bucketId?: string): string {
  const config = APPWRITE_CONFIG as { endpoint?: string; projectId?: string; directoryThumbnailsBucketId?: string; bucketId?: string };
  const endpoint = config.endpoint || 'https://syd.cloud.appwrite.io/v1';
  const projectId = config.projectId || '68f23b11000d25eb3664';
  const bucket = bucketId || config.directoryThumbnailsBucketId || config.bucketId || '68f76bdd002387590584';
  return `${endpoint}/storage/buckets/${bucket}/files/${fileId}/view?project=${projectId}`;
}
