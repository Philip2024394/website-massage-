// DOM Error Diagnostic Test
// Paste this into browser console to help identify the removeChild issue

console.log('🔍 Starting DOM Error Diagnostic...');

// Override removeChild to catch where the error occurs
const originalRemoveChild = Node.prototype.removeChild;
Node.prototype.removeChild = function(child) {
    try {
        console.log('🗑️ Attempting to remove child:', child);
        console.log('📍 Parent node:', this);
        console.log('🔗 Child parent:', child.parentNode);
        console.log('✅ Parent contains child:', this.contains(child));
        
        if (!this.contains(child)) {
            console.error('❌ ERROR: Parent does not contain child!');
            console.trace('Stack trace:');
            throw new Error('Parent does not contain child');
        }
        
        return originalRemoveChild.call(this, child);
    } catch (error) {
        console.error('💥 removeChild error caught:', error);
        console.trace('Error stack trace:');
        throw error;
    }
};

console.log('✅ DOM monitoring enabled. removeChild calls will be logged.');
console.log('🎯 Navigate to trigger the error and check console for details.');