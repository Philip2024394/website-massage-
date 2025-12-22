#!/usr/bin/env node
/**
 * Quick script to find the correct therapistMenus collection ID
 * Run this to verify Surtiningsih's menu data and fix collection ID issues
 */

const { Client, Databases } = require('node-appwrite');

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function findTherapistMenusCollection() {
    try {
        console.log('🔍 Finding therapist menus collection...\n');
        
        // List all collections
        const response = await databases.listCollections(databaseId);
        
        console.log('📋 All Collections:');
        response.collections.forEach(c => {
            console.log(`  - ${c.name.padEnd(35)} → ${c.$id}`);
        });
        
        // Find therapist menus collection
        const menuCollection = response.collections.find(c => 
            c.name.toLowerCase().includes('therapist') && c.name.toLowerCase().includes('menu') ||
            c.name.toLowerCase().includes('menu') ||
            c.$id.toLowerCase().includes('menu')
        );
        
        if (menuCollection) {
            console.log('\n✅ FOUND THERAPIST MENUS COLLECTION:');
            console.log(`   Name: ${menuCollection.name}`);
            console.log(`   ID: ${menuCollection.$id}`);
            
            // Test fetching Surtiningsih's menu data
            console.log('\n🔍 Checking Surtiningsih\'s menu data...');
            const surtiningsihIds = [
                '693cfadf003d16b9896a', // From review data
                '676703b40009b9dd33de'  // From collection ID mentioned
            ];
            
            for (const therapistId of surtiningsihIds) {
                try {
                    const menuDocs = await databases.listDocuments(
                        databaseId,
                        menuCollection.$id,
                        []
                    );
                    
                    console.log(`📄 Total menu documents: ${menuDocs.documents.length}`);
                    
                    // Look for Surtiningsih's menu
                    const surtiningsihMenu = menuDocs.documents.find(doc => 
                        doc.therapistId === therapistId
                    );
                    
                    if (surtiningsihMenu) {
                        console.log(`✅ Found Surtiningsih's menu data for ID: ${therapistId}`);
                        console.log(`   Menu ID: ${surtiningsihMenu.$id}`);
                        console.log(`   Created: ${surtiningsihMenu.$createdAt}`);
                        
                        if (surtiningsihMenu.menuData) {
                            try {
                                const menuData = JSON.parse(surtiningsihMenu.menuData);
                                console.log(`   Services: ${menuData.length} items`);
                                menuData.forEach((service, index) => {
                                    console.log(`     ${index + 1}. ${service.serviceName} - 60min: ${service.price60}, 90min: ${service.price90}, 120min: ${service.price120}`);
                                });
                            } catch (e) {
                                console.log('   Menu data format error:', e.message);
                            }
                        }
                        break;
                    } else {
                        console.log(`❌ No menu found for therapist ID: ${therapistId}`);
                    }
                } catch (error) {
                    console.log(`❌ Error checking ID ${therapistId}:`, error.message);
                }
            }
            
            console.log('\n📝 UPDATE YOUR CONFIG:');
            console.log(`File: lib/appwrite/config.ts`);
            console.log(`Line: ~56`);
            console.log(`Change: therapistMenus: '${menuCollection.$id}',`);
            
        } else {
            console.log('\n❌ No therapist menus collection found!');
            console.log('You may need to create the collection first.');
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

findTherapistMenusCollection();