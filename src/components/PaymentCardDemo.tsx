// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import PaymentCard from './PaymentCard';
import BankDetailsForm from './BankDetailsForm';

/**
 * Demo component showing the complete payment card flow
 * This demonstrates how the payment system works for therapists
 */
const PaymentCardDemo: React.FC = () => {
    const [bankDetails, setBankDetails] = useState({
        bankName: 'BCA (Bank Central Asia)',
        accountHolderName: 'JOHN DOE THERAPIST',
        accountNumber: '1234567890123456'
    });
    
    const [showForm, setShowForm] = useState(false);
    const [demoStep, setDemoStep] = useState<'card' | 'form' | 'chat'>('card');

    const handleSaveBankDetails = async (details: typeof bankDetails) => {
        console.log('💾 Saving bank details:', details);
        setBankDetails(details);
        setShowForm(false);
        // In real app, this would save to database
        alert('Bank details saved successfully!');
    };

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-6">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        💳 <span className="text-orange-600">IndaStreet</span> Payment System
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Beautiful credit card-style payment information for therapists. 
                        Auto-shared on booking acceptance and manual sharing in chat.
                    </p>
                </div>

                {/* Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200">
                        <div className="flex gap-2">
                            <button
                                onClick={() => setDemoStep('card')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    demoStep === 'card'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                💳 Payment Card
                            </button>
                            <button
                                onClick={() => setDemoStep('form')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    demoStep === 'form'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                📝 Bank Setup
                            </button>
                            <button
                                onClick={() => setDemoStep('chat')}
                                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                                    demoStep === 'chat'
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                💬 Chat Integration
                            </button>
                        </div>
                    </div>
                </div>

                {/* Demo Content */}
                {demoStep === 'card' && (
                    <div className="space-y-8">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Card Showcase</h2>
                            <p className="text-gray-600">Different sizes and how they appear to customers</p>
                        </div>
                        
                        {/* Card Sizes */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="text-center">
                                <h3 className="font-bold text-gray-900 mb-4">Small (Chat)</h3>
                                <PaymentCard
                                    bankName={bankDetails.bankName}
                                    accountHolderName={bankDetails.accountHolderName}
                                    accountNumber={bankDetails.accountNumber}
                                    size="small"
                                />
                            </div>
                            
                            <div className="text-center">
                                <h3 className="font-bold text-gray-900 mb-4">Medium (Default)</h3>
                                <PaymentCard
                                    bankName={bankDetails.bankName}
                                    accountHolderName={bankDetails.accountHolderName}
                                    accountNumber={bankDetails.accountNumber}
                                    size="medium"
                                />
                            </div>
                            
                            <div className="text-center">
                                <h3 className="font-bold text-gray-900 mb-4">Large (Profile)</h3>
                                <PaymentCard
                                    bankName={bankDetails.bankName}
                                    accountHolderName={bankDetails.accountHolderName}
                                    accountNumber={bankDetails.accountNumber}
                                    size="large"
                                />
                            </div>
                        </div>
                        
                        {/* Features */}
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                                <div className="text-4xl mb-3">🎨</div>
                                <h3 className="font-bold text-gray-900 mb-2">Beautiful Design</h3>
                                <p className="text-sm text-gray-600">Credit card-style with gradients, EMV chip, and IndaStreet branding</p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                                <div className="text-4xl mb-3">📱</div>
                                <h3 className="font-bold text-gray-900 mb-2">Responsive</h3>
                                <p className="text-sm text-gray-600">Three sizes: small (chat), medium (default), large (profile)</p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                                <div className="text-4xl mb-3">🔒</div>
                                <h3 className="font-bold text-gray-900 mb-2">Secure</h3>
                                <p className="text-sm text-gray-600">Auto-formatted account numbers with security features</p>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center">
                                <div className="text-4xl mb-3">⚡</div>
                                <h3 className="font-bold text-gray-900 mb-2">Auto-Share</h3>
                                <p className="text-sm text-gray-600">Automatically sent when accepting scheduled bookings</p>
                            </div>
                        </div>
                    </div>
                )}

                {demoStep === 'form' && (
                    <div>
                        <BankDetailsForm
                            therapistId="demo-therapist-123"
                            initialBankDetails={bankDetails}
                            onSave={handleSaveBankDetails}
                        />
                    </div>
                )}

                {demoStep === 'chat' && (
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Chat Integration</h2>
                            <p className="text-gray-600 mb-6">How payment cards work in the chat system</p>
                        </div>
                        
                        {/* Chat Flow Demo */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Auto-Share */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <div className="text-center mb-4">
                                    <div className="text-3xl mb-2">🤖</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Auto-Share on Acceptance</h3>
                                    <p className="text-sm text-gray-600">When therapist accepts scheduled booking</p>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span className="text-sm">Customer sends booking request</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span className="text-sm">Therapist accepts booking</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                        <span className="text-sm font-semibold">💳 Payment card auto-sent!</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Manual Share */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                                <div className="text-center mb-4">
                                    <div className="text-3xl mb-2">👆</div>
                                    <h3 className="font-bold text-gray-900 mb-2">Manual Share Button</h3>
                                    <p className="text-sm text-gray-600">Therapist can share anytime during chat</p>
                                </div>
                                
                                <div className="space-y-4">
                                    <button className="w-full text-left text-sm text-orange-600 font-semibold flex items-center gap-2 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                                        💳 Bagikan Info Pembayaran
                                    </button>
                                    
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <PaymentCard
                                            bankName={bankDetails.bankName}
                                            accountHolderName={bankDetails.accountHolderName}
                                            accountNumber={bankDetails.accountNumber}
                                            size="small"
                                        />
                                        <button className="w-full mt-2 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg">
                                            📤 Kirim ke Customer
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Requirements */}
                        <div className="mt-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-2xl">⚠️</div>
                                <h3 className="font-bold text-amber-900">Important Requirements</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-semibold text-amber-900 mb-2">For Scheduled Bookings:</h4>
                                    <ul className="text-sm text-amber-800 space-y-1">
                                        <li>• Bank details MUST be filled</li>
                                        <li>• Cannot accept without payment info</li>
                                        <li>• Auto-sent after acceptance</li>
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-amber-900 mb-2">For Immediate Bookings:</h4>
                                    <ul className="text-sm text-amber-800 space-y-1">
                                        <li>• Bank details optional</li>
                                        <li>• Manual share available</li>
                                        <li>• Payment handled in person</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentCardDemo;