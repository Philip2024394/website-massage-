import React from 'react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import PageContainer from '../components/layout/PageContainer';
import HomeIcon from '../components/icons/HomeIcon';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

interface JoinIndastreetPageProps {
    onBack: () => void;
    onNavigateToTherapistLogin: () => void;
    onNavigateToMassagePlaceLogin: () => void;
    t: any;
}

const JoinIndastreetPage: React.FC<JoinIndastreetPageProps> = ({
    onBack,
    onNavigateToTherapistLogin,
    onNavigateToMassagePlaceLogin,
    t
}) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-teal-50">
            {/* Global Header - Same as HomePage */}
            <header className="bg-white shadow-md sticky top-0 z-[9997]">
                <PageContainer>
                    <div className="flex justify-between items-center py-4">
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                        <div className="flex items-center gap-3 text-gray-600">
                            <button 
                                onClick={onBack}
                                className="p-2 hover:bg-orange-50 rounded-full transition-colors"
                                title="Home"
                            >
                                <HomeIcon className="w-5 h-5 text-orange-500" />
                            </button>
                            <button className="p-2 hover:bg-orange-50 rounded-full transition-colors text-orange-500">
                                <BurgerMenuIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </PageContainer>
            </header>
            <PageContainer>
                <div className="py-8 pb-24">
                {/* Minimal Plans Section: Pro and Plus */}
                <div className="max-w-5xl mx-auto mb-10">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Choose Your Membership</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-sm font-semibold text-orange-600">Pro</div>
                                    <p className="mt-3 text-2xl font-bold text-gray-900">IDR 99k / month</p>
                                    <p className="mt-1 text-sm text-gray-600">Great to start and grow</p>
                                </div>
                            </div>
                            <ul className="mt-5 space-y-2 text-sm text-gray-700">
                                <li>• Profile listing + search</li>
                                <li>• Customer reviews</li>
                                <li>• Real-time notifications</li>
                                <li>• No commission fees</li>
                            </ul>
                            <div className="mt-6 flex gap-3">
                                <button onClick={() => window.location.assign('/packages?plan=pro')} className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-white font-semibold hover:bg-orange-600">View</button>
                            </div>
                        </div>
                        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-sm font-semibold text-teal-600">Plus</div>
                                    <p className="mt-3 text-2xl font-bold text-gray-900">IDR 199k / month</p>
                                    <p className="mt-1 text-sm text-gray-600">For maximum visibility</p>
                                </div>
                            </div>
                            <ul className="mt-5 space-y-2 text-sm text-gray-700">
                                <li>• Everything in Pro</li>
                                <li>• Priority placement</li>
                                <li>• Verified Pro badge</li>
                                <li>• Hotel & villa access</li>
                            </ul>
                            <div className="mt-6 flex gap-3">
                                <button onClick={() => window.location.assign('/packages?plan=plus')} className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2 text-white font-semibold hover:bg-orange-600">View</button>
                            </div>
                        </div>
                    </div>
                </div>

                    <h3 className="text-3xl font-bold text-orange-600 mb-6">{t.whyJoinTitle}</h3>
                    <p className="text-lg text-gray-700 mb-8 leading-relaxed max-w-4xl mx-auto">{t.whyJoinText}</p>
                    
                    {/* Benefits Grid */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-5xl mx-auto">
                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/calender.png"
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-3">📱</div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{t.benefit1Title}</h4>
                                        <p className="text-gray-700">{t.benefit1Text}</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-xl p-6 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/calenders.png"
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-3">💰</div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{t.benefit2Title}</h4>
                                        <p className="text-gray-700">{t.benefit2Text}</p>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-center relative overflow-hidden">
                                    <div className="absolute inset-0 opacity-10">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/calendersd.png"
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="relative z-10">
                                        <div className="text-5xl mb-3">⭐</div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{t.benefit3Title}</h4>
                                        <p className="text-gray-700">{t.benefit3Text}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Features Section */}
                            <div className="mb-8">
                                <h4 className="text-2xl font-bold text-gray-900 mb-6">{t.platformFeaturesTitle}</h4>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg flex items-center justify-center p-2">
                                            <img src="https://img.icons8.com/3d-fluency/94/user-male-circle.png" alt="profile" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.feature1Title}</p>
                                            <p className="text-sm text-gray-600">{t.feature1Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500 shadow-lg flex items-center justify-center p-2">
                                            <img src="https://img.icons8.com/3d-fluency/94/bell.png" alt="notification" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.feature2Title}</p>
                                            <p className="text-sm text-gray-600">{t.feature2Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 shadow-lg flex items-center justify-center p-2">
                                            <img src="https://img.icons8.com/3d-fluency/94/star.png" alt="reviews" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.feature3Title}</p>
                                            <p className="text-sm text-gray-600">{t.feature3Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-green-400 to-green-600 shadow-lg flex items-center justify-center p-2">
                                            <img src="https://img.icons8.com/3d-fluency/94/smartphone-tablet.png" alt="mobile" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.feature4Title}</p>
                                            <p className="text-sm text-gray-600">{t.feature4Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 shadow-lg flex items-center justify-center p-2">
                                            <img src="https://img.icons8.com/3d-fluency/94/hotel.png" alt="hotel" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.feature5Title}</p>
                                            <p className="text-sm text-gray-600">{t.feature5Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 shadow-lg flex items-center justify-center p-2">
                                            <img src="https://img.icons8.com/3d-fluency/94/money-bag.png" alt="earnings" className="w-full h-full object-contain" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.feature6Title}</p>
                                            <p className="text-sm text-gray-600">{t.feature6Text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        {/* Success Stories */}
                        <div 
                            className="relative p-8 mb-8 border-2 border-orange-500 rounded-xl overflow-hidden"
                            style={{
                                backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/success%20stories.png)',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                backgroundRepeat: 'no-repeat'
                            }}
                        >
                            {/* Semi-transparent overlay for better text readability */}
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>
                            
                            {/* Content */}
                            <div className="relative z-10">
                                <h4 className="text-3xl font-extrabold text-gray-900 mb-6 drop-shadow-lg">{t.successStoriesTitle}</h4>
                                <div className="space-y-6">
                                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <img 
                                                src="https://ik.imagekit.io/7grri5v7d/MASSAGE_SPA_PERSON-removebg-preview.png"
                                                alt="Balinese Massage Therapist"
                                                className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-500"
                                            />
                                            <div>
                                                <p className="font-extrabold text-gray-900 mb-2 text-lg">{t.testimonial1Name}</p>
                                                <p className="text-gray-800 font-semibold italic mb-2">{t.testimonial1Text}</p>
                                                <p className="text-sm text-gray-700 font-bold">{t.testimonial1Rating}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/90 backdrop-blur-sm rounded-lg p-6 shadow-lg">
                                        <div className="flex items-start gap-4">
                                            <img 
                                                src="https://ik.imagekit.io/7grri5v7d/MASSAGE_SPA_PERSONs-removebg-preview.png"
                                                alt="Ubud Wellness Spa"
                                                className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-500"
                                            />
                                            <div>
                                                <p className="font-extrabold text-gray-900 mb-2 text-lg">{t.testimonial2Name}</p>
                                                <p className="text-gray-800 font-semibold italic mb-2">{t.testimonial2Text}</p>
                                                <p className="text-sm text-gray-700 font-bold">{t.testimonial2Rating}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-8 mb-8">
                                <h4 className="text-2xl font-bold text-gray-900 mb-6">{t.howItWorksTitle}</h4>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.step1Title}</p>
                                            <p className="text-gray-700">{t.step1Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.step2Title}</p>
                                            <p className="text-gray-700">{t.step2Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.step3Title}</p>
                                            <p className="text-gray-700">{t.step3Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold">4</div>
                                        <div>
                                            <p className="font-semibold text-gray-900">{t.step4Title}</p>
                                            <p className="text-gray-700">{t.step4Text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        {/* CTA Buttons */}
                        <div className="grid md:grid-cols-2 gap-6 mt-8">
                                <button 
                                    onClick={onNavigateToTherapistLogin}
                                    className="relative overflow-hidden bg-white border-2 border-orange-400 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                                >
                                    <div className="absolute inset-0">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/massage%20therapist%20bew.png?updatedAt=1763136088363"
                                            alt="Join as Therapist"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="relative z-10 p-6 bg-gradient-to-t from-orange-50/95 via-orange-50/80 to-transparent min-h-[250px] flex flex-col justify-end">
                                        <div className="text-xl font-black text-black mb-2">{t.ctaTherapistTitle}</div>
                                        <div className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors w-fit">
                                            {t.ctaTherapistButton}
                                        </div>
                                    </div>
                                </button>
                                <button 
                                    onClick={onNavigateToMassagePlaceLogin}
                                    className="relative overflow-hidden bg-white border-2 border-orange-400 rounded-xl shadow-lg hover:shadow-2xl transition-all transform hover:scale-105"
                                >
                                    <div className="absolute inset-0">
                                        <img 
                                            src="https://ik.imagekit.io/7grri5v7d/massage%20spa.png?updatedAt=1763807003919"
                                            alt="Join Massage Spa"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="relative z-10 p-6 bg-gradient-to-t from-orange-50/95 via-orange-50/80 to-transparent min-h-[250px] flex flex-col justify-end">
                                        <div className="text-xl font-black text-black mb-2">{t.ctaSpaTitle}</div>
                                        <div className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-full text-sm transition-colors w-fit">
                                            {t.ctaSpaButton}
                                        </div>
                                    </div>
                                </button>
                            </div>

                        {/* Contact Support */}
                        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-center text-white mt-8">
                                <h4 className="text-2xl font-bold mb-3">{t.contactTitle}</h4>
                                <p className="text-lg mb-4">{t.contactText}</p>
                                <a 
                                    href="https://wa.me/6281392000050?text=Hi%20I%20would%20like%20to%20enquire%20more%20about%20the%20massage%20membership."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-white text-orange-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg"
                                >
                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                    </svg>
                                    {t.contactButton}
                                </a>
                        </div>
                </div>
            </PageContainer>
        </div>
    );
};

export default JoinIndastreetPage;
