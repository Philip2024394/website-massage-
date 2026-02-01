// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, Globe, Clock, CheckCircle, ChevronDown, ChevronUp, User, Briefcase, Settings, Eye, Upload, Shield } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import UniversalHeader from '../components/shared/UniversalHeader';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';

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
    // Add navigation props for the drawer
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
    const { language } = useLanguage();
    const { t } = useTranslations(language as 'en' | 'id');
    
    // Smart Triage State
    const [currentStep, setCurrentStep] = useState<SupportStep>(1);
    const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [expandedAnswers, setExpandedAnswers] = useState<number[]>([]);
    const [problemSolved, setProblemSolved] = useState<boolean | null>(null);
    
    // Contact Form State (only shows if problemSolved === false)
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        message: '',
        country: 'ID'
    });

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
            // Reset after 3 seconds to allow for new inquiries
            setTimeout(() => {
                setCurrentStep(1);
                setSelectedRole(null);
                setSelectedCategory('');
                setProblemSolved(null);
                setExpandedAnswers([]);
            }, 3000);
        } else {
            setCurrentStep(4);
        }
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prepare contextual data
        const contextData = {
            userRole: selectedRole,
            issueCategory: selectedCategory,
            timestamp: new Date().toISOString(),
            ...formData
        };
        
        console.log('Contextual support request:', contextData);
        alert('Thank you! Your request has been submitted with full context. We typically respond within 24 hours for priority issues.');
        
        // Reset form
        setFormData({ email: '', phone: '', message: '', country: 'ID' });
        setTimeout(() => {
            setCurrentStep(1);
            setSelectedRole(null);
            setSelectedCategory('');
            setProblemSolved(null);
            setExpandedAnswers([]);
        }, 2000);
    };

    const resetProcess = () => {
        setCurrentStep(1);
        setSelectedRole(null);
        setSelectedCategory('');
        setProblemSolved(null);
        setExpandedAnswers([]);
        setFormData({ email: '', phone: '', message: '', country: 'ID' });
    };

    const currentCategories = selectedRole ? ISSUE_CATEGORIES[selectedRole] : [];
    const currentAnswers = selectedCategory ? SMART_ANSWERS[selectedCategory] || [] : [];
    const selectedCountry = COUNTRIES.find(c => c.code === formData.country);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            {/* Universal Header */}
            <UniversalHeader 
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
                showLanguageSelector={false}
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

            {/* Hero Section - Clean, Minimalistic */}
            <div className="bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-light text-gray-900 mb-6">
                            How can we help?
                        </h1>
                        <p className="text-xl text-gray-600 mb-12 font-light leading-relaxed max-w-2xl mx-auto">
                            Select a topic below to get instant answers or contact our team.
                        </p>
                        
                        {/* Progress Indicator */}
                        <div className="flex items-center justify-center gap-3 mb-8">
                            {[1, 2, 3, 4].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div 
                                        className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                                            currentStep >= step 
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' 
                                                : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                                        }`}
                                    >
                                        {step}
                                    </div>
                                    {step < 4 && (
                                        <div className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                                            currentStep > step ? 'bg-orange-500' : 'bg-gray-200'
                                        }`} />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                
                {/* STEP 1: Role Selection */}
                {currentStep === 1 && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-light text-gray-900 mb-4">
                                First, tell us who you are
                            </h2>
                            <p className="text-gray-600 font-light">
                                This helps us personalize your support experience
                            </p>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-6">
                            {USER_ROLES.map((role) => {
                                const IconComponent = role.icon;
                                return (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role.id as UserRole)}
                                        className="group p-8 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-2xl transition-all duration-300 text-left hover:shadow-lg hover:shadow-orange-100"
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
                            <h2 className="text-3xl font-light text-gray-900 mb-4">
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
                                    className="group p-6 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-xl transition-all duration-300 text-left flex items-center justify-between hover:shadow-md hover:shadow-orange-100"
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
                            <h2 className="text-3xl font-light text-gray-900 mb-4">
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

                {/* Success State */}
                {problemSolved === true && (
                    <div className="text-center py-20">
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

                {/* STEP 4: Contact Form (Smart, Context-Aware) */}
                {currentStep === 4 && problemSolved === false && (
                    <div className="space-y-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-light text-gray-900 mb-4">
                                Let's get you personalized help
                            </h2>
                            <p className="text-gray-600 font-light mb-8">
                                Our team will reach out with a solution tailored to your specific situation
                            </p>
                            
                            {/* Context Summary */}
                            <div className="mt-6 p-6 bg-orange-50 border border-orange-200 rounded-xl text-left max-w-md mx-auto">
                                <h4 className="text-sm font-semibold text-orange-700 mb-3">Context we already have:</h4>
                                <div className="text-sm text-gray-700 space-y-2 font-light">
                                    <p>• Role: <span className="font-medium text-gray-900">{USER_ROLES.find(r => r.id === selectedRole)?.label}</span></p>
                                    <p>• Issue: <span className="font-medium text-gray-900">{currentCategories.find(c => c.id === selectedCategory)?.label}</span></p>
                                    <p>• Tried: <span className="font-medium text-gray-900">Self-service solutions</span></p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="max-w-2xl mx-auto">
                            <form onSubmit={handleFormSubmit} className="space-y-8 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
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

                                {/* Smart Message Field */}
                                <div>
                                    <label className="block text-gray-900 font-medium mb-3 text-sm">
                                        Tell us more about your situation *
                                    </label>
                                    <textarea
                                        required
                                        value={formData.message}
                                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                                        rows={6}
                                        minLength={40}
                                        placeholder={`Please describe what happened with your ${currentCategories.find(c => c.id === selectedCategory)?.label.toLowerCase()}. The more detail you provide, the faster we can help.`}
                                        className="w-full px-6 py-4 bg-gray-50 border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 resize-none font-light"
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

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={formData.message.length < 40}
                                    className="w-full py-4 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-orange-200 disabled:cursor-not-allowed"
                                >
                                    <Mail className="w-5 h-5" />
                                    Send Contextual Request
                                </button>
                            </form>

                            {/* Trust Signals */}
                            <div className="grid md:grid-cols-2 gap-8 pt-8 mt-8 border-t border-gray-200">
                                <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
                                    <Clock className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                                    <h4 className="font-medium text-gray-900 mb-1">Quick Response</h4>
                                    <p className="text-sm text-gray-600 font-light">We typically respond within 24 hours</p>
                                </div>
                                <div className="text-center p-6 bg-white rounded-xl border border-gray-200">
                                    <Shield className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                                    <h4 className="font-medium text-gray-900 mb-1">Priority Support</h4>
                                    <p className="text-sm text-gray-600 font-light">Safety issues are prioritized</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContactUsPage;

