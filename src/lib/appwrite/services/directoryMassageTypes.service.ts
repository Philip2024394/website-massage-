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
import { ID, Query } from 'appwrite';

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
  createDirectoryMassageTypeDocument,
  updateDirectoryMassageTypeDocument,
  upsertDirectoryMassageTypeByName,
};

/** Payload for create/update. Use snake_case for Appwrite attributes. */
export interface DirectoryMassageTypePayload {
  name: string;
  category: DirectoryMassageCategory;
  short_description?: string;
  recommended_duration?: string;
  pressure_level?: string;
  focus_areas?: string;
  ideal_for?: string;
  suggested_frequency?: string;
  technique_style?: string;
  post_treatment_notes?: string;
  recommended_add_ons?: string;
  what_to_expect?: string;
  image_thumbnail?: string;
  place_only?: boolean;
}

/**
 * Creates a new directory massage type document in Appwrite.
 * Returns the created entry or null if collection is not configured or request fails.
 */
export async function createDirectoryMassageTypeDocument(
  payload: DirectoryMassageTypePayload
): Promise<DirectoryMassageTypeEntry | null> {
  if (!COLLECTION_ID || !DATABASE_ID) return null;
  try {
    const docId = ID.unique();
    const data: Record<string, unknown> = {
      name: payload.name,
      category: payload.category,
      ...(payload.short_description != null && { short_description: payload.short_description }),
      ...(payload.recommended_duration != null && { recommended_duration: payload.recommended_duration }),
      ...(payload.pressure_level != null && { pressure_level: payload.pressure_level }),
      ...(payload.focus_areas != null && { focus_areas: payload.focus_areas }),
      ...(payload.ideal_for != null && { ideal_for: payload.ideal_for }),
      ...(payload.suggested_frequency != null && { suggested_frequency: payload.suggested_frequency }),
      ...(payload.technique_style != null && { technique_style: payload.technique_style }),
      ...(payload.post_treatment_notes != null && { post_treatment_notes: payload.post_treatment_notes }),
      ...(payload.recommended_add_ons != null && { recommended_add_ons: payload.recommended_add_ons }),
      ...(payload.what_to_expect != null && { what_to_expect: payload.what_to_expect }),
      ...(payload.image_thumbnail != null && payload.image_thumbnail !== '' && { image_thumbnail: payload.image_thumbnail }),
      ...(payload.place_only != null && { place_only: payload.place_only }),
    };
    const doc = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_ID,
      docId,
      data as any
    );
    return mapDocToEntry(doc as unknown as DirectoryMassageTypeDoc);
  } catch (err) {
    if (import.meta.env?.DEV) console.warn('[DirectoryMassageTypes] create failed:', err);
    return null;
  }
}

/**
 * Updates an existing directory massage type document.
 * Only provided payload fields are updated (partial update).
 */
export async function updateDirectoryMassageTypeDocument(
  documentId: string,
  payload: Partial<DirectoryMassageTypePayload>
): Promise<DirectoryMassageTypeEntry | null> {
  if (!COLLECTION_ID || !DATABASE_ID || !documentId) return null;
  try {
    const data: Record<string, unknown> = {};
    if (payload.name != null) data.name = payload.name;
    if (payload.category != null) data.category = payload.category;
    if (payload.short_description != null) data.short_description = payload.short_description;
    if (payload.recommended_duration != null) data.recommended_duration = payload.recommended_duration;
    if (payload.pressure_level != null) data.pressure_level = payload.pressure_level;
    if (payload.focus_areas != null) data.focus_areas = payload.focus_areas;
    if (payload.ideal_for != null) data.ideal_for = payload.ideal_for;
    if (payload.suggested_frequency != null) data.suggested_frequency = payload.suggested_frequency;
    if (payload.technique_style != null) data.technique_style = payload.technique_style;
    if (payload.post_treatment_notes != null) data.post_treatment_notes = payload.post_treatment_notes;
    if (payload.recommended_add_ons != null) data.recommended_add_ons = payload.recommended_add_ons;
    if (payload.what_to_expect != null) data.what_to_expect = payload.what_to_expect;
    if (payload.image_thumbnail != null) data.image_thumbnail = payload.image_thumbnail;
    if (payload.place_only != null) data.place_only = payload.place_only;
    if (Object.keys(data).length === 0) {
      const existing = await databases.getDocument(DATABASE_ID, COLLECTION_ID, documentId);
      return mapDocToEntry(existing as unknown as DirectoryMassageTypeDoc);
    }
    const doc = await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_ID,
      documentId,
      data as any
    );
    return mapDocToEntry(doc as unknown as DirectoryMassageTypeDoc);
  } catch (err) {
    if (import.meta.env?.DEV) console.warn('[DirectoryMassageTypes] update failed:', err);
    return null;
  }
}

/**
 * Upserts a directory massage type by name: updates existing document or creates a new one.
 * Use this to save default thumbnail URLs to Appwrite so they persist.
 */
export async function upsertDirectoryMassageTypeByName(
  name: string,
  payload: DirectoryMassageTypePayload
): Promise<DirectoryMassageTypeEntry | null> {
  if (!name?.trim()) return null;
  const normalizedName = name.trim();
  const list = await listDirectoryMassageTypes();
  const existing = list.find((e) => e.name.toLowerCase().trim() === normalizedName.toLowerCase());
  if (existing) {
    return updateDirectoryMassageTypeDocument(existing.id, { ...payload, name: normalizedName });
  }
  return createDirectoryMassageTypeDocument({ ...payload, name: normalizedName });
}

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
