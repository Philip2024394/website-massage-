// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import PaymentReviewProcess from '../../components/PaymentReviewProcess';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { showToast } from '../../utils/showToastPortal';
import { paymentProofService } from '../../services/paymentProofService';
import type { Therapist } from '../../types';

interface PaymentReviewPageProps {
  therapist: Therapist | null;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const PaymentReviewPage: React.FC<PaymentReviewPageProps> = ({
  therapist,
  onBack,
  onNavigate,
  onLogout,
  language = 'id'
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitPaymentProof = async (file: File, additionalData?: { notes?: string }) => {
    if (!therapist) {
      throw new Error('No therapist data found');
    }

    setIsSubmitting(true);
    try {
      console.log('📤 Submitting payment proof for review...');
      
      // Step 1: Upload file to storage
      const uploadedFile = await paymentProofService.uploadFile(file, 'payment-proofs');
      console.log('✅ File uploaded to storage:', uploadedFile.url);

      // Step 2: Create payment confirmation record
      const paymentConfirmation = await paymentProofService.submitPaymentProof({
        therapistId: String(therapist.$id || therapist.id),
        therapistEmail: therapist.email,
        therapistName: therapist.name,
        proofFileUrl: uploadedFile.url,
        proofFileId: uploadedFile.id,
        notes: additionalData?.notes || '',
        paymentType: 'membership_upgrade',
        amount: 150000, // Example amount - should be dynamic
        currency: 'IDR',
        submittedAt: new Date().toISOString(),
        status: 'pending'
      });

      console.log('✅ Payment confirmation created:', paymentConfirmation.$id);
      
      showToast('✅ Payment proof submitted successfully! Admin will review within 24-48 hours.', 'success');
      
      // Navigate back after successful submission
      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error: any) {
      console.error('❌ Failed to submit payment proof:', error);
      throw new Error(error.message || 'Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  // Payment details for the current submission
  const paymentDetails = {
    amount: 150000,
    currency: 'IDR',
    description: 'Premium Membership Upgrade',
    bankDetails: {
      bankName: 'Bank Central Asia (BCA)',
      accountName: 'MASSAGE PLATFORM INDONESIA',
      accountNumber: '1234567890'
    }
  };

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="payment-review"
      onNavigate={handleNavigate}
      language={language}
      onLogout={onLogout}
    >
      <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))]">
        <PaymentReviewProcess
          onSubmit={handleSubmitPaymentProof}
          isSubmitting={isSubmitting}
          maxFileSize={5}
          acceptedFormats={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
          paymentDetails={paymentDetails}
          title={language === 'en' ? 'Premium Upgrade Payment' : 'Pembayaran Upgrade Premium'}
          subtitle={language === 'en' 
            ? 'Submit your payment proof to upgrade to Premium membership' 
            : 'Kirim bukti pembayaran untuk upgrade ke membership Premium'
          }
          language={language}
          onBack={onBack}
        />
      </div>
    </TherapistLayout>
  );
};

export default PaymentReviewPage;