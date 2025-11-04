// Comprehensive pricing diagnostic and repair script
console.log('🔧 PRICING DIAGNOSTIC STARTING...');

// Step 1: Check if we can access the pricing helper
if (typeof window.pricingHelper !== 'undefined') {
    console.log('✅ Pricing helper is available');
    
    // Step 2: Check current pricing status
    console.log('\n📊 Step 2: Checking pricing status...');
    window.pricingHelper.checkPricingStatus()
        .then(result => {
            console.log('📈 Pricing Status Result:', result);
            
            if (result.noPricing > 0) {
                console.log(`\n🔧 Found ${result.noPricing} therapists without pricing`);
                console.log('🛠️ Adding sample pricing to all therapists...');
                
                return window.pricingHelper.addSamplePricingToAllTherapists();
            } else {
                console.log('✅ All therapists already have pricing data');
                return Promise.resolve();
            }
        })
        .then(() => {
            console.log('\n✅ Sample pricing operation completed');
            console.log('🔄 Re-checking pricing status...');
            return window.pricingHelper.checkPricingStatus();
        })
        .then(finalResult => {
            console.log('📊 Final Status:', finalResult);
            console.log('\n🎉 PRICING DIAGNOSTIC COMPLETED');
        })
        .catch(error => {
            console.error('❌ Error during pricing diagnostic:', error);
        });
} else {
    console.log('❌ Pricing helper not available. Loading page first...');
    console.log('💡 Try running this script after the page fully loads');
}

// Step 3: Debug function to check individual therapist pricing
window.debugTherapistPricing = async function(therapistId) {
    try {
        console.log(`🔍 Debugging pricing for therapist ${therapistId}...`);
        
        // This would need to be adapted based on the actual therapist service API
        if (typeof window.therapistService !== 'undefined') {
            const therapist = await window.therapistService.getById(therapistId);
            console.log('👤 Therapist data:', therapist);
            console.log('💰 Raw pricing data:', therapist.pricing);
            
            // Try to parse the pricing
            try {
                const parsed = JSON.parse(therapist.pricing || '{}');
                console.log('📊 Parsed pricing:', parsed);
            } catch (parseError) {
                console.error('❌ Pricing parse error:', parseError);
            }
        } else {
            console.log('❌ Therapist service not available');
        }
    } catch (error) {
        console.error('❌ Error debugging therapist pricing:', error);
    }
};

console.log('\n🛠️ Additional commands available:');
console.log('  debugTherapistPricing("therapist_id") - Debug specific therapist pricing');
console.log('  pricingHelper.checkPricingStatus() - Check all therapist pricing');
console.log('  pricingHelper.addSamplePricingToAllTherapists() - Add sample pricing');