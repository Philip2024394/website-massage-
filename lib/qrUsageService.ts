import { Client, Databases, ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from './appwrite.config';

let db: Databases | null = null;

function getDb(): Databases | null {
  try {
    if (db) return db;
    const client = new Client().setEndpoint(APPWRITE_CONFIG.endpoint).setProject(APPWRITE_CONFIG.projectId);
    db = new Databases(client);
    return db;
  } catch {
    return null;
  }
}

const COLS = (APPWRITE_CONFIG as any).collections || {} as any;

export const qrUsageService = {
  async logUsage(params: { userId: string; affiliateCode: string; usageType: string; venueName?: string; actionType: string; shareUrl: string }) {
    try {
      const collectionId = COLS.qrUsageLogs;
      if (!collectionId) return;
      const db = getDb(); if (!db) return;
      const { userId, affiliateCode, usageType, venueName, actionType, shareUrl } = params;
      const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      await db.createDocument(APPWRITE_CONFIG.databaseId, collectionId, ID.unique(), {
        userId: (userId || '').slice(0, 250),
        affiliateCode: (affiliateCode || '').slice(0, 250),
        usageType: (usageType || '').slice(0, 250),
        venueName: (venueName || '').slice(0, 250),
        actionType: (actionType || '').slice(0, 250),
        shareUrl: (shareUrl || '').slice(0, 500),
        userAgent: (ua || '').slice(0, 250),
        createdAt: new Date().toISOString().slice(0, 250)
      });
    } catch (e) {
      console.warn('qr usage log failed', e);
    }
  }
  ,
  async listLogs(params?: { limit?: number }) {
    try {
      const collectionId = COLS.qrUsageLogs;
      if (!collectionId) return [];
      const db = getDb(); if (!db) return [];
      const limit = params?.limit || 500;
      const res = await db.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, [
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]);
      return res.documents;
    } catch { return []; }
  }
  ,
  async getSummary() {
    const docs = await this.listLogs({ limit: 2000 });
    const byUsage: Record<string, number> = {};
    const byVenue: Record<string, number> = {};
    const actions: Record<string, number> = {};
    for (const d of docs) {
      const u = (d.usageType || '').toLowerCase();
      const v = (d.venueName || '').trim();
      const a = (d.actionType || '').toLowerCase();
      if (u) byUsage[u] = (byUsage[u] || 0) + 1;
      if (v) byVenue[v] = (byVenue[v] || 0) + 1;
      if (a) actions[a] = (actions[a] || 0) + 1;
    }
    return { total: docs.length, byUsage, byVenue, actions };
  }
};

export default qrUsageService;
