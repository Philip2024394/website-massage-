import React, { useEffect, useState } from 'react';
import { databases } from '../lib/appwrite';
import APPWRITE_CONFIG from '../lib/appwrite.config';

const CheckCollectionsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [collections, setCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response: any = await (databases as any).listCollections(APPWRITE_CONFIG.databaseId);
        setCollections(response.collections || []);
        setError('');
      } catch (err: any) {
        setError(err.message || 'Failed to fetch collections');
      } finally {
        setLoading(false);
      }
    };
    fetchCollections();
  }, []);

  const marketplaceCollections = collections.filter(col => 
    col.name.toLowerCase().includes('marketplace') || 
    col.name.toLowerCase().includes('seller') ||
    col.name.toLowerCase().includes('product')
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading collections...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">
          ← Back
        </button>
        
        <h1 className="text-2xl font-bold mb-4">Appwrite Collections Check</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-3">All Collections ({collections.length})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Collection ID</th>
                  <th className="text-left py-2 px-2">Name</th>
                </tr>
              </thead>
              <tbody>
                {collections.map(col => (
                  <tr key={col.$id} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-2 font-mono text-xs">{col.$id}</td>
                    <td className="py-2 px-2">{col.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-3 text-blue-900">
            Marketplace Collections
          </h2>
          {marketplaceCollections.length > 0 ? (
            <div>
              <p className="text-blue-800 mb-3">Found {marketplaceCollections.length} potential marketplace collections:</p>
              <div className="space-y-2 mb-4">
                {marketplaceCollections.map(col => (
                  <div key={col.$id} className="bg-white rounded p-3">
                    <div className="font-semibold">{col.name}</div>
                    <div className="font-mono text-xs text-gray-600">ID: {col.$id}</div>
                  </div>
                ))}
              </div>
              <div className="bg-green-50 border border-green-200 rounded p-4">
                <p className="font-semibold text-green-900 mb-2">✓ Update lib/appwrite.config.ts:</p>
                <pre className="bg-white p-3 rounded text-xs overflow-x-auto">
                  {`marketplaceSellers: '${marketplaceCollections.find(c => c.name.toLowerCase().includes('seller'))?.$id || 'NOT_FOUND'}',\nmarketplaceProducts: '${marketplaceCollections.find(c => c.name.toLowerCase().includes('product'))?.$id || 'NOT_FOUND'}',`}
                </pre>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-red-800 mb-3">✗ No marketplace collections found.</p>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                <p className="font-semibold mb-2">You need to create them in Appwrite Console:</p>
                <a 
                  href="https://cloud.appwrite.io/console/project-68f23b11000d25eb3664/databases/database-68f76ee1000e64ca8d05"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm break-all"
                >
                  Open Appwrite Console →
                </a>
                <div className="mt-3 space-y-1 text-sm">
                  <p>Create these collections with EXACT Collection IDs:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li><code className="bg-gray-100 px-1">marketplace_sellers</code></li>
                    <li><code className="bg-gray-100 px-1">marketplace_products</code></li>
                    <li><code className="bg-gray-100 px-1">admin_notifications</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckCollectionsPage;
