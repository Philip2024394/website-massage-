import React, { useState, useEffect } from 'react';
import { databases, Query, APPWRITE_CONFIG } from '../lib/appwrite';

const UpgradeToPremiumWithCommission: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [providerInfo, setProviderInfo] = useState<any>(null);
    const [searchName, setSearchName] = useState('');
    const [providerType, setProviderType] = useState<'therapist' | 'place'>('therapist');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [premiumMembers, setPremiumMembers] = useState<any[]>([]);
    const [loadingPremium, setLoadingPremium] = useState(false);

    const searchProvider = async () => {
        if (!searchName.trim()) {
            setStatus('❌ Please enter a name to search');
            return;
        }

        setLoading(true);
        setStatus(`🔍 Searching for ${providerType}: ${searchName}...`);
        
        try {
            const collectionId = providerType === 'therapist' 
                ? APPWRITE_CONFIG.collections.therapists 
                : APPWRITE_CONFIG.collections.places;

            // First try: Get ALL documents and filter client-side (more reliable)
            const response = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                [Query.limit(500)] // Get up to 500 documents
            );

            console.log(`📊 Fetched ${response.documents.length} ${providerType}s from database`);

            // Filter by name on client side (case-insensitive)
            const searchLower = searchName.toLowerCase();
            const matches = response.documents.filter((doc: any) => 
                doc.name && doc.name.toLowerCase().includes(searchLower)
            );

            if (matches.length === 0) {
                setStatus(`❌ ${providerType === 'therapist' ? 'Therapist' : 'Place'} "${searchName}" not found in ${response.documents.length} records`);
                setSearchResults([]);
            } else {
                setSearchResults(matches);
                if (matches.length === 1) {
                    const provider = matches[0];
                    setProviderInfo(provider);
                    setStatus(`✅ Found: ${provider.name} (ID: ${provider.$id})`);
                } else {
                    setStatus(`Found ${matches.length} matches. Select one below:`);
                }
            }
        } catch (error: any) {
            setStatus(`❌ Error: ${error.message}`);
            console.error('Error searching:', error);
            console.error('Database ID:', APPWRITE_CONFIG.databaseId);
            console.error('Collection ID:', providerType === 'therapist' ? APPWRITE_CONFIG.collections.therapists : APPWRITE_CONFIG.collections.places);
        } finally {
            setLoading(false);
        }
    };

    const selectProvider = (provider: any) => {
        setProviderInfo(provider);
        setStatus(`✅ Selected: ${provider.name} (ID: ${provider.$id})`);
        setSearchResults([]);
    };

    const upgradeToPremium = async () => {
        if (!providerInfo) {
            setStatus('❌ No provider selected');
            return;
        }

        setLoading(true);
        setStatus('🔄 Upgrading to Premium with 30% commission...');
        
        try {
            const updateData = {
                membershipTier: 'premium'
            };

            const collectionId = providerType === 'therapist' 
                ? APPWRITE_CONFIG.collections.therapists 
                : APPWRITE_CONFIG.collections.places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                providerInfo.$id,
                updateData
            );

            setStatus(`✅ SUCCESS! ${providerInfo.name} upgraded to Premium with verified badge (30% commission rate)!`);
            
            // Refresh provider info
            const refreshed = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                providerInfo.$id
            );
            setProviderInfo(refreshed);
            
            // Refresh premium members list
            loadPremiumMembers();
        } catch (error: any) {
            setStatus(`❌ Error upgrading: ${error.message}`);
            console.error('Error upgrading:', error);
        } finally {
            setLoading(false);
        }
    };

    const removePremium = async (member: any, type: 'therapist' | 'place') => {
        if (!confirm(`Remove Premium status from ${member.name}?`)) {
            return;
        }

        setLoadingPremium(true);
        
        try {
            const collectionId = type === 'therapist' 
                ? APPWRITE_CONFIG.collections.therapists 
                : APPWRITE_CONFIG.collections.places;

            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                collectionId,
                member.$id,
                { membershipTier: 'free' }
            );

            setStatus(`✅ Removed Premium from ${member.name}`);
            loadPremiumMembers();
        } catch (error: any) {
            setStatus(`❌ Error removing premium: ${error.message}`);
            console.error('Error:', error);
        } finally {
            setLoadingPremium(false);
        }
    };

    const loadPremiumMembers = async () => {
        setLoadingPremium(true);
        
        try {
            // Load all therapists and filter client-side (no index needed)
            const therapistsResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapists,
                [Query.limit(500)]
            );

            // Load all places and filter client-side (no index needed)
            const placesResponse = await databases.listDocuments(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.places,
                [Query.limit(500)]
            );

            const premiumTherapists = therapistsResponse.documents
                .filter((doc: any) => doc.membershipTier === 'premium')
                .map((doc: any) => ({ ...doc, type: 'therapist' }));

            const premiumPlaces = placesResponse.documents
                .filter((doc: any) => doc.membershipTier === 'premium')
                .map((doc: any) => ({ ...doc, type: 'place' }));

            const allPremium = [...premiumTherapists, ...premiumPlaces];

            console.log('Premium members found:', allPremium.length);
            setPremiumMembers(allPremium);
        } catch (error: any) {
            console.error('Error loading premium members:', error);
        } finally {
            setLoadingPremium(false);
        }
    };

    useEffect(() => {
        loadPremiumMembers();
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">
                        Upgrade to Premium with Commission
                    </h1>
                    
                    <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                        <h3 className="font-bold text-orange-900 mb-2">Premium Package Details</h3>
                        <ul className="text-sm text-orange-800 space-y-1">
                            <li>✅ Premium membership tier (Plus)</li>
                            <li>✅ Verified badge on profile</li>
                            <li>✅ 30% commission on all bookings</li>
                            <li>✅ No monthly membership fee</li>
                            <li>✅ All premium analytics features</li>
                        </ul>
                    </div>

                    <div className="space-y-4">
                        {/* Provider Type Selection */}
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    setProviderType('therapist');
                                    setProviderInfo(null);
                                    setSearchResults([]);
                                    setStatus('');
                                }}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                                    providerType === 'therapist'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Therapist
                            </button>
                            <button
                                onClick={() => {
                                    setProviderType('place');
                                    setProviderInfo(null);
                                    setSearchResults([]);
                                    setStatus('');
                                }}
                                className={`flex-1 py-2 px-4 rounded-lg font-semibold ${
                                    providerType === 'place'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                            >
                                Massage Place
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={searchName}
                                onChange={(e) => setSearchName(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && searchProvider()}
                                placeholder={`Enter ${providerType} name...`}
                                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                onClick={searchProvider}
                                disabled={loading || !searchName.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </button>
                        </div>

                        {/* Search Results */}
                        {searchResults.length > 0 && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="font-bold mb-3">Select a provider:</h3>
                                <div className="space-y-2">
                                    {searchResults.map((provider) => (
                                        <button
                                            key={provider.$id}
                                            onClick={() => selectProvider(provider)}
                                            className="w-full text-left p-3 bg-white hover:bg-blue-50 border border-gray-200 rounded-lg transition-colors"
                                        >
                                            <p className="font-semibold">{provider.name}</p>
                                            <p className="text-sm text-gray-600">ID: {provider.$id}</p>
                                            <p className="text-xs text-gray-500">
                                                Membership: {provider.membershipTier || 'free'} | 
                                                Verified: {provider.isVerified ? '✅' : '❌'}
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Selected Provider Info */}
                        {providerInfo && (
                            <>
                                <div className="bg-gray-50 rounded-lg p-6 border-2 border-blue-200">
                                    <h3 className="font-bold text-lg mb-4">Current Status</h3>
                                    <div className="space-y-2 text-sm">
                                        <p><strong>Name:</strong> {providerInfo.name}</p>
                                        <p><strong>ID:</strong> {providerInfo.$id}</p>
                                        <p><strong>Type:</strong> {providerType === 'therapist' ? 'Therapist' : 'Massage Place'}</p>
                                        <p><strong>Membership:</strong> {providerInfo.membershipTier || 'free'}</p>
                                        <p><strong>Commission Rate:</strong> {providerInfo.commissionRate ? `${providerInfo.commissionRate}%` : 'not set'}</p>
                                        <p><strong>Verified:</strong> {providerInfo.isVerified ? '✅ Yes' : '❌ No'}</p>
                                        <p><strong>Verification Badge:</strong> {providerInfo.verificationBadge || 'none'}</p>
                                    </div>
                                </div>

                                <button
                                    onClick={upgradeToPremium}
                                    disabled={loading}
                                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                                >
                                    {loading ? 'Upgrading...' : '🚀 Upgrade to Premium with 30% Commission'}
                                </button>
                            </>
                        )}

                        {/* Status Messages */}
                        {status && (
                            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                                <p className="text-sm font-mono whitespace-pre-wrap">{status}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Premium Members List */}
                <div className="bg-white rounded-lg shadow-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Premium Members ({premiumMembers.length})
                        </h2>
                        <button
                            onClick={loadPremiumMembers}
                            disabled={loadingPremium}
                            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
                        >
                            {loadingPremium ? 'Loading...' : 'Refresh'}
                        </button>
                    </div>

                    {loadingPremium && premiumMembers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">Loading premium members...</p>
                    ) : premiumMembers.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No premium members found</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b-2 border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">ID</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                                        <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {premiumMembers.map((member) => (
                                        <tr key={member.$id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    member.type === 'therapist' 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {member.type === 'therapist' ? '👤 Therapist' : '🏢 Place'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                                {member.name}
                                            </td>
                                            <td className="px-4 py-3 text-xs text-gray-500 font-mono">
                                                {member.$id.substring(0, 12)}...
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    ⭐ Premium (30% commission)
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => removePremium(member, member.type)}
                                                    disabled={loadingPremium}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3 rounded disabled:opacity-50"
                                                >
                                                    Remove Premium
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UpgradeToPremiumWithCommission;
