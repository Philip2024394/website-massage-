/**
 * Contact Us page – clean layout: Hero, Contact Form, Follow Us.
 * No FAQ section. Mobile responsive.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Mail, Send, Bold, Italic, Type, Upload, X, CheckCircle, Facebook, Instagram } from 'lucide-react';
import UniversalHeader from '../components/shared/UniversalHeader';
import AppDrawer from '../components/AppDrawerClean';
import { submitContactForm } from '../lib/services/contactFormService';

// Reason options: general + in-app contact reasons
const REASON_OPTIONS = [
  { value: '', label: '— Select reason —' },
  { value: 'general', label: 'General Enquiry', department: 'admin' },
  { value: 'technical', label: 'Technical Support', department: 'admin' },
  { value: 'billing', label: 'Billing Issue', department: 'finance' },
  { value: 'account', label: 'Account Issue', department: 'admin' },
  { value: 'report', label: 'Report a Problem', department: 'compliance' },
  { value: 'partnership', label: 'Business Partnership', department: 'admin' },
  { value: 'other', label: 'Other', department: 'admin' },
  // In-app categories (aligned with existing contact categories)
  { value: 'booking', label: 'Booking Issue', department: 'booking-support' },
  { value: 'payment', label: 'Payment Problem', department: 'finance' },
  { value: 'refund', label: 'Refund Request', department: 'finance' },
  { value: 'no-show', label: 'Therapist No-Show', department: 'booking-support' },
  { value: 'cancel', label: 'Cancel or Reschedule Booking', department: 'booking-support' },
  { value: 'login', label: 'Account Login Issue', department: 'admin' },
  { value: 'bug', label: 'App Technical Bug', department: 'admin' },
  { value: 'apply-therapist', label: 'Apply as Therapist', department: 'therapist-support' },
  { value: 'commission', label: 'Commission Question', department: 'finance' },
  { value: 'verification', label: 'Verification Status', department: 'therapist-support' },
  { value: 'policy', label: 'Report Policy Violation', department: 'compliance' },
  { value: 'feedback', label: 'General Feedback', department: 'admin' },
];

const SUPPORT_EMAIL = 'indastreet.id@gmail.com';

// Social links for Follow Us (match brand; add Twitter/X)
const SOCIAL_LINKS = [
  { name: 'Facebook', url: 'https://www.facebook.com/share/g/1C2QCPTp62/', icon: Facebook, color: 'text-[#1877F2] hover:opacity-90' },
  { name: 'Instagram', url: 'https://www.instagram.com/indastreet.id/', icon: Instagram, color: 'text-[#E4405F] hover:opacity-90' },
  { name: 'TikTok', url: 'https://www.tiktok.com/@indastreet.team?is_from_webapp=1&sender_device=pc', icon: null, color: 'text-gray-800 hover:opacity-90', imgSrc: 'https://ik.imagekit.io/7grri5v7d/tik%20tok.png' },
  { name: 'X (Twitter)', url: 'https://x.com/', icon: null, color: 'text-gray-900 hover:opacity-90', imgSrc: null },
];

export interface ContactUsPageProps {
  onNavigate: (page: string) => void;
  language?: string;
  onLanguageChange?: (lang: string) => void;
  onMassageJobsClick?: () => void;
  onVillaPortalClick?: () => void;
  onTherapistPortalClick?: () => void;
  onMassagePlacePortalClick?: () => void;
  onAgentPortalClick?: () => void;
  onCustomerPortalClick?: () => void;
  onAdminPortalClick?: () => void;
  onTermsClick?: () => void;
  onPrivacyClick?: () => void;
  therapists?: any[];
  places?: any[];
}

const ContactUsPage: React.FC<ContactUsPageProps> = ({
  onNavigate,
  language: propLanguage = 'id',
  onLanguageChange,
  onMassageJobsClick,
  onVillaPortalClick,
  onTherapistPortalClick,
  onMassagePlacePortalClick,
  onAgentPortalClick,
  onCustomerPortalClick,
  onAdminPortalClick,
  onTermsClick,
  onPrivacyClick,
  therapists = [],
  places = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    reason: '',
    description: '',
    textColor: '#000000',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const isId = propLanguage === 'id';

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setSubmitError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSubmitError(isId ? 'Silakan pilih file gambar.' : 'Please select an image file.');
      return;
    }
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAttachmentFile(file);
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const removeAttachment = () => {
    setAttachmentFile(null);
  };

  const applyFormat = (cmd: string, value?: string) => {
    document.execCommand(cmd, false, value || '');
    descriptionRef.current?.focus();
  };

  const getDescriptionHtml = () => descriptionRef.current?.innerHTML ?? '';
  const setDescriptionHtml = (html: string) => {
    if (descriptionRef.current) descriptionRef.current.innerHTML = html;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const descriptionText = (descriptionRef.current?.innerText || '').trim() || formData.description.trim();
    if (!descriptionText) {
      setSubmitError(isId ? 'Deskripsi wajib diisi.' : 'Description is required.');
      return;
    }

    setIsSubmitting(true);

    const reasonOption = REASON_OPTIONS.find((r) => r.value === formData.reason);
    const department = reasonOption?.department ?? 'admin';
    const subject = reasonOption?.label || formData.reason || 'Contact Form';

    const messageParts = [
      descriptionText,
      formData.address ? `\n\nAddress: ${formData.address}` : '',
      imageFile ? `\n\n[Attached image: ${imageFile.name}]` : '',
      attachmentFile ? `\n\n[Attached file: ${attachmentFile.name}]` : '',
    ];
    const message = messageParts.join('').trim();

    const result = await submitContactForm({
      fullName: formData.fullName.trim(),
      email: formData.email.trim() || undefined,
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      message,
      subject,
      issueCategory: formData.reason,
      department,
    });

    setIsSubmitting(false);

    if (result.success) {
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        address: '',
        reason: '',
        description: '',
        textColor: '#000000',
      });
      setDescriptionHtml('');
      setImageFile(null);
      setImagePreview(null);
      setAttachmentFile(null);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    } else {
      setSubmitError(result.error || (isId ? 'Pengiriman gagal. Silakan coba lagi.' : 'Submission failed. Please try again.'));
      if (result.mailtoUrl) {
        const openEmail = window.confirm(
          isId
            ? 'Tidak dapat mengirim via formulir. Buka email untuk mengirim pesan?'
            : 'Unable to submit via form. Open your email client to send your message?'
        );
        if (openEmail) window.location.href = result.mailtoUrl;
      }
    }
  };

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 overflow-x-hidden pt-14 sm:pt-16">
      <UniversalHeader
        language={propLanguage}
        onLanguageChange={onLanguageChange}
        onMenuClick={() => setIsMenuOpen(true)}
        onHomeClick={() => onNavigate?.('home')}
        showHomeButton
        showLanguageSelector={!!onLanguageChange}
        countryCode="ID"
      />

      <AppDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onMassageJobsClick={onMassageJobsClick}
        onVillaPortalClick={onVillaPortalClick}
        onTherapistPortalClick={onTherapistPortalClick}
        onMassagePlacePortalClick={onMassagePlacePortalClick}
        onAgentPortalClick={onAgentPortalClick}
        onCustomerPortalClick={onCustomerPortalClick}
        onAdminPortalClick={onAdminPortalClick}
        onNavigate={onNavigate}
        onTermsClick={onTermsClick}
        onPrivacyClick={onPrivacyClick}
        therapists={therapists}
        places={places}
        language={propLanguage as 'en' | 'id' | 'gb'}
      />

      {/* 1. Hero – text only */}
      <section className="bg-gradient-to-b from-amber-50/80 to-white border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-3">
            {isId ? 'Hubungi Kami' : 'Contact Us'}
          </h1>
          <p className="text-base sm:text-lg text-gray-600 text-center max-w-xl mx-auto">
            {isId
              ? 'Kami di sini untuk membantu. Kirimkan pertanyaan Anda di bawah ini.'
              : "We're here to help. Send us your enquiry below."}
          </p>
        </div>
      </section>

      {/* 2. Contact form container – centered */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {isId ? 'Nama Lengkap' : 'Full Name'} *
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                placeholder={isId ? 'Nama lengkap Anda' : 'Your full name'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all"
              />
            </div>

            {/* Email (optional – for reply) */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {isId ? 'Email' : 'Email'} ({isId ? 'opsional' : 'optional'})
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="your@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {isId ? 'Nomor Telepon' : 'Phone Number'} *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder={isId ? 'Contoh: 08123456789' : 'e.g. 08123456789'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {isId ? 'Alamat' : 'Address'} *
              </label>
              <textarea
                required
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder={isId ? 'Alamat Anda' : 'Your address'}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all resize-none"
              />
            </div>

            {/* Reason for Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {isId ? 'Alasan Kontak' : 'Reason for Contact'} *
              </label>
              <select
                required
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-400/30 outline-none transition-all bg-white"
              >
                {REASON_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Description – large textarea with formatting */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                {isId ? 'Deskripsi' : 'Description'} *
              </label>
              <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-amber-400/30 focus-within:border-amber-500">
                {/* Formatting toolbar */}
                <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-200">
                  <button
                    type="button"
                    onClick={() => applyFormat('bold')}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Bold"
                    aria-label="Bold"
                  >
                    <Bold className="w-4 h-4 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={() => applyFormat('italic')}
                    className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Italic"
                    aria-label="Italic"
                  >
                    <Italic className="w-4 h-4 text-gray-700" />
                  </button>
                  <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                    <Type className="w-4 h-4 text-gray-500" aria-hidden />
                    <input
                      type="color"
                      value={formData.textColor}
                      onChange={(e) => {
                        handleInputChange('textColor', e.target.value);
                        applyFormat('foreColor', e.target.value);
                      }}
                      className="w-8 h-8 rounded cursor-pointer border border-gray-100"
                      title={isId ? 'Warna teks' : 'Text color'}
                      aria-label={isId ? 'Warna teks' : 'Text color'}
                    />
                  </div>
                </div>
                <div
                  ref={descriptionRef}
                  contentEditable
                  data-placeholder={isId ? 'Jelaskan masalah atau pertanyaan Anda...' : 'Describe your issue or question...'}
                  className="min-h-[160px] max-h-[320px] overflow-y-auto p-4 text-gray-900 outline-none empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                  onInput={() => {
                    const text = descriptionRef.current?.innerText ?? '';
                    setFormData((prev) => ({ ...prev, description: text }));
                  }}
                />
              </div>
            </div>

            {/* File upload – image + attachment */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-900">
                {isId ? 'Unggah file (opsional)' : 'File upload (optional)'}
              </label>
              <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[140px]">
                  <span className="block text-xs text-gray-500 mb-1">{isId ? 'Gambar' : 'Image'}</span>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 px-2 text-center">
                      {isId ? 'Klik atau seret' : 'Click or drag'}
                    </span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                  {imagePreview && (
                    <div className="mt-2 relative inline-block">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-gray-800 text-white rounded-full flex items-center justify-center hover:bg-gray-700"
                        aria-label={isId ? 'Hapus gambar' : 'Remove image'}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-[140px]">
                  <span className="block text-xs text-gray-500 mb-1">{isId ? 'PDF / Dokumen' : 'PDF / Document'}</span>
                  <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500 px-2 text-center">PDF, DOC...</span>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleAttachmentChange}
                      className="hidden"
                    />
                  </label>
                  {attachmentFile && (
                    <div className="mt-2 flex items-center gap-2">
                      <p className="text-sm text-gray-600 truncate max-w-[140px]" title={attachmentFile.name}>
                        {attachmentFile.name}
                      </p>
                      <button
                        type="button"
                        onClick={removeAttachment}
                        className="p-1 rounded-full hover:bg-gray-200 text-gray-500"
                        aria-label={isId ? 'Hapus lampiran' : 'Remove attachment'}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {submitError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold flex items-center justify-center gap-2 transition-colors shadow-md hover:shadow-lg"
            >
              {isSubmitting ? (
                <span className="animate-pulse">{isId ? 'Mengirim...' : 'Sending...'}</span>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {isId ? 'Kirim Pesan' : 'Send Message'}
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* Success confirmation */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-9 h-9 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {isId ? 'Pesan terkirim' : 'Message sent'}
            </h2>
            <p className="text-amber-600 text-sm mb-6 font-medium">
              {isId
                ? 'Kami biasanya membalas dalam 24 jam. Periksa email Anda untuk pembaruan.'
                : 'We typically respond within 24 hours. Check your email for updates.'}
            </p>
            <button
              type="button"
              onClick={() => setShowSuccess(false)}
              className="px-6 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* 4. Bottom – Follow Us */}
      <section className="border-t border-gray-200 bg-white mt-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <h2 className="text-lg font-bold text-gray-900 text-center mb-6">
            {isId ? 'Ikuti Kami' : 'Follow Us'}
          </h2>
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 font-medium transition-opacity ${social.color}`}
                aria-label={social.name}
              >
                {social.imgSrc ? (
                  <img src={social.imgSrc} alt="" className="w-8 h-8 object-contain" />
                ) : social.icon ? (
                  <social.icon className="w-8 h-8" />
                ) : (
                  <span className="w-8 h-8 flex items-center justify-center text-lg font-bold">𝕏</span>
                )}
                <span>{social.name}</span>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUsPage;
