import React, { useState, useEffect } from 'react';
import {
    Star, ThumbsUp, ThumbsDown, Flag, CheckCircle, XCircle,
    Search, Filter, RefreshCw, MessageSquare, Eye, Ban,
    AlertTriangle, User, Building, Sparkles, Calendar
} from 'lucide-react';

interface Review {
    $id: string;
    customerId: string;
    customerName: string;
    memberType: 'therapist' | 'place' | 'facial';
    memberId: string;
    memberName: string;
    rating: number; // 1-5
    comment: string;
    status: 'pending' | 'approved' | 'rejected' | 'flagged';
    createdAt: string;
    approvedAt?: string;
    rejectedAt?: string;
    flaggedReason?: string;
    adminResponse?: string;
    helpful: number; // helpful votes
    reported: number; // report count
    images?: string[];
    bookingId?: string;
    verified: boolean; // verified booking
}

interface ReviewsManagementProps {
    onBack?: () => void;
}

const ReviewsManagement: React.FC<ReviewsManagementProps> = ({ onBack }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | Review['status']>('all');
    const [memberTypeFilter, setMemberTypeFilter] = useState<'all' | Review['memberType']>('all');
    const [ratingFilter, setRatingFilter] = useState<'all' | '5' | '4' | '3' | '2' | '1'>('all');
    const [selectedReview, setSelectedReview] = useState<Review | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [adminResponse, setAdminResponse] = useState('');

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoading(true);
            // TODO: Integrate with Appwrite reviews collection
            
            // Mock data
            const mockReviews: Review[] = [
                {
                    $id: '1',
                    customerId: 'customer1',
                    customerName: 'John Doe',
                    memberType: 'therapist',
                    memberId: 'therapist1',
                    memberName: 'Sarah Johnson',
                    rating: 5,
                    comment: 'Excellent massage! Very professional and the technique was perfect. Highly recommend!',
                    status: 'approved',
                    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                    approvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
                    helpful: 12,
                    reported: 0,
                    verified: true
                },
                {
                    $id: '2',
                    customerId: 'customer2',
                    customerName: 'Jane Smith',
                    memberType: 'place',
                    memberId: 'place1',
                    memberName: 'Bali Spa Center',
                    rating: 2,
                    comment: 'The place was dirty and unprofessional. Not worth the money.',
                    status: 'pending',
                    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
                    helpful: 0,
                    reported: 1,
                    verified: true
                },
                {
                    $id: '3',
                    customerId: 'customer3',
                    customerName: 'Mike Wilson',
                    memberType: 'therapist',
                    memberId: 'therapist2',
                    memberName: 'Lisa Chen',
                    rating: 4,
                    comment: 'Good service overall. A bit late but the massage was great.',
                    status: 'approved',
                    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
                    approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
                    helpful: 8,
                    reported: 0,
                    verified: true
                }
            ];
            
            setReviews(mockReviews);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const getFilteredReviews = () => {
        return reviews.filter(review => {
            const matchesSearch = 
                review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                review.comment.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || review.status === statusFilter;
            const matchesMemberType = memberTypeFilter === 'all' || review.memberType === memberTypeFilter;
            const matchesRating = ratingFilter === 'all' || review.rating === parseInt(ratingFilter);
            
            return matchesSearch && matchesStatus && matchesMemberType && matchesRating;
        });
    };

    const handleApprove = async (reviewId: string) => {
        try {
            // TODO: Integrate with Appwrite
            setReviews(prev => prev.map(r => 
                r.$id === reviewId 
                    ? { ...r, status: 'approved' as const, approvedAt: new Date().toISOString() }
                    : r
            ));
            alert('Review approved successfully');
        } catch (error) {
            console.error('Error approving review:', error);
            alert('Failed to approve review');
        }
    };

    const handleReject = async (reviewId: string, reason: string) => {
        try {
            // TODO: Integrate with Appwrite
            setReviews(prev => prev.map(r => 
                r.$id === reviewId 
                    ? { ...r, status: 'rejected' as const, rejectedAt: new Date().toISOString(), flaggedReason: reason }
                    : r
            ));
            alert('Review rejected successfully');
        } catch (error) {
            console.error('Error rejecting review:', error);
            alert('Failed to reject review');
        }
    };

    const handleFlag = async (reviewId: string, reason: string) => {
        try {
            // TODO: Integrate with Appwrite
            setReviews(prev => prev.map(r => 
                r.$id === reviewId 
                    ? { ...r, status: 'flagged' as const, flaggedReason: reason }
                    : r
            ));
            alert('Review flagged successfully');
        } catch (error) {
            console.error('Error flagging review:', error);
            alert('Failed to flag review');
        }
    };

    const handleAddResponse = async (reviewId: string, response: string) => {
        try {
            // TODO: Integrate with Appwrite
            setReviews(prev => prev.map(r => 
                r.$id === reviewId 
                    ? { ...r, adminResponse: response }
                    : r
            ));
            setAdminResponse('');
            alert('Response added successfully');
        } catch (error) {
            console.error('Error adding response:', error);
            alert('Failed to add response');
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm('Are you sure you want to permanently delete this review?')) return;
        
        try {
            // TODO: Integrate with Appwrite
            setReviews(prev => prev.filter(r => r.$id !== reviewId));
            setShowDetails(false);
            alert('Review deleted successfully');
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    const getStatusColor = (status: Review['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'flagged': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getMemberTypeIcon = (type: Review['memberType']) => {
        switch (type) {
            case 'therapist': return <User className="w-4 h-4" />;
            case 'place': return <Building className="w-4 h-4" />;
            case 'facial': return <Sparkles className="w-4 h-4" />;
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`w-4 h-4 ${
                            star <= rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                ))}
            </div>
        );
    };

    const stats = {
        total: reviews.length,
        pending: reviews.filter(r => r.status === 'pending').length,
        approved: reviews.filter(r => r.status === 'approved').length,
        rejected: reviews.filter(r => r.status === 'rejected').length,
        flagged: reviews.filter(r => r.status === 'flagged').length,
        avgRating: reviews.length > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : '0.0'
    };

    const filteredReviews = getFilteredReviews();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                ←
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Reviews Management</h1>
                            <p className="text-gray-600">Moderate and manage customer reviews</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchReviews}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
                    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
                        <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        <div className="text-sm text-gray-600">Total Reviews</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl shadow-sm p-4 border border-yellow-200">
                        <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                        <div className="text-sm text-yellow-700">Pending</div>
                    </div>
                    <div className="bg-green-50 rounded-xl shadow-sm p-4 border border-green-200">
                        <div className="text-2xl font-bold text-green-900">{stats.approved}</div>
                        <div className="text-sm text-green-700">Approved</div>
                    </div>
                    <div className="bg-red-50 rounded-xl shadow-sm p-4 border border-red-200">
                        <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
                        <div className="text-sm text-red-700">Rejected</div>
                    </div>
                    <div className="bg-orange-50 rounded-xl shadow-sm p-4 border border-orange-200">
                        <div className="text-2xl font-bold text-orange-900">{stats.flagged}</div>
                        <div className="text-sm text-orange-700">Flagged</div>
                    </div>
                    <div className="bg-blue-50 rounded-xl shadow-sm p-4 border border-blue-200">
                        <div className="flex items-center gap-1 text-2xl font-bold text-blue-900">
                            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
                            {stats.avgRating}
                        </div>
                        <div className="text-sm text-blue-700">Avg Rating</div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search reviews by customer, member, or content..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Filter className="w-5 h-5 text-gray-600" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                            <option value="flagged">Flagged</option>
                        </select>
                        <select
                            value={memberTypeFilter}
                            onChange={(e) => setMemberTypeFilter(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Types</option>
                            <option value="therapist">Therapists</option>
                            <option value="place">Places</option>
                            <option value="facial">Facials</option>
                        </select>
                        <select
                            value={ratingFilter}
                            onChange={(e) => setRatingFilter(e.target.value as any)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            <option value="all">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4 Stars</option>
                            <option value="3">3 Stars</option>
                            <option value="2">2 Stars</option>
                            <option value="1">1 Star</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-2" />
                        <p className="text-gray-600">Loading reviews...</p>
                    </div>
                ) : filteredReviews.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-gray-600">No reviews found</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <div
                            key={review.$id}
                            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            {getMemberTypeIcon(review.memberType)}
                                            <span className="font-medium text-gray-900">{review.memberName}</span>
                                        </div>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-sm text-gray-600">{review.customerName}</span>
                                        {review.verified && (
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                                Verified
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-3 mb-3">
                                        {renderStars(review.rating)}
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(review.status)}`}>
                                            {review.status}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-4">{review.comment}</p>

                            {review.adminResponse && (
                                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="text-xs text-blue-700 font-semibold mb-1">Admin Response:</div>
                                    <p className="text-sm text-blue-900">{review.adminResponse}</p>
                                </div>
                            )}

                            {review.flaggedReason && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <div className="text-xs text-red-700 font-semibold mb-1">Flag Reason:</div>
                                    <p className="text-sm text-red-900">{review.flaggedReason}</p>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1">
                                        <ThumbsUp className="w-4 h-4" />
                                        {review.helpful} helpful
                                    </div>
                                    {review.reported > 0 && (
                                        <div className="flex items-center gap-1 text-red-600">
                                            <Flag className="w-4 h-4" />
                                            {review.reported} reports
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => {
                                            setSelectedReview(review);
                                            setShowDetails(true);
                                        }}
                                        className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg font-medium"
                                    >
                                        <Eye className="w-4 h-4 inline mr-1" />
                                        Details
                                    </button>
                                    
                                    {review.status === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => handleApprove(review.$id)}
                                                className="px-3 py-1.5 text-sm bg-green-500 text-white hover:bg-green-600 rounded-lg font-medium"
                                            >
                                                <CheckCircle className="w-4 h-4 inline mr-1" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reason = prompt('Reason for rejection:');
                                                    if (reason) handleReject(review.$id, reason);
                                                }}
                                                className="px-3 py-1.5 text-sm bg-red-500 text-white hover:bg-red-600 rounded-lg font-medium"
                                            >
                                                <XCircle className="w-4 h-4 inline mr-1" />
                                                Reject
                                            </button>
                                        </>
                                    )}
                                    
                                    {review.status === 'approved' && (
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for flagging:');
                                                if (reason) handleFlag(review.$id, reason);
                                            }}
                                            className="px-3 py-1.5 text-sm text-orange-600 hover:bg-orange-50 rounded-lg font-medium"
                                        >
                                            <Flag className="w-4 h-4 inline mr-1" />
                                            Flag
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Review Details Modal */}
            {showDetails && selectedReview && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">Review Details</h2>
                                <button
                                    onClick={() => setShowDetails(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                    <XCircle className="w-6 h-6 text-gray-600" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Review Info */}
                            <div>
                                <div className="flex items-center gap-3 mb-3">
                                    {getMemberTypeIcon(selectedReview.memberType)}
                                    <span className="text-xl font-semibold">{selectedReview.memberName}</span>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    {renderStars(selectedReview.rating)}
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(selectedReview.status)}`}>
                                        {selectedReview.status}
                                    </span>
                                </div>
                                <p className="text-gray-700 text-lg mb-4">{selectedReview.comment}</p>
                                
                                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg text-sm">
                                    <div>
                                        <span className="text-gray-600">Customer:</span>
                                        <div className="font-medium">{selectedReview.customerName}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Date:</span>
                                        <div className="font-medium">{new Date(selectedReview.createdAt).toLocaleString()}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Helpful Votes:</span>
                                        <div className="font-medium">{selectedReview.helpful}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-600">Reports:</span>
                                        <div className={`font-medium ${selectedReview.reported > 0 ? 'text-red-600' : ''}`}>
                                            {selectedReview.reported}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Admin Response Section */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Response</h3>
                                {selectedReview.adminResponse ? (
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-3">
                                        <p className="text-blue-900">{selectedReview.adminResponse}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <textarea
                                            value={adminResponse}
                                            onChange={(e) => setAdminResponse(e.target.value)}
                                            placeholder="Add a response on behalf of the member..."
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                            rows={3}
                                        />
                                        <button
                                            onClick={() => {
                                                if (adminResponse.trim()) {
                                                    handleAddResponse(selectedReview.$id, adminResponse);
                                                }
                                            }}
                                            disabled={!adminResponse.trim()}
                                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Add Response
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                {selectedReview.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => {
                                                handleApprove(selectedReview.$id);
                                                setShowDetails(false);
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve Review
                                        </button>
                                        <button
                                            onClick={() => {
                                                const reason = prompt('Reason for rejection:');
                                                if (reason) {
                                                    handleReject(selectedReview.$id, reason);
                                                    setShowDetails(false);
                                                }
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject Review
                                        </button>
                                    </>
                                )}
                                
                                {selectedReview.status === 'approved' && (
                                    <button
                                        onClick={() => {
                                            const reason = prompt('Reason for flagging:');
                                            if (reason) {
                                                handleFlag(selectedReview.$id, reason);
                                                setShowDetails(false);
                                            }
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium"
                                    >
                                        <Flag className="w-5 h-5" />
                                        Flag Review
                                    </button>
                                )}

                                <button
                                    onClick={() => handleDeleteReview(selectedReview.$id)}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                                >
                                    <Ban className="w-5 h-5" />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewsManagement;
