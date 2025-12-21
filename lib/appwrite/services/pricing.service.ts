/**
 * Pricing Service
 * Manages service pricing and packages
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const pricingService = {
    async getAll(): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.pricing
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pricing:', error);
            return [];
        }
    },

    async getByType(type: string): Promise<any[]> {
        try {
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.pricing,
                [Query.equal('type', type)]
            );
            return response.documents;
        } catch (error) {
            console.error('Error fetching pricing by type:', error);
            return [];
        }
    },

    async create(pricing: any): Promise<any> {
        try {
            const response = await databases.createDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.pricing,
                ID.unique(),
                pricing
            );
            return response;
        } catch (error) {
            console.error('Error creating pricing:', error);
            throw error;
        }
    },

    async update(id: string, data: any): Promise<any> {
        try {
            const response = await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.pricing,
                id,
                data
            );
            return response;
        } catch (error) {
            console.error('Error updating pricing:', error);
            throw error;
        }
    }
};
