// Facial Place Service – home cards, profile, dashboard (Appwrite facial_places collection)
import { Query } from 'appwrite';
// ID not needed for list/get/update
import { databases } from '../client';
import { APPWRITE_CONFIG } from '../../appwrite.config';
import { MOCK_FACIAL_PLACE } from '../../../constants/mockFacialPlace';

/** Normalize to therapist-style availability: Available | Busy (no Offline; default Busy) */
function normalizeAvailability(v: string | undefined): string {
    const s = String(v ?? 'busy').trim().toLowerCase();
    if (s === 'available') return 'Available';
    if (s === 'busy' || s === 'offline') return 'Busy';
    return 'Busy';
}

function mapDocToPlace(fp: any): any {
    const prices = (() => {
        const raw = fp.prices ?? fp.pricing;
        if (!raw) return {};
        try {
            const p = typeof raw === 'string' ? JSON.parse(raw) : raw;
            return typeof p === 'object' && p !== null ? p : {};
        } catch {
            return {};
        }
    })();
    const price60 = prices['60'] ?? prices.price60 ?? fp.price60 ?? 0;
    const price90 = prices['90'] ?? prices.price90 ?? fp.price90 ?? 0;
    const price120 = prices['120'] ?? prices.price120 ?? fp.price120 ?? 0;
    const galleryImages = (() => {
        const raw = fp.galleryImages ?? fp.galleryimages;
        if (!raw) return [];
        try {
            const arr = typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
            return arr.map((item: any) => ({
                imageUrl: item.imageUrl || item.url || '',
                caption: item.caption ?? item.header ?? '',
                header: item.header ?? item.caption ?? item.title ?? '',
                description: item.description ?? item.caption ?? '',
            }));
        } catch {
            return [];
        }
    })();
    const facialTypes = (() => {
        const raw = fp.facialtypes ?? fp.facialTypes;
        if (!raw) return [];
        try {
            return typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
        } catch {
            return [];
        }
    })();
    return {
        ...fp,
        id: fp.$id ?? fp.id,
        $id: fp.$id ?? fp.id,
        type: 'facial',
        name: fp.name || 'Unnamed Facial Spa',
        mainImage: fp.mainImage ?? fp.mainimage,
        profilePicture: fp.mainImage ?? fp.mainimage,
        address: fp.address ?? fp.location,
        location: fp.address ?? fp.location,
        description: fp.description,
        websiteUrl: fp.websiteurl,
        rating: fp.starrate != null ? parseFloat(String(fp.starrate)) : (fp.rating ?? 0),
        reviewCount: fp.reviewCount ?? fp.reviewcount ?? 0,
        // Online status – same as therapist: Available or Busy (no Offline)
        status: normalizeAvailability(fp.status ?? fp.availability ?? 'Busy'),
        availability: normalizeAvailability(fp.availability ?? fp.status ?? 'Busy'),
        isLive: fp.isLive !== false,
        city: fp.city,
        coordinates: fp.coordinates,
        lat: fp.lat ?? (typeof fp.coordinates === 'string' && fp.coordinates ? parseFloat(fp.coordinates.split(',')[0]) : undefined),
        lng: fp.lng ?? (typeof fp.coordinates === 'string' && fp.coordinates ? parseFloat(fp.coordinates.split(',')[1]) : undefined),
        whatsappNumber: fp.whatsappNumber ?? fp.whatsappnumber ?? fp.ownerWhatsApp ?? fp.ownerwhatsapp,
        operatingHours: fp.operatingHours ?? fp.openclosetime,
        price60: typeof price60 === 'number' ? price60 : (typeof price60 === 'string' ? parseInt(price60, 10) : 0),
        price90: typeof price90 === 'number' ? price90 : (typeof price90 === 'string' ? parseInt(price90, 10) : 0),
        price120: typeof price120 === 'number' ? price120 : (typeof price120 === 'string' ? parseInt(price120, 10) : 0),
        pricing: { 60: Number(price60) || 0, 90: Number(price90) || 0, 120: Number(price120) || 0 },
        facialTypes,
        galleryImages,
        amenities: (() => {
            const raw = fp.amenities;
            if (!raw) return [];
            try {
                return typeof raw === 'string' ? JSON.parse(raw) : Array.isArray(raw) ? raw : [];
            } catch {
                return [];
            }
        })(),
        facialServices: (() => {
            const raw = fp.facialservices;
            if (!raw) return [];
            try {
                return typeof raw === 'string' ? JSON.parse(raw) : raw;
            } catch {
                return [];
            }
        })(),
        openingTime: fp.openclosetime,
        closingTime: fp.openclosetime,
        discounted: fp.discounted,
        equipmentList: fp.equipmentList,
        popularityScore: fp.popularityScore,
        averageSessionDuration: fp.averageSessionDuration,
    };
}

export const facialPlaceService = {
    async getAll(): Promise<any[]> {
        try {
            const collectionId = APPWRITE_CONFIG.collections.facial_places;
            if (!collectionId || collectionId === '') {
                console.warn('⚠️ Facial places collection ID is EMPTY – returning mock.');
                return [MOCK_FACIAL_PLACE];
            }
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [Query.limit(100)]
            );
            const docs = response?.documents ?? [];
            if (docs.length === 0) {
                console.log('📋 No facial places in Appwrite – showing mock clinic.');
                return [MOCK_FACIAL_PLACE];
            }
            return docs.map((fp: any) => mapDocToPlace(fp));
        } catch (error) {
            console.warn('⚠️ Error fetching facial places – showing mock clinic:', error);
            return [MOCK_FACIAL_PLACE];
        }
    },

    /** Look up facial place by email (for sign-in routing to facial dashboard). */
    async getByEmail(email: string): Promise<any | null> {
        if (!email || !email.trim()) return null;
        const collectionId = APPWRITE_CONFIG.collections.facial_places;
        if (!collectionId || collectionId === '') return null;
        try {
            const resp = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [Query.equal('email', email.trim().toLowerCase()), Query.limit(1)]
            );
            if (resp.documents?.length > 0) return mapDocToPlace(resp.documents[0]);
        } catch (e: any) {
            if (e?.code !== 404) console.warn('Facial place getByEmail:', e?.message ?? e);
        }
        return null;
    },

    async getByProviderId(providerId: string): Promise<any | null> {
        if (!providerId) return null;
        const collectionId = APPWRITE_CONFIG.collections.facial_places;
        if (!collectionId) return null;
        try {
            const doc = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                providerId
            );
            if (doc && (doc as any).$id) return mapDocToPlace(doc);
        } catch (e: any) {
            if (e?.code !== 404) console.warn('Facial place getByProviderId:', e?.message ?? e);
        }
        try {
            const resp = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [Query.equal('placeId', providerId), Query.limit(1)]
            );
            if (resp.documents?.length > 0) return mapDocToPlace(resp.documents[0]);
        } catch (e2: any) {
            console.warn('Facial place placeId lookup:', e2?.message ?? e2);
        }
        return null;
    },

    async update(id: string, data: Record<string, any>): Promise<any> {
        const collectionId = APPWRITE_CONFIG.collections.facial_places;
        if (!collectionId) throw new Error('Facial places collection not configured');
        const payload: Record<string, any> = { ...data };
        if (payload.galleryImages != null && typeof payload.galleryImages !== 'string') {
            payload.galleryImages = JSON.stringify(payload.galleryImages);
        }
        if (payload.pricing != null && typeof payload.pricing !== 'string') {
            payload.pricing = JSON.stringify(payload.pricing);
        }
        if (payload.facialTypes != null && typeof payload.facialTypes !== 'string' && !Array.isArray(payload.facialTypes)) {
            payload.facialTypes = JSON.stringify(payload.facialTypes || []);
        }
        if (Array.isArray(payload.facialTypes)) {
            payload.facialTypes = JSON.stringify(payload.facialTypes);
        }
        // Dashboard sends massagetypes (facial types) – ensure string for Appwrite
        if (payload.massagetypes != null && typeof payload.massagetypes !== 'string') {
            payload.massagetypes = Array.isArray(payload.massagetypes) ? JSON.stringify(payload.massagetypes) : JSON.stringify([]);
        }
        const doc = await databases.updateDocument(
            APPWRITE_CONFIG.databaseId,
            collectionId,
            id,
            payload
        );
        return mapDocToPlace(doc);
    },
};
