// 🎯 AUTO-FIXED: Mobile scroll architecture violations (2 fixes)
import React from 'react';
import { getCountryContent, CountryMassageType } from '../config/countryContent';
import PageContainer from '../components/layout/PageContainer';
import UniversalHeader from '../components/shared/UniversalHeader';
import { MapPin, Clock, DollarSign } from 'lucide-react';

interface CountryMassagePageProps {
    countryCode: string;
    massageTypeId: string;
    onNavigate: (page: string) => void;
    onLoginClick: () => void;
    t: any;
    language?: 'en' | 'id';
}

const CountryMassagePage: React.FC<CountryMassagePageProps> = ({
    countryCode,
    massageTypeId,
    onNavigate,
    onLoginClick,
    t,
    language = 'en'
}) => {
    const countryContent = getCountryContent(countryCode);
    const massageType = countryContent?.massageTypes.find(mt => mt.id === massageTypeId);

    if (!countryContent || !massageType) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h1>
                    <p className="text-gray-600 mb-6">The requested massage type could not be found.</p>
                    <button
                        onClick={() => onNavigate('home')}
                        className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <PageContainer>
            <UniversalHeader 
                onNavigate={onNavigate}
                onLoginClick={onLoginClick}
                language={language}
                showBackButton={true}
                onBackClick={() => onNavigate(`${countryCode.toLowerCase()}`)}
            />
            
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-orange-50 via-white to-orange-50">
                {/* Hero Section */}
                <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-orange-600 to-red-500">
                    <div className="absolute inset-0 bg-black opacity-20"></div>
                    <div className="relative max-w-7xl mx-auto px-4 py-24">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="text-white">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="text-4xl">{countryContent.flag}</span>
                                    <h1 className="text-4xl lg:text-5xl font-bold">
                                        {massageType.name}
                                    </h1>
                                </div>
                                <p className="text-xl mb-8 text-orange-100">
                                    {massageType.description}
                                </p>
                                
                                {/* Key Features */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <MapPin className="w-6 h-6 text-orange-200" />
                                        <span className="text-lg">Available in {countryContent.name}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-6 h-6 text-orange-200" />
                                        <span className="text-lg">60-120 minute sessions</span>
                                    </div>
                                    {massageType.price && (
                                        <div className="flex items-center gap-3">
                                            <DollarSign className="w-6 h-6 text-orange-200" />
                                            <span className="text-lg">
                                                From {massageType.price.min.toLocaleString()} {massageType.price.currency}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="mt-8 flex gap-4">
                                    <button
                                        onClick={() => onNavigate(countryCode.toLowerCase())}
                                        className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
                                    >
                                        Book Now in {countryContent.name}
                                    </button>
                                    <button
                                        onClick={() => onNavigate(`${countryCode.toLowerCase()}/therapists`)}
                                        className="px-8 py-4 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors"
                                    >
                                        Find Therapists
                                    </button>
                                </div>
                            </div>
                            
                            <div className="relative">
                                <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-2xl">
                                    <img
                                        src={massageType.image}
                                        alt={massageType.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = 'https://ik.imagekit.io/7grri5v7d/massage-placeholder.jpg';
                                        }}
                                    />
                                </div>
                                <div className="absolute -top-6 -right-6 w-24 h-24 bg-white bg-opacity-20 rounded-full backdrop-blur-sm flex items-center justify-center">
                                    <span className="text-4xl">{countryContent.flag}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="max-w-4xl mx-auto px-4 py-16">
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">
                            About {massageType.name}
                        </h2>
                        
                        <div className="prose max-w-none text-gray-600">
                            <p className="text-lg mb-6">
                                {massageType.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        Treatment Benefits
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>• Stress relief and relaxation</li>
                                        <li>• Improved blood circulation</li>
                                        <li>• Muscle tension release</li>
                                        <li>• Enhanced flexibility</li>
                                        <li>• Mental wellness boost</li>
                                    </ul>
                                </div>
                                
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4">
                                        What to Expect
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>• Professional certified therapists</li>
                                        <li>• Clean, comfortable environment</li>
                                        <li>• Traditional {countryContent.name} techniques</li>
                                        <li>• Customized session duration</li>
                                        <li>• Premium oils and products</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Pricing Information */}
                    {massageType.price && (
                        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-8 mb-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                Pricing Information
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600">60 min</div>
                                    <div className="text-lg text-gray-600 mt-2">
                                        {massageType.price.min.toLocaleString()} {massageType.price.currency}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600">90 min</div>
                                    <div className="text-lg text-gray-600 mt-2">
                                        {Math.round(massageType.price.min * 1.4).toLocaleString()} {massageType.price.currency}
                                    </div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-orange-600">120 min</div>
                                    <div className="text-lg text-gray-600 mt-2">
                                        {massageType.price.max.toLocaleString()} {massageType.price.currency}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="text-center mt-8">
                                <p className="text-gray-600 mb-4">Prices may vary by therapist and location</p>
                                <button
                                    onClick={() => onNavigate(countryCode.toLowerCase())}
                                    className="px-8 py-4 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
                                >
                                    Book Your Session
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {/* Cultural Context */}
                    {massageType.traditional && (
                        <div className="bg-white rounded-2xl shadow-lg p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Cultural Heritage
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                {massageType.name} is deeply rooted in {countryContent.name}'s traditional healing practices. 
                                This ancient art form has been passed down through generations, preserving the authentic 
                                techniques that make {countryContent.name} massage therapy unique.
                            </p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {countryContent.culturalElements.map((element, index) => (
                                    <div key={index} className="text-center p-4 bg-orange-50 rounded-lg">
                                        <div className="text-sm font-medium text-orange-600">{element}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </PageContainer>
    );
};

export default CountryMassagePage;