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
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Page Header with Online Hours */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Hotel & Villa Safe Pass Certification</h2>
              <p className="text-sm text-gray-600">Official certification for hotel & villa access</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}h</span>
            <span className="text-xs text-gray-500">this month</span>
          </div>
        </div>
      </div>
      
      {/* Hero Section - Minimalistic & Clean */}
      <section className="bg-white border-b border-orange-100">
        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Enlarged Safe Pass Image */}
          <div className="flex justify-center mb-8">
            <img 
              src="https://ik.imagekit.io/7grri5v7d/scaffolding_indastreetsssssss-removebg-preview.png" 
              alt="Hotel Villa Safe Pass Certification" 
              className="w-full max-w-4xl h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-300"
            />
          </div>
          
          {/* Clean Title */}
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Hotel & Villa Safe Pass
            </h1>
            <p className="text-lg text-gray-600">
              Professional certification for premium hospitality services
            </p>
            
            {/* Status Badges - Minimalistic */}
            <div className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Official</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Authorized</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section - Orange Theme */}
      <section className="py-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Verified</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Strict certification and background verification</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <CheckCircle2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Premium</h3>
              <p className="text-gray-600 text-sm leading-relaxed">International hospitality standards</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4">
                <Building className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2 text-lg">Certified</h3>
              <p className="text-gray-600 text-sm leading-relaxed">Luxury hotel and villa authorized</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Application Status - Minimalistic Card */}
        <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Application Status</h2>
              {getStatusBadge(currentStatus)}
            </div>
          </div>
          
          <div className="p-6">
            {currentStatus === 'rejected' && therapist?.safePassRejectionReason && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">Application Rejected</p>
                    <p className="text-red-700 text-sm mt-1">{therapist.safePassRejectionReason}</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Requirements Grid - Clean Layout */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Requirements</h3>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-700">3 recommendation letters</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-700">Admin approval required</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-700">Complete profile verification</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 text-orange-600" />
                  </div>
                  <span className="text-sm text-gray-700">IDR 500,000 fee</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Benefits</h3>
                <div className="text-sm text-gray-700 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Hotel/villa authorization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Official Safe Pass card</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Enhanced credibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-orange-500">•</span>
                    <span>Premium bookings access</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Information - Minimal Card */}
        <div className="bg-white rounded-2xl border border-orange-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Identity Information</h2>
              <p className="text-sm text-gray-600">Will appear on your Safe Pass card</p>
            </div>
          </div>
          
          {!isProfileComplete() && (
            <div className="bg-amber-50 border-l-4 border-amber-500 rounded-r-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <p className="text-amber-900 text-sm">Profile must be completed before Safe Pass approval</p>
              </div>
            </div>
          )}
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-900 font-medium">{therapist?.name || '---'}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">KTP Status</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className={`font-medium ${therapist?.ktpPhotoUrl ? 'text-green-600' : 'text-red-600'}`}>
                  {therapist?.ktpPhotoUrl ? '✓ Verified' : '✗ Missing'}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Address</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-gray-900 font-medium">{therapist?.location || '---'}</span>
              </div>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bank Details</label>
              <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className={`font-medium ${therapist?.bankName && therapist?.accountName ? 'text-green-600' : 'text-red-600'}`}>
                  {therapist?.bankName && therapist?.accountName ? '✓ Complete' : '✗ Missing'}
                </span>
              </div>
            </div>
          </div>
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

        {/* Upload Section - Clean Orange Theme */}
        {currentStatus !== 'active' && (
          <div className="bg-white rounded-2xl border border-orange-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{t('therapistDashboard.uploadLetter')}</h2>
                <p className="text-sm text-gray-600">{t('therapistDashboard.uploadLetterDesc')}</p>
              </div>
            </div>
            
            {/* Upload Form - Minimal Design */}
            {letters.length < 3 && currentStatus !== 'approved' && (
              <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 mb-6 bg-orange-50/30">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                      Hotel/Villa Name
                    </label>
                    <input
                      type="text"
                      value={hotelVillaName}
                      onChange={(e) => setHotelVillaName(e.target.value)}
                      placeholder="Enter hotel/villa name"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                      Recommendation Letter
                    </label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
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
                        className={`flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl cursor-pointer hover:from-orange-600 hover:to-orange-700 transition-all shadow-sm font-medium ${
                          uploading || !hotelVillaName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <Upload className="w-5 h-5" />
                        {uploading ? t('therapistDashboard.uploadInProgress') : t('therapistDashboard.selectFile')}
                      </label>
                      <span className="text-xs text-gray-500">{t('therapistDashboard.supportedFormats')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Uploaded Letters List - Clean Cards */}
            {letters.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">Uploaded Letters</h3>
                  <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
                    {letters.length}/3
                  </span>
                </div>
                {letters.map((letter, index) => (
                  <div key={letter.id} className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <FileCheck className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{letter.hotelVillaName}</p>
                        <p className="text-xs text-gray-500">
                          {letter.fileName} 
                          {letter.fileSize && ` • ${formatFileSize(letter.fileSize)}`}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(letter.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => window.open(letter.url, '_blank')}
                        className="p-2.5 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-lg transition-colors"
                        title="View Letter"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {currentStatus !== 'approved' && (
                        <button
                          onClick={() => handleRemoveLetter(letter.id)}
                          className="p-2.5 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
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
            
            {/* Submit Button - Orange Gradient */}
            {letters.length >= 3 && currentStatus === 'pending' && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmitApplication}
                  disabled={saving || !isProfileComplete()}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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

        {/* Payment Section - Orange Theme */}
        {currentStatus === 'approved' && (
          <div className="bg-white rounded-2xl border border-orange-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-5">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-white" />
                <div>
                  <p className="font-bold text-white text-lg">Application Approved!</p>
                  <p className="text-green-100 text-sm">Your recommendation letters have been verified</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-5 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
                <div>
                  <p className="font-bold text-gray-900 text-lg">Safe Pass Fee</p>
                  <p className="text-sm text-gray-600 mt-1">Valid for 1 year • One-time payment</p>
                </div>
                <div className="text-3xl font-bold text-orange-600">IDR 500K</div>
              </div>
              
              <button
                onClick={handlePayment}
                disabled={processingPayment}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
          </div>
        )}

        {/* Safe Pass Card Preview - Minimal Design */}
        {currentStatus === 'active' && (
          <div className="bg-white rounded-2xl border border-orange-100 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Your Safe Pass Card</h2>
                <p className="text-sm text-gray-600">Official certification card</p>
              </div>
            </div>
            
            {/* Safe Pass Card - Modern Design */}
            <div className="max-w-md mx-auto bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white p-8 rounded-2xl shadow-2xl mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  <div>
                    <span className="font-bold text-xl">SAFE PASS</span>
                    <div className="text-xs opacity-90">Certified Professional</div>
                  </div>
                </div>
                <div className="text-right text-xs opacity-75">
                  <div>Hotel & Villa</div>
                  <div>Indonesia</div>
                </div>
              </div>
              
              <div className="space-y-3 text-sm bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="opacity-75">Name:</span>
                  <strong>{therapist?.name}</strong>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="opacity-75">ID:</span>
                  <strong>SP-{therapist?.$id?.slice(-8) || 'XXXXXXXX'}</strong>
                </div>
                <div className="flex justify-between border-b border-white/20 pb-2">
                  <span className="opacity-75">Location:</span>
                  <strong>{therapist?.location}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-75">Valid Until:</span>
                  <strong>{therapist?.safePassExpiry ? new Date(therapist.safePassExpiry).toLocaleDateString() : '---'}</strong>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between text-xs">
                <div className="opacity-75">
                  Issued: {therapist?.safePassIssuedAt ? new Date(therapist.safePassIssuedAt).toLocaleDateString() : '---'}
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setShowCardPreview(!showCardPreview)}
                className="flex items-center gap-2 px-5 py-3 border-2 border-orange-300 text-orange-700 rounded-xl hover:bg-orange-50 font-medium transition-all"
              >
                <Eye className="w-4 h-4" />
                View Card
              </button>
              <button
                onClick={() => therapist?.safePassCardUrl && window.open(therapist.safePassCardUrl, '_blank')}
                className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 font-medium shadow-lg transition-all"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelVillaSafePass;