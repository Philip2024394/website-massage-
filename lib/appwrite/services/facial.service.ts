// Facial Place Service
import { databases } from '../client';
import { APPWRITE_CONFIG } from '../../appwrite.config';

export const facialPlaceService = {
    async getAll(): Promise<any[]> {
        try {
            const collectionId = APPWRITE_CONFIG.collections.facial_places;
            
            if (!collectionId || collectionId === '') {
                console.error('❌ Facial places collection ID is EMPTY!');
                return [];
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId
            );
            
            // Map Appwrite attributes to camelCase for frontend compatibility
            const mappedFacialPlaces = response.documents.map((fp: any) => {
                return {
                    ...fp,
                    id: fp.$id,
                    name: fp.name || 'Unnamed Facial Spa',
                    mainImage: fp.mainImage || fp.mainimage,
                    profilePicture: fp.mainImage || fp.mainimage,
                    address: fp.address,
                    location: fp.address,
                    description: fp.description,
                    websiteUrl: fp.websiteurl,
                    starRate: fp.starrate,
                    rating: fp.starrate ? parseFloat(fp.starrate) : 0,
                    distanceKm: fp.distancekm,
                    category: fp.category,
                    isLive: true,
                    facialTypes: (() => {
                        const raw = fp.facialtypes;
                        if (!raw) return [];
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing facial types:', e);
                            return [];
                        }
                    })(),
                    facialServices: (() => {
                        const raw = fp.facialservices;
                        if (!raw) return [];
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing facial services:', e);
                            return [];
                        }
                    })(),
                    prices: (() => {
                        const raw = fp.prices;
                        if (!raw) return {};
                        try {
                            return typeof raw === 'string' ? JSON.parse(raw) : raw;
                        } catch (e) {
                            console.error('Error parsing prices:', e);
                            return {};
                        }
                    })(),
                    openingTime: fp.openclosetime,
                    closingTime: fp.openclosetime,
                    discounted: fp.discounted,
                    equipmentList: fp.equipmentList,
                    popularityScore: fp.popularityScore,
                    averageSessionDuration: fp.averageSessionDuration
                };
            });
            
            return mappedFacialPlaces;
        } catch (error) {
            console.error('❌ Error fetching facial places:', error);
            return [];
        }
    }
};
