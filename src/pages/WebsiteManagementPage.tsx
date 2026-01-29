import React, { useState } from 'react';
import { Globe, Star, Save, Eye, Home, BarChart3, Users, MapPin, TrendingUp } from 'lucide-react';

interface WebsiteManagementPageProps {
    onBack: () => void;
    currentUser?: {
        id: string;
        name: string;
        type: 'customer' | 'therapist' | 'place' | 'hotel' | 'villa' | 'agent';
    };
    onSave?: (websiteData: {
        websiteUrl: string;
        websiteTitle: string;
        websiteDescription: string;
    }) => void;
    initialData?: {
        websiteUrl?: string;
        websiteTitle?: string;
        websiteDescription?: string;
    };
    t?: any;
}

const WebsiteManagementPage: React.FC<WebsiteManagementPageProps> = ({
    onBack,
    currentUser,
    onSave,
    initialData
}) => {
    const [websiteUrl, setWebsiteUrl] = useState(initialData?.websiteUrl || '');
    const [websiteTitle, setWebsiteTitle] = useState(initialData?.websiteTitle || '');
    const [websiteDescription, setWebsiteDescription] = useState(initialData?.websiteDescription || '');
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!onSave) return;
        
        setIsSaving(true);
        try {
            await onSave({
                websiteUrl,
                websiteTitle,
                websiteDescription
            });
            
            // Show success feedback
            const successMessage = document.createElement('div');
            successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
            successMessage.textContent = 'Website information saved successfully!';
            document.body.appendChild(successMessage);
            
            setTimeout(() => {
                try {
                    if (successMessage && successMessage.parentNode && document.body.contains(successMessage)) {
                        document.body.removeChild(successMessage);
                    }
                } catch (error) {
                    console.warn('Failed to remove success message element:', error);
                }
            }, 3000);
        } catch (error) {
            console.error('Error saving website data:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const isValidUrl = (url: string) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    };

    const getUserTypeLabel = () => {
        switch (currentUser?.type) {
            case 'therapist': return 'Therapist';
            case 'place': return 'Massage Place';
            case 'hotel': return 'Hotel';
            case 'villa': return 'Villa';
            default: return 'Business';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Header - match HomePage look (white, brand) */}
            <header className="bg-white p-4 shadow-md sticky top-0 z-[9997]">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-bold text-gray-800">
                            <span className="text-black">Inda</span>
                            <span className="text-orange-500"><span className="inline-block animate-float">S</span>treet</span>
                        </h1>
                    </div>
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                        title="Home"
                    >
                        <Home className="w-6 h-6 text-gray-600" />
                    </button>
                </div>
            </header>

            {/* Action Buttons Below Header */}
            <div className="bg-white border-b border-gray-200 sticky top-[72px] z-[9996]">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-end gap-2">
                    <button
                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-700 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
                    >
                        <Eye className="w-4 h-4" />
                        {isPreviewMode ? 'Edit' : 'Preview'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-gray-800 rounded-md shadow-sm hover:bg-black transition-colors disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving' : 'Save'}
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {isPreviewMode ? (
                    /* Preview Mode */
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-500" /> Preview Listing</h2>
                            
                            {websiteUrl && websiteTitle ? (
                                <div className="bg-white border border-gray-200 rounded-lg p-5">
                                    <div className="flex items-start gap-4">
                                        <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <Globe className="w-7 h-7 text-gray-700" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-base font-semibold text-gray-900 mb-1">
                                                {websiteTitle || 'Your Website Title'}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {getUserTypeLabel()} • Indastreet Partner
                                            </p>
                                            {websiteDescription && (
                                                <p className="text-xs text-gray-700 mb-3 line-clamp-4">
                                                    {websiteDescription}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <a
                                                    href={websiteUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-md hover:bg-black transition-colors text-xs font-medium"
                                                >
                                                    <Globe className="w-4 h-4" />
                                                    Visit Website
                                                </a>
                                                <div className="flex items-center gap-1 text-[10px] text-gray-600">
                                                    <Star className="w-3 h-3" />
                                                    <span>SEO Ready</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <Globe className="w-14 h-14 mx-auto mb-3 text-gray-300" />
                                    <p className="text-sm">Enter details to preview your listing</p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Edit Mode */
                    <div className="space-y-6">
                        {/* Information Section */}
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <Globe className="w-5 h-5 text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-1">
                                        <span>🤝 Indastreet Partners Directory</span>
                                    </h2>
                                    <p className="text-[11px] text-gray-600">Optional but Recommended</p>
                                </div>
                            </div>
                            
                            <div className="bg-white rounded-lg p-4 space-y-3">
                                <p className="text-xs text-gray-700 leading-relaxed">
                                    Add your website to be featured in our <strong>Indastreet Partners</strong> directory for better SEO ranking and exposure.
                                    This boosts visibility and drives more relevant visitors to your business.
                                </p>
                                
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                    <div className="flex items-center gap-2 text-[11px] text-gray-700">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>Traffic</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-700">
                                        <BarChart3 className="w-3.5 h-3.5" />
                                        <span>SEO Boost</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-700">
                                        <Users className="w-3.5 h-3.5" />
                                        <span>Exposure</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] text-gray-700">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Local Reach</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Website Information Form */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
                            <h3 className="text-sm font-semibold text-gray-800 mb-5 flex items-center gap-2"><Globe className="w-4 h-4 text-gray-500" /> Website Information</h3>
                            
                            <div className="space-y-6">
                                {/* Website URL */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Website URL *
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Globe className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input 
                                            type="url" 
                                            value={websiteUrl} 
                                            onChange={e => setWebsiteUrl(e.target.value)} 
                                            placeholder="https://yourwebsite.com" 
                                            className={`block w-full pl-10 pr-3 py-2.5 bg-white border rounded-lg shadow-sm focus:outline-none focus:ring-2 text-gray-900 text-sm ${
                                                websiteUrl && !isValidUrl(websiteUrl)
                                                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-gray-500 focus:border-gray-500'
                                            }`}
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-500 mt-1">
                                        Your professional website or business URL
                                    </p>
                                    {websiteUrl && !isValidUrl(websiteUrl) && (
                                        <p className="text-[11px] text-red-600 mt-1">
                                            Please enter a valid URL (e.g., https://example.com)
                                        </p>
                                    )}
                                </div>

                                {/* Website Title */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Website Title *
                                    </label>
                                    <input 
                                        type="text" 
                                        value={websiteTitle} 
                                        onChange={e => setWebsiteTitle(e.target.value)} 
                                        placeholder="Professional Massage & Wellness Services" 
                                        className="block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 text-sm"
                                        maxLength={100}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[11px] text-gray-500">
                                            Display name for your website link
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {websiteTitle.length}/100 characters
                                        </p>
                                    </div>
                                </div>

                                {/* Website Description */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-2">
                                        Website Description
                                    </label>
                                    <textarea 
                                        value={websiteDescription} 
                                        onChange={e => setWebsiteDescription(e.target.value)} 
                                        placeholder="Brief description of your website and services for the partners directory. Describe what makes your business unique and what visitors can expect..." 
                                        rows={4}
                                        className="block w-full px-3 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 text-gray-900 text-sm"
                                        maxLength={300}
                                    />
                                    <div className="flex justify-between items-center mt-2">
                                        <p className="text-[11px] text-gray-500">
                                            Short description for the partners directory (optional)
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            {websiteDescription.length}/300 characters
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SEO Benefits Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-3">
                                <Star className="w-5 h-5 text-gray-600" />
                                <h3 className="text-sm font-semibold text-gray-900">SEO Benefits</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-gray-200">
                                    <TrendingUp className="w-4 h-4 text-gray-600" />
                                    <h4 className="text-xs font-medium text-gray-800">Higher Ranking</h4>
                                    <p className="text-[10px] text-gray-600">Quality backlink improves visibility</p>
                                </div>
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-gray-200">
                                    <BarChart3 className="w-4 h-4 text-gray-600" />
                                    <h4 className="text-xs font-medium text-gray-800">More Traffic</h4>
                                    <p className="text-[10px] text-gray-600">Directory sends relevant visitors</p>
                                </div>
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-gray-200">
                                    <Users className="w-4 h-4 text-gray-600" />
                                    <h4 className="text-xs font-medium text-gray-800">Authority</h4>
                                    <p className="text-[10px] text-gray-600">Brand trust & credibility</p>
                                </div>
                                <div className="flex flex-col gap-1 bg-white rounded-lg p-3 border border-gray-200">
                                    <MapPin className="w-4 h-4 text-gray-600" />
                                    <h4 className="text-xs font-medium text-gray-800">Local SEO</h4>
                                    <p className="text-[10px] text-gray-600">Better location searches</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WebsiteManagementPage;

