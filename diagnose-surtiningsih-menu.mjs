/**
 * Comprehensive Menu Diagnostic for Surtiningsih
 * Traces data flow: Dashboard Save → Appwrite → UI Display
 */

import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey('standard_1a53a263b15bc4342bd42429292b0099e3dbc8eb26715d1e437140dcc4b0ae21a24ddcf33ff39bb687e4234d019de1ce2b048f8a846adcd599d38574e2abb21241767371769e83eaf445d4e655aa6556112d951bbf48450fb49d85aac932db12980acca0396e8b9c2e74e9e40558bfc63d7bf78c76221b6e561aad38bab1380f');

const databases = new Databases(client);
const databaseId = '68f76ee1000e64ca8d05';

async function diagnoseSurtiningsihMenu() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔬 SURTININGSIH MENU DIAGNOSTIC');
    console.log('═══════════════════════════════════════════════════════\n');
    
    try {
        // Step 1: Find Surtiningsih
        console.log('📋 Step 1: Finding Surtiningsih in therapists collection...');
        const therapistResponse = await databases.listDocuments(
            databaseId,
            'therapists_collection_id',
            [
                Query.equal('name', 'Surtiningsih'),
                Query.limit(5)
            ]
        );
        
        if (therapistResponse.documents.length === 0) {
            console.error('❌ PROBLEM: Surtiningsih not found in database!');
            console.log('\n💡 Solution: Create therapist account first\n');
            return;
        }
        
        const therapist = therapistResponse.documents[0];
        console.log('✅ Found Surtiningsih:');
        console.log('   Therapist ID:', therapist.$id);
        console.log('   Name:', therapist.name);
        console.log('   Email:', therapist.email || 'No email set');
        console.log('   City:', therapist.city);
        console.log('   Status:', therapist.availability || therapist.status);
        console.log('   Is Live:', therapist.isLive);
        console.log('   Is Verified:', therapist.isVerified);
        console.log('');
        
        // Step 2: Find ALL menu documents for this therapist
        console.log('📋 Step 2: Fetching ALL menu documents...');
        const allMenusResponse = await databases.listDocuments(
            databaseId,
            'therapist_menus',
            [
                Query.equal('therapistId', therapist.$id),
                Query.orderDesc('$updatedAt'),
                Query.limit(100) // Get all menu docs
            ]
        );
        
        const menuDocs = allMenusResponse.documents;
        console.log(`📊 Found ${menuDocs.length} menu document(s)\n`);
        
        if (menuDocs.length === 0) {
            console.error('❌ PROBLEM: No menu documents found!');
            console.log('\n💡 Solution:');
            console.log('   1. Log into therapist dashboard as Surtiningsih');
            console.log('   2. Go to "Menu Prices" section');
            console.log('   3. Add services with prices');
            console.log('   4. Click "Save Menu"\n');
            return;
        }
        
        // Step 3: Analyze each menu document
        if (menuDocs.length > 1) {
            console.log('⚠️  WARNING: Multiple menu documents detected!');
            console.log('   This can cause the UI to display the wrong menu.\n');
        }
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📄 MENU DOCUMENTS ANALYSIS:');
        console.log('═══════════════════════════════════════════════════════\n');
        
        menuDocs.forEach((menu, index) => {
            console.log(`Document #${index + 1}${index === 0 ? ' (NEWEST - UI will use this)' : ' (OLDER)'}`);
            console.log('─────────────────────────────────────────────────────');
            console.log('   Document ID:', menu.$id);
            console.log('   Created:', menu.createdDate || menu.$createdAt);
            console.log('   Updated:', menu.updatedDate || menu.$updatedAt);
            console.log('   Is Active:', menu.isActive);
            
            if (menu.menuData) {
                try {
                    const services = JSON.parse(menu.menuData);
                    if (Array.isArray(services)) {
                        console.log(`   ✅ Menu Items: ${services.length}\n`);
                        
                        if (services.length === 0) {
                            console.log('   ⚠️  EMPTY MENU - No services in this document!\n');
                        } else {
                            console.log('   Services:');
                            services.forEach((service, idx) => {
                                console.log(`   ${idx + 1}. ${service.serviceName || service.name || '(No name)'}`);
                                const prices = [];
                                if (service.price60) prices.push(`60min: Rp ${(Number(service.price60) * 1000).toLocaleString('id-ID')}`);
                                if (service.price90) prices.push(`90min: Rp ${(Number(service.price90) * 1000).toLocaleString('id-ID')}`);
                                if (service.price120) prices.push(`120min: Rp ${(Number(service.price120) * 1000).toLocaleString('id-ID')}`);
                                console.log(`      ${prices.join(' | ')}`);
                            });
                            console.log('');
                        }
                    } else {
                        console.log('   ❌ Invalid menu data format (not an array)\n');
                    }
                } catch (parseError) {
                    console.log('   ❌ Failed to parse menuData:', parseError.message);
                    console.log('   Raw data preview:', menu.menuData.substring(0, 100) + '...\n');
                }
            } else {
                console.log('   ❌ menuData field is NULL or empty!\n');
            }
        });
        
        // Step 4: Show what the UI will display
        console.log('═══════════════════════════════════════════════════════');
        console.log('🖥️  UI DISPLAY SIMULATION:');
        console.log('═══════════════════════════════════════════════════════\n');
        
        const latestMenu = menuDocs[0];
        console.log('The menu slider will fetch the NEWEST document:');
        console.log('   Document ID:', latestMenu.$id);
        console.log('   Updated:', latestMenu.$updatedAt);
        
        if (latestMenu.menuData) {
            try {
                const services = JSON.parse(latestMenu.menuData);
                console.log(`\n   ✅ Will display ${services.length} menu item(s)\n`);
                
                if (services.length === 0) {
                    console.log('   ❌ PROBLEM: Menu is empty!');
                    console.log('   The menu slider will show the fallback pricing instead.\n');
                } else {
                    console.log('   Menu items that will appear in the slider:');
                    services.forEach((service, idx) => {
                        console.log(`   ✓ ${idx + 1}. ${service.serviceName || service.name}`);
                    });
                    console.log('');
                }
            } catch (e) {
                console.log('   ❌ PROBLEM: Cannot parse menuData');
                console.log('   The menu slider will show the fallback pricing instead.\n');
            }
        } else {
            console.log('   ❌ PROBLEM: menuData is empty');
            console.log('   The menu slider will show the fallback pricing instead.\n');
        }
        
        // Step 5: Recommendations
        console.log('═══════════════════════════════════════════════════════');
        console.log('💡 RECOMMENDATIONS:');
        console.log('═══════════════════════════════════════════════════════\n');
        
        if (menuDocs.length > 1) {
            console.log('⚠️  Multiple menu documents detected:');
            console.log('   - The UI now uses Query.orderDesc("$updatedAt") to pick the newest');
            console.log('   - Consider deleting old menu documents to avoid confusion');
            console.log(`   - Old document IDs to delete: ${menuDocs.slice(1).map(d => d.$id).join(', ')}\n`);
        }
        
        const latestServices = latestMenu.menuData ? JSON.parse(latestMenu.menuData) : [];
        if (latestServices.length === 0) {
            console.log('❌ Menu is empty:');
            console.log('   1. Log into therapist dashboard');
            console.log('   2. Add menu items with service names and prices');
            console.log('   3. Save the menu\n');
        } else if (latestServices.length < 3) {
            console.log('💭 Only a few menu items:');
            console.log('   Consider adding more services to give customers more options\n');
        } else {
            console.log('✅ Menu looks good!');
            console.log('   All items should display correctly in the menu slider\n');
        }
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('✨ Diagnostic complete!');
        console.log('═══════════════════════════════════════════════════════\n');
        
    } catch (error) {
        console.error('\n❌ Error during diagnostic:', error.message);
        if (error.code) {
            console.error('   Error code:', error.code);
        }
        if (error.response) {
            console.error('   Response:', JSON.stringify(error.response, null, 2));
        }
    }
}

diagnoseSurtiningsihMenu();
