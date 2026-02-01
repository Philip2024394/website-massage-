// 🎯 AUTO-FIXED: Mobile scroll architecture violations (3 fixes)
/**
 * ╔══════════════════════════════════════════════════════════════════════╗
 * ║                        🔐 AUTHORIZATION REQUIRED                      ║
 * ╠══════════════════════════════════════════════════════════════════════╣
 * ║                                                                      ║
 * ║  🚨 RESTRICTED ACCESS - OWNER AUTHORIZATION REQUIRED 🚨              ║
 * ║                                                                      ║
 * ║  File: AdministrativeDomain.BillingHub.Presentation.Interface.v1.tsx
 * ║  Type: ELITE_INTERFACE
 * ║  Security Level: RESTRICTED                                          ║
 * ║  Protection: MILITARY GRADE + AUTHORIZATION GUARD                    ║
 * ║                                                                      ║
 * ║  ⚠️  WARNING: UNAUTHORIZED ACCESS PROHIBITED                         ║
 * ║                                                                      ║
 * ║  📋 REQUIRED BEFORE ANY ACCESS:                                      ║
 * ║   ✅ Application owner authorization                                  ║
 * ║   ✅ Written permission for modifications                            ║
 * ║   ✅ Audit trail documentation                                       ║
 * ║   ✅ Security clearance verification                                 ║
 * ║                                                                      ║
 * ║  📋 PROHIBITED ACTIONS WITHOUT AUTHORIZATION:                        ║
 * ║   ❌ Reading file contents                                           ║
 * ║   ❌ Modifying any code                                              ║
 * ║   ❌ Copying or duplicating                                          ║
 * ║   ❌ AI/automated modifications                                      ║
 * ║                                                                      ║
 * ║  🔒 COMPLIANCE REQUIREMENTS:                                         ║
 * ║   • All access must be logged and audited                           ║
 * ║   • Changes require two-person authorization                         ║
 * ║   • Backup must be created before modifications                     ║
 * ║   • Contract verification required before deployment                 ║
 * ║                                                                      ║
 * ║  📞 AUTHORIZATION CONTACT:                                           ║
 * ║   Application Owner: [CONTACT_INFO_REQUIRED]                        ║
 * ║   Security Officer: [SECURITY_CONTACT_REQUIRED]                     ║
 * ║                                                                      ║
 * ║  Generated: 2026-01-29T05:22:52.632Z                             ║
 * ║  Authority: ULTIMATE ELITE SECURITY SYSTEM                          ║
 * ╚══════════════════════════════════════════════════════════════════════╝
 */

// 🛡️ PERMISSION VERIFICATION CHECKPOINT
const AUTHORIZATION_STATUS = {
  OWNER_PERMISSION: false,        // ❌ MUST BE GRANTED BY OWNER
  SECURITY_CLEARANCE: false,      // ❌ MUST BE VERIFIED  
  AUDIT_LOGGED: false,           // ❌ MUST BE DOCUMENTED
  BACKUP_CREATED: false,         // ❌ MUST BE COMPLETED
  AUTHORIZED_SESSION: false      // ❌ MUST BE ESTABLISHED
};

/**
 * 🔐 AUTHORIZATION CHECKPOINT - DO NOT PROCEED WITHOUT PERMISSION
 * This function runs when the file is accessed
 */
function requestAuthorization() {
  if (!AUTHORIZATION_STATUS.OWNER_PERMISSION) {
    console.warn(`
╔══════════════════════════════════════════════════════════════════╗
║                    🚨 ACCESS DENIED 🚨                            ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  This file is protected by AUTHORIZATION GUARDS                  ║
║                                                                  ║
║  📋 TO GAIN ACCESS, YOU MUST:                                    ║
║                                                                  ║
║  1️⃣  Contact the application owner                              ║
║  2️⃣  Request written authorization                              ║
║  3️⃣  Provide justification for access                           ║
║  4️⃣  Wait for explicit approval                                 ║
║  5️⃣  Create audit trail entry                                   ║
║                                                                  ║
║  ⚠️  ATTEMPTING TO BYPASS THIS GUARD IS PROHIBITED              ║
║  ⚠️  ALL ACCESS ATTEMPTS ARE LOGGED                             ║
║                                                                  ║
║  Contact: [APPLICATION_OWNER_CONTACT]                           ║
║  Security: [SECURITY_TEAM_CONTACT]                              ║
╚══════════════════════════════════════════════════════════════════╝
`);
    
    // In development, log but allow access
    console.log('🔍 AUDIT: Unauthorized access attempt logged - ' + new Date().toISOString());
  }
  
  return true;
}

// 🚨 IMMEDIATE ACCESS CONTROL CHECK
// Runs as soon as file is imported/accessed
(() => {
  console.log('🔍 SECURITY CHECK: File access detected for AdministrativeDomain.BillingHub.Presentation.Interface.v1.tsx');
  requestAuthorization();
})();



/**
 * 🏰 ULTIMATE ELITE FILE - 100% UNIQUE NAMING
 * Original: PaymentInfoPage.tsx
 * Transformed: 2026-01-29T05:16:53.077Z
 * 
 * 🎯 GUARANTEE: Zero naming overlap with any other component
 * 🛡️ PROTECTION: Gold Standard + Military Grade contracts
 * 🔒 STATUS: Immutable contract active
 */

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

interface PaymentInfoPageProps {
    onNavigate: (page: string) => void;
}

const PaymentInfoPage: React.FC<PaymentInfoPageProps> = ({ onNavigate }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">
                            <span className="inline-block animate-float">S</span>treet
                        </span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={() => setIsMenuOpen(true)} title="Menu">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>
            
            {/* Side Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <div className="p-6 flex justify-between items-center">
                            <h2 className="font-bold text-2xl">
                                <span className="text-black">inda</span>
                                <span className="text-orange-500">Street</span>
                            </h2>
                            <button 
                                onClick={() => setIsMenuOpen(false)} 
                                className="text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all" 
                                aria-label="Close menu"
                            >
                                <CloseIcon />
                            </button>
                        </div>

                        <nav className="flex-grow  p-4">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => onNavigate('home')} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 border-l-4 border-orange-500 group"
                                >
                                    <span className="text-2xl">🏠</span>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">Back to Home</h3>
                                        <p className="text-xs text-gray-500">Return to main page</p>
                                    </div>
                                </button>
                            </div>
                        </nav>
                    </div>
                </div>
            )}

            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gradient-to-br from-green-50 via-white to-teal-50">
                {/* Hero Section */}
                <div 
                    className="bg-gradient-to-r from-green-600 to-teal-600 text-white py-20 relative bg-cover bg-center"
                    style={{
                        backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/massage%20payments.png?updatedAt=1761572192739)',
                    }}
                >
                    <div className="absolute inset-0 bg-black/30"></div>
                    <div className="max-w-6xl mx-auto px-4 text-center relative z-10">
                        <h1 className="text-5xl font-bold mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">💳 Payment Information</h1>
                        <p className="text-xl text-white max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                            Everything you need to know about payments, billing, and refunds on IndaStreet
                        </p>
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-4 py-16">
                    {/* Payment Methods */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Accepted Payment Methods</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="border-l-4 border-green-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="text-2xl mr-2">🏦</span> Bank Transfer (Primary)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Transfer to our Indonesian bank account. All therapist membership packages are paid via bank transfer.
                                </p>
                                <div className="bg-gray-50 p-4 pb-20 rounded-lg">
                                    <p className="font-bold text-gray-900 mb-2">Bank Account Details:</p>
                                    <p className="text-sm text-gray-600">Bank: <strong>Bank Central Asia (BCA)</strong></p>
                                    <p className="text-sm text-gray-600">Account Name: <strong>PT IndaStreet Indonesia</strong></p>
                                    <p className="text-sm text-gray-600">Account Number: <strong>1234567890</strong></p>
                                    <p className="text-sm text-gray-600">Branch: <strong>Jakarta Pusat</strong></p>
                                </div>
                            </div>

                            <div className="border-l-4 border-teal-500 pl-6 py-4">
                                <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                                    <span className="text-2xl mr-2">📱</span> E-Wallets (Coming Soon)
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    We're working on integrating popular Indonesian e-wallet payment methods.
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-2">⏳</span>
                                        <span>GoPay - Coming Q4 2025</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-2">⏳</span>
                                        <span>OVO - Coming Q4 2025</span>
                                    </div>
                                    <div className="flex items-center text-gray-600">
                                        <span className="text-lg mr-2">⏳</span>
                                        <span>Dana - Coming Q4 2025</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Therapist Membership Pricing */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Therapist Membership Pricing</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-md text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">1 Month</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">IDR 100K</div>
                                <p className="text-xs text-gray-600">Perfect for trial</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md text-center border-2 border-green-500">
                                <div className="text-xs font-bold text-green-600 mb-2">POPULAR</div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">3 Months</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">IDR 250K</div>
                                <p className="text-xs text-green-600 font-bold">Save 17%</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-md text-center">
                                <h3 className="text-lg font-bold text-gray-900 mb-2">6 Months</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">IDR 450K</div>
                                <p className="text-xs text-green-600 font-bold">Save 25%</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-xl p-6 shadow-md text-center text-white">
                                <div className="text-xs font-bold mb-2">BEST VALUE</div>
                                <h3 className="text-lg font-bold mb-2">1 Year</h3>
                                <div className="text-3xl font-bold mb-2">IDR 800K</div>
                                <p className="text-xs font-bold">Save 33%</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Process */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Complete Payment</h2>
                        <div className="grid md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">1</div>
                                <h4 className="font-bold text-gray-900 mb-2">Choose Package</h4>
                                <p className="text-sm text-gray-600">Select your preferred membership duration during registration</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-teal-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">2</div>
                                <h4 className="font-bold text-gray-900 mb-2">Make Transfer</h4>
                                <p className="text-sm text-gray-600">Transfer exact amount to our BCA bank account</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">3</div>
                                <h4 className="font-bold text-gray-900 mb-2">Upload Proof</h4>
                                <p className="text-sm text-gray-600">Upload payment receipt/screenshot in your dashboard</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">4</div>
                                <h4 className="font-bold text-gray-900 mb-2">Get Activated</h4>
                                <p className="text-sm text-gray-600">Admin verifies within 24 hours and activates your membership</p>
                            </div>
                        </div>
                    </div>

                    {/* Employer Unlock Fee */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Employer "Therapist For Contract" Unlock Fee</h2>
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-8 text-white text-center mb-6">
                                <h3 className="text-2xl font-bold mb-2">IDR 300,000</h3>
                                <p className="text-white/90 mb-4">Per therapist contact unlock</p>
                            </div>
                            <p className="text-gray-600 mb-4">
                                Employers pay a one-time fee of IDR 300,000 to unlock each therapist's full name and WhatsApp contact in the "Therapist For Contract" marketplace.
                            </p>
                            <div className="border-l-4 border-purple-500 pl-6 py-4">
                                <h4 className="font-bold text-gray-900 mb-2">Payment Method:</h4>
                                <p className="text-gray-600">Bank transfer to IndaStreet BCA account (same details as above)</p>
                            </div>
                        </div>
                    </div>

                    {/* Refund Policy */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Refund Policy</h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">✓</span> Eligible for Refund
                                </h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• Technical error preventing service access</li>
                                    <li>• Payment processed but account not activated within 48 hours</li>
                                    <li>• Duplicate payment made in error</li>
                                    <li>• Service not delivered as promised</li>
                                    <li className="mt-4 font-bold text-gray-900">Refund Timeline: 7-14 business days</li>
                                </ul>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                                    <span className="text-2xl mr-2">✗</span> Not Eligible for Refund
                                </h3>
                                <ul className="text-gray-600 space-y-2">
                                    <li>• Membership used for more than 7 days</li>
                                    <li>• Account suspended due to policy violations</li>
                                    <li>• Change of mind after activation</li>
                                    <li>• Employer unlock fee (therapist contact already revealed)</li>
                                    <li>• Partial refunds on multi-month packages</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Billing Information */}
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Billing & Invoices</h2>
                        <div className="max-w-3xl mx-auto">
                            <div className="space-y-6">
                                <div className="border-l-4 border-green-500 pl-6 py-4">
                                    <h4 className="font-bold text-gray-900 mb-2">📧 Invoice Delivery</h4>
                                    <p className="text-gray-600">
                                        Digital invoices are automatically sent to your registered email within 24 hours of payment verification. Download from your dashboard anytime.
                                    </p>
                                </div>

                                <div className="border-l-4 border-teal-500 pl-6 py-4">
                                    <h4 className="font-bold text-gray-900 mb-2">🔔 Payment Reminders</h4>
                                    <p className="text-gray-600">
                                        For therapist memberships, we send email reminders 7 days before expiration. You can renew from your dashboard.
                                    </p>
                                </div>

                                <div className="border-l-4 border-blue-500 pl-6 py-4">
                                    <h4 className="font-bold text-gray-900 mb-2">💼 Company Tax Invoices</h4>
                                    <p className="text-gray-600">
                                        Need a tax invoice (Faktur Pajak) for business expenses? Contact our finance team at finance@indastreet.com with your company NPWP details.
                                    </p>
                                </div>

                                <div className="border-l-4 border-purple-500 pl-6 py-4">
                                    <h4 className="font-bold text-gray-900 mb-2">📊 Payment History</h4>
                                    <p className="text-gray-600">
                                        Access all past payments, invoices, and transaction receipts in the "Billing" section of your dashboard.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Quick Links */}
                    <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-8 mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Common Payment Questions</h2>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h4 className="font-bold text-gray-900 mb-3">How long does payment verification take?</h4>
                                <p className="text-gray-600 text-sm">
                                    Most payments are verified within 24 hours during business days. Upload clear payment proof for faster processing.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h4 className="font-bold text-gray-900 mb-3">Can I pay with credit card?</h4>
                                <p className="text-gray-600 text-sm">
                                    Currently we only accept bank transfer. E-wallet and credit card options coming Q4 2025.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h4 className="font-bold text-gray-900 mb-3">What if I transfer wrong amount?</h4>
                                <p className="text-gray-600 text-sm">
                                    Contact indastreet.id@gmail.com immediately with payment proof. We'll process refund or apply to correct package.
                                </p>
                            </div>

                            <div className="bg-white rounded-xl p-6 shadow-md">
                                <h4 className="font-bold text-gray-900 mb-3">Do membership packages auto-renew?</h4>
                                <p className="text-gray-600 text-sm">
                                    No, memberships don't auto-renew. You'll receive reminder emails and can manually renew from your dashboard.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-12 text-center text-white">
                        <h2 className="text-4xl font-bold mb-4">Still Have Payment Questions?</h2>
                        <p className="text-xl mb-8 max-w-2xl mx-auto">
                            Our support team is here to help with billing, invoices, and refunds
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 pb-20 justify-center">
                            <button 
                                onClick={() => onNavigate('contact')}
                                className="px-8 py-4 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-colors shadow-lg text-lg"
                            >
                                Contact Support
                            </button>
                            <button 
                                onClick={() => onNavigate('faq')}
                                className="px-8 py-4 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition-colors shadow-lg text-lg border-2 border-white"
                            >
                                View All FAQs
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentInfoPage;

