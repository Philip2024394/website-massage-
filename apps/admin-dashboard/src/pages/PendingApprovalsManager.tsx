/**
 * PENDING APPROVALS MANAGEMENT SYSTEM
 * Comprehensive system to manage all pending approvals:
 * - New account approvals
 * - Profile update re-approvals
 * - Image update approvals
 * - Information change approvals
 */

import React, { useState, useEffect } from 'react';
import {
    AlertCircle, CheckCircle, XCircle, Clock, User, Building,
    Eye, Edit, Trash2, RefreshCw, Search, Filter, Calendar,
    Image, FileText, MapPin, Phone, Mail, Star
} from 'lucide-react';
import { databases, DATABASE_ID, COLLECTIONS } from '../../../src/lib/appwrite';
import { Query } from 'appwrite';

interface PendingApproval {
    $id: string;
    name: string;
    type: 'therapist' | 'place' | 'facial_place';
    status: 'pending' | 'active';
    approvalType: 'new_account' | 'profile_update' | 'image_update' | 'info_update';
    pendingUpdates?: boolean;
    profileUpdatePending?: boolean;
    needsReapproval?: boolean;
    updatedAt?: string;
    lastApprovedAt?: string;
    $createdAt: string;
    
    // Profile data
    email?: string;
    whatsappNumber?: string;
    location?: string;
    profileImage?: string;
    mainImage?: string;
    description?: string;
    pricing?: any;
    
    // Changes that need approval
    pendingChanges?: {
        profileImage?: string;
        mainImage?: string;
        description?: string;
        pricing?: any;
        location?: string;
        whatsappNumber?: string;
        additionalImages?: string[];
    };
    
    // Admin notes
    adminNotes?: string;
    rejectionReason?: string;
}

interface PendingApprovalsManagerProps {
    onBack?: () => void;
}

const PendingApprovalsManager: React.FC<PendingApprovalsManagerProps> = ({ onBack }) => {
    const [approvals, setApprovals] = useState<PendingApproval[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'new_account' | 'profile_update' | 'image_update'>('all');
    const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    /**
     * Fetch all items needing approval
     */
    const fetchPendingApprovals = async () => {
        try {
            setLoading(true);
            console.log('📋 [PENDING APPROVALS] Fetching all pending approvals...');
            
            const allApprovals: PendingApproval[] = [];
            
            // 1. Fetch therapists needing approval
            const therapistsResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.therapists,
                [
                    Query.or([
                        Query.equal('status', 'pending'),
                        Query.equal('pendingUpdates', true),
                        Query.equal('profileUpdatePending', true),
                        Query.equal('needsReapproval', true)
                    ]),
                    Query.orderDesc('$updatedAt'),
                    Query.limit(100)
                ]
            );
            
            therapistsResponse.documents.forEach((therapist: any) => {
                let approvalType: PendingApproval['approvalType'] = 'new_account';
                
                if (therapist.status === 'active' && (therapist.pendingUpdates || therapist.profileUpdatePending || therapist.needsReapproval)) {
                    approvalType = 'profile_update';
                    if (therapist.pendingChanges?.profileImage || therapist.pendingChanges?.mainImage || therapist.pendingChanges?.additionalImages) {
                        approvalType = 'image_update';
                    }
                }
                
                allApprovals.push({
                    ...therapist,
                    type: 'therapist',
                    approvalType
                });
            });
            
            // 2. Fetch places needing approval
            const placesResponse = await databases.listDocuments(
                DATABASE_ID,
                COLLECTIONS.places,
                [
                    Query.or([
                        Query.equal('status', 'pending'),
                        Query.equal('pendingUpdates', true),
                        Query.equal('profileUpdatePending', true),
                        Query.equal('needsReapproval', true)
                    ]),
                    Query.orderDesc('$updatedAt'),
                    Query.limit(100)
                ]
            );
            
            placesResponse.documents.forEach((place: any) => {
                let approvalType: PendingApproval['approvalType'] = 'new_account';
                
                if (place.status === 'active' && (place.pendingUpdates || place.profileUpdatePending || place.needsReapproval)) {
                    approvalType = 'profile_update';
                    if (place.pendingChanges?.profileImage || place.pendingChanges?.mainImage || place.pendingChanges?.additionalImages) {
                        approvalType = 'image_update';
                    }
                }
                
                allApprovals.push({
                    ...place,
                    type: 'place',
                    approvalType
                });
            });
            
            // 3. Fetch facial places needing approval  
            const facialPlacesResponse = await databases.listDocuments(
                DATABASE_ID,
                'facial_places_collection',
                [
                    Query.or([
                        Query.equal('status', 'pending'),
                        Query.equal('pendingUpdates', true),
                        Query.equal('profileUpdatePending', true),
                        Query.equal('needsReapproval', true)
                    ]),
                    Query.orderDesc('$updatedAt'),
                    Query.limit(100)
                ]
            );
            
            facialPlacesResponse.documents.forEach((facialPlace: any) => {
                let approvalType: PendingApproval['approvalType'] = 'new_account';
                
                if (facialPlace.status === 'active' && (facialPlace.pendingUpdates || facialPlace.profileUpdatePending || facialPlace.needsReapproval)) {
                    approvalType = 'profile_update';
                    if (facialPlace.pendingChanges?.profileImage || facialPlace.pendingChanges?.mainImage || facialPlace.pendingChanges?.additionalImages) {
                        approvalType = 'image_update';
                    }
                }
                
                allApprovals.push({
                    ...facialPlace,
                    type: 'facial_place',
                    approvalType
                });
            });
            
            // Sort by most recent first
            allApprovals.sort((a, b) => new Date(b.$updatedAt || b.$createdAt).getTime() - new Date(a.$updatedAt || a.$createdAt).getTime());
            
            console.log(`✅ [PENDING APPROVALS] Found ${allApprovals.length} items needing approval`);
            console.log('📊 Breakdown:', {
                new_accounts: allApprovals.filter(a => a.approvalType === 'new_account').length,
                profile_updates: allApprovals.filter(a => a.approvalType === 'profile_update').length,
                image_updates: allApprovals.filter(a => a.approvalType === 'image_update').length
            });
            
            setApprovals(allApprovals);
            
        } catch (error) {
            console.error('❌ [PENDING APPROVALS] Error fetching approvals:', error);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Approve a pending item
     */
    const handleApprove = async (approval: PendingApproval) => {
        try {
            setProcessingId(approval.$id);
            console.log(`✅ [PENDING APPROVALS] Approving ${approval.type} ${approval.name}...`);
            
            const collectionId = approval.type === 'therapist' ? COLLECTIONS.therapists : 
                               approval.type === 'place' ? COLLECTIONS.places : 
                               'facial_places_collection';
            
            // Update the document to approve
            await databases.updateDocument(
                DATABASE_ID,
                collectionId,
                approval.$id,
                {
                    status: 'active',
                    pendingUpdates: false,
                    profileUpdatePending: false,
                    needsReapproval: false,
                    lastApprovedAt: new Date().toISOString(),
                    approvedBy: 'admin', // TODO: Get actual admin user
                    
                    // If there are pending changes, apply them
                    ...(approval.pendingChanges || {})
                }
            );
            
            console.log(`✅ [PENDING APPROVALS] Approved ${approval.type} ${approval.name}`);
            
            // Remove from pending list
            setApprovals(prev => prev.filter(a => a.$id !== approval.$id));
            
        } catch (error) {
            console.error(`❌ [PENDING APPROVALS] Error approving ${approval.name}:`, error);
            alert('Failed to approve. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    /**
     * Delete/Reject a pending item
     */
    const handleDelete = async (approval: PendingApproval) => {
        const reason = prompt(`Enter reason for ${approval.approvalType === 'new_account' ? 'deleting account' : 'rejecting updates'} for ${approval.name}:`);
        if (!reason) return;
        
        try {
            setProcessingId(approval.$id);
            console.log(`❌ [PENDING APPROVALS] Deleting/rejecting ${approval.type} ${approval.name}...`);
            
            const collectionId = approval.type === 'therapist' ? COLLECTIONS.therapists : 
                               approval.type === 'place' ? COLLECTIONS.places : 
                               'facial_places_collection';
            
            if (approval.approvalType === 'new_account') {
                // Delete new account entirely
                await databases.deleteDocument(DATABASE_ID, collectionId, approval.$id);
                console.log(`🗑️ [PENDING APPROVALS] Deleted new account ${approval.name}`);
            } else {
                // Reject updates but keep account active
                await databases.updateDocument(
                    DATABASE_ID,
                    collectionId,
                    approval.$id,
                    {
                        pendingUpdates: false,
                        profileUpdatePending: false,
                        needsReapproval: false,
                        rejectionReason: reason,
                        rejectedAt: new Date().toISOString(),
                        rejectedBy: 'admin', // TODO: Get actual admin user
                        
                        // Clear pending changes
                        pendingChanges: null
                    }
                );
                console.log(`❌ [PENDING APPROVALS] Rejected updates for ${approval.name}`);
            }
            
            // Remove from pending list
            setApprovals(prev => prev.filter(a => a.$id !== approval.$id));
            
        } catch (error) {
            console.error(`❌ [PENDING APPROVALS] Error processing ${approval.name}:`, error);
            alert('Failed to process. Please try again.');
        } finally {
            setProcessingId(null);
        }
    };

    // Filter approvals based on search and type
    const filteredApprovals = approvals.filter(approval => {
        const matchesSearch = approval.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            approval.email?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === 'all' || approval.approvalType === filterType;
        return matchesSearch && matchesType;
    });

    useEffect(() => {
        fetchPendingApprovals();
    }, []);

    const getApprovalTypeIcon = (type: PendingApproval['approvalType']) => {
        switch (type) {
            case 'new_account': return <User className="w-4 h-4" />;
            case 'image_update': return <Image className="w-4 h-4" />;
            case 'profile_update': return <Edit className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getApprovalTypeColor = (type: PendingApproval['approvalType']) => {
        switch (type) {
            case 'new_account': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'image_update': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'profile_update': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading pending approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-8 h-8 text-orange-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Pending Approvals</h1>
                                <p className="text-sm text-gray-500">
                                    Manage new accounts and profile updates • {filteredApprovals.length} items
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchPendingApprovals}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                            
                            {onBack && (
                                <button
                                    onClick={onBack}
                                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                >
                                    ← Back
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {filteredApprovals.filter(a => a.approvalType === 'new_account').length}
                            </div>
                            <div className="text-sm text-gray-600">New Accounts</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">
                                {filteredApprovals.filter(a => a.approvalType === 'profile_update').length}
                            </div>
                            <div className="text-sm text-gray-600">Profile Updates</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">
                                {filteredApprovals.filter(a => a.approvalType === 'image_update').length}
                            </div>
                            <div className="text-sm text-gray-600">Image Updates</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {filteredApprovals.length}
                            </div>
                            <div className="text-sm text-gray-600">Total Pending</div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by name or email..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="new_account">New Accounts</option>
                            <option value="profile_update">Profile Updates</option>
                            <option value="image_update">Image Updates</option>
                        </select>
                    </div>
                </div>

                {/* Approvals List */}
                {filteredApprovals.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                        <p className="text-gray-500">No pending approvals at the moment.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredApprovals.map((approval) => (
                            <div key={approval.$id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-start gap-4">
                                            {/* Profile Image */}
                                            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                                {approval.profileImage || approval.mainImage ? (
                                                    <img
                                                        src={approval.profileImage || approval.mainImage}
                                                        alt={approval.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        {approval.type === 'therapist' ? (
                                                            <User className="w-8 h-8 text-gray-400" />
                                                        ) : (
                                                            <Building className="w-8 h-8 text-gray-400" />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Details */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h3 className="text-lg font-semibold text-gray-900">{approval.name}</h3>
                                                    
                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getApprovalTypeColor(approval.approvalType)}`}>
                                                        {getApprovalTypeIcon(approval.approvalType)}
                                                        {approval.approvalType.replace('_', ' ')}
                                                    </span>
                                                    
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 capitalize">
                                                        {approval.type.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                
                                                <div className="space-y-1 text-sm text-gray-600">
                                                    {approval.email && (
                                                        <div className="flex items-center gap-2">
                                                            <Mail className="w-4 h-4" />
                                                            {approval.email}
                                                        </div>
                                                    )}
                                                    {approval.whatsappNumber && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="w-4 h-4" />
                                                            {approval.whatsappNumber}
                                                        </div>
                                                    )}
                                                    {approval.location && (
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4" />
                                                            {approval.location}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4" />
                                                        {approval.approvalType === 'new_account' ? 'Created' : 'Updated'}: {new Date(approval.updatedAt || approval.$createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setSelectedApproval(approval)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            
                                            <button
                                                onClick={() => handleApprove(approval)}
                                                disabled={processingId === approval.$id}
                                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDelete(approval)}
                                                disabled={processingId === approval.$id}
                                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                                            >
                                                {approval.approvalType === 'new_account' ? (
                                                    <>
                                                        <Trash2 className="w-4 h-4" />
                                                        Delete
                                                    </>
                                                ) : (
                                                    <>
                                                        <XCircle className="w-4 h-4" />
                                                        Reject
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* TODO: Add detail modal for selectedApproval */}
        </div>
    );
};

export default PendingApprovalsManager;