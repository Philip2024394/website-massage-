import React, { useState, useEffect } from 'react';
import { databases } from '../../../../lib/appwrite';
import { APPWRITE_CONFIG } from '../../../../lib/appwrite.config';

const DatabaseDiagnostics: React.FC = () => {
    const [diagnostics, setDiagnostics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        runDiagnostics();
    }, []);

    const runDiagnostics = async () => {
        setLoading(true);
        setError('');
        
        const results: any = {
            timestamp: new Date().toISOString(),
            config: {
                endpoint: APPWRITE_CONFIG.endpoint,
                projectId: APPWRITE_CONFIG.projectId,
                databaseId: APPWRITE_CONFIG.databaseId
            },
            collections: {}
        };

        try {
            // Test therapists collection
            try {
                const therapistsResponse = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.therapists,
                    []
                );
                results.collections.therapists = {
                    collectionId: APPWRITE_CONFIG.collections.therapists,
                    status: '✅ WORKING',
                    totalDocuments: therapistsResponse.total,
                    sampleNames: therapistsResponse.documents.slice(0, 5).map((d: any) => d.name)
                };
            } catch (err: any) {
                results.collections.therapists = {
                    collectionId: APPWRITE_CONFIG.collections.therapists,
                    status: '❌ ERROR',
                    error: err.message
                };
            }

            // Test places collection
            try {
                const placesResponse = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.places,
                    []
                );
                results.collections.places = {
                    collectionId: APPWRITE_CONFIG.collections.places,
                    status: '✅ WORKING',
                    totalDocuments: placesResponse.total,
                    sampleNames: placesResponse.documents.slice(0, 5).map((d: any) => d.name)
                };
            } catch (err: any) {
                results.collections.places = {
                    collectionId: APPWRITE_CONFIG.collections.places,
                    status: '❌ ERROR',
                    error: err.message
                };
            }

            // Test bookings collection
            try {
                const bookingsResponse = await databases.listDocuments(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.bookings,
                    []
                );
                results.collections.bookings = {
                    collectionId: APPWRITE_CONFIG.collections.bookings,
                    status: '✅ WORKING',
                    totalDocuments: bookingsResponse.total
                };
            } catch (err: any) {
                results.collections.bookings = {
                    collectionId: APPWRITE_CONFIG.collections.bookings,
                    status: '❌ ERROR',
                    error: err.message
                };
            }

            setDiagnostics(results);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-center mt-4">Running diagnostics...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-red-800 font-bold mb-2">Error</h3>
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-6xl">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Database Connection Diagnostics</h2>
                <p className="text-gray-600">Testing Appwrite database connections and data access</p>
            </div>

            {/* Configuration */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Configuration</h3>
                <div className="space-y-2 font-mono text-sm">
                    <div><span className="text-gray-600">Endpoint:</span> <span className="text-blue-600">{diagnostics.config.endpoint}</span></div>
                    <div><span className="text-gray-600">Project ID:</span> <span className="text-blue-600">{diagnostics.config.projectId}</span></div>
                    <div><span className="text-gray-600">Database ID:</span> <span className="text-blue-600">{diagnostics.config.databaseId}</span></div>
                </div>
            </div>

            {/* Collections */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-gray-900">Collections Status</h3>
                
                {Object.entries(diagnostics.collections).map(([name, info]: [string, any]) => (
                    <div key={name} className={`rounded-lg border p-4 ${info.status.includes('✅') ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-lg capitalize">{name}</h4>
                            <span className="text-sm font-mono">{info.status}</span>
                        </div>
                        <div className="space-y-1 text-sm font-mono">
                            <div><span className="text-gray-600">Collection ID:</span> <span className="text-blue-600">{info.collectionId}</span></div>
                            {info.totalDocuments !== undefined && (
                                <div><span className="text-gray-600">Total Documents:</span> <span className="text-green-600 font-bold">{info.totalDocuments}</span></div>
                            )}
                            {info.sampleNames && info.sampleNames.length > 0 && (
                                <div className="mt-2">
                                    <div className="text-gray-600 mb-1">Sample Names:</div>
                                    <ul className="list-disc list-inside text-gray-700">
                                        {info.sampleNames.map((name: string, idx: number) => (
                                            <li key={idx}>{name}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {info.error && (
                                <div className="mt-2"><span className="text-red-600">Error:</span> <span className="text-red-700">{info.error}</span></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-6">
                <button
                    onClick={runDiagnostics}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                    🔄 Refresh Diagnostics
                </button>
            </div>
        </div>
    );
};

export default DatabaseDiagnostics;
