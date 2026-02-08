/**
 * Admin SafePass Management Page
 * Allows admins to review, approve, reject, and activate SafePass applications
 */

import React, { useState, useEffect } from 'react';
import { 
    Shield, 
    CheckCircle, 
    XCircle, 
    Clock, 
    FileText, 
    User,
    Building,
    Calendar,
    AlertCircle,
    Download,
    Eye
} from 'lucide-react';
import safePassService from '../../services/safePassService';
import { logger } from '../../utils/logger';
import type { SafePassApplication, SafePassStats } from '../../types/safepass.types';

const AdminSafePassManagement: React.FC = () => {
    const [applications, setApplications] = useState<SafePassApplication[]>([]);
    const [stats, setStats] = useState<SafePassStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [selectedApplication, setSelectedApplication] = useState<SafePassApplication | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState<'approve' | 'reject' | 'activate' | 'revoke' | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [cardUrl, setCardUrl] = useState('');
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        loadData();
    }, [selectedStatus]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, appsData] = await Promise.all([
                safePassService.getStats(),
                safePassService.listApplications(selectedStatus === 'all' ? undefined : selectedStatus)
            ]);

            setStats(statsData);
            setApplications(appsData);
        } catch (error) {
            logger.error('Error loading SafePass data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async () => {
        if (!selectedApplication || !actionType) return;

        setProcessing(true);
        try {
            const adminId = localStorage.getItem('adminId') || 'admin';

            switch (actionType) {
                case 'approve':
                    await safePassService.approveApplication({
                        applicationId: selectedApplication.$id!,
                        approved: true,
                        adminId
                    });
                    break;

                case 'reject':
                    if (!rejectionReason.trim()) {
                        alert('Please provide a rejection reason');
                        setProcessing(false);
                        return;
                    }
                    await safePassService.approveApplication({
                        applicationId: selectedApplication.$id!,
                        approved: false,
                        adminId,
                        rejectionReason
                    });
                    break;

                case 'activate':
                    await safePassService.activateApplication({
                        applicationId: selectedApplication.$id!,
                        safePassCardUrl: cardUrl || undefined
                    });
                    break;

                case 'revoke':
                    if (!rejectionReason.trim()) {
                        alert('Please provide a revocation reason');
                        setProcessing(false);
                        return;
                    }
                    await safePassService.revokeApplication(
                        selectedApplication.$id!,
                        rejectionReason
                    );
                    break;
            }

            // Reload data
            await loadData();
            closeModal();
        } catch (error) {
            logger.error('Error processing action:', error);
            alert('Error processing action. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const openModal = (app: SafePassApplication, action: typeof actionType) => {
        setSelectedApplication(app);
        setActionType(action);
        setRejectionReason('');
        setCardUrl('');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedApplication(null);
        setActionType(null);
        setRejectionReason('');
        setCardUrl('');
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending Review' },
            approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle, label: 'Approved' },
            active: { color: 'bg-green-100 text-green-800', icon: Shield, label: 'Active' },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' }
        };

        const badge = badges[status as keyof typeof badges] || badges.pending;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-orange-600" />
                    <h1 className="text-3xl font-bold text-gray-900">SafePass Management</h1>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-lg shadow">
                            <div className="text-sm text-gray-600">Total Applications</div>
                            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg shadow">
                            <div className="text-sm text-yellow-700">Pending</div>
                            <div className="text-2xl font-bold text-yellow-900">{stats.pending}</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg shadow">
                            <div className="text-sm text-blue-700">Approved</div>
                            <div className="text-2xl font-bold text-blue-900">{stats.approved}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg shadow">
                            <div className="text-sm text-green-700">Active</div>
                            <div className="text-2xl font-bold text-green-900">{stats.active}</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg shadow">
                            <div className="text-sm text-red-700">Rejected</div>
                            <div className="text-2xl font-bold text-red-900">{stats.rejected}</div>
                        </div>
                    </div>
                )}

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap">
                    {['all', 'pending', 'approved', 'active', 'rejected'].map(status => (
                        <button
                            key={status}
                            onClick={() => setSelectedStatus(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                selectedStatus === status
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Applications List */}
            <div className="max-w-7xl mx-auto">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading applications...</p>
                    </div>
                ) : applications.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Applications Found</h3>
                        <p className="text-gray-600">No SafePass applications match the selected filter.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {applications.map(app => (
                            <div key={app.$id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start gap-4">
                                        <div className={`p-3 rounded-lg ${
                                            app.entityType === 'therapist' ? 'bg-purple-100' : 'bg-blue-100'
                                        }`}>
                                            {app.entityType === 'therapist' ? (
                                                <User className="w-6 h-6 text-purple-600" />
                                            ) : (
                                                <Building className="w-6 h-6 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{app.entityName}</h3>
                                            <p className="text-sm text-gray-600 capitalize">{app.entityType}</p>
                                            <p className="text-sm text-gray-500 mt-1">ID: {app.entityId}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {getStatusBadge(app.hotelVillaSafePassStatus)}
                                    </div>
                                </div>

                                {/* Application Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Submitted:</span>
                                        <span className="ml-2 font-medium">{formatDate(app.safePassSubmittedAt)}</span>
                                    </div>
                                    {app.safePassApprovedAt && (
                                        <div>
                                            <span className="text-gray-600">Approved:</span>
                                            <span className="ml-2 font-medium">{formatDate(app.safePassApprovedAt)}</span>
                                        </div>
                                    )}
                                    {app.safePassIssuedAt && app.hotelVillaSafePassStatus === 'active' && (
                                        <div>
                                            <span className="text-gray-600">Issued:</span>
                                            <span className="ml-2 font-medium">{formatDate(app.safePassIssuedAt)}</span>
                                        </div>
                                    )}
                                    {app.safePassExpiry && app.hotelVillaSafePassStatus === 'active' && (
                                        <div>
                                            <span className="text-gray-600">Expires:</span>
                                            <span className="ml-2 font-medium">{formatDate(app.safePassExpiry)}</span>
                                        </div>
                                    )}
                                    {app.safePassPaymentId && (
                                        <div>
                                            <span className="text-gray-600">Payment ID:</span>
                                            <span className="ml-2 font-medium">{app.safePassPaymentId}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Letters/Documents */}
                                {app.hotelVillaLetters && (
                                    <div className="mb-4">
                                        <p className="text-sm text-gray-600 mb-2">Supporting Documents:</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {JSON.parse(app.hotelVillaLetters).map((url: string, idx: number) => (
                                                <a
                                                    key={idx}
                                                    href={url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm text-gray-700"
                                                >
                                                    <FileText className="w-4 h-4" />
                                                    Document {idx + 1}
                                                    <Eye className="w-3 h-3" />
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Rejection Reason */}
                                {app.safePassRejectionReason && (
                                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
                                        <p className="text-sm text-red-800">
                                            <strong>Rejection Reason:</strong> {app.safePassRejectionReason}
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 flex-wrap">
                                    {app.hotelVillaSafePassStatus === 'pending' && (
                                        <>
                                            <button
                                                onClick={() => openModal(app, 'approve')}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => openModal(app, 'reject')}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reject
                                            </button>
                                        </>
                                    )}

                                    {app.hotelVillaSafePassStatus === 'approved' && (
                                        <button
                                            onClick={() => openModal(app, 'activate')}
                                            className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Shield className="w-4 h-4" />
                                            Activate SafePass
                                        </button>
                                    )}

                                    {app.hotelVillaSafePassStatus === 'active' && (
                                        <button
                                            onClick={() => openModal(app, 'revoke')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Revoke SafePass
                                        </button>
                                    )}

                                    {app.safePassCardUrl && (
                                        <a
                                            href={app.safePassCardUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Download className="w-4 h-4" />
                                            View Card
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Modal */}
            {showModal && selectedApplication && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">
                            {actionType === 'approve' && 'Approve Application'}
                            {actionType === 'reject' && 'Reject Application'}
                            {actionType === 'activate' && 'Activate SafePass'}
                            {actionType === 'revoke' && 'Revoke SafePass'}
                        </h3>

                        <p className="text-gray-600 mb-4">
                            {selectedApplication.entityName} ({selectedApplication.entityType})
                        </p>

                        {(actionType === 'reject' || actionType === 'revoke') && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Reason for {actionType === 'reject' ? 'Rejection' : 'Revocation'}
                                </label>
                                <textarea
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    rows={4}
                                    placeholder="Provide a clear reason..."
                                    required
                                />
                            </div>
                        )}

                        {actionType === 'activate' && (
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    SafePass Card URL (optional)
                                </label>
                                <input
                                    type="url"
                                    value={cardUrl}
                                    onChange={(e) => setCardUrl(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    placeholder="https://..."
                                />
                            </div>
                        )}

                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={closeModal}
                                disabled={processing}
                                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={processing}
                                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Processing...
                                    </>
                                ) : (
                                    'Confirm'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminSafePassManagement;
