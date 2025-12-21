/**
 * Agent Analytics and Recruitment Services
 * Tracks agent performance, shares, and recruitment metrics
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';
import type { MonthlyAgentMetrics, AgentVisit } from '../../../types';
import { agentService } from './agent.service';

type SharePlatform = 'whatsapp' | 'facebook' | 'twitter' | 'linkedin' | 'telegram' | 'copy';

// ===== Agent Share Analytics =====
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

// ===== Recruit Lookup Service =====
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

// ===== Admin Agent Overview =====
export const adminAgentOverviewService = {
    async countTherapistsByAgentCode(agentCode: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.equal('agentCode', agentCode)]
            );
            return docs.total;
        } catch (error) {
            console.error('Error counting therapists by agentCode:', error);
            return 0;
        }
    },

    async countPlacesByAgentCode(agentCode: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.equal('agentCode', agentCode)]
            );
            return docs.total;
        } catch (error) {
            console.error('Error counting places by agentCode:', error);
            return 0;
        }
    },

    async countVisits(agentId: string): Promise<number> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                [Query.equal('agentId', agentId)]
            );
            return docs.total;
        } catch (error) {
            console.error('Error counting visits:', error);
            return 0;
        }
    },

    async getLatestMonthlySnapshot(agentId: string): Promise<MonthlyAgentMetrics | null> {
        try {
            const docs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'monthly_agent_metrics_collection_id',
                [
                    Query.equal('agentId', agentId),
                    Query.orderDesc('month'),
                    Query.limit(1)
                ]
            );
            const doc = docs.documents[0];
            if (!doc) return null;
            return {
                $id: doc.$id,
                agentId: doc.agentId,
                agentCode: doc.agentCode,
                month: doc.month,
                newSignUpsCount: doc.newSignUpsCount,
                recurringSignUpsCount: doc.recurringSignUpsCount,
                targetMet: doc.targetMet,
                streakCount: doc.streakCount,
                commissionRateApplied: doc.commissionRateApplied,
                calculatedAt: doc.calculatedAt
            };
        } catch (error) {
            console.error('Error fetching latest monthly snapshot:', error);
            return null;
        }
    },

    calculateCommissionDue(snapshot: MonthlyAgentMetrics | null): number {
        if (!snapshot) return 0;
        const baseRate = snapshot.commissionRateApplied || 20;
        const recurringRate = snapshot.targetMet ? 10 : 0;
        const assumedValuePerSignup = 100;
        const base = (snapshot.newSignUpsCount * assumedValuePerSignup) * (baseRate / 100);
        const recurring = (snapshot.recurringSignUpsCount * assumedValuePerSignup) * (recurringRate / 100);
        return Math.round(base + recurring);
    },

    async listAgentOverviews(): Promise<Array<{
        agentId: string; name: string; agentCode: string; tier?: string; visits: number;
        therapistSignups: number; placeSignups: number; monthNew: number; monthRecurring: number;
        targetMet: boolean; streakCount: number; commissionDue: number; payoutReady: boolean;
    }>> {
        try {
            const agents = await agentService.getAll();
            const rows: Array<any> = [];
            for (const a of agents) {
                const agentId = a.$id || a.agentId;
                const [therapistCount, placeCount, visitCount, snapshot] = await Promise.all([
                    this.countTherapistsByAgentCode(a.agentCode),
                    this.countPlacesByAgentCode(a.agentCode),
                    this.countVisits(agentId),
                    this.getLatestMonthlySnapshot(agentId)
                ]);
                const commissionDue = this.calculateCommissionDue(snapshot);
                rows.push({
                    agentId,
                    name: a.name,
                    agentCode: a.agentCode,
                    tier: a.tier,
                    visits: visitCount,
                    therapistSignups: therapistCount,
                    placeSignups: placeCount,
                    monthNew: snapshot?.newSignUpsCount || 0,
                    monthRecurring: snapshot?.recurringSignUpsCount || 0,
                    targetMet: !!snapshot?.targetMet,
                    streakCount: snapshot?.streakCount || 0,
                    commissionDue,
                    payoutReady: !!(a.bankAccountNumber && a.bankName && a.bankAccountName)
                });
            }
            return rows;
        } catch (error) {
            console.error('Error building agent overviews:', error);
            return [];
        }
    }
};

// ===== Agent Visit Service =====
export const agentVisitService = {
    async createVisit(visit: AgentVisit): Promise<AgentVisit> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                ID.unique(),
                {
                    agentId: visit.agentId.toString(),
                    agentName: visit.agentName,
                    agentCode: visit.agentCode,
                    providerName: visit.providerName,
                    providerType: visit.providerType,
                    whatsappNumber: visit.whatsappNumber,
                    visitDate: visit.visitDate,
                    locationLat: visit.location.lat,
                    locationLng: visit.location.lng,
                    locationAddress: visit.location.address,
                    locationTimestamp: visit.location.timestamp,
                    meetingNotes: visit.meetingNotes,
                    callbackDate: visit.callbackDate || '',
                    membershipAgreed: visit.membershipAgreed,
                    status: visit.status,
                    createdAt: visit.createdAt,
                    updatedAt: visit.updatedAt || ''
                }
            );
            console.log('✅ Agent visit created:', response.$id);
            return { ...visit, $id: response.$id };
        } catch (error) {
            console.error('Error creating agent visit:', error);
            throw error;
        }
    },

    async getVisitsByAgent(agentId: string): Promise<AgentVisit[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                [Query.equal('agentId', agentId), Query.orderDesc('createdAt'), Query.limit(100)]
            );
            return response.documents.map((doc: any) => ({
                $id: doc.$id,
                agentId: doc.agentId,
                agentName: doc.agentName,
                agentCode: doc.agentCode,
                providerName: doc.providerName,
                providerType: doc.providerType,
                whatsappNumber: doc.whatsappNumber,
                visitDate: doc.visitDate,
                location: {
                    lat: doc.locationLat,
                    lng: doc.locationLng,
                    address: doc.locationAddress,
                    timestamp: doc.locationTimestamp
                },
                meetingNotes: doc.meetingNotes,
                callbackDate: doc.callbackDate || undefined,
                membershipAgreed: doc.membershipAgreed,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt || undefined
            }));
        } catch (error) {
            console.error('Error fetching agent visits:', error);
            return [];
        }
    },

    async getAllVisits(filters?: {
        agentId?: string;
        providerType?: 'therapist' | 'place';
        membershipAgreed?: string;
        status?: string;
        dateFrom?: string;
        dateTo?: string;
    }): Promise<AgentVisit[]> {
        try {
            const queries: string[] = [Query.orderDesc('createdAt'), Query.limit(500)];
            if (filters?.agentId) queries.push(Query.equal('agentId', filters.agentId));
            if (filters?.providerType) queries.push(Query.equal('providerType', filters.providerType));
            if (filters?.membershipAgreed && filters.membershipAgreed !== 'all')
                queries.push(Query.equal('membershipAgreed', filters.membershipAgreed));
            if (filters?.status && filters.status !== 'all')
                queries.push(Query.equal('status', filters.status));

            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                queries
            );

            let visits = response.documents.map((doc: any) => ({
                $id: doc.$id,
                agentId: doc.agentId,
                agentName: doc.agentName,
                agentCode: doc.agentCode,
                providerName: doc.providerName,
                providerType: doc.providerType,
                whatsappNumber: doc.whatsappNumber,
                visitDate: doc.visitDate,
                location: {
                    lat: doc.locationLat,
                    lng: doc.locationLng,
                    address: doc.locationAddress,
                    timestamp: doc.locationTimestamp
                },
                meetingNotes: doc.meetingNotes,
                callbackDate: doc.callbackDate || undefined,
                membershipAgreed: doc.membershipAgreed,
                status: doc.status,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt || undefined
            }));

            if (filters?.dateFrom) visits = visits.filter((visit: any) => new Date(visit.visitDate) >= new Date(filters.dateFrom!));
            if (filters?.dateTo) visits = visits.filter((visit: any) => new Date(visit.visitDate) <= new Date(filters.dateTo!));

            return visits;
        } catch (error) {
            console.error('Error fetching all visits:', error);
            return [];
        }
    },

    async updateVisit(visitId: string, data: Partial<AgentVisit>): Promise<AgentVisit> {
        try {
            const updateData: any = {};
            if (data.providerName) updateData.providerName = data.providerName;
            if (data.providerType) updateData.providerType = data.providerType;
            if (data.whatsappNumber) updateData.whatsappNumber = data.whatsappNumber;
            if (data.meetingNotes) updateData.meetingNotes = data.meetingNotes;
            if (data.callbackDate !== undefined) updateData.callbackDate = data.callbackDate || '';
            if (data.membershipAgreed) updateData.membershipAgreed = data.membershipAgreed;
            if (data.status) updateData.status = data.status;
            updateData.updatedAt = new Date().toISOString();

            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                visitId,
                updateData
            );
            console.log('✅ Agent visit updated:', visitId);
            return {
                $id: response.$id,
                agentId: response.agentId,
                agentName: response.agentName,
                agentCode: response.agentCode,
                providerName: response.providerName,
                providerType: response.providerType,
                whatsappNumber: response.whatsappNumber,
                visitDate: response.visitDate,
                location: {
                    lat: response.locationLat,
                    lng: response.locationLng,
                    address: response.locationAddress,
                    timestamp: response.locationTimestamp
                },
                meetingNotes: response.meetingNotes,
                callbackDate: response.callbackDate || undefined,
                membershipAgreed: response.membershipAgreed,
                status: response.status,
                createdAt: response.createdAt,
                updatedAt: response.updatedAt || undefined
            };
        } catch (error) {
            console.error('Error updating visit:', error);
            throw error;
        }
    },

    async deleteVisit(visitId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agentVisits,
                visitId
            );
            console.log('✅ Agent visit deleted:', visitId);
        } catch (error) {
            console.error('Error deleting visit:', error);
            throw error;
        }
    },

    async getAgentStats(agentId: string): Promise<{
        totalVisits: number;
        completedVisits: number;
        pendingVisits: number;
        followupRequired: number;
        membershipsSigned: {
            '1month': number;
            '3month': number;
            '6month': number;
            '1year': number;
        };
    }> {
        try {
            const visits = await this.getVisitsByAgent(agentId);
            return {
                totalVisits: visits.length,
                completedVisits: visits.filter(v => v.status === 'completed').length,
                pendingVisits: visits.filter(v => v.status === 'pending').length,
                followupRequired: visits.filter(v => v.status === 'followup_required').length,
                membershipsSigned: {
                    '1month': visits.filter(v => v.membershipAgreed === '1month').length,
                    '3month': visits.filter(v => v.membershipAgreed === '3month').length,
                    '6month': visits.filter(v => v.membershipAgreed === '6month').length,
                    '1year': visits.filter(v => v.membershipAgreed === '1year').length
                }
            };
        } catch (error) {
            console.error('Error getting agent stats:', error);
            return {
                totalVisits: 0,
                completedVisits: 0,
                pendingVisits: 0,
                followupRequired: 0,
                membershipsSigned: { '1month': 0, '3month': 0, '6month': 0, '1year': 0 }
            };
        }
    }
};

// ===== Monthly Agent Metrics Service =====
export const monthlyAgentMetricsService = {
    async listByAgent(agentId: string, limit: number = 12): Promise<MonthlyAgentMetrics[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                'monthly_agent_metrics_collection_id',
                [Query.equal('agentId', agentId), Query.orderDesc('month'), Query.limit(limit)]
            );
            return response.documents.map((doc: any) => ({
                $id: doc.$id,
                agentId: doc.agentId,
                agentCode: doc.agentCode,
                month: doc.month,
                newSignUpsCount: doc.newSignUpsCount,
                recurringSignUpsCount: doc.recurringSignUpsCount,
                targetMet: doc.targetMet,
                streakCount: doc.streakCount,
                commissionRateApplied: doc.commissionRateApplied,
                calculatedAt: doc.calculatedAt,
            }));
        } catch (error) {
            console.error('Error listing monthly agent metrics:', error);
            return [];
        }
    },

    async getLatest(agentId: string): Promise<MonthlyAgentMetrics | null> {
        const list = await this.listByAgent(agentId, 1);
        return list[0] || null;
    }
};
