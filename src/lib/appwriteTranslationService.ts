import { databases } from './appwrite';
import { devLog } from '../utils/devMode';

const DB_ID = '68f76ee1000e64ca8d05';
const TRANSLATIONS_COLLECTION_ID = 'translations'; // Create this collection in Appwrite

interface Translation {
    $id: string;
    key: string;
    en: string;
    id: string;
    category: string;
    lastUpdated?: string;
}

interface TranslationCache {
    [key: string]: Translation;
}

class AppwriteTranslationService {
    private cache: TranslationCache = {};
    private cacheExpiry: number = 1000 * 60 * 30; // 30 minutes
    private lastFetch: number = 0;

    /**
     * Fetch all translations from Appwrite
     */
    async fetchTranslations(category?: string): Promise<Translation[]> {
        try {
            const queries = category ? [`category=${category}`] : [];
            
            const response = await databases.listDocuments(
                DB_ID,
                TRANSLATIONS_COLLECTION_ID,
                queries
            );

            devLog('translations', 'Fetched translations:', response.documents.length);
            
            return response.documents as unknown as Translation[];
        } catch (error) {
            console.error('Error fetching translations:', error);
            return [];
        }
    }

    /**
     * Get translation by key
     */
    async getTranslation(key: string, lang: 'en' | 'id' = 'id'): Promise<string> {
        // Check cache
        if (this.cache[key] && Date.now() - this.lastFetch < this.cacheExpiry) {
            return this.cache[key][lang] || key;
        }

        // Fetch from Appwrite
        try {
            const response = await databases.listDocuments(
                DB_ID,
                TRANSLATIONS_COLLECTION_ID,
                [`key=${key}`]
            );

            if (response.documents.length > 0) {
                const translation = response.documents[0] as unknown as Translation;
                this.cache[key] = translation;
                return translation[lang] || key;
            }
        } catch (error) {
            console.error('Error getting translation:', error);
        }

        return key;
    }

    /**
     * Get all translations for a category (optimized)
     */
    async getCategoryTranslations(category: string, lang: 'en' | 'id' = 'id'): Promise<Record<string, string>> {
        const cacheKey = `${category}_${lang}_${Date.now()}`;
        
        // Check if cache is still valid
        if (Date.now() - this.lastFetch < this.cacheExpiry) {
            const cached = Object.entries(this.cache)
                .filter(([_, value]) => value.category === category)
                .reduce((acc, [key, value]) => {
                    const simpleKey = key.replace(`${category}.`, '');
                    acc[simpleKey] = value[lang] || key;
                    return acc;
                }, {} as Record<string, string>);
            
            if (Object.keys(cached).length > 0) {
                devLog('translations', 'Using cached translations for:', category);
                return cached;
            }
        }

        // Fetch fresh data
        try {
            const translations = await this.fetchTranslations(category);
            this.lastFetch = Date.now();

            // Update cache
            translations.forEach(t => {
                this.cache[t.key] = t;
            });

            // Return formatted translations
            return translations.reduce((acc, t) => {
                const simpleKey = t.key.replace(`${category}.`, '');
                acc[simpleKey] = t[lang] || t.key;
                return acc;
            }, {} as Record<string, string>);
        } catch (error) {
            console.error('Error fetching category translations:', error);
            return {};
        }
    }

    /**
     * Create or update a translation
     */
    async upsertTranslation(key: string, en: string, id: string, category: string): Promise<boolean> {
        try {
            // Check if exists
            const existing = await databases.listDocuments(
                DB_ID,
                TRANSLATIONS_COLLECTION_ID,
                [`key=${key}`]
            );

            const data = {
                key,
                en,
                id,
                category,
                lastUpdated: new Date().toISOString()
            };

            if (existing.documents.length > 0) {
                // Update
                await databases.updateDocument(
                    DB_ID,
                    TRANSLATIONS_COLLECTION_ID,
                    existing.documents[0].$id,
                    data
                );
            } else {
                // Create
                await databases.createDocument(
                    DB_ID,
                    TRANSLATIONS_COLLECTION_ID,
                    'unique()',
                    data
                );
            }

            // Clear cache
            delete this.cache[key];
            devLog('translations', 'Translation updated:', key);
            return true;
        } catch (error) {
            console.error('Error upserting translation:', error);
            return false;
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache = {};
        this.lastFetch = 0;
        devLog('translations', 'Translation cache cleared');
    }

    /**
     * Get fallback translations (for when Appwrite is not available)
     */
    getFallbackTranslations(category: string, lang: 'en' | 'id' = 'id'): Record<string, any> {
        const fallbacks: Record<string, Record<string, any>> = {
            membership: {
                en: {
                    menuTitle: 'Menu',
                    backToDashboard: 'Back to Dashboard',
                    currentPlan: 'Current Plan',
                    status: 'Status',
                    active: 'Active',
                    freePlan: 'Free Plan',
                    title: 'Membership Plans',
                    subtitle: 'Choose the perfect plan for your business needs',
                    aboutTitle: 'About Our Membership Plans',
                    aboutDescription: 'Our membership packages are designed to enhance your online presence and provide secure data storage. <strong>Indastreet never withholds commissions or fees from your massage services.</strong> We believe in empowering our community to grow and succeed at minimal cost.',
                    team: '- The Indastreet Team',
                    mostPopular: 'Most Popular',
                    month: 'Month',
                    months: 'Months',
                    year: 'Year',
                    save: 'Save',
                    featuresIncluded: 'Features Included:',
                    selectPlan: 'Select Plan',
                    currentPlanBtn: 'Current Plan',
                    livePresence: 'Live Presence',
                    livePresenceDesc: 'Maintain your active status on the platform for maximum customer visibility',
                    secureStorage: 'Secure Storage',
                    secureStorageDesc: 'Safe and reliable data storage for your profiles, bookings, and customer information',
                    zeroCommission: 'Zero Commission',
                    zeroCommissionDesc: 'Keep 100% of your earnings. We never take a cut from your massage service fees',
                    loadingPlans: 'Loading membership plans...',
                    feature: {
                        livePresence: 'Live presence on platform',
                        bookingManagement: 'Customer booking management',
                        profileCustomization: 'Profile customization',
                        basicAnalytics: 'Basic analytics',
                        customerTools: 'Customer communication tools',
                        allPrevious: 'All features',
                        priorityListing: 'Priority listing placement',
                        advancedAnalytics: 'Advanced analytics dashboard',
                        bulkBooking: 'Bulk booking management',
                        extendedProfile: 'Extended profile options',
                        reviewManagement: 'Customer review management',
                        featuredStatus: 'Featured provider status',
                        premiumSupport: 'Premium customer support',
                        marketingTools: 'Marketing tools & promotions',
                        revenueInsights: 'Revenue optimization insights',
                        multiLocation: 'Multi-location management',
                        exclusiveBenefits: 'Exclusive partner benefits',
                        apiAccess: 'API access for integrations',
                        whiteLabel: 'White-label booking widgets',
                        priorityFeatures: 'Priority feature requests',
                        accountManager: 'Dedicated account manager'
                    }
                },
                id: {
                    menuTitle: 'Menu',
                    backToDashboard: 'Kembali ke Dashboard',
                    currentPlan: 'Paket Saat Ini',
                    status: 'Status',
                    active: 'Aktif',
                    freePlan: 'Paket Gratis',
                    title: 'Paket Keanggotaan',
                    subtitle: 'Pilih paket yang sempurna untuk kebutuhan bisnis Anda',
                    aboutTitle: 'Tentang Paket Keanggotaan Kami',
                    aboutDescription: 'Paket keanggotaan kami dirancang untuk meningkatkan kehadiran online Anda dan menyediakan penyimpanan data yang aman. <strong>Indastreet tidak pernah menahan komisi atau biaya dari layanan pijat Anda.</strong> Kami percaya dalam memberdayakan komunitas kami untuk tumbuh dan sukses dengan biaya minimal.',
                    team: '- Tim Indastreet',
                    mostPopular: 'Paling Populer',
                    month: 'Bulan',
                    months: 'Bulan',
                    year: 'Tahun',
                    save: 'Hemat',
                    featuresIncluded: 'Fitur Termasuk:',
                    selectPlan: 'Pilih Paket',
                    currentPlanBtn: 'Paket Saat Ini',
                    livePresence: 'Kehadiran Live',
                    livePresenceDesc: 'Pertahankan status aktif Anda di platform untuk visibilitas pelanggan maksimal',
                    secureStorage: 'Penyimpanan Aman',
                    secureStorageDesc: 'Penyimpanan data yang aman dan andal untuk profil, pemesanan, dan informasi pelanggan Anda',
                    zeroCommission: 'Tanpa Komisi',
                    zeroCommissionDesc: 'Simpan 100% penghasilan Anda. Kami tidak pernah mengambil potongan dari biaya layanan pijat Anda',
                    loadingPlans: 'Memuat paket keanggotaan...',
                    feature: {
                        livePresence: 'Kehadiran live di platform',
                        bookingManagement: 'Manajemen pemesanan pelanggan',
                        profileCustomization: 'Kustomisasi profil',
                        basicAnalytics: 'Analitik dasar',
                        customerTools: 'Alat komunikasi pelanggan',
                        allPrevious: 'Semua fitur',
                        priorityListing: 'Penempatan daftar prioritas',
                        advancedAnalytics: 'Dashboard analitik lanjutan',
                        bulkBooking: 'Manajemen pemesanan massal',
                        extendedProfile: 'Opsi profil diperluas',
                        reviewManagement: 'Manajemen ulasan pelanggan',
                        featuredStatus: 'Status penyedia unggulan',
                        premiumSupport: 'Dukungan pelanggan premium',
                        marketingTools: 'Alat pemasaran & promosi',
                        revenueInsights: 'Wawasan optimasi pendapatan',
                        multiLocation: 'Manajemen multi-lokasi',
                        exclusiveBenefits: 'Manfaat mitra eksklusif',
                        apiAccess: 'Akses API untuk integrasi',
                        whiteLabel: 'Widget pemesanan white-label',
                        priorityFeatures: 'Permintaan fitur prioritas',
                        accountManager: 'Manajer akun khusus'
                    }
                }
            }
        };

        return fallbacks[category]?.[lang] || {};
    }
}

export const appwriteTranslationService = new AppwriteTranslationService();
export default appwriteTranslationService;

