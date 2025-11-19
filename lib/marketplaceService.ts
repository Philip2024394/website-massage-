import { Databases, Query } from 'appwrite';
import APPWRITE_CONFIG from './appwrite.config';
import { databases } from './appwrite';
import { formatAmountForUser } from '../utils/currency';

export type MarketplaceSeller = {
  $id: string;
  tradingName: string;
  whatsapp?: string;
  profileImage?: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
};

export type MarketplaceProduct = {
  $id: string;
  name: string;
  description?: string;
  image?: string;
  price: number;
  currency?: string; // optional; formatting uses viewer's country
  stockLevel?: number;
  sellerId: string;
  countryCode?: string;
  lat?: number;
  lng?: number;
};

export const marketplaceService = {
  async listProductsByCountry(viewerCountryCode?: string): Promise<(MarketplaceProduct & { seller?: MarketplaceSeller })[]> {
    const dbId = APPWRITE_CONFIG.databaseId;
    const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
    if (!colId) return [];
    const queries = [Query.limit(100)];
    if (viewerCountryCode) {
      queries.push(Query.equal('countryCode', viewerCountryCode));
    }
    const res = await databases.listDocuments(dbId, colId, queries);
    const products = (res.documents || []) as any[] as MarketplaceProduct[];
    // Fetch sellers in batch
    const sellerIds = Array.from(new Set(products.map(p => p.sellerId).filter(Boolean)));
    let sellersById: Record<string, MarketplaceSeller> = {};
    if (sellerIds.length) {
      const sellerCol = (APPWRITE_CONFIG.collections as any).marketplaceSellers;
      if (sellerCol) {
        const sres = await databases.listDocuments(dbId, sellerCol, [Query.limit(100)]);
        const sellers = (sres.documents || []) as any[] as MarketplaceSeller[];
        sellersById = Object.fromEntries(sellers.map(s => [s.$id, s]));
      }
    }
    return products.map(p => ({ ...p, seller: sellersById[p.sellerId] }));
  },

  async getProductById(id: string): Promise<MarketplaceProduct | null> {
    try {
      const dbId = APPWRITE_CONFIG.databaseId;
      const colId = (APPWRITE_CONFIG.collections as any).marketplaceProducts;
      const doc = await databases.getDocument(dbId, colId, id);
      return doc as any as MarketplaceProduct;
    } catch { return null; }
  }
};

export function computeDistanceKm(a: {lat?: number; lng?: number}, b: {lat?: number; lng?: number}): number | null {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const x = Math.sin(dLat/2)**2 + Math.sin(dLng/2)**2 * Math.cos(la1) * Math.cos(la2);
  const d = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x));
  return Math.round(R * d * 10) / 10;
}
