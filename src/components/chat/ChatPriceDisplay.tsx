interface ChatPriceDisplayProps {
    pricing?: {
        duration60?: number;
        duration90?: number;
        duration120?: number;
        price60?: number;
        price90?: number;
        price120?: number;
    };
    discountPercentage?: number;
    discountActive?: boolean;
    language: 'en' | 'id';
}

const ChatPriceDisplay = ({
    pricing,
    discountPercentage = 0,
    discountActive = false,
    language
}: ChatPriceDisplayProps): JSX.Element | null => {
    if (!pricing) return null;

    const durations = [
        { key: '60', label: '60 min', price: pricing.duration60 || pricing.price60 },
        { key: '90', label: '90 min', price: pricing.duration90 || pricing.price90 },
        { key: '120', label: '120 min', price: pricing.duration120 || pricing.price120 }
    ].filter(d => d.price);

    if (durations.length === 0) return null;

    const calculateDiscount = (price: number): number => {
        if (!discountActive || !discountPercentage) return price;
        return price * (1 - discountPercentage / 100);
    };

    const formatPrice = (price: number): string => {
        return `Rp ${Math.round(price / 1000)}K`;
    };

    return (
        <div className="bg-gradient-to-r from-amber-50 to-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
            <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {language === 'id' ? 'Harga' : 'Pricing'}
            </h4>
            <div className="space-y-2">
                {durations.map((duration) => {
                    const originalPrice = duration.price!;
                    const finalPrice = calculateDiscount(originalPrice);
                    const hasDiscount = discountActive && discountPercentage > 0;

                    return (
                        <div key={duration.key} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                            <span className="font-medium text-gray-700">{duration.label}</span>
                            <div className="flex items-center gap-2">
                                {hasDiscount && (
                                    <>
                                        <span className="text-sm text-gray-400 line-through">
                                            {formatPrice(originalPrice)}
                                        </span>
                                        <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-full font-bold">
                                            -{discountPercentage}%
                                        </span>
                                    </>
                                )}
                                <span className={`font-bold ${hasDiscount ? 'text-amber-600' : 'text-gray-800'}`}>
                                    {formatPrice(finalPrice)}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ChatPriceDisplay;
