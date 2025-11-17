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

const COLS = (APPWRITE_CONFIG as any).collections || ({} as any);

export type MembershipReferral = {
  $id?: string;
  affiliateCode: string;
  referredId?: string;
  referredType: 'therapist' | 'place';
  planId: string;
  planPrice: number;
  commissionRate: number;
  commissionAmount: number;
  status: 'pending' | 'approved' | 'paid';
  createdAt?: string;
};

export const membershipReferralService = {
  async recordReferral(input: {
    affiliateCode: string;
    referredId?: string;
    referredType: 'therapist' | 'place';
    planId: string;
    planPrice: number;
    commissionRate: number; // 0.20 => 20%
    status?: 'pending' | 'approved' | 'paid';
  }) {
    try {
      const collectionId = COLS.membershipReferrals;
      if (!collectionId) return null;
      const db = getDb(); if (!db) return null;
      const commissionAmount = Math.round((input.planPrice || 0) * (input.commissionRate || 0));
      const doc: Omit<MembershipReferral, '$id'> = {
        affiliateCode: input.affiliateCode,
        referredId: input.referredId,
        referredType: input.referredType,
        planId: input.planId,
        planPrice: input.planPrice,
        commissionRate: input.commissionRate,
        commissionAmount,
        status: input.status || 'pending',
        createdAt: new Date().toISOString(),
      };
      return await db.createDocument(APPWRITE_CONFIG.databaseId, collectionId, ID.unique(), doc as any);
    } catch (e) {
      console.warn('recordReferral failed', e);
      return null;
    }
  },

  async getByAffiliateCode(affiliateCode: string): Promise<MembershipReferral[]> {
    try {
      const collectionId = COLS.membershipReferrals;
      if (!collectionId) return [] as any;
      const db = getDb(); if (!db) return [] as any;
      const res = await db.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, [
        Query.equal('affiliateCode', affiliateCode),
        Query.orderDesc('$createdAt'),
        Query.limit(500)
      ]);
      return res.documents as any;
    } catch (e) {
      console.warn('getByAffiliateCode failed', e);
      return [] as any;
    }
  },

  async listAll(opts?: { status?: 'pending' | 'approved' | 'paid'; affiliateCode?: string; limit?: number }): Promise<MembershipReferral[]> {
    try {
      const collectionId = COLS.membershipReferrals;
      if (!collectionId) return [] as any;
      const db = getDb(); if (!db) return [] as any;
      const queries: any[] = [Query.orderDesc('$createdAt')];
      if (opts?.status) queries.push(Query.equal('status', opts.status));
      if (opts?.affiliateCode) queries.push(Query.equal('affiliateCode', opts.affiliateCode));
      queries.push(Query.limit(Math.min(Math.max(opts?.limit || 300, 1), 1000)));
      const res = await db.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, queries);
      return res.documents as any;
    } catch (e) {
      console.warn('listAll referrals failed', e);
      return [] as any;
    }
  },

  async updateStatus(id: string, status: 'pending' | 'approved' | 'paid') {
    try {
      const collectionId = COLS.membershipReferrals;
      if (!collectionId) return null;
      const db = getDb(); if (!db) return null;
      const patch: any = { status };
      if (status === 'approved') patch.approvedAt = new Date().toISOString();
      if (status === 'paid') patch.paidAt = new Date().toISOString();
      return await db.updateDocument(APPWRITE_CONFIG.databaseId, collectionId, id, patch);
    } catch (e) {
      console.warn('updateStatus failed', e);
      return null;
    }
  },

  async getApprovedTotal(affiliateCode: string): Promise<number> {
    const refs = await this.getByAffiliateCode(affiliateCode);
    return refs.filter(r => String((r as any).status || 'pending').toLowerCase() === 'approved')
      .reduce((sum, r: any) => sum + Number(r.commissionAmount || 0), 0);
  },

  async getApprovedTotalInWindow(affiliateCode: string, startIso: string, endIso: string): Promise<number> {
    try {
      const collectionId = COLS.membershipReferrals;
      if (!collectionId) return 0;
      const db = getDb(); if (!db) return 0;
      const res = await db.listDocuments(APPWRITE_CONFIG.databaseId, collectionId, [
        Query.equal('affiliateCode', affiliateCode),
        Query.equal('status', 'approved'),
        Query.greaterThanEqual('$createdAt', startIso),
        Query.lessThan('$createdAt', endIso),
        Query.limit(1000)
      ]);
      return (res.documents as any[]).reduce((sum, r: any) => sum + Number(r.commissionAmount || 0), 0);
    } catch (e) {
      console.warn('getApprovedTotalInWindow failed', e);
      return 0;
    }
  }
};

export default membershipReferralService;
