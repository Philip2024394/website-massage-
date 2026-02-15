// Massage Therapist Standards – Verified Pro Badge (same header as home page)
import React, { useState } from 'react';
import { CheckCircle2, ShieldCheck } from 'lucide-react';
import { VERIFIED_BADGE_IMAGE_URL } from '../constants/appConstants';
import PageContainer from '../components/layout/PageContainer';
import UniversalHeader from '../components/shared/UniversalHeader';
import { AppDrawer } from '../components/AppDrawerClean';
import { React19SafeWrapper } from '../components/React19SafeWrapper';

interface VerifiedProBadgePageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
  onLanguageChange?: (lang: string) => void;
  language?: 'en' | 'id' | string;
  providerId?: number;
  providerType?: 'therapist' | 'place';
  providerName?: string;
  therapists?: any[];
  places?: any[];
}

const HERO_IMAGE = 'https://ik.imagekit.io/7grri5v7d/verfied%20massage%20spa%20indonisea.png';

const VERIFICATION_STANDARDS = [
  { title: 'Products & Materials', text: 'Use only certified oils, body scrubs, and creams approved for skin application. All products should meet established safety standards.' },
  { title: 'Hygiene Standards', text: 'Massage towels and bed linens are freshly laundered after every use, remaining free from stains and odors. Cleanliness is maintained at all times.' },
  { title: 'Facility Requirements', text: 'Toilet facilities meet European standard specifications. Clean sandals are provided to customers upon entry to the massage area.' },
  { title: 'Staff Qualifications', text: 'All therapists have a minimum of 1 year professional massage training. Those currently in training are clearly disclosed to customers in advance before booking.' },
  { title: 'Safety Protocols', text: 'Massage techniques are assessed for safety and suitability for each individual customer before commencing treatment. Medical conditions and contraindications are carefully considered.' },
  { title: 'Technique Standards', text: 'Only proven, standard hand massage techniques are used during sessions. Experimental or non-standard techniques are strictly prohibited unless the therapist holds full qualifications and certifications for specialized methods. Customer safety is prioritized at all times.' },
  { title: 'Customer Comfort', text: 'Complimentary refreshments (water, tea, or juice) are offered after each massage session.' },
  { title: 'Massage Attire', text: 'Fresh, clean massage clothing is provided daily after each customer use. All sizes are available to accommodate different body types.' },
  { title: 'Privacy Standards', text: 'Massage rooms remain private and available for only 1 customer during the massage process, or for couples when booked together. No unauthorized persons are permitted during sessions.' },
  { title: 'Professional Conduct', text: 'Staff maintain professional boundaries at all times. Any inappropriate behavior will result in immediate badge revocation.' },
  { title: 'Emergency Preparedness', text: 'A first aid kit is available on premises. Staff receive training in basic emergency response procedures.' },
  { title: 'Customer Consent', text: 'Written or verbal consent is obtained before starting any massage treatment. Customers have the right to stop treatment at any time.' },
  { title: 'Booking Transparency', text: 'Pricing, services, and any additional charges are clearly communicated before booking confirmation. No hidden fees are applied.' },
  { title: 'Personal Belongings Security', text: 'Customer personal belongings have secure placement during massage sessions, or are signed for in a responsibility log to ensure safety and accountability.' },
  { title: 'Language Availability', text: 'Languages listed on the profile are genuinely available. Therapists or staff who speak the listed languages are on-site and available when requested by customers.' },
  { title: 'Temperature & Ambiance Control', text: 'Massage rooms maintain comfortable temperature with air conditioning or heating. Proper ventilation and adjustable lighting create a relaxing atmosphere. Optional background music or soundscapes enhance the experience, with volume customized to customer preference.' },
  { title: 'Cancellation & Refund Policy', text: 'Clear, fair cancellation policies are displayed to customers. Reasonable cancellation timeframes and refund terms are transparently communicated before booking.' },
  { title: 'Photo Verification', text: 'Profile photos of facilities, treatment rooms, and amenities are authentic and current (not stock images). Photos accurately represent the actual service environment to build customer trust.' },
  { title: 'Age & Supervision Requirements', text: 'All massage therapists are over 18 years of age. Trainees under supervision work only alongside a fully qualified official therapist who remains present throughout the session. This ensures safety and professional standards at all times.' },
  { title: 'Appointment Reminders', text: 'Customers receive booking confirmations and reminders via WhatsApp or SMS at least 24 hours before their scheduled appointment to reduce no-shows and ensure punctuality.' },
  { title: 'Feedback & Quality Improvement', text: 'After each session, customers are encouraged to provide honest feedback through the app. This input helps maintain high quality standards and drives continuous improvement across the platform.' },
];

const VerifiedProBadgePage: React.FC<VerifiedProBadgePageProps> = ({
  onBack,
  onNavigate,
  onLanguageChange,
  language = 'en',
  therapists = [],
  places = [],
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-white">
      {/* Universal Header – same design and layout as home page */}
      <UniversalHeader
        language={language}
        onLanguageChange={onLanguageChange as (lang: string) => void}
        onMenuClick={() => setIsMenuOpen(true)}
        onHomeClick={() => (onNavigate ? onNavigate('home') : onBack?.())}
        showHomeButton={true}
      />

      <React19SafeWrapper condition={isMenuOpen}>
        <AppDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={onNavigate}
          onMassageJobsClick={onNavigate ? () => onNavigate('massage-jobs') : undefined}
          onVillaPortalClick={onNavigate ? () => onNavigate('villa-portal') : undefined}
          onTherapistPortalClick={onNavigate ? () => onNavigate('therapist-signup') : undefined}
          onMassagePlacePortalClick={onNavigate ? () => onNavigate('place-signup') : undefined}
          onAgentPortalClick={onNavigate ? () => onNavigate('auth') : undefined}
          onCustomerPortalClick={onNavigate ? () => onNavigate('auth') : undefined}
          onAdminPortalClick={onNavigate ? () => onNavigate('admin-login') : undefined}
          onTermsClick={onNavigate ? () => onNavigate('terms') : undefined}
          onPrivacyClick={onNavigate ? () => onNavigate('privacy') : undefined}
          therapists={therapists}
          places={places}
          language={language}
        />
      </React19SafeWrapper>

      {/* Spacer so content starts below fixed header (60px) */}
      <div className="pt-[60px]" aria-hidden />

      {/* Hero – keep main image, jobs-style accent */}
      <div className="relative border-b border-slate-200/80">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-orange-400/60 to-transparent z-10" aria-hidden />
        <div className="w-full aspect-[21/9] min-h-[220px] sm:min-h-[280px] overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Verified Massage Spa Indonesia"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-0 right-0 text-center px-4">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
              <span className="text-white">Inda</span>
              <span className="text-orange-300">street</span>
              <span className="text-white"> Verification Standards</span>
            </h2>
            <p className="text-white/90 text-sm sm:text-base mt-1 drop-shadow">Your safety, our priority</p>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8 pb-20 space-y-6">
        {/* Premium / peace of mind callout – verified sets the standard */}
        <div className="rounded-[20px] border border-slate-200/80 bg-slate-50/50 shadow-sm overflow-hidden">
          <div className="h-1 w-full bg-orange-500" aria-hidden />
          <div className="p-5 sm:p-6">
            <div className="flex items-start gap-4">
              <img src={VERIFIED_BADGE_IMAGE_URL} alt="Verified Badge" className="w-20 h-20 sm:w-24 sm:h-24 object-contain flex-shrink-0" />
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Verified therapists & places set the standard</h2>
                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  Our verified badge means <strong>premium service delivered professionally</strong>—so you get <strong>peace of mind</strong> that you're booking the <strong>highest quality therapist or place</strong>. Every verified provider has met our rigorous safety and quality standards.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Identity Verification & Safety Assurance */}
        <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-orange-500" />
            Identity verification & safety assurance
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed mb-4">
            When you see our verified badge on a provider's profile, you can book with complete confidence knowing they meet our rigorous safety and quality standards.
          </p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-slate-700 text-sm leading-relaxed">
              All verified partners have completed identity verification by submitting official government-issued identification, undergoing comprehensive background checks, and meeting our standard verification requirements. <strong>IndaStreet</strong> upholds safety and exceptional service as core industry standards. For your peace of mind, we recommend selecting verified service providers—ensuring you engage only with trusted professionals who have successfully completed our rigorous screening.
            </p>
          </div>
        </div>

        {/* Verification Standards intro */}
        <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">
            <span className="text-black">Inda</span>
            <span className="text-orange-500">Street</span>
            <span className="text-black"> verification standards</span>
          </h2>
          <p className="text-slate-700 text-sm leading-relaxed mb-3">
            At <strong>IndaStreet</strong>, your safety and wellbeing are our highest priorities. Every verified provider has been carefully evaluated to meet strict professional standards. Our verification process confirms that therapists are properly trained, facilities are clean and hygienic, and services are delivered with the utmost professionalism.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            <strong>Note:</strong> Some profiles may not yet display the verified badge due to pending inspection. We continuously review all providers to maintain the highest standards across our platform.
          </p>
        </div>

        {/* Standard compliance requirements – all standards in place */}
        <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
          <h3 className="font-semibold text-slate-900 mb-4">Verification badge standard compliance requirements</h3>
          <ul className="space-y-3">
            {VERIFICATION_STANDARDS.map((item, index) => (
              <li key={index} className="flex gap-3 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">{item.title}:</strong> {item.text}</span>
              </li>
            ))}
          </ul>
          <p className="text-slate-600 text-sm font-medium mt-6">— IndaStreet Team</p>
        </div>

        {/* Client Safety Tips */}
        <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6 border-l-4 border-l-orange-400">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Client safety tips</h2>
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Always book through the IndaStreet platform to ensure verified service providers.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> <strong>Use the in-app chat for all communications</strong>—IndaStreet keeps full chat records for your protection. WhatsApp communications are not accessible to IndaStreet for dispute resolution.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Verify provider credentials and certification upon request.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Communicate any concerns, allergies, or preferences before your session.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Report any unprofessional behavior immediately through our platform.</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" /> Leave honest feedback to help maintain community standards.</li>
          </ul>
        </div>

        {/* Report Non-Compliance */}
        <div className="rounded-[20px] border border-slate-200/80 bg-white shadow-sm p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-3">Report non-compliance</h2>
          <p className="text-slate-700 text-sm mb-4 leading-relaxed">
            If you experience any service that does not meet the standards above, we encourage you to file a dispute. Your feedback helps us keep <strong>IndaStreet</strong> the safest and most trusted choice for massage services in Indonesia.
          </p>
          <a
            href="https://wa.me/6281392000050?text=Hi%20Indastreet%2C%20I%20would%20like%20to%20report%20the%20following%20as%20I%20felt%20it%20did%20not%20comply%20with%20the%20standards%20of%20Indastreet%3A%20"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-sm hover:shadow-md"
          >
            Report via WhatsApp
          </a>
        </div>
      </main>
    </div>
  );
};

export default VerifiedProBadgePage;
