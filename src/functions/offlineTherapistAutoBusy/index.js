/**
 * Offline Therapist Auto-Busy - Appwrite Function
 *
 * PURPOSE:
 * Therapists who are offline for 24+ hours are automatically set to "busy" for 12 hours
 * (at random end times within that window) so they don't stay offline indefinitely in listings.
 * After 12 hours they revert to offline until they log in again.
 *
 * TRIGGER: Cron (e.g. 0 * * * * = every hour)
 *
 * RULES:
 * - Offline 24h+ → set status to busy, store busyAutoUntil = now + 12h + random(0, 2h) in description
 * - Busy with busyAutoUntil in the past → set status back to busy (no offline), remove tag from description
 *
 * STORAGE: Uses description field with [AUTO_BUSY_UNTIL:ISO8601] (no schema change).
 */

import { Client, Databases, Query } from 'node-appwrite';

const AUTO_BUSY_TAG_REGEX = /\[AUTO_BUSY_UNTIL:([^\]]+)\]/;
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
const RANDOM_EXTRA_MS = 2 * 60 * 60 * 1000; // 0–2h random

function parseAutoBusyUntil(description) {
  if (!description || typeof description !== 'string') return null;
  const m = description.match(AUTO_BUSY_TAG_REGEX);
  if (!m) return null;
  const date = new Date(m[1]);
  return isNaN(date.getTime()) ? null : date;
}

function setAutoBusyUntil(description, isoString) {
  const tag = `[AUTO_BUSY_UNTIL:${isoString}]`;
  const without = (description || '').replace(AUTO_BUSY_TAG_REGEX, '').trim().replace(/\s+/g, ' ');
  return (without ? without + ' ' : '') + tag;
}

function removeAutoBusyTag(description) {
  if (!description || typeof description !== 'string') return description;
  return description.replace(AUTO_BUSY_TAG_REGEX, '').trim().replace(/\s+/g, ' ');
}

export default async ({ req, res, log, error }) => {
  const requiredEnv = {
    APPWRITE_FUNCTION_API_ENDPOINT: process.env.APPWRITE_FUNCTION_API_ENDPOINT,
    APPWRITE_FUNCTION_PROJECT_ID: process.env.APPWRITE_FUNCTION_PROJECT_ID,
    APPWRITE_API_KEY: process.env.APPWRITE_API_KEY,
    DATABASE_ID: process.env.DATABASE_ID,
    THERAPISTS_COLLECTION_ID: process.env.THERAPISTS_COLLECTION_ID
  };

  for (const [key, value] of Object.entries(requiredEnv)) {
    if (!value) {
      error(`Missing environment variable: ${key}`);
      return res.json({ success: false, error: `Missing: ${key}`, setToBusyCount: 0, revertedToOfflineCount: 0 }, 500);
    }
  }

  const client = new Client()
    .setEndpoint(requiredEnv.APPWRITE_FUNCTION_API_ENDPOINT)
    .setProject(requiredEnv.APPWRITE_FUNCTION_PROJECT_ID)
    .setKey(requiredEnv.APPWRITE_API_KEY);
  const databases = new Databases(client);

  const now = new Date();
  const nowISO = now.toISOString();
  const twentyFourHoursAgo = new Date(now.getTime() - TWENTY_FOUR_HOURS_MS).toISOString();

  let setToBusyCount = 0;
  let revertedToOfflineCount = 0;
  const errors = [];

  try {
    // --- 1) Offline 24h+ → set to busy for 12h (random end) ---
    log('Querying therapists offline for 24+ hours...');
    const offlineList = await databases.listDocuments(
      requiredEnv.DATABASE_ID,
      requiredEnv.THERAPISTS_COLLECTION_ID,
      [
        Query.equal('status', 'offline'),
        Query.lessThan('$updatedAt', twentyFourHoursAgo),
        Query.limit(100)
      ]
    );

    for (const doc of offlineList.documents) {
      try {
        const desc = doc.description || '';
        if (AUTO_BUSY_TAG_REGEX.test(desc)) continue; // already in auto-busy window

        const busyEnd = new Date(now.getTime() + TWELVE_HOURS_MS + Math.random() * RANDOM_EXTRA_MS);
        const busyEndISO = busyEnd.toISOString();
        const newDescription = setAutoBusyUntil(desc, busyEndISO);

        await databases.updateDocument(
          requiredEnv.DATABASE_ID,
          requiredEnv.THERAPISTS_COLLECTION_ID,
          doc.$id,
          {
            status: 'busy',
            availability: 'Busy',
            isLive: true,
            description: newDescription
          }
        );
        setToBusyCount++;
        log(`Set therapist ${doc.$id} to busy until ${busyEndISO}`);
      } catch (e) {
        error(`Error setting therapist ${doc.$id} to busy: ${e.message}`);
        errors.push({ id: doc.$id, action: 'setBusy', message: e.message });
      }
    }

    // --- 2) Busy with AUTO_BUSY_UNTIL in the past → remove tag only (stay busy; no offline in app) ---
    log('Querying busy therapists to check AUTO_BUSY_UNTIL...');
    const busyList = await databases.listDocuments(
      requiredEnv.DATABASE_ID,
      requiredEnv.THERAPISTS_COLLECTION_ID,
      [Query.equal('status', 'busy'), Query.limit(200)]
    );

    for (const doc of busyList.documents) {
      const until = parseAutoBusyUntil(doc.description);
      if (!until || until > now) continue;

      try {
        const newDescription = removeAutoBusyTag(doc.description || '');
        await databases.updateDocument(
          requiredEnv.DATABASE_ID,
          requiredEnv.THERAPISTS_COLLECTION_ID,
          doc.$id,
          {
            description: newDescription
          }
        );
        revertedToOfflineCount++;
        log(`Removed AUTO_BUSY_UNTIL tag from therapist ${doc.$id} (stays busy; no offline)`);
      } catch (e) {
        error(`Error removing tag from therapist ${doc.$id}: ${e.message}`);
        errors.push({ id: doc.$id, action: 'removeTag', message: e.message });
      }
    }

    log(`Done. Set to busy: ${setToBusyCount}, tag removed: ${revertedToOfflineCount}`);
    return res.json({
      success: true,
      serverTime: nowISO,
      setToBusyCount,
      revertedToOfflineCount,
      errorCount: errors.length,
      errors: errors.length ? errors : undefined
    });
  } catch (globalErr) {
    error(`Auto-busy function failed: ${globalErr.message}`);
    return res.json(
      {
        success: false,
        error: globalErr.message,
        serverTime: nowISO,
        setToBusyCount,
        revertedToOfflineCount,
        errorCount: errors.length + 1
      },
      500
    );
  }
};
