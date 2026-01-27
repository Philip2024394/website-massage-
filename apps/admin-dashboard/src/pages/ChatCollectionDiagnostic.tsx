/**
 * Chat Collection Diagnostic Tool
 * Helps identify which collections have chat data
 */

import React, { useState, useEffect } from 'react';
import { databases, DATABASE_ID } from '../../../src/lib/appwrite';

const ChatCollectionDiagnostic: React.FC = () => {
    const [results, setResults] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);

    const collectionsToTest = [
        'chat_sessions',
        'chat_rooms', 
        'chat_messages',
        'messages',
        'bookings'
    ];

    const testCollection = async (collectionId: string) => {
        try {
            console.log(`🔍 Testing collection: ${collectionId}`);
            const response = await databases.listDocuments(DATABASE_ID, collectionId, []);
            return {
                collectionId,
                success: true,
                count: response.documents.length,
                sample: response.documents.slice(0, 2),
                error: null
            };
        } catch (error: any) {
            console.error(`❌ Error testing ${collectionId}:`, error);
            return {
                collectionId,
                success: false,
                count: 0,
                sample: null,
                error: error.message || error.toString()
            };
        }
    };

    const runDiagnostic = async () => {
        setLoading(true);
        const testResults: Record<string, any> = {};
        
        for (const collectionId of collectionsToTest) {
            testResults[collectionId] = await testCollection(collectionId);
        }
        
        setResults(testResults);
        setLoading(false);
    };

    useEffect(() => {
        runDiagnostic();
    }, []);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow p-6">
                <h1 className="text-2xl font-bold mb-4">🔍 Chat Collection Diagnostic</h1>
                <p className="text-gray-600 mb-6">Testing which collections exist and contain data...</p>
                
                {loading && <div className="text-center py-4">🔄 Running diagnostic tests...</div>}
                
                <div className="space-y-4">
                    {Object.entries(results).map(([collectionId, result]) => (
                        <div key={collectionId} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-semibold">{collectionId}</h3>
                                <div className={`px-3 py-1 rounded text-sm ${
                                    result.success 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-red-100 text-red-800'
                                }`}>
                                    {result.success ? '✅ Success' : '❌ Failed'}
                                </div>
                            </div>
                            
                            {result.success ? (
                                <div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        📊 Documents found: <strong>{result.count}</strong>
                                    </p>
                                    
                                    {result.sample && result.sample.length > 0 && (
                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Sample data:</p>
                                            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
                                                {JSON.stringify(result.sample[0], null, 2)}
                                            </pre>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-red-600 text-sm">
                                    <strong>Error:</strong> {result.error}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <button
                    onClick={runDiagnostic}
                    disabled={loading}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    🔄 Re-run Diagnostic
                </button>
            </div>
        </div>
    );
};

export default ChatCollectionDiagnostic;