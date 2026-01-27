import { useState } from 'react';
import { databases, DATABASE_ID, COLLECTIONS } from '../lib/appwrite';

/**
 * Collection ID Tester
 * This component helps verify if your collection IDs are correct
 */
export default function CollectionIdTester() {
    const [result, setResult] = useState<string>('');
    const [testing, setTesting] = useState(false);

    const testCollectionAccess = async () => {
        setTesting(true);
        setResult('Testing collection access...\n\n');

        try {
            // Test 1: Try to list documents from therapists collection
            setResult(prev => prev + '📋 Testing THERAPISTS collection...\n');
            setResult(prev => prev + `   Collection ID: ${COLLECTIONS.THERAPISTS}\n`);
            
            const therapists = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.THERAPISTS,
                []
            );
            
            setResult(prev => prev + `   ✅ SUCCESS! Found ${therapists.total} therapist(s)\n\n`);

            // Test 2: Try other collections
            const collectionsToTest = [
                { name: 'PLACES', id: COLLECTIONS.PLACES },
                { name: 'USERS', id: COLLECTIONS.USERS },
                { name: 'AGENTS', id: COLLECTIONS.AGENTS },
                { name: 'ADMINS', id: COLLECTIONS.ADMINS },
            ];

            for (const col of collectionsToTest) {
                try {
                    setResult(prev => prev + `📋 Testing ${col.name} collection...\n`);
                    setResult(prev => prev + `   Collection ID: ${col.id}\n`);
                    
                    const docs = await databases.listDocuments(DATABASE_ID, col.id, []);
                    setResult(prev => prev + `   ✅ SUCCESS! Found ${docs.total} document(s)\n\n`);
                } catch (err: any) {
                    setResult(prev => prev + `   ❌ ERROR: ${err.message}\n\n`);
                }
            }

            setResult(prev => prev + '\n✅ All tests complete!\n');
            setResult(prev => prev + '\nIf all collections show SUCCESS, your collection IDs are CORRECT!\n');
            setResult(prev => prev + 'If you see "Collection not found" errors, you need to update the IDs.\n');

        } catch (error: any) {
            setResult(prev => prev + `\n❌ ERROR: ${error.message}\n\n`);
            
            if (error.message.includes('not found') || error.message.includes('Collection')) {
                setResult(prev => prev + '🔧 FIX NEEDED:\n');
                setResult(prev => prev + '1. Go to: https://cloud.appwrite.io/console\n');
                setResult(prev => prev + '2. Navigate to Project: 68f23b11000d25eb3664\n');
                setResult(prev => prev + '3. Go to Databases → Database: 68f76ee1000e64ca8d05\n');
                setResult(prev => prev + '4. Find your therapists collection\n');
                setResult(prev => prev + '5. Copy its REAL ID (16 characters)\n');
                setResult(prev => prev + '6. Update COLLECTIONS.THERAPISTS in lib/appwrite.ts\n');
            }
        } finally {
            setTesting(false);
        }
    };

    return (
        <div style={{
            padding: '20px',
            maxWidth: '800px',
            margin: '0 auto',
            fontFamily: 'monospace'
        }}>
            <h2>🔍 Appwrite Collection ID Tester</h2>
            <p>This tool helps you verify if your collection IDs are correct.</p>
            
            <button
                onClick={testCollectionAccess}
                disabled={testing}
                style={{
                    padding: '10px 20px',
                    fontSize: '16px',
                    backgroundColor: testing ? '#ccc' : '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: testing ? 'not-allowed' : 'pointer'
                }}
            >
                {testing ? 'Testing...' : 'Test Collection Access'}
            </button>

            {result && (
                <pre style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    lineHeight: '1.5'
                }}>
                    {result}
                </pre>
            )}

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
                <h3>📝 Current Collection IDs:</h3>
                <pre style={{ fontSize: '12px' }}>
{`THERAPISTS: ${COLLECTIONS.THERAPISTS}
PLACES: ${COLLECTIONS.PLACES}
USERS: ${COLLECTIONS.USERS}
AGENTS: ${COLLECTIONS.AGENTS}
ADMINS: ${COLLECTIONS.ADMINS}
HOTELS: ${COLLECTIONS.HOTELS}
VILLAS: ${COLLECTIONS.VILLAS}`}
                </pre>
                <p style={{ fontSize: '14px', marginTop: '10px' }}>
                    ⚠️ If these look like "therapists_collection_id", they are PLACEHOLDERS and need to be replaced!
                </p>
            </div>
        </div>
    );
}
