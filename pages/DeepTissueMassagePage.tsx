import React from 'react';
import { useNavigate } from 'react-router-dom';

const DeepTissueMassagePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-purple-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-red-600 to-purple-600 text-white py-24">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-6xl font-bold mb-6">Deep Tissue Massage 💪</h1>
                    <p className="text-2xl text-red-100 mb-4">
                        Targeted Therapy for Chronic Pain & Muscle Tension
                    </p>
                    <p className="text-lg text-red-100 mb-8">
                        Intense pressure • Trigger point release • Sports injury recovery • Chronic pain relief
                    </p>
                    <button 
                        onClick={() => navigate('/therapists')}
                        className="px-10 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-lg text-lg"
                    >
                        Find Deep Tissue Specialist
                    </button>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
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
                                <div className="text-5xl mb-3">🎯</div>
                                <h3 className="font-bold text-gray-900 mb-2">Targeted Treatment</h3>
                                <p className="text-gray-600 text-sm">Focuses on specific problem areas rather than full body</p>
                            </div>
                            <div className="bg-purple-50 rounded-xl p-6 text-center">
                                <div className="text-5xl mb-3">💪</div>
                                <h3 className="font-bold text-gray-900 mb-2">Deep Pressure</h3>
                                <p className="text-gray-600 text-sm">Reaches muscle layers beneath surface tissue</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-6 text-center">
                                <div className="text-5xl mb-3">🔬</div>
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
                            <div className="text-5xl mb-4">🩹</div>
                            <h3 className="font-bold text-gray-900 mb-2">Breaks Down Scar Tissue</h3>
                            <p className="text-gray-600 text-sm">
                                Improves healing and flexibility after injuries or surgery
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">💊</div>
                            <h3 className="font-bold text-gray-900 mb-2">Reduces Chronic Pain</h3>
                            <p className="text-gray-600 text-sm">
                                Alleviates persistent muscle tension and joint discomfort
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">🤸</div>
                            <h3 className="font-bold text-gray-900 mb-2">Improves Mobility</h3>
                            <p className="text-gray-600 text-sm">
                                Increases range of motion and joint flexibility
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">❤️</div>
                            <h3 className="font-bold text-gray-900 mb-2">Lowers Blood Pressure</h3>
                            <p className="text-gray-600 text-sm">
                                Reduces stress hormones and promotes cardiovascular health
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">🏃</div>
                            <h3 className="font-bold text-gray-900 mb-2">Speeds Recovery</h3>
                            <p className="text-gray-600 text-sm">
                                Enhances muscle repair after workouts or sports
                            </p>
                        </div>
                        <div className="bg-white rounded-xl p-6 shadow-lg text-center">
                            <div className="text-5xl mb-4">😌</div>
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
                <div className="text-center bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-12 text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Address Your Chronic Pain?</h2>
                    <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
                        Find certified deep tissue massage specialists across Indonesia
                    </p>
                    <button 
                        onClick={() => navigate('/therapists')}
                        className="px-12 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-lg text-lg"
                    >
                        Find Specialists Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeepTissueMassagePage;
