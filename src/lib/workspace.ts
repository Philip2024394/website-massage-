// Workspace service: centralized multi-tenant (hotel) context operations
// NOTE: Hotel/Villa features removed - this service is deprecated
// NOTE: Requires Appwrite collections: hotels (existing), hotelSettings, auditEvents
// Add these to APPWRITE_CONFIG.collections for full functionality.

import { databases, ID } from './appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';
import { logAuditEvent } from './auditLogger';

interface HotelProfileUpdate {
  name?: string;
  address?: string;
  contactNumber?: string;
  bannerImage?: string;
  logoImage?: string;
}

interface HotelSettings {
  hotelId: string;
  language?: string;
  lastTab?: string;
  notificationsEnabled?: boolean;
  updatedAt: string;
}

const getHotelProfile = async (hotelId: string) => {
  const resp = await databases.listDocuments(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.collections.hotels,
    [ `hotelId=${hotelId}` ]
  );
  return resp.documents[0] || null;
};

const updateHotelProfile = async (hotelId: string, updates: HotelProfileUpdate, actorId: string) => {
  // Idempotent update: load existing, merge only changed fields.
  const existing = await getHotelProfile(hotelId);
  if (!existing) throw new Error('Hotel profile not found');
  if (existing.locked) {
    await logAuditEvent({
      actorId,
      hotelId,
      action: 'profile_update_blocked_locked',
      details: { attemptedUpdates: updates },
    });
    throw new Error('Hotel dashboard is locked. Update blocked.');
  }
  const merged = { ...updates, updatedAt: new Date().toISOString() };
  await databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.collections.hotels,
    existing.$id,
    merged
  );
  await logAuditEvent({ actorId, hotelId, action: 'profile_updated', details: merged });
  return merged;
};

const ensureHotelProfile = async (hotelId: string) => {
  const existing = await getHotelProfile(hotelId);
  if (existing) return existing;
  const doc = await databases.createDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.collections.hotels,
    ID.unique(),
    {
      hotelId,
      name: 'Hotel',
      address: '',
      contactNumber: '',
      bannerImage: '',
      logoImage: '',
      locked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  return doc;
};

const lockHotelDashboard = async (hotelId: string, actorId: string) => {
  const existing = await ensureHotelProfile(hotelId);
  if (existing.locked) return existing; // Already locked
  const updated = await databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.collections.hotels,
    existing.$id,
    { locked: true, lastLockedAt: new Date().toISOString(), lockedBy: actorId }
  );
  await logAuditEvent({ actorId, hotelId, action: 'dashboard_locked', details: { lockedBy: actorId } });
  return updated;
};

const unlockHotelDashboard = async (hotelId: string, actorId: string) => {
  const existing = await ensureHotelProfile(hotelId);
  if (!existing.locked) return existing; // Already unlocked
  const updated = await databases.updateDocument(
    APPWRITE_CONFIG.databaseId,
    APPWRITE_CONFIG.collections.hotels,
    existing.$id,
    { locked: false, lastUnlockedAt: new Date().toISOString(), unlockedBy: actorId }
  );
  await logAuditEvent({ actorId, hotelId, action: 'dashboard_unlocked', details: { unlockedBy: actorId } });
  return updated;
};

// Settings persistence (replaces localStorage) - DEPRECATED: Hotel features removed
const getHotelSettings = async (hotelId: string): Promise<HotelSettings | null> => {
  try {
    // Note: hotelSettings collection not configured in APPWRITE_CONFIG
    // const resp = await databases.listDocuments(
    //   APPWRITE_CONFIG.databaseId,
    //   APPWRITE_CONFIG.collections.hotelSettings,
    //   [ `hotelId=${hotelId}` ]
    // );
    // return resp.documents[0] || null;
    console.warn('[Workspace] getHotelSettings deprecated - hotel features removed');
    return null;
  } catch (e) {
    console.warn('[Workspace] getHotelSettings failed', e);
    return null;
  }
};

const saveHotelSettings = async (hotelId: string, partial: Partial<HotelSettings>, actorId: string) => {
  // Note: hotelSettings collection not configured in APPWRITE_CONFIG
  console.warn('[Workspace] saveHotelSettings deprecated - hotel features removed');
  return partial;
  // const existing = await getHotelSettings(hotelId);
  // const payload = { ...partial, hotelId, updatedAt: new Date().toISOString() };
  // if (existing) {
  //   await databases.updateDocument(
  //     APPWRITE_CONFIG.databaseId,
  //     APPWRITE_CONFIG.collections.hotelSettings,
  //     existing.$id,
  //     payload
  //   );
  // } else {
  //   await databases.createDocument(
  //     APPWRITE_CONFIG.databaseId,
  //     APPWRITE_CONFIG.collections.hotelSettings,
  //     ID.unique(),
  //     payload
  //   );
  // }
  // await logAuditEvent({ actorId, hotelId, action: 'settings_saved', details: payload });
  // return payload;
};

export const workspace = {
  getHotelProfile,
  ensureHotelProfile,
  updateHotelProfile,
  lockHotelDashboard,
  unlockHotelDashboard,
  getHotelSettings,
  saveHotelSettings,
};

export type { HotelSettings, HotelProfileUpdate };