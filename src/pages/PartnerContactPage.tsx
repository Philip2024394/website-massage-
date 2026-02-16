/**
 * Partner Contact / Partnership Inquiry Page
 * Contact form for Hotel, Villa, and Gym partners applying to the partner program.
 * Collects industry, rooms (for hotel/villa), contact details, website, social media, and additional info.
 */

import React, { useState } from 'react';
import {
    ArrowLeft,
    Building2,
    Home,
    Dumbbell,
    Mail,
    Phone,
    Globe,
    MessageSquare,
    Send,
    CheckCircle,
    User,
    Hash
} from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import { submitContactForm } from '../lib/services/contactFormService';
import { useLanguage } from '../hooks/useLanguage';

type Industry = 'hotel' | 'villa' | 'gym' | '';

interface PartnerContactPageProps {
    onBack: () => void;
    onNavigate?: (page: string) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
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

const INDUSTRY_OPTIONS: { value: Industry; labelEn: string; labelId: string; icon: React.ReactNode }[] = [
    { value: 'hotel', labelEn: 'Hotel', labelId: 'Hotel', icon: <Building2 className="w-5 h-5" /> },
    { value: 'villa', labelEn: 'Villa', labelId: 'Villa', icon: <Home className="w-5 h-5" /> },
    { value: 'gym', labelEn: 'Gym / Fitness Center', labelId: 'Gym / Pusat Kebugaran', icon: <Dumbbell className="w-5 h-5" /> },
];

const PartnerContactPage: React.FC<PartnerContactPageProps> = ({
    onBack,
    onNavigate,
    onMassageJobsClick,
    onHotelPortalClick,
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
    const { language } = useLanguage();
    const isId = language === 'id';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [formData, setFormData] = useState({
        industry: '' as Industry,
        numberOfRooms: '',
        businessName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        instagram: '',
        facebook: '',
        additionalInfo: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const showRooms = formData.industry === 'hotel' || formData.industry === 'villa';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setSubmitError(null);
    };

    const buildMessage = (): string => {
        const lines: string[] = [
            '--- PARTNER PROGRAM INQUIRY ---',
            '',
            `Industry: ${formData.industry.toUpperCase()}`,
            `Business / Property name: ${formData.businessName || '—'}`,
            `Contact person: ${formData.contactName || '—'}`,
            `Email: ${formData.email || '—'}`,
            `Phone / WhatsApp: ${formData.phone || '—'}`,
        ];
        if (showRooms && formData.numberOfRooms) {
            lines.push(`Number of rooms: ${formData.numberOfRooms}`);
        }
        if (formData.website) lines.push(`Website: ${formData.website}`);
        if (formData.instagram) lines.push(`Instagram: ${formData.instagram}`);
        if (formData.facebook) lines.push(`Facebook: ${formData.facebook}`);
        if (formData.additionalInfo) {
            lines.push('', 'Additional information:', formData.additionalInfo);
        }
        return lines.join('\n');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);

        if (!formData.industry) {
            setSubmitError(isId ? 'Pilih jenis industri.' : 'Please select your industry.');
            return;
        }
        if (showRooms && !formData.numberOfRooms.trim()) {
            setSubmitError(isId ? 'Masukkan jumlah kamar.' : 'Please enter the number of rooms.');
            return;
        }
        if (!formData.contactName.trim()) {
            setSubmitError(isId ? 'Masukkan nama kontak.' : 'Please enter contact name.');
            return;
        }
        if (!formData.email.trim()) {
            setSubmitError(isId ? 'Masukkan alamat email.' : 'Please enter your email.');
            return;
        }
        if (!formData.phone.trim()) {
            setSubmitError(isId ? 'Masukkan nomor telepon atau WhatsApp.' : 'Please enter phone or WhatsApp.');
            return;
        }

        setIsSubmitting(true);
        const subject = `Partner Program Inquiry – ${formData.industry} – ${formData.businessName || formData.contactName}`;
        const message = buildMessage();

        const result = await submitContactForm({
            fullName: formData.contactName,
            email: formData.email,
            phone: formData.phone,
            message,
            subject,
            userRole: 'partner-inquiry',
            issueCategory: 'partnership',
            department: 'admin',
        });

        setIsSubmitting(false);
        if (result.success) {
            setSubmitted(true);
        } else {
            setSubmitError(result.error || (isId ? 'Pengiriman gagal. Silakan coba lagi.' : 'Submission failed. Please try again.'));
            if (result.mailtoUrl) {
                window.open(result.mailtoUrl, '_blank');
            }
        }
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <UniversalHeader onMenuClick={() => setIsMenuOpen(true)} showCityInfo={false} />
                <AppDrawer
                    isOpen={isMenuOpen}
                    onClose={() => setIsMenuOpen(false)}
                    onNavigate={onNavigate}
                    onMassageJobsClick={onMassageJobsClick}
                    onHotelPortalClick={onHotelPortalClick}
                    onVillaPortalClick={onVillaPortalClick}
                    onTherapistPortalClick={onTherapistPortalClick}
                    onMassagePlacePortalClick={onMassagePlacePortalClick}
                    onAgentPortalClick={onAgentPortalClick}
                    onCustomerPortalClick={onCustomerPortalClick}
                    onAdminPortalClick={onAdminPortalClick}
                    onTermsClick={onTermsClick}
                    onPrivacyClick={onPrivacyClick}
                    therapists={therapists}
                    places={places}
                />
                <div className="max-w-lg mx-auto px-4 pt-24 pb-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        {isId ? 'Terima kasih' : 'Thank you'}
                    </h1>
                    <p className="text-gray-600 mb-8">
                        {isId
                            ? 'Permohonan kemitraan Anda telah kami terima. Tim kami akan menghubungi Anda dalam 2–3 hari kerja.'
                            : 'Your partnership inquiry has been received. Our team will contact you within 2–3 business days.'}
                    </p>
                    <button
                        type="button"
                        onClick={onBack}
                        className="bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                    >
                        {isId ? 'Kembali ke Mitra' : 'Back to Partners'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <UniversalHeader onMenuClick={() => setIsMenuOpen(true)} showCityInfo={false} />
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
            />

            <div className="max-w-xl mx-auto px-4 pt-20 pb-12">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    {isId ? 'Kembali' : 'Back'}
                </button>

                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-6 text-white">
                        <h1 className="text-xl sm:text-2xl font-bold">
                            {isId ? 'Daftar Kemitraan IndaStreet' : 'IndaStreet Partner Program'}
                        </h1>
                        <p className="text-white/90 text-sm mt-1">
                            {isId
                                ? 'Isi formulir di bawah dan tim kami akan menghubungi Anda.'
                                : 'Complete the form below and our team will get in touch.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-5">
                        {submitError && (
                            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                {submitError}
                            </div>
                        )}

                        {/* Industry */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {isId ? 'Jenis industri *' : 'Industry *'}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {INDUSTRY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setFormData((p) => ({ ...p, industry: opt.value }))}
                                        className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-sm font-medium transition-colors ${
                                            formData.industry === opt.value
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                        }`}
                                    >
                                        {opt.icon}
                                        {isId ? opt.labelId : opt.labelEn}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Number of rooms (Hotel / Villa only) */}
                        {showRooms && (
                            <div>
                                <label htmlFor="numberOfRooms" className="block text-sm font-medium text-gray-700 mb-1">
                                    {isId ? 'Jumlah kamar *' : 'Number of rooms *'}
                                </label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        id="numberOfRooms"
                                        name="numberOfRooms"
                                        type="text"
                                        inputMode="numeric"
                                        placeholder={isId ? 'Contoh: 20' : 'e.g. 20'}
                                        value={formData.numberOfRooms}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Business / Property name */}
                        <div>
                            <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1">
                                {isId ? 'Nama bisnis / properti' : 'Business / property name'}
                            </label>
                            <div className="relative">
                                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="businessName"
                                    name="businessName"
                                    type="text"
                                    placeholder={isId ? 'Contoh: Hotel Indonisea' : 'e.g. Indonisea Hotel'}
                                    value={formData.businessName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Contact name */}
                        <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                                {isId ? 'Nama kontak *' : 'Contact name *'}
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="contactName"
                                    name="contactName"
                                    type="text"
                                    required
                                    value={formData.contactName}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email *
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Phone / WhatsApp */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                {isId ? 'Telepon / WhatsApp *' : 'Phone / WhatsApp *'}
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    required
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Website */}
                        <div>
                            <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                                {isId ? 'Situs web' : 'Website'}
                            </label>
                            <div className="relative">
                                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="website"
                                    name="website"
                                    type="url"
                                    placeholder="https://"
                                    value={formData.website}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Social media */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 mb-1">
                                    Instagram
                                </label>
                                <input
                                    id="instagram"
                                    name="instagram"
                                    type="text"
                                    placeholder="@ or URL"
                                    value={formData.instagram}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="facebook" className="block text-sm font-medium text-gray-700 mb-1">
                                    Facebook
                                </label>
                                <input
                                    id="facebook"
                                    name="facebook"
                                    type="text"
                                    placeholder="URL or page name"
                                    value={formData.facebook}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Additional information */}
                        <div>
                            <label htmlFor="additionalInfo" className="block text-sm font-medium text-gray-700 mb-1">
                                {isId ? 'Informasi tambahan (opsional)' : 'Additional information (optional)'}
                            </label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea
                                    id="additionalInfo"
                                    name="additionalInfo"
                                    rows={4}
                                    placeholder={
                                        isId
                                            ? 'Misalnya: lokasi, target pasar, layanan wellness yang ditawarkan, atau hal lain yang ingin Anda sampaikan.'
                                            : 'e.g. location, target market, wellness services offered, or anything else you’d like us to know.'
                                    }
                                    value={formData.additionalInfo}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-60 transition-colors"
                        >
                            {isSubmitting ? (
                                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Send className="w-5 h-5" />
                                    {isId ? 'Kirim Permohonan' : 'Submit inquiry'}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

PartnerContactPage.displayName = 'PartnerContactPage';
export default PartnerContactPage;
