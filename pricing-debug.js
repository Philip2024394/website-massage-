/**
 * 🔍 PRICING DATA DIAGNOSTIC
 * =========================
 * 
 * The issue: Prices show "Contact" instead of actual values
 * Root cause: Pricing data is being saved as 0 or not being saved correctly
 */

console.log('🧪 PRICING DIAGNOSTIC TOOL');
console.log('==========================');

window.pricingDebug = {
    // Check current therapist pricing data
    checkCurrentPricing() {
        console.log('📊 CHECKING CURRENT PRICING DATA...');
        
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        console.log('Total therapists found:', therapists.length);
        
        therapists.forEach((therapist, index) => {
            console.log(`\n${index + 1}. ${therapist.name || 'Unnamed'}`);
            console.log('   - Raw pricing:', therapist.pricing);
            
            // Parse pricing like the app does
            try {
                let parsed;
                if (typeof therapist.pricing === 'string') {
                    parsed = JSON.parse(therapist.pricing);
                } else {
                    parsed = therapist.pricing;
                }
                
                console.log('   - Parsed pricing:', parsed);
                console.log('   - 60min:', parsed?.["60"] || 0);
                console.log('   - 90min:', parsed?.["90"] || 0);
                console.log('   - 120min:', parsed?.["120"] || 0);
                
                const hasValidPricing = (parsed?.["60"] > 0 || parsed?.["90"] > 0 || parsed?.["120"] > 0);
                console.log('   - Has valid pricing:', hasValidPricing ? '✅ Yes' : '❌ No (will show Contact)');
                
            } catch (error) {
                console.log('   - Parsing error:', error.message);
            }
        });
    },
    
    // Test pricing format function
    testFormatPrice() {
        console.log('\n🧮 TESTING PRICE FORMAT FUNCTION...');
        
        const formatPrice = (price) => {
            const numPrice = typeof price === 'string' ? parseFloat(price) : price;
            if (!numPrice || numPrice === 0 || isNaN(numPrice)) {
                return "Contact";
            }
            return `${Math.round(numPrice)}K`;
        };
        
        const testPrices = [0, 100, 150, 200, "150", "0", null, undefined, NaN];
        
        testPrices.forEach(price => {
            console.log(`Price: ${price} → Display: ${formatPrice(price)}`);
        });
    },
    
    // Simulate dashboard pricing save
    simulatePricingSave(price60, price90, price120) {
        console.log(`\n💾 SIMULATING PRICING SAVE...`);
        console.log(`Input: 60min=${price60}, 90min=${price90}, 120min=${price120}`);
        
        // This is how the dashboard should format pricing
        const pricingObject = {
            "60": price60 || 0,
            "90": price90 || 0,
            "120": price120 || 0
        };
        
        console.log('Pricing object:', pricingObject);
        
        const pricingString = JSON.stringify(pricingObject);
        console.log('Pricing string (for Appwrite):', pricingString);
        
        // Test if this would show Contact
        const wouldShowContact = (pricingObject["60"] === 0 && pricingObject["90"] === 0 && pricingObject["120"] === 0);
        console.log('Would show "Contact":', wouldShowContact ? '❌ Yes' : '✅ No, shows prices');
        
        return pricingString;
    },
    
    // Check localStorage for current user
    checkCurrentUser() {
        console.log('\n👤 CHECKING CURRENT USER...');
        
        const currentUser = localStorage.getItem('current_user');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            console.log('Current user:', user);
            console.log('User ID:', user.id);
            console.log('User type:', user.type);
        } else {
            console.log('❌ No current user found');
        }
        
        // Check if there's a matching therapist profile
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            const userTherapist = therapists.find(t => t.id === user.id || t.$id === user.id);
            if (userTherapist) {
                console.log('✅ Found matching therapist profile:', userTherapist.name);
                console.log('Profile pricing:', userTherapist.pricing);
            } else {
                console.log('❌ No matching therapist profile found');
            }
        }
    }
};

// Auto-run diagnostics
console.log('🚀 Running automatic diagnostics...');
pricingDebug.checkCurrentPricing();
pricingDebug.testFormatPrice();
pricingDebug.checkCurrentUser();

console.log('\n💡 Available commands:');
console.log('- pricingDebug.checkCurrentPricing()');
console.log('- pricingDebug.testFormatPrice()');
console.log('- pricingDebug.simulatePricingSave(100, 150, 200)');
console.log('- pricingDebug.checkCurrentUser()');

console.log('\n🎯 TO FIX PRICING:');
console.log('1. Go to therapist dashboard');
console.log('2. Enter prices in 60min, 90min, 120min fields');
console.log('3. Make sure prices are > 0');
console.log('4. Click Save Profile');
console.log('5. Refresh home page to see updated prices');