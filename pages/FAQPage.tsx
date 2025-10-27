import React, { useState } from 'react';

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface FAQ {
    question: string;
    answer: string;
    category: string;
}

const FAQPage: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState<string>('therapist');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const categories = [
        { id: 'therapist', name: 'For Therapists', icon: '🧘' },
        { id: 'hotel', name: 'For Hotels', icon: '🏨' },
        { id: 'employer', name: 'For Employers', icon: '👔' },
        { id: 'agent', name: 'For Agents', icon: '🤝' },
        { id: 'payment', name: 'Payments', icon: '💳' },
        { id: 'technical', name: 'Technical', icon: '⚙️' },
    ];

    const faqs: FAQ[] = [
        // Therapist FAQs
        {
            category: 'therapist',
            question: 'How do I create a therapist profile on IndaStreet?',
            answer: 'Click "Sign Up" and select "Therapist". Fill in your personal details, certifications, specializations, work experience, and languages. Upload your certification documents for verification. Choose a membership package (1, 3, 6, or 12 months) and complete payment via bank transfer. After admin approval, your profile goes live and you can start receiving bookings.'
        },
        {
            category: 'therapist',
            question: 'What are the membership costs for therapists?',
            answer: 'We offer flexible membership packages: 1 Month - IDR 100,000 | 3 Months - IDR 250,000 (save 17%) | 6 Months - IDR 450,000 (save 25%) | 1 Year - IDR 800,000 (save 33%). All packages include profile verification, booking management dashboard, WhatsApp integration, and priority placement in search results.'
        },
        {
            category: 'therapist',
            question: 'How do I receive bookings from hotels and clients?',
            answer: 'Once your profile is active with paid membership, hotels and clients can find you through search. They contact you directly via WhatsApp (integrated into platform). You receive instant notifications for new booking requests. You manage your availability and accept/decline bookings through your dashboard.'
        },
        {
            category: 'therapist',
            question: 'What certifications do I need to join IndaStreet?',
            answer: 'You need valid massage therapy certifications from recognized institutions. Accepted certifications include: Traditional Balinese Massage Certificate, Swedish Massage Certification, Deep Tissue Therapy, Aromatherapy Certification, Reflexology Training, or equivalent professional qualifications. Upload clear photos/scans of your certificates during registration for verification.'
        },
        {
            category: 'therapist',
            question: 'How does the "Therapist For Contract" feature work?',
            answer: 'If you\'re seeking full-time employment, enable "Available for Contract" in your profile settings. Your name will be hidden from employers until they pay IDR 300,000 unlock fee. This protects you from spam while ensuring only serious employers contact you. Employers see your qualifications, experience, and location but must pay to get your contact details.'
        },
        {
            category: 'therapist',
            question: 'Can I work in multiple locations across Indonesia?',
            answer: 'Yes! You can list multiple service locations (e.g., Seminyak, Ubud, Canggu). Update your availability by area in your dashboard. Many therapists work in 2-3 locations and clients can filter by specific neighborhoods or cities when searching.'
        },

        // Hotel FAQs
        {
            category: 'hotel',
            question: 'How do hotels and villas use IndaStreet?',
            answer: 'Register your property with hotel details, spa facilities, and service offerings. Browse 500+ verified therapists by specialty, location, and availability. Contact therapists directly via WhatsApp for bookings. No booking fees or commissions - you negotiate rates directly with therapists. Manage your spa team and track bookings through your hotel dashboard.'
        },
        {
            category: 'hotel',
            question: 'Is there a fee for hotels to use the platform?',
            answer: 'No! Hotel registration and therapist browsing are completely free. There are no booking fees, commissions, or monthly subscriptions for hotels. You only pay the therapist directly for their services at rates you negotiate together.'
        },
        {
            category: 'hotel',
            question: 'How do I find therapists for urgent/same-day bookings?',
            answer: 'Use our "Available Now" filter to see therapists currently available. Set location to your area (e.g., Seminyak) and select immediate availability. Most therapists respond to WhatsApp within 15-30 minutes. Many experienced therapists keep flexible schedules for last-minute resort bookings.'
        },
        {
            category: 'hotel',
            question: 'Can I hire therapists as permanent employees through IndaStreet?',
            answer: 'Yes! Browse our "Therapist For Contract" section to find professionals actively seeking full-time employment. Pay one-time IDR 300,000 fee to unlock contact information. Then conduct interviews, check references, and hire directly. No placement fees or commissions on hiring.'
        },
        {
            category: 'hotel',
            question: 'How are therapists verified?',
            answer: 'All therapists must upload certification documents which our admin team verifies. We check: massage therapy certifications, professional training credentials, work experience history, and identity verification. Verified therapists receive a blue checkmark badge on their profiles.'
        },

        // Employer FAQs
        {
            category: 'employer',
            question: 'What is the "Therapist For Contract" marketplace?',
            answer: 'It\'s our privacy-protected job board where therapists seeking full-time employment list themselves with hidden names. You can browse candidates by qualification, experience, specialty, and location. To protect therapists from spam, you pay IDR 300,000 one-time fee to unlock each therapist\'s full contact information including name and WhatsApp number.'
        },
        {
            category: 'employer',
            question: 'Why do I have to pay to see therapist names?',
            answer: 'This privacy model protects therapists from harassment, spam, and unwanted contact. It ensures only serious employers who are genuinely interested in hiring will contact them. The small fee filters out time-wasters and creates a professional hiring environment. Once you pay, you get permanent access to that therapist\'s full contact details.'
        },
        {
            category: 'employer',
            question: 'How do I unlock a therapist\'s contact information?',
            answer: 'Browse the "Therapist For Contract" section and find candidates matching your requirements. Click "Unlock Contact Details" on their profile. Complete bank transfer payment of IDR 300,000. Upload payment proof. Admin verifies within 24 hours. You receive full contact information via email and can message them directly on WhatsApp.'
        },
        {
            category: 'employer',
            question: 'Are there any fees after I unlock contact information?',
            answer: 'No! The IDR 300,000 is a one-time payment. No placement fees, no commission on salary, no monthly subscriptions. After unlocking, you negotiate salary, terms, and conditions directly with the therapist. Conduct your own interviews and reference checks.'
        },
        {
            category: 'employer',
            question: 'Can I unlock multiple therapists at once?',
            answer: 'Yes, you can unlock as many profiles as you need. Each unlock costs IDR 300,000. Many employers unlock 3-5 candidates to interview multiple people before making a final hiring decision. We recommend reviewing profiles carefully before unlocking to ensure they match your requirements.'
        },

        // Agent FAQs
        {
            category: 'agent',
            question: 'How does the agent commission system work?',
            answer: 'Sign up as an agent and receive your unique referral code. Share this code with therapists you recruit. When they sign up using your code and purchase any membership package, you earn 20% commission. Track your recruits and earnings in your agent dashboard. Commission is paid monthly via bank transfer.'
        },
        {
            category: 'agent',
            question: 'How much can I earn as an agent?',
            answer: 'You earn 20% of every membership purchase from your referred therapists. Example earnings: 1 Month (IDR 100k) = IDR 20k commission | 3 Months (IDR 250k) = IDR 50k | 6 Months (IDR 450k) = IDR 90k | 1 Year (IDR 800k) = IDR 160k. If you recruit 10 therapists who each buy 6-month packages, you earn IDR 900,000. There\'s no limit to how many therapists you can recruit.'
        },
        {
            category: 'agent',
            question: 'When do I receive commission payments?',
            answer: 'Commissions are calculated at the end of each month and paid within the first 5 business days of the following month via bank transfer to your registered account. You can track pending and paid commissions in your agent dashboard in real-time.'
        },
        {
            category: 'agent',
            question: 'Do I earn recurring commissions if therapists renew?',
            answer: 'Currently, you earn commission only on the initial membership purchase. If a therapist renews their membership after expiration, you do not earn additional commission. However, we are developing a recurring commission model for 2025 to reward long-term agent partnerships.'
        },
        {
            category: 'agent',
            question: 'Can I recruit therapists outside of Bali?',
            answer: 'Absolutely! You can recruit therapists from anywhere in Indonesia - Jakarta, Surabaya, Yogyakarta, Lombok, etc. IndaStreet serves the entire country, so your earning potential is nationwide.'
        },

        // Payment FAQs
        {
            category: 'payment',
            question: 'What payment methods do you accept?',
            answer: 'We currently accept bank transfer (transfer bank) to our verified Indonesian bank accounts. Supported banks include BCA, Mandiri, BNI, BRI, and CIMB Niaga. We chose bank transfer because it\'s the most trusted and widely used payment method in Indonesia. Credit card and e-wallet options coming in 2025.'
        },
        {
            category: 'payment',
            question: 'How do I pay for therapist membership?',
            answer: 'After selecting your membership package: (1) You receive bank account details for payment (2) Transfer exact amount from any Indonesian bank (3) Take screenshot of successful transaction (4) Upload proof in your dashboard (5) Admin verifies within 24 hours (6) Membership activates and profile goes live. You receive email and WhatsApp confirmation at each step.'
        },
        {
            category: 'payment',
            question: 'How long does payment verification take?',
            answer: 'Most payments are verified within 24 hours during business days (Monday-Saturday, 9 AM - 6 PM WIB). Payments submitted on weekends are processed on Monday. You\'ll receive email notification when your payment is approved and your membership is activated. Check your dashboard for real-time payment status.'
        },
        {
            category: 'payment',
            question: 'What if my payment is rejected?',
            answer: 'Common rejection reasons include: wrong transfer amount, unclear payment proof screenshot, or transfer to wrong account. If rejected, you\'ll receive email with specific reason and instructions to resubmit. Simply upload a new payment proof with the correct information. Contact support@indastreet.com if you need assistance.'
        },
        {
            category: 'payment',
            question: 'Can I get a refund if I cancel my membership?',
            answer: 'Memberships are non-refundable once activated. However, if you haven\'t used the platform at all and request cancellation within 7 days of payment, we can issue 50% refund. Refund requests must be submitted via email to support@indastreet.com with your transaction details and reason.'
        },

        // Technical FAQs
        {
            category: 'technical',
            question: 'Is IndaStreet available as a mobile app?',
            answer: 'Currently IndaStreet is a mobile-responsive website that works perfectly on all smartphones, tablets, and desktops. You can add it to your home screen for app-like experience. Native iOS and Android apps are planned for Q2 2025 with offline booking, push notifications, and enhanced features.'
        },
        {
            category: 'technical',
            question: 'How does WhatsApp integration work?',
            answer: 'When hotels or clients want to contact you, they click "Contact via WhatsApp" on your profile. This opens WhatsApp on their phone with a pre-filled message to your registered number. You receive the booking request directly in WhatsApp where you can respond immediately. All communication happens via WhatsApp - no need to check multiple platforms.'
        },
        {
            category: 'technical',
            question: 'Can I update my profile after registration?',
            answer: 'Yes! Log into your dashboard and click "Edit Profile". You can update: photos, certifications, specializations, service areas, availability, languages, pricing, and bio at any time. Changes to certifications require admin re-verification. All other changes are instant.'
        },
        {
            category: 'technical',
            question: 'What happens when my membership expires?',
            answer: 'Your profile becomes hidden from search results and you stop receiving new booking requests. You receive email reminders 7 days and 1 day before expiration. To reactivate, simply purchase a new membership package. Your profile data is saved, so you don\'t need to re-enter information. Past bookings and reviews remain visible after reactivation.'
        },
        {
            category: 'technical',
            question: 'How do I delete my account?',
            answer: 'Email support@indastreet.com from your registered email address with subject "Account Deletion Request". Include your full name and phone number. We\'ll process deletion within 7 business days. Note: account deletion is permanent and cannot be reversed. All profile data, reviews, and booking history will be permanently removed.'
        },
    ];

    const filteredFAQs = faqs.filter(faq => faq.category === activeCategory);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-orange-500">IndaStreet</span>
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Side Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-black">inda</span>
                                <span className="text-orange-500">Street</span>
                            </h2>
                            <button 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all" 
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => window.location.href = '/'} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Everything you need to know about using IndaStreet
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Category Tabs */}
                <div className="mb-12">
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setExpandedFAQ(null);
                                }}
                                className={`p-4 rounded-xl font-bold transition-all text-center ${
                                    activeCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-blue-50 shadow'
                                }`}
                            >
                                <div className="text-3xl mb-2">{cat.icon}</div>
                                <div className="text-sm">{cat.name}</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ List */}
                <div className="space-y-4">
                    {filteredFAQs.map((faq, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <button
                                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                                <h3 className="text-lg font-bold text-gray-900 pr-4">
                                    {faq.question}
                                </h3>
                                <svg
                                    className={`w-6 h-6 text-blue-600 flex-shrink-0 transition-transform ${
                                        expandedFAQ === index ? 'transform rotate-180' : ''
                                    }`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {expandedFAQ === index && (
                                <div className="px-6 pb-6">
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Still Have Questions */}
                <div className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Our support team is here to help you succeed on IndaStreet
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <button className="px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors shadow-lg">
                            Contact Support
                        </button>
                        <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-lg hover:bg-white hover:text-orange-600 transition-colors">
                            WhatsApp Us
                        </button>
                    </div>
                    <p className="mt-6 text-orange-100">
                        📧 support@indastreet.com | 📱 WhatsApp: +62 812 3456 7890
                    </p>
                </div>

                {/* Quick Links */}
                <div className="mt-16 grid md:grid-cols-3 gap-8">
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                        <div className="text-5xl mb-4">📖</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">User Guides</h3>
                        <p className="text-gray-600 mb-4">Step-by-step tutorials for all features</p>
                        <button className="text-blue-600 font-bold hover:text-blue-700">
                            View Guides →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                        <div className="text-5xl mb-4">💬</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Community Forum</h3>
                        <p className="text-gray-600 mb-4">Connect with other users</p>
                        <button className="text-blue-600 font-bold hover:text-blue-700">
                            Join Forum →
                        </button>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                        <div className="text-5xl mb-4">🎥</div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Video Tutorials</h3>
                        <p className="text-gray-600 mb-4">Watch how to use the platform</p>
                        <button className="text-blue-600 font-bold hover:text-blue-700">
                            Watch Videos →
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    );
};

export default FAQPage;
