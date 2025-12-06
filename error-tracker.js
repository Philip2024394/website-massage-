// Console error handler for debugging SVG and React DOM issues
let originalConsoleError = console.error;

console.error = function(...args) {
    const errorMessage = args.join(' ');
    
    // Track SVG path attribute errors
    if (errorMessage.includes('path') && errorMessage.includes('attribute') && errorMessage.includes('d')) {
        console.log('🔍 SVG Path Error Detected:', {
            error: errorMessage,
            stack: new Error().stack,
            timestamp: new Date().toISOString()
        });
    }
    
    // Track React DOM errors
    if (errorMessage.includes('removeChild') || errorMessage.includes('React') || errorMessage.includes('DOM')) {
        console.log('🔍 React DOM Error Detected:', {
            error: errorMessage,
            stack: new Error().stack,
            timestamp: new Date().toISOString()
        });
    }
    
    // Track Appwrite errors
    if (errorMessage.includes('Appwrite') || errorMessage.includes('admin_messages') || errorMessage.includes('villas_collection_id')) {
        console.log('🔍 Appwrite Error Detected:', {
            error: errorMessage,
            stack: new Error().stack,
            timestamp: new Date().toISOString()
        });
    }
    
    // Call original console.error
    originalConsoleError.apply(console, args);
};

console.log('🔧 Enhanced error tracking enabled for SVG, React DOM, and Appwrite issues');