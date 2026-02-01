// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import LoginDrawer from '../components/LoginDrawer';

interface CookiesPolicyPageProps {
    onBack: () => void;
    t: any;
}

const CookiesPolicyPage: React.FC<CookiesPolicyPageProps> = ({ onBack, t: _t }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            {/* Header matching HomePage */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <button 
                        onClick={() => setDrawerOpen(true)} 
                        className="text-gray-600 hover:text-gray-800"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* Login Drawer */}
            <LoginDrawer 
                isOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onNavigate={onBack}
            />

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-4xl pb-24">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">🍪</span>
                        <h2 className="text-2xl font-bold text-gray-900">Cookie Policy</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-6">Last updated: October 29, 2025</p>

                    {/* Introduction */}
                    <section className="mb-8">
                        <p className="text-gray-700 leading-relaxed mb-4">
                            This Cookie Policy explains how IndaStreet Massage ("we", "us", or "our") uses cookies and similar technologies to recognize you when you visit our platform. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
                        </p>
                    </section>

                    {/* What are cookies */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">What are cookies?</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            Cookies set by the website owner (in this case, IndaStreet Massage) are called "first party cookies". Cookies set by parties other than the website owner are called "third party cookies". Third party cookies enable third party features or functionality to be provided on or through the website (e.g., advertising, interactive content and analytics).
                        </p>
                    </section>

                    {/* Why we use cookies */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Why do we use cookies?</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use first party and third party cookies for several reasons. Some cookies are required for technical reasons in order for our platform to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies enable us to track and target the interests of our users to enhance the experience on our platform. Third parties serve cookies through our platform for advertising, analytics, and other purposes.
                        </p>
                    </section>

                    {/* Types of cookies we use */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Types of cookies we use</h3>
                        
                        <div className="space-y-4">
                            <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-bold text-gray-900 mb-2">Essential Cookies</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    These cookies are strictly necessary to provide you with services available through our platform and to use some of its features, such as access to secure areas. These include authentication cookies, session management, and security cookies.
                                </p>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-bold text-gray-900 mb-2">Performance and Analytics Cookies</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    These cookies allow us to count visits and traffic sources so we can measure and improve the performance of our platform. They help us understand which pages are the most and least popular and see how visitors move around the platform. All information these cookies collect is aggregated and therefore anonymous.
                                </p>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-bold text-gray-900 mb-2">Functionality Cookies</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    These cookies enable the platform to provide enhanced functionality and personalization. They may be set by us or by third party providers whose services we have added to our pages. If you do not allow these cookies, some or all of these services may not function properly.
                                </p>
                            </div>

                            <div className="border-l-4 border-orange-500 pl-4">
                                <h4 className="font-bold text-gray-900 mb-2">Targeting Cookies</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    These cookies may be set through our site by our advertising partners. They may be used by those companies to build a profile of your interests and show you relevant adverts on other sites. They work by uniquely identifying your browser and device.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* How to control cookies */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">How can you control cookies?</h3>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in the Cookie Consent Manager that appears when you first visit our platform.
                        </p>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our platform though your access to some functionality and areas of our platform may be restricted.
                        </p>
                        <p className="text-gray-700 leading-relaxed">
                            The specific types of first and third party cookies served through our platform and the purposes they perform are described in the table above.
                        </p>
                    </section>

                    {/* Updates to this policy */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Updates to this Cookie Policy</h3>
                        <p className="text-gray-700 leading-relaxed">
                            We may update this Cookie Policy from time to time in order to reflect changes to the cookies we use or for other operational, legal, or regulatory reasons. Please revisit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                        </p>
                    </section>

                    {/* Contact us */}
                    <section className="mb-8">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Us</h3>
                        <p className="text-gray-700 leading-relaxed">
                            If you have any questions about our use of cookies or other technologies, please contact us at:
                        </p>
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 font-semibold">IndaStreet Massage</p>
                            <p className="text-gray-700">Email: indastreet.id@gmail.com</p>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-gray-200 py-6 px-4 fixed bottom-0 left-0 right-0">
                <div className="container mx-auto max-w-4xl">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex gap-4 text-sm">
                            <button
                                onClick={onBack}
                                className="text-gray-600 hover:text-orange-500 transition-colors"
                            >
                                Back to Home
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                            © 2025 IndaStreet Massage. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-5px); }
                }
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default CookiesPolicyPage;
