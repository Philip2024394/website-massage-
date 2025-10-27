import React, { useState } from 'react';

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface OnlinePresenceMassageTherapistPageProps {
    onNavigate?: (page: string) => void;
}

const OnlinePresenceMassageTherapistPage: React.FC<OnlinePresenceMassageTherapistPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">
                        <span className="text-orange-500">IndaStreet</span>
                    </h1>
                    <button 
                        onClick={() => setIsMenuOpen(true)} 
                        title="Menu"
                        className="text-orange-500 hover:text-orange-600 transition-colors"
                    >
                        <BurgerMenuIcon className="w-6 h-6" />
                    </button>
                </div>
            </header>
            
            {isMenuOpen && (
                <div className="fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-orange-500">IndaStreet</span>
                            </h2>
                            <button onClick={() => setIsMenuOpen(false)}>
                                <CloseIcon />
                            </button>
                        </div>
                        <nav className="flex-grow overflow-y-auto p-4">
                            <div className="space-y-2">
                                <button onClick={() => { onNavigate?.('home'); setIsMenuOpen(false); }} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md border-l-4 border-orange-500 group">
                                    <span className="text-2xl">🏠</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                                <button onClick={() => { onNavigate?.('blog'); setIsMenuOpen(false); }} className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md border-l-4 border-purple-500 group">
                                    <span className="text-2xl">📚</span>
                                    <div>
                                        <h3 className="font-semibold text-gray-800 group-hover:text-purple-600">All Blog Posts</h3>
                                        <p className="text-xs text-gray-500">View all articles</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <article className="max-w-4xl mx-auto px-4 py-12">
                <nav className="mb-8 text-sm text-gray-600">
                    <button onClick={() => onNavigate?.('home')} className="hover:text-orange-600">Home</button> / 
                    <button onClick={() => onNavigate?.('blog')} className="hover:text-orange-600 ml-1">Blog</button> / 
                    <span className="ml-1">Online Presence for Therapists</span>
                </nav>

                <header className="mb-8">
                    <div className="mb-4">
                        <span className="bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-sm font-bold uppercase">Career</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Building Your Online Presence as a Massage Therapist
                    </h1>
                    <div className="flex items-center gap-4 text-gray-600">
                        <span>By Ketut Maya</span>
                        <span>•</span>
                        <span>Aug 25, 2025</span>
                        <span>•</span>
                        <span>10 min read</span>
                    </div>
                </header>

                <div className="mb-12 rounded-2xl overflow-hidden">
                    <img 
                        src="https://ik.imagekit.io/7grri5v7d/jogja%20massages%20indonisea.png?updatedAt=1761561981004" 
                        alt="Digital marketing and online presence for massage therapists in Indonesia" 
                        className="w-full h-96 object-cover"
                    />
                </div>

                <div className="prose prose-base max-w-none">
                    <p className="text-lg text-gray-700 mb-6 leading-relaxed">
                        In Indonesia's competitive wellness market, a strong online presence is no longer optional—it's essential. 78% of wellness tourists research therapists online before booking, and local clients increasingly use digital platforms to find services. This comprehensive guide shows you how to build visibility, attract quality clients, and grow your massage practice through strategic digital marketing.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Why Online Presence Matters</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">The Digital Reality:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Client Discovery:</strong> 85% of local searches result in bookings within 24 hours</li>
                        <li><strong>Trust Building:</strong> Clients won't book without seeing reviews, photos, credentials online</li>
                        <li><strong>Competitive Edge:</strong> Therapists with strong online presence charge 20-30% premium rates</li>
                        <li><strong>24/7 Marketing:</strong> Your digital profiles work while you sleep</li>
                        <li><strong>Credibility:</strong> Professional online presence signals legitimacy and quality</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Foundation: Google My Business (Essential!)</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Google My Business (GMB) is the #1 priority for local visibility—free and incredibly powerful.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Complete Profile Setup:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Business Name:</strong> Your name + "Massage Therapist" (e.g., "Ketut Maya - Balinese Massage Therapist")</li>
                        <li><strong>Category:</strong> Massage Therapist, Spa, Wellness Center</li>
                        <li><strong>Service Area:</strong> List all neighborhoods you serve</li>
                        <li><strong>Hours:</strong> Accurate availability (update for holidays)</li>
                        <li><strong>Contact:</strong> Phone, WhatsApp, email, website/booking link</li>
                        <li><strong>Photos:</strong> 10+ high-quality images (treatment room, oils, you working, certificates)</li>
                        <li><strong>Services:</strong> List all massage types with prices</li>
                        <li><strong>Description:</strong> 200-word summary with keywords (Balinese massage Ubud, deep tissue Seminyak, etc.)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Get Reviews (Critical for Rankings):</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>Ask satisfied clients: "Would you mind leaving a quick Google review?"</li>
                        <li>Send review link via WhatsApp after positive sessions</li>
                        <li>Respond to ALL reviews (thank positive, address negative professionally)</li>
                        <li><strong>Target:</strong> 50+ reviews with 4.5+ star average</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Instagram: Visual Storytelling</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Instagram is perfect for massage therapists—visual medium showcasing your space, techniques, and client transformations.
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Profile Optimization:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Username:</strong> @yourname.massage or @yourname.bali (easy to remember)</li>
                        <li><strong>Bio:</strong> "Certified Balinese Massage Therapist 🌴 | Ubud, Bali | 8+ years | Book via link below 👇"</li>
                        <li><strong>Profile Photo:</strong> Professional headshot (friendly, approachable)</li>
                        <li><strong>Link:</strong> IndaStreet profile or booking platform</li>
                        <li><strong>Business Account:</strong> Access analytics and contact buttons</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Content Strategy (Post 4-5x per week):</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Treatment Photos:</strong> Hands working on back, hot stones, aromatherapy setup (with client permission)</li>
                        <li><strong>Space Shots:</strong> Clean, inviting treatment room, candles, linens</li>
                        <li><strong>Educational Content:</strong> "Benefits of Hot Stone Massage" infographics</li>
                        <li><strong>Client Testimonials:</strong> Text overlay on beautiful background images</li>
                        <li><strong>Behind-the-Scenes:</strong> Preparing oils, sanitizing space, your certifications</li>
                        <li><strong>Wellness Tips:</strong> Stretching exercises, self-massage techniques, hydration reminders</li>
                        <li><strong>Stories Daily:</strong> Quick updates, availability, special offers, polls</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Hashtag Strategy (Use 15-20 per post):</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Location Tags:</strong> #BaliMassage #UbudWellness #SeminyakSpa #CangguMassage</li>
                        <li><strong>Service Tags:</strong> #BalineseMassage #DeepTissueMassage #HotStoneMassage</li>
                        <li><strong>Audience Tags:</strong> #BaliLife #ExpatsInBali #BaliDigitalNomad #WellnessTourism</li>
                        <li><strong>Niche Tags:</strong> #TraditionalHealing #AromatherapyMassage #PrenatalMassage</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Facebook: Community Building</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Business Page Essentials:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Complete "About" Section:</strong> Services, prices, location, certifications, story</li>
                        <li><strong>Enable Reviews:</strong> Display client testimonials</li>
                        <li><strong>Add Services Tab:</strong> List all treatments with descriptions and pricing</li>
                        <li><strong>Booking Button:</strong> Link to IndaStreet profile or WhatsApp</li>
                        <li><strong>Post Regularly:</strong> 3-4x weekly (can cross-post from Instagram)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Join Local Groups:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>"Bali Expats," "Ubud Community," "Canggu Digital Nomads"</li>
                        <li>Participate authentically (don't spam)</li>
                        <li>Answer wellness questions, offer helpful advice</li>
                        <li>Occasionally post service offerings (follow group rules)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">IndaStreet Profile: Your Professional Hub</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Complete Profile Optimization:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Professional Photos:</strong> 8-10 images (headshot, treatment room, certifications, work in action)</li>
                        <li><strong>Detailed Bio:</strong> Training, experience, specialties, philosophy (300+ words)</li>
                        <li><strong>All Services Listed:</strong> Clear descriptions, accurate pricing, duration</li>
                        <li><strong>Certifications Displayed:</strong> Upload credential photos for credibility</li>
                        <li><strong>Availability Calendar:</strong> Keep updated for instant bookings</li>
                        <li><strong>Response Time:</strong> Reply to inquiries within 1-2 hours (faster = more bookings)</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Reviews Drive Bookings:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>After great sessions: "I'd love if you could leave a review on IndaStreet—helps me reach more clients!"</li>
                        <li>Send direct link via WhatsApp</li>
                        <li><strong>Goal:</strong> 30+ reviews in first 6 months</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">WhatsApp Business: Direct Communication</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Professional Setup:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Business Profile:</strong> Add business name, services, hours, location, website</li>
                        <li><strong>Professional Photo:</strong> Same headshot as other platforms</li>
                        <li><strong>Away Messages:</strong> "Thanks for reaching out! I'll respond within 2 hours. For immediate booking, visit [link]"</li>
                        <li><strong>Quick Replies:</strong> Save templates for common questions (pricing, availability, directions)</li>
                        <li><strong>Catalog Feature:</strong> Display services with photos and prices</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Content Creation Tips</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Photography Guidelines:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Lighting:</strong> Natural light or warm lamps (avoid harsh flash)</li>
                        <li><strong>Backgrounds:</strong> Clean, uncluttered, spa-like atmosphere</li>
                        <li><strong>Angles:</strong> Eye-level shots, close-ups of hands/techniques, room overviews</li>
                        <li><strong>Privacy:</strong> ALWAYS get written client permission before posting treatment photos</li>
                        <li><strong>Professionalism:</strong> Clean linens, organized space, professional attire visible</li>
                    </ul>

                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Writing Engaging Captions:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Hook:</strong> Start with question or interesting fact</li>
                        <li><strong>Value:</strong> Share educational content or wellness tip</li>
                        <li><strong>Story:</strong> Client transformation (anonymous), personal experience</li>
                        <li><strong>Call-to-Action:</strong> "DM to book," "Link in bio," "Comment 'MASSAGE' for availability"</li>
                        <li><strong>Length:</strong> 100-200 words (readable in feed)</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">SEO for Massage Therapists</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Keyword Strategy:</h3>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Include these phrases naturally in all online content:
                    </p>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li>"Massage therapist in [location]" (Ubud, Seminyak, Canggu, Jakarta, etc.)</li>
                        <li>"Balinese massage [location]"</li>
                        <li>"Best massage [location]"</li>
                        <li>"Mobile massage [location]"</li>
                        <li>"Deep tissue massage [location]"</li>
                        <li>"Couples massage [location]"</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Client Retention Through Digital</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Stay Connected:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Follow-Up Messages:</strong> "Hope you're feeling great after yesterday's session! Remember to drink plenty of water 💧"</li>
                        <li><strong>Special Occasion Outreach:</strong> Birthday discounts, holiday greetings</li>
                        <li><strong>Educational Content:</strong> Share wellness tips via Instagram Stories/Facebook posts</li>
                        <li><strong>Exclusive Offers:</strong> "Instagram followers get 15% off this week"</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Common Mistakes to Avoid</h2>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Inconsistent Posting:</strong> Posting 10x one week, nothing for a month—kills momentum</li>
                        <li><strong>Poor Photo Quality:</strong> Blurry, dark, unprofessional images hurt credibility</li>
                        <li><strong>Ignoring Comments/Messages:</strong> Slow response time loses bookings to competitors</li>
                        <li><strong>Too Much Self-Promotion:</strong> 80% value/education, 20% promotional content</li>
                        <li><strong>Neglecting Reviews:</strong> Not asking for reviews, not responding to existing ones</li>
                        <li><strong>Incomplete Profiles:</strong> Missing information makes clients move on</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Measuring Success</h2>
                    <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">Key Metrics to Track:</h3>
                    <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                        <li><strong>Google My Business:</strong> Views, clicks, calls, direction requests</li>
                        <li><strong>Instagram:</strong> Follower growth, engagement rate, profile visits, link clicks</li>
                        <li><strong>IndaStreet:</strong> Profile views, booking inquiries, conversion rate</li>
                        <li><strong>Bookings:</strong> Percentage coming from online vs referrals</li>
                        <li><strong>Revenue:</strong> Monthly income trend since building online presence</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-6">Conclusion</h2>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Building a strong online presence requires consistent effort, but the payoff is substantial: more bookings, higher rates, better clients, and business stability. Start with the essentials—Google My Business, Instagram, and a complete IndaStreet profile—then expand from there.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        Remember: Your online presence is your digital storefront. Make it professional, engaging, and authentic. Clients are searching for you right now—make sure they find a therapist they can trust.
                    </p>
                    <p className="text-gray-700 mb-6 leading-relaxed">
                        With IndaStreet's platform connecting you to Indonesia's wellness tourism market, combine your optimized digital presence with our verified network to build the thriving practice you deserve.
                    </p>
                </div>

                <div className="mt-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white text-center">
                    <h3 className="text-2xl font-bold mb-4">Build Your Digital Presence Today</h3>
                    <p className="text-xl mb-6">Start with a complete IndaStreet profile</p>
                    <button 
                        onClick={() => onNavigate?.('registrationChoice')}
                        className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold hover:bg-orange-50 transition-colors"
                    >
                        Create Your Profile
                    </button>
                </div>
            </article>
        </div>
    );
};

export default OnlinePresenceMassageTherapistPage;
