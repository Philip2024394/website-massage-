import { Databases, Query } from 'appwrite';
import APPWRITE_CONFIG from './appwrite.config';
import { databases, ID, account } from './appwrite';

export type MarketplaceSeller = {
  $id: string;
  sellerId: string;
  storeName: string;
  storeDescription?: string;
  totalSales?: number;
  joinDate: string;
  isVerified: boolean;
  categories?: string;
  tradingName: string;
  whatsapp: string;
  profileImage?: string;
  countryCode?: string;
  lat?: string;
  lng?: string;
  salesMode?: string;
  shippingRates?: string;
  acceptedPayments?: string; // JSON string of string[] e.g., ["Stripe","PayPal"]
  websiteUrl?: string;
  ownerUserId?: string;
  ownerEmail?: string;
  planTier?: string;
  subscriptionStatus?: string;
  trialEndsAt?: string;
  priceRequestType?: string; // 'Wholesale' or 'Retail'
};

export type MarketplaceProduct = {
  $id: string;
  name: string;
  description?: string;
  image?: string;
  images?: string[]; // optional gallery (first used as cover)
  whatYouWillReceive?: string; // optional long text
  videoUrl?: string; // optional YouTube link
  price: number;
  quantity?: number; // quantity of pieces for the price
  priceUnit?: string; // 'Each', 'Joblot', 'Pallet', 'Set', 'Box', 'Container', 'Wholesale Lot'
  productColors?: string[]; // Array of color hex codes, max 5
  currency?: string;
  stockLevel?: number;
  condition?: string; // 'New' or 'Used'
  rating?: number; // Product rating 0-5
  promoPercent?: string | number; // percent string in Appwrite schema
  unitsSold?: string; // total units sold (string in schema)
  deliveryDays?: string; // estimated delivery days (string in schema)
  sellerId: string;
  countryCode?: string;
  lat?: string;
  lng?: string;
  isActive?: boolean;
};

export type AdminNotification = {
  $id: string;
  type?: string;
  productId?: string;
  sellerId?: string;
  message?: string;
  createdAt?: string;
  isRead?: boolean;
};

export const marketplaceService = {
  async listProductsByCountry(viewerCountryCode?: string): Promise<(MarketplaceProduct & { seller?: MarketplaceSeller })[]> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
      if (!colId) return [];
      const queries = [Query.limit(100)];
      const res = await databases.listDocuments(dbId, colId, queries);
      const products = ((res.documents || []) as any[] as MarketplaceProduct[]).filter(p => (p as any).isActive !== false);

      const sellerCol = (APPWRITE_CONFIG.collections as any).marketplaceSellers;
      let sellersById: Record<string, MarketplaceSeller> = {};
      if (sellerCol) {
        try {
          const sres = await databases.listDocuments(dbId, sellerCol, [Query.limit(100)]);
          const sellers = (sres.documents || []) as any[] as MarketplaceSeller[];
          sellersById = Object.fromEntries(sellers.map(s => [s.$id, s]));
        } catch (e) {
          console.warn('listProductsByCountry: could not load sellers, continuing without seller data', e);
        }
      }

      const withSellers = products.map(p => ({ ...p, seller: sellersById[p.sellerId] }));
      if (!viewerCountryCode) return withSellers;
      const cc = viewerCountryCode.toUpperCase();
      return withSellers.filter(p => {
        const s = p.seller;
        if (!s) return (p.countryCode || '').toUpperCase() === cc;
        const mode = (s.salesMode || 'local');
        if (mode === 'local') return (s.countryCode || '').toUpperCase() === cc;
        let rates: Record<string, number> = {};
        try {
          rates = s.shippingRates ? JSON.parse(s.shippingRates) : {};
        } catch {}
        return Object.prototype.hasOwnProperty.call(rates, cc);
      });
    } catch (e) {
      console.error('listProductsByCountry failed. Check Appwrite permissions (Read: Any) and IDs.', e);
      return [];
    }
  },

  async createSeller(input: {
    tradingName: string;
    whatsapp?: string; // schema requires; we'll enforce non-empty below
    contactEmail?: string;
    countryCode: string;
    salesMode?: 'local' | 'global';
    shippingRates?: Record<string, number>;
    profileImage?: string;
    lat?: number;
    lng?: number;
    acceptedPayments?: string[];
    websiteUrl?: string;
  }): Promise<MarketplaceSeller | null> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceSellers;
      if (!colId) {
        console.error('marketplaceSellers collection ID not configured');
        throw new Error('Collection ID not configured. Check appwrite.config.ts');
      }
      const me = await account.get();
      const ownerUserId = (me as any)?.$id as string;
      const ownerEmailFromAccount = ((me as any)?.email || '').toLowerCase();
      const ownerEmail = (input.contactEmail || ownerEmailFromAccount).trim().toLowerCase();
      // default trial window
      const trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const joinDate = new Date().toISOString();
      // Normalize whatsapp (required by schema)
      const whatsapp = (input.whatsapp || '').trim();
      if (!whatsapp) {
        throw new Error('whatsapp is required');
      }

      // Create with conservative payload (exclude optional fields that may not exist in schema)
      const payload: any = {
        sellerId: ownerUserId,
        storeName: input.tradingName,
        storeDescription: '',
        totalSales: 0,
        joinDate,
        isVerified: false,
        categories: '',
        tradingName: input.tradingName,
        whatsapp,
        profileImage: input.profileImage || '',
        countryCode: input.countryCode || '',
        lat: input.lat?.toString() || '',
        lng: input.lng?.toString() || '',
        salesMode: input.salesMode || 'local',
        shippingRates: input.salesMode === 'global' ? JSON.stringify(input.shippingRates || {}) : '{}',
        ownerUserId,
        ownerEmail,
        planTier: 'local',
        subscriptionStatus: 'trial',
        trialEndsAt
      };
      const doc = await databases.createDocument(dbId, colId, ID.unique(), payload as any);

      // Best-effort update for optional fields if the schema supports them
      try {
        const optionalPatch: any = {};
        if (Array.isArray(input.acceptedPayments)) {
          // Limit list to keep JSON under small schema size (100 chars)
          const list = input.acceptedPayments.filter(Boolean).map(s => String(s)).slice(0, 5);
          let ap = JSON.stringify(list);
          while (ap.length > 100 && list.length > 0) {
            list.pop();
            ap = JSON.stringify(list);
          }
          optionalPatch.acceptedPayments = ap;
        }
        if (typeof input.websiteUrl === 'string') {
          const raw = input.websiteUrl.trim();
          const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
          optionalPatch.websiteUrl = withScheme.slice(0, 50);
        }
        if (Object.keys(optionalPatch).length > 0) {
          await databases.updateDocument(dbId, colId, (doc as any).$id, optionalPatch);
        }
      } catch {
        // Ignore unknown attribute errors on optional fields
      }

      return (await databases.getDocument(dbId, colId, (doc as any).$id)) as any as MarketplaceSeller;
    } catch (e: any) {
      console.error('createSeller failed:', e);
      throw e; // Re-throw to surface the actual error
    }
  },

  async getSellerById(id: string): Promise<MarketplaceSeller | null> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceSellers;
      if (!colId) return null;
      const doc = await databases.getDocument(dbId, colId, id);
      return doc as any as MarketplaceSeller;
    } catch {
      return null;
    }
  },

  async getSellerByOwnerId(ownerUserId: string): Promise<MarketplaceSeller | null> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceSellers;
      if (!colId) return null;
      const res = await databases.listDocuments(dbId, colId, [Query.equal('ownerUserId', ownerUserId), Query.limit(1)]);
      const doc = (res.documents || [])[0];
      return (doc as any) || null;
    } catch {
      return null;
    }
  },

  async updateSeller(id: string, patch: Partial<MarketplaceSeller>): Promise<MarketplaceSeller | null> {
    const dbId = APPWRITE_CONFIG.databaseId;
    const colId = (APPWRITE_CONFIG.collections as any).marketplaceSellers;
    if (!colId) return null;
    try {
      const doc = await databases.updateDocument(dbId, colId, id, patch as any);
      return doc as any as MarketplaceSeller;
    } catch (e: any) {
      // Retry once without optional fields that may not exist in schema
      try {
        const safePatch = { ...patch } as any;
        delete safePatch.acceptedPayments;
        delete safePatch.websiteUrl;
        const doc = await databases.updateDocument(dbId, colId, id, safePatch);
        return doc as any as MarketplaceSeller;
      } catch {
        return null;
      }
    }
  },

  async createProduct(input: Omit<MarketplaceProduct, '$id'> & { name: string; price: number; sellerId: string; deliveryDays?: string | number; promoPercent?: string | number }): Promise<MarketplaceProduct | null> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
      if (!colId) {
        console.error('marketplaceProducts collection ID not configured');
        return null;
      }
      // Enforce product limits based on seller plan
      const seller = await this.getSellerById(input.sellerId).catch(() => null);
      if (!seller) {
        console.error('Seller not found:', input.sellerId);
        throw new Error('Seller not found');
      }
      const now = Date.now();
      const inTrial = !!seller.trialEndsAt && new Date(seller.trialEndsAt).getTime() > now && (seller.subscriptionStatus === 'trial');
      const isGlobalPlan = seller.planTier === 'global' && (seller.subscriptionStatus === 'active');
      if (!isGlobalPlan) {
        const count = await this.getSellerProductCount(input.sellerId).catch(() => 0);
        if (!inTrial && count >= 50) {
          throw new Error('Product limit reached. Upgrade to Global for unlimited products.');
        }
      }
      console.log('Creating product with payload:', input);
      
      // Build payload carefully, excluding undefined lat/lng
      const payload: any = {
        name: input.name,
        description: input.description || '',
        image: input.image || (input.images && input.images.length > 0 ? input.images[0] : '') || '',
        // Schema expects integer; coerce safely
        price: typeof input.price === 'number' ? Math.round(input.price) : parseInt(String(input.price || 0), 10) || 0,
        currency: input.currency || '',
        stockLevel: typeof input.stockLevel === 'number' ? input.stockLevel : 0,
        // Schema shows promoPercent as string; store as string
        promoPercent: (() => {
          const n = typeof input.promoPercent === 'number' ? Math.max(0, Math.min(50, Math.round(input.promoPercent))) : parseInt(String(input.promoPercent || '0'), 10) || 0;
          return String(n);
        })(),
        sellerId: input.sellerId,
        countryCode: input.countryCode || (seller.countryCode || ''),
        isActive: true,
        // Required by schema (string). Default to 6 days if not provided.
        deliveryDays: (typeof input.deliveryDays === 'number' ? String(Math.max(1, Math.min(60, Math.round(input.deliveryDays)))) : (String(input.deliveryDays || '').trim())) || '6'
      };
      
      // Only add optional fields if they have values
      if (Array.isArray(input.images) && input.images.length > 0) {
        payload.images = input.images.slice(0, 5);
      }
      if (input.whatYouWillReceive) {
        payload.whatYouWillReceive = input.whatYouWillReceive;
      }
      if (input.videoUrl) {
        payload.videoUrl = input.videoUrl;
      }
      
      // Handle lat/lng carefully - store as strings
      if (typeof input.lat === 'string' && input.lat.trim()) {
        payload.lat = input.lat;
      } else if (typeof input.lat === 'number' && !isNaN(input.lat)) {
        payload.lat = input.lat.toString();
      } else if (seller.lat) {
        payload.lat = seller.lat;
      }
      
      if (typeof input.lng === 'string' && input.lng.trim()) {
        payload.lng = input.lng;
      } else if (typeof input.lng === 'number' && !isNaN(input.lng)) {
        payload.lng = input.lng.toString();
      } else if ((seller as any).lng) {
        payload.lng = (seller as any).lng;
      }

      // Some schemas use a typo 'ing' instead of 'lng'; write both defensively
      if (payload.lng) {
        payload.ing = payload.lng;
      }
      
      console.log('Final payload:', payload);
      const doc = await databases.createDocument(dbId, colId, ID.unique(), payload);
      console.log('Product created:', doc);

      // Fire admin notification if configured
      try {
        const adminCol = (APPWRITE_CONFIG.collections as any).adminNotifications;
        if (adminCol) {
          const message = `${seller.tradingName || 'Seller'} published a new product: ${input.name}`;
          await databases.createDocument(dbId, adminCol, ID.unique(), {
            type: 'product_created',
            productId: (doc as any).$id,
            sellerId: input.sellerId,
            message,
            createdAt: new Date().toISOString(),
            isRead: false
          } as any);
        }
      } catch {}

      return doc as any as MarketplaceProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  },

  async listProductsBySeller(sellerId: string): Promise<MarketplaceProduct[]> {
    const dbId = APPWRITE_CONFIG.databaseId;
    const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
    if (!colId) return [];
    const res: any = await databases.listDocuments(dbId, colId, [Query.equal('sellerId', sellerId), Query.limit(100)]);
    return (res.documents || []) as MarketplaceProduct[];
  },

  async listAllProducts(): Promise<(MarketplaceProduct & { seller?: MarketplaceSeller })[]> {
    const dbId = APPWRITE_CONFIG.databaseId;
    const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
    if (!colId) return [];
    const res: any = await databases.listDocuments(dbId, colId, [Query.limit(200)]);
    const products = (res.documents || []) as MarketplaceProduct[];
    const sellerCol = (APPWRITE_CONFIG.collections as any).marketplaceSellers;
    let sellersById: Record<string, MarketplaceSeller> = {};
    if (sellerCol) {
      const sres = await databases.listDocuments(dbId, sellerCol, [Query.limit(200)]);
      const sellers = (sres.documents || []) as any[] as MarketplaceSeller[];
      sellersById = Object.fromEntries(sellers.map(s => [s.$id, s]));
    }
    return products.map(p => ({ ...p, seller: sellersById[p.sellerId] }));
  },

  async setProductActive(id: string, active: boolean): Promise<MarketplaceProduct | null> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
      if (!colId) return null;
      const doc = await databases.updateDocument(dbId, colId, id, { isActive: !!active } as any);
      return doc as any as MarketplaceProduct;
    } catch { return null; }
  },

  async getSellerProductCount(sellerId: string): Promise<number> {
    const dbId = APPWRITE_CONFIG.databaseId;
    const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
    if (!colId) return 0;
    const res: any = await databases.listDocuments(dbId, colId, [Query.equal('sellerId', sellerId), Query.limit(1)]);
    return (typeof res.total === 'number') ? res.total : ((res.documents || []).length);
  },

  async getProductById(id: string): Promise<MarketplaceProduct | null> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
      const doc = await databases.getDocument(dbId, colId, id);
      return doc as any as MarketplaceProduct;
    } catch { return null; }
  },

  // DEV utility: ensure a seller for current user and create a simple test product
  async devCreateTestProduct(opts?: { countryCode?: string; coords?: { lat?: number; lng?: number } }): Promise<MarketplaceProduct | null> {
    try {
      const me = await account.get();
      const ownerUserId = (me as any)?.$id as string;
      if (!ownerUserId) throw new Error('Not logged in');

      // Find or create seller for this user
      let seller = await this.getSellerByOwnerId(ownerUserId);
      if (!seller) {
        const email = ((me as any)?.email || '').split('@')[0] || 'TestUser';
        seller = await this.createSeller({
          tradingName: `${email}-Shop`,
          whatsapp: '',
          contactEmail: (me as any)?.email || '',
          countryCode: opts?.countryCode || 'ID',
          salesMode: 'local',
          profileImage: '',
          lat: typeof opts?.coords?.lat === 'number' ? opts?.coords?.lat : undefined,
          lng: typeof opts?.coords?.lng === 'number' ? opts?.coords?.lng : undefined,
          shippingRates: {}
        }) as any;
      }
      if (!seller) throw new Error('Could not create or find seller');

      const productName = `Test Product ${new Date().toLocaleTimeString()}`;
      const created = await this.createProduct({
        $id: '' as any,
        name: productName,
        description: 'Automated test item to verify marketplace flow.',
        whatYouWillReceive: 'One sample item',
        videoUrl: undefined,
        image: '',
        images: [],
        price: 10,
        stockLevel: 5,
        sellerId: seller.$id,
        countryCode: opts?.countryCode || seller.countryCode || 'ID',
        currency: '',
        lat: typeof opts?.coords?.lat === 'number' ? String(opts?.coords?.lat) : seller.lat,
        lng: typeof opts?.coords?.lng === 'number' ? String(opts?.coords?.lng) : seller.lng,
        isActive: true
      } as any);

      return created;
    } catch (e) {
      console.error('devCreateTestProduct failed:', e);
      return null;
    }
  },

  async listAdminNotifications(unreadOnly = false, limit = 50): Promise<AdminNotification[]> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).adminNotifications;
      if (!colId) return [];
      const queries = [Query.limit(Math.max(1, Math.min(200, limit)))];
      if (unreadOnly) queries.push(Query.equal('isRead', false));
      const res: any = await databases.listDocuments(dbId, colId, queries);
      const docs = (res.documents || []) as AdminNotification[];
      // Sort by createdAt desc if present
      return docs.sort((a,b)=>{
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        return tb - ta;
      });
    } catch {
      return [];
    }
  },

  async markAdminNotificationRead(id: string): Promise<boolean> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).adminNotifications;
      if (!colId) return false;
      await databases.updateDocument(dbId, colId, id, { isRead: true } as any);
      return true;
    } catch { return false; }
  },

  async markAllAdminNotificationsRead(): Promise<number> {
    try {
      const list = await this.listAdminNotifications(true, 200);
      let count = 0;
      for (const n of list) {
        const ok = await this.markAdminNotificationRead(n.$id);
        if (ok) count++;
      }
      return count;
    } catch { return 0; }
  },

  async incrementSoldCounter(productId: string): Promise<boolean> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
      if (!colId) return false;
      
      // Get current product
      const product = await this.getProductById(productId);
      if (!product) return false;
      
      // Parse current unitsSold (stored as string)
      const currentSold = parseInt(String(product.unitsSold || '0'), 10);
      const newSold = isNaN(currentSold) ? 1 : currentSold + 1;
      
      // Update the product
      await databases.updateDocument(dbId, colId, productId, {
        unitsSold: String(newSold)
      } as any);
      
      return true;
    } catch (e) {
      console.error('incrementSoldCounter failed:', e);
      return false;
    }
  }
};

export function computeDistanceKm(a: {lat?: number; lng?: number}, b: {lat?: number; lng?: number}): number | null {
  if (
    typeof a?.lat !== 'number' || isNaN(a.lat) ||
    typeof a?.lng !== 'number' || isNaN(a.lng) ||
    typeof b?.lat !== 'number' || isNaN(b.lat) ||
    typeof b?.lng !== 'number' || isNaN(b.lng)
  ) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(la1) * Math.cos(la2);
  const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  return Math.round(R * d * 10) / 10;
}
