import { databases, DATABASE_ID, COLLECTIONS, Permission, Role } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

export const promoterService = {
  async createProfile(params: { userId: string; name: string; email: string }) {
    try {
      const { userId, name, email } = params;
      const dbId = APPWRITE_CONFIG.databaseId || DATABASE_ID;
      const promotersCol = (APPWRITE_CONFIG.collections as any)?.promoters || COLLECTIONS.PROMOTERS;
      const safeName = (name || email || 'New Promoter').trim();
      const agentId = (userId || '').slice(0, 64);
      // Generate a friendly short promotor ID like P-8F4K2Z using stable user-based suffix
      const baseCode = (userId || '').replace(/[^A-Za-z0-9]/g, '');
      const shortSuffix = (baseCode || 'PROMOTOR').slice(-8).toUpperCase();
      const agentCode = `P-${shortSuffix}`;
      const nowIso = new Date().toISOString();
      // Satisfy required fields of agents_collection_id schema (only known attributes)
      const doc: any = {
        agentId,
        isActive: true,
        contactNumber: '0000000000',
        name: safeName,
        email: (email || '').trim(),
        agentCode: agentCode,
        hasAcceptedTerms: false,
        // Likely-required compliance and counters (set safe defaults)
        streakMonths: 0,
        newSignUpsThisMonth: 0,
        recurringSignUpsThisMonth: 0,
        complianceAccepted: false,
        marketingAccepted: false,
        payoutEnabled: false,
        blocked: false,
        kycVerified: false,
        visitsLoggedThisMonth: 0,
        createdAt: nowIso,
        lastLogin: nowIso,
        totalEarnings: 0
      };
      return await databases.createDocument(
        dbId,
        promotersCol,
        userId,
        doc,
        [
          Permission.read(Role.user(userId)),
          Permission.update(Role.user(userId))
        ]
      );
    } catch (e: any) {
      // Surface clearer guidance if the collection is misconfigured
      try {
        const dbId = APPWRITE_CONFIG.databaseId || DATABASE_ID;
        const promotersCol = (APPWRITE_CONFIG.collections as any)?.promoters || COLLECTIONS.PROMOTERS;
        const baseMsg = (e && (e as any).message) || String(e);
        if (baseMsg && baseMsg.toLowerCase().includes('collection') && baseMsg.toLowerCase().includes('not be found')) {
          throw new Error(`Promoters collection not found. Please set APPWRITE_CONFIG.collections.promoters to your actual collection ID. Current value: '${promotersCol}' in database '${dbId}'.`);
        }
      } catch {}
      // If already exists, ignore
      try {
        const dbId = APPWRITE_CONFIG.databaseId || DATABASE_ID;
        const promotersCol = (APPWRITE_CONFIG.collections as any)?.promoters || COLLECTIONS.PROMOTERS;
        const d = await databases.getDocument(dbId, promotersCol, params.userId);
        return d;
      } catch {
        throw e;
      }
    }
  },

  async updateBankDetails(params: { userId: string; bankName: string; accountNumber: string; accountHolderName: string; whatsapp?: string; profileImageUrl?: string; idCardUrl?: string }) {
    const { userId, bankName, accountNumber, accountHolderName, whatsapp, profileImageUrl, idCardUrl } = params;
    const dbId = APPWRITE_CONFIG.databaseId || DATABASE_ID;
    const promotersCol = (APPWRITE_CONFIG.collections as any)?.promoters || COLLECTIONS.PROMOTERS;
    return databases.updateDocument(
      dbId,
      promotersCol,
      userId,
      {
        bankName,
        accountNumber,
        accountHolderName,
        whatsapp: whatsapp || '',
        profileImageUrl: profileImageUrl || '',
        idCardUrl: idCardUrl || '',
        updatedAt: new Date().toISOString()
      }
    );
  },

  async getProfile(userId: string) {
    const dbId = APPWRITE_CONFIG.databaseId || DATABASE_ID;
    const promotersCol = (APPWRITE_CONFIG.collections as any)?.promoters || COLLECTIONS.PROMOTERS;
    return databases.getDocument(dbId, promotersCol, userId);
  },

  async requestPayout(params: { userId: string; affiliateCode: string }) {
    const { userId, affiliateCode } = params;
    const now = new Date();
    const eta = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // +48 hours
    const dbId = APPWRITE_CONFIG.databaseId || DATABASE_ID;
    const payoutCol = (APPWRITE_CONFIG.collections as any)?.promoterPayoutRequests || COLLECTIONS.PROMOTER_PAYOUT_REQUESTS;
    return databases.createDocument(
      dbId,
      payoutCol,
      `${userId}_${Date.now()}`,
      {
        userId,
        affiliateCode,
        requestedAt: now.toISOString(),
        transferEta: eta.toISOString(),
        status: 'pending'
      }
    );
  },

  async orderTableStands(params: { userId: string; hotelOrVillaName: string; quantity: number; unitPrice: number; total: number; notes?: string; qrUrl: string }) {
    const { userId, hotelOrVillaName, quantity, unitPrice, total, notes, qrUrl } = params;
    const dbId = APPWRITE_CONFIG.databaseId || DATABASE_ID;
    const ordersCol = (APPWRITE_CONFIG.collections as any)?.promoterTableStandOrders || COLLECTIONS.PROMOTER_TABLE_STAND_ORDERS;
    return databases.createDocument(
      dbId,
      ordersCol,
      `${userId}_order_${Date.now()}`,
      {
        userId,
        hotelOrVillaName,
        quantity,
        unitPrice,
        total,
        notes: notes || '',
        qrUrl,
        status: 'requested',
        createdAt: new Date().toISOString()
      }
    );
  }
};

export default promoterService;
