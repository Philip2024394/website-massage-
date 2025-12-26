/**
 * Setup Appwrite UI Configuration Collection
 * 
 * This script creates the ui_config collection and seeds it with initial configuration documents.
 * 
 * Run this script once to set up the UI configuration system:
 * node scripts/setupUIConfig.cjs
 */

const sdk = require('node-appwrite');

// Initialize Appwrite client
const client = new sdk.Client();
const databases = new sdk.Databases(client);

// Appwrite configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '67ad11370013cea5c66b';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY; // Set this in your environment
const DATABASE_ID = '67ad12f5003ce2f7bcc2';
const COLLECTION_ID = 'ui_config'; // New collection

// Configure client
client
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

// Initial configuration documents
const DEFAULT_CONFIGS = [
    {
        configKey: 'book_now_behavior',
        enabled: true,
        settings: JSON.stringify({
            type: 'whatsapp', // 'whatsapp' or 'popup'
            skipPopup: true,
            message: "Hi {{therapistName}}! 👋\n\nI found your profile on Indastreet and I'm interested in booking a massage service.\n\nCould you please share your availability and confirm the pricing?\n\nThank you! 🙏"
        }),
        priority: 100,
        description: 'Controls Book Now button behavior - whether to open WhatsApp directly or show a popup'
    },
    {
        configKey: 'schedule_behavior',
        enabled: true,
        settings: JSON.stringify({
            type: 'whatsapp', // 'whatsapp', 'popup', or 'schedule'
            skipPopup: true,
            message: "Hi {{therapistName}}! 👋\n\nI'd like to schedule a massage appointment.\n\nWhat times do you have available?\n\nThank you! 🙏"
        }),
        priority: 90,
        description: 'Controls Schedule button behavior - WhatsApp, popup, or scheduling system'
    },
    {
        configKey: 'welcome_popup',
        enabled: true,
        settings: JSON.stringify({
            showOnFirstVisit: true,
            title: 'Welcome to Indastreet!',
            message: 'Find the best massage therapists in your area',
            dismissible: true
        }),
        priority: 80,
        description: 'First-time visitor welcome popup configuration'
    },
    {
        configKey: 'location_modal',
        enabled: false,
        settings: JSON.stringify({
            autoShow: false,
            radius: 50,
            unit: 'km'
        }),
        priority: 70,
        description: 'Location permission modal settings'
    },
    {
        configKey: 'features',
        enabled: true,
        settings: JSON.stringify({
            chatEnabled: true,
            coinSystemEnabled: true,
            bookingSystemEnabled: true,
            locationFilterEnabled: false
        }),
        priority: 60,
        description: 'Global feature flags'
    }
];

async function createCollection() {
    try {
        console.log('📦 Creating ui_config collection...');
        
        const collection = await databases.createCollection(
            DATABASE_ID,
            COLLECTION_ID,
            'UI Configuration',
            [
                sdk.Permission.read(sdk.Role.any()),
                sdk.Permission.write(sdk.Role.team('admin')),
            ]
        );
        
        console.log('✅ Collection created successfully:', collection.$id);
        return collection;
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ Collection already exists, skipping creation');
            return null;
        }
        throw error;
    }
}

async function createAttributes() {
    try {
        console.log('📋 Creating collection attributes...');
        
        // configKey - unique identifier for the configuration
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'configKey',
            255,
            true, // required
            undefined, // default
            false // array
        );
        console.log('✅ Created configKey attribute');
        
        // Wait for attribute to be available
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // enabled - whether this config is active
        await databases.createBooleanAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'enabled',
            true, // required
            true // default to true
        );
        console.log('✅ Created enabled attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // settings - JSON string containing the actual configuration
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'settings',
            10000, // Large enough for JSON
            true, // required
            undefined,
            false
        );
        console.log('✅ Created settings attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // priority - for ordering configs
        await databases.createIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'priority',
            true, // required
            0, // default
            100, // min
            0 // max (0 means no max)
        );
        console.log('✅ Created priority attribute');
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // description - human-readable description
        await databases.createStringAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            'description',
            1000,
            false, // not required
            undefined,
            false
        );
        console.log('✅ Created description attribute');
        
        // Wait for all attributes to be fully available
        console.log('⏳ Waiting for attributes to be fully available...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Create unique index on configKey
        await databases.createIndex(
            DATABASE_ID,
            COLLECTION_ID,
            'configKey_unique',
            'unique',
            ['configKey']
        );
        console.log('✅ Created unique index on configKey');
        
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ Attributes already exist, skipping creation');
        } else {
            throw error;
        }
    }
}

async function seedConfigurations() {
    try {
        console.log('🌱 Seeding initial configurations...');
        
        for (const config of DEFAULT_CONFIGS) {
            try {
                const document = await databases.createDocument(
                    DATABASE_ID,
                    COLLECTION_ID,
                    sdk.ID.unique(),
                    config
                );
                console.log(`✅ Created config: ${config.configKey}`);
            } catch (error) {
                if (error.code === 409) {
                    console.log(`ℹ️ Config ${config.configKey} already exists, skipping`);
                } else {
                    console.error(`❌ Failed to create ${config.configKey}:`, error.message);
                }
            }
        }
        
        console.log('✅ Configuration seeding complete');
    } catch (error) {
        console.error('❌ Error seeding configurations:', error);
        throw error;
    }
}

async function main() {
    try {
        console.log('🚀 Starting UI Configuration Setup...\n');
        
        if (!APPWRITE_API_KEY) {
            console.error('❌ APPWRITE_API_KEY environment variable is required');
            console.log('\nPlease set your API key:');
            console.log('  Windows: $env:APPWRITE_API_KEY="your-api-key"');
            console.log('  Linux/Mac: export APPWRITE_API_KEY="your-api-key"');
            console.log('\nGet your API key from: https://cloud.appwrite.io/console/project-67ad11370013cea5c66b/settings');
            process.exit(1);
        }
        
        // Step 1: Create collection
        await createCollection();
        
        // Step 2: Create attributes
        await createAttributes();
        
        // Step 3: Seed configurations
        await seedConfigurations();
        
        console.log('\n✅ UI Configuration Setup Complete!');
        console.log('\n📝 Next Steps:');
        console.log('1. Verify the collection in Appwrite console');
        console.log('2. Test the configuration by checking the browser console logs');
        console.log('3. Update configurations in Appwrite console to change button behavior');
        console.log('\n💡 To change Book Now to popup: Update book_now_behavior.settings.type to "popup"');
        console.log('💡 To change Schedule to popup: Update schedule_behavior.settings.type to "popup"');
        console.log('\n🎉 Your buttons will now read behavior from the database!');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error);
        process.exit(1);
    }
}

main();
