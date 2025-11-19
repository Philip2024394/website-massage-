import { Databases, Query } from 'appwrite';
import APPWRITE_CONFIG from './appwrite.config';
import { databases, account, ID } from './appwrite';

export type Membership = {
  $id: string;
  ownerUserId: string;
  ownerEmail?: string;
  tier: string; // 'basic' | 'pro' | 'premium'
  status: 'active' | 'canceled' | 'past_due';
  currentPeriodEnd?: string; // ISO date
};

export const membershipService = {
  async getMyMembership(): Promise<Membership | null> {
    try {
      const me = await account.get();
      const ownerUserId = (me as any)?.$id as string;
      const ownerEmail = ((me as any)?.email || '').toLowerCase();
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).memberships || '';
      if (!colId) return null;
      const res = await databases.listDocuments(dbId, colId, [
        Query.or([
          Query.equal('ownerUserId', ownerUserId),
          Query.equal('ownerEmail', ownerEmail)
        ]),
        Query.limit(1)
      ]);
      const doc = (res.documents || [])[0];
      return (doc as any) || null;
    } catch {
      return null;
    }
  },

  async upsertMyMembership(tier: string, status: Membership['status'], currentPeriodEnd?: string): Promise<Membership | null> {
    try {
      const me = await account.get();
      const ownerUserId = (me as any)?.$id as string;
      const ownerEmail = ((me as any)?.email || '').toLowerCase();
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).memberships || '';
      if (!colId) return null;

      const existing = await this.getMyMembership();
      if (existing) {
        const doc = await databases.updateDocument(dbId, colId, existing.$id, {
          tier,
          status,
          currentPeriodEnd: currentPeriodEnd || existing.currentPeriodEnd || null
        } as any);
        return doc as any;
      }

      const doc = await databases.createDocument(dbId, colId, ID.unique(), {
        ownerUserId,
        ownerEmail,
        tier,
        status,
        currentPeriodEnd: currentPeriodEnd || null
      } as any);
      return doc as any;
    } catch {
      return null;
    }
  }
};
