// DEBUG SCRIPT - Test therapist status update directly
// Run this in browser console when logged in as a therapist

console.log('🔧 THERAPIST STATUS DEBUG TOOL');

// Function to test status update directly
window.debugTherapistStatus = async (therapistId, newStatus) => {
    console.log('🚀 Testing direct therapist status update...');
    console.log('📊 Parameters:', { therapistId, newStatus });
    
    try {
        // Import the service (assuming it's available globally)
        const { therapistService } = window;
        
        if (!therapistService) {
            console.error('❌ therapistService not available');
            return;
        }
        
        // Test getting the therapist first
        console.log('🔍 Step 1: Testing therapist fetch...');
        const existing = await therapistService.getById(therapistId);
        console.log('✅ Existing therapist:', existing);
        
        // Test the update
        console.log('🔄 Step 2: Testing status update...');
        const result = await therapistService.update(therapistId, { 
            status: newStatus,
            availability: newStatus // Update both fields
        });
        console.log('✅ Update result:', result);
        
        // Verify the change
        console.log('🔍 Step 3: Verifying update...');
        const updated = await therapistService.getById(therapistId);
        console.log('✅ Updated therapist:', updated);
        console.log('✅ Status changed from', existing?.status, 'to', updated?.status);
        
        return { success: true, before: existing, after: updated };
        
    } catch (error) {
        console.error('❌ Debug test failed:', error);
        return { success: false, error };
    }
};

// Test with known therapist IDs from your data
const knownTherapistIds = [
    '690a0a0f002949071cb4', // phil4
    '6909ea3d000968f94102', // ph3
    '6909bc5400289a16c995', // philip1
    '6909ad5e00341154e55d'  // teamhammerex
];

console.log('📋 Known therapist IDs for testing:', knownTherapistIds);
console.log('🔧 Usage: debugTherapistStatus("690a0a0f002949071cb4", "Available")');
console.log('🔧 Available statuses: "Available", "Busy", "Offline"');