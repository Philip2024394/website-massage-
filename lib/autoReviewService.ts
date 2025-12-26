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
     */
    startAutoReviews(therapistId: string, therapistName: string) {
        // Clear existing interval if any
        this.stopAutoReviews(therapistId);
        
        console.log(`🔄 Starting auto-reviews for ${therapistName} (${therapistId}) - every 5 minutes`);
        
        // Generate first review immediately
        this.generateRandomReview(therapistId, therapistName);
        
        // Then continue every 5 minutes
        const intervalId = setInterval(() => {
            this.generateRandomReview(therapistId, therapistName);
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
     * Generate a random review and add it to the review service
     */
    private generateRandomReview(therapistId: string, therapistName: string) {
        // Mix of Indonesian locals and international tourists for realism
        const fakeNames = [
            'Sarah Mitchell', 'Budi Santoso', 'Emma Rodriguez', 'Ahmad Hidayat',
            'David Chen', 'Sari Wulandari', 'Michael Johnson', 'Dewi Lestari',
            'James Anderson', 'Rina Putri', 'Lisa Thompson', 'Agus Wijaya',
            'Tom Wilson', 'Maya Kusuma', 'Anna Schmidt', 'Rudi Hartono',
            'Sophie Martin', 'Fitri Rahmawati', 'Chris Lee', 'Indah Permata'
        ];
        
        // Generate unique comment by combining templates
        const comment = this.generateUniqueComment(therapistId, therapistName);
        const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
        
        // Generate rating (80% chance of 5 stars, 20% chance of 4 stars)
        const rating = Math.random() > 0.2 ? 5 : 4;
        
        // Create fake user ID
        const fakeUserId = `auto_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        try {
            // Add the review using the existing review service
            const newReview = reviewService.addReview(
                therapistId,
                'therapist',
                fakeUserId,
                randomName,
                rating,
                comment,
                'Yogyakarta, Indonesia'
            );
            
            console.log(`⭐ Auto-generated review for ${therapistName} (${therapistId})`);
            
            // Trigger a custom event to notify components that reviews were updated
            window.dispatchEvent(new CustomEvent('reviewsUpdated', {
                detail: { 
                    therapistId, 
                    therapistName,
                    newReview: newReview 
                }
            }));
            
        } catch (error) {
            console.error(`❌ Error adding auto-review for ${therapistName}:`, error.message);
        }
    }
    
    /**
     * Generate a unique comment by combining templates and variables
     */
    private generateUniqueComment(therapistId: string, therapistName: string): string {
        // Initialize used comments set for this therapist if not exists
        if (!this.usedComments.has(therapistId)) {
            this.usedComments.set(therapistId, new Set());
        }
        
        const used = this.usedComments.get(therapistId)!;
        
        // Comment templates with variables
        const templates = [
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
        ];
        
        // More specific template structures
        const structures = [
            (t: string[][]) => `${t[0][rand(t[0])]} ${t[1][rand(t[1])]}! The therapist was ${t[2][rand(t[2])]} and ${t[3][rand(t[3])]}. ${t[4][rand(t[4])]}. ${t[5][rand(t[5])]}!`,
            (t: string[][]) => `${t[0][rand(t[0])]} experience! ${t[3][rand(t[3])]} and ${t[4][rand(t[4])]}. The ${t[1][rand(t[1])]} was professional and effective. ${t[5][rand(t[5])]}.`,
            (t: string[][]) => `Really ${t[0][rand(t[0]).toLowerCase()]} ${t[1][rand(t[1])]}. ${t[2][rand(t[2])]} and ${t[3][rand(t[3])]}. ${t[5][rand(t[5])]}.`,
            (t: string[][]) => `The ${t[1][rand(t[1])]} was ${t[0][rand(t[0]).toLowerCase()]}! ${t[3][rand(t[3])]} and I ${t[4][rand(t[4]).toLowerCase()]}. ${t[5][rand(t[5])]}.`,
            (t: string[][]) => `${t[0][rand(t[0])]} massage therapy! ${t[2][rand(t[2])]}, ${t[3][rand(t[3])]}, and ${t[4][rand(t[4])]}. Will return!`,
            (t: string[][]) => `Booked this ${t[1][rand(t[1])]} and was not disappointed. ${t[2][rand(t[2])]}, ${t[3][rand(t[3])]}, and ${t[4][rand(t[4])]}. ${t[5][rand(t[5])]}.`
        ];
        
        const rand = (arr: string[]) => Math.floor(Math.random() * arr.length);
        
        // Try to generate a unique comment (max 20 attempts)
        let attempts = 0;
        let comment = '';
        
        while (attempts < 20) {
            const structureFunc = structures[rand(structures)];
            comment = structureFunc(templates);
            
            if (!used.has(comment)) {
                used.add(comment);
                return comment;
            }
            attempts++;
        }
        
        // Fallback: add timestamp to ensure uniqueness
        const timestamp = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        comment = `${comment} (Booked ${timestamp})`;
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