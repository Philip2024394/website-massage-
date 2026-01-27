import { Query } from 'appwrite';
import { APPWRITE_CONFIG } from '../config';
import { appwriteDatabases as databases } from '../client';

export const agentService = {
    async create(agent: any): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                'unique()',
                agent
            );
            return response;
        } catch (error) {
            console.error('Error creating agent:', error);
            throw error;
        }
    },
    
    async getAll(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                [Query.limit(100)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching agents:', error);
            return [];
        }
    },
    
    async getByCode(agentCode: string): Promise<any | null> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                [Query.equal('agentCode', agentCode), Query.limit(1)]
            );
            return response.documents.length > 0 ? response.documents[0] : null;
        } catch (error) {
            console.error('Error fetching agent by code:', error);
            return null;
        }
    },
    
    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.agents,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating agent:', error);
            throw error;
        }
    }
};
