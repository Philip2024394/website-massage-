import React, { useState, useEffect } from 'react';
import { User, Building2, Sparkles, Briefcase, Hotel, Check } from 'lucide-react';

interface PortalSelectionPageProps {
    onNavigate?: (page: string) => void;
    t?: any;
    language?: 'en' | 'id';
}

const PortalSelectionPage: React.FC<PortalSelectionPageProps> = ({ onNavigate, t, language = 'en' }) => {
    const [selectedPlan, setSelectedPlan] = useState<'pro' | 'plus'>('pro');

    useEffect(() => {
        // Get the selected plan from localStorage
        const plan = localStorage.getItem('selected_membership_plan') || 
                     localStorage.getItem('pendingTermsPlan');
        if (plan === 'pro' || plan === 'plus') {
            setSelectedPlan(plan);
        }
    }, []);

    const portals = [
        {
            id: 'massage_therapist',
            title: 'Massage Therapist',
            subtitle: 'Independent Home Service Provider',
            description: 'Perfect for freelance massage therapists who provide services at client locations (homes, hotels, villas). Build your client base and manage your bookings.',
            icon: User,
            color: 'from-blue-500 to-blue-600',
            features: [
                'Create professional profile with photos',
                'Set your own rates and availability',
                'Receive booking requests from clients',
                'Direct WhatsApp communication',
                'Track earnings and analytics',
                'Get reviews and ratings'
            ],
            bestFor: ['Freelance therapists', 'Mobile massage services', 'Home service providers']
        },
        {
            id: 'massage_place',
            title: 'Massage Spa',
            subtitle: 'Wellness Center or Spa Business',
            description: 'For massage spas, wellness centers, and health clinics with a physical location. Showcase your facility and attract more customers.',
            icon: Building2,
            color: 'from-purple-500 to-purple-600',
            features: [
                'Display your spa facility with gallery',
                'List all services and pricing',
                'Show operating hours and location',
                'Manage multiple staff members',
                'Accept bookings and payments',
                'Business analytics dashboard'
            ],
            bestFor: ['Massage spas', 'Wellness centers', 'Traditional massage parlors']
        },
        {
            id: 'facial_place',
            title: 'Facial Clinic',
            subtitle: 'Beauty & Facial Treatment Center',
            description: 'For facial clinics, beauty salons, and aesthetic treatment centers. Promote your facial services and beauty treatments.',
            icon: Sparkles,
            color: 'from-pink-500 to-pink-600',
            features: [
                'Showcase facial treatments offered',
                'Display before/after photos',
                'Promote beauty packages',
                'Manage appointments',
                'Client retention tools',
                'Treatment history tracking'
            ],
            bestFor: ['Facial clinics', 'Beauty salons', 'Aesthetic centers']
        },
        {
            id: 'hotel',
            title: 'Hotel / Villa',
            subtitle: 'Accommodation with Spa Services',
            description: 'For hotels, resorts, and villas offering massage and spa services to guests. Connect with professional therapists for your property.',
            icon: Hotel,
            color: 'from-amber-500 to-orange-600',
            features: [
                'List property with amenities',
                'Offer spa services to guests',
                'Connect with qualified therapists',
                'Manage guest bookings',
                'Enhance guest experience',
                'Additional revenue stream'
            ],
            bestFor: ['Hotels with spa', 'Resorts', 'Villas', 'Guesthouses']
        }
    ];

    const handlePortalSelect = (portalId: string) => {
        // Store portal selection
        localStorage.setItem('selected_portal', portalId);
        localStorage.setItem('selectedPortalType', portalId);
        localStorage.setItem('selected_membership_plan', selectedPlan);
        
        // Navigate to simple signup page
        if (onNavigate) {
            onNavigate('simpleSignup');
        } else {
            // Fallback: redirect to signup URL
            window.location.href = `/signup?plan=${selectedPlan}&portal=${portalId}`;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onNavigate?.('joinIndastreet')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <h1 className="text-2xl font-bold">
                                <span className="text-black">Inda</span>
                                <span className="text-orange-500">Street</span>
                            </h1>
                        </div>
                        <div className="text-sm text-gray-500">
                            Step 3 of 4
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="inline-block mb-4 px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                        ✓ {selectedPlan === 'plus' ? 'Plus' : 'Pro'} Plan Selected
                    </div>
                    <h2 className="text-4xl font-bold text-gray-900 mb-4">
                        Choose Your Portal Type
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Select the portal that best describes your business. Each portal is designed with specific features for your needs.
                    </p>
                </div>

                {/* Portal Cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {portals.map((portal) => {
                        const Icon = portal.icon;
                        return (
                            <div
                                key={portal.id}
                                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 border-gray-100 hover:border-orange-300 transform hover:scale-105"
                            >
                                {/* Header with Icon */}
                                <div className={`bg-gradient-to-r ${portal.color} p-6 text-white`}>
                                    <Icon className="w-12 h-12 mb-3" />
                                    <h3 className="text-2xl font-bold mb-1">{portal.title}</h3>
                                    <p className="text-white/90 text-sm">{portal.subtitle}</p>
                                </div>

                                {/* Content */}
                                <div className="p-6">
                                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                                        {portal.description}
                                    </p>

                                    {/* Features */}
                                    <ul className="space-y-2 mb-6">
                                        {portal.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm">
                                                <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                                <span className="text-gray-700">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* Best For */}
                                    <div className="mb-4">
                                        <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Perfect For:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {portal.bestFor.map((item, idx) => (
                                                <span key={idx} className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Select Button */}
                                    <button
                                        onClick={() => handlePortalSelect(portal.id)}
                                        className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${portal.color} text-white hover:shadow-lg`}
                                    >
                                        Select {portal.title} →
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 max-w-2xl mx-auto text-center">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                        Not Sure Which to Choose?
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Don't worry! You can always contact our support team for guidance, or select the one that fits best now.
                    </p>
                    <a
                        href="https://wa.me/6281392000050"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Chat with Support
                    </a>
                </div>
            </div>
        </div>
    );
};

export default PortalSelectionPage;
