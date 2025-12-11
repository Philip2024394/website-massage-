import React, { useState, useEffect } from 'react';
import { FileCheck, CheckCircle, XCircle, Search, Eye, AlertCircle } from 'lucide-react';
import { therapistService } from '@shared/appwriteService';

interface TherapistKtpData {
  $id: string;
  name: string;
  email: string;
  bankName?: string;
  accountName?: string;
  accountNumber?: string;
  ktpPhotoUrl?: string;
  ktpVerified?: boolean;
  ktpVerifiedAt?: string;
  ktpVerifiedBy?: string;
}

const AdminKtpVerification: React.FC = () => {
  const [therapists, setTherapists] = useState<TherapistKtpData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedKtp, setSelectedKtp] = useState<TherapistKtpData | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    loadTherapists();
  }, []);

  const loadTherapists = async () => {
    try {
      const data = await therapistService.getAll();
      // Filter therapists who have uploaded KTP
      const withKtp = data.filter((t: any) => t.ktpPhotoUrl);
      setTherapists(withKtp);
    } catch (error) {
      console.error('Failed to load therapists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (therapistId: string, approved: boolean, reason?: string) => {
    setVerifying(true);
    try {
      await therapistService.update(therapistId, {
        ktpVerified: approved,
        ktpVerifiedAt: new Date().toISOString(),
        ktpVerifiedBy: 'admin', // Replace with actual admin ID
        ...(reason && { ktpVerificationReason: reason })
      });
      
      alert(approved ? '✅ KTP Verified Successfully!' : '❌ KTP Verification Declined');
      await loadTherapists();
      setSelectedKtp(null);
    } catch (error) {
      console.error('Failed to verify KTP:', error);
      alert('Failed to update verification status');
    } finally {
      setVerifying(false);
    }
  };

  const filteredTherapists = therapists.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.accountName && t.accountName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingCount = therapists.filter(t => !t.ktpVerified).length;
  const verifiedCount = therapists.filter(t => t.ktpVerified).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center gap-4 mb-4">
          <FileCheck className="w-10 h-10 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">KTP Verification Center</h1>
            <p className="text-gray-600">Review and verify therapist Indonesian ID cards (KTP)</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600">Total Uploads</div>
            <div className="text-3xl font-bold text-gray-900">{therapists.length}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600">Pending Review</div>
            <div className="text-3xl font-bold text-orange-600">{pendingCount}</div>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <div className="text-sm text-gray-600">Verified</div>
            <div className="text-3xl font-bold text-green-600">{verifiedCount}</div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or account name..."
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Therapist List */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading therapists...</p>
          </div>
        ) : filteredTherapists.length === 0 ? (
          <div className="bg-white rounded-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No therapists found with uploaded KTP</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredTherapists.map((therapist) => (
              <div key={therapist.$id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{therapist.name}</h3>
                      {therapist.ktpVerified ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                          <CheckCircle className="w-4 h-4" />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-semibold">
                          <AlertCircle className="w-4 h-4" />
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">📧 {therapist.email}</p>
                    
                    {/* Bank Details */}
                    {therapist.bankName && (
                      <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2">Bank Details:</h4>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Bank:</span>
                            <p className="font-semibold text-gray-900">{therapist.bankName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Account Name:</span>
                            <p className="font-semibold text-gray-900">{therapist.accountName}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Account Number:</span>
                            <p className="font-mono font-semibold text-gray-900">{therapist.accountNumber}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {therapist.ktpVerifiedAt && (
                      <p className="text-xs text-gray-500 mt-2">
                        Verified on {new Date(therapist.ktpVerifiedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => setSelectedKtp(therapist)}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    View KTP
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* KTP Modal */}
      {selectedKtp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedKtp.name}</h2>
                  <p className="text-gray-600">{selectedKtp.email}</p>
                </div>
                <button
                  onClick={() => setSelectedKtp(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* KTP Image */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">KTP ID Card Photo:</h3>
                <img
                  src={selectedKtp.ktpPhotoUrl}
                  alt="KTP ID Card"
                  className="w-full rounded-lg border-2 border-gray-300"
                />
              </div>

              {/* Bank Details */}
              {selectedKtp.bankName && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Verify Bank Details Match KTP:</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Bank Name:</label>
                      <p className="font-semibold text-gray-900">{selectedKtp.bankName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Account Name (should match KTP):</label>
                      <p className="font-semibold text-gray-900 text-lg">{selectedKtp.accountName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Account Number:</label>
                      <p className="font-mono font-semibold text-gray-900">{selectedKtp.accountNumber}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Actions */}
              {!selectedKtp.ktpVerified && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVerify(selectedKtp.$id, true)}
                    disabled={verifying}
                    className="flex-1 px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-6 h-6" />
                    Approve - KTP Matches Bank Details
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Enter reason for declining (will be shown to therapist):');
                      if (reason) handleVerify(selectedKtp.$id, false, reason);
                    }}
                    disabled={verifying}
                    className="flex-1 px-6 py-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 font-semibold flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-6 h-6" />
                    Decline - Does Not Match
                  </button>
                </div>
              )}

              {selectedKtp.ktpVerified && (
                <div className="flex items-center justify-center gap-2 p-4 bg-green-100 text-green-800 rounded-lg">
                  <CheckCircle className="w-6 h-6" />
                  <span className="font-semibold">This KTP has been verified</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminKtpVerification;
