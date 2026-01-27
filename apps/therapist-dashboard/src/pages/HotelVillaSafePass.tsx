// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState, useEffect } from 'react';
import { 
  Shield, Upload, FileCheck, AlertCircle, CheckCircle2, 
  CreditCard, User, MapPin, Calendar, Building, Eye,
  DollarSign, Clock, X, Download
} from 'lucide-react';
import TherapistPageHeader from '../components/TherapistPageHeader';
import { therapistService } from '../../../../src/lib/appwriteService';
import { showToast } from '../../../../src/utils/showToastPortal';
import { useTranslations } from '../../../../src/lib/useTranslations';
import type { Therapist } from '../../../../src/types';

interface HotelVillaSafePassProps {
  therapist: Therapist | null;
  onBack: () => void;
  language?: 'en' | 'id';
}

interface HotelVillaLetter {
  id: string;
  fileName: string;
  url: string;
  hotelVillaName: string;
  uploadedAt: string;
  fileSize?: number;
}

const HotelVillaSafePass: React.FC<HotelVillaSafePassProps> = ({ 
  therapist, 
  onBack, 
  language = 'id' 
}) => {
  const { t } = useTranslations(language);
  const [letters, setLetters] = useState<HotelVillaLetter[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(therapist?.hotelVillaSafePassStatus || 'pending');
  const [hotelVillaName, setHotelVillaName] = useState('');
  const [showCardPreview, setShowCardPreview] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    // Load existing letters from therapist data
    if (therapist?.hotelVillaLetters) {
      try {
        const parsedLetters = JSON.parse(therapist.hotelVillaLetters);
        setLetters(parsedLetters || []);
      } catch (error) {
        console.error('Error parsing hotel villa letters:', error);
        setLetters([]);
      }
    }
  }, [therapist]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !hotelVillaName.trim()) {
      if (!hotelVillaName.trim()) {
        showToast('⚠️ Please enter hotel/villa name', 'error');
      }
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      showToast('⚠️ Please upload PDF, JPG, or PNG file only', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('⚠️ File size must be less than 10MB', 'error');
      return;
    }

    // Check if we already have 3 letters
    if (letters.length >= 3) {
      showToast('⚠️ Maximum 3 recommendation letters allowed', 'error');
      return;
    }

    setUploading(true);
    try {
      console.log('🏨 [SAFE PASS SUBMITTED] Uploading letter for hotel/villa:', hotelVillaName);
      
      // Upload file using existing therapist service pattern
      const uploadResult = await therapistService.uploadHotelVillaLetter(
        String(therapist?.$id || therapist?.id),
        file,
        hotelVillaName
      );

      const newLetter: HotelVillaLetter = {
        id: `letter-${Date.now()}`,
        fileName: file.name,
        url: uploadResult.url,
        hotelVillaName: hotelVillaName.trim(),
        uploadedAt: new Date().toISOString(),
        fileSize: file.size
      };

      const updatedLetters = [...letters, newLetter];
      setLetters(updatedLetters);
      
      // Save to therapist data
      await therapistService.update(String(therapist?.$id || therapist?.id), {
        hotelVillaLetters: JSON.stringify(updatedLetters)
      });

      showToast('✅ ' + t('therapistDashboard.fileUploadSuccess'), 'success');
      setHotelVillaName('');
      
      // Clear file input
      e.target.value = '';
      
    } catch (error) {
      console.error('❌ Error uploading hotel villa letter:', error);
      showToast('❌ ' + t('therapistDashboard.fileUploadError'), 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLetter = async (letterId: string) => {
    const updatedLetters = letters.filter(letter => letter.id !== letterId);
    setLetters(updatedLetters);
    
    try {
      await therapistService.update(String(therapist?.$id || therapist?.id), {
        hotelVillaLetters: JSON.stringify(updatedLetters)
      });
      showToast('✅ Letter removed successfully', 'success');
    } catch (error) {
      console.error('Error removing letter:', error);
      showToast('❌ Error removing letter', 'error');
    }
  };

  const handleSubmitApplication = async () => {
    if (letters.length < 3) {
      showToast('⚠️ Please upload 3 recommendation letters', 'error');
      return;
    }

    if (!isProfileComplete()) {
      showToast('⚠️ Please complete your profile information first', 'error');
      return;
    }

    setSaving(true);
    try {
      console.log('🔍 [SAFE PASS UNDER REVIEW] Submitting application for therapist:', therapist?.name);
      
      await therapistService.update(String(therapist?.$id || therapist?.id), {
        hotelVillaSafePassStatus: 'pending',
        safePassSubmittedAt: new Date().toISOString(),
        hotelVillaLetters: JSON.stringify(letters)
      });

      setCurrentStatus('pending');
      showToast('✅ Safe Pass application submitted for review', 'success');
      
    } catch (error) {
      console.error('❌ Error submitting Safe Pass application:', error);
      showToast('❌ Error submitting application', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePayment = async () => {
    if (currentStatus !== 'approved') {
      showToast('⚠️ Payment is only available after admin approval', 'error');
      return;
    }

    setProcessingPayment(true);
    try {
      console.log('💳 [SAFE PASS PAYMENT COMPLETED] Processing payment for therapist:', therapist?.name);
      
      // Simulate payment processing (integrate with actual payment gateway)
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const paymentId = `SP-${Date.now()}`;
      const currentDate = new Date();
      const expiryDate = new Date();
      expiryDate.setFullYear(currentDate.getFullYear() + 1); // 1 year validity

      await therapistService.update(String(therapist?.$id || therapist?.id), {
        hotelVillaSafePassStatus: 'active',
        safePassPaymentId: paymentId,
        safePassIssuedAt: currentDate.toISOString(),
        safePassExpiry: expiryDate.toISOString(),
        safePassCardUrl: generateSafePassCard() // Generate card image URL
      });

      console.log('🪪 [SAFE PASS ACTIVE] Safe Pass activated for therapist:', therapist?.name);
      setCurrentStatus('active');
      showToast('✅ ' + t('therapistDashboard.paymentSuccess'), 'success');
      
    } catch (error) {
      console.error('❌ Error processing Safe Pass payment:', error);
      showToast('❌ Error processing payment', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };

  const isProfileComplete = () => {
    return !!(
      therapist?.name &&
      therapist?.ktpPhotoUrl &&
      therapist?.bankName &&
      therapist?.accountName &&
      therapist?.accountNumber
    );
  };

  const generateSafePassCard = () => {
    // Generate a placeholder Safe Pass card URL
    // In production, this would generate an actual card image with therapist details
    return `https://ik.imagekit.io/7grri5v7d/safe-pass-cards/SP-${therapist?.$id || therapist?.id}.png`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: t('therapistDashboard.pending') },
      approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle2, label: 'Approved - Payment Required' },
      active: { color: 'bg-green-100 text-green-800', icon: Shield, label: 'Active' },
      rejected: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: t('therapistDashboard.rejected') }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className="w-4 h-4" />
        {config.label}
      </div>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-white">
      <TherapistPageHeader 
        title="Hotel / Villa Safe Pass"
        onBack={onBack}
        language={language}
      />
      
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Certified Massage Therapists for Hotels & Villas
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Professional Safe Pass Certification Program
            </p>
          </div>
          
          {/* Safe Pass Image in Hero */}
          <div className="flex justify-center mb-6">
            <img 
              src="https://ik.imagekit.io/7grri5v7d/scaffolding_indastreetsssssss-removebg-preview.png" 
              alt="Hotel Villa Safe Pass Certification" 
              className="w-full max-w-3xl h-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-lg text-gray-600 mb-4">
              Get officially certified to provide spa and massage services at hotels and villas across Indonesia. 
              The Safe Pass is your professional credential for working in premium hospitality environments.
            </p>
            <div className="flex items-center justify-center gap-4 text-gray-700">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-600" />
                <span>Official Certification</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Admin Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-orange-600" />
                <span>Hotel Authorized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Hotels Choose IndaStreet Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            Why Hotels Choose <span className="text-orange-500">Inda</span><span className="text-gray-900">Street</span> Massage
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verified Professionals</h3>
              <p className="text-gray-600 text-sm">All therapists undergo strict Safe Pass certification and background checks</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Quality Guaranteed</h3>
              <p className="text-gray-600 text-sm">Premium spa services meeting international hospitality standards</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Hotel Ready</h3>
              <p className="text-gray-600 text-sm">Certified for professional conduct in luxury hotel and villa environments</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        {/* Information Section */}
        <div className="bg-gray-50 rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">What is Hotel / Villa Safe Pass?</h2>
          </div>

          <p className="text-gray-600 mb-6">{t('therapistDashboard.safePassDescription')}</p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Requirements */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Requirements</h3>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Upload 3 recommendation letters from different hotels or villas</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">All letters must be reviewed and approved by admin</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Complete profile verification (KTP, bank details)</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">Pay Safe Pass fee after admin approval (IDR 500,000)</span>
                </div>
              </div>
            </div>
            
            {/* Benefits */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
              <div className="space-y-2">
                <div className="text-sm text-gray-600">🏨 Legal authorization to work in hotels and villas</div>
                <div className="text-sm text-gray-600">🪪 Official Safe Pass card with your details</div>
                <div className="text-sm text-gray-600">🌟 Enhanced credibility with hotel partners</div>
                <div className="text-sm text-gray-600">💼 Access to premium hospitality bookings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Application Status</h2>
            {getStatusBadge(currentStatus)}
          </div>
          
          {currentStatus === 'rejected' && therapist?.safePassRejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-red-800">Application Rejected</p>
                  <p className="text-red-700 text-sm mt-1">{therapist.safePassRejectionReason}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Identity Information */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Identity Information</h2>
          </div>
          
          <p className="text-gray-600 mb-4">This information will be printed on your Safe Pass card</p>
          
          {!isProfileComplete() && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-yellow-800">Profile must be completed before Safe Pass approval</p>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="text-gray-900">{therapist?.name || '---'}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KTP Number
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="text-gray-900">{therapist?.ktpPhotoUrl ? '✅ Verified' : '❌ Missing'}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="text-gray-900">{therapist?.location || '---'}</span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bank Details
              </label>
              <div className="p-3 bg-gray-50 rounded-lg border">
                <span className="text-gray-900">
                  {therapist?.bankName && therapist?.accountName ? '✅ Complete' : '❌ Missing'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        {currentStatus !== 'active' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Upload className="w-5 h-5 text-purple-600" />
              </div>
            <h2 className="text-lg font-bold text-gray-900">{t('therapistDashboard.uploadLetter')}</h2>
            </div>
            
            <p className="text-gray-600 mb-6">{t('therapistDashboard.uploadLetterDesc')}</p>
            
            {/* Upload Form */}
            {letters.length < 3 && currentStatus !== 'approved' && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hotel/Villa Name
                    </label>
                    <input
                      type="text"
                      value={hotelVillaName}
                      onChange={(e) => setHotelVillaName(e.target.value)}
                      placeholder="Enter hotel/villa name"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Recommendation Letter
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="letter-upload"
                        disabled={uploading || !hotelVillaName.trim()}
                      />
                      <label
                        htmlFor="letter-upload"
                        className={`flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          uploading || !hotelVillaName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                        {uploading ? t('therapistDashboard.uploadInProgress') : t('therapistDashboard.selectFile')}
                      </label>
                      <span className="text-sm text-gray-500">{t('therapistDashboard.supportedFormats')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Uploaded Letters List */}
            {letters.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">Uploaded Letters ({letters.length}/3)</h3>
                {letters.map((letter, index) => (
                  <div key={letter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <FileCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{letter.hotelVillaName}</p>
                        <p className="text-sm text-gray-500">
                          {letter.fileName} 
                          {letter.fileSize && ` • ${formatFileSize(letter.fileSize)}`}
                        </p>
                        <p className="text-xs text-gray-400">
                          Uploaded {new Date(letter.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(letter.url, '_blank')}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                        title="View Letter"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {currentStatus !== 'approved' && (
                        <button
                          onClick={() => handleRemoveLetter(letter.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg"
                          title="Remove"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Submit Button */}
            {letters.length >= 3 && currentStatus === 'pending' && (
              <div className="pt-6 border-t">
                <button
                  onClick={handleSubmitApplication}
                  disabled={saving || !isProfileComplete()}
                  className="w-full bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      {t('therapistDashboard.processing')}
                    </>
                  ) : (
                    <>
                      <Shield className="w-5 h-5" />
                      {currentStatus === 'rejected' ? 'Resubmit Application' : 'Submit Application'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Payment Section */}
        {currentStatus === 'approved' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">{t('therapistDashboard.paymentRequired')}</h2>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">✅ Application Approved!</p>
                  <p className="text-green-700 text-sm mt-1">Your recommendation letters have been verified by our admin.</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-6">
              <div>
                <p className="font-semibold text-gray-900">Safe Pass Fee Payment</p>
                <p className="text-sm text-gray-600">One-time fee for Safe Pass processing and card issuance (Valid for 1 year)</p>
              </div>
              <div className="text-2xl font-bold text-green-600">IDR 500,000</div>
            </div>
            
            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className="w-full bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2"
            >
              {processingPayment ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t('therapistDashboard.processing')}
                </>
              ) : (
                <>
                  <DollarSign className="w-5 h-5" />
                  {t('therapistDashboard.payNow')}
                </>
              )}
            </button>
          </div>
        )}

        {/* Safe Pass Card Preview */}
        {currentStatus === 'active' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Safe Pass Card Preview</h2>
            </div>
            
            <p className="text-gray-600 mb-6">Your official Safe Pass card (issued after payment)</p>
            
            {/* Safe Pass Card Design */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-blue-600 to-purple-600 text-white p-6 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6" />
                  <span className="font-bold">SAFE PASS</span>
                </div>
                <div className="text-right text-xs opacity-75">
                  <div>Hotel & Villa</div>
                  <div>Indonesia</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div><strong>Name:</strong> {therapist?.name}</div>
                <div><strong>ID:</strong> SP-{therapist?.$id?.slice(-8) || 'XXXXXXXX'}</div>
                <div><strong>Location:</strong> {therapist?.location}</div>
                <div><strong>Valid Until:</strong> {therapist?.safePassExpiry ? new Date(therapist.safePassExpiry).toLocaleDateString() : '---'}</div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
                <div className="text-xs opacity-75">
                  Issued: {therapist?.safePassIssuedAt ? new Date(therapist.safePassIssuedAt).toLocaleDateString() : '---'}
                </div>
                <div className="w-8 h-8 bg-white/20 rounded flex items-center justify-center">
                  <Building className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center mt-6">
              <button
                onClick={() => setShowCardPreview(!showCardPreview)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Eye className="w-4 h-4" />
                View Safe Pass Card
              </button>
              <button
                onClick={() => therapist?.safePassCardUrl && window.open(therapist.safePassCardUrl, '_blank')}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                <Download className="w-4 h-4" />
                Download Card
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelVillaSafePass;