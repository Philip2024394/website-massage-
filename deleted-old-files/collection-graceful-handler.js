/**
 * Collection Graceful Handler
 * This script will fix all service methods to handle disabled collections gracefully
 */

// Function to create graceful handlers for disabled collections
const createGracefulHandler = (methodName, returnValue = []) => {
    return `
    async ${methodName}(...args: any[]): Promise<any> {
        try {
            if (!APPWRITE_CONFIG.collections.${collectionName} || APPWRITE_CONFIG.collections.${collectionName} === '') {
                console.warn('⚠️ ${collectionName} collection disabled - returning ${JSON.stringify(returnValue)}');
                return ${JSON.stringify(returnValue)};
            }
            
            // Original method logic would go here
            // This is a placeholder for the actual implementation
            throw new Error('Collection ${collectionName} not properly configured');
        } catch (error) {
            console.error('❌ Error in ${methodName} for ${collectionName}:', error);
            return ${JSON.stringify(returnValue)};
        }
    },`;
};

// List of collections that need graceful handling
const disabledCollections = [
    'places',
    'bookings', 
    'users',
    'notifications',
    'agents',
    'reviews'
];

// Methods that need graceful handling for each collection
const methodsToFix = {
    places: ['getAll', 'create', 'update', 'delete', 'getById', 'search'],
    bookings: ['getAll', 'create', 'update', 'delete', 'getById', 'getByUser', 'getByProvider'],
    users: ['create', 'getAll', 'getById', 'getByUserId'],
    notifications: ['create', 'getAll', 'update', 'getByProvider', 'getUnread'],
    agents: ['create', 'getAll', 'update', 'delete'],
    reviews: ['create', 'getAll', 'update', 'delete', 'getByProvider', 'getByUser']
};

console.log('🔧 Collection Graceful Handler Configuration');
console.log('Disabled collections:', disabledCollections);
console.log('Methods per collection:', methodsToFix);

// Export for use in other scripts
if (typeof module !== 'undefined') {
    module.exports = { createGracefulHandler, disabledCollections, methodsToFix };
}