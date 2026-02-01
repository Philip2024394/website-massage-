// 🎯 AUTO-FIXED: Mobile scroll architecture violations (8 fixes)
import React, { useState, useEffect } from 'react';
import { databases } from '../lib/appwrite';
import { Query } from 'appwrite';
import { Building2, User, Send } from 'lucide-react';
import BurgerMenuIcon from '../components/icons/BurgerMenuIcon';
import CloseIcon from '../components/icons/CloseIcon';

interface BankAccount {
    $id: string;
    accountNumber: string;
    accountType: string;
    balance: number;
    currency: string;
    isJointAccount: boolean;
    primaryHolderId: string;
    secondaryHolderId?: string;
    bankName: string;
    accountName: string;
    isActive: boolean;
    createdAt?: string;
    $createdAt?: string;
    $updatedAt?: string;
}

interface JobUnlockPaymentPageProps {
    onNavigate?: (page: string) => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
}

const JobUnlockPaymentPage: React.FC<JobUnlockPaymentPageProps> = ({ onNavigate, onTermsClick, onPrivacyClick }) => {
    const [showTerms, setShowTerms] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [paymentProof, setPaymentProof] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');
    const [userName, setUserName] = useState('');
    const [userPhone, setUserPhone] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [selectedBank, setSelectedBank] = useState<BankAccount | null>(null);
    const [loadingBanks, setLoadingBanks] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const DATABASE_ID = 'indaStreetDB'; // Replace with your database ID
    const COLLECTION_ID = 'bankAccounts'; // Replace with your collection ID
    const adminWhatsApp = '6281234567890'; // Replace with actual admin WhatsApp number
    const paymentAmount = 'Rp 150,000';

    // Fetch active bank accounts from Appwrite
    useEffect(() => {
        const fetchBanks = async () => {
            try {
                setLoadingBanks(true);
                const response = await databases.listDocuments(
                    DATABASE_ID,
                    COLLECTION_ID,
                    [Query.equal('isActive', true), Query.orderDesc('createdAt')]
                );
                const bankList = response.documents as unknown as BankAccount[];
                setBanks(bankList);
                // Auto-select first bank if available
                if (bankList.length > 0) {
                    setSelectedBank(bankList[0]);
                }
            } catch (error) {
                console.error('Error fetching banks:', error);
                // Fallback to default bank if fetch fails
                const fallbackBank: BankAccount = {
                    $id: 'default',
                    bankName: 'Bank Central Asia (BCA)',
                    accountNumber: '1234567890123456',
                    accountName: 'INDA STREET LTD',
                    accountType: 'savings',
                    balance: 0,
                    currency: 'IDR',
                    isJointAccount: false,
                    primaryHolderId: 'admin',
                    isActive: true
                };
                setBanks([fallbackBank]);
                setSelectedBank(fallbackBank);
            } finally {
                setLoadingBanks(false);
            }
        };

        fetchBanks();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPaymentProof(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleSubmit = () => {
        if (!paymentProof || !userName || !userPhone || !acceptedTerms || !selectedBank) {
            alert('Please complete all fields and accept the terms');
            return;
        }

        // Create WhatsApp message
        const message = `Hello Admin,\n\nI have completed payment for job details unlock.\n\nName: ${userName}\nWhatsApp: ${userPhone}\nBank: ${selectedBank.bankName}\nAccount Number: ${selectedBank.accountNumber}\nAmount: ${paymentAmount}\n\nI will send the payment screenshot next.\n\nThank you!`;
        
        const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(message)}`;
        
        setSubmitted(true);
        
        // Open WhatsApp
        setTimeout(() => {
            window.open(whatsappUrl, '_blank');
        }, 1000);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    if (submitted) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 pb-32  w-full max-w-full">
                {/* Header */}
                <header className="p-4 bg-white sticky top-0 z-20 shadow-sm w-full max-w-full overflow-hidden">
                    <div className="flex justify-between items-center max-w-full">
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">Street</span>
                        </h1>
                        <div className="flex items-center gap-3 text-gray-600">
                            <button onClick={() => onNavigate?.('home')} title="Home" className="hover:text-orange-500 transition-colors">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </button>
                            <button onClick={() => setIsMenuOpen(true)} title="Menu" className="hover:text-orange-500 transition-colors">
                               <BurgerMenuIcon className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="mx-auto px-4 py-12 max-w-full ">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100 max-w-full">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Submission Received!</h2>
                        <p className="text-gray-600 mb-6">
                            Please send your payment screenshot to our admin via WhatsApp. 
                            Your account will be activated within 24 hours after verification.
                        </p>
                        <button
                            onClick={() => window.open(`https://wa.me/${adminWhatsApp}`, '_blank')}
                            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-all"
                        >
                            Open WhatsApp
                        </button>
                        <div className="mt-6">
                            <button
                                onClick={() => window.location.href = '/massage-jobs'}
                                className="text-orange-600 hover:text-orange-700 font-semibold"
                            >
                                Back to Job Listings
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer - Fixed positioning */}
                <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 py-6 z-50 w-full max-w-full overflow-hidden">
                    <div className="mx-auto px-4 max-w-full">
                        <div className="flex justify-center gap-2 mb-3">
                            <button onClick={() => onNavigate?.('join-indastreet')} className="text-xs text-orange-500 font-medium hover:underline">
                                Become Agent
                            </button>
                            <span className="text-gray-400">|</span>
                            <button onClick={onTermsClick} className="text-xs text-orange-500 font-medium hover:underline">
                                Terms
                            </button>
                            <span className="text-gray-400">|</span>
                            <button onClick={onPrivacyClick} className="text-xs text-orange-500 font-medium hover:underline">
                                Privacy
                            </button>
                        </div>
                        <p className="text-xs text-center text-gray-500">
                            © 2025 IndaStreet Massage
                        </p>
                    </div>
                </footer>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 pb-32  w-full max-w-full">
            {/* Header */}
            <header className="p-4 bg-white sticky top-0 z-20 shadow-sm w-full max-w-full overflow-hidden">
                <div className="flex justify-between items-center max-w-full">
                    <h1 className="text-2xl font-bold text-gray-800">
                        <span className="text-black">Inda</span>
                        <span className="text-orange-500">Street</span>
                    </h1>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={() => onNavigate?.('home')} title="Home" className="hover:text-orange-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </button>
                        <button onClick={() => setIsMenuOpen(true)} title="Menu" className="hover:text-orange-500 transition-colors">
                           <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Menu Drawer */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" 
                        onClick={() => setIsMenuOpen(false)}
                        aria-hidden="true"
                    ></div>
    
                    <div className={`absolute right-0 top-0 bottom-0 w-[70%] sm:w-80 bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl flex flex-col transform transition-transform ease-in-out duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        {/* Brand Header */}
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

                        {/* Menu Content */}
                        <nav className="flex-grow  p-4">
                            <div className="space-y-2">
                                <button 
                                    onClick={() => { window.location.href = '/'; setIsMenuOpen(false); }} 
                                    className="flex items-center gap-4 w-full text-left p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 group"
                                >
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl shadow-lg bg-gradient-to-br from-orange-400 to-orange-600">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                        </svg>
                                    </div>
                                    <div className="flex-grow">
                                        <h3 className="font-semibold text-gray-800">Home</h3>
                                        <p className="text-xs text-gray-500">Back to main page</p>
                                    </div>
                                </button>
                            </div>
                        </nav>

                        {/* Footer with Links */}
                        <div className="p-4 pb-20 bg-gray-50 border-t border-gray-200 space-y-3">
                            <div className="flex justify-center gap-2">
                                <button className="text-xs text-orange-500 font-medium hover:underline">
                                    Become Agent
                                </button>
                                <span className="text-gray-400">|</span>
                                <button className="text-xs text-orange-500 font-medium hover:underline">
                                    Terms
                                </button>
                                <span className="text-gray-400">|</span>
                                <button className="text-xs text-orange-500 font-medium hover:underline">
                                    Privacy
                                </button>
                            </div>
                            <p className="text-xs text-center text-gray-500">
                                © 2025 IndaStreet Massage
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Hero Section with indaStreet Guy Image */}
            <div className="relative bg-white text-gray-800 py-12 overflow-hidden w-full max-w-full">
                <div className="mx-auto px-4 max-w-full ">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-full">
                        {/* Text Content */}
                        <div className="flex-1 text-center md:text-left z-10">
                            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Unlock Job Details</h1>
                            </div>
                            <p className="text-gray-600 text-lg md:text-xl mb-4">
                                Complete payment to access exclusive contact information
                            </p>
                            <div className="inline-block bg-orange-50 px-4 py-2 rounded-lg border border-orange-200">
                                <p className="text-orange-600 font-semibold">💼 Get Direct Access to Employers</p>
                            </div>
                        </div>
                        
                        {/* indaStreet Guy Image */}
                        <div className="relative z-10">
                            <img 
                                src="https://ik.imagekit.io/7grri5v7d/indastreet_guy_52-removebg-preview.png?updatedAt=1761737757347" 
                                alt="indaStreet Professional" 
                                className="w-48 md:w-64 h-auto object-contain animate-float"
                                style={{
                                    filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.1))'
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="p-4  w-full max-w-full">
                <div className="mx-auto max-w-full">
                    {/* Personal Touch Message */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 border border-gray-200 max-w-full">
                        <div className="flex items-start gap-4 pb-20">
                            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="text-2xl font-bold mb-3 flex items-center gap-2 text-gray-900">
                                    <span>✨</span>
                                    The indaStreet Personal Touch
                                </h3>
                                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                    At <strong>indaStreet</strong>, we believe in the power of human connection. Unlike automated payment systems, 
                                    <strong> every transaction is personally handled by our dedicated team</strong> – 24 hours a day, 7 days a week.
                                </p>
                                <p className="text-gray-700 text-lg leading-relaxed mb-4">
                                    We're always connected on WhatsApp with our partners and members, ensuring <strong>direct contact</strong> for 
                                    your account needs. This personal approach is what makes indaStreet different – we keep our commitment to process 
                                    all payments as quickly as possible while maintaining that <strong>human touch</strong> you deserve.
                                </p>
                                <div className="bg-orange-50 rounded-lg p-4 pb-20 border border-orange-200">
                                    <p className="text-orange-600 font-semibold flex items-center gap-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Real People. Real Support. Real Results.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Instructions */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Building2 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Transfer Payment</h2>
                            <p className="text-sm text-gray-500">Step 1: Complete your payment</p>
                        </div>
                    </div>

                    {loadingBanks ? (
                        <div className="bg-orange-50 rounded-xl p-8 border-2 border-orange-200 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                            <p className="text-gray-600 mt-4">Loading bank details...</p>
                        </div>
                    ) : banks.length === 0 ? (
                        <div className="bg-red-50 rounded-xl p-6 border-2 border-red-200 text-center">
                            <p className="text-red-700 font-semibold">No bank accounts available. Please contact admin.</p>
                        </div>
                    ) : (
                        <>
                            {/* Bank Selection */}
                            {banks.length > 1 && (
                                <div className="mb-6">
                                    <label className="block text-gray-700 font-semibold mb-3">Select Bank for Transfer:</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20">
                                        {banks.map((bank) => (
                                            <button
                                                key={bank.$id}
                                                onClick={() => setSelectedBank(bank)}
                                                className={`p-4 rounded-lg border-2 transition-all text-left ${
                                                    selectedBank?.$id === bank.$id
                                                        ? 'border-orange-500 bg-orange-50 shadow-lg'
                                                        : 'border-gray-200 hover:border-orange-300 bg-white'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-gray-900">{bank.bankName}</span>
                                                    {selectedBank?.$id === bank.$id && (
                                                        <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Selected Bank Details */}
                            {selectedBank && (
                                <div className="bg-orange-50 rounded-xl p-6 border-2 border-orange-200">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                                            <span className="text-gray-600 font-semibold">Bank Name:</span>
                                            <span className="text-gray-900 font-bold">{selectedBank.bankName}</span>
                                        </div>
                                        
                                        <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                                            <span className="text-gray-600 font-semibold">Account Number:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-900 font-bold text-lg">{selectedBank.accountNumber}</span>
                                                <button
                                                    onClick={() => copyToClipboard(selectedBank.accountNumber)}
                                                    className="text-orange-600 hover:text-orange-700 p-2 hover:bg-orange-100 rounded"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pb-3 border-b border-orange-200">
                                            <span className="text-gray-600 font-semibold">Account Name:</span>
                                            <span className="text-gray-900 font-bold">{selectedBank.accountName}</span>
                                        </div>

                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-gray-600 font-semibold">Amount to Transfer:</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-green-600 font-bold text-2xl">{paymentAmount}</span>
                                                <button
                                                    onClick={() => copyToClipboard(paymentAmount.replace('Rp ', '').replace(',', ''))}
                                                    className="text-orange-600 hover:text-orange-700 p-2 hover:bg-orange-100 rounded"
                                                >
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Screenshot Upload */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Your Details</h2>
                            <p className="text-sm text-gray-500">Step 2: Provide your information</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Full Name *</label>
                            <input
                                type="text"
                                value={userName}
                                onChange={(e) => setUserName(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                placeholder="Enter your full name"
                            />
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">WhatsApp Number *</label>
                            <input
                                type="tel"
                                value={userPhone}
                                onChange={(e) => setUserPhone(e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                                placeholder="e.g., 628123456789"
                            />
                            <p className="text-sm text-gray-500 mt-1">Job details will be sent to this number</p>
                        </div>

                        <div>
                            <label className="block text-gray-700 font-semibold mb-2">Upload Payment Screenshot *</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-all">
                                {previewUrl ? (
                                    <div className="space-y-4">
                                        <img src={previewUrl} alt="Payment proof" className="max-w-full h-auto mx-auto rounded-lg shadow-lg max-h-96" />
                                        <button
                                            onClick={() => {
                                                setPaymentProof(null);
                                                setPreviewUrl('');
                                            }}
                                            className="text-red-600 hover:text-red-700 font-semibold"
                                        >
                                            Remove Image
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                            id="payment-proof"
                                        />
                                        <label
                                            htmlFor="payment-proof"
                                            className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 rounded-lg inline-block transition-all"
                                        >
                                            Choose File
                                        </label>
                                        <p className="text-gray-500 mt-2">Upload screenshot of payment confirmation</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Terms & Conditions</h2>
                        <button
                            onClick={() => setShowTerms(!showTerms)}
                            className="text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-2"
                        >
                            {showTerms ? 'Hide' : 'Show'}
                            <svg className={`w-5 h-5 transition-transform ${showTerms ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>

                    {showTerms && (
                        <div className="bg-gray-50 rounded-lg p-6 space-y-4 text-gray-700 mb-4">
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">1</div>
                                <p><strong>Single Job Access:</strong> This payment allows you to unlock contact details for ONE (1) job posting of your choice.</p>
                            </div>
                            
                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">2</div>
                                <p><strong>Details Delivery:</strong> Upon verification of payment, complete job details including:</p>
                            </div>
                            <ul className="ml-12 space-y-2 list-disc text-gray-600">
                                <li>Contact person's name</li>
                                <li>WhatsApp number</li>
                                <li>Business address</li>
                                <li>Position details and requirements</li>
                            </ul>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">3</div>
                                <p><strong>Activation Time:</strong> Your access will be activated within <strong>24 hours</strong> after payment verification. Details will be sent to your registered WhatsApp number.</p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">4</div>
                                <p><strong>Listing Validity:</strong> The job posting will remain active as listed by the employer.</p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">5</div>
                                <p><strong>Closed Listing Policy:</strong> In the event your selected job listing has been closed or filled:</p>
                            </div>
                            <ul className="ml-12 space-y-2 list-disc text-gray-600">
                                <li>You will be notified immediately via WhatsApp</li>
                                <li>You have <strong>24 hours</strong> to select another available job listing</li>
                                <li>No additional payment required for the replacement selection</li>
                            </ul>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">6</div>
                                <p><strong>Non-Refundable:</strong> All payments are non-refundable once verification is complete.</p>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">7</div>
                                <p><strong>Support:</strong> For any questions or issues, contact our support team via WhatsApp at any time.</p>
                            </div>
                        </div>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="w-5 h-5 text-orange-600 border-2 border-gray-300 rounded focus:ring-2 focus:ring-orange-500 mt-1"
                        />
                        <span className="text-gray-700 group-hover:text-gray-900">
                            I have read and agree to the Terms & Conditions *
                        </span>
                    </label>
                </div>

                {/* Submit Button */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Send className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Send to Admin</h2>
                            <p className="text-sm text-gray-500">Step 3: Submit via WhatsApp for personal assistance</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={!paymentProof || !userName || !userPhone || !acceptedTerms || !selectedBank}
                        className={`w-full py-5 px-6 rounded-xl font-bold text-lg shadow-2xl transition-all duration-300 flex items-center justify-center gap-3 ${
                            paymentProof && userName && userPhone && acceptedTerms && selectedBank
                                ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white cursor-pointer transform hover:scale-[1.02]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span className="text-xl">Send Payment Details via WhatsApp</span>
                    </button>

                    <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4 pb-20">
                        <p className="text-center text-green-800 font-semibold flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                            Our team is standing by on WhatsApp to assist you personally!
                        </p>
                    </div>

                    <p className="text-center text-gray-600 mt-4 text-sm leading-relaxed">
                        After clicking, you'll be connected directly with our team via WhatsApp.
                        <br />
                        <strong className="text-orange-600">Personal service • 24/7 support • Fast processing</strong>
                    </p>
                </div>
                </div>
            </main>

            {/* Footer - Fixed positioning */}
            <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 border-t border-gray-200 py-6 z-50 w-full max-w-full overflow-hidden">
                <div className="mx-auto px-4 max-w-full">
                    <div className="flex justify-center gap-2 mb-3">
                        <button onClick={() => onNavigate?.('join-indastreet')} className="text-xs text-orange-500 font-medium hover:underline">
                            Become Agent
                        </button>
                        <span className="text-gray-400">|</span>
                        <button onClick={onTermsClick} className="text-xs text-orange-500 font-medium hover:underline">
                            Terms
                        </button>
                        <span className="text-gray-400">|</span>
                        <button onClick={onPrivacyClick} className="text-xs text-orange-500 font-medium hover:underline">
                            Privacy
                        </button>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                        © 2025 IndaStreet Massage
                    </p>
                </div>
            </footer>

            {/* Floating Animation Styles */}
            <style>{`
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-8px);
                    }
                }
                .animate-float {
                    animation: float 2s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default JobUnlockPaymentPage;

