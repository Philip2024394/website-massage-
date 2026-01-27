// Utility to help set pricing data for therapists
import { therapistService } from '../lib/appwriteService';

// Sample pricing data
const SAMPLE_PRICING_DATA = [
    { "60": 350, "90": 500, "120": 650 }, // Premium therapist
    { "60": 300, "90": 450, "120": 600 }, // Standard therapist  
    { "60": 250, "90": 400, "120": 550 }, // Budget-friendly therapist
    { "60": 400, "90": 550, "120": 700 }, // Luxury therapist
    { "60": 320, "90": 480, "120": 620 }, // Mid-range therapist
];

export const pricingHelper = {
    // Add pricing data to all therapists that don't have it
    async addSamplePricingToAllTherapists() {
        try {
            console.log('🔧 Starting to add sample pricing to therapists...');
            const therapists = await therapistService.getAll();
            console.log(`Found ${therapists.length} therapists`);
            
            let updated = 0;
            for (let i = 0; i < therapists.length; i++) {
                const therapist = therapists[i];
                
                // Check if therapist already has pricing
                if (!therapist.pricing || therapist.pricing === '' || therapist.pricing === '{"60":0,"90":0,"120":0}') {
                    const samplePricing = SAMPLE_PRICING_DATA[i % SAMPLE_PRICING_DATA.length];
                    const pricingString = JSON.stringify(samplePricing);
                    
                    try {
                        await therapistService.update(therapist.$id, {
                            pricing: pricingString
                        });
                        console.log(`✅ Updated pricing for ${therapist.name}: ${pricingString}`);
                        updated++;
                    } catch (error) {
                        console.error(`❌ Failed to update ${therapist.name}:`, error);
                    }
                } else {
                    console.log(`⏭️ ${therapist.name} already has pricing: ${therapist.pricing}`);
                }
            }
            
            console.log(`🎉 Pricing update complete! Updated ${updated} therapists.`);
            return { updated, total: therapists.length };
        } catch (error) {
            console.error('❌ Error adding sample pricing:', error);
            throw error;
        }
    },

    // Add pricing to a specific therapist
    async addPricingToTherapist(therapistId: string, pricing: {60: number, 90: number, 120: number}) {
        try {
            const pricingString = JSON.stringify(pricing);
            await therapistService.update(therapistId, {
                pricing: pricingString
            });
            console.log(`✅ Updated pricing for therapist ${therapistId}: ${pricingString}`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to update therapist ${therapistId}:`, error);
            throw error;
        }
    },

    // Check pricing status of all therapists
    async checkPricingStatus() {
        try {
            const therapists = await therapistService.getAll();
            console.log('🔍 Pricing Status Report:');
            console.log('========================');
            
            let hasPricing = 0;
            let noPricing = 0;
            
            therapists.forEach((therapist) => {
                const hasValidPricing = therapist.pricing && 
                    therapist.pricing !== '' && 
                    therapist.pricing !== '{"60":0,"90":0,"120":0}';
                
                if (hasValidPricing) {
                    console.log(`✅ ${therapist.name}: ${therapist.pricing}`);
                    hasPricing++;
                } else {
                    console.log(`❌ ${therapist.name}: No pricing data`);
                    noPricing++;
                }
            });
            
            console.log('========================');
            console.log(`📊 Summary: ${hasPricing} with pricing, ${noPricing} without pricing`);
            
            return { hasPricing, noPricing, total: therapists.length };
        } catch (error) {
            console.error('❌ Error checking pricing status:', error);
            throw error;
        }
    }
};

// Make it available globally for console access
(window as any).pricingHelper = pricingHelper;

console.log('🛠️ Pricing Helper loaded! Use these commands in console:');
console.log('  pricingHelper.checkPricingStatus() - Check current pricing status');
console.log('  pricingHelper.addSamplePricingToAllTherapists() - Add sample pricing to all therapists');
console.log('  pricingHelper.addPricingToTherapist(id, {60: 350, 90: 500, 120: 650}) - Set specific pricing');