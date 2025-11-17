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

export type CommissionSummary = {
  clicks: number;
  bookings: number;
  pending: number;
  approved: number;
  paid: number;
  pendingAmount: number;
  approvedAmount: number;
  paidAmount: number;
  conversionRate: number; // bookings/clicks
};

export const affiliateAnalyticsService = {
  async trackClick(affiliateCode: string, path: string, referrer?: string) {
    try {
      const collectionId = COLS.affiliateClicks;
      if (!collectionId) return;
      const db = getDb(); if (!db) return;
      await db.createDocument(APPWRITE_CONFIG.databaseId, collectionId, ID.unique(), {
        affiliateCode,
        path,
        referrer: referrer || document.referrer || '',
        userAgent: navigator.userAgent,
        createdAt: new Date().toISOString()
      });
    } catch (e) {
      console.warn('affiliate click track failed', e);
    }
  },

  async getClicksByCode(affiliateCode: string): Promise<any[]> {
    try {
      const collectionId = COLS.affiliateClicks;
      if (!collectionId) return [];
      const db = getDb(); if (!db) return [];
      const res = await db.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, [
        Query.equal('affiliateCode', affiliateCode),
        Query.orderDesc('$createdAt'),
        Query.limit(500)
      ]);
      return res.documents;
    } catch {
      return [];
    }
  },

  async getAttributionsByCode(affiliateCode: string): Promise<any[]> {
    try {
      const collectionId = COLS.affiliateAttributions;
      if (!collectionId) return [];
      const db = getDb(); if (!db) return [];
      const res = await db.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, [
        Query.equal('affiliateCode', affiliateCode),
        Query.orderDesc('$createdAt'),
        Query.limit(500)
      ]);
      return res.documents;
    } catch {
      return [];
    }
  },

  async getSummary(affiliateCode: string): Promise<CommissionSummary> {
    const [clicks, attributions] = await Promise.all([
      this.getClicksByCode(affiliateCode),
      this.getAttributionsByCode(affiliateCode)
    ]);
    const bookings = attributions.length;
    const clicksCount = clicks.length;
    let pending = 0, approved = 0, paid = 0;
    let pendingAmount = 0, approvedAmount = 0, paidAmount = 0;
    for (const a of attributions) {
      const status = (a.commissionStatus || 'pending').toLowerCase();
      const amt = Number(a.commissionAmount || 0);
      if (status === 'pending') { pending++; pendingAmount += amt; }
      else if (status === 'approved') { approved++; approvedAmount += amt; }
      else if (status === 'paid') { paid++; paidAmount += amt; }
    }
    return {
      clicks: clicksCount,
      bookings,
      pending,
      approved,
      paid,
      pendingAmount,
      approvedAmount,
      paidAmount,
      conversionRate: clicksCount ? Math.round((bookings / clicksCount) * 1000) / 10 : 0
    };
  }
};
