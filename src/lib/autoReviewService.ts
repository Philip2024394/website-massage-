/**
 * Auto-Review Generation Service
 * Generates fake reviews every 5 minutes for demo purposes
 * Integrates with existing reviewService for proper state management
 */

import { reviewService } from './reviewService';

class AutoReviewService {
    private intervals: Map<string, NodeJS.Timeout> = new Map();
    private usedComments: Map<string, Set<string>> = new Map(); // Track used comments per therapist
    
    /**
     * Start auto-generating reviews for a therapist every 5 minutes
     * ONLY in development mode and NOT on landing page
     */
    startAutoReviews(therapistId: string, therapistName: string, language: 'en' | 'id' = 'en') {
        // SAFETY CHECK 1: Only run in development
        if (import.meta.env.PROD) {
            console.log('🚫 Auto-reviews disabled in production');
            return;
        }
        
        // SAFETY CHECK 2: Never run on landing page
        if (typeof window !== 'undefined' && window.location.pathname === '/') {
            console.log('🚫 Auto-reviews disabled on landing page');
            return;
        }
        
        // SAFETY CHECK 3: Check localStorage size before starting
        if (!this.canSafelyGenerateReviews()) {
            console.warn('⚠️ localStorage near capacity. Skipping auto-review initialization.');
            return;
        }
        
        // Clear existing interval if any
        this.stopAutoReviews(therapistId);
        
        console.log(`🔄 [DEV ONLY] Starting auto-reviews for ${therapistName} (${therapistId}) - every 5 minutes [${language.toUpperCase()}]`);
        
        // Generate first review immediately
        this.generateRandomReview(therapistId, therapistName, language);
        
        // Then continue every 5 minutes
        const intervalId = setInterval(() => {
            // Re-check capacity before each generation
            if (this.canSafelyGenerateReviews()) {
                this.generateRandomReview(therapistId, therapistName, language);
            } else {
                console.warn(`⚠️ localStorage capacity reached. Stopping auto-reviews for ${therapistName}`);
                this.stopAutoReviews(therapistId);
            }
        }, 5 * 60 * 1000); // 5 minutes
        
        this.intervals.set(therapistId, intervalId);
    }
    
    /**
     * Stop auto-generating reviews for a therapist
     */
    stopAutoReviews(therapistId: string) {
        const intervalId = this.intervals.get(therapistId);
        if (intervalId) {
            clearInterval(intervalId);
            this.intervals.delete(therapistId);
            console.log(`⏹️ Stopped auto-reviews for therapist ${therapistId}`);
        }
    }
    
    /**
     * Stop all auto-reviews
     */
    stopAllAutoReviews() {
        this.intervals.forEach((intervalId, therapistId) => {
            clearInterval(intervalId);
            console.log(`⏹️ Stopped auto-reviews for therapist ${therapistId}`);
        });
        this.intervals.clear();
        console.log('🛑 All auto-review intervals stopped');
    }
    
    /**
     * Check if localStorage has enough space for safe review generation
     * Returns false if reviews exceed 5000 (safety limit)
     */
    private canSafelyGenerateReviews(): boolean {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
            return false;
        }
        
        try {
            const reviewData = localStorage.getItem('massage_app_reviews');
            if (!reviewData) return true;
            
            const reviews = JSON.parse(reviewData);
            const reviewCount = Array.isArray(reviews) ? reviews.length : 0;
            
            // Safety limit: stop generating if we have 5000+ reviews
            if (reviewCount >= 5000) {
                console.warn(`⚠️ Review count (${reviewCount}) exceeds safety limit (5000)`);
                return false;
            }
            
            // Check actual localStorage usage (rough estimate)
            const storageSize = new Blob([reviewData]).size;
            const maxSize = 5 * 1024 * 1024; // 5MB typical limit
            
            if (storageSize > maxSize * 0.8) { // Stop at 80% capacity
                console.warn(`⚠️ localStorage usage (${(storageSize / 1024 / 1024).toFixed(2)}MB) near limit`);
                return false;
            }
            
            return true;
        } catch (error: unknown) {
            console.error('Error checking localStorage capacity:', error);
            return false; // Fail safe
        }
    }
    
    /**
     * Generate a random review and add it to the review service
     */
    private generateRandomReview(therapistId: string, therapistName: string, language: 'en' | 'id' = 'en') {
        // Mix of Indonesian locals and international tourists for realism
        const fakeNames = [
            'Sarah Mitchell', 'Budi Santoso', 'Emma Rodriguez', 'Ahmad Hidayat',
            'David Chen', 'Sari Wulandari', 'Michael Johnson', 'Dewi Lestari',
            'James Anderson', 'Rina Putri', 'Lisa Thompson', 'Agus Wijaya',
            'Tom Wilson', 'Maya Kusuma', 'Anna Schmidt', 'Rudi Hartono',
            'Sophie Martin', 'Fitri Rahmawati', 'Chris Lee', 'Indah Permata'
        ];
        
        // Generate unique comment in the specified language
        const comment = this.generateUniqueComment(therapistId, therapistName, language);
        const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        
        // Generate rating (80% chance of 5 stars, 20% chance of 4 stars)
        const rating = Math.random() > 0.2 ? 5 : 4;
        
        // Create fake user ID
        const fakeUserId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const locationText = language === 'id' ? 'Yogyakarta, Indonesia' : 'Yogyakarta, Indonesia';
        
        try {
            // Add the review using the existing review service
            const newReview = reviewService.addReview(
                therapistId,
                'therapist',
                fakeUserId,
                randomName,
                rating,
                comment,
                locationText
            );
            
            console.log(`⭐ Auto-generated review for ${therapistName} (${therapistId}) [${language.toUpperCase()}]`);
            
            // Trigger a custom event to notify components that reviews were updated
            window.dispatchEvent(new CustomEvent('reviewsUpdated', {
                detail: { 
                    therapistId, 
                    therapistName,
                    newReview: newReview 
                }
            }));
            
        } catch (error: unknown) {
            console.error(`❌ Error adding auto-review for ${therapistName}:`, (error as Error).message);
        }
    }
    
    /**
     * Generate a unique comment by combining templates and variables
     * Now supports both English and Indonesian
     */
    private generateUniqueComment(therapistId: string, therapistName: string, language: 'en' | 'id' = 'en'): string {
        // Initialize used comments set for this therapist if not exists
        if (!this.usedComments.has(therapistId)) {
            this.usedComments.set(therapistId, new Set());
        }
        
        const used = this.usedComments.get(therapistId)!;
        
        // Bilingual comment templates
        const templates = {
            en: [
                // Quality descriptors
                ['Excellent', 'Amazing', 'Fantastic', 'Outstanding', 'Wonderful', 'Incredible', 'Superb', 'Perfect', 'Brilliant', 'Exceptional'],
                // Service aspects
                ['massage', 'therapy session', 'treatment', 'service', 'experience', 'session', 'massage therapy', 'deep tissue work'],
                // Professional qualities
                ['very professional', 'highly skilled', 'extremely knowledgeable', 'very experienced', 'incredibly talented', 'truly expert'],
                // Benefits
                ['helped with my back pain', 'relieved my muscle tension', 'reduced my stress', 'improved my flexibility', 'addressed my shoulder issues', 'fixed my neck pain', 'eased my chronic pain'],
                // Outcomes
                ['I feel much better now', 'I\'m completely relaxed', 'my pain is gone', 'I feel rejuvenated', 'I\'m so refreshed', 'the results are amazing'],
                // Recommendations
                ['Highly recommend', 'Will definitely book again', 'Must try', 'Worth every penny', 'Can\'t recommend enough', 'Five stars all the way']
            ],
            id: [
                // Quality descriptors
                ['Luar biasa', 'Menakjubkan', 'Fantastis', 'Sangat bagus', 'Sempurna', 'Hebat', 'Istimewa', 'Sempurna', 'Cemerlang', 'Eksepsional'],
                // Service aspects
                ['pijat', 'sesi terapi', 'perawatan', 'layanan', 'pengalaman', 'sesi', 'terapi pijat', 'pijat jaringan dalam'],
                // Professional qualities
                ['sangat profesional', 'sangat terampil', 'sangat berpengalaman', 'sangat berpengalaman', 'sangat berbakat', 'benar-benar ahli'],
                // Benefits
                ['membantu sakit punggung saya', 'meredakan ketegangan otot saya', 'mengurangi stres saya', 'meningkatkan fleksibilitas saya', 'mengatasi masalah bahu saya', 'memperbaiki sakit leher saya', 'mengurangi nyeri kronis saya'],
                // Outcomes
                ['Saya merasa jauh lebih baik sekarang', 'Saya benar-benar rileks', 'rasa sakit saya hilang', 'Saya merasa segar kembali', 'Saya sangat segar', 'hasilnya luar biasa'],
                // Recommendations
                ['Sangat merekomendasikan', 'Pasti akan pesan lagi', 'Harus dicoba', 'Sepadan dengan harganya', 'Sangat merekomendasikan', 'Bintang lima semua']
            ]
        };
        
        const currentTemplates = templates[language];
        
        // Helper function to get random index
        const rand = (arr: string[] | ((t: string[][]) => string)[]) => Math.floor(Math.random() * arr.length);
        
        // More specific template structures with bilingual support
        const structures = {
            en: [
                (t: string[][]) => `${t[0][rand(t[0])]} ${t[1][rand(t[1])]}! The therapist was ${t[2][rand(t[2])]} and ${t[3][rand(t[3])]}. ${t[4][rand(t[4])]}. ${t[5][rand(t[5])]}!`,
                (t: string[][]) => `${t[0][rand(t[0])]} experience! ${t[3][rand(t[3])]} and ${t[4][rand(t[4])]}. The ${t[1][rand(t[1])]} was professional and effective. ${t[5][rand(t[5])]}.`,
                (t: string[][]) => `Really ${t[0][rand(t[0])].toLowerCase()} ${t[1][rand(t[1])]}. ${t[2][rand(t[2])]} and ${t[3][rand(t[3])]}. ${t[5][rand(t[5])]}.`,
                (t: string[][]) => `The ${t[1][rand(t[1])]} was ${t[0][rand(t[0])].toLowerCase()}! ${t[3][rand(t[3])]} and I ${t[4][rand(t[4])].toLowerCase()}. ${t[5][rand(t[5])]}.`,
                (t: string[][]) => `${t[0][rand(t[0])]} massage therapy! ${t[2][rand(t[2])]}, ${t[3][rand(t[3])]}, and ${t[4][rand(t[4])]}. Will return!`,
                (t: string[][]) => `Booked this ${t[1][rand(t[1])]} and was not disappointed. ${t[2][rand(t[2])]}, ${t[3][rand(t[3])]}, and ${t[4][rand(t[4])]}. ${t[5][rand(t[5])]}.`
            ],
            id: [
                (t: string[][]) => `${t[0][rand(t[0])]} ${t[1][rand(t[1])]}! Terapisnya ${t[2][rand(t[2])]} dan ${t[3][rand(t[3])]}. ${t[4][rand(t[4])]}. ${t[5][rand(t[5])]}!`,
                (t: string[][]) => `Pengalaman ${t[0][rand(t[0])].toLowerCase()}! ${t[3][rand(t[3])]} dan ${t[4][rand(t[4])]}. ${t[1][rand(t[1])]} nya profesional dan efektif. ${t[5][rand(t[5])]}.`,
                (t: string[][]) => `Benar-benar ${t[1][rand(t[1])]} yang ${t[0][rand(t[0])].toLowerCase()}. ${t[2][rand(t[2])]} dan ${t[3][rand(t[3])]}. ${t[5][rand(t[5])]}.`,
                (t: string[][]) => `${t[1][rand(t[1])]} nya ${t[0][rand(t[0])].toLowerCase()}! ${t[3][rand(t[3])]} dan ${t[4][rand(t[4])]}. ${t[5][rand(t[5])]}.`,
                (t: string[][]) => `Terapi pijat ${t[0][rand(t[0])].toLowerCase()}! ${t[2][rand(t[2])]}, ${t[3][rand(t[3])]}, dan ${t[4][rand(t[4])]}. Akan kembali!`,
                (t: string[][]) => `Pesan ${t[1][rand(t[1])]} ini dan tidak mengecewakan. ${t[2][rand(t[2])]}, ${t[3][rand(t[3])]}, dan ${t[4][rand(t[4])]}. ${t[5][rand(t[5])]}.`
            ]
        };
        
        const currentStructures = structures[language];
        
        // Try to generate a unique comment (max 20 attempts)
        let attempts = 0;
        let comment = '';
        
        while (attempts < 20) {
            const structureFunc = currentStructures[rand(currentStructures)];
            comment = structureFunc(currentTemplates);
            
            if (!used.has(comment)) {
                used.add(comment);
                return comment;
            }
            attempts++;
        }
        
        // Fallback: add timestamp to ensure uniqueness
        const timestamp = new Date().toLocaleTimeString(language === 'id' ? 'id-ID' : 'en-US', { hour: '2-digit', minute: '2-digit' });
        const bookedText = language === 'id' ? 'Dipesan' : 'Booked';
        comment = `${comment} (${bookedText} ${timestamp})`;
        used.add(comment);
        
        return comment;
    }
    
    /**
     * Get status of auto-review system
     */
    getStatus() {
        const activeTherapists = Array.from(this.intervals.keys());
        return {
            isActive: activeTherapists.length > 0,
            activeTherapists: activeTherapists,
            activeCount: activeTherapists.length
        };
    }
}

export const autoReviewService = new AutoReviewService();

// Cleanup on page unload
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        autoReviewService.stopAllAutoReviews();
    });
}
