import { ID, Query } from 'appwrite';
import { databases } from '../../lib/appwrite';
import { COIN_CONFIG, CoinType } from '../../lib/coinConfig';

export interface CoinTransaction {
  $id?: string;
  userId: string;
  type: CoinType;
  amount: number;
  reason: string;
  status?: 'active' | 'expired' | 'spent';
  earnedAt: Date;
  expiryAt?: Date;
  metadata?: any;
}

export interface CoinBalance {
  total: number;
  active: number;
  expired: number;
  spent: number;
  expiringSoon: number;
}

const COLLECTION = {
  DB: 'prod',
  COINS: 'coins',
  HISTORY: 'coinHistory',
};

export const coinService = {
  async getCoinBalance(userId: string): Promise<CoinBalance> {
    // Lightweight mock implementation for archived file
    const history = await this.getTransactionHistory(userId, 1000);
    let active = 0, expired = 0, spent = 0, expiringSoon = 0;
    const now = new Date();
    history.forEach(h => {
      if (h.type === 'earn') {
        if (h.expiryAt && h.expiryAt < now) expired += h.amount; else active += h.amount;
        if (h.expiryAt) {
          const days = Math.ceil((h.expiryAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          if (days <= 30 && days > 0) expiringSoon += h.amount;
        }
      } else if (h.type === 'spend') {
        spent += Math.abs(h.amount);
      }
    });
    return { total: active, active, expired, spent, expiringSoon };
  },

  async getTransactionHistory(userId: string, limit = 100): Promise<CoinTransaction[]> {
    try {
      const res = await databases.listDocuments(COLLECTION.DB, COLLECTION.HISTORY, [
        Query.equal('userId', userId),
        Query.orderDesc('$createdAt'),
        Query.limit(limit)
      ]);
      return res.documents.map((d: any) => ({
        $id: d.$id,
        userId: d.userId,
        type: d.type,
        amount: d.amount,
        reason: d.reason,
        status: d.status,
        earnedAt: new Date(d.earnedAt ?? d.$createdAt),
        expiryAt: d.expiryAt ? new Date(d.expiryAt) : undefined,
        metadata: d.metadata
      }));
    } catch (e) {
      console.warn('coinService.getTransactionHistory (archived) failed, returning empty list', e);
      return [];
    }
  },
};
