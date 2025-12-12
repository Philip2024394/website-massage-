import React, { useState } from 'react';
import { Home, ShieldCheck, CheckCircle2, Sparkles, User, Droplet, Shirt, Package, ThumbsUp, Star } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import { useLanguageContext } from '../context/LanguageContext';
import { chatTranslationService } from '../services/chatTranslationService';

interface MobileTherapistStandardsPageProps {
  onBack: () => void;
}

const MobileTherapistStandardsPage: React.FC<MobileTherapistStandardsPageProps> = ({ onBack }) => {
  // Language context and translation
  const { language } = useLanguageContext();
  const chatLang = language === 'gb' ? 'en' : language;
  
  const t = {
    mobileTherapistStandards: chatTranslationService.getTranslation('mobile_therapist_standards', chatLang),
    professionalInHomeHotel: chatTranslationService.getTranslation('professional_in_home_hotel', chatLang),
    therapistStandards: chatTranslationService.getTranslation('therapist_standards', chatLang),
    professionalServiceLocation: chatTranslationService.getTranslation('professional_service_location', chatLang),
    verifiedBadgeConfidence: chatTranslationService.getTranslation('verified_badge_confidence', chatLang),
    identityVerificationSafety: chatTranslationService.getTranslation('identity_verification_safety', chatLang),
    identityVerificationDescription: chatTranslationService.getTranslation('identity_verification_description', chatLang),
    whyMobileStandardsMatter: chatTranslationService.getTranslation('why_mobile_standards_matter', chatLang),
    mobileStandardsIntro: chatTranslationService.getTranslation('mobile_standards_intro', chatLang),
    // Verification standards
    professionalCertification: chatTranslationService.getTranslation('professional_certification', chatLang),
    professionalCertificationDesc: chatTranslationService.getTranslation('professional_certification_desc', chatLang),
    equipmentHygiene: chatTranslationService.getTranslation('equipment_hygiene', chatLang),
    equipmentHygieneDesc: chatTranslationService.getTranslation('equipment_hygiene_desc', chatLang),
    communicationProfessionalism: chatTranslationService.getTranslation('communication_professionalism', chatLang),
    communicationProfessionalismDesc: chatTranslationService.getTranslation('communication_professionalism_desc', chatLang),
    boundaryRespect: chatTranslationService.getTranslation('boundary_respect', chatLang),
    boundaryRespectDesc: chatTranslationService.getTranslation('boundary_respect_desc', chatLang),
    flexibleScheduling: chatTranslationService.getTranslation('flexible_scheduling', chatLang),
    flexibleSchedulingDesc: chatTranslationService.getTranslation('flexible_scheduling_desc', chatLang),
    customTreatmentPlans: chatTranslationService.getTranslation('custom_treatment_plans', chatLang),
    customTreatmentPlansDesc: chatTranslationService.getTranslation('custom_treatment_plans_desc', chatLang),
    insuranceCoverage: chatTranslationService.getTranslation('insurance_coverage', chatLang),
    insuranceCoverageDesc: chatTranslationService.getTranslation('insurance_coverage_desc', chatLang),
    continuousTraining: chatTranslationService.getTranslation('continuous_training', chatLang),
    continuousTrainingDesc: chatTranslationService.getTranslation('continuous_training_desc', chatLang),
    // Additional sections
    verificationProcessNote: chatTranslationService.getTranslation('verification_process_note', chatLang),
    pendingVerificationNote: chatTranslationService.getTranslation('pending_verification_note', chatLang),
    therapistVerificationStandards: chatTranslationService.getTranslation('therapist_verification_standards', chatLang),
    professionalAppearanceHygiene: chatTranslationService.getTranslation('professional_appearance_hygiene', chatLang),
    freshLinensTowels: chatTranslationService.getTranslation('fresh_linens_towels', chatLang),
    regulatedOilsProducts: chatTranslationService.getTranslation('regulated_oils_products', chatLang),
    professionalismConduct: chatTranslationService.getTranslation('professionalism_conduct', chatLang),
    trainingCertification: chatTranslationService.getTranslation('training_certification', chatLang),
    healthSafetyProtocols: chatTranslationService.getTranslation('health_safety_protocols', chatLang),
    additionalRequirements: chatTranslationService.getTranslation('additional_requirements', chatLang),
    whyChooseVerified: chatTranslationService.getTranslation('why_choose_verified', chatLang),
    clientSafetyTips: chatTranslationService.getTranslation('client_safety_tips', chatLang),
    questionsAboutStandards: chatTranslationService.getTranslation('questions_about_standards', chatLang),
    transparencyCommitment: chatTranslationService.getTranslation('transparency_commitment', chatLang),
    contactSupport: chatTranslationService.getTranslation('contact_support', chatLang),
    switchToEnglish: language === 'id' ? 'Switch to English' : 'Switch to English',
    switchToIndonesian: language === 'id' ? 'Ganti ke Bahasa Indonesia' : 'Ganti ke Bahasa Indonesia'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <PageContainer className="py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">
              <span className="text-gray-900">Inda</span>
              <span className="text-orange-500">Street</span>
            </h1>
            <div className="flex items-center gap-2">
              <button 
                onClick={onBack} 
                className="p-2 rounded-lg transition-colors text-gray-700 hover:text-orange-500 hover:bg-orange-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Home className="w-5 h-5 text-orange-600" />
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Hero Image Banner */}
      <div className="w-full h-64 sm:h-80 overflow-hidden relative">
        <img 
          src="https://ik.imagekit.io/7grri5v7d/indonisea%20spa.png" 
          alt="Indonesian Spa - Mobile Massage Therapist Standards"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://ik.imagekit.io/7grri5v7d/verfied%20massage%20spa%20indonisea.png";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-6 left-0 right-0 text-center px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white drop-shadow-lg">
            <span className="text-white">Inda</span>
            <span className="text-orange-400">street</span>
            <span className="text-white"> {t.mobileTherapistStandards}</span>
          </h2>
          <p className="text-white/90 text-sm sm:text-base mt-2 drop-shadow">
            {t.professionalInHomeHotel}
          </p>
        </div>
      </div>

      <main className="space-y-8">
        <PageContainer className="pt-6 pb-20 space-y-8">
          {/* Introduction Section */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <img 
                src="https://ik.imagekit.io/7grri5v7d/indastreet_verfied-removebg-preview.png?updatedAt=1764750953473" 
                alt="Verified Badge"
                className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-800"><span className="text-black">Inda</span><span className="text-orange-500">street</span> {t.therapistStandards}</h1>
                <p className="text-sm text-gray-600">{t.professionalServiceLocation}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {t.verifiedBadgeConfidence}
            </p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700 font-semibold mb-2">{t.identityVerificationSafety}</p>
                <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: t.identityVerificationDescription.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
                </p>
            </div>
          </div>

          {/* Why Mobile Therapy Matters */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm p-6 border border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="w-6 h-6 text-orange-600" />
              <h2 className="text-lg font-bold text-gray-900" dangerouslySetInnerHTML={{ __html: t.whyMobileStandardsMatter.replace(/\*\*(.*?)\*\*/g, '<span class="text-orange-600">$1</span>') }}>
              </h2>
            </div>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.mobileStandardsIntro.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
            </p>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {t.verificationProcessNote}
            </p>
            <p className="text-sm text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: t.pendingVerificationNote.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}>
            </p>
          </div>

          {/* Mobile Therapist Verification Standards */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <span dangerouslySetInnerHTML={{ __html: t.therapistVerificationStandards.replace(/\*\*(.*?)\*\*/g, '<span class="text-black">Inda</span><span class="text-orange-500">street</span>') }}></span>
            </h2>

            <div className="space-y-6">
              {/* Professional Appearance & Hygiene */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Shirt className="w-5 h-5 text-orange-600" />
                  <h3 className="font-semibold text-gray-900">{t.professionalAppearanceHygiene}</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Clean & Professional Dress Code:</strong> Therapists must wear clean, neat, and professional attire at all times. Uniforms or massage therapy appropriate clothing is required.</li>
                  <li><strong>Personal Hygiene:</strong> Therapists maintain excellent personal hygiene including clean hands, trimmed nails, fresh appearance, and no strong perfumes or colognes that may affect sensitive clients.</li>
                  <li><strong>Identification:</strong> Therapists carry valid ID and certification documents that can be presented upon request for client verification and safety.</li>
                </ul>
              </div>

              {/* Clean Linens & Towels */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-900">{t.freshLinensTowels}</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Freshly Laundered Linens:</strong> All towels, bed sheets, and face cradle covers must be freshly laundered, pressed, and completely clean for each session.</li>
                  <li><strong>Stain-Free & Odor-Free:</strong> Linens are free from stains, discoloration, and unpleasant odors. Only fresh, spa-quality linens are used.</li>
                  <li><strong>Individual Use:</strong> Each client receives brand new or freshly cleaned linens. No reuse between clients under any circumstances.</li>
                  <li><strong>Protective Covering:</strong> Portable massage tables are covered with clean protective layers to maintain hygiene on client furniture and surfaces.</li>
                  <li><strong>Extra Sets Available:</strong> Therapists carry backup sets of clean linens in case additional coverage or replacement is needed during the session.</li>
                </ul>
              </div>

              {/* Certified Oils & Products */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">{t.regulatedOilsProducts}</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Certified Massage Oils:</strong> Only use massage oils, lotions, and creams that are certified safe for human skin and approved by relevant health authorities.</li>
                  <li><strong>Hypoallergenic Options:</strong> Therapists provide hypoallergenic and fragrance-free options for clients with sensitive skin or allergies.</li>
                  <li><strong>Proper Storage:</strong> All oils and products are stored in clean, sealed containers and replaced before expiration dates.</li>
                  <li><strong>Quality Brands:</strong> Use of reputable, professional-grade massage products that meet industry safety standards.</li>
                  <li><strong>Client Consent:</strong> Therapists always ask about skin sensitivities, allergies, or product preferences before application.</li>
                </ul>
              </div>

              {/* Equipment & Setup */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Package className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900">4. Professional Equipment & Setup</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Essential Equipment:</strong> Therapists bring clean bed blankets, fresh hand towels, massage oils, and creams to provide professional in-home massage services.</li>
                  <li><strong>Sanitized Equipment:</strong> All equipment and materials are sanitized and freshly prepared before each use to ensure client safety and hygiene.</li>
                  <li><strong>Proper Setup Time:</strong> Therapists arrive 10-15 minutes early to set up the massage area professionally without rushing.</li>
                  <li><strong>Respectful Setup:</strong> The massage area is set up carefully to avoid damaging client's property, floors, or furniture. Protective covers are used when necessary.</li>
                  <li><strong>Complete Cleanup:</strong> After the session, therapists thoroughly clean up, remove all equipment, and leave the space exactly as they found it.</li>
                </ul>
              </div>

              {/* Professionalism & Conduct */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <ThumbsUp className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-gray-900">{t.professionalismConduct}</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Punctuality:</strong> Therapists arrive on time and notify clients immediately if delays occur.</li>
                  <li><strong>Professional Communication:</strong> Clear, respectful, and professional communication before, during, and after the service.</li>
                  <li><strong>Client Privacy:</strong> Strict respect for client privacy, personal space, and boundaries at all times.</li>
                  <li><strong>No Inappropriate Behavior:</strong> Zero tolerance policy for any inappropriate behavior, comments, or conduct.</li>
                  <li><strong>Professional Boundaries:</strong> Therapists maintain appropriate professional boundaries and focus solely on therapeutic massage services.</li>
                  <li><strong>Respectful Environment:</strong> Therapists are respectful of the client's home or hotel environment, keeping noise levels appropriate and respecting household rules.</li>
                </ul>
              </div>

              {/* Training & Certification */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  <h3 className="font-semibold text-gray-900">{t.trainingCertification}</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Certified Training:</strong> Therapists must have completed recognized massage therapy training from accredited institutions.</li>
                  <li><strong>Valid Certification:</strong> Hold current, valid massage therapy certifications or licenses as required by local regulations.</li>
                  <li><strong>Continuing Education:</strong> Commitment to ongoing professional development and skill enhancement.</li>
                  <li><strong>Technique Proficiency:</strong> Demonstrated proficiency in various massage techniques appropriate for mobile services.</li>
                  <li><strong>Safety Training:</strong> Knowledge of proper body mechanics, client positioning, and safety protocols for in-home services.</li>
                </ul>
              </div>

              {/* Health & Safety */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">{t.healthSafetyProtocols}</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Health Screening:</strong> Therapists conduct brief health screenings before sessions to identify contraindications.</li>
                  <li><strong>Hand Sanitization:</strong> Hands are thoroughly washed and sanitized before and after each session.</li>
                  <li><strong>Illness Policy:</strong> Therapists do not provide services when ill to protect client health and safety.</li>
                  <li><strong>Emergency Preparedness:</strong> Basic first aid knowledge and appropriate response to client discomfort or emergencies.</li>
                  <li><strong>COVID-19 Protocols:</strong> Adherence to current health guidelines including mask-wearing if required, temperature checks, and proper hygiene practices.</li>
                </ul>
              </div>

              {/* Additional Requirements */}
              <div className="pl-4 py-2">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-5 h-5 text-pink-600" />
                  <h3 className="font-semibold text-gray-900">{t.additionalRequirements}</h3>
                </div>
                <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                  <li><strong>Background Verification:</strong> All mobile therapists undergo thorough background checks for client safety and peace of mind.</li>
                  <li><strong>Client Records:</strong> Maintain professional client records including health history forms and session notes (kept confidential).</li>
                  <li><strong>Proper Invoicing:</strong> Provide clear, detailed invoices and receipts for all services rendered.</li>
                  <li><strong>Cancellation Policy:</strong> Clear communication of cancellation policies and professional handling of schedule changes.</li>
                  <li><strong>Equipment Transport:</strong> Clean, organized transport system for equipment ensuring everything arrives in pristine condition.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Why Choose Verified Mobile Therapists */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6" />
              {t.whyChooseVerified}
            </h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span><strong>Complete Peace of Mind:</strong> Every verified therapist has passed our rigorous screening process including background checks and certification verification.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span><strong>Spa-Quality at Home:</strong> Enjoy professional massage services in the comfort of your own space without compromising on quality or hygiene.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span><strong>Safety First:</strong> All equipment, products, and linens meet strict hygiene standards, freshly prepared for each client.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span><strong>Professional Service:</strong> Verified therapists maintain the highest standards of professionalism, punctuality, and client care.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span><strong>Continuous Monitoring:</strong> We regularly review performance and client feedback to ensure standards remain consistently high.</span>
              </li>
            </ul>
          </div>

          {/* Client Safety Tips */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-orange-200">
            <h2 className="text-lg font-bold text-gray-900 mb-3">{t.clientSafetyTips}</h2>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✓ Always book through the Indastreet platform to ensure verified therapists</p>
              <p>✓ <strong>Use the in-app chat system for all communications</strong> - Indastreet maintains complete chat records for your protection. In the event of any dispute or concern, we have full documentation on file to assist you. Please note that WhatsApp communications are not accessible to Indastreet and cannot be used for dispute resolution.</p>
              <p>✓ Confirm therapist ID and certification documents upon arrival if desired</p>
              <p>✓ Ensure someone else is home or nearby for added security (especially first-time bookings)</p>
              <p>✓ Communicate any concerns, allergies, or preferences before the session begins</p>
              <p>✓ Report any unprofessional behavior immediately through our platform</p>
              <p>✓ Leave honest feedback to help maintain community standards</p>
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-gray-50 rounded-xl shadow-sm p-6 border border-gray-200 text-center">
            <h3 className="font-bold text-gray-900 mb-2">{t.questionsAboutStandards}</h3>
            <p className="text-sm text-gray-600 mb-4">
              {t.transparencyCommitment}
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              {t.contactSupport}
            </button>
          </div>
        </PageContainer>
      </main>
    </div>
  );
};

export default MobileTherapistStandardsPage;
