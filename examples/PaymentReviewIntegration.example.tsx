// @ts-nocheck - Integration example for existing dashboards
import React, { useState } from 'react';
import { CreditCard, Upload, FileCheck } from 'lucide-react';
import PaymentReviewProcess from '../src/components/PaymentReviewProcess';
import { paymentProofService } from '../src/services/paymentProofService';
import { showToast } from '../src/utils/showToastPortal';

/**
 * Example: Integration with Therapist Dashboard
 * Shows how to add payment review process to existing pages
 */

interface PaymentUpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  therapist: any;
  upgradeType: 'premium' | 'plus' | 'elite';
}

const PaymentUpgradeModal: React.FC<PaymentUpgradeModalProps> = ({
  isOpen,
  onClose,
  therapist,
  upgradeType
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const upgradeDetails = {
    premium: { amount: 150000, name: 'Premium Membership' },
    plus: { amount: 300000, name: 'Plus Membership' },
    elite: { amount: 500000, name: 'Elite Membership' }
  };

  const currentUpgrade = upgradeDetails[upgradeType];

  const handlePaymentSubmit = async (file: File, additionalData?: { notes?: string }) => {
    setIsSubmitting(true);
    try {
      // Upload file and create payment record
      const uploadedFile = await paymentProofService.uploadFile(file, 'membership-upgrades');
      
      const submission = await paymentProofService.submitPaymentProof({
        therapistId: therapist.id,
        therapistEmail: therapist.email,
        therapistName: therapist.name,
        proofFileUrl: uploadedFile.url,
        proofFileId: uploadedFile.id,
        paymentType: 'membership_upgrade',
        amount: currentUpgrade.amount,
        currency: 'IDR',
        notes: additionalData?.notes || '',
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });

      showToast(`✅ ${currentUpgrade.name} payment submitted successfully!`, 'success');
      onClose();
      
    } catch (error: any) {
      throw error; // PaymentReviewProcess will handle the error display
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{currentUpgrade.name} Upgrade</h2>
              <p className="text-sm text-gray-600">Upload payment proof for verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          <PaymentReviewProcess
            onSubmit={handlePaymentSubmit}
            isSubmitting={isSubmitting}
            paymentDetails={{
              amount: currentUpgrade.amount,
              currency: 'IDR',
              description: currentUpgrade.name,
              bankDetails: {
                bankName: 'Bank Central Asia (BCA)',
                accountName: 'MASSAGE PLATFORM INDONESIA',
                accountNumber: '1234567890'
              }
            }}
            title={`${currentUpgrade.name} Payment`}
            subtitle="Submit your payment proof to upgrade your membership"
            language="id"
            onBack={onClose}
          />
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Dashboard Integration
 * Shows how to integrate payment upload into existing dashboard buttons
 */

const TherapistDashboardWithPayment: React.FC = () => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [upgradeType, setUpgradeType] = useState<'premium' | 'plus' | 'elite'>('premium');
  const [therapist, setTherapist] = useState({
    id: 'therapist_123',
    email: 'therapist@example.com',
    name: 'John Doe',
    currentTier: 'basic'
  });

  const handleUpgradeClick = (type: 'premium' | 'plus' | 'elite') => {
    setUpgradeType(type);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Therapist Dashboard</h1>
        
        {/* Existing dashboard content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Current membership status */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Membership</h3>
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileCheck className="w-8 h-8 text-gray-600" />
              </div>
              <p className="font-semibold text-gray-900 capitalize">{therapist.currentTier}</p>
              <p className="text-sm text-gray-600">Membership</p>
            </div>
          </div>

          {/* Upgrade options */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade to Premium</h3>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600 mb-2">IDR 150,000</p>
              <button
                onClick={() => handleUpgradeClick('premium')}
                className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Payment
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upgrade to Elite</h3>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 mb-2">IDR 500,000</p>
              <button
                onClick={() => handleUpgradeClick('elite')}
                className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Upload className="w-4 h-4 inline mr-2" />
                Upload Payment
              </button>
            </div>
          </div>
        </div>

        {/* More dashboard content... */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
          <p className="text-gray-600">Your recent bookings and activities...</p>
        </div>
      </div>

      {/* Payment Upload Modal */}
      <PaymentUpgradeModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        therapist={therapist}
        upgradeType={upgradeType}
      />
    </div>
  );
};

/**
 * Example: Standalone Page Implementation
 * Shows how to create a dedicated payment page
 */

const StandalonePaymentPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (file: File, additionalData?: { notes?: string }) => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      showToast('✅ Payment proof submitted successfully!', 'success');
      
      // Redirect or navigate
      window.location.href = '/dashboard';
      
    } catch (error) {
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PaymentReviewProcess
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
      maxFileSize={5}
      acceptedFormats={['image/jpeg', 'image/png', 'image/webp']}
      paymentDetails={{
        amount: 299000,
        currency: 'IDR',
        description: 'Premium Membership Upgrade',
        bankDetails: {
          bankName: 'Bank Central Asia (BCA)',
          accountName: 'MASSAGE PLATFORM INDONESIA',
          accountNumber: '1234567890'
        }
      }}
      title="Complete Your Payment"
      subtitle="Upload your payment proof to activate premium features"
      language="id"
      onBack={() => window.history.back()}
    />
  );
};

/**
 * Example: API Integration Hook
 * Custom hook for handling payment submissions
 */

const usePaymentSubmission = (therapistId: string) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  const submitPayment = async (file: File, paymentData: any) => {
    setIsSubmitting(true);
    try {
      const result = await paymentProofService.submitPaymentProof({
        therapistId,
        ...paymentData,
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });
      
      // Update local state
      setSubmissions(prev => [result, ...prev]);
      
      return result;
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSubmissionHistory = async () => {
    const history = await paymentProofService.getPaymentStatus(therapistId);
    setSubmissions(history);
  };

  return {
    isSubmitting,
    submissions,
    submitPayment,
    getSubmissionHistory
  };
};

// Export all examples
export {
  PaymentUpgradeModal,
  TherapistDashboardWithPayment,
  StandalonePaymentPage,
  usePaymentSubmission
};