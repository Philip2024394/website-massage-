/**
 * Appwrite Analytics Collection Setup Script
 * 
 * This script creates the analytics_events collection with all required attributes and indexes
 * Run with: node scripts/setup-analytics-collection.js
 */

import { Client, Databases, Permission, Role } from 'node-appwrite';

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://syd.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '68f23b11000d25eb3664';
const APPWRITE_DATABASE_ID = '68f76ee1000e64ca8d05';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || 'YOUR_API_KEY_HERE';

const COLLECTION_ID = 'analytics_events';
const COLLECTION_NAME = 'Analytics Events';

// Initialize Appwrite Client
const client = new Client()
    .setEndpoint(APPWRITE_ENDPOINT)
    .setProject(APPWRITE_PROJECT_ID)
    .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

// Collection Attributes Configuration
const ATTRIBUTES = [
    // Required Attributes
    {
        key: 'eventType',
        type: 'string',
        size: 100,
        required: true,
        array: false,
        description: 'Type of analytics event (profile_view, booking_completed, etc.)'
    },
    {
        key: 'timestamp',
        type: 'datetime',
        required: true,
        array: false,
        description: 'When the event occurred'
    },
    
    // Entity ID Attributes (Optional)
    {
        key: 'userId',
        type: 'string',
        size: 100,
        required: false,
        array: false,
        description: 'User who triggered the event'
    },
    {
        key: 'therapistId',
        type: 'string',
        size: 100,
        required: false,
        array: false,
        description: 'Therapist related to the event'
    },
    {
        key: 'placeId',
        type: 'string',
        size: 100,
        required: false,
        array: false,
        description: 'Massage place related to the event'
    },
    {
        key: 'hotelId',
        type: 'string',
        size: 100,
        required: false,
        array: false,
        description: 'Hotel related to the event'
    },
    {
        key: 'villaId',
        type: 'string',
        size: 100,
        required: false,
        array: false,
        description: 'Villa related to the event'
    },
    
    // Transaction Attributes (Optional)
    {
        key: 'bookingId',
        type: 'integer',
        required: false,
        array: false,
        description: 'Booking ID for booking-related events'
    },
    {
        key: 'amount',
        type: 'float',
        required: false,
        array: false,
        description: 'Transaction amount (revenue, commission, etc.)'
    },
    {
        key: 'currency',
        type: 'string',
        size: 10,
        required: false,
        array: false,
        description: 'Currency code (IDR, USD, etc.)'
    },
    
    // Metadata Attributes (Optional)
    {
        key: 'metadata',
        type: 'string',
        size: 5000,
        required: false,
        array: false,
        description: 'Additional event data as JSON string'
    },
    {
        key: 'sessionId',
        type: 'string',
        size: 200,
        required: false,
        array: false,
        description: 'User session identifier'
    },
    {
        key: 'deviceType',
        type: 'string',
        size: 20,
        required: false,
        array: false,
        description: 'Device type (mobile, desktop, tablet)'
    },
    {
        key: 'userAgent',
        type: 'string',
        size: 500,
        required: false,
        array: false,
        description: 'Browser user agent string'
    },
    {
        key: 'location',
        type: 'string',
        size: 200,
        required: false,
        array: false,
        description: 'Geographic location (city, country)'
    }
];

// Index Configuration
const INDEXES = [
    {
        key: 'event_type_idx',
        type: 'key',
        attributes: ['eventType', 'timestamp'],
        orders: ['ASC', 'DESC']
    },
    {
        key: 'therapist_events_idx',
        type: 'key',
        attributes: ['therapistId', 'eventType', 'timestamp'],
        orders: ['ASC', 'ASC', 'DESC']
    },
    {
        key: 'place_events_idx',
        type: 'key',
        attributes: ['placeId', 'eventType', 'timestamp'],
        orders: ['ASC', 'ASC', 'DESC']
    },
    {
        key: 'hotel_events_idx',
        type: 'key',
        attributes: ['hotelId', 'eventType', 'timestamp'],
        orders: ['ASC', 'ASC', 'DESC']
    },
    {
        key: 'date_range_idx',
        type: 'key',
        attributes: ['timestamp'],
        orders: ['DESC']
    }
];

// ============================================================================
// SETUP FUNCTIONS
// ============================================================================

async function createCollection() {
    console.log('📦 Creating analytics_events collection...');
    
    try {
        const collection = await databases.createCollection(
            APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            COLLECTION_NAME,
            [
                Permission.create(Role.users()),
                Permission.read(Role.users()),
                Permission.delete(Role.label('admin'))
            ],
            false, // documentSecurity
            true   // enabled
        );
        
        console.log('✅ Collection created successfully:', collection.$id);
        return collection;
    } catch (error) {
        if (error.code === 409) {
            console.log('⚠️  Collection already exists, skipping creation');
            return { $id: COLLECTION_ID };
        }
        throw error;
    }
}

async function createAttribute(attr) {
    console.log(`  ➕ Adding attribute: ${attr.key} (${attr.type})...`);
    
    try {
        let result;
        
        switch (attr.type) {
            case 'string':
                result = await databases.createStringAttribute(
                    APPWRITE_DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.size,
                    attr.required,
                    null, // default
                    attr.array || false
                );
                break;
                
            case 'integer':
                result = await databases.createIntegerAttribute(
                    APPWRITE_DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.required,
                    null, // min
                    null, // max
                    null, // default
                    attr.array || false
                );
                break;
                
            case 'float':
                result = await databases.createFloatAttribute(
                    APPWRITE_DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.required,
                    null, // min
                    null, // max
                    null, // default
                    attr.array || false
                );
                break;
                
            case 'datetime':
                result = await databases.createDatetimeAttribute(
                    APPWRITE_DATABASE_ID,
                    COLLECTION_ID,
                    attr.key,
                    attr.required,
                    null, // default
                    attr.array || false
                );
                break;
                
            default:
                throw new Error(`Unknown attribute type: ${attr.type}`);
        }
        
        console.log(`  ✅ Attribute ${attr.key} created`);
        return result;
    } catch (error) {
        if (error.code === 409) {
            console.log(`  ⚠️  Attribute ${attr.key} already exists, skipping`);
        } else {
            console.error(`  ❌ Error creating attribute ${attr.key}:`, error.message);
            throw error;
        }
    }
}

async function createIndex(index) {
    console.log(`  🔍 Creating index: ${index.key}...`);
    
    try {
        const result = await databases.createIndex(
            APPWRITE_DATABASE_ID,
            COLLECTION_ID,
            index.key,
            index.type,
            index.attributes,
            index.orders
        );
        
        console.log(`  ✅ Index ${index.key} created`);
        return result;
    } catch (error) {
        if (error.code === 409) {
            console.log(`  ⚠️  Index ${index.key} already exists, skipping`);
        } else {
            console.error(`  ❌ Error creating index ${index.key}:`, error.message);
            throw error;
        }
    }
}

async function setupAnalyticsCollection() {
    console.log('\n🚀 Starting Appwrite Analytics Collection Setup\n');
    console.log('Configuration:');
    console.log(`  Endpoint: ${APPWRITE_ENDPOINT}`);
    console.log(`  Project: ${APPWRITE_PROJECT_ID}`);
    console.log(`  Database: ${APPWRITE_DATABASE_ID}`);
    console.log(`  Collection: ${COLLECTION_ID}\n`);
    
    try {
        // Step 1: Create Collection
        await createCollection();
        
        // Step 2: Create Attributes
        console.log('\n📝 Creating attributes...');
        for (const attr of ATTRIBUTES) {
            await createAttribute(attr);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Step 3: Wait for attributes to be available
        console.log('\n⏳ Waiting 10 seconds for attributes to be ready...');
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        // Step 4: Create Indexes
        console.log('\n🔍 Creating indexes...');
        for (const index of INDEXES) {
            await createIndex(index);
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        console.log('\n✅ Analytics collection setup completed successfully!\n');
        console.log('Summary:');
        console.log(`  ✅ Collection: ${COLLECTION_ID}`);
        console.log(`  ✅ Attributes: ${ATTRIBUTES.length}`);
        console.log(`  ✅ Indexes: ${INDEXES.length}`);
        console.log('\n🎉 Your analytics system is now ready to track events!\n');
        
    } catch (error) {
        console.error('\n❌ Setup failed:', error.message);
        console.error('\nPlease check:');
        console.error('  1. Your APPWRITE_API_KEY is set correctly');
        console.error('  2. The API key has permission to create collections');
        console.error('  3. The database ID is correct');
        console.error('\nSet API key with: $env:APPWRITE_API_KEY="your-api-key"\n');
        process.exit(1);
    }
}

// Run setup
setupAnalyticsCollection();

export { setupAnalyticsCollection };
