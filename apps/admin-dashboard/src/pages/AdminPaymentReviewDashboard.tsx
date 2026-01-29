// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  DollarSign, 
  FileText, 
  RefreshCw, 
  AlertCircle,
  Download,
  Star,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import { paymentProofService } from '../../../src/services/paymentProofService';
import { showToast } from '../../../src/utils/showToastPortal';

interface PaymentProof {
  $id: string;
  transactionId: string;
  therapistId: string;
  therapistEmail: string;
  therapistName: string;
  paymentType: string;
  amount: number;
  currency: string;
  proofFileUrl: string;
  proofFileId: string;
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  expiresAt: string;
}

const AdminPaymentReviewDashboard: React.FC = () => {
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentProof[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState<PaymentProof | null>(null);
  const [selectedProof, setSelectedProof] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);
  const [statistics, setStatistics] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0
  });

  useEffect(() => {
    loadPaymentProofs();
    loadStatistics();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [paymentProofs, statusFilter, searchQuery]);

  const loadPaymentProofs = async () => {
    try {
      setLoading(true);
      const data = await paymentProofService.getPendingPaymentProofs();
      setPaymentProofs(data);
    } catch (error: any) {
      console.error('Failed to load payment proofs:', error);
      showToast('❌ Failed to load payment proofs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const stats = await paymentProofService.getPaymentStatistics();
      setStatistics(stats);
    } catch (error: any) {
      console.error('Failed to load statistics:', error);
    }
  };

  const filterPayments = () => {
    let filtered = [...paymentProofs];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.therapistName.toLowerCase().includes(query) ||
        p.therapistEmail.toLowerCase().includes(query) ||
        p.transactionId.toLowerCase().includes(query) ||
        p.paymentType.toLowerCase().includes(query)
      );
    }

    setFilteredPayments(filtered);
  };

  const handleApprove = async (payment: PaymentProof) => {
    if (!confirm(`Approve payment from ${payment.therapistName}?\n\nAmount: ${payment.currency} ${payment.amount.toLocaleString()}\n\nThis will activate their premium status.`)) {
      return;
    }

    setProcessing(true);
    try {
      console.log('✅ Approving payment for:', payment.therapistName);
      
      await paymentProofService.updatePaymentStatus(
        payment.$id,
        'approved',
        'admin', // Should be actual admin user ID
        undefined
      );
      
      showToast('✅ Payment approved successfully!', 'success');
      await loadPaymentProofs();
      await loadStatistics();
      
    } catch (error: any) {
      console.error('Failed to approve payment:', error);
      showToast('❌ Failed to approve payment', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectionReason.trim()) {
      showToast('❌ Please provide a rejection reason', 'error');
      return;
    }

    setProcessing(true);
    try {
      console.log('❌ Rejecting payment for:', selectedPayment.therapistName);
      
      await paymentProofService.updatePaymentStatus(
        selectedPayment.$id,
        'rejected',
        'admin', // Should be actual admin user ID
        rejectionReason
      );
      
      showToast('✅ Payment rejected with reason provided', 'success');
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectionReason('');
      
      await loadPaymentProofs();
      await loadStatistics();
      
    } catch (error: any) {
      console.error('Failed to reject payment:', error);
      showToast('❌ Failed to reject payment', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const handleRejectClick = (payment: PaymentProof) => {
    setSelectedPayment(payment);
    setShowRejectModal(true);
    setRejectionReason('');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getPaymentTypeDisplay = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'membership_upgrade': 'Premium Membership',
      'commission_payment': 'Commission Payment',
      'premium_feature': 'Premium Feature'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Payment Review Dashboard</h1>
              <p className="text-gray-600 mt-2">Review and approve payment proof submissions</p>
            </div>
            <button
              onClick={() => {
                loadPaymentProofs();
                loadStatistics();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.pending}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statistics.approved}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statistics.rejected}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Value</p>
                <p className="text-2xl font-bold text-orange-600">
                  IDR {statistics.totalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, email, or transaction ID..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status Filter</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Proofs List */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Payment Submissions ({filteredPayments.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-500 animate-pulse" />
                <span className="text-gray-600">Loading payment proofs...</span>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-8 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">No payment proofs found</p>
              <p className="text-sm text-gray-500">Try adjusting your filters or refresh the page</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <div key={payment.$id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Payment Info */}
                    <div className="lg:col-span-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{payment.therapistName}</h4>
                          <p className="text-sm text-gray-600">{payment.therapistEmail}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>ID: {payment.transactionId}</span>
                            <span>•</span>
                            <span>{formatDate(payment.submittedAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Payment Details */}
                    <div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {payment.currency} {payment.amount.toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{getPaymentTypeDisplay(payment.paymentType)}</p>
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium border ${getStatusColor(payment.status)}`}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setSelectedProof(payment.proofFileUrl)}
                          className="w-full py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View Proof
                        </button>

                        {payment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(payment)}
                              disabled={processing}
                              className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(payment)}
                              disabled={processing}
                              className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </>
                        )}

                        {payment.notes && (
                          <button
                            onClick={() => alert(`Notes: ${payment.notes}`)}
                            className="w-full py-2 px-4 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            View Notes
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Rejection Reason */}
                  {payment.status === 'rejected' && payment.rejectionReason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-800">Rejection Reason:</p>
                          <p className="text-sm text-red-700">{payment.rejectionReason}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Image Preview Modal */}
        {selectedProof && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Payment Proof</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.open(selectedProof, '_blank')}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setSelectedProof(null)}
                    className="p-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                <img 
                  src={selectedProof} 
                  alt="Payment proof" 
                  className="w-full h-auto rounded-lg shadow-lg"
                />
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Payment</h3>
              <p className="text-sm text-gray-600 mb-4">
                Please provide a reason for rejecting this payment proof. This will be sent to the therapist.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-red-500 focus:outline-none resize-none mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setSelectedPayment(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || processing}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? 'Rejecting...' : 'Reject Payment'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPaymentReviewDashboard;