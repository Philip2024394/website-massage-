import React, { useState, useEffect } from 'react';
import PageContainer from '../components/layout/PageContainer';

interface AdminLiveListingsProps {
    therapists: any[];
    loggedInAgent: any | null;
    onNavigate?: (page: string) => void;
}

const AdminLiveListings: React.FC<AdminLiveListingsProps> = ({ 
    therapists, 
    loggedInAgent,
    onNavigate 
}) => {
    // 🔐 ADMIN AUTHENTICATION: Only allow access if logged in as agent/admin
    const hasAdminAccess = !!loggedInAgent;
    
    const [searchQuery, setSearchQuery] = useState('');
    const [filterArea, setFilterArea] = useState<string>('all');
    const [filterLiveStatus, setFilterLiveStatus] = useState<string>('all');
    
    // Redirect if not admin
    useEffect(() => {
        if (!hasAdminAccess) {
            console.warn('🔐 Unauthorized access attempt to admin page');
            onNavigate?.('home');
        }
    }, [hasAdminAccess, onNavigate]);
    
    if (!hasAdminAccess) {
        return (
            <PageContainer className="py-8">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="text-2xl font-bold text-red-600 mb-4">🔐 Access Denied</h1>
                    <p className="text-gray-600">This page is only accessible to administrators.</p>
                </div>
            </PageContainer>
        );
    }
    
    // Extract unique location areas
    const locationAreas = Array.from(new Set(therapists.map(t => t.city || t.location || 'Unknown'))).sort();
    
    // Filter therapists based on search and filters
    const filteredTherapists = therapists.filter(t => {
        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const matchesName = t.name?.toLowerCase().includes(query);
            const matchesId = String(t.$id || t.id).toLowerCase().includes(query);
            if (!matchesName && !matchesId) return false;
        }
        
        // Area filter
        if (filterArea !== 'all') {
            const therapistArea = t.city || t.location || 'Unknown';
            if (therapistArea !== filterArea) return false;
        }
        
        // Live status filter
        if (filterLiveStatus !== 'all') {
            if (filterLiveStatus === 'live' && !t.isLive) return false;
            if (filterLiveStatus === 'notLive' && t.isLive) return false;
        }
        
        return true;
    });
    
    // Helper: Check if therapist has valid geopoint
    const hasValidGeopoint = (therapist: any) => {
        return !!(therapist.geopoint || therapist.coordinates);
    };
    
    // Helper: Open Google Maps at therapist location
    const openGoogleMaps = (therapist: any) => {
        let lat, lng;
        
        if (therapist.geopoint) {
            lat = therapist.geopoint.latitude;
            lng = therapist.geopoint.longitude;
        } else if (therapist.coordinates) {
            lat = therapist.coordinates.lat;
            lng = therapist.coordinates.lng;
        }
        
        if (lat && lng) {
            window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
        } else {
            alert('No coordinates available for this therapist');
        }
    };
    
    // Helper: Open preview mode
    const openPreview = (therapist: any) => {
        const therapistId = therapist.$id || therapist.id;
        window.open(`/?previewTherapistId=${therapistId}`, '_blank');
    };
    
    // Helper: Open admin area view
    const openAreaView = (area: string) => {
        window.open(`/?adminViewArea=${encodeURIComponent(area)}&bypassRadius=true`, '_blank');
    };
    
    return (
        <PageContainer className="py-6 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Admin: Live Therapist Listings</h1>
                    <p className="text-gray-600">Manage and preview all therapist listings</p>
                </div>
                
                {/* Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                            <input
                                type="text"
                                placeholder="Name or ID..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        {/* Area Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Location Area</label>
                            <select
                                value={filterArea}
                                onChange={(e) => setFilterArea(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All Areas</option>
                                {locationAreas.map(area => (
                                    <option key={area} value={area}>{area}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Live Status Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Live Status</label>
                            <select
                                value={filterLiveStatus}
                                onChange={(e) => setFilterLiveStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="all">All</option>
                                <option value="live">Live Only</option>
                                <option value="notLive">Not Live</option>
                            </select>
                        </div>
                    </div>
                    
                    {/* Summary */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Showing {filteredTherapists.length} of {therapists.length} therapists</span>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setFilterArea('all');
                                    setFilterLiveStatus('all');
                                }}
                                className="text-blue-600 hover:text-blue-700"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>
                
                {/* Therapist Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Area
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Geopoint
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTherapists.map((therapist) => {
                                    const therapistArea = therapist.city || therapist.location || 'Unknown';
                                    const hasGeopoint = hasValidGeopoint(therapist);
                                    const lastUpdated = therapist.$updatedAt || therapist.updatedAt;
                                    
                                    return (
                                        <tr key={therapist.$id || therapist.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {therapist.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            ID: {therapist.$id || therapist.id}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm text-gray-900">{therapistArea}</span>
                                                    <button
                                                        onClick={() => openAreaView(therapistArea)}
                                                        className="text-xs text-blue-600 hover:text-blue-700"
                                                        title="View all therapists in this area"
                                                    >
                                                        (view)
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    therapist.isLive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {therapist.isLive ? 'Live' : 'Not Live'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    hasGeopoint 
                                                        ? 'bg-blue-100 text-blue-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {hasGeopoint ? 'Valid' : 'Missing'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => openPreview(therapist)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="View listing live (preview mode)"
                                                    >
                                                        👁️ Preview
                                                    </button>
                                                    {hasGeopoint && (
                                                        <button
                                                            onClick={() => openGoogleMaps(therapist)}
                                                            className="text-green-600 hover:text-green-900"
                                                            title="Open location in Google Maps"
                                                        >
                                                            🗺️ Maps
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredTherapists.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            No therapists found matching your filters
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default AdminLiveListings;
