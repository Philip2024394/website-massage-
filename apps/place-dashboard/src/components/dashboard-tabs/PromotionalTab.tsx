import React from 'react';
import { MessageSquare } from 'lucide-react';

interface PromotionalTabProps {}

const PromotionalTab: React.FC<PromotionalTabProps> = () => {
    const banners = [
        { percentage: 5, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%205.png?updatedAt=1761803670532' },
        { percentage: 10, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2010.png?updatedAt=1761803828896' },
        { percentage: 15, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2015.png?updatedAt=1761803805221' },
        { percentage: 20, url: 'https://ik.imagekit.io/7grri5v7d/massage%20discount%2020.png?updatedAt=1761803783034' }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Promotional Tools</h2>
                        <p className="text-sm text-gray-600">Share discount banners to promote your services</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {banners.map((banner) => (
                        <div key={banner.percentage} className="bg-gray-50 rounded-xl p-4">
                            <div className="aspect-video bg-white rounded-lg mb-4 overflow-hidden">
                                <img
                                    src={banner.url}
                                    alt={`${banner.percentage}% Discount Banner`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.style.display = 'none';
                                        const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                                        if (nextElement) {
                                            nextElement.style.display = 'flex';
                                        }
                                    }}
                                />
                                <div 
                                    className="w-full h-full bg-gradient-to-br from-orange-400 to-orange-600 hidden items-center justify-center text-white font-bold text-xl"
                                    style={{ display: 'none' }}
                                >
                                    {banner.percentage}% OFF
                                </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">{banner.percentage}% Discount Banner</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        const whatsappText = `🌟 Special Offer! Get ${banner.percentage}% OFF on massage services! Book now through IndaStreet app. ${banner.url}`;
                                        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappText)}`;
                                        window.open(whatsappUrl, '_blank');
                                    }}
                                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    WhatsApp
                                </button>
                                <button
                                    onClick={() => {
                                        if (navigator.share) {
                                            navigator.share({
                                                title: `${banner.percentage}% Discount on Massage Services`,
                                                text: `Special offer! Get ${banner.percentage}% OFF on massage services!`,
                                                url: banner.url
                                            });
                                        } else {
                                            navigator.clipboard.writeText(banner.url);
                                            console.log('Banner URL copied to clipboard!');
                                        }
                                    }}
                                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                    Share
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 p-4 bg-orange-50 rounded-lg">
                    <p className="text-sm text-orange-700">
                        💡 <strong>Tip:</strong> Share these banners on your social media, WhatsApp status, or send directly to customers to promote your massage services and attract more bookings!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PromotionalTab;
