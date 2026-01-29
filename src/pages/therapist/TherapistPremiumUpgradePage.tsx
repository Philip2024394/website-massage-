// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { Crown, Upload, CheckCircle, AlertCircle, XCircle, CreditCard, Building2, User, Hash, Copy, Check } from 'lucide-react';
import { Therapist } from '../../types';
import { therapistService, imageUploadService, paymentConfirmationService, premiumPaymentsService } from '../../lib/appwriteService';
import { showToast } from '../../utils/showToastPortal';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { premiumHelp } from './constants/helpContent';

interface PremiumUpgradeProps {
  therapist: Therapist | null;
  onNavigate?: (page: string) => void;
}

// Admin payment details - these will be fetched from admin settings
interface AdminPaymentDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode?: string;
}

const PremiumUpgrade: React.FC<PremiumUpgradeProps> = ({ therapist, onNavigate }) => {
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string>('');
  const [adminPaymentDetails, setAdminPaymentDetails] = useState<AdminPaymentDetails>({
    bankName: 'BNI',
    accountName: 'Philip Francis O Farrell',
    accountNumber: '1354188005',
    swiftCode: 'BNINIDJA'
  });

  const isPremium = therapist?.membershipTier === 'premium';
  const hasPendingUpgrade = therapist?.premiumPaymentProof && !isPremium;

  useEffect(() => {
    console.log('🔍 PremiumUpgrade - Current therapist data:', {
      id: therapist?.$id,
      name: therapist?.name,
      membershipTier: therapist?.membershipTier,
      isPremium,
      premiumPaymentProof: therapist?.premiumPaymentProof ? 'exists' : 'none',
      premiumPaymentStatus: therapist?.premiumPaymentStatus
    });
  }, [therapist, isPremium]);

  useEffect(() => {
    // Load existing payment proof if available
    if (therapist?.premiumPaymentProof) {
      setPaymentProofPreview(therapist.premiumPaymentProof);
    }
  }, [therapist]);

  // Fetch admin bank details from Appwrite
  useEffect(() => {
    const fetchAdminSettings = async () => {
      try {
        const { databases } = await import('../../lib/appwrite');
        const response = await databases.listDocuments(
          '68f76ee1000e64ca8d05', // Your database ID
          'admin_settings', // Collection ID
          []
        );
        
        console.log('💳 Admin settings response:', response);
        
        if (response.documents.length > 0) {
          const settings = response.documents[0];
          console.log('💳 Admin settings document:', settings);
          console.log('💳 Field values:', {
            bankname: settings.bankname,
            bankaccountdetails: settings.bankaccountdetails,
            settingValue: settings.settingValue,
            description: settings.description
          });
          
          setAdminPaymentDetails({
            bankName: settings.bankname || 'BNI',
            accountName: settings.bankaccountdetails || 'Philip Francis O Farrell',
            accountNumber: settings.settingValue || '1354188005',
            swiftCode: settings.description || 'BNINIDJA'
          });
          console.log('✅ Bank details updated from Appwrite');
        } else {
          console.log('⚠️ No admin_settings documents found - using defaults');
        }
      } catch (error) {
        console.log('⚠️ Failed to fetch admin settings, using defaults:', error);
      }
    };
    
    fetchAdminSettings();
  }, []);

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showToast('⚠️ Please upload an image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast('⚠️ File size must be less than 5MB', 'error');
      return;
    }

    setPaymentProof(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentProofPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    showToast('✅ Payment proof selected', 'success');
  };

  const handleSubmit = async () => {
    // Validation checks
    if (!therapist) {
      showToast('❌ No therapist data found', 'error');
      return;
    }

    if (!paymentProof) {
      showToast('⚠️ Please select a payment proof file', 'error');
      return;
    }

    // Check internet connection
    if (!navigator.onLine) {
      showToast('❌ No internet connection. Please check your network and try again.', 'error');
      return;
    }

    setUploading(true);
    
    try {
      // Step 1: Upload payment proof to storage
      let paymentProofUrl = '';
      try {
        console.log('📤 Uploading payment proof...');
        paymentProofUrl = await imageUploadService.uploadImage(paymentProof, 'payment-proofs');
        console.log('✅ Payment proof uploaded successfully');
      } catch (error) {
        console.error('❌ Upload failed:', error);
        
        // Check for network errors
        if (!navigator.onLine) {
          showToast('❌ Lost internet connection. Please check your network and try again.', 'error');
        } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
          showToast('❌ Network error. Please check your internet connection and try again.', 'error');
        } else if (error.message?.includes('413') || error.message?.includes('large')) {
          showToast('❌ File is too large. Please use a smaller image (max 5MB).', 'error');
        } else {
          showToast('❌ Failed to upload payment proof. Please try again.', 'error');
        }
        
        setUploading(false);
        return;
      }

      // Step 2: ACTIVATE PREMIUM IMMEDIATELY (Admin reviews later)
      try {
        console.log('🎉 Activating premium features instantly...');
        
        const submittedAt = new Date().toISOString();
        
        // Update therapist membershipTier only
        await therapistService.update(String(therapist.$id || therapist.id), {
          membershipTier: 'premium', // INSTANT ACTIVATION
          premiumPaymentStatus: 'pending', // Keep these 3 fields since they exist
          premiumPaymentSubmittedAt: submittedAt
        });
        
        // Create premium payment record in separate collection
        await premiumPaymentsService.create({
          userId: String(therapist.$id || therapist.id),
          therapistId: String(therapist.$id || therapist.id),
          paymentAmount: 500000, // IDR 500,000
          currency: 'IDR',
          paymentProofUrl: paymentProofUrl,
          paymentStatus: 'pending',
          submittedAt: submittedAt
        });
        
        console.log('✅ Premium activated instantly');
      } catch (error) {
        console.error('❌ Failed to activate premium:', error);
        
        // Check for network errors
        if (!navigator.onLine) {
          showToast('❌ Lost internet connection. Please check your network and try again.', 'error');
        } else {
          showToast('❌ Failed to submit payment proof. Please try again.', 'error');
        }
        
        setUploading(false);
        return;
      }

      // Step 3: Create payment notification for admin dashboard (optional - legacy support)
      try {
        console.log('📋 Creating admin payment notification...');
        await paymentConfirmationService.submitPaymentProof({
          userId: String(therapist.$id || therapist.id),
          userEmail: therapist.email || '',
          userName: therapist.name || '',
          memberType: 'therapist',
          paymentType: 'membership',
          packageName: 'Premium',
          packageDuration: 'lifetime',
          amount: 500000, // IDR 500,000
          bankName: adminPaymentDetails.bankName,
          accountNumber: adminPaymentDetails.accountNumber,
          accountName: adminPaymentDetails.accountName,
          proofOfPaymentFile: paymentProof
        });
        console.log('✅ Admin notification created');
      } catch (error) {
        console.error('⚠️ Failed to create admin notification:', error);
        // Continue even if notification fails - payment is already recorded in premium_payments
      }

      // Success! Premium activated instantly
      showToast('✅ SUCCESS! Premium activated! All features unlocked 🎉', 'success');
      
      // Refresh therapist data
      window.dispatchEvent(new CustomEvent('refreshTherapistData'));
      
      // Reload page to show unlocked features
      setTimeout(async () => {
        try {
          const { softRecover } = await import('../../utils/softNavigation');
          softRecover();
        } catch {
          window.location.reload();
        }
      }, 2000);
      
      setPaymentProof(null);
      setPaymentProofPreview('');
      
    } catch (error) {
      console.error('❌ Unexpected error during submission:', error);
      
      // Final catch-all error handler
      if (!navigator.onLine) {
        showToast('❌ No internet connection. Please check your network and try again.', 'error');
      } else if (error.message?.includes('network') || error.message?.includes('fetch') || error.message?.includes('Failed to fetch')) {
        showToast('❌ Network error. Please check your internet connection and try again.', 'error');
      } else {
        showToast('❌ Failed to submit payment. Please check your internet connection and try again.', 'error');
      }
      
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    showToast(`✅ ${label} copied!`, 'success');
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <main className="min-h-screen bg-white pb-20 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              <div>
                <h2 className="text-black text-xl font-bold">Premium Upgrade</h2>
                <p className="text-gray-600 text-sm">Unlock premium features</p>
              </div>
            </div>
            <HelpTooltip {...premiumHelp.overview} position="left" size="md" />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isPremium ? (
            /* Already Premium */
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="text-lg font-bold text-black">Premium Active</h3>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                You have access to all premium features including custom service menus, 
                priority support, and advanced analytics.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p className="text-xs font-bold text-black uppercase tracking-wide">Active Features:</p>
                <ul className="text-xs text-gray-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Custom Service Menu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Priority Booking Display
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Advanced Analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Priority Customer Support
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                    Enhanced Profile Visibility
                  </li>
                </ul>
              </div>
            </div>
          ) : isPremium && therapist?.premiumPaymentStatus === 'pending' ? (
            /* Premium Active but Under Review */
            <div className="border-2 border-green-500 rounded-lg p-6 bg-green-50">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold text-black">Premium Active!</h3>
                  <p className="text-sm text-green-700 font-medium">All features unlocked</p>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <div className="animate-pulse">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-black mb-1">Payment Under Review</p>
                    <p className="text-xs text-gray-700">
                      Admin is verifying your payment proof. If payment is invalid, premium access will be revoked.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <p className="text-sm font-bold text-black mb-2">✅ Active Premium Features:</p>
                <ul className="text-xs text-gray-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Custom Service Menu
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Unlimited Busy Time (No 3-hour limit)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Customer WhatsApp Access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Discount Badges
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Auto-Offline Timer
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
                <p className="text-sm font-bold text-black mb-2">Payment Submitted:</p>
                <p className="text-sm text-gray-700">
                  {new Date(therapist.premiumPaymentSubmittedAt || Date.now()).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {paymentProofPreview && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <p className="text-xs font-bold text-black uppercase tracking-wide mb-3">Submitted Payment Proof:</p>
                  <img 
                    src={paymentProofPreview} 
                    alt="Payment Proof" 
                    className="w-full rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}

              <div className="mt-4 bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-xs text-gray-600">
                  <strong>Need help?</strong> Contact admin if payment hasn't been verified after 48 hours.
                </p>
              </div>
            </div>
          ) : therapist?.premiumPaymentStatus === 'declined' ? (
            /* Payment Declined - Allow Retry */
            <div className="border-2 border-red-500 rounded-lg p-6 bg-red-50">
              <div className="flex items-center gap-3 mb-4">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <h3 className="text-xl font-bold text-black">Payment Declined</h3>
                  <p className="text-sm text-red-700 font-medium">Please review and resubmit</p>
                </div>
              </div>

              {therapist?.premiumDeclineReason && (
                <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                  <p className="text-sm font-bold text-black mb-2">Reason for Decline:</p>
                  <p className="text-sm text-gray-700">{therapist.premiumDeclineReason}</p>
                </div>
              )}

              <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                <p className="text-sm font-bold text-black mb-2">Common reasons for decline:</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc ml-5">
                  <li>Incorrect payment amount</li>
                  <li>Unclear or incomplete payment proof</li>
                  <li>Wrong bank account details</li>
                  <li>Payment proof does not match requirements</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  // Reset payment status to allow resubmission
                  therapistService.update(String(therapist.$id || therapist.id), {
                    premiumPaymentStatus: null,
                    premiumPaymentProof: null,
                    premiumDeclineReason: null
                  }).then(async () => {
                    try {
                      const { softRecover } = await import('../../utils/softNavigation');
                      softRecover();
                    } catch {
                      window.location.reload();
                    }
                  });
                }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* BNI Payment Card */}
              <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
                <img 
                  src="https://ik.imagekit.io/7grri5v7d/bni_card-removebg-preview.png" 
                  alt="BNI Card" 
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Upload Instructions */}
              <div className="bg-white border border-gray-300 rounded-lg p-3 sm:p-5">
                <h3 className="text-sm sm:text-base font-bold text-black mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                  Payment Instructions
                </h3>
                <ol className="text-xs sm:text-sm text-gray-700 space-y-2 ml-5 list-decimal mb-4">
                  <li>Transfer the membership fee to the account details above</li>
                  <li>Take a clear screenshot or photo of the successful transaction</li>
                  <li>Upload the payment proof below</li>
                  <li>Click Submit to activate your premium membership</li>
                  <li>Your account will be activated immediately after submission</li>
                </ol>

                {/* Official Bank Details */}
                <div className="bg-white border-2 border-orange-300 rounded-lg p-2 sm:p-3 mt-3">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-2">⚠️ Official Payment Account Only</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-2">
                    <div>
                      <span className="text-gray-600 font-semibold">Bank:</span>
                      <p className="text-black font-bold">{adminPaymentDetails.bankName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-semibold">Account Number:</span>
                      <p className="text-black font-bold font-mono text-xs break-all">{adminPaymentDetails.accountNumber}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-semibold">Account Name:</span>
                      <p className="text-black font-bold text-xs">{adminPaymentDetails.accountName}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-semibold">SWIFT Code:</span>
                      <p className="text-black font-bold font-mono text-xs">{adminPaymentDetails.swiftCode}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                    <p className="text-xs text-red-700 font-semibold">
                      🛡️ <strong>Security Warning:</strong> Never pay for membership to any other account unless updated here. This is the ONLY official payment account. Report any suspicious payment requests immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* Upload Payment Proof */}
              <div className="border border-gray-200 rounded-lg p-5">
                <label className="text-sm font-bold text-black mb-3 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-orange-500" />
                  Upload Payment Proof *
                </label>
                
                <div className="space-y-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePaymentProofUpload}
                    className="hidden"
                    id="payment-proof-upload"
                  />
                  
                  {paymentProofPreview ? (
                    <div className="relative">
                      <img 
                        src={paymentProofPreview} 
                        alt="Payment Proof Preview" 
                        className="w-full rounded-lg border border-gray-200"
                      />
                      <button
                        onClick={() => {
                          setPaymentProof(null);
                          setPaymentProofPreview('');
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="payment-proof-upload"
                      className="flex flex-col items-center justify-center py-8 cursor-pointer bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-dashed border-gray-300"
                    >
                      <Upload className="w-10 h-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-700 font-medium">Click to upload payment proof</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
                    </label>
                  )}
                </div>

                <div className="mt-4 bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-700 font-medium mb-2">
                    Ensure your payment proof shows:
                  </p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      Account name and number
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      Transfer amount
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      Transaction date and time
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-orange-500 rounded-full"></span>
                      Transaction success status
                    </li>
                  </ul>
                </div>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={uploading || !paymentProofPreview}
                className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
                  uploading || !paymentProofPreview
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600'
                }`}
              >
                {uploading ? 'Submitting...' : 'Submit Payment Proof'}
              </button>

              {/* Premium Features */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h3 className="font-bold text-black mb-3 flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  Premium Features
                </h3>
                <ul className="text-sm text-gray-700 space-y-2.5">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong className="text-black">Custom Service Menu:</strong> Create unlimited services with custom pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong className="text-black">Priority Display:</strong> Appear higher in search results</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong className="text-black">Advanced Analytics:</strong> Detailed insights into your performance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong className="text-black">Priority Support:</strong> Fast-track customer support</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <span><strong className="text-black">Enhanced Visibility:</strong> Premium badge on your profile</span>
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default PremiumUpgrade;
