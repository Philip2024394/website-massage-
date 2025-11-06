import React from 'react';

const TherapistTermsPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto p-4 pb-20 sm:p-6 bg-white rounded-lg shadow-lg">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"><span className="text-black">Inda</span>Street Therapist Terms of Service</h1>
                <p className="text-xs sm:text-sm text-gray-500">Last Updated: October 2025</p>
            </div>

            {/* Professional Standards */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>✨</span> <span className="break-words">Professional Standards</span>
                </h2>
                <div className="space-y-3 text-gray-700 text-sm sm:text-base">
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 pb-20">
                        <p className="font-semibold mb-2">Appearance & Hygiene</p>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm break-words">
                            <li>Clean, trimmed nails are mandatory at all times</li>
                            <li>Professional dress code must be maintained during all sessions</li>
                            <li>Personal hygiene and grooming standards must be impeccable</li>
                            <li>Arrive at appointments well-presented and prepared</li>
                        </ul>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 pb-20">
                        <p className="font-semibold mb-2">Service Quality</p>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm break-words">
                            <li>Clean, trimmed nails are mandatory at all times</li>
                            <li>Professional dress code must be maintained during all sessions</li>
                            <li>Personal hygiene and grooming standards must be impeccable</li>
                            <li>Arrive at appointments well-presented and prepared</li>
                        </ul>
                    </div>
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 pb-20">
                        <p className="font-semibold mb-2">Service Quality</p>
                        <ul className="list-disc list-inside space-y-1 text-xs sm:text-sm break-words">
                            <li>Provide professional massage services as advertised</li>
                            <li>Maintain punctuality and reliability for all bookings</li>
                            <li>Use appropriate massage techniques and pressure</li>
                            <li>Respect client privacy and confidentiality at all times</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* Profile Image Requirements */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>📸</span> <span className="break-words">Profile Image Requirements</span>
                </h2>
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-3 sm:p-4 pb-20">
                    <ul className="space-y-2 text-gray-700 text-xs sm:text-sm break-words">
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-green-600">✓</span>
                            <span><strong>REQUIRED:</strong> Your profile image MUST show your face clearly - side view or front view only</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-red-600">✗</span>
                            <span><strong>NOT ALLOWED:</strong> Images that do not represent you as the therapist</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold text-red-600">⚠</span>
                            <span><strong>WARNING:</strong> Accounts with inappropriate or non-representative images will be <strong>BLOCKED</strong> without notice until corrected</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="font-bold">📸</span>
                            <span>Professional photos showing the therapist clearly are mandatory for live profiles</span>
                        </li>
                    </ul>
                </div>
            </section>

            {/* Employment Status */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>💼</span> <span className="break-words">Employment & Tax</span>
                </h2>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 sm:p-4 pb-20">
                    <p className="font-semibold mb-3 text-gray-900 text-sm sm:text-base">Self-Employed Status</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-xs sm:text-sm break-words">
                        <li><strong>Independent Contractor:</strong> You work as a self-employed, independent contractor, NOT as an employee of <span className="text-black">Inda</span>Street</li>
                        <li><strong>Tax Obligations:</strong> All government taxes, fees, and financial obligations are YOUR sole responsibility</li>
                        <li><strong>Business Registration:</strong> You are responsible for any required business licenses or permits in your jurisdiction</li>
                        <li><strong>Income Reporting:</strong> You must report all income to relevant tax authorities as required by law</li>
                        <li><strong>Insurance:</strong> <span className="text-black">Inda</span>Street does not provide insurance coverage; you are responsible for your own liability insurance</li>
                        <li><strong>No Employment Benefits:</strong> As an independent contractor, you are not entitled to employee benefits</li>
                    </ul>
                </div>
            </section>

            {/* Booking Cancellation Rights */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>🛡️</span> <span className="break-words">Your Rights & Safety</span>
                </h2>
                <div className="bg-green-50 border-l-4 border-green-500 p-3 sm:p-4 pb-20">
                    <p className="font-semibold mb-3 text-gray-900 text-sm sm:text-base">Right to Refuse Service</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-xs sm:text-sm break-words">
                        <li><strong>Safety First:</strong> You have the absolute right to cancel ANY booking if you feel uncomfortable or unsafe</li>
                        <li><strong>No Penalties:</strong> Cancelling for safety reasons will NOT affect your status or standing with <span className="text-black">Inda</span>Street</li>
                        <li><strong>Immediate Support:</strong> Contact <span className="text-black">Inda</span>Street admin immediately if you encounter any issues</li>
                        <li><strong>Professional Environment:</strong> You have the right to work in a safe, respectful environment</li>
                        <li><strong>Harassment Policy:</strong> Zero tolerance for client harassment or inappropriate behavior</li>
                    </ul>
                </div>
            </section>

            {/* Account Deactivation Policy */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>⚠️</span> <span className="break-words">Account Deactivation</span>
                </h2>
                <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 pb-20">
                    <p className="font-semibold mb-3 text-gray-900 text-sm sm:text-base break-words">Grounds for Immediate Deactivation (Without Notice)</p>
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-xs sm:text-sm break-words">
                        <li><strong>Unprofessional Service:</strong> Failure to provide professional massage services as advertised</li>
                        <li><strong>Customer Complaints:</strong> Multiple verified complaints about service quality or conduct</li>
                        <li><strong>Inappropriate Behavior:</strong> Any inappropriate, unprofessional, or illegal conduct</li>
                        <li><strong>Hygiene Violations:</strong> Repeated violations of hygiene and appearance standards</li>
                        <li><strong>False Information:</strong> Providing false credentials, photos, or misrepresenting your services</li>
                        <li><strong>No-Shows:</strong> Repeated failure to honor confirmed bookings without valid reason</li>
                        <li><strong>Terms Violations:</strong> Any violation of these Terms of Service</li>
                    </ul>
                </div>
            </section>

            {/* Payment & Fees */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>💰</span> <span className="break-words">Payment & Fees</span>
                </h2>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 sm:p-4 pb-20">
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-xs sm:text-sm break-words">
                        <li>You receive payments directly from clients via WhatsApp/cash arrangements</li>
                        <li>IndoStreet membership fees are separate from client payments</li>
                        <li>You set your own pricing for services (60min, 90min, 120min sessions)</li>
                        <li>All prices displayed must be accurate and honored for bookings</li>
                    </ul>
                </div>
            </section>

            {/* Privacy & Data */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>🔒</span> <span className="break-words">Privacy & Client Data</span>
                </h2>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-3 sm:p-4 pb-20">
                    <ul className="list-disc list-inside space-y-2 text-gray-700 text-xs sm:text-sm break-words">
                        <li>Respect client privacy and confidentiality at all times</li>
                        <li>Do not share client contact information or booking details with third parties</li>
                        <li>Use client data only for providing massage services</li>
                        <li>Comply with all applicable data protection regulations</li>
                    </ul>
                </div>
            </section>

            {/* Additional Requirements */}
            <section className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl font-semibold text-orange-600 mb-3 sm:mb-4 flex items-center gap-2">
                    <span>📋</span> <span className="break-words">Additional Requirements</span>
                </h2>
                <div className="space-y-3 text-gray-700 text-xs sm:text-sm">
                    <div className="bg-gray-50 p-3 sm:p-4 pb-20 rounded">
                        <p className="font-semibold mb-2 break-words">Equipment & Supplies</p>
                        <p className="break-words">You are responsible for bringing your own massage table, oils, linens, and all necessary equipment</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 pb-20 rounded">
                        <p className="font-semibold mb-2 break-words">Location Services</p>
                        <p className="break-words">Your location must be accurate and updated. False location information may result in account suspension</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 pb-20 rounded">
                        <p className="font-semibold mb-2 break-words">Response Time</p>
                        <p className="break-words">Maintain reasonable response times to client inquiries via WhatsApp</p>
                    </div>
                    <div className="bg-gray-50 p-3 sm:p-4 pb-20 rounded">
                        <p className="font-semibold mb-2 break-words">Certification</p>
                        <p className="break-words">While not mandatory, professional massage certification is highly recommended and may be required in certain jurisdictions</p>
                    </div>
                </div>
            </section>

            {/* Agreement */}
            <section className="mb-6 sm:mb-8">
                <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4 pb-20 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 break-words">Agreement</h3>
                    <p className="text-gray-700 mb-4 text-xs sm:text-sm break-words">
                        By maintaining an active account on the IndoStreet platform, you acknowledge that you have read, understood, and agree to comply with all terms outlined in this Terms of Service agreement.
                    </p>
                    <p className="text-gray-700 font-semibold text-xs sm:text-sm break-words">
                        IndoStreet reserves the right to update these terms at any time. Continued use of the platform constitutes acceptance of any modifications.
                    </p>
                </div>
            </section>

            {/* Contact */}
            <section className="text-center py-4 sm:py-6 border-t border-gray-200">
                <p className="text-gray-600 mb-2 text-xs sm:text-sm break-words">Questions about these terms?</p>
                <p className="text-orange-600 font-semibold text-sm sm:text-base break-words">Contact IndoStreet Admin via WhatsApp</p>
            </section>
        </div>
    );
};

export default TherapistTermsPage;

