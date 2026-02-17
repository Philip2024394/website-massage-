// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
// 🔒 LOGIC LOCKED - DO NOT MODIFY VERIFICATION & BANK DETAILS LOGIC
// UI/styling changes allowed ONLY
// Last locked: 2026-01-28
import React, { useState } from 'react';
import { Save, CreditCard, Upload, FileCheck, AlertCircle, CheckCircle2, Clock, HelpCircle } from 'lucide-react';
import { KTP_VERIFICATION_STATES, VERIFICATION_BADGE_BOOKING_INCREASE_PERCENTAGE } from '../../constants/businessLogic';
import { validateBankAccount, sanitizeBankAccountInput } from '../../utils/goldStandardValidation';
import TherapistLayout from '../../components/therapist/TherapistLayout';
import { therapistService } from '../../lib/appwriteService';
import { showToast } from '../../utils/showToastPortal';
import PaymentCard from '../../components/PaymentCard';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { therapistDashboardHelp } from './constants/helpContent';
import type { Therapist } from '../../types';

interface TherapistPaymentInfoProps {
  therapist: Therapist | null;
  onBack: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  language?: 'en' | 'id';
}

const TherapistPaymentInfo: React.FC<TherapistPaymentInfoProps> = ({ therapist, onBack, onNavigate, onLogout }) => {
  const language = 'id'; // Fixed Indonesian language
  const [bankName, setBankName] = useState(therapist?.bankName || '');
  const [accountName, setAccountName] = useState(therapist?.accountName || '');
  const [accountNumber, setAccountNumber] = useState(therapist?.accountNumber || '');
  const [ktpIdCard, setKtpIdCard] = useState<File | null>(null);
  const [ktpPreview, setKtpPreview] = useState<string>(therapist?.ktpPhotoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nameMatchWarning, setNameMatchWarning] = useState(false);

  // Translation labels
  const labels = {
    en: {
      title: 'Payment Information',
      subtitle: 'Manage your bank details',
      directP2P: 'Direct P2P Payment System',
      platformFacilitates: 'Our platform facilitates connections between therapists and clients. For your privacy and security:',
      sharedAfterService: 'Your contact info is shared only after service completion',
      directPayment: '100% payment goes directly to you',
      noPlatformFees: 'No platform fees on your earnings',
      updateAnytime: 'Update your details anytime',
      bankInformation: 'Bank Information',
      bankName: 'Bank Name',
      accountName: 'Account Name',
      accountNumber: 'Account Number',
      idVerification: 'ID Verification',
      ktpRequired: 'KTP/ID Card Required',
      uploadKtp: 'Upload clear photo of your KTP',
      clickToUpload: 'Click to upload',
      pngJpg: 'PNG, JPG up to 5MB',
      nameMatchNotice: 'Account name must match your KTP name for verification',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      selectBank: 'Select your bank',
      enterAccountName: 'Enter account holder name',
      enterAccountNumber: 'Enter your account number',
      imageFileOnly: 'Please upload an image file',
      fileTooLarge: 'File size must be less than 5MB',
      ktpSelected: 'KTP ID card selected',
      allFieldsRequired: 'All fields are required',
      paymentInfoUpdated: 'Payment information updated successfully!',
      errorUpdating: 'Error updating payment information'
    },
    id: {
      title: 'Informasi Pembayaran',
      subtitle: 'Kelola detail bank Anda',
      directP2P: 'Sistem Pembayaran P2P Langsung',
      platformFacilitates: 'Platform kami memfasilitasi koneksi antara terapis dan klien. Untuk privasi dan keamanan Anda:',
      sharedAfterService: 'Info kontak Anda dibagikan hanya setelah layanan selesai',
      directPayment: '100% pembayaran langsung ke Anda',
      noPlatformFees: 'Tidak ada biaya platform dari pendapatan Anda',
      updateAnytime: 'Perbarui detail Anda kapan saja',
      bankInformation: 'Informasi Bank',
      bankName: 'Nama Bank',
      accountName: 'Nama Akun',
      accountNumber: 'Nomor Rekening',
      idVerification: 'Verifikasi ID',
      ktpRequired: 'KTP/Kartu ID Diperlukan',
      uploadKtp: 'Upload foto KTP yang jelas',
      clickToUpload: 'Klik untuk upload',
      pngJpg: 'PNG, JPG maksimal 5MB',
      nameMatchNotice: 'Nama akun harus sesuai dengan nama KTP untuk verifikasi',
      saveChanges: 'Simpan Perubahan',
      saving: 'Menyimpan...',
      selectBank: 'Pilih bank Anda',
      enterAccountName: 'Masukkan nama pemilik rekening',
      enterAccountNumber: 'Masukkan nomor rekening Anda',
      imageFileOnly: 'Harap upload file gambar',
      fileTooLarge: 'Ukuran file harus kurang dari 5MB',
      ktpSelected: 'KTP ID card dipilih',
      allFieldsRequired: 'Semua field harus diisi',
      paymentInfoUpdated: 'Informasi pembayaran berhasil diperbarui!',
      errorUpdating: 'Error memperbarui informasi pembayaran'
    }
  };

  const currentLabels = labels[language];

  const handleKtpUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setKtpIdCard(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setKtpPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    showToast('✅ KTP ID card selected', 'success');
  };

  const handleSave = async () => {
    if (!therapist) {
      showToast('⚠️ Therapist data not found', 'error');
      return;
    }

    // Check if KTP is uploaded
    if (!ktpPreview && !therapist?.ktpPhotoUrl) {
      showToast('⚠️ Please upload your KTP ID card for verification', 'error');
      return;
    }

    setSaving(true);
    try {
      let ktpPhotoUrl = therapist?.ktpPhotoUrl || '';
      
      // Upload KTP if new file is selected
      if (ktpIdCard) {
        try {
          setUploading(true);
          console.log('🔄 Uploading KTP file...');
          
          const uploadResult = await therapistService.uploadKtpId(
            String(therapist.$id || therapist.id),
            ktpIdCard
          );
          ktpPhotoUrl = uploadResult.url;
          
          console.log('✅ KTP upload successful:', uploadResult.fileId);
          showToast('✅ KTP uploaded successfully!', 'success');
          
          setUploading(false);
        } catch (uploadError: unknown) {
          const err = uploadError as Error;
          console.error('❌ KTP UPLOAD FAILED:', err);
          
          // Show specific error to user  
          showToast('❌ KTP upload failed: ' + err.message, 'error');
          setUploading(false);
          setIsLoading(false);
          return; // Stop execution if upload fails
        }
      }

      // ============================================================================
      // 🔒 HARD LOCK: KTP VERIFICATION 3-STATE BADGE SYSTEM
      // ============================================================================
      // Business Rule: Immediate orange badge on upload, green on admin approval
      // Constants: KTP_VERIFICATION_STATES { SUBMITTED, VERIFIED, REJECTED }
      // Impact: Builds customer trust, increases bookings by 60%
      // State Flow:
      //   1. Upload → ktpSubmitted = true (Orange "Menunggu Verifikasi")
      //   2. Admin Approve → ktpVerified = true (Green "Terverifikasi")
      //   3. Admin Reject → ktpRejected = true (Hide badge, show reason)
      // DO NOT MODIFY - Critical for trust system
      // ============================================================================
      await therapistService.update(String(therapist.$id || therapist.id), {
        bankName: bankName.trim(),
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        ktpPhotoUrl: ktpPhotoUrl,
        ktpSubmitted: true, // ✅ Show ORANGE "Menunggu Verifikasi" badge immediately
        ktpVerified: false, // Admin approval will set this to true for GREEN badge
        ktpRejected: false, // Reset rejection status on re-upload
      });

      showToast('✅ Payment information saved successfully! Admin will verify your KTP.', 'success');
      console.log('✅ Payment info saved:', { bankName, accountName, accountNumber, ktpPhotoUrl });
    } catch (error) {
      console.error('❌ Failed to save payment info:', error);
      showToast('❌ Failed to save payment information', 'error');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  // Check if account name matches therapist name
  React.useEffect(() => {
    if (accountName.trim() && therapist?.name) {
      const namesMatch = accountName.toLowerCase().includes(therapist.name.toLowerCase()) ||
                         therapist.name.toLowerCase().includes(accountName.toLowerCase());
      setNameMatchWarning(!namesMatch);
    } else {
      setNameMatchWarning(false);
    }
  }, [accountName, therapist?.name]);

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <TherapistLayout
      therapist={therapist}
      currentPage="payment"
      onNavigate={handleNavigate}
      language={language}
      onLogout={onLogout}
    >
    <div className="bg-white">
      {/* Main Content - reduced padding to remove white space */}
      <main className="max-w-sm mx-auto px-4 pt-0 pb-3">
        <div className="space-y-4">
          {/* Standardized Status Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{currentLabels.title}</h2>
                    <HelpTooltip
                      title={therapistDashboardHelp.paymentInfo.directPayment.title}
                      content={therapistDashboardHelp.paymentInfo.directPayment.content}
                      benefits={therapistDashboardHelp.paymentInfo.directPayment.benefits}
                      size="sm"
                      position="bottom"
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" />
                    </HelpTooltip>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-600">Komisi 30% per booking</p>
                    <HelpTooltip
                      title={therapistDashboardHelp.paymentInfo.commissionSystem.title}
                      content={therapistDashboardHelp.paymentInfo.commissionSystem.content}
                      benefits={therapistDashboardHelp.paymentInfo.commissionSystem.benefits}
                      size="sm"
                      position="bottom"
                    >
                      <HelpCircle className="w-3 h-3 text-gray-400 hover:text-orange-500 transition-colors" />
                    </HelpTooltip>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
                <Clock className="w-4 h-4 text-gray-500" />
                {(() => {
                  const status = therapist?.status || therapist?.availability;
                  const statusStr = String(status).toLowerCase();
                  
                  if (statusStr === 'available' && therapist?.availableStartTime) {
                    const now = new Date();
                    const startTime = new Date(therapist.availableStartTime);
                    const hoursElapsed = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                    const hoursRemaining = Math.max(0, 12 - hoursElapsed);
                    
                    return (
                      <>
                        <span className="text-sm font-semibold text-gray-700">
                          {hoursRemaining > 0 ? `${Math.floor(hoursRemaining)}h ${Math.floor((hoursRemaining % 1) * 60)}m` : '0h 0m'}
                        </span>
                        <span className="text-xs text-gray-500">remaining</span>
                      </>
                    );
                  } else if (statusStr === 'busy') {
                    return (
                      <>
                        <span className="text-sm font-semibold text-red-700">Timer Expired</span>
                        <span className="text-xs text-gray-500">set available</span>
                      </>
                    );
                  } else {
                    return (
                      <>
                        <span className="text-sm font-semibold text-gray-700">12h 0m</span>
                        <span className="text-xs text-gray-500">when available</span>
                      </>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Status Grid */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => console.log('Status change: available')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  therapist?.status === 'available' && therapist?.availability === 'online'
                    ? 'bg-green-50 border-green-500'
                    : 'border-gray-200 hover:border-green-300'
                }`}
              >
                <CheckCircle2 className={`w-6 h-6 mx-auto mb-2 ${
                  therapist?.status === 'available' && therapist?.availability === 'online'
                    ? 'text-green-600'
                    : 'text-gray-400'
                }`} />
                <p className={`text-sm font-semibold ${
                  therapist?.status === 'available' && therapist?.availability === 'online'
                    ? 'text-green-700'
                    : 'text-gray-600'
                }`}>Tersedia</p>
              </button>

              {/* Home services: Available only (Busy/Offline removed) */}
            </div>
          </div>
          
          {/* Info Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Sistem Pembayaran P2P Langsung</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Platform kami memfasilitasi koneksi antara Anda dan pelanggan, tetapi tidak memproses pembayaran.
                  Semua pembayaran dilakukan langsung dari pelanggan kepada Anda setelah layanan selesai.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Dibagikan setelah layanan selesai</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">100% pembayaran langsung kepada Anda</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Tidak ada biaya platform</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Perbarui kapan saja</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* KTP ID Card Upload Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileCheck className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-semibold text-gray-900">Verifikasi KTP Diperlukan</h2>
                  <HelpTooltip
                    title={therapistDashboardHelp.paymentInfo.ktpVerification.title}
                    content={therapistDashboardHelp.paymentInfo.ktpVerification.content}
                    benefits={therapistDashboardHelp.paymentInfo.ktpVerification.benefits}
                    size="sm"
                    position="bottom"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" />
                  </HelpTooltip>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  Untuk keamanan Anda dan kepercayaan pelanggan, harap upload foto KTP Anda yang jelas.
                </p>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Sesuai dengan identitas rekening bank</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Membangun kepercayaan pelanggan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Melindungi dari penipuan</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs text-gray-500">Diperlukan untuk verifikasi</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Upload Foto KTP <span className="text-orange-600">*</span>
              </label>
              
              {ktpPreview ? (
                <div className="space-y-4">
                  <img 
                    src={ktpPreview} 
                    alt="KTP Preview" 
                    className="w-full max-w-md rounded-lg border border-gray-300"
                  />
                  <div className="flex items-center gap-3">
                    {/* 🔒 3-STATE BADGE SYSTEM - DO NOT MODIFY */}
                    {therapist?.ktpRejected ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Ditolak</span>
                      </div>
                    ) : therapist?.ktpVerified ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg border border-green-200">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="text-sm">✅ Terverifikasi</span>
                      </div>
                    ) : therapist?.ktpSubmitted ? (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg border border-orange-200">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">⏳ Menunggu Verifikasi</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-200">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">Belum Upload</span>
                      </div>
                    )}
                    <label className="cursor-pointer px-4 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm border border-gray-300">
                      Ganti Foto
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                        onChange={handleKtpUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors">
                  <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-700 mb-1">Klik untuk upload foto KTP</p>
                  <p className="text-xs text-gray-500">JPG, PNG maksimal 15MB</p>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={handleKtpUpload}
                    className="hidden"
                  />
                </label>
              )}
              
              {uploading && (
                <div className="mt-3 flex items-center gap-2 text-orange-600">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span className="text-sm">Mengupload KTP...</span>
                </div>
              )}
            </div>
          </div>

          {/* Live Preview Section */}
          {(bankName.trim() || accountName.trim() || accountNumber.trim()) && (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">Preview Langsung</h3>
                  <HelpTooltip
                    title={therapistDashboardHelp.paymentInfo.livePreview.title}
                    content={therapistDashboardHelp.paymentInfo.livePreview.content}
                    benefits={therapistDashboardHelp.paymentInfo.livePreview.benefits}
                    size="sm"
                    position="bottom"
                  >
                    <HelpCircle className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" />
                  </HelpTooltip>
                </div>
                <p className="text-gray-600 text-sm">Begini kartu pembayaran Anda akan terlihat oleh pelanggan</p>
              </div>
              
              <div className="flex justify-center mb-6">
                <PaymentCard
                  bankName={bankName || 'Nama Bank Anda'}
                  accountHolderName={accountName || 'NAMA AKUN ANDA'}
                  accountNumber={accountNumber || '0000000000000000'}
                  size="large"
                />
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-1 bg-orange-100 rounded">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-3">Fitur Kartu Pembayaran</h4>
                    <div className="grid grid-cols-1 gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Otomatis dibagikan saat booking diterima</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Dapat dibagikan manual di chat</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Tampilan profesional</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                        <span className="text-xs text-gray-500">Diperlukan untuk booking</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Details Form */}
          <div className="border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Detail Rekening Bank</h3>
              <HelpTooltip
                title={therapistDashboardHelp.paymentInfo.bankDetails.title}
                content={therapistDashboardHelp.paymentInfo.bankDetails.content}
                benefits={therapistDashboardHelp.paymentInfo.bankDetails.benefits}
                size="sm"
                position="bottom"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" />
              </HelpTooltip>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nama Bank <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  placeholder="contoh: Bank Central Asia, Bank Mandiri, BRI, BNI"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-2">Masukkan nama bank Anda - memperbarui preview di atas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nama Akun <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value.toUpperCase())}
                  placeholder="contoh: BUDI SANTOSO"
                  className={`w-full bg-white border rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none transition-colors uppercase ${
                    nameMatchWarning ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-orange-500'
                  }`}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Masukkan nama sesuai rekening bank - memperbarui preview kartu di atas
                </p>
                {nameMatchWarning && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 text-sm text-red-600">
                        <div className="flex items-center gap-1">
                          <span className="font-medium">Peringatan:</span>
                          <HelpTooltip
                            title={therapistDashboardHelp.paymentInfo.nameMatching.title}
                            content={therapistDashboardHelp.paymentInfo.nameMatching.content}
                            benefits={therapistDashboardHelp.paymentInfo.nameMatching.benefits}
                            size="sm"
                            position="right"
                          >
                            <HelpCircle className="w-3 h-3 text-red-400 hover:text-red-600 transition-colors" />
                          </HelpTooltip>
                        </div>
                        <div className="mt-1">
                          Nama akun harus sesuai dengan nama di KTP Anda ({therapist?.name}). Nama yang tidak cocok dapat menunda verifikasi.
                        </div>
                      </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Nomor Rekening <span className="text-orange-600">*</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={accountNumber}
                  onChange={(e) => {
                    // ✅ Use gold-standard validation for consistent behavior
                    const sanitized = sanitizeBankAccountInput(e.target.value);
                    setAccountNumber(sanitized);
                  }}
                  placeholder="contoh: 1234 5678 9012 3456 (10-20 digit, boleh pakai spasi)"
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:border-orange-500 focus:outline-none transition-colors font-mono"
                  maxLength={30}
                />
                <p className="text-xs text-gray-500 mt-2">Masukkan nomor rekening - lihat format pada kartu di atas</p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-sm text-gray-600">Data Anda disimpan dengan aman</span>
              <HelpTooltip
                title={therapistDashboardHelp.paymentInfo.dataSource.title}
                content={therapistDashboardHelp.paymentInfo.dataSource.content}
                benefits={therapistDashboardHelp.paymentInfo.dataSource.benefits}
                size="sm"
                position="top"
              >
                <HelpCircle className="w-4 h-4 text-gray-400 hover:text-orange-500 transition-colors" />
              </HelpTooltip>
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !bankName.trim() || !accountName.trim() || !accountNumber.trim()}
              className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:transform-none flex items-center justify-center gap-3 border border-orange-500/20"
            >
              {saving ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Simpan Informasi Pembayaran
                </>
              )}
            </button>
            
            {(!bankName.trim() || !accountName.trim() || !accountNumber.trim()) && (
              <p className="text-sm text-orange-600 text-center mt-3">
                Harap isi semua field untuk menyimpan informasi pembayaran
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
    </TherapistLayout>
  );
};

export default TherapistPaymentInfo;
