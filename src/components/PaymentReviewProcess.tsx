// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { 
  Upload, 
  FileCheck, 
  AlertCircle, 
  CheckCircle2, 
  XCircle,
  Image,
  FileImage,
  Loader2,
  Shield,
  Clock,
  HelpCircle,
  Eye,
  Download,
  Info
} from 'lucide-react';
import { showToast } from '../utils/showToastPortal';

interface PaymentReviewProcessProps {
  onSubmit: (file: File, additionalData?: any) => Promise<void>;
  isSubmitting?: boolean;
  maxFileSize?: number; // in MB
  acceptedFormats?: string[];
  paymentDetails?: {
    amount: number;
    currency?: string;
    description?: string;
    bankDetails?: {
      bankName: string;
      accountName: string;
      accountNumber: string;
    };
  };
  title?: string;
  subtitle?: string;
  language?: 'en' | 'id';
  onBack?: () => void;
}

interface FileValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

const PaymentReviewProcess: React.FC<PaymentReviewProcessProps> = ({
  onSubmit,
  isSubmitting = false,
  maxFileSize = 5,
  acceptedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  paymentDetails,
  title,
  subtitle,
  language = 'id',
  onBack
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [validation, setValidation] = useState<FileValidation>({ isValid: false, errors: [], warnings: [] });
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showRequirements, setShowRequirements] = useState(false);
  const [notes, setNotes] = useState('');

  // Translation labels
  const labels = {
    en: {
      title: title || 'Payment Review Process',
      subtitle: subtitle || 'Upload your payment proof for admin verification',
      uploadArea: 'Upload Payment Proof',
      dragDrop: 'Drag and drop your payment proof here, or click to browse',
      clickToUpload: 'Click to upload payment proof',
      supportedFormats: 'Supported formats',
      maxSize: 'Maximum file size',
      requirements: 'Requirements',
      fileSelected: 'File selected successfully',
      preview: 'Preview',
      validation: 'Validation',
      submit: 'Submit for Review',
      submitting: 'Submitting...',
      notes: 'Additional Notes (Optional)',
      notesPlaceholder: 'Add any additional information about your payment...',
      paymentInfo: 'Payment Information',
      amount: 'Amount',
      description: 'Description',
      bankDetails: 'Bank Details',
      errors: {
        fileRequired: 'Please select a payment proof file',
        invalidFormat: 'Invalid file format. Please use JPG, PNG, or WebP',
        fileTooLarge: 'File size too large. Maximum allowed is',
        uploadFailed: 'Upload failed. Please try again',
        networkError: 'Network error. Please check your connection'
      },
      warnings: {
        lowQuality: 'Image quality might be low. Consider using a higher resolution',
        oldFormat: 'Consider using modern formats like WebP for better compression'
      },
      tips: {
        title: 'Tips for Best Results',
        items: [
          'Ensure the screenshot shows complete transaction details',
          'Make sure all text is clearly readable',
          'Include transaction date and amount',
          'Avoid blurry or cropped images',
          'Use good lighting when taking photos'
        ]
      },
      security: {
        title: 'Security & Privacy',
        description: 'Your payment proof is encrypted and only accessible by authorized admin staff for verification purposes.',
        features: [
          'End-to-end encryption',
          'Secure cloud storage',
          'Admin-only access',
          'Automatic deletion after verification'
        ]
      }
    },
    id: {
      title: title || 'Proses Review Pembayaran',
      subtitle: subtitle || 'Upload bukti pembayaran untuk verifikasi admin',
      uploadArea: 'Upload Bukti Pembayaran',
      dragDrop: 'Drag dan drop bukti pembayaran di sini, atau klik untuk browse',
      clickToUpload: 'Klik untuk upload bukti pembayaran',
      supportedFormats: 'Format yang didukung',
      maxSize: 'Ukuran file maksimum',
      requirements: 'Persyaratan',
      fileSelected: 'File berhasil dipilih',
      preview: 'Preview',
      validation: 'Validasi',
      submit: 'Kirim untuk Review',
      submitting: 'Mengirim...',
      notes: 'Catatan Tambahan (Opsional)',
      notesPlaceholder: 'Tambahkan informasi tambahan tentang pembayaran Anda...',
      paymentInfo: 'Informasi Pembayaran',
      amount: 'Jumlah',
      description: 'Deskripsi',
      bankDetails: 'Detail Bank',
      errors: {
        fileRequired: 'Harap pilih file bukti pembayaran',
        invalidFormat: 'Format file tidak valid. Gunakan JPG, PNG, atau WebP',
        fileTooLarge: 'Ukuran file terlalu besar. Maksimum yang diizinkan adalah',
        uploadFailed: 'Upload gagal. Silakan coba lagi',
        networkError: 'Error jaringan. Periksa koneksi Anda'
      },
      warnings: {
        lowQuality: 'Kualitas gambar mungkin rendah. Pertimbangkan menggunakan resolusi yang lebih tinggi',
        oldFormat: 'Pertimbangkan menggunakan format modern seperti WebP untuk kompresi yang lebih baik'
      },
      tips: {
        title: 'Tips untuk Hasil Terbaik',
        items: [
          'Pastikan screenshot menunjukkan detail transaksi lengkap',
          'Pastikan semua teks dapat dibaca dengan jelas',
          'Sertakan tanggal dan jumlah transaksi',
          'Hindari gambar yang buram atau terpotong',
          'Gunakan pencahayaan yang baik saat mengambil foto'
        ]
      },
      security: {
        title: 'Keamanan & Privasi',
        description: 'Bukti pembayaran Anda dienkripsi dan hanya dapat diakses oleh staf admin yang berwenang untuk tujuan verifikasi.',
        features: [
          'Enkripsi end-to-end',
          'Penyimpanan cloud yang aman',
          'Akses khusus admin',
          'Penghapusan otomatis setelah verifikasi'
        ]
      }
    }
  };

  const currentLabels = labels[language];

  const validateFile = (file: File): FileValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      errors.push(`${currentLabels.errors.fileTooLarge} ${maxFileSize}MB`);
    }

    // Check file format
    if (!acceptedFormats.includes(file.type)) {
      errors.push(currentLabels.errors.invalidFormat);
    }

    // Check for warnings
    if (file.size < 100 * 1024) { // Less than 100KB
      warnings.push(currentLabels.warnings.lowQuality);
    }

    if (file.type === 'image/jpeg' && file.size > 2 * 1024 * 1024) { // JPEG over 2MB
      warnings.push(currentLabels.warnings.oldFormat);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleFileSelect = (file: File) => {
    const fileValidation = validateFile(file);
    setValidation(fileValidation);

    if (fileValidation.isValid) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      showToast('✅ ' + currentLabels.fileSelected, 'success');
    } else {
      showToast('❌ ' + fileValidation.errors[0], 'error');
      setSelectedFile(null);
      setFilePreview(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showToast('❌ ' + currentLabels.errors.fileRequired, 'error');
      return;
    }

    if (!validation.isValid) {
      showToast('❌ ' + validation.errors[0], 'error');
      return;
    }

    try {
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onSubmit(selectedFile, { notes: notes.trim() });
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
      }, 1000);

    } catch (error: any) {
      console.error('Payment proof submission error:', error);
      showToast('❌ ' + currentLabels.errors.uploadFailed, 'error');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFormatDisplayName = (format: string): string => {
    const formatMap: { [key: string]: string } = {
      'image/jpeg': 'JPEG',
      'image/jpg': 'JPG', 
      'image/png': 'PNG',
      'image/webp': 'WebP'
    };
    return formatMap[format] || format;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{currentLabels.title}</h1>
          </div>
          <p className="text-gray-600 text-lg">{currentLabels.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Upload Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Payment Information */}
            {paymentDetails && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{currentLabels.paymentInfo}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">{currentLabels.amount}</p>
                    <p className="text-xl font-bold text-orange-600">
                      {paymentDetails.currency || 'IDR'} {paymentDetails.amount.toLocaleString()}
                    </p>
                  </div>
                  {paymentDetails.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1">{currentLabels.description}</p>
                      <p className="text-gray-900 font-medium">{paymentDetails.description}</p>
                    </div>
                  )}
                </div>
                {paymentDetails.bankDetails && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-700 mb-2">{currentLabels.bankDetails}</p>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Bank:</span> {paymentDetails.bankDetails.bankName}</p>
                      <p><span className="font-medium">Account:</span> {paymentDetails.bankDetails.accountName}</p>
                      <p><span className="font-medium">Number:</span> {paymentDetails.bankDetails.accountNumber}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Area */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{currentLabels.uploadArea}</h3>
                <button
                  onClick={() => setShowRequirements(!showRequirements)}
                  className="flex items-center gap-2 text-orange-500 hover:text-orange-600 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-sm">{currentLabels.requirements}</span>
                </button>
              </div>

              {/* Requirements Panel */}
              {showRequirements && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{currentLabels.supportedFormats}:</p>
                      <div className="flex flex-wrap gap-2">
                        {acceptedFormats.map(format => (
                          <span key={format} className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600 border">
                            {getFormatDisplayName(format)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">{currentLabels.maxSize}:</p>
                      <span className="px-2 py-1 bg-white rounded text-xs font-medium text-gray-600 border">
                        {maxFileSize} MB
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">{currentLabels.tips.title}:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {currentLabels.tips.items.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0 mt-0.5" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Drop Zone */}
              <div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                  dragActive
                    ? 'border-orange-400 bg-orange-50'
                    : selectedFile
                    ? 'border-green-400 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50'
                }`}
                onDrop={handleDrop}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
              >
                <input
                  type="file"
                  accept={acceptedFormats.join(',')}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isSubmitting}
                />

                {!selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <Upload className={`w-12 h-12 ${dragActive ? 'text-orange-500' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-700 mb-2">{currentLabels.clickToUpload}</p>
                      <p className="text-sm text-gray-500">{currentLabels.dragDrop}</p>
                    </div>
                    <div className="flex justify-center gap-4 text-xs text-gray-500">
                      <span>{acceptedFormats.map(f => getFormatDisplayName(f)).join(', ')}</span>
                      <span>•</span>
                      <span>Max {maxFileSize}MB</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-green-700 mb-1">{currentLabels.fileSelected}</p>
                      <p className="text-sm text-gray-600">{selectedFile.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatFileSize(selectedFile.size)}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreview(null);
                        setValidation({ isValid: false, errors: [], warnings: [] });
                      }}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Choose different file
                    </button>
                  </div>
                )}
              </div>

              {/* Validation Results */}
              {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                <div className="mt-4 space-y-2">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <span className="text-sm text-red-700">{error}</span>
                    </div>
                  ))}
                  {validation.warnings.map((warning, index) => (
                    <div key={index} className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span className="text-sm text-yellow-700">{warning}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Uploading...</span>
                    <span className="text-sm text-gray-600">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            {filePreview && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-5 h-5 text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">{currentLabels.preview}</h3>
                </div>
                <div className="relative bg-gray-50 rounded-lg p-4">
                  <img 
                    src={filePreview} 
                    alt="Payment proof preview" 
                    className="max-w-full h-auto max-h-96 mx-auto rounded-lg shadow-md"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => window.open(filePreview, '_blank')}
                      className="p-2 bg-white/80 rounded-lg shadow-md hover:bg-white transition-colors"
                    >
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentLabels.notes}</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={currentLabels.notesPlaceholder}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none resize-none"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-2">{notes.length}/500 characters</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              {onBack && (
                <button
                  onClick={onBack}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!selectedFile || !validation.isValid || isSubmitting}
                className={`flex-1 px-6 py-4 rounded-lg font-semibold text-lg transition-all ${
                  selectedFile && validation.isValid && !isSubmitting
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {currentLabels.submitting}
                  </div>
                ) : (
                  currentLabels.submit
                )}
              </button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Security Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-green-500" />
                <h3 className="text-lg font-semibold text-gray-900">{currentLabels.security.title}</h3>
              </div>
              <p className="text-sm text-gray-600 mb-4">{currentLabels.security.description}</p>
              <ul className="space-y-2">
                {currentLabels.security.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Process Timeline */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-gray-900">Review Process</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">1</div>
                  <div>
                    <p className="font-medium text-gray-900">Submit Proof</p>
                    <p className="text-sm text-gray-600">Upload your payment evidence</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-white">2</div>
                  <div>
                    <p className="font-medium text-gray-900">Admin Review</p>
                    <p className="text-sm text-gray-600">Verification within 24-48 hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-xs font-bold text-white">3</div>
                  <div>
                    <p className="font-medium text-gray-900">Activation</p>
                    <p className="text-sm text-gray-600">Account upgraded upon approval</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Help & Support */}
            <div className="bg-orange-50 rounded-xl border border-orange-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-semibold text-orange-900">Need Help?</h3>
              </div>
              <p className="text-sm text-orange-800 mb-3">
                Having trouble with your payment proof? Our support team is here to help.
              </p>
              <button className="w-full px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-medium">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReviewProcess;