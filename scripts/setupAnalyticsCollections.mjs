#!/usr/bin/env node

/**
 * 🚀 Database Collections Setup for Analytics, Health & Backup Systems
 * 
 * This script creates the necessary Appwrite collections for:
 * - User analytics tracking
 * - System health monitoring  
 * - Backup logging and metadata
 */

import { databases, DATABASE_ID, ID } from '../lib/appwrite.js';
import { Permission, Role } from 'appwrite';

const COLLECTIONS = {
    USER_ANALYTICS: 'user_analytics',
    SYSTEM_HEALTH_LOGS: 'system_health_logs',
    BACKUP_LOGS: 'backup_logs',
    BACKUP_METADATA: 'backup_metadata'
};

async function createAnalyticsCollection() {
    console.log('📊 Creating user_analytics collection...');
    
    try {
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.USER_ANALYTICS,
            'User Analytics',
            [
                Permission.create(Role.any()),
                Permission.read(Role.any()),
                Permission.update(Role.label('admin')),
                Permission.delete(Role.label('admin'))
            ]
        );

        // Create attributes for analytics events
        const attributes = [
            { key: 'eventType', size: 50, required: true },
            { key: 'userId', size: 100, required: false },
            { key: 'sessionId', size: 100, required: false },
            { key: 'timestamp', required: true },
            { key: 'userAgent', size: 500, required: false },
            { key: 'metadata', required: false }, // JSON field
            { key: 'location', required: false }, // JSON field
            { key: 'performance', required: false } // JSON field
        ];

        for (const attr of attributes) {
            if (attr.key === 'timestamp') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    COLLECTIONS.USER_ANALYTICS,
                    attr.key,
                    attr.required
                );
            } else if (['metadata', 'location', 'performance'].includes(attr.key)) {
                // Create as text field for JSON storage
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.USER_ANALYTICS,
                    attr.key,
                    5000, // Large size for JSON
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.USER_ANALYTICS,
                    attr.key,
                    attr.size || 255,
                    attr.required
                );
            }
        }

        // Create indexes
        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.USER_ANALYTICS,
            'eventType_index',
            'key',
            ['eventType']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.USER_ANALYTICS,
            'timestamp_index',
            'key',
            ['timestamp']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.USER_ANALYTICS,
            'userId_index',
            'key',
            ['userId']
        );

        console.log('✅ user_analytics collection created successfully');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ user_analytics collection already exists');
        } else {
            console.error('❌ Error creating user_analytics collection:', error);
        }
    }
}

async function createHealthLogsCollection() {
    console.log('🏥 Creating system_health_logs collection...');
    
    try {
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.SYSTEM_HEALTH_LOGS,
            'System Health Logs',
            [
                Permission.create(Role.label('admin')),
                Permission.read(Role.any()),
                Permission.update(Role.label('admin')),
                Permission.delete(Role.label('admin'))
            ]
        );

        // Create attributes for health monitoring
        const attributes = [
            { key: 'overall', size: 20, required: true },
            { key: 'score', required: true }, // Integer
            { key: 'generatedAt', required: true }, // DateTime
            { key: 'responseTime', required: true }, // Integer
            { key: 'checks', required: true }, // JSON field (as text)
            { key: 'summary', required: true } // JSON field (as text)
        ];

        for (const attr of attributes) {
            if (attr.key === 'generatedAt') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    COLLECTIONS.SYSTEM_HEALTH_LOGS,
                    attr.key,
                    attr.required
                );
            } else if (['score', 'responseTime'].includes(attr.key)) {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    COLLECTIONS.SYSTEM_HEALTH_LOGS,
                    attr.key,
                    attr.required
                );
            } else if (['checks', 'summary'].includes(attr.key)) {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.SYSTEM_HEALTH_LOGS,
                    attr.key,
                    10000, // Large size for JSON
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.SYSTEM_HEALTH_LOGS,
                    attr.key,
                    attr.size || 255,
                    attr.required
                );
            }
        }

        // Create indexes
        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.SYSTEM_HEALTH_LOGS,
            'generatedAt_index',
            'key',
            ['generatedAt']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.SYSTEM_HEALTH_LOGS,
            'overall_index',
            'key',
            ['overall']
        );

        console.log('✅ system_health_logs collection created successfully');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ system_health_logs collection already exists');
        } else {
            console.error('❌ Error creating system_health_logs collection:', error);
        }
    }
}

async function createBackupLogsCollection() {
    console.log('🛡️ Creating backup_logs collection...');
    
    try {
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.BACKUP_LOGS,
            'Backup Logs',
            [
                Permission.create(Role.label('admin')),
                Permission.read(Role.label('admin')),
                Permission.update(Role.label('admin')),
                Permission.delete(Role.label('admin'))
            ]
        );

        // Create attributes for backup tracking
        const attributes = [
            { key: 'backupId', size: 100, required: true },
            { key: 'timestamp', required: true }, // DateTime
            { key: 'totalDocuments', required: true }, // Integer
            { key: 'totalSizeBytes', required: true }, // Integer
            { key: 'duration', required: true }, // Integer
            { key: 'status', size: 20, required: true },
            { key: 'collections', required: true }, // JSON field (as text)
            { key: 'config', required: false } // JSON field (as text)
        ];

        for (const attr of attributes) {
            if (attr.key === 'timestamp') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_LOGS,
                    attr.key,
                    attr.required
                );
            } else if (['totalDocuments', 'totalSizeBytes', 'duration'].includes(attr.key)) {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_LOGS,
                    attr.key,
                    attr.required
                );
            } else if (['collections', 'config'].includes(attr.key)) {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_LOGS,
                    attr.key,
                    10000, // Large size for JSON
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_LOGS,
                    attr.key,
                    attr.size || 255,
                    attr.required
                );
            }
        }

        // Create indexes
        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.BACKUP_LOGS,
            'timestamp_index',
            'key',
            ['timestamp']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.BACKUP_LOGS,
            'status_index',
            'key',
            ['status']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.BACKUP_LOGS,
            'backupId_index',
            'key',
            ['backupId']
        );

        console.log('✅ backup_logs collection created successfully');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ backup_logs collection already exists');
        } else {
            console.error('❌ Error creating backup_logs collection:', error);
        }
    }
}

async function createBackupMetadataCollection() {
    console.log('📋 Creating backup_metadata collection...');
    
    try {
        await databases.createCollection(
            DATABASE_ID,
            COLLECTIONS.BACKUP_METADATA,
            'Backup Metadata',
            [
                Permission.create(Role.label('admin')),
                Permission.read(Role.label('admin')),
                Permission.update(Role.label('admin')),
                Permission.delete(Role.label('admin'))
            ]
        );

        // Create attributes for backup metadata
        const attributes = [
            { key: 'backupId', size: 100, required: true },
            { key: 'timestamp', required: true }, // DateTime
            { key: 'type', size: 20, required: true },
            { key: 'collections', required: true }, // JSON field
            { key: 'documentCount', required: true }, // Integer
            { key: 'sizeBytes', required: true }, // Integer
            { key: 'checksum', size: 100, required: true },
            { key: 'format', size: 20, required: true }
        ];

        for (const attr of attributes) {
            if (attr.key === 'timestamp') {
                await databases.createDatetimeAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_METADATA,
                    attr.key,
                    attr.required
                );
            } else if (['documentCount', 'sizeBytes'].includes(attr.key)) {
                await databases.createIntegerAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_METADATA,
                    attr.key,
                    attr.required
                );
            } else if (attr.key === 'collections') {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_METADATA,
                    attr.key,
                    1000, // JSON array of collection names
                    attr.required
                );
            } else {
                await databases.createStringAttribute(
                    DATABASE_ID,
                    COLLECTIONS.BACKUP_METADATA,
                    attr.key,
                    attr.size || 255,
                    attr.required
                );
            }
        }

        // Create indexes
        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.BACKUP_METADATA,
            'timestamp_index',
            'key',
            ['timestamp']
        );

        await databases.createIndex(
            DATABASE_ID,
            COLLECTIONS.BACKUP_METADATA,
            'backupId_index',
            'key',
            ['backupId']
        );

        console.log('✅ backup_metadata collection created successfully');
    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️ backup_metadata collection already exists');
        } else {
            console.error('❌ Error creating backup_metadata collection:', error);
        }
    }
}

async function setupCollections() {
    console.log('🚀 Setting up analytics, health monitoring and backup collections...\n');
    
    try {
        await createAnalyticsCollection();
        console.log(''); // Spacing
        
        await createHealthLogsCollection();
        console.log(''); // Spacing
        
        await createBackupLogsCollection();
        console.log(''); // Spacing
        
        await createBackupMetadataCollection();
        console.log(''); // Spacing
        
        console.log('🎉 All collections setup completed!');
        console.log('\n📋 Collections created:');
        console.log('   📊 user_analytics - User behavior tracking');
        console.log('   🏥 system_health_logs - Health monitoring data');
        console.log('   🛡️ backup_logs - Backup operation records');
        console.log('   📋 backup_metadata - Backup file metadata');
        
        console.log('\n💡 Next steps:');
        console.log('   1. Import analytics service: import { analyticsService } from "./lib/analyticsService"');
        console.log('   2. Import health monitoring: import { healthMonitoringService } from "./lib/healthMonitoringService"');
        console.log('   3. Import backup service: import { automatedBackupService } from "./lib/automatedBackupService"');
        console.log('   4. Add SystemDashboard component to your admin pages');
        console.log('   5. Start tracking user events with analyticsService.trackEvent()');
        
    } catch (error) {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    }
}

// Add delay function to handle rate limits
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Run setup with error handling
setupCollections()
    .then(() => {
        console.log('\n✅ Setup completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Setup failed:', error);
        process.exit(1);
    });

export { COLLECTIONS };