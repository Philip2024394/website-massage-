/**
 * Flagged Messages Service
 * Handles message flagging, storage, and moderation for admin review
 */

import { databases, DATABASE_ID } from '../config';
import { ID, Query } from 'appwrite';

export const FLAGGED_MESSAGES_COLLECTION_ID = 'flagged_messages';

export interface FlaggedMessage {
    $id?: string;
    messageId: string;
    originalContent: string;
    sanitizedContent?: string;
    senderId: string;
    receiverId: string;
    flaggedBy: string; // Admin ID who flagged it
    flaggedAt: string;
    flagReason: string;
    moderationScore: number;
    violations: string[];
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken';
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
}

/**
 * Flag a message for admin review
 */
export async function flagMessage(
    messageId: string,
    originalContent: string,
    senderId: string,
    receiverId: string,
    flaggedBy: string,
    flagReason: string,
    moderationScore: number,
    violations: string[],
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    sanitizedContent?: string
): Promise<FlaggedMessage> {
    try {
        const flaggedMessage = await databases.createDocument(
            DATABASE_ID,
            FLAGGED_MESSAGES_COLLECTION_ID,
            ID.unique(),
            {
                messageId,
                originalContent,
                sanitizedContent: sanitizedContent || originalContent,
                senderId,
                receiverId,
                flaggedBy,
                flaggedAt: new Date().toISOString(),
                flagReason,
                moderationScore,
                violations: violations.join('|'), // Store as pipe-separated string
                riskLevel,
                status: 'pending'
            }
        );
        
        return {
            ...flaggedMessage,
            violations: flaggedMessage.violations.split('|')
        } as FlaggedMessage;
    } catch (error) {
        console.error('Error flagging message:', error);
        throw error;
    }
}

/**
 * Get all flagged messages (for admin review)
 */
export async function getFlaggedMessages(
    status?: 'pending' | 'reviewed' | 'dismissed' | 'action_taken',
    limit: number = 100
): Promise<FlaggedMessage[]> {
    try {
        const queries = [
            Query.orderDesc('flaggedAt'),
            Query.limit(limit)
        ];
        
        if (status) {
            queries.push(Query.equal('status', status));
        }
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            FLAGGED_MESSAGES_COLLECTION_ID,
            queries
        );
        
        return response.documents.map(doc => ({
            ...doc,
            violations: doc.violations ? doc.violations.split('|') : []
        })) as FlaggedMessage[];
    } catch (error) {
        console.error('Error fetching flagged messages:', error);
        return [];
    }
}

/**
 * Update flagged message status
 */
export async function updateFlaggedMessageStatus(
    flagId: string,
    status: 'pending' | 'reviewed' | 'dismissed' | 'action_taken',
    reviewedBy: string,
    reviewNotes?: string
): Promise<void> {
    try {
        await databases.updateDocument(
            DATABASE_ID,
            FLAGGED_MESSAGES_COLLECTION_ID,
            flagId,
            {
                status,
                reviewedBy,
                reviewedAt: new Date().toISOString(),
                reviewNotes: reviewNotes || ''
            }
        );
    } catch (error) {
        console.error('Error updating flagged message:', error);
        throw error;
    }
}

/**
 * Get flagged messages by user (to identify repeat offenders)
 */
export async function getFlaggedMessagesByUser(userId: string): Promise<FlaggedMessage[]> {
    try {
        const response = await databases.listDocuments(
            DATABASE_ID,
            FLAGGED_MESSAGES_COLLECTION_ID,
            [
                Query.equal('senderId', userId),
                Query.orderDesc('flaggedAt'),
                Query.limit(50)
            ]
        );
        
        return response.documents.map(doc => ({
            ...doc,
            violations: doc.violations ? doc.violations.split('|') : []
        })) as FlaggedMessage[];
    } catch (error) {
        console.error('Error fetching user flagged messages:', error);
        return [];
    }
}

/**
 * Delete old flagged messages (30-day retention)
 */
export async function cleanupOldFlaggedMessages(): Promise<number> {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const response = await databases.listDocuments(
            DATABASE_ID,
            FLAGGED_MESSAGES_COLLECTION_ID,
            [
                Query.lessThan('flaggedAt', thirtyDaysAgo.toISOString()),
                Query.limit(100)
            ]
        );
        
        let deletedCount = 0;
        for (const doc of response.documents) {
            try {
                await databases.deleteDocument(
                    DATABASE_ID,
                    FLAGGED_MESSAGES_COLLECTION_ID,
                    doc.$id
                );
                deletedCount++;
            } catch (error) {
                console.error(`Error deleting flagged message ${doc.$id}:`, error);
            }
        }
        
        return deletedCount;
    } catch (error) {
        console.error('Error cleaning up old flagged messages:', error);
        return 0;
    }
}
