import React from 'react';
import { Home, ShieldCheck, CheckCircle2, Sparkles, Droplet, Clock, Shield, Star } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

interface MobileTherapistStandardsPageProps {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
}

const standards = [
  {
    title: 'Hygiene & linens',
    icon: Sparkles,
    points: [
      'Fresh, clean towels and linens for every client (no reuse).',
      'Sanitized hands and equipment before each session.',
      'No strong perfumes; neutral, clean presentation.'
    ]
  },
  {
    title: 'Professional oils',
    icon: Droplet,
    points: [
      'Spa-grade massage oils/creams; hypoallergenic options on request.',
      'Properly sealed, stored, and replaced before expiry.',
      'Client allergies/preferences checked before application.'
    ]
  },
  {
    title: 'On-time, prepared arrival',
    icon: Clock,
    points: [
      'Arrive on time with enough setup and cleanup buffer.',
      'Bring required kit: clean linens, oils, wipes, and protection for surfaces.',
      'Quiet, respectful setup that protects client furniture and floors.'
    ]
  },
  {
    title: 'Professional conduct',
    icon: ShieldCheck,
    points: [
      'Verified identity available on request; courteous communication.',
      'Respect client privacy, boundaries, and home/hotel rules.',
      'Zero tolerance for inappropriate behavior; professional focus only.'
    ]
  },
  {
    title: 'Safety & comfort',
    icon: Shield,
    points: [
      'Pre-session check for injuries/allergies; adjust pressure accordingly.',
      'Stop or adjust immediately if the client feels discomfort.',
      'Masks or gloves upon request; follow current health guidelines.'
    ]
  },
  {
    title: 'Aftercare & cleanup',
    icon: CheckCircle2,
    points: [
      'Provide simple aftercare tips (hydration, stretches, rest).',
      'Full cleanup after the session; leave the space as found.',
      'Offer a quick recap of services delivered if the client wants it.'
    ]
  }
];

const MobileTherapistStandardsPage: React.FC<MobileTherapistStandardsPageProps> = ({ onBack, onNavigate }) => {

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
                onClick={() => onNavigate ? onNavigate('home') : onBack?.()} 
                className="p-2 rounded-lg transition-colors text-gray-700 hover:text-orange-500 hover:bg-orange-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Home className="w-5 h-5 text-orange-600" />
              </button>
            </div>
          </div>
        </PageContainer>
      </header>

      {/* Hero placeholder (replace with provided image) */}
      <div className="w-full h-52 sm:h-64 bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-100 flex items-center justify-center text-center px-6">
        <div>
          <p className="text-xs text-gray-500 mb-1">Hero image placeholder</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Massage Standards To Expect</h2>
          <p className="text-sm text-gray-700 mt-2">Mobile therapists on IndaStreet bring the spa to you—clean, professional, and on time.</p>
        </div>
      </div>

      <main className="space-y-8">
        <PageContainer className="pt-6 pb-20 space-y-8">
          {/* Standards list */}
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-orange-600" />
              <div>
                <h2 className="text-lg font-bold text-gray-900">Massage Standards To Expect</h2>
                <p className="text-sm text-gray-600">Clear, simple standards every mobile therapist on IndaStreet follows.</p>
              </div>
            </div>

            <div className="grid gap-4">
              {standards.map(({ title, icon: Icon, points }) => (
                <div key={title} className="rounded-lg border border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                  </div>
                  <ul className="list-disc pl-5 text-sm text-gray-700 space-y-2">
                    {points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Booking and safety reminders */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-md p-6 text-white space-y-3">
            <div className="flex items-center gap-2 text-white">
              <Star className="w-5 h-5" />
              <h3 className="text-lg font-semibold">Safety-first booking</h3>
            </div>
            <ul className="space-y-2 text-sm">
              <li>Book through IndaStreet so we can support and protect your session.</li>
              <li>Share allergies or preferences in chat before the therapist travels.</li>
              <li>Ask to see therapist ID if you want extra peace of mind.</li>
            </ul>
          </div>

          <p className="text-center text-xs text-gray-500">Regulated under Indastreetmassage.com</p>
        </PageContainer>
      </main>
    </div>
  );
};

export default MobileTherapistStandardsPage;
