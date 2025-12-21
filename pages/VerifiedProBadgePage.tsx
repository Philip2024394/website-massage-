import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck, Info, Star, Award, Menu, Home } from 'lucide-react';
import { verificationService } from '../lib/appwriteService';
import PageContainer from '../components/layout/PageContainer';

interface VerifiedProBadgePageProps {
  onBack: () => void;
  providerId: number;
  providerType: 'therapist' | 'place';
  providerName?: string;
}

interface Eligibility {
  eligible?: boolean;
  reason?: string;
  accountAge?: number;
  completedBookings?: number;
  averageRating?: number;
  status?: string;
}

const VerifiedProBadgePage: React.FC<VerifiedProBadgePageProps> = ({ onBack, providerId, providerType, providerName }) => {
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const title = useMemo(() => (providerType === 'therapist' ? 'Therapist' : 'Massage Place'), [providerType]);
  const providerIdStr = String(providerId);

  const loadEligibility = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await verificationService.checkEligibility(providerIdStr, providerType);
      setEligibility(result);
    } catch (e: any) {
      setError(e?.message || 'Failed to check eligibility');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, providerType]);

  const applyForBadge = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await verificationService.applyForVerification(providerIdStr, providerType, { providerName });
      setSuccess('Verification badge applied successfully. Congratulations!');
      setEligibility({ eligible: res?.status === 'approved', status: res?.status || 'pending', reason: res?.reason });
    } catch (e: any) {
      setError(e?.message || 'Failed to apply for verification');
    } finally {
      setLoading(false);
    }
  };

  const revokeBadge = async () => {
    const reason = prompt('Enter reason to revoke verification (for record):', 'Requested by provider');
    if (reason === null) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await verificationService.revokeVerification(providerIdStr, reason || '');
      setSuccess('Verification badge revoked.');
      await loadEligibility();
    } catch (e: any) {
      setError(e?.message || 'Failed to revoke verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <PageContainer className="py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold"><span className="text-gray-900">Inda</span><span className="text-orange-500">Street</span></h1>
            <button onClick={onBack} className="p-2 rounded-lg transition-colors text-gray-700 hover:text-orange-500 hover:bg-orange-50 min-h-[44px] min-w-[44px] flex items-center justify-center">
              <Home className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </PageContainer>
      </header>

      {/* Hero Image Banner */}
      <div className="w-full h-64 sm:h-80 overflow-hidden relative">
        <img 
          src="https://ik.imagekit.io/7grri5v7d/verfied%20massage%20spa%20indonisea.png" 
          alt="Verified Massage Spa Indonesia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        <div className="absolute bottom-6 left-0 right-0 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            <span className="text-white">Inda</span><span className="text-orange-400">street</span><span className="text-white"> Verification Standards</span>
          </h2>
          <p className="text-white/90 text-sm sm:text-base mt-2 drop-shadow">Your Safety, Our Priority</p>
        </div>
      </div>

      <main className="space-y-6">
        <PageContainer className="pt-6 pb-20">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-2">
            <img 
              src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473" 
              alt="Verified Badge"
              className="w-32 h-32 object-contain"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Verification Standards</h1>
              <p className="text-sm text-gray-600">You're In The Best Possible Hands</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">When you see our verified badge on a provider's profile, you can book with complete confidence knowing they meet our rigorous safety and quality standards.</p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-gray-700 font-semibold mb-2">🛡️ Identity Verification & Safety Assurance</p>
            <p className="text-sm text-gray-700">
              All verified badge partners have completed identity verification by submitting official government-issued identification, undergoing comprehensive background checks, and meeting our standard verification requirements. <strong>Indastreet</strong> upholds safety and exceptional service as core industry standards. For your peace of mind, we recommend selecting verified service providers, ensuring you engage only with trusted professionals who have successfully completed our rigorous screening protocols.
            </p>
          </div>
        </div>

        {/* Verification Standards & Safety Requirements */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            <span className="text-black">Inda</span><span className="text-orange-500">street</span><span className="text-black"> Verification Standards</span>
          </h2>
          
          <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-3">
              At <strong>Indastreet</strong>, your safety and wellbeing are our highest priorities. We understand that choosing a massage therapist or spa is a personal decision that requires trust. That's why every verified provider on our platform has been carefully evaluated to ensure they meet strict professional standards.
            </p>
            <p className="text-sm text-gray-700 mb-3">
              Our verification process protects you by confirming that massage therapists are properly trained, facilities are clean and hygienic, and services are delivered with the utmost professionalism. This commitment to quality means you can relax knowing you're in safe, capable hands.
            </p>
            <p className="text-sm text-gray-700">
              <strong>Please note:</strong> Some profiles may not yet display the verified badge due to pending inspection or awaiting final confirmation. We continuously review all providers to maintain the highest standards across our platform.
            </p>
          </div>

          <h3 className="font-semibold text-gray-900 mb-2">Verification Badge Standard Compliance Requirements:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
            <li><strong>Products & Materials:</strong> Use only certified oils, body scrubs, and creams approved for skin application. All products should meet established safety standards.</li>
            
            <li><strong>Hygiene Standards:</strong> Massage towels and bed linens are freshly laundered after every use, remaining free from stains and odors. Cleanliness is maintained at all times.</li>
            
            <li><strong>Facility Requirements:</strong> Toilet facilities meet European standard specifications. Clean sandals are provided to customers upon entry to the massage area.</li>
            
            <li><strong>Staff Qualifications:</strong> All therapists have a minimum of 1 year professional massage training. Those currently in training are clearly disclosed to customers in advance before booking.</li>
            
            <li><strong>Safety Protocols:</strong> Massage techniques are assessed for safety and suitability for each individual customer before commencing treatment. Medical conditions and contraindications are carefully considered.</li>
            
            <li><strong>Technique Standards:</strong> Only proven, standard hand massage techniques are used during sessions. Experimental or non-standard techniques are strictly prohibited unless the therapist holds full qualifications and certifications for specialized methods. Customer safety is prioritized at all times.</li>
            
            <li><strong>Customer Comfort:</strong> Complimentary refreshments (water, tea, or juice) are offered after each massage session.</li>
            
            <li><strong>Massage Attire:</strong> Fresh, clean massage clothing is provided daily after each customer use. All sizes are available to accommodate different body types.</li>
            
            <li><strong>Privacy Standards:</strong> Massage rooms remain private and available for only 1 customer during the massage process, or for couples when booked together. No unauthorized persons are permitted during sessions.</li>
            
            <li><strong>Professional Conduct:</strong> Staff maintain professional boundaries at all times. Any inappropriate behavior will result in immediate badge revocation.</li>
            
            <li><strong>Emergency Preparedness:</strong> A first aid kit is available on premises. Staff receive training in basic emergency response procedures.</li>
            
            <li><strong>Customer Consent:</strong> Written or verbal consent is obtained before starting any massage treatment. Customers have the right to stop treatment at any time.</li>
            
            <li><strong>Booking Transparency:</strong> Pricing, services, and any additional charges are clearly communicated before booking confirmation. No hidden fees are applied.</li>
            
            <li><strong>Personal Belongings Security:</strong> Customer personal belongings have secure placement during massage sessions, or are signed for in a responsibility log to ensure safety and accountability.</li>
            
            <li><strong>Language Availability:</strong> Languages listed on the profile are genuinely available. Therapists or staff who speak the listed languages are on-site and available when requested by customers.</li>
            
            <li><strong>Temperature & Ambiance Control:</strong> Massage rooms maintain comfortable temperature with air conditioning or heating. Proper ventilation and adjustable lighting create a relaxing atmosphere. Optional background music or soundscapes enhance the experience, with volume customized to customer preference.</li>
            
            <li><strong>Cancellation & Refund Policy:</strong> Clear, fair cancellation policies are displayed to customers. Reasonable cancellation timeframes and refund terms are transparently communicated before booking.</li>
            
            <li><strong>Photo Verification:</strong> Profile photos of facilities, treatment rooms, and amenities are authentic and current (not stock images). Photos accurately represent the actual service environment to build customer trust.</li>
            
            <li><strong>Age & Supervision Requirements:</strong> All massage therapists are over 18 years of age. Trainees under supervision work only alongside a fully qualified official therapist who remains present throughout the session. This ensures safety and professional standards at all times.</li>
            
            <li><strong>Appointment Reminders:</strong> Customers receive booking confirmations and reminders via WhatsApp or SMS at least 24 hours before their scheduled appointment to reduce no-shows and ensure punctuality.</li>
            
            <li><strong>Feedback & Quality Improvement:</strong> After each session, customers are encouraged to provide honest feedback through the app. This input helps maintain high quality standards and drives continuous improvement across the platform.</li>
          </ul>

          <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-sm text-gray-700 font-semibold">Indastreet Team</p>
          </div>
        </div>

        {/* Client Safety Tips */}
        <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Client Safety Tips</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <p>✓ Always book through the Indastreet platform to ensure verified service providers</p>
            <p>✓ <strong>Use the in-app chat system for all communications</strong> - Indastreet maintains complete chat records for your protection. In the event of any dispute or concern, we have full documentation on file to assist you. Please note that WhatsApp communications are not accessible to Indastreet and cannot be used for dispute resolution.</p>
            <p>✓ Verify provider credentials and certification upon request</p>
            <p>✓ Communicate any concerns, allergies, or preferences before your session</p>
            <p>✓ Report any unprofessional behavior immediately through our platform</p>
            <p>✓ Leave honest feedback to help maintain community standards</p>
          </div>
        </div>

        {/* Dispute Reporting Section */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Report Non-Compliance</h2>
          <p className="text-sm text-gray-700 mb-4">
            If you experience any service that does not meet the standards listed above, we encourage you to file a dispute. Your rights are protected, and your feedback helps us maintain <strong>Indastreet</strong> as the safest and most trusted choice for massage services in Indonesia.
          </p>
          <a
            href="https://wa.me/6281392000050?text=Hi%20Indastreet%2C%20I%20would%20like%20to%20report%20the%20following%20as%20I%20felt%20it%20did%20not%20comply%20with%20the%20standards%20of%20Indastreet%3A%20"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Report via WhatsApp
          </a>
        </div>

        </PageContainer>
      </main>
    </div>
  );
};

export default VerifiedProBadgePage;
