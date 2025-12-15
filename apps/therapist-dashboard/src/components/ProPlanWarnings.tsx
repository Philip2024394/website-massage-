/**
 * Pro Plan Terms & Warnings Component
 * 
 * Displays strict rules and consequences for Pro members
 * regarding platform circumvention and payment requirements
 */

import React from 'react';
import { AlertTriangle, Ban, DollarSign, ShieldAlert } from 'lucide-react';

interface ProPlanWarningsProps {
    therapistName?: string;
    showFullTerms?: boolean;
}

export const ProPlanWarnings: React.FC<ProPlanWarningsProps> = ({ 
    therapistName = 'Member',
    showFullTerms = true 
}) => {
    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Critical Warning Banner */}
            <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                    <AlertTriangle className="w-8 h-8 text-red-600 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-red-900 mb-3">
                            ⚠️ CRITICAL: Pro Member Operating Rules
                        </h2>
                        <p className="text-red-800 font-semibold mb-4">
                            Hello {therapistName}, you are currently on the <span className="bg-red-200 px-2 py-1 rounded">PRO PLAN (30% Commission)</span>
                        </p>
                        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-4">
                            <p className="text-red-900 font-bold text-lg mb-2">
                                🚨 ZERO TOLERANCE POLICY
                            </p>
                            <p className="text-red-800">
                                Operating outside the Indastreet platform will result in <span className="underline font-bold">IMMEDIATE AND PERMANENT</span> consequences with NO appeals or refunds.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {showFullTerms && (
                <>
                    {/* Prohibited Actions */}
                    <div className="bg-white border-2 border-orange-500 rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <Ban className="w-7 h-7 text-orange-600 flex-shrink-0" />
                            <h3 className="text-xl font-bold text-gray-900">Strictly Prohibited Actions</h3>
                        </div>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3">
                                <span className="text-red-600 font-bold">❌</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Contacting customers outside Indastreet platform</p>
                                    <p className="text-sm text-gray-600">No WhatsApp, phone calls, SMS, or any external communication</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-600 font-bold">❌</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Arranging future bookings directly with customers</p>
                                    <p className="text-sm text-gray-600">All bookings must go through Indastreet platform</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-600 font-bold">❌</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Sharing your personal contact information</p>
                                    <p className="text-sm text-gray-600">Business cards, phone numbers, social media handles</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-600 font-bold">❌</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Requesting customer WhatsApp number</p>
                                    <p className="text-sm text-gray-600">Pro members do NOT have access to customer WhatsApp</p>
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-red-600 font-bold">❌</span>
                                <div>
                                    <p className="font-semibold text-gray-900">Avoiding commission payments</p>
                                    <p className="text-sm text-gray-600">All bookings require 30% commission payment within 3 hours</p>
                                </div>
                            </li>
                        </ul>
                    </div>

                    {/* Consequences */}
                    <div className="bg-gradient-to-br from-red-900 to-red-700 text-white rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <ShieldAlert className="w-7 h-7 flex-shrink-0" />
                            <h3 className="text-xl font-bold">Immediate Consequences (No Warnings)</h3>
                        </div>
                        <div className="space-y-3 bg-red-800 bg-opacity-50 rounded-lg p-4">
                            <div className="flex items-start gap-2">
                                <span className="font-bold">1.</span>
                                <div>
                                    <p className="font-semibold">Permanent Account Deactivation</p>
                                    <p className="text-sm text-red-100">Account terminated immediately with no reactivation option</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold">2.</span>
                                <div>
                                    <p className="font-semibold">WhatsApp Number Permanently Blocked</p>
                                    <p className="text-sm text-red-100">Cannot create new account with same number</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold">3.</span>
                                <div>
                                    <p className="font-semibold">Identity Blacklisted</p>
                                    <p className="text-sm text-red-100">ID card, bank account, and phone blocked from platform</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold">4.</span>
                                <div>
                                    <p className="font-semibold">No Refunds or Appeals</p>
                                    <p className="text-sm text-red-100">All decisions are final and non-negotiable</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold">5.</span>
                                <div>
                                    <p className="font-semibold">Legal Action May Be Taken</p>
                                    <p className="text-sm text-red-100">Contract breach, revenue theft, fraud prosecution</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Requirements */}
                    <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <DollarSign className="w-7 h-7 text-blue-600 flex-shrink-0" />
                            <h3 className="text-xl font-bold text-gray-900">Payment Requirements (30% Commission)</h3>
                        </div>
                        <div className="space-y-3">
                            <div className="bg-white border border-blue-200 rounded-lg p-4">
                                <p className="font-semibold text-gray-900 mb-2">⏱️ 3-Hour Payment Deadline</p>
                                <p className="text-gray-700 text-sm">
                                    After each booking, you have 3 hours to upload payment proof. Failure to pay will result in:
                                </p>
                                <ul className="mt-2 ml-6 text-sm text-gray-600 list-disc">
                                    <li>Account status changed to "BUSY"</li>
                                    <li>No new bookings received until payment made</li>
                                    <li>Customers see you as unavailable</li>
                                </ul>
                            </div>
                            <div className="bg-white border border-blue-200 rounded-lg p-4">
                                <p className="font-semibold text-gray-900 mb-2">🚫 Booking Blocked Until Payment</p>
                                <p className="text-gray-700 text-sm">
                                    You CANNOT accept new bookings if you have unpaid commissions from previous bookings. Pay immediately to continue receiving bookings.
                                </p>
                            </div>
                            <div className="bg-white border border-blue-200 rounded-lg p-4">
                                <p className="font-semibold text-gray-900 mb-2">⏰ 5-Minute Acceptance Window</p>
                                <p className="text-gray-700 text-sm">
                                    When you receive a booking notification, you have 5 minutes to accept or reject. If no response, the booking goes to other therapists.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade to Plus CTA */}
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white rounded-lg p-6">
                        <h3 className="text-2xl font-bold mb-3">💡 Want Freedom? Upgrade to PLUS Plan</h3>
                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <p className="font-bold mb-2">✅ Rp 250,000/month</p>
                                <p className="text-sm">Fixed monthly fee, no commission</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <p className="font-bold mb-2">✅ Customer WhatsApp Access</p>
                                <p className="text-sm">Direct contact immediately</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <p className="font-bold mb-2">✅ 0% Commission</p>
                                <p className="text-sm">Keep 100% of your earnings</p>
                            </div>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4">
                                <p className="font-bold mb-2">✅ No Payment Deadlines</p>
                                <p className="text-sm">No restrictions or tracking</p>
                            </div>
                        </div>
                        <button className="w-full bg-white text-purple-700 font-bold py-3 rounded-lg hover:bg-purple-50 transition-colors">
                            Upgrade to Plus Plan Now
                        </button>
                    </div>

                    {/* Monitoring Notice */}
                    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                            <span className="font-bold">📹 Platform Monitoring:</span> All communications through Indastreet are monitored for quality assurance and policy compliance. Violations are detected automatically and manually reviewed.
                        </p>
                    </div>
                </>
            )}

            {/* Agreement Checkbox (if used in signup flow) */}
            <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                        type="checkbox" 
                        className="mt-1 w-5 h-5 text-orange-600 focus:ring-orange-500"
                        required
                    />
                    <span className="text-gray-900">
                        <span className="font-bold">I have read and agree to all Pro Plan terms and conditions above.</span> I understand that violating these terms will result in immediate and permanent account deactivation, WhatsApp blocking, and identity blacklisting with no appeals or refunds.
                    </span>
                </label>
            </div>
        </div>
    );
};

export default ProPlanWarnings;
