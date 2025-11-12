import React, { useState, useEffect } from 'react';
import { Crown, Star, Check, Upload, Copy, AlertCircle, CreditCard, Building, Calendar, TrendingUp, Shield, Zap, Gift } from 'lucide-react';

interface MembershipPackagesPageProps {
    onNavigateBack: () => void;
    userType: 'therapist' | 'massage-place';
    currentMembership?: string;
    onPurchase: (packageType: string, paymentScreenshot: File, bankDetails: any) => void;
}

interface Package {
    id: string;
    name: string;
    price: number;
    duration: string;
    popular?: boolean;
    features: string[];
    limitations?: string[];
    color: string;
    gradient: string;
    icon: React.ReactNode;
    badge?: string;
}

const MembershipPackagesPage: React.FC<MembershipPackagesPageProps> = ({
    onNavigateBack,
    userType,
    currentMembership = 'free',
    onPurchase
}) => {
    const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
    const [paymentScreenshot, setPaymentScreenshot] = useState<File | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Bank details for payment
    const bankDetails = {
        bankName: "Bank Mandiri",
        accountNumber: "1370-0123-4567-890",
        accountName: "PT IndaStreet Massage Platform",
        swiftCode: "BMRIIDJA"
    };

    const therapistPackages: Package[] = [
        {
            id: 'free',
            name: 'Free Trial',
            price: 0,
            duration: '30 Days',
            features: [
                'Profile creation with 5 photos',
                'Basic booking management (10/month)',
                'Customer messaging',
                'Basic analytics dashboard',
                'Standard support',
                'Access to discount banners'
            ],
            limitations: [
                'Limited to 10 bookings per month',
                'No priority listing',
                'Basic features only'
            ],
            color: 'gray',
            gradient: 'from-gray-400 to-gray-600',
            icon: <Gift className="w-6 h-6" />,
            badge: 'Trial'
        },
        {
            id: 'basic',
            name: 'Basic',
            price: 99000,
            duration: 'Monthly',
            features: [
                'Everything in Free Trial',
                'Unlimited bookings',
                'WhatsApp integration',
                'Payment processing',
                'Basic promotional tools',
                'Customer review management',
                'Mobile app notifications'
            ],
            limitations: [
                'No priority search ranking',
                'Limited analytics',
                'Single service location only'
            ],
            color: 'blue',
            gradient: 'from-blue-400 to-blue-600',
            icon: <Shield className="w-6 h-6" />
        },
        {
            id: 'standard',
            name: 'Standard',
            price: 150000,
            duration: 'Monthly',
            popular: true,
            features: [
                'Everything in Basic',
                '🌟 Priority search ranking',
                '📊 Advanced analytics & insights',
                '📍 Multiple service locations',
                '🎯 Custom discount campaigns',
                '🏆 Professional badge display',
                '📸 Extended photo gallery (15 photos)',
                '💎 Customer loyalty tracking',
                '🏨 Hotel & Villa booking access'
            ],
            color: 'orange',
            gradient: 'from-orange-400 to-orange-600',
            icon: <Star className="w-6 h-6" />,
            badge: 'Popular'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 200000,
            duration: 'Monthly',
            features: [
                'Everything in Standard',
                '⭐ FEATURED listing (top placement)',
                '🎯 Targeted marketing campaigns',
                '📊 Advanced business insights',
                '🏆 Premium therapist badge',
                '📱 Personal booking app link',
                '💼 Business consultation calls',
                '🎨 Custom profile themes',
                '📈 Revenue optimization tools',
                '🏨 Premium hotel & villa partnerships',
                '💰 Exclusive high-value client access'
            ],
            color: 'purple',
            gradient: 'from-purple-400 to-purple-600',
            icon: <Crown className="w-6 h-6" />,
            badge: 'Best Value'
        }
    ];

    const massagePlacePackages: Package[] = [
        {
            id: 'free',
            name: 'Free Trial',
            price: 0,
            duration: '30 Days',
            features: [
                'Business listing with 8 photos',
                'Basic booking system (15/month)',
                'Staff management (up to 3 therapists)',
                'Basic analytics',
                'Customer reviews display'
            ],
            limitations: [
                'Limited to 15 bookings per month',
                'No premium placement',
                'Basic features only'
            ],
            color: 'gray',
            gradient: 'from-gray-400 to-gray-600',
            icon: <Gift className="w-6 h-6" />,
            badge: 'Trial'
        },
        {
            id: 'basic',
            name: 'Basic',
            price: 99000,
            duration: 'Monthly',
            features: [
                'Everything in Free Trial',
                'Unlimited bookings',
                'Up to 5 staff members',
                'Basic promotional campaigns',
                'Payment processing',
                'Customer database',
                'Mobile notifications'
            ],
            limitations: [
                'No premium listing',
                'Limited marketing tools',
                'Single location only'
            ],
            color: 'blue',
            gradient: 'from-blue-400 to-blue-600',
            icon: <Shield className="w-6 h-6" />
        },
        {
            id: 'standard',
            name: 'Standard',
            price: 150000,
            duration: 'Monthly',
            popular: true,
            features: [
                'Everything in Basic',
                '🌟 Enhanced listing visibility',
                '👥 Up to 10 staff members',
                '📊 Advanced booking analytics',
                '🎨 Custom promotional banners',
                '📱 Social media integration',
                '💾 Customer database export',
                '🏨 Hotel & Villa partnership access',
                '📈 Performance insights'
            ],
            color: 'orange',
            gradient: 'from-orange-400 to-orange-600',
            icon: <Star className="w-6 h-6" />,
            badge: 'Popular'
        },
        {
            id: 'premium',
            name: 'Premium',
            price: 200000,
            duration: 'Monthly',
            features: [
                'Everything in Standard',
                '⭐ FEATURED business listing',
                '👥 Unlimited staff management',
                '🏢 Multi-location support',
                '📊 Comprehensive business analytics',
                '🎯 Advanced marketing automation',
                '💳 Premium payment options',
                '📞 Priority customer support',
                '🎨 Custom branding options',
                '🏨 Exclusive hotel & villa contracts',
                '💰 VIP client database access'
            ],
            color: 'purple',
            gradient: 'from-purple-400 to-purple-600',
            icon: <Crown className="w-6 h-6" />,
            badge: 'Best Value'
        }
    ];

    const packages = userType === 'therapist' ? therapistPackages : massagePlacePackages;

    const handlePackageSelect = (pkg: Package) => {
        if (pkg.id === 'free') return; // Free package doesn't need payment
        setSelectedPackage(pkg);
        setShowPaymentModal(true);
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setPaymentScreenshot(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setUploadedImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmitPayment = async () => {
        if (!selectedPackage || !paymentScreenshot) return;
        
        setIsSubmitting(true);
        try {
            await onPurchase(selectedPackage.id, paymentScreenshot, bankDetails);
            setShowPaymentModal(false);
            setSelectedPackage(null);
            setPaymentScreenshot(null);
            setUploadedImagePreview(null);
        } catch (error) {
            console.error('Payment submission failed:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <button 
                                onClick={onNavigateBack}
                                className="text-gray-600 hover:text-gray-800 mb-2"
                            >
                                ← Back to Dashboard
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Membership Packages
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Choose the perfect plan for your {userType === 'therapist' ? 'therapy practice' : 'massage business'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Current Plan</p>
                            <p className="text-lg font-semibold capitalize text-orange-600">
                                {currentMembership}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Benefits Banner */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                        <div className="flex flex-col items-center">
                            <TrendingUp className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold mb-1">Boost Your Bookings</h3>
                            <p className="text-orange-100 text-sm">Premium members get 15-30% more bookings</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Star className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold mb-1">Priority Visibility</h3>
                            <p className="text-orange-100 text-sm">Get featured in top search results</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <Building className="w-8 h-8 mb-2" />
                            <h3 className="font-semibold mb-1">Hotel & Villa Access</h3>
                            <p className="text-orange-100 text-sm">Exclusive partnership opportunities</p>
                        </div>
                    </div>
                </div>

                {/* Package Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {packages.map((pkg) => (
                        <div 
                            key={pkg.id}
                            className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl ${
                                pkg.popular ? 'border-orange-400 transform scale-105' : 'border-gray-200 hover:border-orange-300'
                            } ${currentMembership === pkg.id ? 'ring-4 ring-green-200' : ''}`}
                        >
                            {/* Badge */}
                            {pkg.badge && (
                                <div className={`absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r ${pkg.gradient} text-white px-4 py-1 rounded-full text-sm font-semibold`}>
                                    {pkg.badge}
                                </div>
                            )}

                            {/* Current Plan Indicator */}
                            {currentMembership === pkg.id && (
                                <div className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                                    Current
                                </div>
                            )}

                            <div className="p-6">
                                {/* Header */}
                                <div className="text-center mb-6">
                                    <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-r ${pkg.gradient} rounded-full flex items-center justify-center text-white`}>
                                        {pkg.icon}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
                                    <div className="mt-2">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {pkg.price === 0 ? 'FREE' : `IDR ${pkg.price.toLocaleString()}`}
                                        </span>
                                        <span className="text-gray-500 text-sm">/{pkg.duration}</span>
                                    </div>
                                </div>

                                {/* Features */}
                                <div className="space-y-3 mb-6">
                                    {pkg.features.map((feature, index) => (
                                        <div key={index} className="flex items-start space-x-2">
                                            <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-700">{feature}</span>
                                        </div>
                                    ))}
                                    
                                    {pkg.limitations && pkg.limitations.map((limitation, index) => (
                                        <div key={index} className="flex items-start space-x-2">
                                            <AlertCircle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-sm text-gray-500">{limitation}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => handlePackageSelect(pkg)}
                                    disabled={currentMembership === pkg.id || pkg.id === 'free'}
                                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                                        currentMembership === pkg.id
                                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                            : pkg.id === 'free'
                                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                            : `bg-gradient-to-r ${pkg.gradient} text-white hover:shadow-lg transform hover:-translate-y-0.5`
                                    }`}
                                >
                                    {currentMembership === pkg.id 
                                        ? 'Current Plan' 
                                        : pkg.id === 'free'
                                        ? 'Free Trial Available'
                                        : `Upgrade to ${pkg.name}`
                                    }
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Hotel & Villa Access Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                        <Building className="w-5 h-5 mr-2" />
                        Hotel & Villa Partnership Benefits
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-purple-700">
                        <div>
                            <h4 className="font-medium mb-2">Standard Members</h4>
                            <ul className="space-y-1">
                                <li>• Access to hotel booking system</li>
                                <li>• Basic villa service listings</li>
                                <li>• Standard commission rates</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Premium Members</h4>
                            <ul className="space-y-1">
                                <li>• Exclusive 5-star hotel partnerships</li>
                                <li>• Premium villa service contracts</li>
                                <li>• Reduced platform fees (only 8%)</li>
                                <li>• Priority booking notifications</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-medium mb-2">Live Menu Features</h4>
                            <ul className="space-y-1">
                                <li>• Real-time booking availability</li>
                                <li>• Instant customer notifications</li>
                                <li>• Live chat with hotel concierge</li>
                                <li>• GPS-based service matching</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {showPaymentModal && selectedPackage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full max-h-screen overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Purchase {selectedPackage.name}
                                </h3>
                                <button 
                                    onClick={() => setShowPaymentModal(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            {/* Package Summary */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">{selectedPackage.name} Membership</span>
                                    <span className="font-bold text-lg">IDR {selectedPackage.price.toLocaleString()}</span>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Monthly subscription</p>
                            </div>

                            {/* Bank Details */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 flex items-center">
                                    <CreditCard className="w-5 h-5 mr-2" />
                                    Bank Transfer Details
                                </h4>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Bank Name:</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">{bankDetails.bankName}</span>
                                            <button 
                                                onClick={() => copyToClipboard(bankDetails.bankName)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Account Number:</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm font-mono">{bankDetails.accountNumber}</span>
                                            <button 
                                                onClick={() => copyToClipboard(bankDetails.accountNumber)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium">Account Name:</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm">{bankDetails.accountName}</span>
                                            <button 
                                                onClick={() => copyToClipboard(bankDetails.accountName)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Upload Screenshot */}
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3 flex items-center">
                                    <Upload className="w-5 h-5 mr-2" />
                                    Upload Payment Screenshot
                                </h4>
                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                    {uploadedImagePreview ? (
                                        <div className="space-y-3">
                                            <img 
                                                src={uploadedImagePreview} 
                                                alt="Payment Screenshot" 
                                                className="max-w-full h-40 object-contain mx-auto rounded-lg"
                                            />
                                            <p className="text-sm text-green-600 font-medium">
                                                Screenshot uploaded successfully!
                                            </p>
                                            <button 
                                                onClick={() => {
                                                    setPaymentScreenshot(null);
                                                    setUploadedImagePreview(null);
                                                }}
                                                className="text-sm text-gray-600 hover:text-gray-800"
                                            >
                                                Change image
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                            <p className="text-sm text-gray-600 mb-2">
                                                Upload your bank transfer screenshot
                                            </p>
                                            <input 
                                                type="file" 
                                                accept="image/*" 
                                                onChange={handleFileUpload}
                                                className="hidden" 
                                                id="screenshot-upload"
                                            />
                                            <label 
                                                htmlFor="screenshot-upload"
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors inline-block"
                                            >
                                                Choose Image
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <h5 className="font-medium text-yellow-800 mb-2">Payment Instructions:</h5>
                                <ol className="text-sm text-yellow-700 space-y-1">
                                    <li>1. Transfer the exact amount to the bank account above</li>
                                    <li>2. Take a screenshot of the successful transaction</li>
                                    <li>3. Upload the screenshot using the form above</li>
                                    <li>4. Wait for admin approval (usually within 24 hours)</li>
                                    <li>5. Your membership will be activated once verified</li>
                                </ol>
                            </div>

                            {/* Submit Button */}
                            <button 
                                onClick={handleSubmitPayment}
                                disabled={!paymentScreenshot || isSubmitting}
                                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                                    paymentScreenshot && !isSubmitting
                                        ? 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Payment for Review'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembershipPackagesPage;