import React from 'react';

interface WebsiteSectionProps {
    websiteUrl: string;
    setWebsiteUrl: (value: string) => void;
    websiteTitle: string;
    setWebsiteTitle: (value: string) => void;
    instagramUrl: string;
    setInstagramUrl: (value: string) => void;
    facebookUrl: string;
    setFacebookUrl: (value: string) => void;
    instagramPostUrl: string;
    setInstagramPostUrl: (value: string) => void;
    facebookPostUrl: string;
    setFacebookPostUrl: (value: string) => void;
    t: any;
}

const WebsiteSection: React.FC<WebsiteSectionProps> = ({
    websiteUrl,
    setWebsiteUrl,
    websiteTitle,
    setWebsiteTitle,
    instagramUrl,
    setInstagramUrl,
    facebookUrl,
    setFacebookUrl,
    instagramPostUrl,
    setInstagramPostUrl,
    facebookPostUrl,
    setFacebookPostUrl,
    t
}): JSX.Element => {
    return (
        <div className="space-y-6">
            {/* Website Information Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {t?.websiteTitle || 'Website Information'}
                        </h3>
                        <p className="text-sm text-gray-600">
                            For IndaStreet Partners Directory
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Website URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            🌐 Website URL
                        </label>
                        <input
                            type="url"
                            value={websiteUrl}
                            onChange={(e) => setWebsiteUrl(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Your business website (if you have one)
                        </p>
                    </div>

                    {/* Website Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📝 Website Title
                        </label>
                        <input
                            type="text"
                            value={websiteTitle}
                            onChange={(e) => setWebsiteTitle(e.target.value)}
                            placeholder="Your Business Name"
                            maxLength={100}
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            The name of your business/website (max 100 characters)
                        </p>
                    </div>
                </div>
            </div>

            {/* Social Media Section */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 border-2 border-pink-200 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">
                            Social Media Links
                        </h3>
                        <p className="text-sm text-gray-600">
                            Connect your social profiles
                        </p>
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Instagram URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📸 Instagram Profile URL
                        </label>
                        <input
                            type="url"
                            value={instagramUrl}
                            onChange={(e) => setInstagramUrl(e.target.value)}
                            placeholder="https://instagram.com/yourusername"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Instagram Post URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📷 Instagram Post URL (Featured)
                        </label>
                        <input
                            type="url"
                            value={instagramPostUrl}
                            onChange={(e) => setInstagramPostUrl(e.target.value)}
                            placeholder="https://instagram.com/p/..."
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Link to a specific Instagram post showcasing your services
                        </p>
                    </div>

                    {/* Facebook URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            👤 Facebook Profile/Page URL
                        </label>
                        <input
                            type="url"
                            value={facebookUrl}
                            onChange={(e) => setFacebookUrl(e.target.value)}
                            placeholder="https://facebook.com/yourpage"
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                        />
                    </div>

                    {/* Facebook Post URL */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            📰 Facebook Post URL (Featured)
                        </label>
                        <input
                            type="url"
                            value={facebookPostUrl}
                            onChange={(e) => setFacebookPostUrl(e.target.value)}
                            placeholder="https://facebook.com/post/..."
                            className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Link to a specific Facebook post showcasing your services
                        </p>
                    </div>
                </div>

                {/* Social Media Tips */}
                <div className="mt-4 bg-white bg-opacity-50 rounded-lg p-4 border border-pink-200">
                    <p className="text-xs text-gray-700 font-medium mb-2">💡 Tips:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Link your best posts showing your services and atmosphere</li>
                        <li>• Regular updates help build customer trust</li>
                        <li>• High-quality photos get more engagement</li>
                        <li>• Include customer testimonials when possible</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WebsiteSection;
