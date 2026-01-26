/**
 * Country-Specific Content Configuration
 * 
 * Defines country-specific massage types, content, and industry focus
 * Each country gets its own app experience with localized content
 */

export interface CountryMassageType {
    id: string;
    name: string;
    description: string;
    image: string;
    popular: boolean;
    traditional: boolean;
    price?: {
        min: number;
        max: number;
        currency: string;
    };
}

export interface CountryContent {
    code: string;
    name: string;
    flag: string;
    currency: string;
    language: string;
    massageTypes: CountryMassageType[];
    sidebarMenus: {
        massageTypes: { name: string; route: string }[];
        wellness: { name: string; route: string }[];
        services: { name: string; route: string }[];
    };
    heroContent: {
        title: string;
        subtitle: string;
        description: string;
    };
    industryFocus: string;
    culturalElements: string[];
}

// Country-specific content configurations
export const COUNTRY_CONTENT: Record<string, CountryContent> = {
    // VIETNAM - Vietnamese Massage Industry
    VN: {
        code: 'VN',
        name: 'Vietnam',
        flag: '🇻🇳',
        currency: 'VND',
        language: 'vi',
        massageTypes: [
            {
                id: 'vietnamese-traditional',
                name: 'Vietnamese Traditional Massage',
                description: 'Ancient Vietnamese healing techniques with bamboo and herbs',
                image: 'https://ik.imagekit.io/7grri5v7d/vietnamese-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 300000, max: 800000, currency: 'VND' }
            },
            {
                id: 'bamboo-massage',
                name: 'Bamboo Massage',
                description: 'Traditional Vietnamese bamboo rolling massage',
                image: 'https://ik.imagekit.io/7grri5v7d/bamboo-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 400000, max: 900000, currency: 'VND' }
            },
            {
                id: 'vietnamese-aromatherapy',
                name: 'Vietnamese Aromatherapy',
                description: 'Essential oils from Vietnamese medicinal herbs',
                image: 'https://ik.imagekit.io/7grri5v7d/vietnamese-aromatherapy.jpg',
                popular: true,
                traditional: false,
                price: { min: 500000, max: 1200000, currency: 'VND' }
            },
            {
                id: 'coin-massage',
                name: 'Cao Gio (Coin Massage)',
                description: 'Traditional Vietnamese coin scraping therapy',
                image: 'https://ik.imagekit.io/7grri5v7d/cao-gio.jpg',
                popular: false,
                traditional: true,
                price: { min: 250000, max: 600000, currency: 'VND' }
            },
            {
                id: 'vietnamese-reflexology',
                name: 'Vietnamese Reflexology',
                description: 'Foot massage with Vietnamese herbal treatments',
                image: 'https://ik.imagekit.io/7grri5v7d/vietnamese-reflexology.jpg',
                popular: true,
                traditional: true,
                price: { min: 200000, max: 500000, currency: 'VND' }
            }
        ],
        sidebarMenus: {
            massageTypes: [
                { name: 'Vietnamese Traditional', route: '/vietnam/vietnamese-traditional' },
                { name: 'Bamboo Massage', route: '/vietnam/bamboo-massage' },
                { name: 'Vietnamese Aromatherapy', route: '/vietnam/aromatherapy' },
                { name: 'Cao Gio', route: '/vietnam/cao-gio' },
                { name: 'Vietnamese Reflexology', route: '/vietnam/reflexology' }
            ],
            wellness: [
                { name: 'Ho Chi Minh City Spas', route: '/vietnam/ho-chi-minh-spas' },
                { name: 'Hanoi Wellness Centers', route: '/vietnam/hanoi-wellness' },
                { name: 'Da Nang Beach Massage', route: '/vietnam/da-nang-massage' },
                { name: 'Hoi An Traditional Therapy', route: '/vietnam/hoi-an-therapy' }
            ],
            services: [
                { name: 'Mobile Massage Vietnam', route: '/vietnam/mobile-massage' },
                { name: 'Hotel Massage Services', route: '/vietnam/hotel-massage' },
                { name: 'Corporate Wellness VN', route: '/vietnam/corporate-wellness' }
            ]
        },
        heroContent: {
            title: 'Vietnam\'s Premier Massage Platform',
            subtitle: 'Traditional Vietnamese Wellness & Modern Spa Services',
            description: 'Connect with certified Vietnamese massage therapists offering traditional techniques from Ho Chi Minh City to Hanoi'
        },
        industryFocus: 'Vietnamese traditional massage and wellness industry',
        culturalElements: ['Bamboo therapy', 'Herbal medicine', 'Cao Gio', 'Traditional Vietnamese healing']
    },

    // THAILAND - Thai Massage Industry
    TH: {
        code: 'TH',
        name: 'Thailand',
        flag: '🇹🇭',
        currency: 'THB',
        language: 'th',
        massageTypes: [
            {
                id: 'thai-traditional',
                name: 'Traditional Thai Massage',
                description: 'Ancient Thai healing art with stretching and pressure points',
                image: 'https://ik.imagekit.io/7grri5v7d/thai-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 300, max: 800, currency: 'THB' }
            },
            {
                id: 'thai-oil-massage',
                name: 'Thai Oil Massage',
                description: 'Relaxing oil massage with Thai techniques',
                image: 'https://ik.imagekit.io/7grri5v7d/thai-oil-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 400, max: 1000, currency: 'THB' }
            },
            {
                id: 'thai-hot-stone',
                name: 'Thai Hot Stone Massage',
                description: 'Thai massage combined with heated stones',
                image: 'https://ik.imagekit.io/7grri5v7d/thai-hot-stone.jpg',
                popular: true,
                traditional: false,
                price: { min: 600, max: 1500, currency: 'THB' }
            },
            {
                id: 'thai-foot-massage',
                name: 'Traditional Thai Foot Massage',
                description: 'Reflexology with traditional Thai techniques',
                image: 'https://ik.imagekit.io/7grri5v7d/thai-foot-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 200, max: 500, currency: 'THB' }
            },
            {
                id: 'royal-thai-massage',
                name: 'Royal Thai Massage',
                description: 'Premium Thai massage in royal tradition',
                image: 'https://ik.imagekit.io/7grri5v7d/royal-thai-massage.jpg',
                popular: false,
                traditional: true,
                price: { min: 1000, max: 2500, currency: 'THB' }
            }
        ],
        sidebarMenus: {
            massageTypes: [
                { name: 'Traditional Thai', route: '/thailand/traditional-thai' },
                { name: 'Thai Oil Massage', route: '/thailand/oil-massage' },
                { name: 'Thai Hot Stone', route: '/thailand/hot-stone' },
                { name: 'Thai Foot Massage', route: '/thailand/foot-massage' },
                { name: 'Royal Thai', route: '/thailand/royal-thai' }
            ],
            wellness: [
                { name: 'Bangkok Spas', route: '/thailand/bangkok-spas' },
                { name: 'Chiang Mai Wellness', route: '/thailand/chiang-mai-wellness' },
                { name: 'Phuket Beach Massage', route: '/thailand/phuket-massage' },
                { name: 'Koh Samui Spas', route: '/thailand/koh-samui-spas' }
            ],
            services: [
                { name: 'Mobile Massage Thailand', route: '/thailand/mobile-massage' },
                { name: 'Hotel Spa Services', route: '/thailand/hotel-spa' },
                { name: 'Thai Wellness Retreats', route: '/thailand/wellness-retreats' }
            ]
        },
        heroContent: {
            title: 'Thailand\'s Traditional Massage Network',
            subtitle: 'Authentic Thai Healing & Premium Spa Experiences',
            description: 'Discover certified Thai massage therapists offering traditional techniques across Bangkok, Chiang Mai, and beyond'
        },
        industryFocus: 'Traditional Thai massage and wellness tourism industry',
        culturalElements: ['Thai yoga massage', 'Herbal compress', 'Traditional healing', 'Buddhist wellness philosophy']
    },

    // MALAYSIA - Malaysian Massage Industry
    MY: {
        code: 'MY',
        name: 'Malaysia',
        flag: '🇲🇾',
        currency: 'MYR',
        language: 'ms',
        massageTypes: [
            {
                id: 'malay-traditional',
                name: 'Traditional Malay Massage',
                description: 'Ancient Malay healing techniques with herbs',
                image: 'https://ik.imagekit.io/7grri5v7d/malay-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 60, max: 150, currency: 'MYR' }
            },
            {
                id: 'urut-batin',
                name: 'Urut Batin',
                description: 'Traditional Malay deep tissue massage',
                image: 'https://ik.imagekit.io/7grri5v7d/urut-batin.jpg',
                popular: true,
                traditional: true,
                price: { min: 80, max: 180, currency: 'MYR' }
            },
            {
                id: 'javanese-massage',
                name: 'Javanese Massage',
                description: 'Traditional Javanese techniques popular in Malaysia',
                image: 'https://ik.imagekit.io/7grri5v7d/javanese-massage.jpg',
                popular: false,
                traditional: true,
                price: { min: 70, max: 160, currency: 'MYR' }
            },
            {
                id: 'malay-reflexology',
                name: 'Malay Reflexology',
                description: 'Foot massage with Malaysian herbal oils',
                image: 'https://ik.imagekit.io/7grri5v7d/malay-reflexology.jpg',
                popular: true,
                traditional: true,
                price: { min: 50, max: 120, currency: 'MYR' }
            },
            {
                id: 'borneo-massage',
                name: 'Borneo Traditional Massage',
                description: 'Indigenous Borneo healing techniques',
                image: 'https://ik.imagekit.io/7grri5v7d/borneo-massage.jpg',
                popular: false,
                traditional: true,
                price: { min: 90, max: 200, currency: 'MYR' }
            }
        ],
        sidebarMenus: {
            massageTypes: [
                { name: 'Traditional Malay', route: '/malaysia/traditional-malay' },
                { name: 'Urut Batin', route: '/malaysia/urut-batin' },
                { name: 'Javanese Massage', route: '/malaysia/javanese' },
                { name: 'Malay Reflexology', route: '/malaysia/reflexology' },
                { name: 'Borneo Traditional', route: '/malaysia/borneo' }
            ],
            wellness: [
                { name: 'Kuala Lumpur Spas', route: '/malaysia/kuala-lumpur-spas' },
                { name: 'Penang Wellness', route: '/malaysia/penang-wellness' },
                { name: 'Johor Bahru Massage', route: '/malaysia/johor-massage' },
                { name: 'Langkawi Spa Resorts', route: '/malaysia/langkawi-spas' }
            ],
            services: [
                { name: 'Mobile Massage MY', route: '/malaysia/mobile-massage' },
                { name: 'Hotel Wellness Services', route: '/malaysia/hotel-wellness' },
                { name: 'Corporate Massage MY', route: '/malaysia/corporate-massage' }
            ]
        },
        heroContent: {
            title: 'Malaysia\'s Wellness Platform',
            subtitle: 'Traditional Malay Healing & Modern Spa Services',
            description: 'Connect with certified Malaysian therapists offering traditional Malay massage across KL, Penang, and beyond'
        },
        industryFocus: 'Malaysian traditional massage and wellness industry',
        culturalElements: ['Malay traditional healing', 'Herbal remedies', 'Urut techniques', 'Islamic wellness principles']
    },

    // SINGAPORE - Singaporean Wellness Industry
    SG: {
        code: 'SG',
        name: 'Singapore',
        flag: '🇸🇬',
        currency: 'SGD',
        language: 'en',
        massageTypes: [
            {
                id: 'singapore-blend',
                name: 'Singapore Fusion Massage',
                description: 'Multicultural massage techniques blended uniquely in Singapore',
                image: 'https://ik.imagekit.io/7grri5v7d/singapore-massage.jpg',
                popular: true,
                traditional: false,
                price: { min: 80, max: 200, currency: 'SGD' }
            },
            {
                id: 'chinese-tui-na',
                name: 'Traditional Chinese Tui Na',
                description: 'TCM massage techniques popular in Singapore',
                image: 'https://ik.imagekit.io/7grri5v7d/tui-na.jpg',
                popular: true,
                traditional: true,
                price: { min: 60, max: 150, currency: 'SGD' }
            },
            {
                id: 'ayurvedic-singapore',
                name: 'Ayurvedic Massage',
                description: 'Traditional Indian Ayurvedic treatments in Singapore',
                image: 'https://ik.imagekit.io/7grri5v7d/ayurvedic.jpg',
                popular: true,
                traditional: true,
                price: { min: 90, max: 220, currency: 'SGD' }
            },
            {
                id: 'luxury-spa-singapore',
                name: 'Premium Spa Treatments',
                description: 'High-end spa experiences unique to Singapore',
                image: 'https://ik.imagekit.io/7grri5v7d/luxury-spa.jpg',
                popular: true,
                traditional: false,
                price: { min: 150, max: 400, currency: 'SGD' }
            },
            {
                id: 'reflexology-singapore',
                name: 'Singapore Reflexology',
                description: 'Multi-cultural reflexology techniques',
                image: 'https://ik.imagekit.io/7grri5v7d/sg-reflexology.jpg',
                popular: true,
                traditional: false,
                price: { min: 50, max: 120, currency: 'SGD' }
            }
        ],
        sidebarMenus: {
            massageTypes: [
                { name: 'Singapore Fusion', route: '/singapore/fusion-massage' },
                { name: 'Chinese Tui Na', route: '/singapore/tui-na' },
                { name: 'Ayurvedic Massage', route: '/singapore/ayurvedic' },
                { name: 'Premium Spa', route: '/singapore/premium-spa' },
                { name: 'Reflexology', route: '/singapore/reflexology' }
            ],
            wellness: [
                { name: 'Orchard Road Spas', route: '/singapore/orchard-spas' },
                { name: 'Marina Bay Wellness', route: '/singapore/marina-wellness' },
                { name: 'Sentosa Spa Resorts', route: '/singapore/sentosa-spas' },
                { name: 'Chinatown TCM', route: '/singapore/chinatown-tcm' }
            ],
            services: [
                { name: 'Mobile Massage SG', route: '/singapore/mobile-massage' },
                { name: 'Hotel Spa Services', route: '/singapore/hotel-spa' },
                { name: 'Corporate Wellness SG', route: '/singapore/corporate-wellness' }
            ]
        },
        heroContent: {
            title: 'Singapore\'s Premier Wellness Network',
            subtitle: 'Multicultural Healing & Luxury Spa Experiences',
            description: 'Experience the best of Asian wellness traditions in Singapore\'s diverse therapeutic landscape'
        },
        industryFocus: 'Singapore\'s multicultural wellness and luxury spa industry',
        culturalElements: ['Multicultural healing', 'TCM integration', 'Luxury wellness', 'Urban spa culture']
    },

    // INDONESIA - Indonesian/Balinese Industry (existing)
    ID: {
        code: 'ID',
        name: 'Indonesia',
        flag: '🇮🇩',
        currency: 'IDR',
        language: 'id',
        massageTypes: [
            {
                id: 'balinese-massage',
                name: 'Balinese Massage',
                description: 'Traditional Balinese healing with essential oils and gentle stretches',
                image: 'https://ik.imagekit.io/7grri5v7d/balinese-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 150000, max: 500000, currency: 'IDR' }
            },
            {
                id: 'javanese-massage',
                name: 'Javanese Traditional Massage',
                description: 'Ancient Javanese healing techniques with herbs',
                image: 'https://ik.imagekit.io/7grri5v7d/javanese-massage.jpg',
                popular: true,
                traditional: true,
                price: { min: 120000, max: 400000, currency: 'IDR' }
            },
            {
                id: 'indonesian-aromatherapy',
                name: 'Indonesian Aromatherapy',
                description: 'Traditional Indonesian oils and modern aromatherapy',
                image: 'https://ik.imagekit.io/7grri5v7d/indonesian-aromatherapy.jpg',
                popular: true,
                traditional: false,
                price: { min: 200000, max: 600000, currency: 'IDR' }
            }
        ],
        sidebarMenus: {
            massageTypes: [
                { name: 'Balinese Massage', route: '/indonesia/balinese-massage' },
                { name: 'Javanese Traditional', route: '/indonesia/javanese-massage' },
                { name: 'Indonesian Aromatherapy', route: '/indonesia/aromatherapy' },
                { name: 'Deep Tissue', route: '/indonesia/deep-tissue' },
                { name: 'Hot Stone Massage', route: '/indonesia/hot-stone' }
            ],
            wellness: [
                { name: 'Bali Spa Experience', route: '/indonesia/bali-spa' },
                { name: 'Jakarta Wellness', route: '/indonesia/jakarta-wellness' },
                { name: 'Yogyakarta Traditional', route: '/indonesia/yogyakarta-massage' },
                { name: 'Bandung Mountain Spa', route: '/indonesia/bandung-spa' }
            ],
            services: [
                { name: 'Mobile Massage ID', route: '/indonesia/mobile-massage' },
                { name: 'Hotel Massage Services', route: '/indonesia/hotel-massage' },
                { name: 'Corporate Wellness ID', route: '/indonesia/corporate-wellness' }
            ]
        },
        heroContent: {
            title: 'Indonesia\'s Traditional Massage Platform',
            subtitle: 'Balinese Healing & Indonesian Wellness Traditions',
            description: 'Connect with certified Indonesian therapists offering traditional Balinese and Javanese massage techniques'
        },
        industryFocus: 'Indonesian traditional massage and Balinese wellness industry',
        culturalElements: ['Balinese healing', 'Javanese traditions', 'Indonesian herbs', 'Island wellness culture']
    }
};

// Helper functions
export const getCountryContent = (countryCode: string): CountryContent | null => {
    return COUNTRY_CONTENT[countryCode] || null;
};

export const getSupportedCountries = (): string[] => {
    return Object.keys(COUNTRY_CONTENT);
};

export const getCountryMassageTypes = (countryCode: string): CountryMassageType[] => {
    const content = getCountryContent(countryCode);
    return content?.massageTypes || [];
};

export const getCountrySidebarMenus = (countryCode: string) => {
    const content = getCountryContent(countryCode);
    return content?.sidebarMenus || null;
};