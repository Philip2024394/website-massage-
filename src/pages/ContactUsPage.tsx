// 🎯 Smart Support Hub - State-of-the-art Contact & FAQ System
import React, { useState, useMemo } from 'react';
import { Mail, Phone, Clock, CheckCircle, ChevronDown, ChevronUp, User, Briefcase, Settings, Eye, Upload, Shield, Search, MessageCircle, CreditCard, UserCheck, Wrench, UserCog, Scale, List, Lightbulb } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import { submitContactForm } from '../lib/services/contactFormService';
import { FAQ_DATABASE, FAQ_CATEGORIES, type FAQItem } from '../data/faqData';
import { searchFAQ } from '../utils/faqSearch';
import SocialMediaLinks from '../components/SocialMediaLinks';

// Step progress: label + icon for each step
const SUPPORT_STEPS = [
  { step: 1, label: 'Who you are', icon: User },
  { step: 2, label: 'Your topic', icon: List },
  { step: 3, label: 'Solutions', icon: Lightbulb },
  { step: 4, label: 'Contact form', icon: Mail },
] as const;

// FAQ category icon map (for small icon before category label)
const FAQ_CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard,
  UserCheck,
  Wrench,
  UserCog,
  Scale,
};

// OWNER-CONTROLLED SUPPORT GATEWAY - Logic-heavy, Protected from AI refactors
type UserRole = 'user' | 'therapist' | 'admin' | 'browsing';
type SupportStep = 1 | 2 | 3 | 4;

const USER_ROLES = [
    { 
        id: 'user', 
        label: 'User / Client', 
        icon: User, 
        description: 'I need help with bookings, payments, or services'
    },
    { 
        id: 'therapist', 
        label: 'Therapist', 
        icon: Briefcase, 
        description: 'I need help with my profile, payments, or business'
    },
    { 
        id: 'admin', 
        label: 'Admin / Partner', 
        icon: Settings, 
        description: 'Business partnerships, admin issues'
    },
    { 
        id: 'browsing', 
        label: 'Just Browsing', 
        icon: Eye, 
        description: 'I have general questions about the platform'
    }
];

// Spec: Category dropdown for department routing (REQUIRED before submission)
const CONTACT_CATEGORIES = [
  { id: 'booking', label: 'Booking Issue', department: 'booking-support' },
  { id: 'payment', label: 'Payment Problem', department: 'finance' },
  { id: 'refund', label: 'Refund Request', department: 'finance' },
  { id: 'no-show', label: 'Therapist No-Show', department: 'booking-support' },
  { id: 'cancel', label: 'Cancel or Reschedule Booking', department: 'booking-support' },
  { id: 'login', label: 'Account Login Issue', department: 'admin' },
  { id: 'bug', label: 'App Technical Bug', department: 'admin' },
  { id: 'apply-therapist', label: 'Apply as Therapist', department: 'therapist-support' },
  { id: 'job-posting', label: 'Job Posting Issue', department: 'therapist-support' },
  { id: 'commission', label: 'Commission Question', department: 'finance' },
  { id: 'verification', label: 'Verification Status', department: 'therapist-support' },
  { id: 'cv-upload', label: 'CV Upload Problem', department: 'therapist-support' },
  { id: 'activation', label: 'Account Activation', department: 'therapist-support' },
  { id: 'partnership', label: 'Partnership Inquiry', department: 'admin' },
  { id: 'policy', label: 'Report Policy Violation', department: 'compliance' },
  { id: 'legal', label: 'Legal / Compliance', department: 'compliance' },
  { id: 'feedback', label: 'General Feedback', department: 'admin' },
  { id: 'other', label: 'Other', department: 'admin' },
];

const ISSUE_CATEGORIES = {
    user: [
        { id: 'booking', label: 'Booking Problem', priority: 'high' },
        { id: 'payment', label: 'Payment Issue', priority: 'high' },
        { id: 'refund', label: 'Refund / Cancellation', priority: 'medium' },
        { id: 'safety', label: 'Safety Concern', priority: 'critical' },
        { id: 'app', label: 'App Not Working', priority: 'medium' },
        { id: 'account', label: 'Account Access', priority: 'medium' },
        { id: 'other', label: 'Other', priority: 'low' }
    ],
    therapist: [
        { id: 'approval', label: 'Profile Approval', priority: 'high' },
        { id: 'payouts', label: 'Payments & Payouts', priority: 'high' },
        { id: 'schedule', label: 'Schedule / Availability', priority: 'medium' },
        { id: 'bug', label: 'App Bug', priority: 'medium' },
        { id: 'documents', label: 'Compliance / Documents', priority: 'medium' },
        { id: 'deactivation', label: 'Deactivation Appeal', priority: 'high' },
        { id: 'other', label: 'Other', priority: 'low' }
    ],
    admin: [
        { id: 'partnership', label: 'Partnership Inquiry', priority: 'high' },
        { id: 'integration', label: 'System Integration', priority: 'medium' },
        { id: 'billing', label: 'Business Billing', priority: 'high' },
        { id: 'compliance', label: 'Legal / Compliance', priority: 'high' },
        { id: 'api', label: 'API Access', priority: 'medium' },
        { id: 'other', label: 'Other', priority: 'low' }
    ],
    browsing: [
        { id: 'how-it-works', label: 'How It Works', priority: 'low' },
        { id: 'pricing', label: 'Pricing Information', priority: 'low' },
        { id: 'locations', label: 'Service Locations', priority: 'low' },
        { id: 'become-therapist', label: 'Become a Therapist', priority: 'medium' },
        { id: 'other', label: 'Other Questions', priority: 'low' }
    ]
};

const SMART_ANSWERS = {
    booking: [
        {
            question: "Why did my booking fail?",
            answer: "Booking failures usually happen due to: 1) Payment method issues 2) Therapist unavailability 3) Location restrictions. Try selecting a different time slot or payment method.",
            action: { label: "Try Booking Again", redirect: "home" }
        },
        {
            question: "How do I change my booking time?",
            answer: "You can modify your booking up to 2 hours before the scheduled time through your booking history in the app.",
            action: { label: "Go to My Bookings", redirect: "bookings" }
        },
        {
            question: "What if therapist doesn't show up?",
            answer: "If your therapist doesn't arrive within 15 minutes of scheduled time, you'll receive a full refund automatically. You can also report no-shows through the app.",
            action: { label: "Report Issue", redirect: "support" }
        }
    ],
    payment: [
        {
            question: "Payment was charged but booking failed",
            answer: "Don't worry! If payment was processed but booking failed, you'll receive an automatic refund within 24-48 hours. Check your payment method for pending refunds.",
            action: { label: "Check Refund Status", redirect: "payments" }
        },
        {
            question: "Which payment methods do you accept?",
            answer: "We accept credit/debit cards, digital wallets, bank transfers, and local payment methods depending on your location.",
            action: null
        }
    ],
    safety: [
        {
            question: "How do I report a safety concern?",
            answer: "Safety is our top priority. Report any concerns immediately through our 24/7 safety hotline or the emergency button in the app.",
            action: { label: "Report Safety Issue", redirect: "safety" }
        }
    ],
    approval: [
        {
            question: "How long does profile approval take?",
            answer: "Profile approval typically takes 24-48 hours after all required documents are submitted. Make sure you've uploaded clear photos of your certifications and ID.",
            action: { label: "Check Application Status", redirect: "therapist-dashboard" }
        },
        {
            question: "What documents do I need?",
            answer: "You need: 1) Valid massage therapy certification 2) Government-issued ID 3) Bank account details 4) Recent photo. All documents must be clear and unexpired.",
            action: { label: "Upload Documents", redirect: "therapist-onboarding" }
        }
    ],
    payouts: [
        {
            question: "When do I get paid?",
            answer: "Payouts are processed weekly on Fridays for the previous week's completed sessions. Funds typically arrive within 2-3 business days.",
            action: { label: "View Payout History", redirect: "therapist-payments" }
        }
    ]
};

// Quick contact (aligned with AdminSupportDashboard)
const SUPPORT_EMAIL = 'indastreet.id@gmail.com';
const SUPPORT_WHATSAPP = '6281392000050';
const WHATSAPP_URL = `https://wa.me/${SUPPORT_WHATSAPP}?text=${encodeURIComponent('Hi IndaStreet, I need support.')}`;

const COUNTRIES = [
    { code: 'ID', name: 'Indonesia', flag: '🇮🇩', phone: '+62' },
    { code: 'US', name: 'United States', flag: '🇺🇸', phone: '+1' },
    { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', phone: '+44' },
    { code: 'AU', name: 'Australia', flag: '🇦🇺', phone: '+61' },
    { code: 'SG', name: 'Singapore', flag: '🇸🇬', phone: '+65' },
    { code: 'MY', name: 'Malaysia', flag: '🇲🇾', phone: '+60' },
    { code: 'TH', name: 'Thailand', flag: '🇹🇭', phone: '+66' },
    { code: 'PH', name: 'Philippines', flag: '🇵🇭', phone: '+63' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵', phone: '+81' },
    { code: 'KR', name: 'South Korea', flag: '🇰🇷', phone: '+82' }
];

interface ContactUsPageProps {
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
    language: propLanguage,
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
    places = []
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { language: contextLanguage } = useLanguage();
    const language = propLanguage ?? contextLanguage;
    const { t } = useTranslations(language as 'en' | 'id');
    
    // Smart Triage State
    const [currentStep, setCurrentStep] = useState<SupportStep>(1);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [expandedAnswers, setExpandedAnswers] = useState<number[]>([]);
    const [problemSolved, setProblemSolved] = useState<boolean | null>(null);
    
    // Contact Form State (only shows if problemSolved === false)
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        message: '',
        subject: '',
        country: 'ID',
        contactCategory: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showSuccessState, setShowSuccessState] = useState(false);

    // Smart Support Hub - search-first flow
    const [searchQuery, setSearchQuery] = useState('');
    const [showContactForm, setShowContactForm] = useState(false);
    const [faqExpandedIds, setFaqExpandedIds] = useState<string[]>([]);
    const faqSuggestions = useMemo(() => searchFAQ(searchQuery, FAQ_DATABASE, 3), [searchQuery]);

    const handleRoleSelect = (role: UserRole) => {
        setSelectedRole(role);
        setCurrentStep(2);
        setSelectedCategory('');
        setProblemSolved(null);
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        setCurrentStep(3);
        setExpandedAnswers([]);
        setProblemSolved(null);
    };

    const toggleAnswer = (index: number) => {
        if (expandedAnswers.includes(index)) {
            setExpandedAnswers(expandedAnswers.filter(i => i !== index));
        } else {
            setExpandedAnswers([...expandedAnswers, index]);
        }
    };

    const handleProblemResolution = (solved: boolean) => {
        setProblemSolved(solved);
        if (solved) {
            setTimeout(() => {
                setCurrentStep(1);
                setSelectedRole(null);
                setSelectedCategory('');
                setProblemSolved(null);
                setExpandedAnswers([]);
            }, 3000);
        } else {
            setCurrentStep(4);
            // Map role flow category to contact category for form
            if (selectedCategory && !formData.contactCategory) {
                const map: Record<string, string> = {
                    booking: 'booking', payment: 'payment', refund: 'refund', approval: 'apply-therapist',
                    payouts: 'commission', bug: 'bug', account: 'login', partnership: 'partnership',
                    compliance: 'legal', other: 'other', safety: 'no-show', app: 'bug',
                    documents: 'verification', deactivation: 'activation', schedule: 'other',
                };
                setFormData((prev) => ({ ...prev, contactCategory: map[selectedCategory] || 'other' }));
            }
        }
    };

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        setIsSubmitting(true);
        const category = CONTACT_CATEGORIES.find((c) => c.id === formData.contactCategory);
        const result = await submitContactForm({
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            country: formData.country,
            message: formData.message,
            subject: formData.subject,
            userRole: selectedRole || undefined,
            issueCategory: formData.contactCategory || selectedCategory || undefined,
            department: category?.department,
        });
        
        setIsSubmitting(false);
        
        if (result.success) {
            setFormData({ fullName: '', email: '', phone: '', message: '', subject: '', country: 'ID', contactCategory: '' });
            setShowContactForm(false);
            setCurrentStep(1);
            setSelectedRole(null);
            setSelectedCategory('');
            setProblemSolved(null);
            setExpandedAnswers([]);
            setShowSuccessState(true);
            setTimeout(() => setShowSuccessState(false), 4500);
        } else {
            setSubmitError(result.error || 'Submission failed');
            if (result.mailtoUrl) {
                const useMailto = window.confirm(
                    'Unable to submit via form. Would you like to open your email client to send your message directly?'
                );
                if (useMailto) {
                    window.location.href = result.mailtoUrl;
                }
            } else {
                alert('Sorry, we couldn\'t submit your request. Please try again or email us at indastreet.id@gmail.com');
            }
        }
    };

    const resetProcess = () => {
        setCurrentStep(1);
        setSelectedRole(null);
        setSelectedCategory('');
        setProblemSolved(null);
        setExpandedAnswers([]);
        setShowContactForm(false);
        setFormData({ fullName: '', email: '', phone: '', message: '', subject: '', country: 'ID', contactCategory: '' });
    };

    const currentCategories = selectedRole ? ISSUE_CATEGORIES[selectedRole] : [];
    const currentAnswers = selectedCategory ? SMART_ANSWERS[selectedCategory] || [] : [];
    const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 overflow-x-hidden pt-14 sm:pt-16">
            {/* Universal Header - same as Home: brand, language (Indonesian first for ID), menu; plus home button */}
            <UniversalHeader 
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
                showLanguageSelector={!!onLanguageChange}
                countryCode="ID"
            />
            
            {/* Global App Drawer */}
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
                language={language as 'en' | 'id' | 'gb'}
            />

            {/* Hero Section - design flow with Home; mobile-responsive */}
            <div className="relative bg-gradient-to-b from-orange-50/80 via-white to-white border-b border-gray-100">
                {/* Subtle accent line (matches home orange branding) */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-400 to-transparent opacity-60" aria-hidden />
                <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12 md:py-16">
                    <div className="text-center">
                        <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-orange-100 text-orange-600 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Typically respond within 24 hours
                        </span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 tracking-tight px-1">
                            How Can We Help You?
                        </h1>
                        <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 max-w-2xl mx-auto px-1">
                            Find instant answers or contact the right team below.
                        </p>
                        {/* Quick contact strip - Email & WhatsApp */}
                        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                            <a
                                href={`mailto:${SUPPORT_EMAIL}`}
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-black/60 backdrop-blur-xl border border-white/10 text-white text-sm sm:text-base font-medium shadow-lg hover:bg-black/70 transition-all duration-300"
                            >
                                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                Email us
                            </a>
                            <a
                                href={WHATSAPP_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 rounded-full bg-[#25D366]/80 backdrop-blur-xl border border-white/20 text-white text-sm sm:text-base font-medium shadow-lg hover:bg-[#25D366]/90 transition-all duration-300"
                            >
                                <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                                WhatsApp
                            </a>
                        </div>

                        {/* Smart Search Bar */}
                        <div className="relative max-w-2xl mx-auto mb-4">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Type your question..."
                                className="w-full pl-12 sm:pl-14 pr-4 sm:pr-5 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all placeholder-gray-400"
                            />
                            {/* FAQ Suggestions - shown when typing */}
                            {searchQuery.trim().length >= 2 && faqSuggestions.length > 0 && (
                                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-[9998] overflow-hidden">
                                    {faqSuggestions.map((faq) => (
                                        <div key={faq.id} className="p-4 border-b border-gray-100 last:border-0 hover:bg-orange-50">
                                            <p className="font-semibold text-gray-900 mb-1">{faq.question}</p>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{faq.answer}</p>
                                            <div className="flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setFaqExpandedIds((prev) => (prev.includes(faq.id) ? prev : [...prev, faq.id]));
                                                        setSearchQuery('');
                                                    }}
                                                    className="text-sm font-medium text-orange-600 hover:text-orange-700"
                                                >
                                                    Expand
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setProblemSolved(true);
                                                        setSearchQuery('');
                                                        setTimeout(resetProcess, 2500);
                                                    }}
                                                    className="text-sm font-medium text-green-600 hover:text-green-700"
                                                >
                                                    Yes, this answers my question
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setShowContactForm(true);
                                                        setSearchQuery('');
                                                    }}
                                                    className="text-sm font-medium text-gray-600 hover:text-gray-700"
                                                >
                                                    No, I still need help
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Progress Indicator - badges with icons + step labels */}
                        <div className="flex flex-wrap items-end justify-center gap-2 sm:gap-4 mb-8" style={{ display: !showContactForm && currentStep > 1 ? 'flex' : 'none' }}>
                            {SUPPORT_STEPS.map(({ step, label, icon: Icon }, index) => {
                                const isActive = currentStep >= step;
                                const isCurrent = currentStep === step;
                                return (
                                    <React.Fragment key={step}>
                                        <div className="flex flex-col items-center gap-1.5 min-w-[4rem]">
                                            <div
                                                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 ${
                                                    isActive
                                                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                                                        : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                                } ${isCurrent ? 'ring-2 ring-orange-300 ring-offset-2' : ''}`}
                                            >
                                                <Icon className="w-5 h-5" />
                                            </div>
                                            <span className={`text-xs font-medium text-center max-w-[5rem] leading-tight ${isActive ? 'text-gray-700' : 'text-gray-400'}`}>
                                                {label}
                                            </span>
                                        </div>
                                        {index < SUPPORT_STEPS.length - 1 && (
                                            <div className={`hidden sm:block w-8 h-0.5 mb-5 flex-shrink-0 transition-all duration-300 ${
                                                currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container - mobile-friendly padding */}
            <div className="max-w-4xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
                
                {/* STEP 1: Role Selection */}
                {currentStep === 1 && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-3 sm:mb-4">
                                First, tell us who you are
                            </h2>
                            <p className="text-gray-600 font-light">
                                This helps us personalize your support experience
                            </p>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                            {USER_ROLES.map((role) => {
                                const IconComponent = role.icon;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id as UserRole)}
                                        className="group p-5 sm:p-6 md:p-8 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-2xl transition-all duration-300 text-left hover:shadow-lg hover:shadow-orange-100 hover:-translate-y-1 active:translate-y-0"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-14 h-14 bg-gray-50 group-hover:bg-orange-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                                                <IconComponent className="w-7 h-7 text-gray-600 group-hover:text-orange-600" />
                                            </div>
                                            <h3 className="text-xl font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                                                {role.label}
                                            </h3>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed font-light">
                                            {role.description}
                                        </p>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* STEP 2: Category Selection */}
                {currentStep === 2 && selectedRole && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <button 
                                onClick={resetProcess}
                                className="text-orange-500 hover:text-orange-600 text-sm mb-6 flex items-center gap-2 mx-auto font-medium transition-colors"
                            >
                                ← Change role
                            </button>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-3 sm:mb-4">
                                What can we help you with?
                            </h2>
                            <p className="text-gray-600 font-light">
                                Select the category that best describes your issue
                            </p>
                        </div>
                        
                        <div className="grid gap-4">
                            {currentCategories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category.id)}
                                    className="group p-6 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl transition-all duration-300 text-left flex items-center justify-between hover:shadow-md hover:shadow-orange-100 hover:-translate-y-0.5"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                            category.priority === 'critical' ? 'bg-red-500 group-hover:shadow-lg group-hover:shadow-red-200' :
                                            category.priority === 'high' ? 'bg-orange-500 group-hover:shadow-lg group-hover:shadow-orange-200' :
                                            category.priority === 'medium' ? 'bg-yellow-500 group-hover:shadow-lg group-hover:shadow-yellow-200' :
                                            'bg-green-500 group-hover:shadow-lg group-hover:shadow-green-200'
                                        }`} />
                                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-orange-600 transition-colors">
                                            {category.label}
                                        </h3>
                                    </div>
                                    <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-orange-500 transition-all duration-300 group-hover:translate-x-1" />
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* STEP 3: Smart Answers */}
                {currentStep === 3 && currentAnswers.length > 0 && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <button 
                                onClick={() => setCurrentStep(2)}
                                className="text-orange-500 hover:text-orange-600 text-sm mb-6 flex items-center gap-2 mx-auto font-medium transition-colors"
                            >
                                ← Change category
                            </button>
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-3 sm:mb-4">
                                Common Solutions
                            </h2>
                            <p className="text-gray-600 font-light">
                                Check if any of these answers solve your problem
                            </p>
                        </div>
                        
                        <div className="space-y-4">
                            {currentAnswers.map((item, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-gray-100 transition-all duration-300">
                                    <button
                                        onClick={() => toggleAnswer(index)}
                                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                    >
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {item.question}
                                        </h3>
                                        {expandedAnswers.includes(index) ? 
                                            <ChevronUp className="w-5 h-5 text-orange-500 transition-transform duration-300" /> :
                                            <ChevronDown className="w-5 h-5 text-gray-400 transition-transform duration-300" />
                                        }
                                    </button>
                                    
                                    {expandedAnswers.includes(index) && (
                                        <div className="px-6 pb-6 border-t border-gray-100 bg-gray-50">
                                            <p className="text-gray-700 leading-relaxed mb-4 font-light">
                                                {item.answer}
                                            </p>
                                            {item.action && (
                                                <button
                                                    onClick={() => onNavigate?.(item.action.redirect)}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-200"
                                                >
                                                    {item.action.label}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Decision Gate */}
                        <div className="mt-12 p-8 bg-white border border-gray-200 rounded-2xl text-center shadow-sm">
                            <h3 className="text-2xl font-light text-gray-900 mb-6">
                                Did this solve your problem?
                            </h3>
                            <div className="flex gap-4 justify-center flex-wrap">
                                <button
                                    onClick={() => handleProblemResolution(true)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 hover:shadow-lg hover:shadow-green-200"
                                >
                                    <CheckCircle className="w-5 h-5" />
                                    Yes, I'm all set!
                                </button>
                                <button
                                    onClick={() => handleProblemResolution(false)}
                                    className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-200"
                                >
                                    No, I need more help
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Success State - FAQ flow */}
                {problemSolved === true && !showSuccessState && (
                    <div className="text-center py-20 animate-fade-in">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-4xl font-light text-gray-900 mb-4">
                            Great! We're glad we could help
                        </h2>
                        <p className="text-gray-600 font-light mb-8">
                            Redirecting you back to get help with anything else...
                        </p>
                    </div>
                )}

                {/* Success State - Form submission (in-page, no alert) */}
                {showSuccessState && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm animate-fade-in">
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md w-full text-center animate-fade-in-down">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                                <CheckCircle className="w-9 h-9 text-green-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 mb-2">Request received</h2>
                            <p className="text-orange-600 text-sm mb-6 font-medium">
                                We typically respond within 24 hours. Check your email for updates.
                            </p>
                            <button
                                type="button"
                                onClick={() => setShowSuccessState(false)}
                                className="px-6 py-2.5 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-colors"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* FAQ Accordion - always visible below search */}
                {!showContactForm && (
                    <div className="space-y-6 mt-12">
                        <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
                        {FAQ_CATEGORIES.map((cat) => {
                            const items = FAQ_DATABASE.filter((f) => f.category === cat.id);
                            if (items.length === 0) return null;
                            const IconComponent = cat.icon ? FAQ_CATEGORY_ICONS[cat.icon] : null;
                            return (
                                <div key={cat.id} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setFaqExpandedIds((prev) => (prev.includes(cat.id) ? prev.filter((x) => x !== cat.id) : [...prev, cat.id]))}
                                        className="w-full px-6 py-4 flex justify-between items-center text-left hover:bg-gray-50 gap-3"
                                    >
                                        <span className="flex items-center gap-3 min-w-0">
                                            {cat.imageUrl ? (
                                                <img src={cat.imageUrl} alt="" className="w-7 h-7 object-contain flex-shrink-0 rounded" />
                                            ) : IconComponent ? (
                                                <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                                    <IconComponent className="w-4 h-4" />
                                                </span>
                                            ) : null}
                                            <span className="font-semibold text-gray-900">{cat.label}</span>
                                        </span>
                                        {faqExpandedIds.includes(cat.id) ? <ChevronUp className="w-5 h-5 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 flex-shrink-0" />}
                                    </button>
                                    {faqExpandedIds.includes(cat.id) && (
                                        <div className="px-6 pb-4 space-y-2 border-t border-gray-100">
                                            {items.map((item) => (
                                                <div key={item.id} className="pt-4">
                                                    <p className="font-medium text-gray-900 mb-2">{item.question}</p>
                                                    <p className="text-gray-600 text-sm leading-relaxed">{item.answer}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* STEP 4: Contact Form (Smart, Context-Aware) - also shown when "contact us directly" */}
                {((currentStep === 4 && problemSolved === false) || showContactForm) && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            {showContactForm && (
                                <button
                                    type="button"
                                    onClick={() => setShowContactForm(false)}
                                    className="text-orange-500 hover:text-orange-600 text-sm mb-6 flex items-center gap-2 mx-auto font-medium"
                                >
                                    ← Back to FAQ & Search
                                </button>
                            )}
                            <h2 className="text-xl sm:text-2xl md:text-3xl font-light text-gray-900 mb-3 sm:mb-4">
                                Still need help? Contact our team
                            </h2>
                            <p className="text-gray-600 font-light mb-8">
                                Our team will reach out with a solution tailored to your specific situation
                            </p>
                            
                            {/* Context Summary - when from role flow */}
                            {selectedRole && selectedCategory && (
                                <div className="mt-6 p-6 bg-orange-50 border border-orange-200 rounded-xl text-left max-w-md mx-auto">
                                    <h4 className="text-sm font-semibold text-orange-700 mb-3">Context we already have:</h4>
                                    <div className="text-sm text-gray-700 space-y-2 font-light">
                                        <p>• Role: <span className="font-medium text-gray-900">{USER_ROLES.find(r => r.id === selectedRole)?.label}</span></p>
                                        <p>• Issue: <span className="font-medium text-gray-900">{currentCategories.find(c => c.id === selectedCategory)?.label}</span></p>
                                        <p>• Tried: <span className="font-medium text-gray-900">Self-service solutions</span></p>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="max-w-2xl mx-auto">
                            <form onSubmit={handleFormSubmit} className="space-y-6 sm:space-y-8 bg-white p-5 sm:p-6 md:p-8 rounded-2xl border border-gray-200 shadow-lg shadow-gray-200/50">
                                {/* Category - REQUIRED */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">
                                        Please select the closest topic so our team can direct your request to the correct department *
                                    </label>
                                    <select
                                        required
                                        value={formData.contactCategory}
                                        onChange={(e) => setFormData({ ...formData, contactCategory: e.target.value })}
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 text-base"
                                    >
                                        <option value="">Select topic</option>
                                        <optgroup label="Customer Related">
                                            {CONTACT_CATEGORIES.filter((c) => ['booking', 'payment', 'refund', 'no-show', 'cancel', 'login', 'bug'].includes(c.id)).map((c) => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Therapist Related">
                                            {CONTACT_CATEGORIES.filter((c) => ['apply-therapist', 'job-posting', 'commission', 'verification', 'cv-upload', 'activation'].includes(c.id)).map((c) => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </optgroup>
                                        <optgroup label="Business & Admin">
                                            {CONTACT_CATEGORIES.filter((c) => ['partnership', 'policy', 'legal', 'feedback', 'other'].includes(c.id)).map((c) => (
                                                <option key={c.id} value={c.id}>{c.label}</option>
                                            ))}
                                        </optgroup>
                                    </select>
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        placeholder="Your full name"
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 text-base"
                                    />
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        placeholder="your.email@example.com"
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 font-light"
                                    />
                                </div>

                                {/* Phone/WhatsApp */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">
                                        Phone / WhatsApp (Optional)
                                    </label>
                                    <div className="flex gap-3">
                                        <select
                                            value={formData.country}
                                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                                            className="px-4 py-4 bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 transition-all duration-300"
                                        >
                                            {COUNTRIES.map(country => (
                                                <option key={country.code} value={country.code}>
                                                    {country.flag} {country.phone}
                                                </option>
                                            ))}
                                        </select>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            placeholder="8123456789"
                                            className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 font-light"
                                        />
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">Subject *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.subject}
                                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                        placeholder="Brief summary of your issue"
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 text-base"
                                    />
                                </div>

                                {/* Message */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">
                                        Message *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        rows={6}
                                        minLength={40}
                                        placeholder="Please describe your situation in detail. The more information you provide, the faster we can help."
                                        className="w-full px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none font-light text-base"
                                    />
                                    <p className="text-xs text-gray-500 mt-2 font-light">
                                        Minimum 40 characters. Current: <span className="font-medium">{formData.message.length}</span>
                                    </p>
                                </div>

                                {/* File Upload */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">
                                        Screenshots (Optional)
                                    </label>
                                    <div className="border-2 border-dashed border-gray-300 hover:border-orange-400 rounded-xl p-8 text-center transition-all duration-300 bg-gray-50 hover:bg-orange-50">
                                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600 mb-2 font-light">Drag & drop screenshots here</p>
                                        <button type="button" className="text-orange-500 hover:text-orange-600 font-medium transition-colors">
                                            or click to browse
                                        </button>
                                    </div>
                                </div>

                                {submitError && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                        {submitError}
                                    </div>
                                )}
                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={!formData.contactCategory || formData.message.length < 40 || isSubmitting}
                                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-200 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="animate-pulse">Sending...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="w-5 h-5" />
                                            Send Contextual Request
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Trust Signals */}
                            <div className="grid md:grid-cols-2 gap-8 pt-8 mt-8 border-t border-gray-200">
                                <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300">
                                    <Clock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                                    <h4 className="font-medium text-gray-900 mb-1">Quick Response</h4>
                                    <p className="text-sm text-orange-600 font-medium">We typically respond within 24 hours</p>
                                </div>
                                <div className="text-center p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-300">
                                    <Shield className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                                    <h4 className="font-medium text-gray-900 mb-1">Priority Support</h4>
                                    <p className="text-sm text-gray-600 font-light">Safety issues are prioritized</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer - same as Home: brand, social, quick links; mobile-friendly */}
            <footer className="mt-10 sm:mt-12 mb-6 pb-6 flex flex-col items-center gap-2 px-3 sm:px-4">
                <div className="font-bold text-lg">
                    <span className="text-black">Inda</span>
                    <span className="text-orange-500">Street</span>
                </div>
                <SocialMediaLinks className="mt-2" />
                <div className="mt-8 pt-6 border-t border-gray-200 w-full max-w-2xl">
                    <h3 className="text-center text-lg font-bold text-gray-800 mb-4">Quick Links</h3>
                    <div className="flex flex-wrap justify-center gap-1">
                        <button
                            type="button"
                            onClick={() => onNavigate?.('massage-types')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Massage Types
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('facial-types')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Facial Types
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('therapist-signup')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Join as a Therapist Today
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('place-signup')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Join Massage Place Today
                        </button>
                        <button
                            type="button"
                            onClick={() => onNavigate?.('facial-place-signup')}
                            className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                        >
                            Join Facial Place Today
                        </button>
                        {onTermsClick && (
                            <button
                                type="button"
                                onClick={onTermsClick}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Terms
                            </button>
                        )}
                        {onPrivacyClick && (
                            <button
                                type="button"
                                onClick={onPrivacyClick}
                                className="px-4 py-2 text-black hover:text-orange-600 transition-colors text-sm font-medium"
                            >
                                Privacy
                            </button>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ContactUsPage;

