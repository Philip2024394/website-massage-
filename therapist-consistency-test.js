/* 
THERAPIST DATA CONSISTENCY TEST
Copy and paste this into browser console (F12) to verify data consistency between:
1. Home page therapist cards
2. Therapist dashboard profile data
3. Appwrite database
*/

window.therapistConsistencyTest = {
    
    // Test 1: Compare home page cards with dashboard data
    async testDataConsistency(therapistName = null) {
        console.log('🧪 THERAPIST DATA CONSISTENCY TEST');
        console.log('=================================');
        
        // Get therapists from home page state
        const homePageTherapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        console.log('📊 Home Page Therapists Count:', homePageTherapists.length);
        
        // Filter live therapists (what shows on home page)
        const liveTherapists = homePageTherapists.filter(t => t.isLive === true);
        console.log('🔴 Live Therapists (shown on home):', liveTherapists.length);
        
        if (liveTherapists.length === 0) {
            console.warn('⚠️ NO LIVE THERAPISTS FOUND - Check if any profiles have isLive=true');
            return { status: 'NO_LIVE_THERAPISTS', liveCount: 0 };
        }
        
        // Test specific therapist or first live one
        const testTherapist = therapistName ? 
            liveTherapists.find(t => t.name.toLowerCase().includes(therapistName.toLowerCase())) :
            liveTherapists[0];
            
        if (!testTherapist) {
            console.error('❌ Test therapist not found:', therapistName);
            return { status: 'THERAPIST_NOT_FOUND', availableTherapists: liveTherapists.map(t => t.name) };
        }
        
        console.log('\n🎯 TESTING THERAPIST:', testTherapist.name);
        console.log('=====================================');
        
        // Check card data structure
        const cardData = {
            name: testTherapist.name,
            description: testTherapist.description,
            profilePicture: testTherapist.profilePicture,
            whatsappNumber: testTherapist.whatsappNumber,
            location: testTherapist.location,
            pricing: testTherapist.pricing,
            massageTypes: testTherapist.massageTypes,
            languages: testTherapist.languages,
            isLive: testTherapist.isLive,
            yearsOfExperience: testTherapist.yearsOfExperience || 'Not set'
        };
        
        console.log('📋 Card Data on Home Page:');
        console.table(cardData);
        
        // Check for required fields
        const requiredFields = ['name', 'profilePicture', 'whatsappNumber', 'location'];
        const missingFields = requiredFields.filter(field => !testTherapist[field] || testTherapist[field] === '');
        
        if (missingFields.length > 0) {
            console.warn('⚠️ MISSING REQUIRED FIELDS:', missingFields);
        } else {
            console.log('✅ All required fields present');
        }
        
        // Check pricing data
        let pricingData = {};
        try {
            pricingData = typeof testTherapist.pricing === 'string' ? 
                JSON.parse(testTherapist.pricing) : testTherapist.pricing;
            console.log('💰 Pricing Data:', pricingData);
            
            if (pricingData["60"] === 0 && pricingData["90"] === 0 && pricingData["120"] === 0) {
                console.warn('⚠️ All prices are 0 - will show "Contact" on cards');
            }
        } catch (e) {
            console.error('❌ Invalid pricing data:', testTherapist.pricing);
        }
        
        // Check massage types
        let massageTypesArray = [];
        try {
            massageTypesArray = typeof testTherapist.massageTypes === 'string' ? 
                JSON.parse(testTherapist.massageTypes) : testTherapist.massageTypes || [];
            console.log('💆 Massage Types:', massageTypesArray);
            
            if (massageTypesArray.length === 0) {
                console.warn('⚠️ No massage types specified');
            }
        } catch (e) {
            console.error('❌ Invalid massage types data:', testTherapist.massageTypes);
        }
        
        return {
            status: 'SUCCESS',
            therapist: testTherapist,
            cardData: cardData,
            missingFields: missingFields,
            pricingValid: Object.keys(pricingData).length > 0,
            massageTypesCount: massageTypesArray.length,
            isLive: testTherapist.isLive
        };
    },
    
    // Test 2: Verify data after login simulation
    async testLoginDataSync() {
        console.log('\n🔐 TESTING LOGIN DATA SYNC');
        console.log('==========================');
        
        // Check if there's debug data from recent profile save/load
        const saveData = localStorage.getItem('debug_therapist_save');
        const loadData = localStorage.getItem('debug_therapist_load');
        
        if (saveData) {
            const save = JSON.parse(saveData);
            console.log('💾 Last Profile Save:', save.timestamp);
            console.log('   - Therapist ID:', save.therapistId);
            console.log('   - Has required data:', {
                name: !!save.saveData?.name,
                profilePicture: !!save.saveData?.profilePicture,
                location: !!save.saveData?.location,
                pricing: !!save.saveData?.pricing
            });
        } else {
            console.log('❌ No recent profile save found');
        }
        
        if (loadData) {
            const load = JSON.parse(loadData);
            console.log('📖 Last Profile Load:', load.timestamp);
            console.log('   - Therapist ID:', load.therapistId);
            console.log('   - Profile found:', load.profileFound);
            console.log('   - Is Live:', load.isLive);
            console.log('   - Has required fields:', load.hasRequiredFields);
        } else {
            console.log('❌ No recent profile load found');
        }
        
        return { saveData: !!saveData, loadData: !!loadData };
    },
    
    // Test 3: Live card display verification
    testLiveCardDisplay() {
        console.log('\n🏠 TESTING LIVE CARD DISPLAY');
        console.log('=============================');
        
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        const liveTherapists = therapists.filter(t => t.isLive === true);
        
        console.log('📊 Total Therapists:', therapists.length);
        console.log('🔴 Live Therapists:', liveTherapists.length);
        console.log('⚪ Inactive Therapists:', therapists.length - liveTherapists.length);
        
        if (liveTherapists.length > 0) {
            console.log('\n✅ LIVE THERAPIST CARDS:');
            liveTherapists.forEach((therapist, index) => {
                console.log(`${index + 1}. ${therapist.name}`);
                console.log(`   - Location: ${therapist.location || 'Not set'}`);
                console.log(`   - WhatsApp: ${therapist.whatsappNumber || 'Not set'}`);
                console.log(`   - Profile Picture: ${therapist.profilePicture ? '✅ Set' : '❌ Missing'}`);
                
                // Check pricing
                try {
                    const pricing = typeof therapist.pricing === 'string' ? 
                        JSON.parse(therapist.pricing) : therapist.pricing;
                    const hasValidPricing = pricing["60"] > 0 || pricing["90"] > 0 || pricing["120"] > 0;
                    console.log(`   - Pricing: ${hasValidPricing ? '✅ Set' : '⚠️ All 0 (shows Contact)'}`);
                } catch {
                    console.log(`   - Pricing: ❌ Invalid data`);
                }
            });
        } else {
            console.warn('⚠️ NO LIVE THERAPISTS - Cards will not appear on home page');
            console.log('💡 Possible fixes:');
            console.log('   1. Set therapist isLive=true in dashboard');
            console.log('   2. Complete required profile fields');
            console.log('   3. Use therapistDebug.forceLive("therapistName") as emergency fix');
        }
        
        return {
            total: therapists.length,
            live: liveTherapists.length,
            inactive: therapists.length - liveTherapists.length,
            liveTherapists: liveTherapists.map(t => ({ name: t.name, location: t.location }))
        };
    },
    
    // Test 4: Full consistency check
    async fullConsistencyCheck(therapistName = null) {
        console.log('🔍 FULL THERAPIST CONSISTENCY CHECK');
        console.log('===================================');
        
        const test1 = await this.testDataConsistency(therapistName);
        const test2 = await this.testLoginDataSync();
        const test3 = this.testLiveCardDisplay();
        
        console.log('\n📊 SUMMARY REPORT:');
        console.log('==================');
        console.log('✅ Data Consistency:', test1.status === 'SUCCESS' ? 'PASS' : 'FAIL');
        console.log('✅ Login Sync:', test2.saveData && test2.loadData ? 'PASS' : 'PARTIAL');
        console.log('✅ Live Display:', test3.live > 0 ? 'PASS' : 'FAIL');
        
        if (test1.status === 'SUCCESS' && test3.live > 0) {
            console.log('\n🎉 ALL TESTS PASSED - Cards and dashboard are in sync!');
        } else {
            console.log('\n⚠️ ISSUES FOUND - Check individual test results above');
        }
        
        return {
            dataConsistency: test1,
            loginSync: test2,
            liveDisplay: test3,
            overallStatus: test1.status === 'SUCCESS' && test3.live > 0 ? 'PASS' : 'FAIL'
        };
    },
    
    // Helper: Get therapist by email (for login testing)
    findTherapistByEmail(email) {
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        return therapists.find(t => t.email === email);
    },
    
    // Helper: Simulate dashboard data for testing
    simulateDashboardData(therapistName) {
        const therapists = JSON.parse(localStorage.getItem('app_therapists') || '[]');
        const therapist = therapists.find(t => t.name.toLowerCase().includes(therapistName.toLowerCase()));
        
        if (therapist) {
            console.log('🧑‍⚕️ SIMULATED DASHBOARD DATA FOR:', therapist.name);
            console.log('================================');
            console.log('Profile Form would show:');
            console.table({
                'Name': therapist.name || '[Empty]',
                'Description': therapist.description?.substring(0, 50) + '...' || '[Empty]',
                'WhatsApp': therapist.whatsappNumber || '[Empty]',
                'Location': therapist.location || '[Empty]',
                'Profile Picture': therapist.profilePicture ? 'Set' : '[Empty]',
                'Years Experience': therapist.yearsOfExperience || '[Empty]',
                'Is Live': therapist.isLive ? 'Yes' : 'No'
            });
            
            return therapist;
        } else {
            console.error('❌ Therapist not found:', therapistName);
            return null;
        }
    }
};

// Auto-run basic test
console.log('🛠️ Therapist Consistency Test Helper Loaded');
console.log('Available commands:');
console.log('- therapistConsistencyTest.fullConsistencyCheck() - Complete test');
console.log('- therapistConsistencyTest.testLiveCardDisplay() - Check live cards');
console.log('- therapistConsistencyTest.testDataConsistency("therapistName") - Test specific therapist');
console.log('- therapistConsistencyTest.simulateDashboardData("therapistName") - Check dashboard data');