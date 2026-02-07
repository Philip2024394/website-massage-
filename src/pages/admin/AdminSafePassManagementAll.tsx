/**
 * Admin SafePass Management - All Entities
 * Manage SafePass for all therapists and places with activate/deactivate options
 */

import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    User,
    Building,
    CheckCircle,
    XCircle,
    Search,
    Filter,
    RefreshCw
} from 'lucide-react';
import { Client, Databases, Query, ID } from 'appwrite';

const client = new Client()
    .setEndpoint('https://syd.cloud.appwrite.io/v1')
    .setProject('68f23b11000d25eb3664');

const databases = new Databases(client);

const DATABASE_ID = '68f76ee1000e64ca8d05';
const SAFEPASS_COLLECTION_ID = 'safepass';
const THERAPISTS_COLLECTION_ID = 'therapists_collection_id';
const PLACES_COLLECTION_ID = 'places_collection_id';

interface Entity {
    $id: string;
    name: string;
    email?: string;
    location?: string;
    city?: string;
    type: 'therapist' | 'place';
    safePassStatus?: 'active' | 'pending' | 'approved' | 'rejected' | null;
    safePassExpiry?: string;
    safePassIssuedAt?: string;
}

interface SafePassRecord {
    $id: string;
    entityType: string;
    entityId: string;
    hotelVillaSafePassStatus: string;
    hasSafePassVerification: boolean;
    safePassIssuedAt?: string;
    safePassExpiry?: string;
}

const AdminSafePassManagementAll: React.FC = () => {
    const [therapists, setTherapists] = useState<Entity[]>([]);
    const [places, setPlaces] = useState<Entity[]>([]);
    const [safePassRecords, setSafePassRecords] = useState<Map<string, SafePassRecord>>(new Map());
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [entityFilter, setEntityFilter] = useState<'all' | 'therapist' | 'place'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);
    const [apiKey] = useState('standard_ffc9f16272e2199be5aacef2d433ebd35cc6dec8458c781e1c459f8dea17673a42d636315964019645878affbf69fb46559adf188ad8bd435e8506070c9e00d8c2e2af426147662a99058068a864d78205f04caac2f621285cf0f7e59e5159a37a26455e88d666dddb97cbb1a54c9a16234e00c02a5283b95617f8a62ff87bb2');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            // Configure client with API key for admin operations
            client.setKey(apiKey);

            // Load all data in parallel
            const [therapistsData, placesData, safePassData] = await Promise.all([
                loadTherapists(),
                loadPlaces(),
                loadSafePassRecords()
            ]);

            setTherapists(therapistsData);
            setPlaces(placesData);

            // Create a map of SafePass records by entityId
            const recordsMap = new Map<string, SafePassRecord>();
            safePassData.forEach(record => {
                recordsMap.set(record.entityId, record);
            });
            setSafePassRecords(recordsMap);

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTherapists = async (): Promise<Entity[]> => {
        try {
            let allTherapists: any[] = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    THERAPISTS_COLLECTION_ID,
                    [Query.limit(limit), Query.offset(offset)]
                );

                allTherapists = [...allTherapists, ...response.documents];
                hasMore = response.documents.length === limit;
                offset += limit;
            }

            return allTherapists.map(t => ({
                $id: t.$id,
                name: t.name || 'Unnamed Therapist',
                email: t.email,
                location: t.location || t.city,
                city: t.city,
                type: 'therapist' as const
            }));
        } catch (error) {
            console.error('Error loading therapists:', error);
            return [];
        }
    };

    const loadPlaces = async (): Promise<Entity[]> => {
        try {
            let allPlaces: any[] = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    PLACES_COLLECTION_ID,
                    [Query.limit(limit), Query.offset(offset)]
                );

                allPlaces = [...allPlaces, ...response.documents];
                hasMore = response.documents.length === limit;
                offset += limit;
            }

            return allPlaces.map(p => ({
                $id: p.$id,
                name: p.name || p.placeName || 'Unnamed Place',
                email: p.email,
                location: p.location || p.address || p.city,
                city: p.city,
                type: 'place' as const
            }));
        } catch (error) {
            console.error('Error loading places:', error);
            return [];
        }
    };

    const loadSafePassRecords = async (): Promise<SafePassRecord[]> => {
        try {
            let allRecords: any[] = [];
            let hasMore = true;
            let offset = 0;
            const limit = 100;

            while (hasMore) {
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    [Query.limit(limit), Query.offset(offset)]
                );

                allRecords = [...allRecords, ...response.documents];
                hasMore = response.documents.length === limit;
                offset += limit;
            }

            return allRecords;
        } catch (error) {
            console.error('Error loading SafePass records:', error);
            return [];
        }
    };

    const activateSafePass = async (entity: Entity) => {
        setProcessing(entity.$id);
        try {
            client.setKey(apiKey);

            const now = new Date().toISOString();
            const expiryDate = new Date();
            expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 YEAR validity

            const existingRecord = safePassRecords.get(entity.$id);

            if (existingRecord) {
                // Update existing record
                await databases.updateDocument(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    existingRecord.$id,
                    {
                        hotelVillaSafePassStatus: 'active',
                        hasSafePassVerification: true,
                        safePassIssuedAt: now,
                        safePassExpiry: expiryDate.toISOString()
                    }
                );
            } else {
                // Create new record
                await databases.createDocument(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    ID.unique(),
                    {
                        entityType: entity.type,
                        entityId: entity.$id,
                        entityName: entity.name,
                        hotelVillaSafePassStatus: 'active',
                        hasSafePassVerification: true,
                        safePassIssuedAt: now,
                        safePassExpiry: expiryDate.toISOString(),
                        safePassSubmittedAt: now,
                        safePassApprovedAt: now,
                        safePassApprovedBy: localStorage.getItem('adminId') || 'admin'
                    }
                );
            }

            // Reload data
            await loadData();
            alert(`✅ SafePass activated for ${entity.name}\nValid until: ${expiryDate.toLocaleDateString()}`);

        } catch (error) {
            console.error('Error activating SafePass:', error);
            alert(`❌ Failed to activate SafePass: ${(error as Error).message}`);
        } finally {
            setProcessing(null);
        }
    };

    const deactivateSafePass = async (entity: Entity) => {
        if (!confirm(`Are you sure you want to deactivate SafePass for ${entity.name}?`)) {
            return;
        }

        setProcessing(entity.$id);
        try {
            client.setKey(apiKey);

            const existingRecord = safePassRecords.get(entity.$id);

            if (existingRecord) {
                await databases.updateDocument(
                    DATABASE_ID,
                    SAFEPASS_COLLECTION_ID,
                    existingRecord.$id,
                    {
                        hotelVillaSafePassStatus: 'rejected',
                        hasSafePassVerification: false,
                        safePassRejectionReason: 'Deactivated by admin'
                    }
                );

                // Reload data
                await loadData();
                alert(`✅ SafePass deactivated for ${entity.name}`);
            }

        } catch (error) {
            console.error('Error deactivating SafePass:', error);
            alert(`❌ Failed to deactivate SafePass: ${(error as Error).message}`);
        } finally {
            setProcessing(null);
        }
    };

    const getFilteredEntities = (): Entity[] => {
        let entities: Entity[] = [];

        // Combine entities based on entity filter
        if (entityFilter === 'all' || entityFilter === 'therapist') {
            entities = [...entities, ...therapists];
        }
        if (entityFilter === 'all' || entityFilter === 'place') {
            entities = [...entities, ...places];
        }

        // Add SafePass status to entities
        entities = entities.map(entity => {
            const record = safePassRecords.get(entity.$id);
            return {
                ...entity,
                safePassStatus: record?.hotelVillaSafePassStatus as any || null,
                safePassExpiry: record?.safePassExpiry,
                safePassIssuedAt: record?.safePassIssuedAt
            };
        });

        // Filter by SafePass status
        if (filter === 'active') {
            entities = entities.filter(e => e.safePassStatus === 'active');
        } else if (filter === 'inactive') {
            entities = entities.filter(e => !e.safePassStatus || e.safePassStatus !== 'active');
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            entities = entities.filter(e => 
                e.name.toLowerCase().includes(term) ||
                e.email?.toLowerCase().includes(term) ||
                e.location?.toLowerCase().includes(term)
            );
        }

        // Sort: active first, then by name
        entities.sort((a, b) => {
            if (a.safePassStatus === 'active' && b.safePassStatus !== 'active') return -1;
            if (a.safePassStatus !== 'active' && b.safePassStatus === 'active') return 1;
            return a.name.localeCompare(b.name);
        });

        return entities;
    };

    const filteredEntities = getFilteredEntities();
    const stats = {
        totalTherapists: therapists.length,
        totalPlaces: places.length,
        activeTherapists: therapists.filter(t => safePassRecords.get(t.$id)?.hotelVillaSafePassStatus === 'active').length,
        activePlaces: places.filter(p => safePassRecords.get(p.$id)?.hotelVillaSafePassStatus === 'active').length
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Shield className="w-8 h-8 text-orange-600" />
                            SafePass Management
                        </h1>
                        <p className="text-gray-600 mt-2">Activate and manage SafePass for all therapists and places</p>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Therapists</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalTherapists}</p>
                            </div>
                            <User className="w-8 h-8 text-purple-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Therapists</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activeTherapists}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Places</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalPlaces}</p>
                            </div>
                            <Building className="w-8 h-8 text-blue-600" />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Active Places</p>
                                <p className="text-2xl font-bold text-green-600">{stats.activePlaces}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name, email, or location..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        {/* Entity Type Filter */}
                        <div className="flex gap-2">
                            <Filter className="w-5 h-5 text-gray-400 self-center" />
                            {(['all', 'therapist', 'place'] as const).map(type => (
                                <button
                                    key={type}
                                    onClick={() => setEntityFilter(type)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        entityFilter === type
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}s
                                </button>
                            ))}
                        </div>

                        {/* Status Filter */}
                        <div className="flex gap-2">
                            {(['all', 'active', 'inactive'] as const).map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                        filter === status
                                            ? 'bg-orange-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Entities List */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading entities...</p>
                    </div>
                ) : filteredEntities.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Results Found</h3>
                        <p className="text-gray-600">Try adjusting your filters or search term.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredEntities.map(entity => {
                            const isActive = entity.safePassStatus === 'active';
                            const isProcessing = processing === entity.$id;

                            return (
                                <div key={entity.$id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                                    {/* Entity Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-3 flex-1">
                                            <div className={`p-2 rounded-lg ${
                                                entity.type === 'therapist' ? 'bg-purple-100' : 'bg-blue-100'
                                            }`}>
                                                {entity.type === 'therapist' ? (
                                                    <User className="w-5 h-5 text-purple-600" />
                                                ) : (
                                                    <Building className="w-5 h-5 text-blue-600" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-gray-900 truncate">{entity.name}</h3>
                                                <p className="text-sm text-gray-600 capitalize">{entity.type}</p>
                                            </div>
                                        </div>
                                        {isActive && (
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    <Shield className="w-3 h-3 mr-1" />
                                                    Active
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Entity Details */}
                                    <div className="space-y-2 mb-4 text-sm">
                                        {entity.email && (
                                            <p className="text-gray-600 truncate">📧 {entity.email}</p>
                                        )}
                                        {entity.location && (
                                            <p className="text-gray-600 truncate">📍 {entity.location}</p>
                                        )}
                                        {isActive && entity.safePassIssuedAt && (
                                            <p className="text-gray-600">
                                                🗓️ Issued: {new Date(entity.safePassIssuedAt).toLocaleDateString()}
                                            </p>
                                        )}
                                        {isActive && entity.safePassExpiry && (
                                            <p className="text-gray-600">
                                                ⏰ Expires: {new Date(entity.safePassExpiry).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    {isActive ? (
                                        <button
                                            onClick={() => deactivateSafePass(entity)}
                                            disabled={isProcessing}
                                            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-4 h-4" />
                                                    Deactivate SafePass
                                                </>
                                            )}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => activateSafePass(entity)}
                                            disabled={isProcessing}
                                            className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle className="w-4 h-4" />
                                                    Activate SafePass
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Results Count */}
                {!loading && filteredEntities.length > 0 && (
                    <div className="mt-4 text-center text-gray-600">
                        Showing {filteredEntities.length} of {stats.totalTherapists + stats.totalPlaces} total entities
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminSafePassManagementAll;
