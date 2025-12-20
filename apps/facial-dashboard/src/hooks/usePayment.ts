import { useState } from 'react';
import { imageUploadService } from '../../../../lib/appwriteService';
import { showToast } from '../../../../utils/showToastPortal';

interface UsePaymentReturn {
    paymentProof: File | null;
    paymentProofPreview: string | null;
    uploadingPayment: boolean;
    setPaymentProof: (file: File | null) => void;
    setPaymentProofPreview: (url: string | null) => void;
    handlePaymentProofChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    uploadPaymentProof: () => Promise<string | null>;
}

export const usePayment = (): UsePaymentReturn => {
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null);
    const [uploadingPayment, setUploadingPayment] = useState(false);

    const handlePaymentProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showToast('❌ Please upload an image file', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('❌ Image must be less than 5MB', 'error');
            return;
        }

        setPaymentProof(file);

        // Generate preview
        const reader = new FileReader();
        reader.onload = (event) => {
            setPaymentProofPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const uploadPaymentProof = async (): Promise<string | null> => {
        if (!paymentProofPreview) {
            showToast('❌ No payment proof to upload', 'error');
            return null;
        }

        setUploadingPayment(true);
        try {
            console.log('📤 Uploading payment proof...');
            const paymentProofUrl = await imageUploadService.uploadProfileImage(paymentProofPreview);
            console.log('✅ Payment proof uploaded:', paymentProofUrl);
            return paymentProofUrl;
        } catch (error: any) {
            console.error('❌ Payment proof upload failed:', error);
            showToast('❌ Failed to upload payment proof. Please try again.', 'error');
            return null;
        } finally {
            setUploadingPayment(false);
        }
    };

    return {
        paymentProof,
        paymentProofPreview,
        uploadingPayment,
        setPaymentProof,
        setPaymentProofPreview,
        handlePaymentProofChange,
        uploadPaymentProof
    };
};
