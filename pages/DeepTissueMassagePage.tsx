import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawer';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import FlyingButterfly from '../components/FlyingButterfly';

interface DeepTissueMassagePageProps {
    onNavigate?: (page: string) => void;
    onMassageJobsClick?: () => void;
    onHotelPortalClick?: () => void;
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
    t: any;
}

const DeepTissueMassagePage: React.FC<DeepTissueMassagePageProps> = ({
    onNavigate,
    onMassageJobsClick,
    onHotelPortalClick,
    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = [],
    t
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50 overflow-x-hidden w-full">
            {/* Flying Butterfly Animation */}
            <FlyingButterfly />
            
            <header className="bg-white p-4 shadow-md sticky top-0 z-20 w-full">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        {/* Home Button */}
                        <button 
                            onClick={() => {
                                if (onNavigate) {
                                    onNavigate('home');
                                }
                            }} 
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors" 
                            title="Home"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>

                        <button onClick={() => setIsMenuOpen(true)} title="Menu" style={{ zIndex: 9999, position: 'relative' }}>
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Global App Drawer */}
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                t={t}
                onMassageJobsClick={onMassageJobsClick}
                onHotelPortalClick={onHotelPortalClick}
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
            />
            {/* Hero Section */}
            <div className="relative text-white py-24 w-full overflow-hidden">
                <img 
                    src="https://ik.imagekit.io/7grri5v7d/massage%20deep%20tissue%20indonisea.png?updatedAt=1762573128421"
                    alt="Deep Tissue Massage"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                {/* Clean overlay for better text readability */}
                <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                
                <div className="container mx-auto px-4 text-center relative z-10">
                    <h1 className="text-6xl font-bold mb-6 drop-shadow-lg">Deep Tissue Massage</h1>
                    <p className="text-2xl text-white mb-4 drop-shadow-md">
                        Targeted Therapy for Chronic Pain & Muscle Tension
                    </p>
                    <p className="text-lg text-white mb-8 drop-shadow-md">
                        Intense pressure • Trigger point release • Sports injury recovery • Chronic pain relief
                    </p>
                    <button 
                        onClick={() => {/* Navigate to therapists */}}
                        className="px-8 py-4 bg-white text-red-700 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-lg"
                    >
                        Find Deep Tissue Specialist
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16 pb-24">
                {/* What Is Deep Tissue */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">What is Deep Tissue Massage?</h2>
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            Deep tissue massage is a therapeutic massage technique that uses slow, deep strokes and sustained pressure 
                            targeting the inner layers of muscles, tendons, and fascia (connective tissue). Unlike relaxation massages, 
                            this is a clinical treatment designed to address specific problem areas.
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed mb-6">
                            Therapists use their fingers, knuckles, elbows, and forearms to apply intense pressure that breaks up 
                            scar tissue, releases chronic muscle tension, and improves mobility. It's particularly effective for 
                            athletes, people with chronic pain, and those recovering from injuries.
                        </p>
                        <div className="grid md:grid-cols-3 gap-6 mt-8">
                            <div className="bg-red-50 rounded-xl p-6 text-center">
                                <div className="mb-3 flex justify-center">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/treatment-removebg-preview.png?updatedAt=1762573646457" 
                                        alt="Targeted Treatment" 
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Targeted Treatment</h3>
                                <p className="text-gray-600 text-sm">Focuses on specific problem areas rather than full body</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6 text-center">
                                <div className="mb-3 flex justify-center">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/wellness-removebg-preview.png?updatedAt=1762573646318" 
                                        alt="Deep Pressure" 
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Deep Pressure</h3>
                                <p className="text-gray-600 text-sm">Reaches muscle layers beneath surface tissue</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-6 text-center">
                                <div className="mb-3 flex justify-center">
                                    <img 
                                        src="https://ik.imagekit.io/7grri5v7d/wellnesss-removebg-preview.png?updatedAt=1762573646104" 
                                        alt="Therapeutic" 
                                        className="w-16 h-16 object-contain"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 mb-2">Therapeutic</h3>
                                <p className="text-gray-600 text-sm">Clinical approach to treating chronic conditions</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Who Needs It */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Who Benefits from Deep Tissue Massage?</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-red-600 mb-4">🏃 Athletes & Active People</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Recovery from sports injuries (sprains, strains)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Muscle soreness after intense workouts</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Preventing injuries through muscle maintenance</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Improving athletic performance and flexibility</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-purple-600 mb-4">💼 Office Workers</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Chronic neck and shoulder tension from desk work</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Lower back pain from prolonged sitting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Repetitive strain injuries (carpal tunnel, tendonitis)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Postural imbalances from poor ergonomics</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-blue-600 mb-4">🤕 Chronic Pain Sufferers</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Fibromyalgia and widespread muscle pain</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Sciatica and piriformis syndrome</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Osteoarthritis joint pain</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Tension headaches and migraines</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                            <h3 className="text-xl font-bold text-orange-600 mb-4">🧘 Post-Injury Recovery</h3>
                            <ul className="space-y-2 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Scar tissue breakdown after surgery</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Whiplash from motor vehicle accidents</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Frozen shoulder and limited mobility</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>Rehabilitation from muscle tears</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Techniques */}
                <div className="mb-16 bg-gradient-to-br from-red-500 to-purple-600 rounded-2xl p-12 text-white">
                    <h2 className="text-4xl font-bold mb-8 text-center">Advanced Techniques Used</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-2xl font-bold mb-3">🖐️ Stripping</h3>
                            <p className="text-red-100">
                                Deep, gliding pressure along the length of muscle fibers using elbows, forearms, or knuckles 
                                to release adhesions and realign tissue.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3">🎯 Trigger Point Therapy</h3>
                            <p className="text-red-100">
                                Focused pressure applied to hyperirritable spots in muscles (knots) that cause referred pain 
                                in other areas of the body.
                            </p>
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-3">🔄 Friction</h3>
                            <p className="text-red-100">
                                Pressure applied across muscle grain to break down scar tissue, increase blood flow, and 
                                restore proper fiber alignment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Benefits */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Therapeutic Benefits</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="mb-4 flex justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/breaks%20down%20massage.png?updatedAt=1762574910291" 
                                    alt="Breaks Down Scar Tissue" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Breaks Down Scar Tissue</h3>
                            <p className="text-gray-600 text-sm">
                                Improves healing and flexibility after injuries or surgery
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="mb-4 flex justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/massage%20guys.png?updatedAt=1762574963120" 
                                    alt="Reduces Chronic Pain" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Reduces Chronic Pain</h3>
                            <p className="text-gray-600 text-sm">
                                Alleviates persistent muscle tension and joint discomfort
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="mb-4 flex justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/massage%20guys%20new.png?updatedAt=1762575002634" 
                                    alt="Improves Mobility" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Improves Mobility</h3>
                            <p className="text-gray-600 text-sm">
                                Increases range of motion and joint flexibility
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="mb-4 flex justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/heart%20attach.png?updatedAt=1762575043659" 
                                    alt="Lowers Blood Pressure" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Lowers Blood Pressure</h3>
                            <p className="text-gray-600 text-sm">
                                Reduces stress hormones and promotes cardiovascular health
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="mb-4 flex justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/heart%20attachd.png?updatedAt=1762575087903" 
                                    alt="Speeds Recovery" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Speeds Recovery</h3>
                            <p className="text-gray-600 text-sm">
                                Enhances muscle repair after workouts or sports
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="mb-4 flex justify-center">
                                <img 
                                    src="https://ik.imagekit.io/7grri5v7d/heart%20attachdd.png?updatedAt=1762575127361" 
                                    alt="Relieves Stress" 
                                    className="w-16 h-16 object-contain"
                                />
                            </div>
                            <h3 className="font-bold text-gray-900 mb-2">Relieves Stress</h3>
                            <p className="text-gray-600 text-sm">
                                Releases endorphins and reduces anxiety levels
                            </p>
                        </div>
                    </div>
                </div>

                {/* What to Expect */}
                <div className="mb-16 bg-white rounded-2xl p-8 shadow-xl">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">What to Expect</h2>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-red-600 mb-2">⚠️ It May Be Uncomfortable (Not Relaxing)</h3>
                            <p className="text-gray-700">
                                Deep tissue massage involves intense pressure that can feel uncomfortable or even slightly painful 
                                during treatment. This is normal. However, it should never be excruciating. Always communicate with 
                                your therapist about pressure levels.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-purple-600 mb-2">💬 Communication is Essential</h3>
                            <p className="text-gray-700">
                                Tell your therapist exactly where you feel pain, tension, or discomfort. Describe the sensation 
                                (sharp, dull, burning, aching) so they can adjust technique. Speak up if pressure is too intense.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-blue-600 mb-2">💧 Drink Water After Treatment</h3>
                            <p className="text-gray-700">
                                Deep tissue massage releases toxins from muscles into your bloodstream. Drinking 2-3 liters of water 
                                in the 24 hours after your session helps flush these toxins and prevents soreness.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-orange-600 mb-2">🕐 Soreness for 1-2 Days is Normal</h3>
                            <p className="text-gray-700">
                                You may feel muscle soreness similar to post-workout ache for 24-48 hours. This is normal and 
                                indicates the treatment worked. Apply ice if needed and gentle stretching helps.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Pricing */}
                <div className="mb-16">
                    <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">Typical Pricing</h2>
                    <div className="bg-white rounded-2xl p-8 shadow-xl">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-4 px-4 text-gray-700">Duration</th>
                                    <th className="text-left py-4 px-4 text-gray-700">Price Range</th>
                                    <th className="text-left py-4 px-4 text-gray-700">Best For</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 font-semibold">60 minutes</td>
                                    <td className="py-4 px-4 text-red-600 font-bold">IDR 200,000 - 400,000</td>
                                    <td className="py-4 px-4 text-gray-600">Specific problem area (back, shoulders)</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 font-semibold">90 minutes</td>
                                    <td className="py-4 px-4 text-red-600 font-bold">IDR 300,000 - 550,000</td>
                                    <td className="py-4 px-4 text-gray-600">Multiple problem areas (back + legs)</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 font-semibold">120 minutes</td>
                                    <td className="py-4 px-4 text-red-600 font-bold">IDR 400,000 - 700,000</td>
                                    <td className="py-4 px-4 text-gray-600">Full body chronic pain treatment</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-sm text-gray-500 mt-6">
                            Note: Deep tissue is typically 30-50% more expensive than Swedish/relaxation massage due to 
                            specialized training required and physical intensity for therapists.
                        </p>
                    </div>
                </div>

                {/* FAQ */}
                <div className="mb-16 bg-white rounded-2xl p-8 shadow-lg">
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">Common Questions</h2>
                    <div className="space-y-4">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">How is deep tissue different from Swedish massage?</h3>
                            <p className="text-gray-600">
                                Swedish massage uses light-to-medium pressure for relaxation and stress relief. Deep tissue uses 
                                intense pressure targeting deeper muscle layers to treat chronic pain and injuries. Deep tissue is 
                                therapeutic, not primarily for relaxation.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Should deep tissue massage hurt?</h3>
                            <p className="text-gray-600">
                                Some discomfort is normal, but it should be "good pain" (productive, tension-releasing) not "bad pain" 
                                (sharp, shooting, unbearable). Always communicate with your therapist and ask them to adjust pressure.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">How often should I get deep tissue massage?</h3>
                            <p className="text-gray-600">
                                For chronic conditions: weekly for 4-6 weeks, then biweekly. For maintenance: once monthly. 
                                For acute injuries: wait 48-72 hours after injury, then start treatment with medical clearance.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">When should I avoid deep tissue massage?</h3>
                            <p className="text-gray-600">
                                Avoid if you have: blood clots, recent surgery, cancer, osteoporosis, skin infections, or open wounds. 
                                Consult your doctor first if you have cardiovascular conditions or are pregnant.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-12 text-white">
                    <div className="flex flex-col lg:flex-row items-center gap-8">
                        {/* Text Content */}
                        <div className="flex-1 text-center lg:text-left">
                            <h2 className="text-3xl font-bold mb-4">Ready to Address Your Chronic Pain?</h2>
                            <p className="text-xl text-red-100 mb-8 max-w-2xl">
                                Find certified deep tissue massage specialists across Indonesia
                            </p>
                            <button 
                                onClick={() => onNavigate?.('home')}
                                className="px-12 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-lg text-lg"
                            >
                                Find Specialists Now
                            </button>
                        </div>
                        
                        {/* Image */}
                        <div className="flex-1 lg:flex-none">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/massage%20deep%20tissue%20indoniseas.png?updatedAt=1762579867409"
                                alt="Deep Tissue Massage Therapy"
                                className="w-full max-w-md mx-auto rounded-xl shadow-2xl border-4 border-white/20"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DeepTissueMassagePage;
