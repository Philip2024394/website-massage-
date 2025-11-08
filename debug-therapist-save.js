// 🔍 THERAPIST PROFILE SAVE DEBUG TEST
// Use this in browser console while testing the therapist dashboard

console.log('🔍 Starting Therapist Profile Save Debug Test...');

// Function to test the save process step by step
function debugTherapistSave() {
    console.log('\n=== 🔍 THERAPIST PROFILE SAVE DEBUG ===');
    
    // Check if we're on the right page
    const currentUrl = window.location.href;
    console.log('📍 Current URL:', currentUrl);
    
    // Check if therapist dashboard elements exist
    const saveButton = document.querySelector('button[type="button"]');
    console.log('💾 Save button found:', !!saveButton);
    
    // Check local storage for previous save attempts
    const debugInfo = localStorage.getItem('debug_therapist_save');
    if (debugInfo) {
        console.log('🗂️ Previous save attempt found:');
        try {
            const parsed = JSON.parse(debugInfo);
            console.log('⏰ Last save attempt:', parsed.timestamp);
            console.log('🆔 Therapist ID:', parsed.therapistId);
            console.log('📝 Had required fields:', {
                name: !!parsed.saveData?.name,
                whatsappNumber: !!parsed.saveData?.whatsappNumber,
                profilePicture: !!parsed.saveData?.profilePicture,
                location: !!parsed.saveData?.location
            });
            console.log('🔗 onSave function was available:', parsed.onSaveExists);
        } catch (e) {
            console.log('❌ Could not parse debug info:', e);
        }
    } else {
        console.log('📝 No previous save attempts found in localStorage');
    }
    
    // Check if user is logged in as therapist
    console.log('\n=== 👤 USER SESSION CHECK ===');
    const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
    if (userSession) {
        try {
            const session = JSON.parse(userSession);
            console.log('👤 Logged in as:', session.userType);
            console.log('🆔 User ID:', session.userId);
            console.log('📧 Email:', session.email);
        } catch (e) {
            console.log('❌ Could not parse user session');
        }
    } else {
        console.log('❌ NO USER SESSION FOUND - This could be the problem!');
    }
    
    // Check network requests
    console.log('\n=== 🌐 NETWORK MONITORING ===');
    console.log('📡 Monitoring network requests for next 30 seconds...');
    console.log('👆 Now try to save your profile and watch for network activity');
    
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('appwrite')) {
            console.log('📡 Appwrite API call:', url);
            return originalFetch.apply(this, args)
                .then(response => {
                    console.log('📡 Appwrite response status:', response.status);
                    if (!response.ok) {
                        console.log('❌ Appwrite error response:', response.statusText);
                    }
                    return response;
                })
                .catch(error => {
                    console.log('❌ Appwrite network error:', error);
                    throw error;
                });
        }
        return originalFetch.apply(this, args);
    };
    
    // Restore original fetch after 30 seconds
    setTimeout(() => {
        window.fetch = originalFetch;
        console.log('📡 Network monitoring stopped');
    }, 30000);
}

// Function to check form validation
function checkFormValidation() {
    console.log('\n=== 📋 FORM VALIDATION CHECK ===');
    
    // Try to find form inputs
    const nameInput = document.querySelector('input[placeholder*="name" i]') || document.querySelector('input[type="text"]');
    const whatsappInput = document.querySelector('input[placeholder*="whatsapp" i]') || document.querySelector('input[type="tel"]');
    
    console.log('📝 Form elements found:');
    console.log('  Name input:', !!nameInput, nameInput?.value);
    console.log('  WhatsApp input:', !!whatsappInput, whatsappInput?.value);
    
    // Check for file upload
    const fileInput = document.querySelector('input[type="file"]');
    console.log('  File input:', !!fileInput);
    if (fileInput) {
        console.log('  Files selected:', fileInput.files?.length || 0);
    }
    
    // Check for validation messages
    const errorMessages = document.querySelectorAll('[class*="error"], [class*="invalid"]');
    if (errorMessages.length > 0) {
        console.log('⚠️ Validation errors found:');
        errorMessages.forEach((el, i) => {
            console.log(`  ${i + 1}:`, el.textContent?.trim());
        });
    }
}

// Function to simulate a save attempt
function simulateSave() {
    console.log('\n=== 🧪 SIMULATING SAVE ATTEMPT ===');
    
    const saveButton = document.querySelector('button[type="button"]') || 
                      document.querySelector('button:contains("Save")') ||
                      Array.from(document.querySelectorAll('button')).find(btn => 
                          btn.textContent?.toLowerCase().includes('save')
                      );
    
    if (saveButton) {
        console.log('💾 Save button found, clicking...');
        saveButton.click();
        
        // Wait for potential console messages
        setTimeout(() => {
            console.log('⏰ Save attempt completed - check console messages above');
        }, 2000);
    } else {
        console.log('❌ No save button found on the page');
    }
}

// Run the debug functions
debugTherapistSave();
checkFormValidation();

// Provide instructions
console.log('\n=== 🎯 DEBUG INSTRUCTIONS ===');
console.log('1. Fill out the therapist profile form completely');
console.log('2. Make sure to upload a profile image');
console.log('3. Run: simulateSave() to test the save process');
console.log('4. Watch the console for error messages');
console.log('5. Report back with any error messages you see');

// Make functions available globally
window.debugTherapistSave = debugTherapistSave;
window.checkFormValidation = checkFormValidation;
window.simulateSave = simulateSave;

console.log('\n✅ Debug test loaded. Functions available: debugTherapistSave(), checkFormValidation(), simulateSave()');