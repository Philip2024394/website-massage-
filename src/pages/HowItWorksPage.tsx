// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
import React, { useState, useRef, useEffect } from 'react';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';
import SocialMediaLinks from '../components/SocialMediaLinks';
import FloatingPageFooter from '../components/FloatingPageFooter';
import { useCityContext } from '../context/CityContext';

const stepIconGradient = 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)';
const glassCardClass = 'rounded-[20px] shadow-lg border border-white/20 bg-white/90 backdrop-blur-[12px] hover:shadow-xl hover:scale-[1.03] transition-all duration-300';

const CheckIcon = () => (
    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const MOTION_VIEW = { once: true, amount: 0.2 };
const MOTION_FADE_UP = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: 'easeOut' },
};

/** Massage Therapist FAQ – Professional Guidelines & Platform Policies */
const THERAPIST_FAQ_ITEMS: { q: string; a: string }[] = [
    { q: 'Can I change my service location to another city?', a: 'Yes. You can update your service area anytime inside your Therapist Dashboard by selecting "Set Location." Your profile will instantly update to reflect your new live service area. You remain fully flexible.' },
    { q: 'Can I have more than one account?', a: 'No. Multiple accounts are strictly against platform policy. This protects trust, rankings, and client safety. Violations may result in permanent deactivation of all related accounts. One verified therapist = one verified account.' },
    { q: 'Does IndaStreet add 30% on top of my prices?', a: 'No. You must include the 30% commission within your listed price. Example: If you want to earn $70, list your service at $100. This keeps pricing transparent for clients.' },
    { q: 'Who sets the massage price?', a: 'You do. You are fully responsible for setting competitive pricing that includes platform commission. IndaStreet does not control your pricing.' },
    { q: 'Why do I see menu items I didn\'t add?', a: 'New accounts with fewer than 5 services temporarily display selected IndaStreet database items to make the profile look complete. Once you add 5 or more of your own services, those placeholders automatically disappear.' },
    { q: 'Why does my profile show a specific massage type and lowest price?', a: 'Your profile card automatically displays your lowest-priced service. This helps price-focused clients, clients searching specific massage types, and improves search visibility.' },
    { q: 'When do I get paid?', a: 'IndaStreet does not directly collect payment from your session earnings. For home, hotel, or villa bookings: payment is typically made immediately after service. You may request payment before starting if needed. Always evaluate the situation professionally.' },
    { q: 'What is the 5-minute response timer?', a: 'For Guaranteed (Instant) bookings, you have 5 minutes to accept or decline the request. A countdown appears in your chat window. Respond in time to secure the booking—otherwise the request may expire and go to another therapist.' },
    { q: 'Why is there a 30% deposit for scheduled bookings?', a: 'Scheduled services require a 30% non-refundable deposit to secure time and date. This protects you from last-minute cancellations. The deposit is only refundable if you do not complete the service.' },
    { q: 'What if a client doesn\'t show up?', a: 'If a deposit was paid, it remains with you. If no deposit was required, resolution depends on your agreement with the client. Deposits are designed to reduce no-shows.' },
    { q: 'Can a client change their scheduled time?', a: 'Yes. Rescheduling is handled directly between you and the client. Adjust based on availability and mutual agreement.' },
    { q: 'What should I do if I feel unsafe?', a: 'Your safety is your priority. If you feel uncomfortable: end the session immediately, leave the location safely, and report the incident in your dashboard. IndaStreet investigates all safety reports seriously.' },
    { q: 'Are clients verified?', a: 'Clients must register before booking. Scheduled bookings require a deposit, which reduces fake or non-serious reservations.' },
    { q: 'Can I pause my account without deleting it?', a: 'Yes. You can switch your profile to "Offline Mode" anytime. This hides you from search results while keeping your account active.' },
    { q: 'Can I deactivate my account?', a: 'Deactivation is available after reaching $20 in commission payments. This covers initial platform setup, marketing exposure, and account positioning.' },
    { q: 'Can I remove negative reviews?', a: 'Reviews cannot be removed unless they violate policy. However, you may professionally respond to clarify your position. Professional responses increase trust.' },
    { q: 'Am I an employee of IndaStreet?', a: 'No. You operate as an independent service provider. You are responsible for: your conduct, your services, your pricing, and compliance with local laws and taxes.' },
    { q: 'Do I need insurance?', a: 'We recommend obtaining personal liability insurance depending on local regulations. IndaStreet does not provide therapist insurance coverage.' },
    { q: 'I am under 18. Can I join?', a: 'Therapists must be at least 18 years old. Minors are not permitted to offer services unless legally approved and accompanied by an adult at all times.' },
    { q: 'I\'m new and need help setting up my account.', a: 'Our support team is available to guide you through setup. We\'ll ensure your profile is correctly positioned and optimized.' },
    { q: 'What does IndaStreet use commission for?', a: 'Commission supports: marketing & visibility, platform maintenance, security monitoring, customer service, and system improvements. It keeps your profile active, secure, and visible.' },
    { q: 'What is Safe Pass for hotel and villa service?', a: 'Safe Pass is a certification for therapists who provide services at hotels and villas. It confirms professional verification, identity approval, and platform compliance—enabling access to gated communities and secured properties. Qualified therapists can apply for Safe Pass in their dashboard.' },
];

/** Skin Clinic FAQ – Safety, qualifications, verification, and policies */
const SKIN_CLINIC_FAQ_ITEMS: { q: string; a: string }[] = [
    { q: 'How does IndaStreet ensure skin clinics are safe and qualified?', a: 'IndaStreet verifies skin clinics that apply. We review business registration, practitioner credentials, and service standards. Verified clinics receive our trust badge. Look for the IndaStreet Verified badge when booking.' },
    { q: 'What qualifications do skin clinic practitioners need?', a: 'Practitioners should hold relevant certifications in skin care, facial treatments, or dermatology as applicable. IndaStreet reviews credentials during the verification process to ensure professional standards.' },
    { q: 'How do I register my skin clinic?', a: 'Select "Skin Clinic" or "Facial Place" when creating your account. Complete your clinic profile with business name, location, services, practitioner credentials, photos, and operating hours. Our team can help with setup.' },
    { q: 'What verification is required for skin clinics?', a: 'We verify business details, location, practitioner credentials, and professional standards. Verified clinics appear with a trust badge and rank higher in search.' },
    { q: 'Are products and treatments safe?', a: 'Clinics are responsible for using approved, safe products and following professional protocols. IndaStreet verifies that listed clinics meet platform standards. Always discuss treatments and any allergies with your provider.' },
    { q: 'Can we offer both in-clinic and home visits?', a: 'Yes. You can list in-clinic treatments and, if your team offers home or mobile services, add those options. Clear service descriptions help customers choose safely.' },
    { q: 'How do we receive and manage bookings?', a: 'Bookings appear in your Place Dashboard. Accept, decline, or reschedule. Set availability and assign practitioners. Notifications keep your team informed.' },
];

/** Massage Spa FAQ – Listing, verification, bookings, and policies */
const SPA_FAQ_ITEMS: { q: string; a: string }[] = [
    { q: 'How do I register my spa?', a: 'Select "Massage Spa" or "Place" when creating your account. Complete your spa profile with business name, location, services, therapist team, photos, and operating hours. Our team can help you with setup.' },
    { q: 'What verification is required for spas?', a: 'We verify business details, location, and professional credentials. Verified spas appear with a badge and rank higher in search. You may need to provide business registration or license documents depending on your area.' },
    { q: 'How do we receive and manage bookings?', a: 'Bookings appear in your Place Dashboard. You can accept, decline, or reschedule. You can set availability by day and time and assign therapists to sessions. Notifications keep your team informed.' },
    { q: 'What commission does IndaStreet take?', a: 'IndaStreet takes a commission on each booking. The exact percentage is communicated when you join. Commission is included in your listed prices—you set the price customers see.' },
    { q: 'Can we list multiple locations or branches?', a: 'Each physical location typically has its own listing. If you have multiple branches, contact support to set up separate profiles so customers can find and book the right venue.' },
    { q: 'How do payouts work for spas?', a: 'Earnings are tracked in your dashboard. Payout terms depend on your agreement with IndaStreet. You maintain control over how and when you receive payments.' },
    { q: 'Can we offer both in-spa and outcall services?', a: 'Yes. You can list in-spa treatments and, if your team does outcall, add those options. Clear service descriptions help customers choose the right booking type.' },
    { q: 'What if we need to close temporarily?', a: 'You can set your spa to "Closed" or reduce availability in your dashboard. Your listing and reviews remain; you can go live again when you reopen.' },
    { q: 'What is Safe Pass for places (hotels/villas)?', a: 'Spas and places that work with hotels or villas can apply for Safe Pass certification. It confirms your establishment meets IndaStreet standards for hosting professional therapists. Apply in your Place Dashboard if you offer services at hotels or villa properties.' },
];

/** Booking Process – Customer reviews from different countries */
const BOOKING_PROCESS_REVIEWS = [
    { name: 'Sarah M.', country: 'USA', flag: '🇺🇸', quote: 'IndaStreet is so reliable! Booked an amazing therapist to our hotel in Bali. Professional, verified, and the booking was seamless. Highly recommend.', avatar: 'https://ui-avatars.com/api/?name=Sarah+M&background=f97316&color=fff&size=96' },
    { name: 'James T.', country: 'UK', flag: '🇬🇧', quote: 'Had a therapist come to our villa—felt safe throughout. Professional, verified. Best massage platform I\'ve used abroad. Will definitely book again.', avatar: 'https://ui-avatars.com/api/?name=James+T&background=ea580c&color=fff&size=96' },
    { name: 'Emma L.', country: 'Australia', flag: '🇦🇺', quote: 'Ordered massage to our hotel room. Quality and transparency throughout. IndaStreet made it so easy. Reliable and trustworthy—exactly what I needed.', avatar: 'https://ui-avatars.com/api/?name=Emma+L&background=f97316&color=fff&size=96' },
    { name: 'Yuki T.', country: 'Japan', flag: '🇯🇵', quote: 'Booked to our villa in Ubud. Reliable and trustworthy. Verified providers gave me peace of mind. Will definitely use IndaStreet again on my next trip.', avatar: 'https://ui-avatars.com/api/?name=Yuki+T&background=ea580c&color=fff&size=96' },
    { name: 'Lars K.', country: 'Denmark', flag: '🇩🇰', quote: 'Great service—therapist came to our hotel. Verified providers, professional and reliable. Exactly what I was looking for.', avatar: 'https://ui-avatars.com/api/?name=Lars+K&background=f97316&color=fff&size=96' },
];

/** Booking Process (Customer) FAQ – How to book, what to look for, safety, payments */
const BOOKING_PROCESS_FAQ_ITEMS: { q: string; a: string }[] = [
    { q: 'How do I know a therapist or clinic is qualified?', a: 'Look for the IndaStreet Verified badge on profiles. Verified providers have been reviewed by IndaStreet for credentials and compliance. Also check their bio, certifications, services, and customer reviews before booking.' },
    { q: 'What should I look for in a provider profile?', a: 'Verify badge, professional photo, clear bio, services & pricing, reviews & ratings, response time, and location/service area. Complete profiles indicate serious, professional providers.' },
    { q: 'What is Book Now vs Schedule?', a: 'Book Now is for immediate or same-day service—a therapist or clinic responds quickly. Schedule is for future bookings with a confirmed date and time. Both use secure flows with clear confirmation.' },
    { q: 'Do I pay upfront?', a: 'For scheduled bookings, a deposit may be required to secure your slot. For instant (Book Now) bookings, payment is typically made after the service. Payment terms are shown before you confirm.' },
    { q: 'What if I need to cancel?', a: 'Cancellation policies vary by provider and booking type. Check the booking confirmation for cancellation terms. Deposits may be non-refundable for last-minute cancellations.' },
    { q: 'Are all providers on IndaStreet verified?', a: 'Anyone can create an account. IndaStreet Verified is a status we grant after reviewing credentials and business details. Look for the Verified badge—it means IndaStreet has reviewed that provider.' },
    { q: 'What if I have an issue or need support?', a: 'Use the Contact Us page or Help section to reach our support team. We can assist with booking issues, provider concerns, or general questions. Response times vary by topic—urgent issues can be escalated.' },
    { q: 'Can I book for international travel or from abroad?', a: 'Yes. IndaStreet serves customers booking for hotel, villa, or home visits in our service areas. Payment and confirmation work the same—deposits for scheduled bookings may apply. Check provider availability for your travel dates.' },
];

/** Hotel Partners FAQ */
const HOTEL_FAQ_ITEMS: { q: string; a: string }[] = [
    { q: 'How do I register my hotel?', a: 'Contact IndaStreet or use the partnership application to register your property. You will need hotel details, compliance information, and to meet our standards. Our team will guide you through setup.' },
    { q: 'What are IndaStreet compliance standards for hotels?', a: 'We verify business legitimacy, property details, and operational standards. Qualified hotels receive free room display materials. Specific requirements are communicated during registration.' },
    { q: 'Is there a fee to partner?', a: 'Partnership terms vary. Qualified hotels that meet our standards receive free room display stands. Commission or fees may apply to therapist bookings—details are provided when you join.' },
    { q: 'How do I book therapists for my guests?', a: 'Use the hotel dashboard or platform to browse IndaStreet Verified therapists with Safe Pass. Request bookings by specialty and availability. Therapists are available 24/7 for hassle-free service.' },
    { q: 'Who do I contact for hotel partnerships?', a: 'Use the Contact Us page or partnership application. Our team will respond and guide you through registration and setup.' },
];

/** Villa Partners FAQ */
const VILLA_FAQ_ITEMS: { q: string; a: string }[] = [
    { q: 'How do I register my villa?', a: 'Contact IndaStreet or use the partnership application to register your property. You will need villa details, compliance information, and to meet our standards. Our team will guide you through setup.' },
    { q: 'What are IndaStreet compliance standards for villas?', a: 'We verify business legitimacy, property details, and operational standards. Qualified villas receive free room display materials. Specific requirements are communicated during registration.' },
    { q: 'Is there a fee to partner?', a: 'Partnership terms vary. Qualified villas that meet our standards receive free room display stands. Commission or fees may apply to therapist bookings—details are provided when you join.' },
    { q: 'How do I book therapists for my guests?', a: 'Use the villa dashboard or platform to browse IndaStreet Verified therapists with Safe Pass. Request bookings by specialty and availability. Therapists are available 24/7 for in-villa service.' },
    { q: 'Who do I contact for villa partnerships?', a: 'Use the Contact Us page or partnership application. Our team will respond and guide you through registration and setup.' },
];

/** Employers FAQ */
const EMPLOYER_FAQ_ITEMS: { q: string; a: string }[] = [
    { q: 'How much does it cost to unlock a therapist\'s contact?', a: 'Employers pay a one-time fee (e.g. IDR 300,000) to unlock full contact information including WhatsApp and full name. This filters serious employers and protects therapist privacy.' },
    { q: 'How do I post a job?', a: 'Use the Massage Jobs or Employer Job Posting section. Create your job listing with requirements, and service providers can reply. Providers must submit CV with recommendations or have positive IndaStreet reviews.' },
    { q: 'What does "confirmation at selected fee rate" mean?', a: 'IndaStreet can help verify or confirm therapist credentials, employment history, or references for employers—at a selected fee. Contact us for details on confirmation services.' },
    { q: 'What is the translation service for international hiring?', a: 'IndaStreet offers translation support when employers hire therapists for international or cross-language roles. Fee and scope depend on your needs—contact us for a quote.' },
    { q: 'How do I know if a therapist has CV/recommendations vs IndaStreet reviews?', a: 'Provider profiles show their path: either CV with past service history and recommendations, or active IndaStreet presence with positive reviews over time. Check the profile before unlocking contact.' },
];

interface MassageTherapistHowItWorksProps {
    t?: any;
    language?: string;
    glassCardClass: string;
    stepIconGradient: string;
}

/* FAQ section: light gray + orange theme (no dark colors) */
const FAQ_ACCENT_COLOR = 'rgba(249, 115, 22, 0.4)';

function TherapistFAQSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
    const accentHeight = useTransform(scrollYProgress, [0, 0.4], ['0%', '100%']);

    const toggle = (index: number) => {
        setExpandedIndex((i) => (i === index ? null : index));
    };

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle(index);
        }
    };

    const title = t?.howItWorks?.faqTherapistTitle ?? 'Professional Guidelines & Platform Policies';
    const heading = t?.howItWorks?.faqTherapistHeading ?? 'Frequently Asked Questions';

    return (
        <motion.section
            ref={sectionRef}
            className="relative rounded-2xl overflow-hidden mt-16 bg-gray-100 border border-gray-200/80"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            {/* Desktop: vertical accent line (orange) */}
            <motion.div
                className="absolute left-0 top-0 bottom-0 w-0.5 hidden md:block rounded-full origin-top"
                style={{ height: accentHeight, backgroundColor: FAQ_ACCENT_COLOR }}
            />

            <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 md:pl-10">
                {/* FAQ heading – gray infill + orange accent */}
                <div className="rounded-xl mb-10 overflow-hidden bg-gray-200/70 border border-gray-300/80">
                    <div className="h-1 w-full shrink-0 bg-orange-500" aria-hidden />
                    <div className="p-4 md:p-5">
                        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-2">{title}</p>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{heading}</h2>
                    </div>
                </div>

                <div className="space-y-4">
                    {THERAPIST_FAQ_ITEMS.map((item, index) => {
                        const isOpen = expandedIndex === index;
                        return (
                            <motion.div
                                key={index}
                                layout
                                className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ease-out ${
                                    isOpen
                                        ? 'border-orange-300 bg-white shadow-md shadow-orange-100/50'
                                        : 'border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`faq-answer-${index}`}
                                    id={`faq-question-${index}`}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left cursor-pointer rounded-xl"
                                >
                                    <span className="font-medium text-gray-800 pr-4">{item.q}</span>
                                    <motion.span
                                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-white ${isOpen ? 'border-orange-500 bg-orange-500' : 'border-orange-400 bg-orange-400'}`}
                                        animate={{ rotate: isOpen ? 45 : 0 }}
                                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                                        aria-hidden
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                            <path strokeLinecap="round" d="M12 4v16M4 12h16" />
                                        </svg>
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key={`faq-answer-${index}`}
                                            id={`faq-answer-${index}`}
                                            role="region"
                                            aria-labelledby={`faq-question-${index}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25, delay: 0.08 } }}
                                            className="overflow-hidden border-t border-orange-100"
                                        >
                                            <motion.p
                                                className="px-5 pb-5 pt-0 pr-12 text-gray-600 text-[15px] leading-relaxed"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ duration: 0.25, delay: 0.25 }}
                                            >
                                                {item.a}
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
}

function SpaFAQSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
    const accentHeight = useTransform(scrollYProgress, [0, 0.4], ['0%', '100%']);

    const toggle = (index: number) => setExpandedIndex((i) => (i === index ? null : index));
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(index); }
    };

    const title = t?.howItWorks?.spaFaqTitle ?? 'Spa & Venue Guidelines';
    const heading = t?.howItWorks?.spaFaqHeading ?? 'Frequently Asked Questions';

    return (
        <motion.section
            ref={sectionRef}
            className="relative rounded-2xl overflow-hidden mt-16 bg-gray-100 border border-gray-200/80"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            <motion.div className="absolute left-0 top-0 bottom-0 w-0.5 hidden md:block rounded-full origin-top" style={{ height: accentHeight, backgroundColor: FAQ_ACCENT_COLOR }} />
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 md:pl-10">
                <div className="rounded-xl mb-10 overflow-hidden bg-gray-200/70 border border-gray-300/80">
                    <div className="h-1 w-full shrink-0 bg-orange-500" aria-hidden />
                    <div className="p-4 md:p-5">
                        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-2">{title}</p>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{heading}</h2>
                    </div>
                </div>
                <div className="space-y-4">
                    {SPA_FAQ_ITEMS.map((item, index) => {
                        const isOpen = expandedIndex === index;
                        return (
                            <motion.div
                                key={index}
                                layout
                                className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'border-orange-300 bg-white shadow-md shadow-orange-100/50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`spa-faq-answer-${index}`}
                                    id={`spa-faq-question-${index}`}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left cursor-pointer rounded-xl"
                                >
                                    <span className="font-medium text-gray-800 pr-4">{item.q}</span>
                                    <motion.span
                                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-white ${isOpen ? 'border-orange-500 bg-orange-500' : 'border-orange-400 bg-orange-400'}`}
                                        animate={{ rotate: isOpen ? 45 : 0 }}
                                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                                        aria-hidden
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4v16M4 12h16" /></svg>
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key={`spa-faq-answer-${index}`}
                                            id={`spa-faq-answer-${index}`}
                                            role="region"
                                            aria-labelledby={`spa-faq-question-${index}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25, delay: 0.08 } }}
                                            className="overflow-hidden border-t border-orange-100"
                                        >
                                            <motion.p className="px-5 pb-5 pt-0 pr-12 text-gray-600 text-[15px] leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: 0.25 }}>
                                                {item.a}
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
}

function SkinClinicFAQSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.08 });
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end start'] });
    const accentHeight = useTransform(scrollYProgress, [0, 0.4], ['0%', '100%']);

    const toggle = (index: number) => setExpandedIndex((i) => (i === index ? null : index));
    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(index); }
    };

    const title = t?.howItWorks?.skinClinicFaqTitle ?? 'Safety, Qualifications & Verification';
    const heading = t?.howItWorks?.skinClinicFaqHeading ?? 'Skin Clinic FAQs';

    return (
        <motion.section
            ref={sectionRef}
            className="relative rounded-2xl overflow-hidden mt-16 bg-gray-100 border border-gray-200/80"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
            <motion.div className="absolute left-0 top-0 bottom-0 w-0.5 hidden md:block rounded-full origin-top" style={{ height: accentHeight, backgroundColor: FAQ_ACCENT_COLOR }} />
            <div className="max-w-3xl mx-auto px-6 py-12 md:py-16 md:pl-10">
                <div className="rounded-xl mb-10 overflow-hidden bg-gray-200/70 border border-gray-300/80">
                    <div className="h-1 w-full shrink-0 bg-orange-500" aria-hidden />
                    <div className="p-4 md:p-5">
                        <p className="text-gray-500 text-sm font-medium tracking-wide uppercase mb-2">{title}</p>
                        <h2 className="text-2xl md:text-3xl font-semibold text-gray-900">{heading}</h2>
                    </div>
                </div>
                <div className="space-y-4">
                    {SKIN_CLINIC_FAQ_ITEMS.map((item, index) => {
                        const isOpen = expandedIndex === index;
                        return (
                            <motion.div
                                key={index}
                                layout
                                className={`rounded-xl border-2 overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'border-orange-300 bg-white shadow-md shadow-orange-100/50' : 'border-gray-200 bg-gray-50/80 hover:border-gray-300 hover:bg-gray-50'}`}
                            >
                                <button
                                    type="button"
                                    onClick={() => toggle(index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    aria-expanded={isOpen}
                                    aria-controls={`skin-clinic-faq-answer-${index}`}
                                    id={`skin-clinic-faq-question-${index}`}
                                    className="w-full flex items-center justify-between gap-4 px-5 py-5 text-left cursor-pointer rounded-xl"
                                >
                                    <span className="font-medium text-gray-800 pr-4">{item.q}</span>
                                    <motion.span
                                        className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-white ${isOpen ? 'border-orange-500 bg-orange-500' : 'border-orange-400 bg-orange-400'}`}
                                        animate={{ rotate: isOpen ? 45 : 0 }}
                                        transition={{ duration: 0.35, ease: 'easeInOut' }}
                                        aria-hidden
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" d="M12 4v16M4 12h16" /></svg>
                                    </motion.span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            key={`skin-clinic-faq-answer-${index}`}
                                            id={`skin-clinic-faq-answer-${index}`}
                                            role="region"
                                            aria-labelledby={`skin-clinic-faq-question-${index}`}
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ height: { duration: 0.35, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.25, delay: 0.08 } }}
                                            className="overflow-hidden border-t border-orange-100"
                                        >
                                            <motion.p className="px-5 pb-5 pt-0 pr-12 text-gray-600 text-[15px] leading-relaxed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25, delay: 0.25 }}>
                                                {item.a}
                                            </motion.p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </motion.section>
    );
}

function MassageTherapistHowItWorks({ t, language, glassCardClass, stepIconGradient }: MassageTherapistHowItWorksProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const ref3 = useRef<HTMLDivElement>(null);
    const ref4 = useRef<HTMLDivElement>(null);
    const ref5 = useRef<HTMLDivElement>(null);
    const inView1 = useInView(ref1, MOTION_VIEW);
    const inView2 = useInView(ref2, MOTION_VIEW);
    const inView3 = useInView(ref3, MOTION_VIEW);
    const inView4 = useInView(ref4, MOTION_VIEW);
    const inView5 = useInView(ref5, MOTION_VIEW);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const progressHeight = useTransform(scrollYProgress, [0, 0.75], ['0%', '100%']);
    const scrollBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const steps = [
        {
            num: 1,
            ref: ref1,
            inView: inView1,
            title: t?.howItWorks?.step1Title || 'Create Your Profile',
            desc: t?.howItWorks?.step1Desc || 'Sign up in minutes and build your professional profile. Add your photo, bio, specialties, pricing, and availability.',
            bullets: [
                t?.howItWorks?.step1Item1 || 'Showcase your skills',
                t?.howItWorks?.step1Item2 || 'Set your own rates',
                t?.howItWorks?.step1Item3 || 'Choose your working hours',
            ],
            footer: t?.howItWorks?.step1Footer || 'You stay in full control.',
        },
        {
            num: 2,
            ref: ref2,
            inView: inView2,
            title: t?.howItWorks?.step2Title || 'Get Booked Instantly',
            desc: t?.howItWorks?.step2Desc || 'Clients browse therapists in their area and book directly through the platform.',
            bullets: [
                t?.howItWorks?.step2Item1 || 'Real-time booking',
                t?.howItWorks?.step2Item2 || 'Secure payments',
                t?.howItWorks?.step2Item3 || 'Automatic confirmations',
            ],
            footer: t?.howItWorks?.step2Footer || 'No back-and-forth messaging needed.',
        },
        {
            num: 3,
            ref: ref3,
            inView: inView3,
            title: t?.howItWorks?.step3Title || 'Earn With Every Session',
            desc: t?.howItWorks?.step3Desc || 'IndaStreet takes a small commission (30%) and you receive the remaining balance directly.',
            bullets: [
                t?.howItWorks?.step3Item1 || 'Transparent earnings',
                t?.howItWorks?.step3Item2 || 'Clear payout breakdown',
                t?.howItWorks?.step3Item3 || 'Track bookings in your dashboard',
            ],
            footer: t?.howItWorks?.step3Footer || 'No hidden fees. No surprises.',
        },
        {
            num: 4,
            ref: ref4,
            inView: inView4,
            title: t?.howItWorks?.step4Title || 'Manage Everything From Your Dashboard',
            desc: t?.howItWorks?.step4Desc || 'Your dashboard gives you full control:',
            bullets: [
                t?.howItWorks?.step4Item1 || 'View upcoming bookings',
                t?.howItWorks?.step4Item2 || 'Track earnings',
                t?.howItWorks?.step4Item3 || 'Manage availability',
                t?.howItWorks?.step4Item4 || 'Update services',
            ],
            footer: t?.howItWorks?.step4Footer || 'Simple. Clean. Professional.',
        },
        {
            num: 5,
            ref: ref5,
            inView: inView5,
            title: t?.howItWorks?.step5Title || 'Build Your Reputation',
            desc: t?.howItWorks?.step5Desc || 'Clients leave reviews after sessions.',
            bullets: [
                t?.howItWorks?.step5Item1 || 'Grow your rating',
                t?.howItWorks?.step5Item2 || 'Build trust',
                t?.howItWorks?.step5Item3 || 'Increase repeat bookings',
            ],
            footer: t?.howItWorks?.step5Footer || 'The better your service, the more you earn.',
        },
    ];

    const whyJoinItems = [
        {
            title: t?.howItWorks?.whyJoin1 || 'No upfront fees',
            description: t?.howItWorks?.whyJoin1Desc || 'Start without any registration or listing costs. You only share a commission when you earn—so there’s no risk to get your profile live and reach new clients.',
        },
        {
            title: t?.howItWorks?.whyJoin2 || 'Flexible schedule',
            description: t?.howItWorks?.whyJoin2Desc || 'Set your own hours and service areas. Work when and where it suits you, and switch to Offline Mode anytime without losing your account or reviews.',
        },
        {
            title: t?.howItWorks?.whyJoin3 || 'More exposure',
            description: t?.howItWorks?.whyJoin3Desc || 'Get in front of clients searching for massage in your area. Our platform and marketing help your profile show up when it matters.',
        },
        {
            title: t?.howItWorks?.whyJoin4 || 'Professional platform',
            description: t?.howItWorks?.whyJoin4Desc || 'A dedicated dashboard for bookings, earnings, and profile—plus a trusted brand that clients already use to find and book therapists.',
        },
        {
            title: t?.howItWorks?.whyJoin5 || 'Secure payments',
            description: t?.howItWorks?.whyJoin5Desc || 'Scheduled bookings use deposits to reduce no-shows, and payment flows are clear. You stay in control of how and when you get paid.',
        },
    ];

    return (
        <div ref={sectionRef} className="space-y-12 relative">
            {/* Scroll progress bar – fills as you read (fixed below header) */}
            <div className="fixed left-0 right-0 top-16 z-[5] h-0.5 bg-gray-200/80 overflow-hidden">
                <motion.div
                    className="h-full rounded-r-full origin-left"
                    style={{ width: scrollBarWidth, background: 'linear-gradient(90deg, #f97316, #ea580c)' }}
                />
            </div>

            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <h2
                    className="text-4xl font-bold mb-4 bg-clip-text text-transparent"
                    style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' }}
                >
                    {t?.howItWorks?.therapistTitle || 'For Massage Therapists – IndaStreet'}
                </h2>
                <p className="text-xl text-gray-600">
                    {t?.howItWorks?.therapistSubtitle || 'Build your career, find opportunities, grow your client base'}
                </p>
            </motion.div>

            {/* Desktop: vertical progress line (hidden on mobile) */}
            <div className="absolute left-6 md:left-8 top-40 w-1 h-[420px] hidden md:block rounded-full overflow-hidden bg-gray-200/60">
                <motion.div
                    className="w-full rounded-full origin-top"
                    style={{
                        height: progressHeight,
                        background: stepIconGradient,
                    }}
                />
            </div>

            <div className="relative md:pl-4">
                {[
                    {
                        ...steps[0],
                        imageDesc: 'Therapist profile creation – photo upload, bio, specialties, pricing, availability fields',
                        icon: 'profile',
                    },
                    {
                        ...steps[1],
                        imageDesc: 'Client booking flow – real-time Book Now on therapist profile, instant notification',
                        icon: 'calendar',
                    },
                    {
                        ...steps[2],
                        imageDesc: 'Earnings dashboard – transparent payout breakdown, commission view, tracking',
                        icon: 'earnings',
                    },
                    {
                        ...steps[3],
                        imageDesc: 'Therapist dashboard – bookings calendar, schedule, availability, service menu',
                        icon: 'dashboard',
                    },
                    {
                        ...steps[4],
                        imageDesc: 'Client reviews – 5-star ratings, testimonials on therapist profile',
                        icon: 'star',
                    },
                ].map((step, index) => (
                    <motion.div
                        key={step.num}
                        ref={step.ref}
                        className={`${glassCardClass} p-8 mb-8`}
                        initial={MOTION_FADE_UP.initial}
                        animate={step.inView ? MOTION_FADE_UP.animate : MOTION_FADE_UP.initial}
                        transition={{ ...MOTION_FADE_UP.transition, delay: index * 0.15 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-2xl cursor-default"
                                        style={{ background: stepIconGradient, boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
                                        animate={{ boxShadow: ['0 4px 20px rgba(251,191,36,0.35)', '0 4px 28px rgba(245,158,11,0.45)', '0 4px 20px rgba(251,191,36,0.35)'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        whileHover={{ boxShadow: '0 0 28px rgba(251,191,36,0.5), 0 0 40px rgba(245,158,11,0.4)' }}
                                    >
                                        {step.num}
                                    </motion.div>
                                    {step.icon === 'profile' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    )}
                                    {step.icon === 'calendar' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    )}
                                    {step.icon === 'earnings' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    )}
                                    {step.icon === 'dashboard' && (
                                        <svg className="w-8 h-8 text-gray-800 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    )}
                                    {step.icon === 'star' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600 mb-4 max-w-xl">{step.desc}</p>
                                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                                    {step.bullets.map((b, i) => (
                                        <li key={i} className="flex items-center justify-center md:justify-start gap-2">
                                            <CheckIcon />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-gray-700 font-medium text-sm">{step.footer}</p>
                            </div>
                            <div className="w-full md:w-[280px] shrink-0">
                                <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center p-6 text-center">
                                    <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>{step.num}</span>
                                    <span className="text-gray-400 mb-2" aria-hidden>
                                        {step.icon === 'profile' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                        {step.icon === 'calendar' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                        {step.icon === 'earnings' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                                        {step.icon === 'dashboard' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>}
                                        {step.icon === 'star' && <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                                    </span>
                                    <p className="text-sm text-gray-500 font-medium">{step.imageDesc}</p>
                                    <p className="text-xs text-gray-400 mt-1">[ Add image {step.num} – design to suit ]</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Section divider – subtle gradient line when Why Join comes into view */}
            <motion.div
                className="max-w-2xl mx-auto h-px"
                initial={{ opacity: 0, scaleX: 0.6 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.25), rgba(234,88,12,0.25), transparent)',
                    transformOrigin: 'center',
                }}
            />

            {/* Booking Types & Rules – 5-minute timer + scheduled rules + chat countdown image */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>📋</span>
                        {t?.howItWorks?.bookingRulesTitle || 'Booking Types & Rules'}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl">
                        {t?.howItWorks?.bookingRulesIntro || 'IndaStreet supports two booking types. Understanding the rules helps you respond quickly and secure more sessions.'}
                    </p>
                    <div className="grid md:grid-cols-[1fr,320px] gap-8 md:gap-10 items-start">
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span aria-hidden>⏱</span>
                                    {t?.howItWorks?.bookingRules5MinTitle || '5-Minute Response Timer (Guaranteed Bookings)'}
                                </h4>
                                <p className="text-gray-600 mb-3">
                                    {t?.howItWorks?.bookingRules5MinIntro || 'When a client requests a Guaranteed or Instant booking, a 5-minute countdown timer appears in your chat. You must respond within 5 minutes to accept or decline.'}
                                </p>
                                <ul className="space-y-2 text-gray-600 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRules5Min1 || 'The countdown is visible in your therapist chat window'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRules5Min2 || 'Accept or decline before time expires to secure the booking'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRules5Min3 || 'If you don\'t respond in time, the request may expire and go to another therapist'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRules5Min4 || 'Staying online and responsive increases your guaranteed booking rate'}</span>
                                    </li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span aria-hidden>📅</span>
                                    {t?.howItWorks?.bookingRulesScheduledTitle || 'Scheduled Booking Rules'}
                                </h4>
                                <p className="text-gray-600 mb-3">
                                    {t?.howItWorks?.bookingRulesScheduledIntro || 'Scheduled bookings let clients reserve a future date and time. These follow clear rules:'}
                                </p>
                                <ul className="space-y-2 text-gray-600 text-sm">
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRulesScheduled1 || '30% non-refundable deposit required to secure the slot'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRulesScheduled2 || 'Deposit protects you from last-minute cancellations and no-shows'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRulesScheduled3 || 'Rescheduling is handled between you and the client—adjust based on availability'}</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckIcon />
                                        <span>{t?.howItWorks?.bookingRulesScheduled4 || 'Deposit is only refundable if you do not complete the service'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* 7 – Chat window countdown screenshot */}
                        <div className="w-full shrink-0">
                            <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[240px] flex flex-col items-center justify-center p-6 text-center">
                                <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>7</span>
                                <svg className="w-12 h-12 text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                <p className="text-sm text-gray-600 font-medium">7. Chat window – 5-minute countdown timer</p>
                                <p className="text-xs text-gray-400 mt-1">[ Add screenshot of chat showing countdown timer ]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Why Join IndaStreet – 6: image placeholder + benefits */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="flex flex-col md:flex-row md:min-h-[320px]">
                    <motion.div
                        className="relative w-full md:w-[42%] min-h-[220px] md:min-h-[320px] shrink-0 overflow-hidden rounded-l-xl"
                        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                        whileInView={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
                        viewport={MOTION_VIEW}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/therapist_verfied-removebg-preview.png?updatedAt=1766312265747"
                            alt="Therapist verified – Join IndaStreet"
                            className="absolute inset-0 w-full h-full object-contain object-center"
                            loading="eager"
                        />
                    </motion.div>
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t?.howItWorks?.whyJoinTitle || 'Why Join IndaStreet?'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 max-w-xl">
                            {t?.howItWorks?.whyJoinTagline || 'You focus on delivering great massage. We handle the rest.'}
                        </p>
                        <ul className="space-y-4">
                            {whyJoinItems.map((item, i) => (
                                <motion.li
                                    key={i}
                                    className="flex gap-3 rounded-lg group"
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={MOTION_VIEW}
                                    transition={{ duration: 0.35, delay: i * 0.06 }}
                                >
                                    <span className="flex-shrink-0 mt-0.5 text-green-600">
                                        <CheckIcon />
                                    </span>
                                    <div>
                                        <span className="font-semibold text-gray-900 block">{item.title}</span>
                                        <span className="text-gray-600 text-sm leading-relaxed">{item.description}</span>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                        {/* 6 – Image container frame */}
                        <div className="mt-8 w-full max-w-[320px] mx-auto md:mx-0 md:ml-auto">
                            <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[180px] flex flex-col items-center justify-center p-6 text-center">
                                <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>6</span>
                                <svg className="w-10 h-10 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                <p className="text-sm text-gray-600 font-medium">6. Why Join – therapist success, benefits, professional growth, community</p>
                                <p className="text-xs text-gray-400 mt-1">[ Add image 6 – design to suit ]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Advanced Therapist Control Center – after Why Join, before Verified Program */}
            <AdvancedTherapistControlCenterSection t={t} />

            {/* IndaStreet Verified Therapist Program – after Control Center, before Professional Identity */}
            <VerifiedTherapistProgramSection t={t} />

            {/* Your Own Professional Identity Page – after Verified Program, before FAQ */}
            <ProfessionalIdentitySection t={t} />

            <TherapistFAQSection t={t} />
        </div>
    );
}

interface MassageSpaHowItWorksProps {
    t?: any;
    glassCardClass: string;
    stepIconGradient: string;
}

function MassageSpaHowItWorks({ t, glassCardClass, stepIconGradient }: MassageSpaHowItWorksProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const ref3 = useRef<HTMLDivElement>(null);
    const ref4 = useRef<HTMLDivElement>(null);
    const ref5 = useRef<HTMLDivElement>(null);
    const inView1 = useInView(ref1, MOTION_VIEW);
    const inView2 = useInView(ref2, MOTION_VIEW);
    const inView3 = useInView(ref3, MOTION_VIEW);
    const inView4 = useInView(ref4, MOTION_VIEW);
    const inView5 = useInView(ref5, MOTION_VIEW);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const progressHeight = useTransform(scrollYProgress, [0, 0.75], ['0%', '100%']);
    const scrollBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const steps = [
        {
            num: 1,
            ref: ref1,
            inView: inView1,
            title: t?.howItWorks?.spaStep1Title || 'Register Your Spa',
            desc: t?.howItWorks?.spaStep1Desc || 'Create your spa profile with business name, location, services, therapist team, photos, and operating hours.',
            bullets: [
                t?.howItWorks?.spaStep1Item1 || 'Add your services and pricing',
                t?.howItWorks?.spaStep1Item2 || 'Upload photos and amenities',
                t?.howItWorks?.spaStep1Item3 || 'Set your location and hours',
            ],
            footer: t?.howItWorks?.spaStep1Footer || 'You control your listing.',
        },
        {
            num: 2,
            ref: ref2,
            inView: inView2,
            title: t?.howItWorks?.spaStep2Title || 'Get Verified',
            desc: t?.howItWorks?.spaStep2Desc || 'Complete verification so your spa appears in search with a trusted badge. Build credibility with customers.',
            bullets: [
                t?.howItWorks?.spaStep2Item1 || 'Business details verified',
                t?.howItWorks?.spaStep2Item2 || 'Higher visibility in search',
                t?.howItWorks?.spaStep2Item3 || 'Trust badge on your profile',
            ],
            footer: t?.howItWorks?.spaStep2Footer || 'Verified spas get more bookings.',
        },
        {
            num: 3,
            ref: ref3,
            inView: inView3,
            title: t?.howItWorks?.spaStep3Title || 'List Services & Team',
            desc: t?.howItWorks?.spaStep3Desc || 'Add your treatments, packages, and assign therapists. Customers see clear options and book with confidence.',
            bullets: [
                t?.howItWorks?.spaStep3Item1 || 'Multiple services and packages',
                t?.howItWorks?.spaStep3Item2 || 'Manage therapist availability',
                t?.howItWorks?.spaStep3Item3 || 'In-spa and outcall options',
            ],
            footer: t?.howItWorks?.spaStep3Footer || 'One dashboard for everything.',
        },
        {
            num: 4,
            ref: ref4,
            inView: inView4,
            title: t?.howItWorks?.spaStep4Title || 'Receive & Manage Bookings',
            desc: t?.howItWorks?.spaStep4Desc || 'Accept bookings from the platform. Manage your schedule, assign staff, and keep customers informed.',
            bullets: [
                t?.howItWorks?.spaStep4Item1 || 'Real-time booking notifications',
                t?.howItWorks?.spaStep4Item2 || 'Accept, decline, or reschedule',
                t?.howItWorks?.spaStep4Item3 || 'Track earnings and payouts',
            ],
            footer: t?.howItWorks?.spaStep4Footer || 'No back-and-forth needed.',
        },
        {
            num: 5,
            ref: ref5,
            inView: inView5,
            title: t?.howItWorks?.spaStep5Title || 'Build Your Reputation',
            desc: t?.howItWorks?.spaStep5Desc || 'Customers leave reviews after visits. Grow your rating and stand out in your area.',
            bullets: [
                t?.howItWorks?.spaStep5Item1 || 'Reviews and ratings',
                t?.howItWorks?.spaStep5Item2 || 'Respond to feedback',
                t?.howItWorks?.spaStep5Item3 || 'Increase repeat bookings',
            ],
            footer: t?.howItWorks?.spaStep5Footer || 'Reputation drives growth.',
        },
    ];

    const whyJoinItems = [
        { title: t?.howItWorks?.spaWhyJoin1 || 'No upfront listing fees', description: t?.howItWorks?.spaWhyJoin1Desc || 'List your spa without heavy setup costs. Commission is shared when you earn from bookings.' },
        { title: t?.howItWorks?.spaWhyJoin2 || 'Reach more clients', description: t?.howItWorks?.spaWhyJoin2Desc || 'Get in front of customers searching for massage and spa services in your area.' },
        { title: t?.howItWorks?.spaWhyJoin3 || 'Professional dashboard', description: t?.howItWorks?.spaWhyJoin3Desc || 'Manage bookings, team, services, and earnings in one place.' },
        { title: t?.howItWorks?.spaWhyJoin4 || 'Trusted platform', description: t?.howItWorks?.spaWhyJoin4Desc || 'IndaStreet is a brand customers use to find and book verified spas and therapists.' },
        { title: t?.howItWorks?.spaWhyJoin5 || 'Clear payments', description: t?.howItWorks?.spaWhyJoin5Desc || 'Transparent commission and payout terms. You stay in control of your revenue.' },
    ];

    return (
        <div ref={sectionRef} className="space-y-12 relative">
            <div className="fixed left-0 right-0 top-16 z-[5] h-0.5 bg-gray-200/80 overflow-hidden">
                <motion.div className="h-full rounded-r-full origin-left" style={{ width: scrollBarWidth, background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />
            </div>

            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' }}>
                    {t?.howItWorks?.massageSpaTitle || 'For Massage Spas – IndaStreet'}
                </h2>
                <p className="text-xl text-gray-600">
                    {t?.howItWorks?.massageSpaSubtitle || 'List your spa, reach more clients, grow your business'}
                </p>
            </motion.div>

            <div className="absolute left-6 md:left-8 top-40 w-1 h-[420px] hidden md:block rounded-full overflow-hidden bg-gray-200/60">
                <motion.div className="w-full rounded-full origin-top" style={{ height: progressHeight, background: stepIconGradient }} />
            </div>

            <div className="relative md:pl-4">
                {[
                    { ...steps[0], imageDesc: 'Spa registration – business name, location, services, team, photos, hours', icon: 'building' as const },
                    { ...steps[1], imageDesc: 'Verified spa badge – trust badge, higher visibility in search', icon: 'shield' as const },
                    { ...steps[2], imageDesc: 'Services & team – treatments, packages, therapist assignment', icon: 'list' as const },
                    { ...steps[3], imageDesc: 'Place dashboard – bookings calendar, accept/decline, earnings', icon: 'calendar' as const },
                    { ...steps[4], imageDesc: 'Spa reviews – customer ratings, testimonials on place profile', icon: 'star' as const },
                ].map((step, index) => (
                    <motion.div
                        key={step.num}
                        ref={step.ref}
                        className={`${glassCardClass} p-8 mb-8`}
                        initial={MOTION_FADE_UP.initial}
                        animate={step.inView ? MOTION_FADE_UP.animate : MOTION_FADE_UP.initial}
                        transition={{ ...MOTION_FADE_UP.transition, delay: index * 0.15 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-2xl cursor-default"
                                        style={{ background: stepIconGradient, boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
                                        animate={{ boxShadow: ['0 4px 20px rgba(251,191,36,0.35)', '0 4px 28px rgba(245,158,11,0.45)', '0 4px 20px rgba(251,191,36,0.35)'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        whileHover={{ boxShadow: '0 0 28px rgba(251,191,36,0.5), 0 0 40px rgba(245,158,11,0.4)' }}
                                    >
                                        {step.num}
                                    </motion.div>
                                    {step.icon === 'building' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    )}
                                    {step.icon === 'shield' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    )}
                                    {step.icon === 'list' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                                    )}
                                    {step.icon === 'calendar' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    )}
                                    {step.icon === 'star' && (
                                        <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 24 24" aria-hidden><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                    )}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600 mb-4 max-w-xl">{step.desc}</p>
                                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                                    {step.bullets.map((b, i) => (
                                        <li key={i} className="flex items-center justify-center md:justify-start gap-2">
                                            <CheckIcon />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-gray-700 font-medium text-sm">{step.footer}</p>
                            </div>
                            <div className="w-full md:w-[280px] shrink-0">
                                <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center p-6 text-center">
                                    <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>{step.num}</span>
                                    <span className="text-gray-400 mb-2" aria-hidden>
                                        {step.icon === 'building' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>}
                                        {step.icon === 'shield' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                                        {step.icon === 'list' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                                        {step.icon === 'calendar' && <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                                        {step.icon === 'star' && <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                                    </span>
                                    <p className="text-sm text-gray-500 font-medium">{step.imageDesc}</p>
                                    <p className="text-xs text-gray-400 mt-1">[ Add image {step.num} – design to suit ]</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Section divider */}
            <motion.div
                className="max-w-2xl mx-auto h-px"
                initial={{ opacity: 0, scaleX: 0.6 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.25), rgba(234,88,12,0.25), transparent)', transformOrigin: 'center' }}
            />

            {/* Place Booking Types & Rules – adapted for spas */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>📋</span>
                        {t?.howItWorks?.spaBookingRulesTitle || 'Place Booking Types & Rules'}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl">
                        {t?.howItWorks?.spaBookingRulesIntro || 'Spas receive bookings through IndaStreet. Understanding the rules helps you manage your schedule and secure more reservations.'}
                    </p>
                    <div className="grid md:grid-cols-[1fr,320px] gap-8 md:gap-10 items-start">
                        <div className="space-y-8">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span aria-hidden>⏱</span>
                                    {t?.howItWorks?.spaBookingInstantTitle || 'Instant & Same-Day Bookings'}
                                </h4>
                                <p className="text-gray-600 mb-3">
                                    {t?.howItWorks?.spaBookingInstantIntro || 'Customers can book your spa for same-day or upcoming slots. Respond promptly to accept or decline—faster responses improve your visibility and booking rate.'}
                                </p>
                                <ul className="space-y-2 text-gray-600 text-sm">
                                    <li className="flex items-start gap-2"><CheckIcon /><span>{t?.howItWorks?.spaBookingInstant1 || 'Bookings appear in your Place Dashboard'}</span></li>
                                    <li className="flex items-start gap-2"><CheckIcon /><span>{t?.howItWorks?.spaBookingInstant2 || 'Accept or decline based on availability'}</span></li>
                                    <li className="flex items-start gap-2"><CheckIcon /><span>{t?.howItWorks?.spaBookingInstant3 || 'Assign therapists and manage schedule in one place'}</span></li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                    <span aria-hidden>📅</span>
                                    {t?.howItWorks?.spaBookingScheduledTitle || 'Scheduled Booking Rules'}
                                </h4>
                                <p className="text-gray-600 mb-3">
                                    {t?.howItWorks?.spaBookingScheduledIntro || 'Scheduled reservations use a deposit to secure the slot. Clear rules protect your business and reduce no-shows:'}
                                </p>
                                <ul className="space-y-2 text-gray-600 text-sm">
                                    <li className="flex items-start gap-2"><CheckIcon /><span>{t?.howItWorks?.spaBookingScheduled1 || 'Deposit required to confirm advance bookings'}</span></li>
                                    <li className="flex items-start gap-2"><CheckIcon /><span>{t?.howItWorks?.spaBookingScheduled2 || 'Rescheduling handled between you and the customer'}</span></li>
                                    <li className="flex items-start gap-2"><CheckIcon /><span>{t?.howItWorks?.spaBookingScheduled3 || 'Deposit protects against last-minute cancellations'}</span></li>
                                </ul>
                            </div>
                        </div>
                        {/* 7 – Place dashboard / chat screenshot */}
                        <div className="w-full shrink-0">
                            <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[240px] flex flex-col items-center justify-center p-6 text-center">
                                <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>7</span>
                                <svg className="w-12 h-12 text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                <p className="text-sm text-gray-600 font-medium">7. Place dashboard – bookings, earnings, schedule</p>
                                <p className="text-xs text-gray-400 mt-1">[ Add screenshot of Place Dashboard ]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="flex flex-col md:flex-row md:min-h-[320px]">
                    <motion.div
                        className="relative w-full md:w-[42%] min-h-[220px] md:min-h-[320px] shrink-0 overflow-hidden rounded-l-xl bg-gradient-to-br from-orange-50 to-amber-50/80"
                        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                        whileInView={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
                        viewport={MOTION_VIEW}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/therapist_verfied-removebg-preview.png?updatedAt=1766312265747"
                            alt="Spa partner – Join IndaStreet"
                            className="absolute inset-0 w-full h-full object-contain object-center"
                            loading="eager"
                        />
                    </motion.div>
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t?.howItWorks?.spaWhyJoinTitle || 'Why List Your Spa on IndaStreet?'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 max-w-xl">
                            {t?.howItWorks?.spaWhyJoinTagline || 'Focus on your guests. We help you reach more customers and manage bookings.'}
                        </p>
                        <ul className="space-y-4">
                            {whyJoinItems.map((item, i) => (
                                <motion.li
                                    key={i}
                                    className="flex gap-3 rounded-lg group"
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={MOTION_VIEW}
                                    transition={{ duration: 0.35, delay: i * 0.06 }}
                                >
                                    <span className="flex-shrink-0 mt-0.5 text-green-600"><CheckIcon /></span>
                                    <div>
                                        <span className="font-semibold text-gray-900 block">{item.title}</span>
                                        <span className="text-gray-600 text-sm leading-relaxed">{item.description}</span>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                        {/* 6 – Image container frame */}
                        <div className="mt-8 w-full max-w-[320px] mx-auto md:mx-0 md:ml-auto">
                            <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[180px] flex flex-col items-center justify-center p-6 text-center">
                                <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>6</span>
                                <svg className="w-10 h-10 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                <p className="text-sm text-gray-600 font-medium">6. Why Join – spa growth, benefits, professional platform</p>
                                <p className="text-xs text-gray-400 mt-1">[ Add image 6 – design to suit ]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Advanced Place Control Center – spa dashboard */}
            <AdvancedPlaceControlCenterSection t={t} />

            {/* Verified Place Program – spa verification */}
            <VerifiedPlaceProgramSection t={t} />

            {/* Professional Spa Identity – place profile */}
            <ProfessionalSpaIdentitySection t={t} />

            <SpaFAQSection t={t} />
        </div>
    );
}

interface SkinClinicHowItWorksProps {
    t?: any;
    glassCardClass: string;
    stepIconGradient: string;
}

function SkinClinicHowItWorks({ t, glassCardClass, stepIconGradient }: SkinClinicHowItWorksProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const ref3 = useRef<HTMLDivElement>(null);
    const ref4 = useRef<HTMLDivElement>(null);
    const ref5 = useRef<HTMLDivElement>(null);
    const inView1 = useInView(ref1, MOTION_VIEW);
    const inView2 = useInView(ref2, MOTION_VIEW);
    const inView3 = useInView(ref3, MOTION_VIEW);
    const inView4 = useInView(ref4, MOTION_VIEW);
    const inView5 = useInView(ref5, MOTION_VIEW);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const progressHeight = useTransform(scrollYProgress, [0, 0.75], ['0%', '100%']);
    const scrollBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const steps = [
        { num: 1, ref: ref1, inView: inView1, title: t?.howItWorks?.clinicStep1Title || 'Register Your Clinic', desc: t?.howItWorks?.clinicStep1Desc || 'Create your clinic profile with services, treatments, certified staff, and professional credentials.', bullets: [t?.howItWorks?.clinicStep1Item1 || 'Add services and pricing', t?.howItWorks?.clinicStep1Item2 || 'Upload photos and credentials', t?.howItWorks?.clinicStep1Item3 || 'Set location and hours'], footer: t?.howItWorks?.clinicStep1Footer || 'You control your listing.', icon: 'building' as const, imageDesc: 'Clinic registration – services, credentials, staff, photos' },
        { num: 2, ref: ref2, inView: inView2, title: t?.howItWorks?.clinicStep2Title || 'Get Verified', desc: t?.howItWorks?.clinicStep2Desc || 'Complete verification so your clinic appears with a trust badge. Business details, credentials, and standards are reviewed.', bullets: [t?.howItWorks?.clinicStep2Item1 || 'Business and credential verification', t?.howItWorks?.clinicStep2Item2 || 'Higher visibility in search', t?.howItWorks?.clinicStep2Item3 || 'Trust badge on your profile'], footer: t?.howItWorks?.clinicStep2Footer || 'Verified clinics get more bookings.', icon: 'shield' as const, imageDesc: 'Verified clinic badge – trust, visibility' },
        { num: 3, ref: ref3, inView: inView3, title: t?.howItWorks?.clinicStep3Title || 'List Services & Team', desc: t?.howItWorks?.clinicStep3Desc || 'Add your facial treatments, skin care services, and practitioner team. Customers see clear options and book with confidence.', bullets: [t?.howItWorks?.clinicStep3Item1 || 'Treatments and packages', t?.howItWorks?.clinicStep3Item2 || 'Practitioner profiles', t?.howItWorks?.clinicStep3Item3 || 'In-clinic and home visit options'], footer: t?.howItWorks?.clinicStep3Footer || 'One dashboard for everything.', icon: 'list' as const, imageDesc: 'Services & team – treatments, practitioners' },
        { num: 4, ref: ref4, inView: inView4, title: t?.howItWorks?.clinicStep4Title || 'Receive & Manage Bookings', desc: t?.howItWorks?.clinicStep4Desc || 'Accept bookings from the platform. Manage your schedule, assign practitioners, and keep customers informed.', bullets: [t?.howItWorks?.clinicStep4Item1 || 'Real-time booking notifications', t?.howItWorks?.clinicStep4Item2 || 'Accept, decline, or reschedule', t?.howItWorks?.clinicStep4Item3 || 'Track earnings and payouts'], footer: t?.howItWorks?.clinicStep4Footer || 'No back-and-forth needed.', icon: 'calendar' as const, imageDesc: 'Clinic dashboard – bookings, earnings' },
        { num: 5, ref: ref5, inView: inView5, title: t?.howItWorks?.clinicStep5Title || 'Build Your Reputation', desc: t?.howItWorks?.clinicStep5Desc || 'Customers leave reviews after treatments. Grow your rating and stand out as a trusted skin clinic.', bullets: [t?.howItWorks?.clinicStep5Item1 || 'Reviews and ratings', t?.howItWorks?.clinicStep5Item2 || 'Respond to feedback', t?.howItWorks?.clinicStep5Item3 || 'Increase repeat bookings'], footer: t?.howItWorks?.clinicStep5Footer || 'Reputation drives growth.', icon: 'star' as const, imageDesc: 'Clinic reviews – ratings, testimonials' },
    ];

    const whyJoinItems = [
        { title: t?.howItWorks?.clinicWhyJoin1 || 'No upfront listing fees', description: t?.howItWorks?.clinicWhyJoin1Desc || 'List your clinic without heavy setup costs. Commission is shared when you earn from bookings.' },
        { title: t?.howItWorks?.clinicWhyJoin2 || 'Reach safety-conscious clients', description: t?.howItWorks?.clinicWhyJoin2Desc || 'Customers choosing IndaStreet expect verified, qualified providers. Your verified status builds immediate trust.' },
        { title: t?.howItWorks?.clinicWhyJoin3 || 'Professional dashboard', description: t?.howItWorks?.clinicWhyJoin3Desc || 'Manage bookings, team, services, and earnings in one place.' },
        { title: t?.howItWorks?.clinicWhyJoin4 || 'Trusted platform', description: t?.howItWorks?.clinicWhyJoin4Desc || 'IndaStreet is a brand customers use to find qualified, safe skin care providers.' },
        { title: t?.howItWorks?.clinicWhyJoin5 || 'Clear payments', description: t?.howItWorks?.clinicWhyJoin5Desc || 'Transparent commission and payout terms. You stay in control of your revenue.' },
    ];

    const userConcerns = [
        { concern: t?.howItWorks?.clinicConcern1 ?? 'Is the clinic qualified and safe?', assurance: t?.howItWorks?.clinicAssurance1 ?? 'Clinics can join IndaStreet; those verified by us display a trust badge. We review business registration and practitioner qualifications before granting Verified status.' },
        { concern: t?.howItWorks?.clinicConcern2 ?? 'Are practitioners certified for skin treatments?', assurance: t?.howItWorks?.clinicAssurance2 ?? 'We review professional credentials during verification. Certified practitioners and proper training are part of our standards.' },
        { concern: t?.howItWorks?.clinicConcern3 ?? 'Are products and hygiene standards safe?', assurance: t?.howItWorks?.clinicAssurance3 ?? 'Verified clinics must meet platform standards. We expect professional hygiene protocols and approved product use.' },
        { concern: t?.howItWorks?.clinicConcern4 ?? 'Can I trust the reviews and information?', assurance: t?.howItWorks?.clinicAssurance4 ?? 'Reviews come from real bookings. Verified clinics have been reviewed by IndaStreet. Look for the Verified badge when choosing a provider.' },
    ];

    const iconMap: Record<string, React.ReactNode> = {
        building: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        shield: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
        list: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
        calendar: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        star: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    };

    const iconMapPlaceholder: Record<string, React.ReactNode> = {
        building: <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
        shield: <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>,
        list: <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>,
        calendar: <svg className="w-10 h-10 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        star: <svg className="w-10 h-10 mx-auto" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    };

    return (
        <div ref={sectionRef} className="space-y-12 relative">
            <div className="fixed left-0 right-0 top-16 z-[5] h-0.5 bg-gray-200/80 overflow-hidden">
                <motion.div className="h-full rounded-r-full origin-left" style={{ width: scrollBarWidth, background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />
            </div>

            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' }}>
                    {t?.howItWorks?.skinClinicTitle || 'For Skin Clinics – IndaStreet'}
                </h2>
                <p className="text-xl text-gray-600 mb-2">
                    {t?.howItWorks?.skinClinicSubtitle || 'Look for IndaStreet Verified Skin Clinics'}
                </p>
                <p className="text-base text-gray-500 max-w-2xl mx-auto">
                    {t?.howItWorks?.skinClinicTagline || 'IndaStreet verifies credentials, standards, and professionalism. Verified clinics display our badge—look for it when choosing a provider.'}
                </p>
            </motion.div>

            {/* User Concerns & IndaStreet Assurance */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <div className="text-center mb-10">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                            <span aria-hidden>🛡</span>
                            {t?.howItWorks?.clinicConcernsTitle || 'What Users Worry About — And How IndaStreet Addresses It'}
                        </h3>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            {t?.howItWorks?.clinicConcernsIntro || 'Choosing a skin clinic is a personal decision. Safety, qualifications, and trust matter. Look for the IndaStreet Verified badge—it means we have reviewed that clinic\'s credentials and standards.'}
                        </p>
                    </div>
                    <div className="space-y-6">
                        {userConcerns.map((item, i) => (
                            <motion.div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-white p-6 md:p-8"
                                initial={{ opacity: 0, x: -12 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={MOTION_VIEW}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                            >
                                <div className="flex flex-col md:flex-row md:items-start gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                                        <span className="text-amber-700 font-bold">{i + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-900 mb-2">{item.concern}</p>
                                        <p className="text-gray-600 flex items-start gap-2">
                                            <CheckIcon />
                                            <span>{item.assurance}</span>
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    <div className="mt-8 rounded-xl bg-emerald-50 border border-emerald-200/80 p-6 text-center">
                        <p className="text-emerald-800 font-semibold">
                            {t?.howItWorks?.clinicAssuranceClosing || 'IndaStreet Verified means we have reviewed that clinic. Quality, safety, and professional standards matter—look for the badge.'}
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="absolute left-6 md:left-8 top-40 w-1 h-[420px] hidden md:block rounded-full overflow-hidden bg-gray-200/60">
                <motion.div className="w-full rounded-full origin-top" style={{ height: progressHeight, background: stepIconGradient }} />
            </div>

            <div className="relative md:pl-4">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.num}
                        ref={step.ref}
                        className={`${glassCardClass} p-8 mb-8`}
                        initial={MOTION_FADE_UP.initial}
                        animate={step.inView ? MOTION_FADE_UP.animate : MOTION_FADE_UP.initial}
                        transition={{ ...MOTION_FADE_UP.transition, delay: index * 0.15 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-2xl cursor-default"
                                        style={{ background: stepIconGradient, boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
                                        animate={{ boxShadow: ['0 4px 20px rgba(251,191,36,0.35)', '0 4px 28px rgba(245,158,11,0.45)', '0 4px 20px rgba(251,191,36,0.35)'] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                        whileHover={{ boxShadow: '0 0 28px rgba(251,191,36,0.5), 0 0 40px rgba(245,158,11,0.4)' }}
                                    >
                                        {step.num}
                                    </motion.div>
                                    {iconMap[step.icon]}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600 mb-4 max-w-xl">{step.desc}</p>
                                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                                    {step.bullets.map((b, i) => (
                                        <li key={i} className="flex items-center justify-center md:justify-start gap-2">
                                            <CheckIcon />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-gray-700 font-medium text-sm">{step.footer}</p>
                            </div>
                            <div className="w-full md:w-[280px] shrink-0">
                                <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center p-6 text-center">
                                    <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>{step.num}</span>
                                    <span className="text-gray-400 mb-2" aria-hidden>{iconMapPlaceholder[step.icon]}</span>
                                    <p className="text-sm text-gray-500 font-medium">{step.imageDesc}</p>
                                    <p className="text-xs text-gray-400 mt-1">[ Add image {step.num} – design to suit ]</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="max-w-2xl mx-auto h-px"
                initial={{ opacity: 0, scaleX: 0.6 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.25), rgba(234,88,12,0.25), transparent)', transformOrigin: 'center' }}
            />

            {/* Quality & Safety Standards */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span aria-hidden>✅</span>
                        {t?.howItWorks?.clinicQualityTitle || 'Our Quality & Safety Standards'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t?.howItWorks?.clinicQualityIntro || 'Skin clinics can join IndaStreet. Those we verify receive the IndaStreet Verified badge after we review:'}
                    </p>
                    <ul className="grid sm:grid-cols-2 gap-3 text-gray-700">
                        {[
                            t?.howItWorks?.clinicQuality1 ?? 'Business registration and legitimacy',
                            t?.howItWorks?.clinicQuality2 ?? 'Practitioner credentials and certifications',
                            t?.howItWorks?.clinicQuality3 ?? 'Service and treatment standards',
                            t?.howItWorks?.clinicQuality4 ?? 'Platform compliance and professional conduct',
                            t?.howItWorks?.clinicQuality5 ?? 'Location and operational details',
                            t?.howItWorks?.clinicQuality6 ?? 'Customer feedback and reputation',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <CheckIcon />
                                {item}
                            </li>
                        ))}
                    </ul>
                    <p className="mt-6 text-gray-700 font-medium">
                        {t?.howItWorks?.clinicQualityClosing || 'Verified clinics have met our standards. Look for the IndaStreet Verified badge.'}
                    </p>
                </div>
            </motion.div>

            {/* Why Join */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="flex flex-col md:flex-row md:min-h-[320px]">
                    <motion.div
                        className="relative w-full md:w-[42%] min-h-[220px] md:min-h-[320px] shrink-0 overflow-hidden rounded-l-xl bg-gradient-to-br from-orange-50 to-amber-50/80"
                        initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
                        whileInView={{ opacity: 1, clipPath: 'inset(0 0 0 0)' }}
                        viewport={MOTION_VIEW}
                        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                        <img
                            src="https://ik.imagekit.io/7grri5v7d/therapist_verfied-removebg-preview.png?updatedAt=1766312265747"
                            alt="Skin clinic partner – Join IndaStreet"
                            className="absolute inset-0 w-full h-full object-contain object-center"
                            loading="eager"
                        />
                    </motion.div>
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t?.howItWorks?.clinicWhyJoinTitle || 'Why List Your Skin Clinic on IndaStreet?'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 max-w-xl">
                            {t?.howItWorks?.clinicWhyJoinTagline || 'Reach safety-conscious clients. Grow your practice. We help qualified clinics thrive.'}
                        </p>
                        <ul className="space-y-4">
                            {whyJoinItems.map((item, i) => (
                                <motion.li
                                    key={i}
                                    className="flex gap-3 rounded-lg group"
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={MOTION_VIEW}
                                    transition={{ duration: 0.35, delay: i * 0.06 }}
                                >
                                    <span className="flex-shrink-0 mt-0.5 text-green-600"><CheckIcon /></span>
                                    <div>
                                        <span className="font-semibold text-gray-900 block">{item.title}</span>
                                        <span className="text-gray-600 text-sm leading-relaxed">{item.description}</span>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                        <div className="mt-8 w-full max-w-[320px] mx-auto md:mx-0 md:ml-auto">
                            <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[180px] flex flex-col items-center justify-center p-6 text-center">
                                <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>6</span>
                                <svg className="w-10 h-10 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                                <p className="text-sm text-gray-600 font-medium">6. Why Join – clinic growth, safety-conscious clients</p>
                                <p className="text-xs text-gray-400 mt-1">[ Add image 6 – design to suit ]</p>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <VerifiedSkinClinicProgramSection t={t} />
            <ProfessionalClinicIdentitySection t={t} />
            <SkinClinicFAQSection t={t} />
        </div>
    );
}

/** Verified Skin Clinic Program */
function VerifiedSkinClinicProgramSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.05 });

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className={`${glassCardClass} overflow-hidden border border-slate-200/90 bg-white`}>
                <div className="border-b border-slate-200/80 bg-slate-50/60 px-6 py-8 md:px-10 md:py-10">
                    <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">
                        {t?.howItWorks?.verifiedClinicTitle ?? 'IndaStreet Verified Skin Clinic Program'}
                    </h2>
                    <p className="mt-2 text-lg font-medium text-slate-600">
                        {t?.howItWorks?.verifiedClinicSubtitle ?? 'Trust Badge. Higher Visibility. More Bookings.'}
                    </p>
                    <p className="mt-4 text-slate-600 leading-relaxed">
                        {t?.howItWorks?.verifiedClinicIntro ?? 'Verified skin clinics receive a trust badge and improved search visibility. Customers know they are booking with a qualified, reviewed provider.'}
                    </p>
                </div>
                <div className="p-6 md:p-10 space-y-6">
                    <ul className="space-y-2 text-slate-700">
                        {[
                            t?.howItWorks?.verifiedClinicItem1 ?? 'Business and credential verification',
                            t?.howItWorks?.verifiedClinicItem2 ?? 'Trust badge on your profile',
                            t?.howItWorks?.verifiedClinicItem3 ?? 'Higher ranking in search results',
                            t?.howItWorks?.verifiedClinicItem4 ?? 'Increased booking confidence',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                    <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </motion.section>
    );
}

/** Professional Clinic Identity */
function ProfessionalClinicIdentitySection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, PROFESSIONAL_IDENTITY_VIEW);

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20 rounded-2xl overflow-hidden bg-white/95 border border-gray-200/80 shadow-sm"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
                <div className="text-center mb-10">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                        {t?.howItWorks?.clinicIdentityTitle ?? 'Your Professional Clinic Profile'}
                    </h2>
                    <p className="mt-2 text-lg text-gray-500 font-medium">Powered by IndaStreet</p>
                    <p className="mt-4 max-w-2xl mx-auto text-gray-600">
                        {t?.howItWorks?.clinicIdentityIntro ?? 'Every verified skin clinic receives a professionally designed, shareable profile. Services, practitioners, reviews, and booking—all in one place.'}
                    </p>
                </div>
                <div className="flex justify-center">
                    <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[240px] w-full max-w-[400px] flex flex-col items-center justify-center p-6 text-center">
                        <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">CLINIC</span>
                        <svg className="w-16 h-16 text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                        <p className="text-sm text-gray-600 font-medium">[ Add Skin Clinic Profile Screenshot ]</p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

/** Advanced Therapist Control Center – enterprise-level dashboard section (informational only) */
const AdvancedTherapistControlCenterSection = React.memo(function AdvancedTherapistControlCenterSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.05 });

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className={`${glassCardClass} overflow-hidden border border-slate-200/90 bg-white`}>
                <div className="p-6 md:p-10">
                    <div className="grid md:grid-cols-[1fr,360px] gap-10 md:gap-12 items-start">
                        {/* Left: Text content */}
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                                    <span aria-hidden>🖥</span>
                                    {t?.howItWorks?.controlCenterTitle ?? 'Advanced Therapist Control Center'}
                                </h2>
                                <p className="mt-2 text-lg font-medium text-slate-700">
                                    {t?.howItWorks?.controlCenterSubtitle ?? 'Your Business. Fully Managed.'}
                                </p>
                                <p className="mt-4 text-slate-600 leading-relaxed">
                                    {t?.howItWorks?.controlCenterIntro ?? 'Every IndaStreet therapist receives access to a powerful, professionally engineered dashboard designed to give you complete operational control.'}
                                </p>
                                <p className="mt-4 text-slate-700 font-medium">
                                    {t?.howItWorks?.controlCenterTagline ?? "This is more than a booking panel. It's your full massage business management system — in one place."}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span aria-hidden>🎯</span>
                                    {t?.howItWorks?.controlCenterFullControl ?? 'Full Control at Your Fingertips'}
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {t?.howItWorks?.controlCenterManageIntro ?? 'Your dashboard allows you to manage:'}
                                </p>
                                <ul className="grid sm:grid-cols-2 gap-2 text-slate-700">
                                    {[
                                        t?.howItWorks?.controlCenterItem1 ?? 'Online / Offline status instantly',
                                        t?.howItWorks?.controlCenterItem2 ?? 'Real-time bookings',
                                        t?.howItWorks?.controlCenterItem3 ?? 'Schedule & availability',
                                        t?.howItWorks?.controlCenterItem4 ?? 'Earnings tracking',
                                        t?.howItWorks?.controlCenterItem5 ?? 'Commission management',
                                        t?.howItWorks?.controlCenterItem6 ?? 'Promotional banners',
                                        t?.howItWorks?.controlCenterItem7 ?? 'Profile updates',
                                        t?.howItWorks?.controlCenterItem8 ?? 'Service menu adjustments',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckIcon />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-4 text-slate-600 space-y-1">
                                    <span className="block font-medium">{t?.howItWorks?.controlCenterControl1 ?? 'You control when you work.'}</span>
                                    <span className="block font-medium">{t?.howItWorks?.controlCenterControl2 ?? 'You control how you appear.'}</span>
                                    <span className="block font-medium">{t?.howItWorks?.controlCenterControl3 ?? 'You control your growth.'}</span>
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span aria-hidden>💬</span>
                                    {t?.howItWorks?.controlCenterChatTitle ?? 'Dedicated Private Chat System'}
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {t?.howItWorks?.controlCenterChatIntro ?? 'Each therapist receives a secure, built-in chat window to communicate directly with clients.'}
                                </p>
                                <p className="text-slate-600 mb-2">{t?.howItWorks?.controlCenterChatIncludes ?? 'This includes:'}</p>
                                <ul className="space-y-1 text-slate-700 mb-4">
                                    <li>• {t?.howItWorks?.controlCenterChat1 ?? 'Real-time messaging'}</li>
                                    <li>• {t?.howItWorks?.controlCenterChat2 ?? 'Booking clarification'}</li>
                                    <li>• {t?.howItWorks?.controlCenterChat3 ?? 'Schedule adjustments'}</li>
                                    <li>• {t?.howItWorks?.controlCenterChat4 ?? 'Pre-service communication'}</li>
                                </ul>
                                <p className="text-slate-600">
                                    {t?.howItWorks?.controlCenterChatClosing ?? 'All conversations remain organized inside your professional workspace. No mixing business with personal messaging apps.'}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span aria-hidden>📈</span>
                                    {t?.howItWorks?.controlCenterGrowthTitle ?? 'Built for Growth'}
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {t?.howItWorks?.controlCenterGrowthIntro ?? 'Your dashboard is designed to support serious professionals. It helps you:'}
                                </p>
                                <ul className="space-y-1 text-slate-700 mb-4">
                                    <li>• {t?.howItWorks?.controlCenterGrowth1 ?? 'Track performance'}</li>
                                    <li>• {t?.howItWorks?.controlCenterGrowth2 ?? 'Improve response times'}</li>
                                    <li>• {t?.howItWorks?.controlCenterGrowth3 ?? 'Increase booking conversions'}</li>
                                    <li>• {t?.howItWorks?.controlCenterGrowth4 ?? 'Present a professional image'}</li>
                                    <li>• {t?.howItWorks?.controlCenterGrowth5 ?? 'Stay organized and efficient'}</li>
                                </ul>
                                <p className="text-slate-600">
                                    {t?.howItWorks?.controlCenterGrowthClosing ?? 'IndaStreet continuously upgrades platform capabilities to ensure therapists have access to modern tools that compete at a global level.'}
                                </p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6">
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span aria-hidden>🌍</span>
                                    {t?.howItWorks?.controlCenterPlatformTitle ?? 'A Platform Designed for Professional Success'}
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {t?.howItWorks?.controlCenterPlatformIntro ?? 'IndaStreet is built to empower:'}
                                </p>
                                <ul className="space-y-2 text-slate-700 mb-4">
                                    <li>• {t?.howItWorks?.controlCenterPlatform1 ?? 'Independent Massage Therapists'}</li>
                                    <li>• {t?.howItWorks?.controlCenterPlatform2 ?? 'Spa Professionals'}</li>
                                    <li>• {t?.howItWorks?.controlCenterPlatform3 ?? 'Skin Care Clinics'}</li>
                                </ul>
                                <p className="text-slate-600 mb-4">
                                    {t?.howItWorks?.controlCenterPlatformCommitment ?? 'We are committed to providing a structured, secure, and professionally managed environment where therapists can grow with confidence.'}
                                </p>
                                <p className="text-slate-600 mb-4">
                                    {t?.howItWorks?.controlCenterPlatformBenefit ?? 'As therapists elevate their standards, customers benefit from trusted, premium massage services delivered by verified professionals.'}
                                </p>
                                <p className="text-slate-800 font-semibold space-y-1">
                                    <span className="block">{t?.howItWorks?.controlCenterTag1 ?? 'Professional platform.'}</span>
                                    <span className="block">{t?.howItWorks?.controlCenterTag2 ?? 'Professional therapists.'}</span>
                                    <span className="block">{t?.howItWorks?.controlCenterTag3 ?? 'Professional results.'}</span>
                                </p>
                            </div>
                        </div>

                        {/* Right: Therapist dashboard screenshot – includes header & full page */}
                        <div className="flex justify-center md:justify-end md:sticky md:top-28">
                            <style>{`
                                @keyframes controlCenterFloat {
                                    0%, 100% { transform: translateY(0); }
                                    50% { transform: translateY(-2px); }
                                }
                                .control-center-dashboard-float { animation: controlCenterFloat 8s ease-in-out infinite; }
                            `}</style>
                            <motion.div
                                className="w-full max-w-[360px] control-center-dashboard-float"
                                initial={{ opacity: 0, y: 12 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                                whileHover={{ y: -2 }}
                            >
                                <div className="rounded-[20px] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                                    <img
                                        src="https://ik.imagekit.io/7grri5v7d/THERAPIST%20DASHBOARD%20SCREENSHOT.png"
                                        alt="IndaStreet therapist dashboard – bookings, earnings, schedule, and profile management"
                                        className="w-full h-auto min-h-[400px] object-contain object-top block"
                                        loading="lazy"
                                    />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
});

/** Advanced Place Control Center – spa/place dashboard section */
const AdvancedPlaceControlCenterSection = React.memo(function AdvancedPlaceControlCenterSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.05 });

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className={`${glassCardClass} overflow-hidden border border-slate-200/90 bg-white`}>
                <div className="p-6 md:p-10">
                    <div className="grid md:grid-cols-[1fr,360px] gap-10 md:gap-12 items-start">
                        <div className="space-y-8">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight flex items-center gap-2">
                                    <span aria-hidden>🏢</span>
                                    {t?.howItWorks?.placeControlCenterTitle ?? 'Advanced Place Control Center'}
                                </h2>
                                <p className="mt-2 text-lg font-medium text-slate-700">
                                    {t?.howItWorks?.placeControlCenterSubtitle ?? 'Your Spa. Fully Managed.'}
                                </p>
                                <p className="mt-4 text-slate-600 leading-relaxed">
                                    {t?.howItWorks?.placeControlCenterIntro ?? 'Every IndaStreet spa receives access to a powerful Place Dashboard designed to give you complete operational control over bookings, team, and earnings.'}
                                </p>
                                <p className="mt-4 text-slate-700 font-medium">
                                    {t?.howItWorks?.placeControlCenterTagline ?? "Manage your spa's bookings, schedule, services, and revenue—all in one place."}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span aria-hidden>🎯</span>
                                    {t?.howItWorks?.placeControlCenterManageTitle ?? 'Full Control at Your Fingertips'}
                                </h3>
                                <p className="text-slate-600 mb-4">
                                    {t?.howItWorks?.placeControlCenterManageIntro ?? 'Your Place Dashboard allows you to:'}
                                </p>
                                <ul className="grid sm:grid-cols-2 gap-2 text-slate-700">
                                    {[
                                        t?.howItWorks?.placeControlItem1 ?? 'Accept, decline, or reschedule bookings',
                                        t?.howItWorks?.placeControlItem2 ?? 'Assign therapists to sessions',
                                        t?.howItWorks?.placeControlItem3 ?? 'Manage services and pricing',
                                        t?.howItWorks?.placeControlItem4 ?? 'Track earnings and payouts',
                                        t?.howItWorks?.placeControlItem5 ?? 'Set availability by day and time',
                                        t?.howItWorks?.placeControlItem6 ?? 'Update spa profile and photos',
                                        t?.howItWorks?.placeControlItem7 ?? 'View customer reviews',
                                        t?.howItWorks?.placeControlItem8 ?? 'Handle in-spa and outcall options',
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <CheckIcon />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
                                    <span aria-hidden>📈</span>
                                    {t?.howItWorks?.placeControlCenterGrowthTitle ?? 'Built for Spa Growth'}
                                </h3>
                                <p className="text-slate-600">
                                    {t?.howItWorks?.placeControlCenterGrowthIntro ?? 'IndaStreet is committed to providing a professional platform where spas can reach more customers, manage operations efficiently, and grow their business with confidence.'}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-center md:justify-end md:sticky md:top-28">
                            <style>{`
                                @keyframes placeControlFloat {
                                    0%, 100% { transform: translateY(0); }
                                    50% { transform: translateY(-2px); }
                                }
                                .place-control-float { animation: placeControlFloat 8s ease-in-out infinite; }
                            `}</style>
                            <motion.div
                                className="w-full max-w-[360px] place-control-float"
                                initial={{ opacity: 0, y: 12 }}
                                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                                transition={{ duration: 0.6, delay: 0.15 }}
                            >
                                <div className="rounded-[20px] overflow-hidden border border-slate-200 shadow-xl shadow-slate-200/50 bg-white">
                                    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300">
                                        <svg className="w-16 h-16 text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                        <p className="text-sm text-gray-600 font-medium text-center">[ Place Dashboard Screenshot ]</p>
                                        <p className="text-xs text-gray-400 mt-1">Add screenshot when ready</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
});

/** IndaStreet Verified Place Program – spa verification */
function VerifiedPlaceProgramSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.05 });

    const title = t?.howItWorks?.verifiedPlaceTitle ?? 'IndaStreet Verified Place Program';
    const subtitle = t?.howItWorks?.verifiedPlaceSubtitle ?? 'Become a Trusted Spa Partner';
    const intro = t?.howItWorks?.verifiedPlaceIntro ?? 'IndaStreet offers spas the opportunity to apply for Verified Place Status. Verification confirms your business meets professional standards and enhances credibility with customers.';

    const verifiedMeans = [
        { label: t?.howItWorks?.verifiedPlaceMean1 ?? 'Business details confirmed' },
        { label: t?.howItWorks?.verifiedPlaceMean2 ?? 'Location and credentials reviewed' },
        { label: t?.howItWorks?.verifiedPlaceMean3 ?? 'Service standards acknowledged' },
        { label: t?.howItWorks?.verifiedPlaceMean4 ?? 'Platform compliance approved' },
    ];
    const benefits = [
        t?.howItWorks?.verifiedPlaceBenefit1 ?? 'Higher visibility in search',
        t?.howItWorks?.verifiedPlaceBenefit2 ?? 'Trust badge on your profile',
        t?.howItWorks?.verifiedPlaceBenefit3 ?? 'Increased booking confidence',
        t?.howItWorks?.verifiedPlaceBenefit4 ?? 'Stronger brand positioning',
    ];

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className={`${glassCardClass} overflow-hidden border border-slate-200/90 bg-white`}>
                <div className="border-b border-slate-200/80 bg-slate-50/60 px-6 py-8 md:px-10 md:py-10">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{title}</h2>
                        <p className="mt-2 text-lg font-medium text-slate-600">{subtitle}</p>
                        <p className="mt-4 text-slate-600 leading-relaxed">{intro}</p>
                    </div>
                </div>
                <div className="p-6 md:p-10 space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">{t?.howItWorks?.verifiedPlaceStatusHeading ?? 'What Is Verified Place Status?'}</h3>
                        <ul className="space-y-2">
                            {verifiedMeans.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-slate-600">{t?.howItWorks?.verifiedPlaceBadgeCopy ?? 'Verified spas receive a Trust Badge displayed on their profile, increasing customer confidence and bookings.'}</p>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>⭐</span>
                            {t?.howItWorks?.verifiedPlaceBenefitsHeading ?? 'Benefits of Being Verified'}
                        </h3>
                        <ul className="grid sm:grid-cols-2 gap-2 text-slate-700">
                            {benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-slate-400 mt-1">•</span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>📝</span>
                            {t?.howItWorks?.verifiedPlaceHowHeading ?? 'How Do I Become Verified?'}
                        </h3>
                        <p className="text-slate-600 mb-4">{t?.howItWorks?.verifiedPlaceHowIntro ?? 'Inside your Place Dashboard:'}</p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-700">
                            <li>{t?.howItWorks?.verifiedPlaceStep1 ?? 'Select "Apply for Verification"'}</li>
                            <li>{t?.howItWorks?.verifiedPlaceStep2 ?? 'Submit business registration and documents'}</li>
                            <li>{t?.howItWorks?.verifiedPlaceStep3 ?? 'Complete location and credential review'}</li>
                            <li>{t?.howItWorks?.verifiedPlaceStep4 ?? 'Await approval notification'}</li>
                        </ol>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

/** Professional Spa Identity – place profile section */
function ProfessionalSpaIdentitySection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, PROFESSIONAL_IDENTITY_VIEW);

    const profileItems = [
        t?.howItWorks?.spaIdentityItem1 ?? 'Professional spa layout and branding',
        t?.howItWorks?.spaIdentityItem2 ?? 'Service menu and treatment list',
        t?.howItWorks?.spaIdentityItem3 ?? 'Pricing and package display',
        t?.howItWorks?.spaIdentityItem4 ?? 'Location and operating hours',
        t?.howItWorks?.spaIdentityItem5 ?? 'Reviews & rating system',
        t?.howItWorks?.spaIdentityItem6 ?? 'Verified badge (if approved)',
        t?.howItWorks?.spaIdentityItem7 ?? 'Direct booking access',
    ];

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20 rounded-2xl overflow-hidden bg-white/95 border border-gray-200/80 shadow-sm"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                        {t?.howItWorks?.spaIdentityTitle ?? 'Your Professional Spa Profile Page'}
                    </h2>
                    <p className="mt-2 text-lg text-gray-500 font-medium">
                        {t?.howItWorks?.spaIdentityPowered ?? 'Powered by IndaStreet'}
                    </p>
                    <p className="mt-6 max-w-2xl mx-auto text-gray-600 leading-relaxed">
                        {t?.howItWorks?.spaIdentityIntro ?? 'Every spa on IndaStreet receives a professionally designed, shareable profile page—completely free. Your spa appears in search and customers can book directly.'}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span aria-hidden>💼</span>
                                {t?.howItWorks?.spaIdentityProfileHeading ?? 'Your Spa Business Page'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{t?.howItWorks?.spaIdentityProfileIncludes ?? 'Your spa profile includes:'}</p>
                            <ul className="space-y-2">
                                {profileItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-700">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[280px] w-full max-w-[400px] flex flex-col items-center justify-center p-6 text-center">
                            <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">SPA</span>
                            <svg className="w-16 h-16 text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            <p className="text-sm text-gray-600 font-medium">[ Add Spa Profile Screenshot ]</p>
                            <p className="text-xs text-gray-400 mt-1">Place profile – design to suit</p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

/** IndaStreet Verified Therapist Program – premium, trust-based, institutional UI only */
function VerifiedTherapistProgramSection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, { once: true, amount: 0.05 });

    const title = t?.howItWorks?.verifiedProgramTitle ?? 'IndaStreet Verified Therapist Program';
    const subtitle = t?.howItWorks?.verifiedProgramSubtitle ?? 'Become a Recognized Professional';
    const intro = t?.howItWorks?.verifiedProgramIntro ?? 'IndaStreet offers therapists the opportunity to apply for Verified Therapist Status. Verification confirms that you meet professional standards and enhances your credibility across the platform.';

    const verifiedMeans = [
        { label: t?.howItWorks?.verifiedMean1 ?? 'Identity confirmed' },
        { label: t?.howItWorks?.verifiedMean2 ?? 'Professional documentation reviewed' },
        { label: t?.howItWorks?.verifiedMean3 ?? 'Service standards acknowledged' },
        { label: t?.howItWorks?.verifiedMean4 ?? 'Platform compliance approved' },
    ];
    const safePassItems = [
        { label: t?.howItWorks?.safePass1 ?? 'Confirms professional verification' },
        { label: t?.howItWorks?.safePass2 ?? 'Confirms identity approval' },
        { label: t?.howItWorks?.safePass3 ?? 'Confirms platform compliance' },
        { label: t?.howItWorks?.safePass4 ?? 'Increases acceptance at secured properties' },
    ];
    const benefits = [
        t?.howItWorks?.verifiedBenefit1 ?? 'Increased booking confidence',
        t?.howItWorks?.verifiedBenefit2 ?? 'Higher conversion rates',
        t?.howItWorks?.verifiedBenefit3 ?? 'Greater trust from new clients',
        t?.howItWorks?.verifiedBenefit4 ?? 'Better access to premium locations',
        t?.howItWorks?.verifiedBenefit5 ?? 'Stronger brand positioning',
        t?.howItWorks?.verifiedBenefit6 ?? 'Higher perceived value',
    ];
    const stepsToVerify = [
        t?.howItWorks?.verifyStep1 ?? 'Select "Apply for Verification"',
        t?.howItWorks?.verifyStep2 ?? 'Submit required documentation',
        t?.howItWorks?.verifyStep3 ?? 'Complete identity confirmation',
        t?.howItWorks?.verifyStep4 ?? 'Await approval notification',
    ];

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className={`${glassCardClass} overflow-hidden border border-slate-200/90 bg-white`}>
                {/* Section header */}
                <div className="border-b border-slate-200/80 bg-slate-50/60 px-6 py-8 md:px-10 md:py-10">
                    <div className="max-w-3xl">
                        <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 tracking-tight">{title}</h2>
                        <p className="mt-2 text-lg font-medium text-slate-600">{subtitle}</p>
                        <p className="mt-4 text-slate-600 leading-relaxed">{intro}</p>
                    </div>
                </div>

                <div className="p-6 md:p-10 space-y-12">
                    {/* What Is Verified Status */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3">{t?.howItWorks?.verifiedStatusHeading ?? 'What Is Verified Status?'}</h3>
                        <p className="text-slate-600 mb-4">{t?.howItWorks?.verifiedStatusMeans ?? 'Verified Status means:'}</p>
                        <ul className="space-y-2">
                            {verifiedMeans.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-slate-600 leading-relaxed">
                            {t?.howItWorks?.verifiedBadgeCopy ?? 'Verified therapists receive a Verified Badge displayed on their profile. This increases client trust and booking confidence.'}
                        </p>
                    </div>

                    {/* Global Recognition ID */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:p-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>🌍</span>
                            {t?.howItWorks?.globalIdHeading ?? 'Global Recognition ID'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {t?.howItWorks?.globalIdIntro ?? 'Verified therapists receive a Digital Therapist ID, recognized across the IndaStreet network. This ID:'}
                        </p>
                        <ul className="space-y-2 text-slate-700 mb-4">
                            <li className="pl-4 border-l-2 border-slate-300">Confirms professional standing</li>
                            <li className="pl-4 border-l-2 border-slate-300">Displays verification status</li>
                            <li className="pl-4 border-l-2 border-slate-300">Can be shown to hotels, villas, and property managers</li>
                            <li className="pl-4 border-l-2 border-slate-300">Confirms legitimacy when entering private properties</li>
                        </ul>
                        <p className="text-slate-600 italic">{t?.howItWorks?.globalIdClosing ?? 'Your ID helps establish immediate trust.'}</p>
                    </div>

                    {/* SafePass Access */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 md:p-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>🏨</span>
                            {t?.howItWorks?.safePassHeading ?? 'SafePass Access for Hotels & Villas'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {t?.howItWorks?.safePassIntro ?? 'Many hotels, luxury villas, and private residences require proof of professional service providers before allowing entry. IndaStreet Verified Therapists may qualify for SafePass Access, which:'}
                        </p>
                        <ul className="space-y-2 mb-4">
                            {safePassItems.map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-700">
                                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                    </span>
                                    {item.label}
                                </li>
                            ))}
                        </ul>
                        <p className="text-slate-600 mb-2">{t?.howItWorks?.safePassEasier ?? 'SafePass makes it easier for you to:'}</p>
                        <ul className="space-y-1 text-slate-700 mb-4 list-disc list-inside">
                            <li>{t?.howItWorks?.safePassE1 ?? 'Enter gated communities'}</li>
                            <li>{t?.howItWorks?.safePassE2 ?? 'Access high-end resorts'}</li>
                            <li>{t?.howItWorks?.safePassE3 ?? 'Provide services at luxury villas'}</li>
                            <li>{t?.howItWorks?.safePassE4 ?? 'Work confidently in regulated properties'}</li>
                        </ul>
                        <p className="text-slate-600 italic">{t?.howItWorks?.safePassClosing ?? 'Professional recognition opens professional doors.'}</p>
                    </div>

                    {/* Benefits */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>⭐</span>
                            {t?.howItWorks?.verifiedBenefitsHeading ?? 'Benefits of Being Verified'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {t?.howItWorks?.verifiedBenefitsIntro ?? 'Verified therapists experience:'}
                        </p>
                        <ul className="grid sm:grid-cols-2 gap-2 text-slate-700">
                            {benefits.map((b, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-slate-400 mt-1">•</span>
                                    <span>{b}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-slate-600 italic">{t?.howItWorks?.verifiedBenefitsClosing ?? 'Verification helps you stand out in competitive markets.'}</p>
                    </div>

                    {/* Ranking */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 md:p-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>📈</span>
                            {t?.howItWorks?.rankingHeading ?? 'Does Verification Improve Ranking?'}
                        </h3>
                        <p className="text-slate-700 font-medium mb-2">{t?.howItWorks?.rankingAnswer ?? 'Yes.'}</p>
                        <p className="text-slate-600">
                            {t?.howItWorks?.rankingCopy ?? 'Verified profiles may receive improved visibility compared to unverified accounts, especially in premium property areas and hotel zones. Active, professional, verified therapists are prioritized in quality-based ranking.'}
                        </p>
                    </div>

                    {/* How to Become Verified */}
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>📝</span>
                            {t?.howItWorks?.howToVerifyHeading ?? 'How Do I Become Verified?'}
                        </h3>
                        <p className="text-slate-600 mb-4">{t?.howItWorks?.howToVerifyIntro ?? 'Inside your Therapist Dashboard:'}</p>
                        <ol className="list-decimal list-inside space-y-2 text-slate-700 mb-4">
                            {stepsToVerify.map((step, i) => (
                                <li key={i}>{step}</li>
                            ))}
                        </ol>
                        <p className="text-slate-600">{t?.howItWorks?.howToVerifyClosing ?? 'Once approved, your Verified Badge appears automatically.'}</p>
                    </div>

                    {/* Why Verification Matters */}
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-6 md:p-8">
                        <h3 className="text-xl font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <span aria-hidden>🔒</span>
                            {t?.howItWorks?.whyVerifyHeading ?? 'Why Verification Matters'}
                        </h3>
                        <p className="text-slate-600 mb-4">
                            {t?.howItWorks?.whyVerifyIntro ?? 'In today\'s market, trust is everything.'}
                        </p>
                        <ul className="space-y-1 text-slate-700 mb-4">
                            <li>• {t?.howItWorks?.whyVerifyC1 ?? 'Clients feel safer.'}</li>
                            <li>• {t?.howItWorks?.whyVerifyC2 ?? 'Hotels feel secure.'}</li>
                            <li>• {t?.howItWorks?.whyVerifyC3 ?? 'Property managers cooperate easier.'}</li>
                        </ul>
                        <p className="text-slate-600 font-medium">{t?.howItWorks?.whyVerifyClosing ?? 'Verification elevates your professional reputation.'}</p>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

/** Your Own Professional Identity Page – premium, authoritative, visual-only section */
const PROFESSIONAL_IDENTITY_VIEW = { once: true, amount: 0.08 };

function ProfessionalIdentitySection({ t }: { t?: any }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(sectionRef, PROFESSIONAL_IDENTITY_VIEW);

    const profileItems = [
        t?.howItWorks?.identityItem1 ?? 'Professional layout design',
        t?.howItWorks?.identityItem2 ?? 'Service menu display',
        t?.howItWorks?.identityItem3 ?? 'Pricing structure',
        t?.howItWorks?.identityItem4 ?? 'Location visibility',
        t?.howItWorks?.identityItem5 ?? 'Reviews & rating system',
        t?.howItWorks?.identityItem6 ?? 'Verification badge (if approved)',
        t?.howItWorks?.identityItem7 ?? 'Direct booking access',
    ];
    const shareChannels = [
        t?.howItWorks?.identityShare1 ?? 'Instagram',
        t?.howItWorks?.identityShare2 ?? 'Facebook',
        t?.howItWorks?.identityShare3 ?? 'WhatsApp',
        t?.howItWorks?.identityShare4 ?? 'TikTok',
        t?.howItWorks?.identityShare5 ?? 'Google Business',
        t?.howItWorks?.identityShare6 ?? 'Direct messaging',
        t?.howItWorks?.identityShare7 ?? 'Hotel concierges',
        t?.howItWorks?.identityShare8 ?? 'Villa managers',
    ];
    const visibilityPoints = [
        t?.howItWorks?.identityVisibility1 ?? 'Improve discoverability',
        t?.howItWorks?.identityVisibility2 ?? 'Build trust instantly',
        t?.howItWorks?.identityVisibility3 ?? 'Convert profile views into bookings',
        t?.howItWorks?.identityVisibility4 ?? 'Present your services professionally',
    ];
    const freeItems = [
        t?.howItWorks?.identityFree1 ?? 'Website design',
        t?.howItWorks?.identityFree2 ?? 'Hosting',
        t?.howItWorks?.identityFree3 ?? 'Maintenance',
        t?.howItWorks?.identityFree4 ?? 'Booking system integration',
        t?.howItWorks?.identityFree5 ?? 'Profile optimization',
    ];
    const struggles = [
        t?.howItWorks?.identityStruggle1 ?? 'Building a website',
        t?.howItWorks?.identityStruggle2 ?? 'Managing bookings',
        t?.howItWorks?.identityStruggle3 ?? 'Creating trust online',
        t?.howItWorks?.identityStruggle4 ?? 'Being discovered',
    ];
    const foundationItems = [
        t?.howItWorks?.identityFoundation1 ?? 'Massage Therapists',
        t?.howItWorks?.identityFoundation2 ?? 'Spa Professionals',
        t?.howItWorks?.identityFoundation3 ?? 'Skin Care Clinics',
        t?.howItWorks?.identityFoundation4 ?? 'Wellness Practitioners',
    ];

    return (
        <motion.section
            ref={sectionRef}
            className="relative mt-20 rounded-2xl overflow-hidden bg-white/95 border border-gray-200/80 shadow-sm"
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
        >
            <div className="max-w-6xl mx-auto px-6 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 tracking-tight">
                        {t?.howItWorks?.identityTitle ?? 'Your Own Professional Identity Page'}
                    </h2>
                    <p className="mt-2 text-lg text-gray-500 font-medium">
                        {t?.howItWorks?.identityPowered ?? 'Powered by IndaStreet'}
                    </p>
                    <p className="mt-6 max-w-2xl mx-auto text-gray-600 leading-relaxed">
                        {t?.howItWorks?.identityIntro ?? 'Every therapist on IndaStreet receives a professionally designed, shareable profile page — completely free.'}
                    </p>
                    <p className="mt-3 text-gray-700 font-medium">
                        {t?.howItWorks?.identityTagline ?? 'This is more than a listing. It is your personal digital brand identity.'}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-10 md:gap-14 items-start">
                    {/* Left: content */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span aria-hidden>💼</span>
                                {t?.howItWorks?.identityBusinessHeading ?? 'Your Personal Massage Business Page'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">{t?.howItWorks?.identityProfileIncludes ?? 'Your profile includes:'}</p>
                            <ul className="space-y-2">
                                {profileItems.map((item, i) => (
                                    <li key={i} className="flex items-center gap-2 text-gray-700">
                                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                                            <svg className="w-3 h-3 text-emerald-700" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <p className="mt-3 text-gray-600 text-sm italic">
                                {t?.howItWorks?.identityProfileClosing ?? 'Your page is optimized to present you as a serious, trusted professional.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span aria-hidden>🔗</span>
                                {t?.howItWorks?.identityShareHeading ?? 'Share Anywhere. Be Found Everywhere.'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-4">
                                {t?.howItWorks?.identityShareIntro ?? 'Your unique profile link can be shared across:'}
                            </p>
                            <div className="flex flex-wrap gap-3 mb-4">
                                {['instagram', 'facebook', 'whatsapp'].map((name) => (
                                    <motion.a
                                        key={name}
                                        href="#"
                                        aria-label={name}
                                        className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:opacity-100 opacity-80 transition-opacity duration-200"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {name === 'instagram' && (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.205.013-3.584.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 0 0 .002 0 .004 0h-.004z"/><path d="M12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                                        )}
                                        {name === 'facebook' && (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                        )}
                                        {name === 'whatsapp' && (
                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                                        )}
                                    </motion.a>
                                ))}
                            </div>
                            <ul className="text-gray-600 text-sm space-y-1">
                                {shareChannels.map((ch, i) => (
                                    <li key={i}>{ch}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-gray-600 text-sm italic">
                                {t?.howItWorks?.identityShareClosing ?? 'When clients search online, your professional identity works for you 24/7.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span aria-hidden>🚀</span>
                                {t?.howItWorks?.identityVisibilityHeading ?? 'Built for Visibility'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{t?.howItWorks?.identityVisibilityIntro ?? 'IndaStreet profiles are structured to:'}</p>
                            <ul className="space-y-1 text-gray-700 text-sm">
                                {visibilityPoints.map((p, i) => (
                                    <li key={i}>• {p}</li>
                                ))}
                            </ul>
                            <p className="mt-3 text-gray-600 text-sm">
                                {t?.howItWorks?.identityVisibilityClosing ?? 'This gives you a digital presence without needing to build your own website.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span aria-hidden>💰</span>
                                {t?.howItWorks?.identityFreeHeading ?? 'Powerful. Professional. Free.'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{t?.howItWorks?.identityFreeIntro ?? 'You do not pay for:'}</p>
                            <ul className="space-y-1 text-gray-700 text-sm">
                                {freeItems.map((item, i) => (
                                    <li key={i}>• {item}</li>
                                ))}
                            </ul>
                            <p className="mt-2 text-gray-600 text-sm">{t?.howItWorks?.identityFreeTag ?? "It's included."}</p>
                            <p className="mt-1 text-gray-600 text-sm italic">
                                {t?.howItWorks?.identityFreeClosing ?? "This alone saves therapists thousands in setup costs."}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span aria-hidden>🌍</span>
                                {t?.howItWorks?.identityMattersHeading ?? 'Why This Matters'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{t?.howItWorks?.identityMattersIntro ?? 'Most independent therapists struggle with:'}</p>
                            <ul className="space-y-1 text-gray-700 text-sm mb-2">
                                {struggles.map((s, i) => (
                                    <li key={i}>• {s}</li>
                                ))}
                            </ul>
                            <p className="text-gray-600 text-sm">
                                {t?.howItWorks?.identityMattersClosing ?? 'IndaStreet removes that barrier. You get a professional global presence without the technical burden.'}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <span aria-hidden>🏆</span>
                                {t?.howItWorks?.identityFoundationHeading ?? 'Leading the Foundation of Massage & Skin Care Services Worldwide'}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">{t?.howItWorks?.identityFoundationIntro ?? 'IndaStreet is building a professional foundation for:'}</p>
                            <ul className="space-y-1 text-gray-700 text-sm mb-2">
                                {foundationItems.map((f, i) => (
                                    <li key={i}>• {f}</li>
                                ))}
                            </ul>
                            <p className="text-gray-600 text-sm">
                                {t?.howItWorks?.identityFoundationTag ?? 'Across cities. Across countries. Across markets.'}
                            </p>
                            <p className="mt-2 text-gray-700 font-medium text-sm">
                                {t?.howItWorks?.identityFoundationClosing ?? "We don't just list therapists. We build professional identity systems."}
                            </p>
                        </div>
                    </div>

                    {/* Right: Therapist Shared Profile image – full height, subtle float */}
                    <style>{`
                        @keyframes professionalIdentityFloat {
                            0%, 100% { transform: translateY(0); }
                            50% { transform: translateY(-3px); }
                        }
                        .professional-identity-card-float { animation: professionalIdentityFloat 6s ease-in-out infinite; }
                    `}</style>
                    <div className="flex justify-center md:justify-end md:sticky md:top-28">
                        <motion.div
                            className="w-full max-w-[340px]"
                            initial={{ opacity: 0, y: 12 }}
                            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                        >
                            <div className="professional-identity-card-float rounded-[20px] overflow-hidden border border-gray-200 shadow-xl shadow-gray-200/50 bg-white">
                                <img
                                    src="https://ik.imagekit.io/7grri5v7d/THERAPIST%20SHARED%20PROFILE.png"
                                    alt="Therapist shared profile – IndaStreet professional identity"
                                    className="w-full h-auto min-h-[420px] object-contain object-center block"
                                    loading="eager"
                                />
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </motion.section>
    );
}

/** Booking Process (Customer) – How It Works for users: steps, assurance, profile checklist */
function BookingProcessHowItWorks({ t, glassCardClass, stepIconGradient }: { t?: any; glassCardClass: string; stepIconGradient: string }) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const ref1 = useRef<HTMLDivElement>(null);
    const ref2 = useRef<HTMLDivElement>(null);
    const ref3 = useRef<HTMLDivElement>(null);
    const ref4 = useRef<HTMLDivElement>(null);
    const ref5 = useRef<HTMLDivElement>(null);
    const inView1 = useInView(ref1, MOTION_VIEW);
    const inView2 = useInView(ref2, MOTION_VIEW);
    const inView3 = useInView(ref3, MOTION_VIEW);
    const inView4 = useInView(ref4, MOTION_VIEW);
    const inView5 = useInView(ref5, MOTION_VIEW);
    const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end end'] });
    const progressHeight = useTransform(scrollYProgress, [0, 0.75], ['0%', '100%']);
    const scrollBarWidth = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const steps = [
        { num: 1, ref: ref1, inView: inView1, title: t?.howItWorks?.bookingStep1Title || 'Search', desc: t?.howItWorks?.bookingStep1Desc || 'Find verified therapists, spas, or skin clinics by location, service type, or price. Filter by availability and read profiles before choosing.', bullets: [t?.howItWorks?.bookingStep1Item1 || 'Search by location or service', t?.howItWorks?.bookingStep1Item2 || 'Filter by price, rating, availability', t?.howItWorks?.bookingStep1Item3 || 'Browse verified provider profiles'], footer: t?.howItWorks?.bookingStep1Footer || 'Quality providers, easy discovery.', icon: 'search' as const, imageDesc: 'Search – browse therapists, spas, clinics by location and service' },
        { num: 2, ref: ref2, inView: inView2, title: t?.howItWorks?.bookingStep2Title || 'Choose Your Provider', desc: t?.howItWorks?.bookingStep2Desc || 'Review profiles carefully: verified badge, bio, services, pricing, reviews, and ratings. Pick a provider that fits your needs and expectations.', bullets: [t?.howItWorks?.bookingStep2Item1 || 'Check verified badge and credentials', t?.howItWorks?.bookingStep2Item2 || 'Read reviews and ratings', t?.howItWorks?.bookingStep2Item3 || 'Compare services and pricing'], footer: t?.howItWorks?.bookingStep2Footer || 'Know who you are booking with.', icon: 'user' as const, imageDesc: 'Choose – profile, reviews, services, verified badge' },
        { num: 3, ref: ref3, inView: inView3, title: t?.howItWorks?.bookingStep3Title || 'Book Now or Schedule', desc: t?.howItWorks?.bookingStep3Desc || 'Book Now for immediate or same-day service. Schedule for a future date. Both flows are clear—you see confirmation and next steps.', bullets: [t?.howItWorks?.bookingStep3Item1 || 'Book Now – immediate or same-day', t?.howItWorks?.bookingStep3Item2 || 'Schedule – pick date and time', t?.howItWorks?.bookingStep3Item3 || 'Clear confirmation and chat'], footer: t?.howItWorks?.bookingStep3Footer || 'Simple, transparent booking.', icon: 'calendar' as const, imageDesc: 'Book – Book Now or Schedule, confirmation flow' },
        { num: 4, ref: ref4, inView: inView4, title: t?.howItWorks?.bookingStep4Title || 'Confirm & Pay', desc: t?.howItWorks?.bookingStep4Desc || 'Provider confirms your booking. For scheduled services, a deposit may apply. Payment details are clear before you commit. Secure and transparent.', bullets: [t?.howItWorks?.bookingStep4Item1 || 'Provider confirms availability', t?.howItWorks?.bookingStep4Item2 || 'Deposit for scheduled (if applicable)', t?.howItWorks?.bookingStep4Item3 || 'Pay on-site or per booking terms'], footer: t?.howItWorks?.bookingStep4Footer || 'No surprises.', icon: 'check' as const, imageDesc: 'Confirm – provider confirmation, payment terms' },
        { num: 5, ref: ref5, inView: inView5, title: t?.howItWorks?.bookingStep5Title || 'Enjoy Your Session', desc: t?.howItWorks?.bookingStep5Desc || 'Receive your massage, spa, or skin treatment. After the session, leave a review to help others. Your feedback supports quality and trust.', bullets: [t?.howItWorks?.bookingStep5Item1 || 'Attend your appointment', t?.howItWorks?.bookingStep5Item2 || 'Leave a review after your session', t?.howItWorks?.bookingStep5Item3 || 'Re-book your favorite providers'], footer: t?.howItWorks?.bookingStep5Footer || 'Relax. You are in good hands.', icon: 'star' as const, imageDesc: 'Enjoy – session, review, re-book' },
    ];

    const profileChecklist = [
        { label: t?.howItWorks?.profileCheck1 || 'Verified badge', tip: t?.howItWorks?.profileCheck1Tip || 'Indicates reviewed credentials and compliance' },
        { label: t?.howItWorks?.profileCheck2 || 'Professional photo', tip: t?.howItWorks?.profileCheck2Tip || 'Shows the provider or venue' },
        { label: t?.howItWorks?.profileCheck3 || 'Clear bio & specialties', tip: t?.howItWorks?.profileCheck3Tip || 'Experience and what they offer' },
        { label: t?.howItWorks?.profileCheck4 || 'Services & pricing', tip: t?.howItWorks?.profileCheck4Tip || 'Transparent list of treatments and costs' },
        { label: t?.howItWorks?.profileCheck5 || 'Reviews & ratings', tip: t?.howItWorks?.profileCheck5Tip || 'Real feedback from past customers' },
        { label: t?.howItWorks?.profileCheck6 || 'Location or service area', tip: t?.howItWorks?.profileCheck6Tip || 'Where they operate—in-clinic, home, hotel' },
    ];

    const whyBookItems = [
        { title: t?.howItWorks?.whyBook1 || 'IndaStreet Verified badge', desc: t?.howItWorks?.whyBook1Desc || 'Providers can join IndaStreet; those we verify get a trust badge after we review their credentials. Look for the badge when booking.' },
        { title: t?.howItWorks?.whyBook2 || 'Transparent profiles', desc: t?.howItWorks?.whyBook2Desc || 'Full profile info: services, pricing, reviews. Know exactly who you are booking.' },
        { title: t?.howItWorks?.whyBook3 || 'Flexible booking', desc: t?.howItWorks?.whyBook3Desc || 'Book Now for immediate service or Schedule for later. You choose.' },
        { title: t?.howItWorks?.whyBook4 || 'Secure and clear payments', desc: t?.howItWorks?.whyBook4Desc || 'Payment terms shown upfront. Deposits protect scheduled bookings.' },
        { title: t?.howItWorks?.whyBook5 || 'Real reviews', desc: t?.howItWorks?.whyBook5Desc || 'Reviews from real bookings. Help others by leaving feedback after your session.' },
    ];

    const iconMap: Record<string, React.ReactNode> = {
        search: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
        user: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        calendar: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        check: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        star: <svg className="w-8 h-8 text-orange-500 shrink-0 hidden sm:block" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    };

    const iconMapPlaceholder: Record<string, React.ReactNode> = {
        search: <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
        user: <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
        calendar: <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        check: <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        star: <svg className="w-10 h-10 mx-auto text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>,
    };

    return (
        <div ref={sectionRef} className="space-y-12 relative">
            <div className="fixed left-0 right-0 top-16 z-[5] h-0.5 bg-gray-200/80 overflow-hidden">
                <motion.div className="h-full rounded-r-full origin-left" style={{ width: scrollBarWidth, background: 'linear-gradient(90deg, #f97316, #ea580c)' }} />
            </div>

            {/* Hero */}
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' }}>
                    {t?.howItWorks?.bookingProcessTitle || 'How to Book with IndaStreet'}
                </h2>
                <p className="text-xl text-gray-600 mb-2">
                    {t?.howItWorks?.bookingProcessSubtitle || 'Book Verified Therapists, Spas & Skin Clinics with Confidence'}
                </p>
                <p className="text-base text-gray-500 max-w-2xl mx-auto">
                    {t?.howItWorks?.bookingProcessTagline || 'Providers join IndaStreet and can apply for verification. Look for the IndaStreet Verified badge—it means we have reviewed them. Profiles show credentials, services, pricing, and real reviews.'}
                </p>
            </motion.div>

            {/* Image container 1 – Hero / discovery visual */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="relative rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/80 min-h-[220px] flex flex-col items-center justify-center p-8 text-center">
                    <span className="absolute top-4 left-4 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>1</span>
                    <svg className="w-14 h-14 text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <p className="text-base text-gray-600 font-medium">1. Hero / Discovery – search, browse, find providers</p>
                    <p className="text-xs text-gray-400 mt-1">[ Add image 1 – booking discovery, search UI ]</p>
                </div>
            </motion.div>

            {/* Assurance – Quality Providers */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-2">
                        <span aria-hidden>🛡</span>
                        {t?.howItWorks?.bookingAssuranceTitle || 'High-Quality Providers—Always'}
                    </h3>
                    <p className="text-gray-600 text-center max-w-2xl mx-auto mb-8">
                        {t?.howItWorks?.bookingAssuranceIntro || 'Anyone can create an account on IndaStreet. IndaStreet Verified is a badge we grant after reviewing credentials, business details, and professional standards. Look for the Verified badge when booking.'}
                    </p>
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            t?.howItWorks?.bookingAssurance1 ?? 'Verified credentials & business details',
                            t?.howItWorks?.bookingAssurance2 ?? 'Real reviews from real bookings',
                            t?.howItWorks?.bookingAssurance3 ?? 'Transparent profiles & pricing',
                            t?.howItWorks?.bookingAssurance4 ?? 'Clear booking & payment terms',
                            t?.howItWorks?.bookingAssurance5 ?? 'Support if something goes wrong',
                            t?.howItWorks?.bookingAssurance6 ?? 'Verified badge = IndaStreet has reviewed',
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 rounded-lg bg-orange-50/80 px-4 py-3">
                                <CheckIcon />
                                <span className="text-gray-700 text-sm font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* What to Look For in a Profile */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>📋</span>
                        {t?.howItWorks?.profileChecklistTitle || 'What to Look For in a Provider Profile'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t?.howItWorks?.profileChecklistIntro || 'Before you book, check these elements on the profile. The IndaStreet Verified badge means we have reviewed that provider. Complete profiles indicate serious professionals.'}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                        {profileChecklist.map((item, i) => (
                            <motion.div
                                key={i}
                                className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4"
                                initial={{ opacity: 0, x: -8 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={MOTION_VIEW}
                                transition={{ duration: 0.35, delay: i * 0.06 }}
                            >
                                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-sm font-bold">{i + 1}</span>
                                <div>
                                    <p className="font-semibold text-gray-900">{item.label}</p>
                                    <p className="text-sm text-gray-600 mt-0.5">{item.tip}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                    {/* Image container 2 – Profile example */}
                    <div className="mt-8 max-w-sm mx-auto">
                        <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[160px] flex flex-col items-center justify-center p-6 text-center">
                            <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>2</span>
                            <p className="text-sm text-gray-600 font-medium">2. Profile example – what to look for</p>
                            <p className="text-xs text-gray-400 mt-1">[ Add image 2 – sample verified profile ]</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            <div className="absolute left-6 md:left-8 top-[520px] w-1 h-[480px] hidden md:block rounded-full overflow-hidden bg-gray-200/60">
                <motion.div className="w-full rounded-full origin-top" style={{ height: progressHeight, background: stepIconGradient }} />
            </div>

            {/* Steps 1–5 with image containers 3–7 */}
            <div className="relative md:pl-4">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.num}
                        ref={step.ref}
                        className={`${glassCardClass} p-8 mb-8`}
                        initial={MOTION_FADE_UP.initial}
                        animate={step.inView ? MOTION_FADE_UP.animate : MOTION_FADE_UP.initial}
                        transition={{ ...MOTION_FADE_UP.transition, delay: index * 0.15 }}
                    >
                        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
                            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                                <div className="flex items-center gap-4 mb-4">
                                    <motion.div
                                        className="w-16 h-16 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-2xl"
                                        style={{ background: stepIconGradient, boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}
                                    >
                                        {step.num}
                                    </motion.div>
                                    {iconMap[step.icon]}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                                <p className="text-gray-600 mb-4 max-w-xl">{step.desc}</p>
                                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                                    {step.bullets.map((b, i) => (
                                        <li key={i} className="flex items-center justify-center md:justify-start gap-2">
                                            <CheckIcon />
                                            {b}
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-gray-700 font-medium text-sm">{step.footer}</p>
                            </div>
                            <div className="w-full md:w-[280px] shrink-0">
                                <div className="relative rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 min-h-[200px] flex flex-col items-center justify-center p-6 text-center">
                                    <span className="absolute top-3 left-3 w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>{step.num + 2}</span>
                                    <span className="text-gray-400 mb-2" aria-hidden>{iconMapPlaceholder[step.icon]}</span>
                                    <p className="text-sm text-gray-500 font-medium">{step.imageDesc}</p>
                                    <p className="text-xs text-gray-400 mt-1">[ Add image {step.num + 2} – design to suit ]</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                className="max-w-2xl mx-auto h-px"
                initial={{ opacity: 0, scaleX: 0.6 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{ background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.25), rgba(234,88,12,0.25), transparent)', transformOrigin: 'center' }}
            />

            {/* Why Book on IndaStreet – image container 8 */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="flex flex-col md:flex-row md:min-h-[320px]">
                    <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {t?.howItWorks?.whyBookTitle || 'Why Book on IndaStreet?'}
                        </h3>
                        <p className="text-gray-600 text-sm mb-6 max-w-xl">
                            {t?.howItWorks?.whyBookTagline || 'Look for IndaStreet Verified providers. Transparent profiles. Clear booking. You deserve quality wellness services.'}
                        </p>
                        <ul className="space-y-4">
                            {whyBookItems.map((item, i) => (
                                <motion.li
                                    key={i}
                                    className="flex gap-3 rounded-lg group"
                                    initial={{ opacity: 0, x: -8 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={MOTION_VIEW}
                                    transition={{ duration: 0.35, delay: i * 0.06 }}
                                >
                                    <span className="flex-shrink-0 mt-0.5 text-green-600"><CheckIcon /></span>
                                    <div>
                                        <span className="font-semibold text-gray-900 block">{item.title}</span>
                                        <span className="text-gray-600 text-sm leading-relaxed">{item.desc}</span>
                                    </div>
                                </motion.li>
                            ))}
                        </ul>
                    </div>
                    <div className="w-full md:w-[42%] min-h-[220px] md:min-h-[320px] shrink-0 flex items-center justify-center p-6">
                        <div className="relative rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/80 w-full min-h-[200px] flex flex-col items-center justify-center p-6 text-center">
                            <span className="absolute top-3 left-3 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>8</span>
                            <svg className="w-12 h-12 text-orange-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <p className="text-sm text-gray-600 font-medium">8. Why Book – benefits, trust, quality</p>
                            <p className="text-xs text-gray-400 mt-1">[ Add image 8 – design to suit ]</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Customer Reviews – from different countries */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        {t?.howItWorks?.bookingReviewsTitle || 'What Customers Say About IndaStreet'}
                    </h3>
                    <p className="text-gray-600 mb-8 max-w-2xl">
                        {t?.howItWorks?.bookingReviewsSubtitle || 'Travelers from around the world book IndaStreet to their hotel, villa, or home. Reliable massage and wellness services. Look for the Verified badge.'}
                    </p>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {BOOKING_PROCESS_REVIEWS.map((r, i) => (
                            <motion.div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={MOTION_VIEW}
                                transition={{ duration: 0.4, delay: i * 0.08 }}
                            >
                                <div className="flex items-start gap-4">
                                    <img
                                        src={r.avatar}
                                        alt={r.name}
                                        className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-orange-200"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-semibold text-gray-900">{r.name}</span>
                                            <span className="text-lg" aria-hidden>{r.flag}</span>
                                            <span className="text-xs text-gray-500">{r.country}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 leading-relaxed">{r.quote}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">
                        {t?.howItWorks?.bookingFaqTitle || 'Booking Process FAQ'}
                    </h3>
                    <div className="space-y-6">
                        {BOOKING_PROCESS_FAQ_ITEMS.map((item, i) => (
                            <motion.div
                                key={i}
                                className="border-b border-slate-200 pb-6 last:border-0 last:pb-0"
                                initial={{ opacity: 0, y: 8 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={MOTION_VIEW}
                                transition={{ duration: 0.35, delay: i * 0.05 }}
                            >
                                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/** Hotel Partners – How It Works for hotels partnering with IndaStreet Massage */
function HotelPartnersHowItWorks({ t, glassCardClass }: { t?: any; glassCardClass: string }) {
    return (
        <div className="space-y-12">
            {/* Hero */}
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' }}>
                    {t?.howItWorks?.hotelSectionTitle || 'Hotel Partners – IndaStreet Massage'}
                </h2>
                <p className="text-xl text-gray-600 mb-2">
                    {t?.howItWorks?.hotelSectionSubtitle || 'Verified, Professional Therapists. Hassle-Free Service. 24/7.'}
                </p>
                <p className="text-base text-gray-500 max-w-3xl mx-auto">
                    {t?.howItWorks?.hotelSectionTagline || 'Partner with IndaStreet to offer massage and skin care to your guests. Access IndaStreet Verified therapists who deliver hassle-free, professional service 24 hours a day, 7 days a week—enhancing your guests\' stay and your property\'s appeal.'}
                </p>
            </motion.div>

            {/* Why Hotels Partner – key benefits */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🏨</span>
                        {t?.howItWorks?.hotelWhyPartnerTitle || 'Why Hotels Partner with IndaStreet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t?.howItWorks?.hotelWhyPartnerIntro || 'Offer massage and skin care as a premium amenity. Attract more guests. Increase bookings. Add that extra star.'}
                    </p>
                    <ul className="space-y-3 text-gray-700">
                        {[
                            t?.howItWorks?.hotelWhyPartner1 ?? 'Advertise massage & skin care on Traveloka, Booking.com, and other booking platforms—attract guests seeking extra relaxation.',
                            t?.howItWorks?.hotelWhyPartner2 ?? 'Increase bookings by offering wellness services that set your property apart.',
                            t?.howItWorks?.hotelWhyPartner3 ?? 'Boost star ratings and guest satisfaction with premium in-room or in-spa services.',
                            t?.howItWorks?.hotelWhyPartner4 ?? 'IndaStreet Verified therapists with Safe Pass for hotel service—professional, vetted, and approved for access to secured properties.',
                            t?.howItWorks?.hotelWhyPartner5 ?? 'Hassle-free service 24/7. No staffing headaches. We connect you with qualified professionals when you need them.',
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <CheckIcon />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* Steps */}
            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { num: 1, title: t?.howItWorks?.hotelStep1Title || 'Register Your Property', desc: t?.howItWorks?.hotelStep1Desc || 'Create your hotel account with property details and compliance information' },
                    { num: 2, title: t?.howItWorks?.hotelStep2Title || 'Meet IndaStreet Standards', desc: t?.howItWorks?.hotelStep2Desc || 'Qualified hotels that meet our compliance standards receive free room display materials' },
                    { num: 3, title: t?.howItWorks?.hotelStep3Title || 'Access Verified Therapists', desc: t?.howItWorks?.hotelStep3Desc || 'Browse and book IndaStreet Verified therapists with Safe Pass for hotel service—professional, vetted for secured properties' },
                    { num: 4, title: t?.howItWorks?.hotelStep4Title || 'Delight Your Guests', desc: t?.howItWorks?.hotelStep4Desc || 'Guests enjoy hassle-free, professional wellness—24/7. Track bookings from your dashboard' },
                ].map((step, i) => (
                    <motion.div
                        key={step.num}
                        className="bg-white rounded-2xl p-6 shadow-lg text-center border border-slate-100"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={MOTION_VIEW}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-2xl" style={{ background: stepIconGradient, boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
                            {step.num}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Safe Pass for Hotel Service */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🛡</span>
                        {t?.howItWorks?.hotelSafePassTitle || 'Therapists with Safe Pass for Hotel Service'}
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-2xl">
                        {t?.howItWorks?.hotelSafePassIntro || 'The therapists listed for hotel service carry IndaStreet Safe Pass—a certification that confirms professional verification, identity approval, and platform compliance. Safe Pass enables therapists to access gated communities, high-end resorts, and secured hotel properties with confidence.'}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        {[
                            t?.howItWorks?.hotelSafePass1 ?? 'Professional verification confirmed',
                            t?.howItWorks?.hotelSafePass2 ?? 'Identity approval for property access',
                            t?.howItWorks?.hotelSafePass3 ?? 'Platform compliance standards met',
                            t?.howItWorks?.hotelSafePass4 ?? 'Increased acceptance at secured hotel properties',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <CheckIcon />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* Free Room Display Standards – image container */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🪧</span>
                        {t?.howItWorks?.hotelDisplayTitle || 'Free Room Display Standards'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl">
                        {t?.howItWorks?.hotelDisplayIntro || 'IndaStreet provides free room display standards for all qualified hotels that meet IndaStreet standards of compliance. Show your guests that professional massage and skin care are available—right in your property.'}
                    </p>
                    <div className="relative rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/80 min-h-[280px] flex flex-col items-center justify-center p-8 text-center">
                        <span className="absolute top-4 left-4 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>1</span>
                        <svg className="w-16 h-16 text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-base text-gray-600 font-medium">Hotel Room Display Stand</p>
                        <p className="text-xs text-gray-400 mt-1">[ Add image – IndaStreet room display stand for qualified hotels ]</p>
                    </div>
                </div>
            </motion.div>

            {/* Benefits grid */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div
                    className="rounded-2xl p-8 md:p-12 text-white relative bg-cover bg-center overflow-hidden"
                    style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20indastreets.png?updatedAt=1762092327438)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/95 to-orange-500/90" />
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-6">{t?.howItWorks?.hotelBenefitsTitle || 'Hotel Benefits'}</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: t?.howItWorks?.hotelBenefit1Title || 'IndaStreet Verified Therapists with Safe Pass', desc: t?.howItWorks?.hotelBenefit1Desc || 'Professional therapists with Safe Pass for hotel service—vetted for secured properties' },
                                { title: t?.howItWorks?.hotelBenefit2Title || '24/7 Hassle-Free Service', desc: t?.howItWorks?.hotelBenefit2Desc || 'Guests can book anytime. You deliver without staffing headaches' },
                                { title: t?.howItWorks?.hotelBenefit3Title || 'Advertise on Traveloka, Booking.com', desc: t?.howItWorks?.hotelBenefit3Desc || 'List massage & skin care as amenities to attract more guests' },
                                { title: t?.howItWorks?.hotelBenefit4Title || 'Increase Bookings & Star Ratings', desc: t?.howItWorks?.hotelBenefit4Desc || 'Wellness offerings set you apart and boost guest satisfaction' },
                                { title: t?.howItWorks?.hotelBenefit5Title || 'Free Room Display Standards', desc: t?.howItWorks?.hotelBenefit5Desc || 'Qualified hotels receive display materials at no cost' },
                                { title: t?.howItWorks?.hotelBenefit6Title || 'Dashboard & Management', desc: t?.howItWorks?.hotelBenefit6Desc || 'Track bookings, therapists, and services from one place' },
                            ].map((b, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <svg className="w-8 h-8 flex-shrink-0 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{b.title}</h4>
                                        <p className="text-orange-100 text-sm">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{t?.howItWorks?.hotelFaqTitle || 'Hotel Partners FAQ'}</h3>
                    <div className="space-y-6">
                        {HOTEL_FAQ_ITEMS.map((item, i) => (
                            <motion.div key={i} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={MOTION_VIEW} transition={{ duration: 0.35, delay: i * 0.05 }}>
                                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/** Villa Partners – How It Works for villa owners partnering with IndaStreet Massage */
function VillaPartnersHowItWorks({ t, glassCardClass }: { t?: any; glassCardClass: string }) {
    return (
        <div className="space-y-12">
            {/* Hero */}
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' }}>
                    {t?.howItWorks?.villaSectionTitle || 'Villa Partners – IndaStreet Massage'}
                </h2>
                <p className="text-xl text-gray-600 mb-2">
                    {t?.howItWorks?.villaSectionSubtitle || 'Verified, Professional Therapists. Hassle-Free Service. 24/7.'}
                </p>
                <p className="text-base text-gray-500 max-w-3xl mx-auto">
                    {t?.howItWorks?.villaSectionTagline || 'Partner with IndaStreet to offer massage and skin care to your villa guests. Access IndaStreet Verified therapists who deliver hassle-free, professional service 24 hours a day, 7 days a week—enhancing your guests\' stay and your property\'s appeal on Airbnb, Booking.com, and more.'}
                </p>
            </motion.div>

            {/* Why Villa Partners */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🏡</span>
                        {t?.howItWorks?.villaWhyPartnerTitle || 'Why Villa Owners Partner with IndaStreet'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t?.howItWorks?.villaWhyPartnerIntro || 'Offer massage and skin care as a premium villa amenity. Attract more guests. Increase bookings. Add that extra star.'}
                    </p>
                    <ul className="space-y-3 text-gray-700">
                        {[
                            t?.howItWorks?.villaWhyPartner1 ?? 'Advertise massage & skin care on Airbnb, Booking.com, and other platforms—attract guests seeking extra relaxation.',
                            t?.howItWorks?.villaWhyPartner2 ?? 'Increase bookings by offering wellness services that set your villa apart.',
                            t?.howItWorks?.villaWhyPartner3 ?? 'Boost ratings and guest satisfaction with premium in-villa services.',
                            t?.howItWorks?.villaWhyPartner4 ?? 'IndaStreet Verified therapists with Safe Pass for villa service—professional, vetted, and approved for access to secured properties.',
                            t?.howItWorks?.villaWhyPartner5 ?? 'Hassle-free service 24/7. No staffing headaches. We connect you with qualified professionals when you need them.',
                        ].map((item, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <CheckIcon />
                                <span>{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* Steps */}
            <div className="grid md:grid-cols-4 gap-6">
                {[
                    { num: 1, title: t?.howItWorks?.villaStep1Title || 'Register Your Villa', desc: t?.howItWorks?.villaStep1Desc || 'Create your villa account with property details and compliance information' },
                    { num: 2, title: t?.howItWorks?.villaStep2Title || 'Meet IndaStreet Standards', desc: t?.howItWorks?.villaStep2Desc || 'Qualified villas that meet our compliance standards receive free room display materials' },
                    { num: 3, title: t?.howItWorks?.villaStep3Title || 'Access Verified Therapists', desc: t?.howItWorks?.villaStep3Desc || 'Browse and book IndaStreet Verified therapists with Safe Pass for villa service—professional, vetted for secured properties' },
                    { num: 4, title: t?.howItWorks?.villaStep4Title || 'Delight Your Guests', desc: t?.howItWorks?.villaStep4Desc || 'Guests enjoy hassle-free, professional wellness—24/7. Track bookings from your dashboard' },
                ].map((step, i) => (
                    <motion.div
                        key={step.num}
                        className="bg-white rounded-2xl p-6 shadow-lg text-center border border-slate-100"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={MOTION_VIEW}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 mx-auto text-white font-bold text-2xl" style={{ background: stepIconGradient, boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
                            {step.num}
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2">{step.title}</h3>
                        <p className="text-sm text-gray-600">{step.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Safe Pass for Villa Service */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🛡</span>
                        {t?.howItWorks?.villaSafePassTitle || 'Therapists with Safe Pass for Villa Service'}
                    </h3>
                    <p className="text-gray-600 mb-4 max-w-2xl">
                        {t?.howItWorks?.villaSafePassIntro || 'The therapists listed for villa service carry IndaStreet Safe Pass—a certification that confirms professional verification, identity approval, and platform compliance. Safe Pass enables therapists to access gated communities, luxury villas, and private residences with confidence.'}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        {[
                            t?.howItWorks?.villaSafePass1 ?? 'Professional verification confirmed',
                            t?.howItWorks?.villaSafePass2 ?? 'Identity approval for property access',
                            t?.howItWorks?.villaSafePass3 ?? 'Platform compliance standards met',
                            t?.howItWorks?.villaSafePass4 ?? 'Increased acceptance at secured villa properties',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <CheckIcon />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* Free Room Display Standards – image container */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🪧</span>
                        {t?.howItWorks?.villaDisplayTitle || 'Free Room Display Standards'}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-2xl">
                        {t?.howItWorks?.villaDisplayIntro || 'IndaStreet provides free room display standards for all qualified villas that meet IndaStreet standards of compliance. Show your guests that professional massage and skin care are available—right at your villa.'}
                    </p>
                    <div className="relative rounded-xl border-2 border-dashed border-orange-200 bg-orange-50/80 min-h-[280px] flex flex-col items-center justify-center p-8 text-center">
                        <span className="absolute top-4 left-4 w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold shrink-0" aria-hidden>1</span>
                        <svg className="w-16 h-16 text-orange-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        <p className="text-base text-gray-600 font-medium">Villa Room Display Stand</p>
                        <p className="text-xs text-gray-400 mt-1">[ Add image – IndaStreet room display stand for qualified villas ]</p>
                    </div>
                </div>
            </motion.div>

            {/* Benefits grid */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div
                    className="rounded-2xl p-8 md:p-12 text-white relative bg-cover bg-center overflow-hidden"
                    style={{ backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20app%20indastreets.png?updatedAt=1762092327438)' }}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-600/95 to-orange-500/90" />
                    <div className="relative z-10">
                        <h3 className="text-3xl font-bold mb-6">{t?.howItWorks?.villaBenefitsTitle || 'Villa Benefits'}</h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            {[
                                { title: t?.howItWorks?.villaBenefit1Title || 'IndaStreet Verified Therapists with Safe Pass', desc: t?.howItWorks?.villaBenefit1Desc || 'Professional therapists with Safe Pass for villa service—vetted for secured properties' },
                                { title: t?.howItWorks?.villaBenefit2Title || '24/7 Hassle-Free Service', desc: t?.howItWorks?.villaBenefit2Desc || 'Guests can book anytime. You deliver without staffing headaches' },
                                { title: t?.howItWorks?.villaBenefit3Title || 'Advertise on Airbnb, Booking.com', desc: t?.howItWorks?.villaBenefit3Desc || 'List massage & skin care as amenities to attract more guests' },
                                { title: t?.howItWorks?.villaBenefit4Title || 'Increase Bookings & Star Ratings', desc: t?.howItWorks?.villaBenefit4Desc || 'Wellness offerings set you apart and boost guest satisfaction' },
                                { title: t?.howItWorks?.villaBenefit5Title || 'Free Room Display Standards', desc: t?.howItWorks?.villaBenefit5Desc || 'Qualified villas receive display materials at no cost' },
                                { title: t?.howItWorks?.villaBenefit6Title || 'Dashboard & Management', desc: t?.howItWorks?.villaBenefit6Desc || 'Track bookings, therapists, and services from one place' },
                            ].map((b, i) => (
                                <div key={i} className="flex items-start gap-4">
                                    <svg className="w-8 h-8 flex-shrink-0 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1">{b.title}</h4>
                                        <p className="text-orange-100 text-sm">{b.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{t?.howItWorks?.villaFaqTitle || 'Villa Partners FAQ'}</h3>
                    <div className="space-y-6">
                        {VILLA_FAQ_ITEMS.map((item, i) => (
                            <motion.div key={i} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={MOTION_VIEW} transition={{ duration: 0.35, delay: i * 0.05 }}>
                                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

/** Employers – How It Works for employers hiring massage & skin care service providers */
function EmployersHowItWorks({ t, glassCardClass }: { t?: any; glassCardClass: string }) {
    return (
        <div className="space-y-12">
            {/* Hero */}
            <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }}>
                <h2 className="text-4xl font-bold mb-4 bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)' }}>
                    {t?.howItWorks?.employerSectionTitle || 'How Employers Hire on IndaStreet'}
                </h2>
                <p className="text-xl text-gray-600 mb-2">
                    {t?.howItWorks?.employerSectionSubtitle || 'Qualified therapists offering massage & skin care—looking for employment'}
                </p>
                <p className="text-base text-gray-500 max-w-3xl mx-auto">
                    {t?.howItWorks?.employerSectionTagline || 'Employers can easily view job listing pages for qualified therapists who offer massage service, skin care service, and are looking for employment. Listed providers display full qualifications and are available for local inland work or internationally.'}
                </p>
            </motion.div>

            {/* View Job Listings – qualified providers */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🔍</span>
                        {t?.howItWorks?.employerViewListingsTitle || 'View Qualified Service Providers'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t?.howItWorks?.employerViewListingsIntro || 'Employers can easily browse job listing pages for qualified therapists offering massage service, skin care service, and looking for employment. Listed service providers display all details of qualifications and are available for local inland work or internationally.'}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        {[
                            t?.howItWorks?.employerViewListings1 ?? 'Massage service providers seeking employment',
                            t?.howItWorks?.employerViewListings2 ?? 'Skin care service providers seeking employment',
                            t?.howItWorks?.employerViewListings3 ?? 'Full qualification details displayed on profiles',
                            t?.howItWorks?.employerViewListings4 ?? 'Available for local inland or international work',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <CheckIcon />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* IndaStreet Support – confirmation & translation */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span aria-hidden>🤝</span>
                        {t?.howItWorks?.employerSupportTitle || 'IndaStreet Can Help'}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {t?.howItWorks?.employerSupportIntro || 'IndaStreet offers support to employers at selected fee rates:'}
                    </p>
                    <ul className="space-y-2 text-gray-700">
                        {[
                            t?.howItWorks?.employerSupport1 ?? 'Confirmation services at selected fee rate',
                            t?.howItWorks?.employerSupport2 ?? 'Translation service for international hiring',
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-2">
                                <CheckIcon />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>

            {/* Post Job Positions & Provider Requirements */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <span aria-hidden>📋</span>
                        {t?.howItWorks?.employerPostJobsTitle || 'Post Job Positions & Provider Requirements'}
                    </h3>
                    <p className="text-gray-600 mb-6">
                        {t?.howItWorks?.employerPostJobsIntro || 'Employers can post job positions for service providers to reply. All service providers must meet one of the following:'}
                    </p>
                    <div className="space-y-4">
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="font-semibold text-gray-900 mb-2">{t?.howItWorks?.employerProviderReq1Title || 'Option 1: Submit CV with history'}</p>
                            <p className="text-gray-600 text-sm">{t?.howItWorks?.employerProviderReq1Desc || 'Submit CV with past service history and recommendations.'}</p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
                            <p className="font-semibold text-gray-900 mb-2">{t?.howItWorks?.employerProviderReq2Title || 'Option 2: Active on IndaStreet Massage'}</p>
                            <p className="text-gray-600 text-sm">{t?.howItWorks?.employerProviderReq2Desc || 'Be active on IndaStreet Massage with positive reviews for a length of time.'}</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* 4-step flow cards */}
            <div className="grid md:grid-cols-2 gap-8">
                {[
                    { icon: '🔍', title: t?.howItWorks?.employerCard1Title || 'Browse Job Seekers', desc: t?.howItWorks?.employerCard1Desc || 'Search our marketplace for qualified massage and skin care professionals actively seeking employment. Filter by specialty, experience, and location.', items: [t?.howItWorks?.employerCard1Item1 || 'Filter by specialty, experience, location', t?.howItWorks?.employerCard1Item2 || 'View certifications and full qualifications', t?.howItWorks?.employerCard1Item3 || 'Local or international availability shown'] },
                    { icon: '🔓', title: t?.howItWorks?.employerCard2Title || 'Unlock Contact Details', desc: t?.howItWorks?.employerCard2Desc || 'Pay one-time fee to unlock full contact information including WhatsApp number and full name.', items: [t?.howItWorks?.employerCard2Item1 || 'Secure payment via bank transfer', t?.howItWorks?.employerCard2Item2 || 'Instant access after verification', t?.howItWorks?.employerCard2Item3 || 'Direct WhatsApp communication'] },
                    { icon: '📝', title: t?.howItWorks?.employerCard3Title || 'Post Job Positions', desc: t?.howItWorks?.employerCard3Desc || 'Employers can post job positions for service providers to reply. Service providers must submit CV with recommendations or have positive IndaStreet reviews.', items: [t?.howItWorks?.employerCard3Item1 || 'Post your job requirements', t?.howItWorks?.employerCard3Item2 || 'Providers apply with CV or IndaStreet history', t?.howItWorks?.employerCard3Item3 || 'Interview and hire directly'] },
                    { icon: '⭐', title: t?.howItWorks?.employerCard4Title || 'Interview & Leave Reviews', desc: t?.howItWorks?.employerCard4Desc || 'Contact therapists directly via WhatsApp. Conduct interviews, check references, and make your hiring decision. Leave honest reviews after hiring.', items: [t?.howItWorks?.employerCard4Item1 || 'Rate professionalism', t?.howItWorks?.employerCard4Item2 || 'Share your experience', t?.howItWorks?.employerCard4Item3 || 'Help build community trust'] },
                ].map((card, i) => (
                    <motion.div
                        key={i}
                        className="bg-white rounded-2xl p-8 shadow-lg border border-slate-100"
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={MOTION_VIEW}
                        transition={{ duration: 0.4, delay: i * 0.1 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-2xl" style={{ background: stepIconGradient, boxShadow: '0 4px 20px rgba(249,115,22,0.35)' }}>
                                {card.icon}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                        </div>
                        <p className="text-gray-600 mb-4">{card.desc}</p>
                        <ul className="space-y-2 text-gray-600">
                            {card.items.map((item: string, j: number) => (
                                <li key={j} className="flex items-start gap-2">
                                    <CheckIcon />
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                ))}
            </div>

            {/* Privacy Model */}
            <motion.div
                className={`${glassCardClass} overflow-hidden border-2 border-orange-200/60`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{t?.howItWorks?.employerPrivacyTitle || 'Why Our Privacy Model Works'}</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">🛡️ {t?.howItWorks?.employerPrivacyTherapist || 'For Therapists:'}</h4>
                            <p className="text-gray-600">
                                {t?.howItWorks?.employerPrivacyTherapistDesc || 'Protects them from spam, harassment, and unwanted contact. Only serious employers who pay can reach them.'}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-900 mb-2">✅ {t?.howItWorks?.employerPrivacyEmployer || 'For Employers:'}</h4>
                            <p className="text-gray-600">
                                {t?.howItWorks?.employerPrivacyEmployerDesc || 'Ensures access to serious job seekers. Small fee filters out time-wasters and ensures quality candidates.'}
                            </p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* FAQ */}
            <motion.div
                className={`${glassCardClass} overflow-hidden`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={MOTION_VIEW}
                transition={{ duration: 0.6, ease: 'easeOut' }}
            >
                <div className="p-6 md:p-10">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{t?.howItWorks?.employerFaqTitle || 'Employers FAQ'}</h3>
                    <div className="space-y-6">
                        {EMPLOYER_FAQ_ITEMS.map((item, i) => (
                            <motion.div key={i} className="border-b border-slate-200 pb-6 last:border-0 last:pb-0" initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={MOTION_VIEW} transition={{ duration: 0.35, delay: i * 0.05 }}>
                                <p className="font-semibold text-gray-900 mb-2">{item.q}</p>
                                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

type HowItWorksTab = 'massage-therapist' | 'massage-spa' | 'skin-clinic' | 'booking-process' | 'hotel-partners' | 'villa-partners' | 'employers';

const HOW_IT_WORKS_TABS: HowItWorksTab[] = ['massage-therapist', 'massage-spa', 'skin-clinic', 'booking-process', 'hotel-partners', 'villa-partners', 'employers'];

function getTabLabel(tab: HowItWorksTab, t: any): string {
    const labels: Record<HowItWorksTab, string> = {
        'massage-therapist': t?.howItWorks?.tabMassageTherapist || 'Massage Therapist',
        'massage-spa': t?.howItWorks?.tabMassageSpa || 'Massage Spa',
        'skin-clinic': t?.howItWorks?.tabSkinClinic || 'Skin Clinic',
        'booking-process': t?.howItWorks?.tabBookingProcess || 'Booking Process',
        'hotel-partners': t?.howItWorks?.tabHotelPartners || 'Hotel Partners',
        'villa-partners': t?.howItWorks?.tabVillaPartners || 'Villa Partners',
        'employers': t?.howItWorks?.tabEmployers || 'Employers',
    };
    return labels[tab];
}

function TopicIcon({ tab, className = 'w-5 h-5' }: { tab: HowItWorksTab; className?: string }) {
    const c = className;
    switch (tab) {
        case 'massage-therapist':
            return (
                <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            );
        case 'massage-spa':
            return (
                <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            );
        case 'skin-clinic':
            return (
                <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            );
        case 'booking-process':
            return (
                <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            );
        case 'hotel-partners':
            return (
                <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            );
        case 'villa-partners':
            return (
                <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            );
        case 'employers':
            return (
                <svg className={c} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            );
    }
}

interface TopicDropdownProps {
    activeTab: HowItWorksTab;
    setActiveTab: (tab: HowItWorksTab) => void;
    t?: any;
}

function TopicDropdown({ activeTab, setActiveTab, t }: TopicDropdownProps) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setOpen(false);
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    return (
        <div className="max-w-6xl mx-auto px-4 mt-8" ref={dropdownRef}>
            <div className="relative max-w-md mx-auto">
                <button
                    type="button"
                    onClick={() => setOpen((o) => !o)}
                    className="w-full flex items-center justify-between gap-3 py-4 px-5 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-xl shadow-orange-500/25 border border-orange-400/30 hover:from-orange-600 hover:to-orange-700 hover:shadow-orange-500/30 transition-all duration-200"
                >
                    <span className="flex items-center gap-3 truncate">
                        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                            <TopicIcon tab={activeTab} className="w-5 h-5 text-white" />
                        </span>
                        <span className="truncate">{getTabLabel(activeTab, t)}</span>
                    </span>
                    <motion.span
                        className="flex-shrink-0 text-white/90"
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </motion.span>
                </button>
                <motion.div
                    className="absolute top-full left-0 right-0 z-20 mt-2 py-2 rounded-2xl bg-white shadow-2xl border border-orange-200/60 overflow-hidden"
                    initial={false}
                    animate={{ opacity: open ? 1 : 0, visibility: open ? 'visible' : 'hidden' }}
                    transition={{ duration: 0.2 }}
                >
                    {open && (
                        <ul className="max-h-[min(70vh,320px)] overflow-y-auto py-1">
                            {HOW_IT_WORKS_TABS.map((tab) => (
                                <li key={tab}>
                                    <button
                                        type="button"
                                        onClick={() => { setActiveTab(tab); setOpen(false); }}
                                        className={`w-full text-left py-3 px-5 font-medium transition-colors flex items-center gap-4 min-h-[48px] ${
                                            activeTab === tab
                                                ? 'bg-orange-50 text-orange-700'
                                                : 'text-gray-700 hover:bg-orange-50/50'
                                        }`}
                                    >
                                        <span className="flex-shrink-0 w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center text-orange-600">
                                            <TopicIcon tab={tab} className="w-4 h-4" />
                                        </span>
                                        <span className={`flex-1 text-left ${activeTab === tab ? 'font-bold' : ''}`}>{getTabLabel(tab, t)}</span>
                                        {activeTab === tab && (
                                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center">
                                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </motion.div>
            </div>
        </div>
    );
}

interface HowItWorksPageProps {
    onNavigate?: (page: string) => void;
    onLanguageChange?: (lang: string) => void;
    t?: any;
    language?: 'en' | 'id';
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

const HowItWorksPage: React.FC<HowItWorksPageProps> = ({
    onNavigate,
    onLanguageChange,
    t,
    language = 'id',
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
    const [activeTab, setActiveTab] = useState<'massage-therapist' | 'massage-spa' | 'skin-clinic' | 'booking-process' | 'hotel-partners' | 'villa-partners' | 'employers'>('massage-therapist');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { country } = useCityContext();
    const heroSubtitle = t?.howItWorks?.heroSubtitle ?? `Your Complete Guide to ${country || 'Indonesia'}'s Leading Wellness Marketplace`;

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50  w-full max-w-full">
            {/* Universal Header - same as home page */}
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton={true}
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
                language={language}
            />

            {/* Hero Section - spacer for fixed header (header is out of flow) + gap between header and hero */}
            <div className="px-4 pt-[4.5rem] sm:pt-24 pb-0 mb-10">
                <div 
                    className="bg-gradient-to-r from-blue-600 to-blue-500 text-white pt-28 pb-12 relative w-full max-w-full overflow-hidden rounded-2xl hover:scale-100 transition-none"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/PLASTERING%205%20TROWEL%20HOLDERz.png?updatedAt=1769572707322)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: 'calc(100vh - 5rem)',
                    }}
                >
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10 flex flex-col justify-center min-h-[calc(100vh-5rem)] pt-16 pb-12">
                        <h1 className="text-5xl font-bold mb-6">{t?.howItWorks?.heroTitle || 'How IndaStreet Works'}</h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            {heroSubtitle}
                        </p>
                    </div>
                </div>
            </div>

            {/* Topic dropdown navigation */}
            <TopicDropdown
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                t={t}
            />

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Massage Therapist – For Massage Therapists – IndaStreet (5 steps + Why Join) */}
                {activeTab === 'massage-therapist' && (
                    <MassageTherapistHowItWorks
                        t={t}
                        language={language}
                        glassCardClass={glassCardClass}
                        stepIconGradient={stepIconGradient}
                    />
                )}

                {/* Massage Spa – same layout as Massage Therapist: steps, Why Join, FAQ */}
                {activeTab === 'massage-spa' && (
                    <MassageSpaHowItWorks
                        t={t}
                        glassCardClass={glassCardClass}
                        stepIconGradient={stepIconGradient}
                    />
                )}

                {/* Skin Clinic */}
                {activeTab === 'skin-clinic' && (
                    <SkinClinicHowItWorks
                        t={t}
                        glassCardClass={glassCardClass}
                        stepIconGradient={stepIconGradient}
                    />
                )}

                {/* Booking Process (Customer) – full guide with assurance, profile checklist, steps, FAQ */}
                {activeTab === 'booking-process' && (
                    <BookingProcessHowItWorks
                        t={t}
                        glassCardClass={glassCardClass}
                        stepIconGradient={stepIconGradient}
                    />
                )}

                {/* Hotel Partners */}
                {activeTab === 'hotel-partners' && (
                    <HotelPartnersHowItWorks t={t} glassCardClass={glassCardClass} />
                )}

                {/* Villa Partners */}
                {activeTab === 'villa-partners' && (
                    <VillaPartnersHowItWorks t={t} glassCardClass={glassCardClass} />
                )}

                {/* Employers */}
                {activeTab === 'employers' && (
                    <EmployersHowItWorks t={t} glassCardClass={glassCardClass} />
                )}

                {/* Common CTA — Massage Therapist: register CTA; other tabs: support CTA */}
                <div 
                    className="mt-16 text-center bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-12 text-white relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/bali%20massage%20indonisea.png?updatedAt=1761591108161)',
                    }}
                >
                    <div className="relative z-10">
                        {activeTab === 'massage-therapist' ? (
                            <>
                                <h2 className="text-3xl font-bold mb-4">{t?.howItWorks?.therapistCtaTitle || 'Ready to Get Started?'}</h2>
                                <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                                    {t?.howItWorks?.therapistCtaDesc || 'Register today and start organizing your bookings within hours.'}
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => onNavigate?.('createAccount')}
                                        className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-3 cursor-pointer"
                                    >
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        {t?.howItWorks?.therapistCtaButton || 'Register Today'}
                                    </button>
                                </div>
                            </>
                        ) : activeTab === 'skin-clinic' ? (
                            <>
                                <h2 className="text-3xl font-bold mb-4">{t?.howItWorks?.clinicCtaTitle || 'Create Your Skin Clinic Account'}</h2>
                                <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                                    {t?.howItWorks?.clinicCtaDesc || 'Register your clinic and reach safety-conscious clients. Select Skin Clinic when signing up.'}
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => onNavigate?.('role-selection')}
                                        className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-3 cursor-pointer"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                        </svg>
                                        {t?.howItWorks?.clinicCtaButton || 'Create Account'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 className="text-3xl font-bold mb-4">{t?.howItWorks?.needHelpTitle || 'Need Help?'}</h2>
                                <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                                    {t?.howItWorks?.needHelpDesc || 'Contact our support team for any questions'}
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center">
                                    <button
                                        type="button"
                                        onClick={() => onNavigate?.('contact')}
                                        className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-3 cursor-pointer"
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {t?.howItWorks?.contactUsButton || 'Contact Us'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer – essential links + social + brand */}
                <div className="mt-16 pt-10 border-t border-gray-200">
                    <FloatingPageFooter
                        currentLanguage={language as 'en' | 'id'}
                        onNavigate={onNavigate}
                    />
                </div>
            </div>
        </div>
    );
};

export default HowItWorksPage;

