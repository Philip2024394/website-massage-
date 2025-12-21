const sdk = require('node-appwrite');

const client = new sdk.Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_28bc08af9f88cbbca6db88f36baed10e44a265c9d4c74c1e969d5e5821b7330f3f942611bee1130b71bd8fd66a6c1c65cc89bc8e49cf27d6fc4b10b63b75aca4a14ecd5dc48f42b8a2ec96e4cd5fa0e52e3e7eb84cfb62f21a8a9df3a7eab8c1e5e14e0809dcce01d33c4f62bc7c7c6d0f13a70267beb24f6b6a2c20d0fe95e');

const databases = new sdk.Databases(client);

const APPWRITE_CONFIG = {
    databaseId: '68f76ee1000e64ca8d05',
    collections: {
        therapistMenus: 'therapist_menus'
    }
};

async function updateMenuDataFieldSize() {
    console.log('🔄 Updating menuData field size...');
    console.log('📊 Current limit: 1000 characters');
    console.log('🎯 New limit: 10000 characters');
    
    try {
        // Update the menuData attribute to allow 10000 characters
        await databases.updateStringAttribute(
            APPWRITE_CONFIG.databaseId,
            APPWRITE_CONFIG.collections.therapistMenus,
            'menuData',
            10000, // New size: 10KB
            true   // Required
        );
        
        console.log('✅ Successfully updated menuData field to 10000 characters!');
        console.log('💡 This allows approximately 60-80 menu items');
        
    } catch (error) {
        console.error('❌ Failed to update field size:', error);
        if (error.message) {
            console.error('Error message:', error.message);
        }
        process.exit(1);
    }
}

updateMenuDataFieldSize();
