// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { Search, MessageCircle, Mail, HelpCircle, Users, CreditCard, Shield, Clock, MapPin, ThumbsUp, ArrowLeft, X, Briefcase, Building2 } from 'lucide-react';
import { AppDrawer } from '../components/AppDrawerClean';
import { useTranslations } from '../lib/useTranslations';
import { useLanguage } from '../hooks/useLanguage';
import UniversalHeader from '../components/shared/UniversalHeader';
import FloatingPageFooter from '../components/FloatingPageFooter';

interface FAQ {
    question: string;
    answer: string;
    category: string;
    tags?: string[];
}

interface FAQPageProps {
    onNavigate?: (page: string) => void;
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

const FAQPage: React.FC<FAQPageProps> = ({ 
    onNavigate,
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
    const { language, setLanguage } = useLanguage();
    const { t } = useTranslations(language as 'en' | 'id');
    const [activeCategory, setActiveCategory] = useState<string>('general');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [faqFeedback, setFaqFeedback] = useState<{[key: number]: 'like' | 'dislike' | null}>({});

    // Categories – same theme as home & jobs: slate, white, primary accent
    const categories = [
        { id: 'general', name: 'General', icon: HelpCircle },
        { id: 'booking', name: 'Bookings', icon: Clock },
        { id: 'therapist', name: 'For Therapists', icon: Users },
        { id: 'employers', name: 'Employers & Jobs', icon: Briefcase },
        { id: 'partners', name: 'Partners (Hotel & Villa)', icon: Building2 },
        { id: 'business', name: 'For Businesses', icon: MapPin },
        { id: 'payment', name: 'Payments', icon: CreditCard },
        { id: 'safety', name: 'Safety & Verification', icon: Shield },
        { id: 'standards', name: 'Verification Standards', icon: Shield },
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
            answer: 'Reach us via WhatsApp at +62-XXX-XXXX, email at indastreet.id@gmail.com, or through our in-app chat feature. Our support team is available 7 days a week from 8 AM to 10 PM WIB.',
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
            answer: 'GPS tracking during sessions, 24/7 emergency support hotline, therapist check-ins, client verification, and immediate incident response protocols. All sessions are logged and monitored. Our therapists and places agree in our terms that we may use location monitoring for your safety and theirs—so you can book with confidence.',
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
        },

        // EMPLOYERS & JOB LISTINGS
        {
            category: 'employers',
            question: 'How do I post a job for massage therapists?',
            answer: 'Go to Massage Jobs from the menu, choose "Post a Job", and sign in or register as an employer. Create your job listing with title, description, location, employment type, and salary range. Pay the one-time job posting fee (IDR 170,000) and submit payment proof. After admin approval, your job goes live and therapists can apply.',
            tags: ['job posting', 'employer', 'hire', 'massage jobs']
        },
        {
            category: 'employers',
            question: 'What does it cost to post a job or list as a therapist?',
            answer: 'Job posting (employers): one-time fee of IDR 170,000 per job. Therapist listing (find work): one-time fee of IDR 150,000. Fees are shown on the Massage Jobs page. Payment is made after creating your listing; upload payment proof for admin approval.',
            tags: ['fees', 'job posting', 'therapist listing', 'pricing']
        },
        {
            category: 'employers',
            question: 'How do I unlock therapist contact details as an employer?',
            answer: 'On the Massage Jobs page, under "Find Professionals", you can pay a one-time fee for 1 month of full access to all listed job seekers: profiles, WhatsApp numbers, and CVs. This filters serious employers and protects therapist privacy.',
            tags: ['unlock contact', 'employer access', 'WhatsApp', 'CV']
        },
        {
            category: 'employers',
            question: 'What happens after I post a job?',
            answer: 'After you submit payment proof, our team approves the listing (usually within 24–48 hours). Once active, therapists can view your job and apply. You can contact them via WhatsApp to interview and hire. Mark the position as "Position Filled" when done.',
            tags: ['job status', 'approval', 'applications', 'hiring']
        },
        {
            category: 'employers',
            question: 'Are employer job listings verified?',
            answer: 'Employers can be marked as verified after our team checks business details. Verified employers get a badge on their job cards. Job listings may show as "Live – Pending Admin Verification" until verified.',
            tags: ['verified employer', 'verification', 'badge']
        },

        // PARTNERS (HOTEL & VILLA)
        {
            category: 'partners',
            question: 'What are IndaStreet Partners (Hotel & Villa)?',
            answer: 'Partners are verified hotels and villas that offer 24-hour in-room massage services to guests. When you stay at a partner property, you can book a massage therapist to come to your room. Each partner is vetted for quality and safety.',
            tags: ['partners', 'hotel', 'villa', '24 hour', 'in-room']
        },
        {
            category: 'partners',
            question: 'How do I book massage at a partner hotel or villa?',
            answer: 'Open IndaStreet Partners from the menu, choose Massage Hotel or Massage Villa, and browse the list. Each card shows the property name, location, and "Book Reservation". Use that to contact the property via WhatsApp and arrange your in-room massage.',
            tags: ['book', 'reservation', 'WhatsApp', 'partner']
        },
        {
            category: 'partners',
            question: 'How can my hotel or villa become a partner?',
            answer: 'Apply via "Join Indastreet" on the Partners page or the Partnership Application. We review your property and, if approved, list you so guests can book 24-hour in-room massage. Partners get visibility and we ensure quality standards.',
            tags: ['join', 'partnership', 'apply', 'hotel', 'villa']
        },
        {
            category: 'partners',
            question: 'What standards do partner properties meet?',
            answer: 'Partners are selected to support the IndaStreet brand: quality facilities, clear communication, and reliable in-room massage service. Verified partners display a VERIFIED badge. You can leave reviews to help other guests.',
            tags: ['standards', 'verified', 'quality', 'reviews']
        },

        // VERIFICATION STANDARDS
        {
            category: 'standards',
            question: 'What does the Verified badge mean?',
            answer: 'The Verified badge means the therapist or place has met our verification standards: identity checks, qualifications, hygiene and safety requirements, and professional conduct. Verified sets the standard for premium service, professionalism, and peace of mind.',
            tags: ['verified', 'badge', 'standards', 'quality']
        },
        {
            category: 'standards',
            question: 'Where can I see full verification standards?',
            answer: 'Open "Massage Therapist Standards" (Verified Pro Badge) from the menu or How It Works. There you will see all verification standards we use: products & materials, hygiene, facility requirements, staff qualifications, safety protocols, and more.',
            tags: ['verification standards', 'verified pro badge', 'how it works']
        },
        {
            category: 'standards',
            question: 'Why should I choose a verified therapist or place?',
            answer: 'Verified therapists and places have passed our checks and agree to our standards. You get higher quality, clearer expectations, and peace of mind. We recommend choosing verified providers when possible.',
            tags: ['verified', 'quality', 'safety', 'recommendation']
        },
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

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
            {/* Universal Header - same as home page */}
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange ?? setLanguage}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
                title="IndaStreet Help Center"
            />
            
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

            {/* Hero – same theme as home & jobs: slate, white, primary accent */}
            <section className="relative pt-24 md:pt-28 pb-12 md:pb-16 px-4 bg-white">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => onNavigate?.('home')}
                        className="mb-6 ml-2 w-12 h-12 rounded-full bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 flex items-center justify-center shadow-sm transition-all duration-200"
                        title="Back to Home"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                            How can we help you?
                        </h1>
                        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                            Find answers about booking, therapists, employers, partners, payments, and standards.
                        </p>
                        <div className="relative max-w-xl mx-auto">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search for answers..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 pb-16">
                {/* Category tabs – same style as jobs page: slate bg, white active, primary accent */}
                <div className="flex flex-wrap gap-2 mb-8 p-2 rounded-[20px] bg-gray-50 border border-gray-200">
                    {categories.map((category) => {
                        const IconComponent = category.icon;
                        const isActive = activeCategory === category.id;
                        const count = getCategoryCount(category.id);
                        if (count === 0) return null;
                        return (
                            <button
                                key={category.id}
                                onClick={() => {
                                    setActiveCategory(category.id);
                                    setExpandedFAQ(null);
                                    setSearchQuery('');
                                }}
                                className={`
                                    flex items-center gap-2 py-2.5 px-4 rounded-[18px] text-sm font-semibold transition-all
                                    ${isActive
                                        ? 'bg-white text-orange-600 shadow-md border border-gray-200'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'}
                                `}
                            >
                                <IconComponent className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-orange-600' : 'text-orange-500'}`} />
                                <span className="truncate max-w-[120px] sm:max-w-none">{category.name}</span>
                                <span className="text-xs font-semibold text-orange-600">({count})</span>
                            </button>
                        );
                    })}
                </div>

                {/* FAQ List – cards same style as job cards: rounded-[20px], border-slate-200/80 */}
                <div className="max-w-4xl mx-auto">
                    {searchQuery && (
                        <div className="mb-6 p-4 rounded-xl border border-gray-200 bg-gray-50">
                            <p className="text-slate-700">
                                <span className="font-semibold">{filteredFAQs.length}</span> results for
                                <span className="font-semibold"> "{searchQuery}"</span>
                            </p>
                        </div>
                    )}

                    <div className="space-y-4">
                        {filteredFAQs.map((faq, index) => {
                            const isExpanded = expandedFAQ === index;
                            const currentFeedback = faqFeedback[index];
                            return (
                                <div
                                    key={index}
                                    className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
                                >
                                    <button
                                        type="button"
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full cursor-pointer p-5 flex items-start justify-between gap-4 text-left hover:bg-slate-50/50 transition-colors group"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <span className="inline-block px-2.5 py-1 bg-black/80 text-orange-400 text-xs font-semibold rounded-lg mb-2 backdrop-blur-sm">
                                                {categories.find(cat => cat.id === faq.category)?.name || 'General'}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors leading-tight">
                                                {faq.question}
                                            </h3>
                                        </div>
                                        <span className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${isExpanded ? 'bg-orange-500 text-white rotate-180' : 'bg-slate-100 text-slate-500 group-hover:bg-orange-50 group-hover:text-orange-600'}`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                        </span>
                                    </button>
                                    {isExpanded && (
                                        <div className="px-5 pb-5 pt-0 animate-fade-in-down border-t border-slate-100">
                                            <div className="pt-4">
                                                <p className="text-slate-700 leading-relaxed whitespace-pre-line text-sm">
                                                    {faq.answer}
                                                </p>
                                                {faq.tags && faq.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                                        {faq.tags.map((tag, tagIndex) => (
                                                            <span key={tagIndex} className="px-2.5 py-1 bg-black/80 text-orange-400 text-xs font-medium rounded-lg backdrop-blur-sm">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                                <span className="text-sm font-medium text-slate-500">Was this helpful?</span>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleFeedback(index, 'like'); }}
                                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${currentFeedback === 'like' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'}`}
                                                    >
                                                        <ThumbsUp className="w-4 h-4" /> Yes
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); handleFeedback(index, 'dislike'); }}
                                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${currentFeedback === 'dislike' ? 'bg-orange-500 text-white' : 'bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-100'}`}
                                                    >
                                                        <X className="w-4 h-4" /> No
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
                        <div className="text-center py-16 rounded-2xl border border-gray-200 bg-white">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-slate-900 mb-2">No results found</h3>
                            <p className="text-slate-600 mb-4">Try different keywords or browse categories above.</p>
                            <button
                                type="button"
                                onClick={() => { setSearchQuery(''); setActiveCategory('general'); }}
                                className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                Clear search
                            </button>
                        </div>
                    )}
                </div>

                {/* Contact Support – same theme as home/jobs */}
                <div className="max-w-4xl mx-auto mt-16">
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 p-8 md:p-12 text-center">
                        <div className="inline-flex items-center justify-center w-14 h-14 bg-orange-500 rounded-2xl mb-4">
                            <MessageCircle className="w-7 h-7 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">
                            Still need help?
                        </h2>
                        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
                            Our support team typically responds within 24 hours. Reach out for booking issues, verification, or general questions.
                        </p>
                        <div className="flex justify-center">
                            <button
                                type="button"
                                onClick={() => onNavigate?.('contact')}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all"
                            >
                                <Mail className="w-5 h-5" /> Contact Us
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
                language={language as 'en' | 'id' | 'gb'}
            />
        </div>
    );
};

export default FAQPage;
