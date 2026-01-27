import { ID, Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../config';
import { appwriteDatabases as databases } from '../client';

type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy';

export const agentShareAnalyticsService = {
    async trackShareInitiated(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
        platform: SharePlatform;
    }): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                ID.unique(),
                {
                    eventType: 'agent_share_initiated',
                    agentCode: params.agentCode,
                    providerType: params.providerType,
                    providerId: String(params.providerId),
                    platform: params.platform,
                    createdAt: new Date().toISOString()
                }
            );
        } catch (e) {
            console.warn('Failed to track share initiated', e);
        }
    },
    
    async trackShareClick(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
        platform?: SharePlatform;
        userAgent?: string;
    }): Promise<void> {
        try {
            await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                ID.unique(),
                {
                    eventType: 'agent_share_click',
                    agentCode: params.agentCode,
                    providerType: params.providerType,
                    providerId: String(params.providerId),
                    platform: params.platform || 'copy',
                    userAgent: params.userAgent || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
                    createdAt: new Date().toISOString()
                }
            );
        } catch (e) {
            console.warn('Failed to track share click', e);
        }
    },
    
    async getCountsByPlatform(params: {
        agentCode: string;
        providerType: 'therapist' | 'place';
        providerId: string | number;
    }): Promise<Record<SharePlatform, number>> {
        try {
            const res = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.analyticsEvents,
                [
                    Query.equal('eventType', 'agent_share_click'),
                    Query.equal('agentCode', params.agentCode),
                    Query.equal('providerType', params.providerType),
                    Query.equal('providerId', String(params.providerId)),
                    Query.limit(200)
                ]
            );
            const counts: Record<SharePlatform, number> = {
                whatsapp: 0,
                facebook: 0,
                twitter: 0,
                linkedin: 0,
                telegram: 0,
                copy: 0
            };
            for (const d of res.documents as any[]) {
                const p = (d.platform || 'copy') as SharePlatform;
                if (counts[p] !== undefined) counts[p]++;
            }
            return counts;
        } catch (e) {
            console.warn('Failed to fetch share click counts', e);
            return { whatsapp: 0, facebook: 0, twitter: 0, linkedin: 0, telegram: 0, copy: 0 };
        }
    }
};

export const recruitLookupService = {
    async therapistsByAgentCode(agentCode: string): Promise<any[]> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('agentCode', agentCode), Query.limit(100)]
            );
            return docs.documents;
        } catch (e) {
            console.warn('Failed to list therapists by agentCode', e);
            return [];
        }
    },
    
    async placesByAgentCode(agentCode: string): Promise<any[]> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('agentCode', agentCode), Query.limit(100)]
            );
            return docs.documents;
        } catch (e) {
            console.warn('Failed to list places by agentCode', e);
            return [];
        }
    }
};
