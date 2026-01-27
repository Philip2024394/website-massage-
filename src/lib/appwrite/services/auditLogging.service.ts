import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';
import type { PiiType } from '../../../utils/piiDetector';

export type AuditContext = 'message_send' | 'paste' | 'copy';

export interface AuditLogEntry {
    $id?: string;
    userId: string;
    role: 'customer' | 'therapist';
    bookingId?: string;
    conversationId?: string;
    detectedType: PiiType;
    detectedPattern?: string;
    reason?: string;
    excerpt?: string;
    fullContent: string;
    context: AuditContext;
    createdAt: string;
}

export interface AuditLogPayload {
    userId: string;
    role: 'customer' | 'therapist';
    bookingId?: string;
    conversationId?: string;
    detectedType: PiiType;
    detectedPattern?: string;
    reason?: string;
    excerpt?: string;
    fullContent: string;
    context: AuditContext;
}

export const auditLoggingService = {
    async logBlockedAttempt(entry: AuditLogPayload): Promise<AuditLogEntry | null> {
        try {
            const payload = {
                ...entry,
                createdAt: new Date().toISOString()
            };
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatAuditLogs,
                ID.unique(),
                payload
            );
            return response as AuditLogEntry;
        } catch (error) {
            console.error('Failed to log blocked chat attempt:', error);
            return null;
        }
    },

    async getRecentLogs(limit: number = 30): Promise<AuditLogEntry[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.chatAuditLogs,
                [
                    Query.orderDesc('createdAt'),
                    Query.limit(limit)
                ]
            );
            return response.documents as AuditLogEntry[];
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
            return [];
        }
    }
};
