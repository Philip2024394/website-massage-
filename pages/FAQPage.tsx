import React, { useState } from 'react';
import { Search, MessageCircle, Phone, Mail, HelpCircle, Users, CreditCard, Shield, Clock, MapPin, ThumbsUp, ArrowLeft, Plus, X } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import FloatingPageFooter from '../components/FloatingPageFooter';

interface FAQ {
    question: string;
    answer: string;
    category: string;
    tags?: string[];
}

interface FAQPageProps {
    onNavigate?: (page: string) => void;
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

const FAQPage: React.FC<FAQPageProps> = ({ 
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
    const { language } = useLanguage();
    const { t } = useTranslations(language);
    const [activeCategory, setActiveCategory] = useState<string>('general');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [faqFeedback, setFaqFeedback] = useState<{[key: number]: 'like' | 'dislike' | null}>({});

    // Modern category design with icons
    const categories = [
        { 
            id: 'general', 
            name: 'General', 
            icon: HelpCircle, 
            color: 'from-blue-500 to-blue-600',
            count: 8
        },
        { 
            id: 'booking', 
            name: 'Bookings', 
            icon: Clock, 
            color: 'from-emerald-500 to-emerald-600',
            count: 12
        },
        { 
            id: 'therapist', 
            name: 'For Therapists', 
            icon: Users, 
            color: 'from-purple-500 to-purple-600',
            count: 15
        },
        { 
            id: 'business', 
            name: 'For Businesses', 
            icon: MapPin, 
            color: 'from-orange-500 to-orange-600',
            count: 10
        },
        { 
            id: 'payment', 
            name: 'Payments', 
            icon: CreditCard, 
            color: 'from-pink-500 to-pink-600',
            count: 7
        },
        { 
            id: 'safety', 
            name: 'Safety & Privacy', 
            icon: Shield, 
            color: 'from-red-500 to-red-600',
            count: 6
        }
    ];

    // Comprehensive FAQ data
    const faqs: FAQ[] = [
        // GENERAL
        {
            category: 'general',
            question: 'What is IndaStreet?',
            answer: 'IndaStreet is Indonesia\'s premier massage booking platform connecting users with over 2,000+ verified professional massage therapists, luxury spas, and wellness centers across Indonesia. We offer instant booking for home service, hotel, spa, and villa locations with secure payment processing.',
            tags: ['about', 'platform', 'overview']
        },
        {
            category: 'general',
            question: 'How does IndaStreet work?',
            answer: 'Simply browse our verified therapists and spas, select your preferred service type and location, choose your date and time, then book instantly through our secure platform. You can book for your home, hotel, or visit a spa location. Payment is processed securely, and you\'ll receive confirmation via WhatsApp.',
            tags: ['how-to', 'booking process']
        },
        {
            category: 'general',
            question: 'Which cities does IndaStreet serve?',
            answer: 'We currently operate in major Indonesian cities including Jakarta, Bali (Denpasar, Ubud, Sanur), Surabaya, Bandung, Yogyakarta, Semarang, Medan, Makassar, and Palembang. We\'re rapidly expanding to cover more cities across Indonesia.',
            tags: ['locations', 'coverage', 'cities']
        },
        {
            category: 'general',
            question: 'Is IndaStreet available as a mobile app?',
            answer: 'Currently IndaStreet is a mobile-optimized website that works perfectly on smartphones, tablets, and desktops. You can add our website to your home screen for an app-like experience. Native iOS and Android apps are planned for Q2 2025 with offline booking and push notifications.',
            tags: ['mobile app', 'website', 'technology']
        },
        {
            category: 'general',
            question: 'What types of massage services are available?',
            answer: 'We offer traditional Indonesian massage, Balinese massage, deep tissue, Swedish, reflexology, hot stone, aromatherapy, prenatal massage, sports massage, and specialized treatments. Each therapist lists their specialties and certifications on their profile.',
            tags: ['services', 'massage types', 'treatments']
        },
        {
            category: 'general',
            question: 'How do I create an account?',
            answer: 'You can browse services without an account, but creating one allows you to save favorites, track bookings, earn loyalty points, and receive personalized recommendations. Simply click "Sign Up" and register with your phone number or email.',
            tags: ['account', 'registration', 'sign up']
        },
        {
            category: 'general',
            question: 'Is there a membership or subscription fee?',
            answer: 'No, creating an account and browsing services is completely free. You only pay for the massage services you book. Some premium features like priority booking and extended warranties may require membership upgrades.',
            tags: ['pricing', 'membership', 'fees']
        },
        {
            category: 'general',
            question: 'How can I contact customer support?',
            answer: 'Reach us via WhatsApp at +62-XXX-XXXX, email at support@indastreet.id, or through our in-app chat feature. Our support team is available 7 days a week from 8 AM to 10 PM WIB.',
            tags: ['support', 'contact', 'help']
        },

        // BOOKING
        {
            category: 'booking',
            question: 'How do I book a massage session?',
            answer: 'Select your city and service type, browse available therapists or spas, choose your preferred provider, select date and time, enter your location details, and confirm payment. You\'ll receive instant confirmation via WhatsApp with therapist contact details.',
            tags: ['booking process', 'how-to', 'steps']
        },
        {
            category: 'booking',
            question: 'Can I book for the same day?',
            answer: 'Yes! Many therapists accept same-day bookings. Use our "Available Now" filter to see providers who can start within 2-4 hours. Popular time slots may fill up quickly, so book early for best availability.',
            tags: ['same day', 'immediate booking', 'availability']
        },
        {
            category: 'booking',
            question: 'How far in advance can I book?',
            answer: 'You can book up to 30 days in advance. For special occasions, holidays, or popular therapists, we recommend booking 3-7 days ahead to ensure availability.',
            tags: ['advance booking', 'planning', 'schedule']
        },
        {
            category: 'booking',
            question: 'Can I cancel or reschedule my booking?',
            answer: 'SCHEDULED BOOKINGS: Require non-refundable deposit. Dates may be changed in advance with therapist agreement. IMMEDIATE BOOKINGS: Free cancellation up to 4 hours before session. All changes subject to therapist availability and require minimum 24 hours notice.',
            tags: ['cancellation', 'rescheduling', 'changes', 'deposit', 'scheduled']
        },
        {
            category: 'booking',
            question: 'What is the deposit policy for scheduled bookings?',
            answer: 'Scheduled bookings require a 50% non-refundable deposit to confirm appointment. Deposits cannot be refunded under any circumstances. However, dates may be changed in advance with therapist agreement, and your deposit transfers to the new date if approved.',
            tags: ['deposit', 'non-refundable', 'scheduled booking', 'payment']
        },
        {
            category: 'booking',
            question: 'Can I book time slots outside the displayed calendar?',
            answer: 'Yes! Time slots can vary and bookings can be made for dates/times outside the member\'s displayed calendar window. Contact the therapist directly through our chat system to request special time arrangements, early morning, or late evening appointments.',
            tags: ['flexible scheduling', 'calendar', 'time slots', 'special arrangements']
        },
        {
            category: 'booking',
            question: 'What if the therapist doesn\'t show up?',
            answer: 'If a therapist is more than 30 minutes late without communication, you\'ll receive a full refund plus a 20% service credit. We also try to arrange an immediate replacement therapist when possible.',
            tags: ['no-show', 'refund', 'guarantee']
        },
        {
            category: 'booking',
            question: 'Can I request a specific therapist?',
            answer: 'Yes! You can book specific therapists based on their profiles, reviews, and specialties. You can also add them to favorites for easy rebooking. Premium members get priority access to popular therapists.',
            tags: ['specific therapist', 'preferences', 'favorites']
        },
        {
            category: 'booking',
            question: 'Do you offer couple or group massages?',
            answer: 'Yes! Select "Couple Massage" or "Group Session" during booking. We can arrange 2-6 simultaneous massages at your location. Group discounts available for 3+ people.',
            tags: ['couple massage', 'group booking', 'multiple people']
        },
        {
            category: 'booking',
            question: 'Can I book for hotels and villas?',
            answer: 'Absolutely! We specialize in hotel and villa services across Bali, Jakarta, and other major cities. Just enter your hotel/villa name and room number during booking. Additional travel fees may apply for remote locations.',
            tags: ['hotels', 'villas', 'accommodation', 'travel']
        },
        {
            category: 'booking',
            question: 'What\'s included in the massage session?',
            answer: 'Sessions include professional massage oils/lotions, clean linens, and all necessary equipment. Therapists bring portable massage tables for in-room services. Tips are appreciated but not required.',
            tags: ['included services', 'equipment', 'what to expect']
        },
        {
            category: 'booking',
            question: 'How do I prepare for an in-home massage?',
            answer: 'Ensure adequate space (2x2 meters), comfortable room temperature, and privacy. Remove valuables from the area. The therapist will handle setup and cleanup. Shower before the session for best experience.',
            tags: ['preparation', 'home service', 'setup']
        },
        {
            category: 'booking',
            question: 'Can I add special requests or notes?',
            answer: 'Yes! Use the "Special Requests" field during booking to specify pressure preferences, focus areas, allergies, injuries, or other needs. Communicate directly with your therapist via WhatsApp after booking.',
            tags: ['special requests', 'customization', 'preferences']
        },
        {
            category: 'booking',
            question: 'What are your operating hours?',
            answer: 'Most therapists are available 9 AM - 10 PM daily. Some offer early morning (7 AM) or late night (11 PM) sessions with premium charges. Availability varies by therapist and location.',
            tags: ['hours', 'schedule', 'timing', 'availability']
        },

        // THERAPIST
        {
            category: 'therapist',
            question: 'How do I become a therapist on IndaStreet?',
            answer: 'Apply through our "Join as Therapist" page. You\'ll need valid certification, government ID, health certificate, and professional photos. We conduct background checks and skill assessments before approval.',
            tags: ['join platform', 'become therapist', 'requirements']
        },
        {
            category: 'therapist',
            question: 'What are the requirements to join?',
            answer: 'Valid massage therapy certification, Indonesian ID/KITAS, health certificate, minimum 6 months experience, professional photos, smartphone with WhatsApp, and ability to travel to client locations.',
            tags: ['requirements', 'qualifications', 'documents']
        },
        {
            category: 'therapist',
            question: 'How much can I earn as a therapist?',
            answer: 'Therapists typically earn 150,000-500,000 IDR per session depending on service type, location, and experience. Top therapists earn 3-8 million IDR monthly. You keep 70-85% of each booking after platform fees.',
            tags: ['earnings', 'income', 'payment', 'commission']
        },
        {
            category: 'therapist',
            question: 'How do I set my availability and rates?',
            answer: 'Use your therapist dashboard to set daily/weekly availability, service rates, travel areas, and blackout dates. Rates can vary by service type, location distance, and time of day.',
            tags: ['availability', 'pricing', 'dashboard', 'schedule']
        },
        {
            category: 'therapist',
            question: 'When and how do I get paid?',
            answer: 'Payments are processed weekly every Monday via bank transfer for the previous week\'s completed sessions. You can track earnings and payment history in your dashboard. Minimum payout is 100,000 IDR.',
            tags: ['payment schedule', 'bank transfer', 'earnings', 'payout']
        },
        {
            category: 'therapist',
            question: 'Do I need to provide my own equipment?',
            answer: 'Yes, bring your portable massage table/mat, oils, lotions, clean linens, and towels. We provide equipment procurement guidelines and preferred supplier recommendations for new therapists.',
            tags: ['equipment', 'supplies', 'requirements', 'tools']
        },
        {
            category: 'therapist',
            question: 'How do I handle difficult clients?',
            answer: 'Contact our 24/7 therapist support immediately for any safety concerns. You can end sessions early for inappropriate behavior. We have zero tolerance for harassment and will ban problematic clients.',
            tags: ['safety', 'difficult clients', 'support', 'harassment']
        },
        {
            category: 'therapist',
            question: 'Can I work flexible hours?',
            answer: 'Absolutely! Set your own schedule through the app. Many therapists work part-time, weekends only, or specific hours. You have full control over your availability and can update it anytime.',
            tags: ['flexible hours', 'part-time', 'schedule control']
        },
        {
            category: 'therapist',
            question: 'What areas can I service?',
            answer: 'Define your service radius from 5-50 km from your base location. Popular areas typically generate more bookings. You can adjust coverage areas and set different rates for distant locations.',
            tags: ['service area', 'coverage', 'travel distance', 'location']
        },
        {
            category: 'therapist',
            question: 'How do I improve my booking rate?',
            answer: 'Maintain high ratings, update availability regularly, respond quickly to booking requests, offer multiple service types, keep competitive pricing, and encourage client reviews. Featured therapists get priority placement.',
            tags: ['improve bookings', 'optimization', 'ratings', 'tips']
        },
        {
            category: 'therapist',
            question: 'What training and support do you provide?',
            answer: 'New therapists receive onboarding training, safety guidelines, customer service best practices, and ongoing skill development workshops. Monthly webinars cover business growth and industry trends.',
            tags: ['training', 'support', 'onboarding', 'development']
        },
        {
            category: 'therapist',
            question: 'Can I bring an assistant or work in teams?',
            answer: 'Licensed therapists can bring assistants for setup/breakdown, but only certified therapists can perform massage services. Team bookings require all team members to be individually verified on our platform.',
            tags: ['assistants', 'teams', 'collaboration', 'licensing']
        },
        {
            category: 'therapist',
            question: 'How do I handle insurance and liability?',
            answer: 'We provide basic liability coverage for platform-booked sessions. We recommend therapists maintain their own professional liability insurance for comprehensive protection. Safety protocols are mandatory.',
            tags: ['insurance', 'liability', 'coverage', 'protection']
        },
        {
            category: 'therapist',
            question: 'What if I need to cancel a booking?',
            answer: 'Cancel through the app ASAP with a valid reason. Cancellations within 2 hours incur warnings; excessive cancellations may result in account suspension. Emergency cancellations are handled case-by-case.',
            tags: ['therapist cancellation', 'policy', 'warnings', 'emergencies']
        },
        {
            category: 'therapist',
            question: 'How does the rating system work?',
            answer: 'Clients rate you 1-5 stars after each session on punctuality, professionalism, technique, and overall experience. Maintain 4.2+ stars for good standing. Low ratings trigger performance reviews and additional training.',
            tags: ['ratings', 'reviews', 'performance', 'standards']
        },

        // BUSINESS
        {
            category: 'business',
            question: 'How can my spa/wellness center join IndaStreet?',
            answer: 'Apply through our "Business Partnership" program. We partner with established spas, hotels, resorts, and wellness centers to list their services and therapists on our platform with revenue sharing models.',
            tags: ['business partnership', 'spas', 'wellness centers']
        },
        {
            category: 'business',
            question: 'What are the benefits for business partners?',
            answer: 'Increased bookings, expanded customer reach, integrated marketing, professional photography, online reputation management, booking management tools, and detailed analytics. No upfront costs.',
            tags: ['benefits', 'marketing', 'analytics', 'tools']
        },
        {
            category: 'business',
            question: 'How does revenue sharing work?',
            answer: 'Business partners typically receive 60-75% of booking value depending on partnership level and booking volume. Higher volume partners get better rates. Payments are processed weekly via bank transfer.',
            tags: ['revenue sharing', 'commission', 'payments', 'partnership tiers']
        },
        {
            category: 'business',
            question: 'Can hotels list their spa services?',
            answer: 'Yes! We partner with hotels to list both in-house spa services and in-room massage options. Hotel guests can book through our platform with automatic room billing integration where supported.',
            tags: ['hotels', 'spa services', 'room billing', 'integration']
        },
        {
            category: 'business',
            question: 'Do you provide marketing support?',
            answer: 'Partners receive professional photography, optimized listings, social media promotion, Google Ads inclusion, seasonal campaigns, and customer review management. Premium partners get dedicated account management.',
            tags: ['marketing support', 'photography', 'promotion', 'advertising']
        },
        {
            category: 'business',
            question: 'What booking management tools do you provide?',
            answer: 'Business dashboard includes real-time booking calendar, staff schedule management, customer communications, payment tracking, performance analytics, and integration APIs for existing systems.',
            tags: ['booking management', 'dashboard', 'tools', 'integration']
        },
        {
            category: 'business',
            question: 'How do I manage my staff therapists on the platform?',
            answer: 'Add verified therapists to your business profile, set their schedules and rates, manage their availability, and track their individual performance. Staff can also accept independent bookings.',
            tags: ['staff management', 'therapist management', 'schedules']
        },
        {
            category: 'business',
            question: 'Can I offer exclusive deals and promotions?',
            answer: 'Yes! Create limited-time offers, package deals, loyalty programs, and seasonal promotions through your business dashboard. Featured promotions appear prominently on our platform.',
            tags: ['promotions', 'deals', 'packages', 'loyalty programs']
        },
        {
            category: 'business',
            question: 'What are the requirements for business partnerships?',
            answer: 'Valid business license, established location (minimum 1 year), certified therapists, professional facilities, liability insurance, and commitment to IndaStreet quality standards.',
            tags: ['business requirements', 'licensing', 'standards', 'qualifications']
        },
        {
            category: 'business',
            question: 'How do you ensure quality control?',
            answer: 'Regular facility inspections, customer feedback monitoring, mystery shopper programs, therapist certification verification, and ongoing compliance checks. Partners must maintain 4.0+ average ratings.',
            tags: ['quality control', 'inspections', 'compliance', 'standards']
        },

        // PAYMENT
        {
            category: 'payment',
            question: 'What payment methods do you accept?',
            answer: 'Payment for massage services is either 💵 Cash (paid directly to therapist after service) or 🏦 Bank Transfer (to therapist\'s account). IndaStreet suggests using bank details provided in the chat window or requesting the therapist to post bank details in chat. This ensures clear communication and prevents any misunderstanding of bank account details.',
            tags: ['payment methods', 'cash', 'bank transfer', 'chat window']
        },
        {
            category: 'payment',
            question: 'Is it safe to pay online?',
            answer: 'Yes! We use bank-level encryption and are PCI DSS compliant. We never store your full payment details. All transactions are processed through secure payment gateways with fraud protection.',
            tags: ['security', 'encryption', 'safe payments', 'fraud protection']
        },
        {
            category: 'payment',
            question: 'When do I pay for massage services?',
            answer: 'Payment for massage services is made AFTER service completion, not during booking. You can pay via 💵 cash directly to the therapist or 🏦 bank transfer using details shared in the chat window. IndaStreet facilitates secure communication of bank details through our monitored chat system.',
            tags: ['payment timing', 'after service', 'cash', 'bank transfer', 'chat']
        },
        {
            category: 'payment',
            question: 'Can I get a refund if I\'m not satisfied?',
            answer: 'Yes! We offer full refunds for legitimate service issues reported within 24 hours. Refunds are processed within 3-7 business days. Our customer service team investigates all refund requests fairly.',
            tags: ['refunds', 'satisfaction guarantee', 'service issues']
        },
        {
            category: 'payment',
            question: 'Are there any additional fees?',
            answer: 'Service fees range from 5-15% depending on booking type and payment method. All fees are clearly displayed before payment. No hidden charges. Premium services may have additional costs.',
            tags: ['fees', 'service charges', 'transparency', 'pricing']
        },
        {
            category: 'payment',
            question: 'Do you offer corporate billing?',
            answer: 'Yes! Corporate accounts get monthly invoicing, bulk booking discounts, dedicated account management, and expense reporting tools. Minimum monthly commitment required for corporate rates.',
            tags: ['corporate billing', 'business accounts', 'invoicing', 'bulk discounts']
        },
        {
            category: 'payment',
            question: 'How do I get bank details for transfer payment?',
            answer: 'Bank details are securely shared through our chat system. After booking, the therapist will either automatically share their bank details in the chat window, or you can request them to post the details. Always use bank information shared within the IndaStreet chat to prevent miscommunication and ensure secure transactions.',
            tags: ['bank details', 'chat window', 'secure sharing', 'transfer payment']
        },
        {
            category: 'payment',
            question: 'How do tips and gratuities work?',
            answer: 'Tips are optional and can be paid in cash directly to therapists or added to your bank transfer amount. Always communicate tip amounts clearly in the chat window before transferring to avoid confusion.',
            tags: ['tips', 'gratuities', 'optional', 'cash', 'bank transfer']
        },

        // SAFETY & PRIVACY
        {
            category: 'safety',
            question: 'How do you verify therapists?',
            answer: 'All therapists undergo background checks, certification verification, health screenings, skill assessments, and ongoing performance monitoring. We maintain a zero-tolerance policy for any misconduct.',
            tags: ['verification', 'background checks', 'certification', 'safety']
        },
        {
            category: 'safety',
            question: 'What safety measures are in place?',
            answer: 'GPS tracking during sessions, 24/7 emergency support hotline, therapist check-ins, client verification, and immediate incident response protocols. All sessions are logged and monitored.',
            tags: ['safety measures', 'GPS tracking', 'emergency support', 'monitoring']
        },
        {
            category: 'safety',
            question: 'How do you protect my personal information?',
            answer: 'We comply with Indonesian data protection laws and international privacy standards. Your data is encrypted, access is limited to authorized personnel, and we never sell personal information to third parties.',
            tags: ['privacy', 'data protection', 'encryption', 'confidentiality']
        },
        {
            category: 'safety',
            question: 'What should I do if I feel unsafe?',
            answer: 'Contact our emergency support immediately at [emergency number]. We have protocols for immediate assistance, can help remove therapists from your location, and will investigate all safety concerns seriously.',
            tags: ['emergency', 'unsafe situations', 'immediate help', 'protocols']
        },
        {
            category: 'safety',
            question: 'Are therapists insured?',
            answer: 'Yes! All therapists carry liability insurance through our platform partnership. Additional professional liability coverage is recommended and many therapists maintain their own policies.',
            tags: ['insurance', 'liability coverage', 'professional insurance']
        },
        {
            category: 'safety',
            question: 'How do you handle complaints and disputes?',
            answer: 'Our customer service team investigates all complaints within 24 hours. We mediate disputes fairly, provide appropriate compensation when warranted, and take corrective actions to prevent future issues.',
            tags: ['complaints', 'disputes', 'investigation', 'resolution']
        }
    ];

    // Filter FAQs based on search query and category
    const filteredFAQs = faqs.filter(faq => {
        const matchesCategory = faq.category === activeCategory;
        const matchesSearch = searchQuery === '' || 
            faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setExpandedFAQ(null); // Reset expanded FAQ when searching
    };

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    // Handle like/dislike feedback
    const handleFeedback = (index: number, type: 'like' | 'dislike') => {
        setFaqFeedback(prev => ({
            ...prev,
            [index]: prev[index] === type ? null : type
        }));
    };

    const getCategoryCount = (categoryId: string) => {
        return faqs.filter(faq => faq.category === categoryId).length;
    };

    // Debug logging
    console.log('FAQ Page Render:', {
        totalFAQs: faqs.length,
        filteredFAQs: filteredFAQs.length,
        activeCategory,
        expandedFAQ,
        searchQuery
    });

    return (
        <div className="min-h-screen bg-white">
            {/* Inline CSS for animations */}
            <style>{`
                @keyframes fade-in-down {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in-down {
                    animation: fade-in-down 0.3s ease-out;
                }
            `}</style>
            
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                        <span className="text-gray-400 text-lg ml-2 font-normal">Help Center</span>
                    </h1>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Home"
                        >
                            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                        <button 
                            onClick={() => setIsMenuOpen(true)} 
                            className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
                            title="Menu"
                        >
                            <BurgerMenuIcon className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section - Minimalistic */}
            <section className="relative py-16 md:py-24 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Back Arrow */}
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="mb-8 ml-2 w-12 h-12 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 will-change-transform"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="text-center">
                        {/* Hero Image */}
                        <div className="mb-6 -mt-10">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indastreet%20massage%20logo.png?updatedAt=1764533351258" 
                                alt="IndaStreet Massage Logo" 
                                className="w-60 h-60 object-contain mx-auto"
                            />
                        </div>
                        
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-2xl mb-6">
                            <HelpCircle className="w-8 h-8 text-orange-600" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                            How can we help you?
                        </h1>
                        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                        Find answers to common questions about booking massages, becoming a therapist, and using IndaStreet
                    </p>
                    
                    {/* Search Bar */}
                    <div className="relative max-w-xl mx-auto">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search for answers..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-orange-500 focus:outline-none transition-colors bg-white shadow-sm"
                        />
                    </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                {/* Category Navigation */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
                    {categories.map((category) => {
                        const IconComponent = category.icon;
                        const isActive = activeCategory === category.id;
                        
                        return (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    setExpandedFAQ(null);
                                    setSearchQuery('');
                                }}
                                className={`
                                    relative p-6 rounded-2xl transition-all duration-300 group
                                    ${isActive 
                                        ? `bg-gradient-to-br ${category.color} text-white shadow-lg scale-105` 
                                        : 'text-gray-700 hover:bg-gray-50/50'
                                    }
                                `}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className={`
                                        p-3 rounded-xl mb-3 transition-colors
                                        ${isActive 
                                            ? 'bg-white/20' 
                                            : 'bg-gray-100 group-hover:bg-gray-200'
                                        }
                                    `}>
                                        <IconComponent className={`
                                            w-6 h-6 
                                            ${isActive ? 'text-white' : 'text-gray-600'}
                                        `} />
                                    </div>
                                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                                    <span className={`
                                        text-xs px-2 py-1 rounded-full
                                        ${isActive 
                                            ? 'bg-white/20 text-white' 
                                            : 'bg-gray-200 text-gray-600'
                                        }
                                    `}>
                                        {getCategoryCount(category.id)} questions
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* FAQ List */}
                <div className="max-w-4xl mx-auto">
                    {searchQuery && (
                        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                            <p className="text-blue-800">
                                <span className="font-medium">{filteredFAQs.length}</span> results found for 
                                <span className="font-medium"> "{searchQuery}"</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-5">
                        {filteredFAQs.map((faq, index) => {
                            const isExpanded = expandedFAQ === index;
                            const currentFeedback = faqFeedback[index];
                            
                            return (
                                <div 
                                    key={index} 
                                    className="rounded-2xl transition-all duration-300 overflow-hidden"
                                >
                                    {/* Question Container */}
                                    <div 
                                        onClick={() => toggleFAQ(index)}
                                        className="cursor-pointer p-6 flex items-start justify-between gap-4 hover:bg-gradient-to-r hover:from-orange-50 hover:to-purple-50 transition-all duration-300 group"
                                    >
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                                                    {index + 1}
                                                </div>
                                                <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-xs font-semibold rounded-full">
                                                    {categories.find(cat => cat.id === faq.category)?.name || 'General'}
                                                </span>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                                                {faq.question}
                                            </h3>
                                        </div>
                                        <Plus className={`
                                            w-7 h-7 text-gray-400 flex-shrink-0 transition-all duration-300 mt-1
                                            ${isExpanded ? 'rotate-45 text-orange-500 scale-110' : 'group-hover:text-orange-500 group-hover:scale-110'}
                                        `} />
                                    </div>
                                    
                                    {/* Answer Container */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 animate-fade-in-down">
                                            <div className="rounded-xl p-5">
                                                <div className="flex items-start gap-3 mb-4">
                                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-gray-800 leading-relaxed whitespace-pre-line text-base">
                                                            {faq.answer}
                                                        </p>
                                                    </div>
                                                </div>
                                                
                                                {faq.tags && (
                                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
                                                        {faq.tags.map((tag, tagIndex) => (
                                                            <span 
                                                                key={tagIndex}
                                                                className="px-3 py-1.5 bg-white text-gray-600 text-xs font-medium rounded-full border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors"
                                                            >
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {/* Like/Dislike Buttons */}
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                                <span className="text-sm font-medium text-gray-600">Was this helpful?</span>
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        onClick={() => handleFeedback(index, 'like')}
                                                        className={`
                                                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border-2
                                                            ${currentFeedback === 'like' 
                                                                ? 'bg-green-500 text-white border-green-500 shadow-lg scale-105' 
                                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-green-50 hover:text-green-600 hover:border-green-300'
                                                            }
                                                        `}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" />
                                                        <span className="text-sm font-medium">Yes</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedback(index, 'dislike')}
                                                        className={`
                                                            flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 border-2
                                                            ${currentFeedback === 'dislike' 
                                                                ? 'bg-red-500 text-white border-red-500 shadow-lg scale-105' 
                                                                : 'bg-white text-gray-600 border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                                                            }
                                                        `}
                                                    >
                                                        <X className="w-4 h-4" />
                                                        <span className="text-sm font-medium">No</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    {filteredFAQs.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
                            <p className="text-gray-600 mb-4">
                                Try adjusting your search or browse different categories
                            </p>
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setActiveCategory('general');
                                }}
                                className="px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>

                {/* Contact Support Section */}
                <div className="max-w-4xl mx-auto mt-16">
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 md:p-12 text-center border border-orange-200">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                            Still need help?
                        </h2>
                        <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                            Our friendly support team is here to help you with any questions or concerns
                        </p>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                onClick={() => window.open('https://wa.me/62XXX', '_blank')}
                                className="inline-flex items-center gap-3 px-6 py-3 bg-green-500 text-white font-semibold rounded-xl hover:bg-green-600 transition-colors shadow-lg"
                            >
                                <Phone className="w-5 h-5" />
                                WhatsApp Support
                            </button>
                            <button 
                                onClick={() => onNavigate?.('contact')}
                                className="inline-flex items-center gap-3 px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors shadow-lg border-2 border-orange-200"
                            >
                                <Mail className="w-5 h-5" />
                                Email Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-16">
                <FloatingPageFooter 
                    currentLanguage={language as 'en' | 'id'}
                    onNavigate={onNavigate}
                />
            </div>

            {/* Menu Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate}
                onMassageJobsClick={onMassageJobsClick}
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
        </div>
    );
};

export default FAQPage;
