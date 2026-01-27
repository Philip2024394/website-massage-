/**
 * Translation Service
 * Manages multilingual content storage and retrieval
 */

import { databases, APPWRITE_CONFIG } from '../config';
import { ID, Query } from 'appwrite';

export const translationsService = {
    async getAll(): Promise<any> {
        try {
            // Check if translations collection is disabled
            const translationsCollection = APPWRITE_CONFIG.collections.translations;
            if (!translationsCollection) {
                console.log('🔄 Translations collection disabled, using fallback translations');
                return null;
            }
            
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                translationsCollection
            );
            
            if (response.documents.length === 0) return null;
            
            // Initialize with all supported languages
            const translations: any = {
                en: {}, gb: {}, id: {}, zh: {}, ja: {}, ko: {}, es: {}, fr: {}, de: {}, 
                it: {}, pt: {}, ru: {}, ar: {}, hi: {}, th: {}, vi: {}, nl: {}, 
                tr: {}, pl: {}, sv: {}, da: {}
            };
            
            response.documents.forEach((doc: any) => {
                const { language, Key, value } = doc;
                try {
                    if (!translations[language]) {
                        translations[language] = {};
                    }
                    const parsedValue = typeof value === 'string' && value.startsWith('{') 
                        ? JSON.parse(value) 
                        : value;
                    translations[language][Key] = parsedValue;
                } catch {
                    if (!translations[language]) {
                        translations[language] = {};
                    }
                    translations[language][Key] = value;
                }
            });

            // Ensure GB mirrors EN if missing
            if (translations.en) {
                translations.gb = translations.gb || {};
                for (const k of Object.keys(translations.en)) {
                    if (translations.gb[k] === undefined) translations.gb[k] = translations.en[k];
                }
            }
            
            return translations;
        } catch (error) {
            console.error('Error fetching translations:', error);
            return null;
        }
    },

    async set(language: string, key: string, value: any): Promise<void> {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : value;
        
        try {
            console.log(`🔄 Setting translation: ${language}.${key} = "${stringValue.substring(0, 100)}${stringValue.length > 100 ? '...' : ''}"`);

            // For large values, split them into smaller parts
            if (stringValue.length > 900) {
                console.log(`📦 Large translation detected (${stringValue.length} chars), splitting into chunks...`);
                await this.setLargeTranslation(language, key, stringValue);
                return;
            }

            // Check if a document with this language+key combination already exists
            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations,
                [
                    Query.equal('language', language),
                    Query.equal('Key', key)
                ]
            );
            
            // Prepare data for both schema formats
            const baseData = {
                language: language,
                Key: key,
                value: stringValue,
                lastUpdated: new Date().toISOString(),
                autoTranslated: true
            };
            
            // Add individual language columns with safe values
            const languageData: any = { ...baseData };
            
            const safeValue = stringValue.length > 900 ? `${stringValue.substring(0, 900)}...` : stringValue;
            languageData.en = language === 'en' ? safeValue : '';
            languageData.id = language === 'id' ? safeValue : '';
            
            if (language === 'zh') languageData.zh = safeValue;
            if (language === 'ja') languageData.ja = safeValue;
            if (language === 'ko') languageData.ko = safeValue;
            if (language === 'ru') languageData.ru = safeValue;
            if (language === 'fr') languageData.fr = safeValue;
            
            if (existingDocs.documents.length > 0) {
                const docId = existingDocs.documents[0].$id;
                const existingDoc = existingDocs.documents[0];
                
                languageData.en = language === 'en' ? safeValue : (existingDoc.en || '');
                languageData.id = language === 'id' ? safeValue : (existingDoc.id || '');
                if (language === 'zh') languageData.zh = safeValue;
                if (language === 'ja') languageData.ja = safeValue;
                if (language === 'ko') languageData.ko = safeValue;
                if (language === 'ru') languageData.ru = safeValue;
                if (language === 'fr') languageData.fr = safeValue;
                
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    docId,
                    languageData
                );
                console.log(`✅ Updated existing: ${language}.${key}`);
            } else {
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    ID.unique(),
                    languageData
                );
                console.log(`✅ Created new: ${language}.${key}`);
            }
        } catch (error: any) {
            console.error('❌ Error setting translation:', error);
            throw error;
        }
    },

    async setLargeTranslation(language: string, key: string, value: string): Promise<void> {
        try {
            const mainData: any = {
                language: language,
                Key: key,
                value: value,
                lastUpdated: new Date().toISOString(),
                autoTranslated: true,
                en: language === 'en' ? `${value.substring(0, 900)}...` : '',
                id: language === 'id' ? `${value.substring(0, 900)}...` : ''
            };

            if (language === 'zh') mainData.zh = `${value.substring(0, 900)}...`;
            if (language === 'ja') mainData.ja = `${value.substring(0, 900)}...`;
            if (language === 'ko') mainData.ko = `${value.substring(0, 900)}...`;
            if (language === 'ru') mainData.ru = `${value.substring(0, 900)}...`;
            if (language === 'fr') mainData.fr = `${value.substring(0, 900)}...`;

            const existingDocs = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.translations,
                [
                    Query.equal('language', language),
                    Query.equal('Key', key)
                ]
            );

            if (existingDocs.documents.length > 0) {
                await databases.updateDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    existingDocs.documents[0].$id,
                    mainData
                );
                console.log(`✅ Updated large translation: ${language}.${key} (${value.length} chars)`);
            } else {
                await databases.createDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.translations,
                    ID.unique(),
                    mainData
                );
                console.log(`✅ Created large translation: ${language}.${key} (${value.length} chars)`);
            }
        } catch (error: any) {
            console.error('❌ Error setting large translation:', error);
            throw error;
        }
    },

    async syncFromLocal(translations: any): Promise<void> {
        try {
            const languages = Object.keys(translations);
            
            for (const lang of languages) {
                const keys = Object.keys(translations[lang]);
                
                for (const key of keys) {
                    await this.set(lang, key, translations[lang][key]);
                    console.log(`Synced ${lang}.${key}`);
                }
            }
            
            console.log('Translation sync complete!');
        } catch (error) {
            console.error('Error syncing translations:', error);
            throw error;
        }
    }
};
