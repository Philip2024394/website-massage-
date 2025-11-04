/**
 * Browser Console Test Script for Therapist Authentication
 */

const THERAPIST_TEST_EMAIL = 'test.therapist@indastreet.com';
const THERAPIST_TEST_PASSWORD = 'TestTherapist123!';

function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function log(msg) { console.log(`🧪 [THERAPIST] ${msg}`); }
function logSuccess(msg) { console.log(`✅ [THERAPIST PASS] ${msg}`); }
function logError(msg) { console.error(`❌ [THERAPIST FAIL] ${msg}`); }

async function testTherapistFlow() {
    log('Starting Therapist Authentication Flow Test...');
    
    try {
        // Navigate to therapist login
        const therapistBtn = Array.from(document.querySelectorAll('button, a'))
            .find(el => el.textContent.toLowerCase().includes('therapist'));
        
        if (therapistBtn) {
            therapistBtn.click();
            await delay(2000);
        } else if (typeof window.setPage === 'function') {
            window.setPage('therapistLogin');
            await delay(2000);
        }
        
        // Test Signup
        const signupBtn = Array.from(document.querySelectorAll('button'))
            .find(btn => btn.textContent.includes('Create Account'));
        if (signupBtn) {
            signupBtn.click();
            await delay(1000);
        }
        
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (emailInput && passwordInput) {
            emailInput.value = THERAPIST_TEST_EMAIL;
            passwordInput.value = THERAPIST_TEST_PASSWORD;
            emailInput.dispatchEvent(new Event('input', { bubbles: true }));
            passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
            
            const submitBtn = document.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
                await delay(3000);
                
                if (document.body.textContent.includes('created successfully')) {
                    logSuccess('Therapist account created');
                    
                    // Test Signin
                    const signinBtn = Array.from(document.querySelectorAll('button'))
                        .find(btn => btn.textContent.includes('Sign In') && !btn.textContent.includes('Create'));
                    if (signinBtn) signinBtn.click();
                    await delay(1000);
                    
                    emailInput.value = THERAPIST_TEST_EMAIL;
                    passwordInput.value = THERAPIST_TEST_PASSWORD;
                    emailInput.dispatchEvent(new Event('input', { bubbles: true }));
                    passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    submitBtn.click();
                    await delay(3000);
                    
                    if (document.body.textContent.includes('Dashboard') || document.body.textContent.includes('Logout')) {
                        logSuccess('Therapist signin successful - dashboard accessed');
                        
                        // Test Logout
                        const logoutBtn = Array.from(document.querySelectorAll('button'))
                            .find(btn => btn.textContent.includes('Logout'));
                        if (logoutBtn) {
                            logoutBtn.click();
                            await delay(2000);
                            if (!document.body.textContent.includes('Dashboard')) {
                                logSuccess('Therapist logout successful');
                                return true;
                            }
                        }
                    }
                }
            }
        }
        
        logError('Therapist flow incomplete');
        return false;
        
    } catch (error) {
        logError(`Therapist test failed: ${error.message}`);
        return false;
    }
}

window.therapistTest = { testTherapistFlow };
console.log('🧪 Therapist Test Loaded! Run: window.therapistTest.testTherapistFlow()');