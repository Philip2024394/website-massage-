// Quick test to check function deployment status
import { Client, Functions } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664')
    .setKey(process.env.APPWRITE_API_KEY || 'standard_dde647bada5035422e4fd036fd27a48a225ba3537b391c7441da7d60d953cdbb23ec75c675b2ec21071e79d10914bdda301109e3ac28743a88ee372d9f3e2e3531ab22f76d45a3061e74d75d8ffa8d46488f51a07949a8cf0180df90e2cc753c72a8e5a56e48b3b40950d90149bb048f661642ca1c7088723e8752fec377e00d');

const functions = new Functions(client);

const functionIds = ['createBooking', 'searchTherapists', 'acceptTherapist', 'cancelBooking'];

console.log('🔍 Checking function deployment status...\n');

for (const functionId of functionIds) {
    try {
        // Get function details
        const func = await functions.get(functionId);
        console.log(`📋 ${functionId}:`);
        console.log(`   Status: ${func.enabled ? 'Enabled' : 'Disabled'}`);
        console.log(`   Runtime: ${func.runtime}`);
        
        // Get deployments
        try {
            const deployments = await functions.listDeployments(functionId);
            console.log(`   Deployments: ${deployments.total}`);
            
            if (deployments.total > 0) {
                const latest = deployments.deployments[0];
                console.log(`   Latest Status: ${latest.status}`);
                console.log(`   Build Output: ${latest.buildLogs || 'No logs'}`);
            } else {
                console.log('   ❌ NO DEPLOYMENTS FOUND');
            }
        } catch (err) {
            console.log(`   ❌ Error getting deployments: ${err.message}`);
        }
        
        console.log('');
    } catch (error) {
        console.log(`❌ ${functionId}: ${error.message}\n`);
    }
}