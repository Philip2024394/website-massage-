import React, { useState, useEffect } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Copy, ArrowLeft, DollarSign, Calendar } from 'lucide-react';
import { databases } from '../lib/appwrite';
import { APPWRITE_CONFIG } from '../lib/appwrite.config';
import Footer from '../components/Footer';

const BurgerMenuIcon = ({ className = 'w-6 h-6' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

interface JobPostingPaymentPageProps {
    jobId: string;
    onBack: () => void;
    onNavigate?: (page: string) => void;
    onOpenMenu?: () => void;
}

const JobPostingPaymentPage: React.FC<JobPostingPaymentPageProps> = ({ 
    jobId, 
    onBack,
    onNavigate,
    onOpenMenu
}) => {
    const [selectedPlan, setSelectedPlan] = useState<'standard' | 'premium'>('standard');
    const [jobDetails, setJobDetails] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [whatsappSent, setWhatsappSent] = useState(false);

    // Bank details
    const bankAccount = {
        name: 'BCA (Bank Central Asia)',
        accountNumber: '1234567890',
        accountName: 'IndaStreet Platform',
    };

    const plans = {
        standard: {
            name: '3-Month Standard Listing',
            price: 200000,
            duration: '3 months',
            features: [
                'Job posting visible for 3 months',
                'Therapists must unlock to view contact details',
                'Standard listing placement',
                'Email notifications for applications'
            ]
        },
        premium: {
            name: 'Premium Open Access Listing',
            price: 500000,
            duration: '3 months',
            features: [
                'Job posting visible for 3 months',
                'Contact details visible to all therapists - Open Listing',
                'No unlock required',
                'Priority listing placement',
                'Email notifications for applications',
                'Featured badge on posting'
            ]
        }
    };

    useEffect(() => {
        fetchJobDetails();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const response = await databases.getDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings',
                jobId
            );
            setJobDetails(response);
        } catch (error) {
            console.error('Error fetching job details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert('Copied to clipboard!');
    };

    const formatCurrency = (amount: number) => {
        return 'Rp ' + new Intl.NumberFormat('id-ID', {
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const sendPaymentDetailsViaWhatsApp = async () => {
        const plan = plans[selectedPlan];
        const message = `Hi IndaStreet,\n\nI have completed payment for my job posting:\n\n` +
            `Job Title: ${jobDetails?.jobTitle || 'N/A'}\n` +
            `Business Name: ${jobDetails?.businessName || 'N/A'}\n` +
            `Plan: ${plan.name}\n` +
            `Amount Paid: ${formatCurrency(plan.price)}\n` +
            `Job ID: ${jobId}\n\n` +
            `[Please attach your payment screenshot when sending this message]\n\n` +
            `Thank you!`;

        const whatsappNumber = '6281392000050'; // IndaStreet WhatsApp customer service
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // Update job posting to mark that WhatsApp was opened
        // Note: Appwrite field names are lowercase: whatsappsent, whatsappsentat, selectedplanprice
        try {
            await databases.updateDocument(
                APPWRITE_CONFIG.databaseId,
                APPWRITE_CONFIG.collections.employerJobPostings || 'employer_job_postings',
                jobId,
                {
                    whatsappsent: true,
                    whatsappsentat: new Date().toISOString(),
                    selectedplanprice: `${plan.price}`, // String format in Appwrite
                }
            );
            console.log('✅ Updated job posting - WhatsApp opened', {
                plan: selectedPlan,
                price: plan.price
            });
        } catch (error) {
            console.error('Error updating job posting:', error);
            // Continue anyway - don't block WhatsApp from opening
        }
        
        window.open(whatsappUrl, '_blank');
        setWhatsappSent(true);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Main Header/Navigation */}
            <header className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => onNavigate?.('home')}
                            className="text-2xl font-bold tracking-tight hover:opacity-80 transition-opacity"
                        >
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500">
                                <span className="inline-block animate-float">S</span>treet
                            </span>
                        </button>
                    </div>
                    <div className="flex items-center gap-3 text-gray-600">
                        <button onClick={onOpenMenu} title="Menu">
                            <BurgerMenuIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Payment Page Header */}
            <div className="bg-white border-b px-4 py-3">
                <div className="max-w-4xl mx-auto flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Payment Details</h1>
                        <p className="text-sm text-gray-500">Complete your job posting</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 max-w-4xl mx-auto px-4 py-8 space-y-6 w-full">
                {/* Success Notice */}
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                        <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-green-900 mb-1">Listing Profile Received!</h3>
                            <p className="text-sm text-green-800">
                                IndaStreet has received your job listing profile. Your posting will be activated within 12 hours 
                                from confirmation of payment.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Job Summary */}
                {jobDetails && (
                    <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-orange-500" />
                            Your Job Posting
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Position:</span>
                                <span className="font-medium text-gray-900">{jobDetails.jobTitle}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Business:</span>
                                <span className="font-medium text-gray-900">{jobDetails.businessName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium text-gray-900">{jobDetails.city}, {jobDetails.country}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Plan Selection */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">Select Your Plan</h3>
                    <div className="space-y-4">
                        {/* Standard Plan */}
                        <div
                            className={`w-full p-5 rounded-xl border-2 transition-all ${
                                selectedPlan === 'standard'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200'
                            }`}
                        >
                            <div className="mb-4">
                                <h4 className="font-bold text-lg text-gray-900">{plans.standard.name}</h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {plans.standard.duration}
                                </p>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plans.standard.features.map((feature, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t pt-4 mt-4">
                                <div className="text-3xl font-bold text-orange-600 mb-4 text-center">
                                    {formatCurrency(plans.standard.price)}
                                </div>
                                <button
                                    onClick={() => setSelectedPlan('standard')}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                        selectedPlan === 'standard'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {selectedPlan === 'standard' ? '✓ Selected' : 'Select Package'}
                                </button>
                            </div>
                        </div>

                        {/* Premium Plan */}
                        <div
                            className={`w-full p-5 rounded-xl border-2 transition-all ${
                                selectedPlan === 'premium'
                                    ? 'border-orange-500 bg-orange-50'
                                    : 'border-gray-200'
                            }`}
                        >
                            <div className="mb-4">
                                <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                                    {plans.premium.name}
                                    <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full">RECOMMENDED</span>
                                </h4>
                                <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                    <Calendar className="w-4 h-4" />
                                    {plans.premium.duration}
                                </p>
                            </div>
                            <ul className="space-y-2 mb-6">
                                {plans.premium.features.map((feature, idx) => (
                                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t pt-4 mt-4">
                                <div className="text-3xl font-bold text-orange-600 mb-4 text-center">
                                    {formatCurrency(plans.premium.price)}
                                </div>
                                <button
                                    onClick={() => setSelectedPlan('premium')}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all ${
                                        selectedPlan === 'premium'
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {selectedPlan === 'premium' ? '✓ Selected' : 'Select Package'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bank Details */}
                <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-orange-500" />
                        Bank Transfer Details
                    </h3>
                    
                    <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-4 mb-4">
                        <div className="text-center mb-4">
                            <div className="text-sm text-gray-600 mb-1">Amount to Transfer</div>
                            <div className="text-3xl font-bold text-orange-600">
                                {formatCurrency(plans[selectedPlan].price)}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {plans[selectedPlan].name}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="text-xs text-gray-500">Bank Name</div>
                                <div className="font-medium text-gray-900">{bankAccount.name}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="text-xs text-gray-500">Account Number</div>
                                <div className="font-bold text-lg text-gray-900">{bankAccount.accountNumber}</div>
                            </div>
                            <button
                                onClick={() => copyToClipboard(bankAccount.accountNumber)}
                                className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2 text-sm"
                            >
                                <Copy className="w-4 h-4" />
                                Copy
                            </button>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div>
                                <div className="text-xs text-gray-500">Account Name</div>
                                <div className="font-medium text-gray-900">{bankAccount.accountName}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
                    <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Payment Instructions
                    </h3>
                    <ol className="space-y-2 text-sm text-blue-900">
                        <li className="flex gap-3">
                            <span className="font-bold flex-shrink-0">1.</span>
                            <span>Transfer the exact amount of <strong>{formatCurrency(plans[selectedPlan].price)}</strong> to the bank account above</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold flex-shrink-0">2.</span>
                            <span>Take a screenshot of your payment confirmation</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold flex-shrink-0">3.</span>
                            <span>Click the button below to send your payment proof via WhatsApp</span>
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold flex-shrink-0">4.</span>
                            <span>Your job posting will be activated within <strong>12 hours</strong> after payment confirmation</span>
                        </li>
                    </ol>
                    
                    {/* Non-refundable notice */}
                    <div className="mt-4 pt-4 border-t border-blue-300">
                        <p className="text-sm text-blue-900 font-semibold flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            All payments are non-refundable
                        </p>
                    </div>
                </div>

                {/* WhatsApp Button */}
                <button
                    onClick={sendPaymentDetailsViaWhatsApp}
                    className="w-full py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    Send Payment Proof via WhatsApp
                </button>

                {whatsappSent && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4 text-center">
                        <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <p className="text-sm text-green-800 font-medium">
                            WhatsApp opened! Please attach your payment screenshot and send the message.
                        </p>
                    </div>
                )}

                {/* Note */}
                <div className="text-center text-sm text-gray-500 border-t pt-6">
                    <p>Need help? Contact us via WhatsApp or email at indastreet.id@gmail.com</p>
                </div>
            </div>

            {/* Footer */}
            <Footer 
                onHomeClick={() => onNavigate?.('home')}
                currentPage="payment"
                t={(key: string) => key}
            />
        </div>
    );
};

export default JobPostingPaymentPage;
