// 🎯 Service personnel listing payment - 150,000 IDR
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Copy, CheckCircle } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';

const BurgerMenuIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

interface TherapistListingPaymentPageProps {
    listingId: string;
    onBack: () => void;
    onNavigate?: (page: string) => void;
    onOpenMenu?: () => void;
}

const PRICE = 150000;
const WHATSAPP_NUMBER = '6281392000050';

const TherapistListingPaymentPage: React.FC<TherapistListingPaymentPageProps> = ({
    listingId,
    onBack,
    onNavigate,
    onOpenMenu,
}) => {
    const [listingDetails, setListingDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [whatsappSent, setWhatsappSent] = useState(false);

    const bankAccount = {
        name: 'BCA (Bank Central Asia)',
        accountNumber: '1234567890',
        accountName: 'IndaStreet Platform',
    };

    useEffect(() => {
        const fetchListing = async () => {
            try {
                const response = await databases.getDocument(
                    APPWRITE_CONFIG.databaseId,
                    APPWRITE_CONFIG.collections.therapistJobListings || 'therapist_job_listings',
                    listingId
                );
                setListingDetails(response);
            } catch (error) {
                console.error('Error fetching listing:', error);
            } finally {
                setIsLoading(false);
            }
        };
        if (listingId) fetchListing();
    }, [listingId]);

    const formatCurrency = (amount: number) =>
        'Rp ' + new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0 }).format(amount);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const sendPaymentViaWhatsApp = async () => {
        const message =
            `Hi IndaStreet,\n\nI have completed payment for my Find Professionals listing:\n\n` +
            `Name: ${listingDetails?.therapistName || 'N/A'}\n` +
            `Job Title: ${listingDetails?.jobTitle || 'N/A'}\n` +
            `Amount Paid: ${formatCurrency(PRICE)}\n` +
            `Listing ID: ${listingId}\n\n` +
            `[Please attach your payment screenshot when sending this message]\n\n` +
            `Thank you!`;

        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.therapistJobListings || 'therapist_job_listings',
                listingId,
                {
                    whatsappsent: true,
                    whatsappsentat: new Date().toISOString(),
                }
            );
        } catch (error) {
            console.error('Error updating listing:', error);
        }
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
        setWhatsappSent(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50 flex flex-col">
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate?.('massage-jobs')}
                            className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                        >
                            <span className="text-black">Inda</span>
                            <span className="text-amber-500">Street</span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={onOpenMenu} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="bg-white border-b px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Payment Details</h1>
                        <p className="text-sm text-gray-500">List your service in Find Professionals</p>
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-4xl mx-auto px-4 py-8 space-y-6 w-full">
                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Listing Fee</h2>
                    <div className="text-2xl font-bold text-amber-500 mb-4">{formatCurrency(PRICE)}</div>
                    <p className="text-gray-600 text-sm mb-4">
                        One-time fee to list your profile in Find Professionals for 90 days.
                    </p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Bank Transfer</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Bank</span>
                            <span className="font-medium">{bankAccount.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Account</span>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-medium">{bankAccount.accountNumber}</span>
                                <button
                                    onClick={() => copyToClipboard(bankAccount.accountNumber)}
                                    className="p-1 hover:bg-gray-100 rounded"
                                >
                                    <Copy className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Account Name</span>
                            <span className="font-medium">{bankAccount.accountName}</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t">
                            <span className="text-gray-600">Amount</span>
                            <span className="font-bold text-amber-500">{formatCurrency(PRICE)}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
                    <ol className="list-decimal list-inside space-y-2 text-gray-600 text-sm">
                        <li>Transfer {formatCurrency(PRICE)} to the account above</li>
                        <li>Take a screenshot of your payment confirmation</li>
                        <li>Click the button below to send your payment proof via WhatsApp</li>
                        <li>Our team will verify and activate your listing within 1-2 business days</li>
                    </ol>
                </div>

                <button
                    onClick={sendPaymentViaWhatsApp}
                    disabled={whatsappSent}
                    className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                    {whatsappSent ? (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            WhatsApp Opened – Send Your Screenshot
                        </>
                    ) : (
                        <>Send Payment Proof via WhatsApp</>
                    )}
                </button>
            </div>
        </div>
    );
};

export default TherapistListingPaymentPage;
