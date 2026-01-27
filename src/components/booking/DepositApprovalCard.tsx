import React, { useState } from 'react';
import { CheckCircle, XCircle, Eye, MessageSquare, Clock, AlertTriangle, CreditCard } from 'lucide-react';

interface DepositApprovalCardProps {
  booking: {
    $id: string;
    customerName: string;
    customerPhone: string;
    serviceType: string;
    duration: number;
    price: number;
    location: string;
    date: string;
    time: string;
    status: string;
    depositAmount: number;
    paymentProofUrl: string;
    paymentProofUploadedAt: string;
    depositNotes?: string;
  };
  onApproveDeposit: (bookingId: string) => Promise<void>;
  onRejectDeposit: (bookingId: string, reason: string) => Promise<void>;
  onRequestReupload: (bookingId: string, message: string) => Promise<void>;
  language: 'en' | 'id';
}

const DepositApprovalCard: React.FC<DepositApprovalCardProps> = ({
  booking,
  onApproveDeposit,
  onRejectDeposit,
  onRequestReupload,
  language = 'id'
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showReuploadModal, setShowReuploadModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [reuploadMessage, setReuploadMessage] = useState('');

  const labels = {
    en: {
      depositSubmitted: 'Deposit Proof Submitted',
      customerPaid: 'Customer paid deposit',
      viewProof: 'View Proof',
      approveDeposit: 'Approve Deposit',
      rejectDeposit: 'Reject Deposit',
      requestReupload: 'Request Re-upload',
      uploadedAt: 'Uploaded at',
      depositAmount: 'Deposit Amount',
      notes: 'Customer Notes',
      approve: 'Approve',
      reject: 'Reject',
      requestNew: 'Request New Upload',
      cancel: 'Cancel',
      rejectReason: 'Rejection Reason',
      reuploadReason: 'Re-upload Request Message',
      processing: 'Processing...'
    },
    id: {
      depositSubmitted: 'Bukti Deposit Diterima',
      customerPaid: 'Pelanggan membayar deposit',
      viewProof: 'Lihat Bukti',
      approveDeposit: 'Setujui Deposit',
      rejectDeposit: 'Tolak Deposit',
      requestReupload: 'Minta Upload Ulang',
      uploadedAt: 'Diupload pada',
      depositAmount: 'Jumlah Deposit',
      notes: 'Catatan Pelanggan',
      approve: 'Setujui',
      reject: 'Tolak',
      requestNew: 'Minta Upload Baru',
      cancel: 'Batal',
      rejectReason: 'Alasan Penolakan',
      reuploadReason: 'Pesan Permintaan Upload Ulang',
      processing: 'Memproses...'
    }
  };

  const currentLabels = labels[language];

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApproveDeposit(booking.$id);
    } catch (error) {
      console.error('Failed to approve deposit:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) return;
    
    setIsProcessing(true);
    try {
      await onRejectDeposit(booking.$id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject deposit:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestReupload = async () => {
    if (!reuploadMessage.trim()) return;
    
    setIsProcessing(true);
    try {
      await onRequestReupload(booking.$id, reuploadMessage);
      setShowReuploadModal(false);
      setReuploadMessage('');
    } catch (error) {
      console.error('Failed to request reupload:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-orange-400 rounded-xl p-4 mb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-orange-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-orange-900">{currentLabels.depositSubmitted}</h4>
            <p className="text-sm text-orange-700">{currentLabels.customerPaid}</p>
          </div>
          <div className="text-right">
            <div className="bg-orange-200 text-orange-800 px-3 py-1 rounded-full text-xs font-bold">
              PENDING APPROVAL
            </div>
            <p className="text-xs text-orange-600 mt-1">
              {currentLabels.uploadedAt}: {new Date(booking.paymentProofUploadedAt).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Deposit Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-white/80 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{currentLabels.depositAmount}:</span>
              <span className="font-bold text-green-700">
                Rp {booking.depositAmount.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-xs text-gray-500">Remaining:</span>
              <span className="text-sm font-medium text-gray-700">
                Rp {(booking.price - booking.depositAmount).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          <div className="bg-white/80 rounded-lg p-3">
            <button
              onClick={() => window.open(booking.paymentProofUrl, '_blank')}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              {currentLabels.viewProof}
            </button>
          </div>
        </div>

        {/* Customer Notes */}
        {booking.depositNotes && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <h5 className="text-sm font-semibold text-blue-900 mb-1">{currentLabels.notes}:</h5>
            <p className="text-sm text-blue-800">{booking.depositNotes}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={handleApprove}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {isProcessing ? currentLabels.processing : currentLabels.approve}
          </button>

          <button
            onClick={() => setShowReuploadModal(true)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 bg-yellow-600 text-white py-3 rounded-xl hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            {currentLabels.requestNew}
          </button>

          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isProcessing}
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
          >
            <XCircle className="w-4 h-4" />
            {currentLabels.reject}
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{currentLabels.rejectDeposit}</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentLabels.rejectReason} *
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                rows={4}
                placeholder={language === 'en' 
                  ? "Explain why you're rejecting this deposit proof..." 
                  : "Jelaskan mengapa Anda menolak bukti deposit ini..."
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {currentLabels.cancel}
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isProcessing}
                className="flex-1 bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isProcessing ? currentLabels.processing : currentLabels.reject}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-upload Request Modal */}
      {showReuploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">{currentLabels.requestReupload}</h3>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {currentLabels.reuploadReason} *
              </label>
              <textarea
                value={reuploadMessage}
                onChange={(e) => setReuploadMessage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                rows={4}
                placeholder={language === 'en' 
                  ? "Ask customer to upload a clearer photo or provide specific instructions..." 
                  : "Minta pelanggan upload foto yang lebih jelas atau berikan instruksi spesifik..."
                }
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReuploadModal(false);
                  setReuploadMessage('');
                }}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                {currentLabels.cancel}
              </button>
              <button
                onClick={handleRequestReupload}
                disabled={!reuploadMessage.trim() || isProcessing}
                className="flex-1 bg-yellow-600 text-white py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                {isProcessing ? currentLabels.processing : currentLabels.requestNew}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DepositApprovalCard;