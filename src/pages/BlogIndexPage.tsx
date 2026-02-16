// 🎯 AUTO-FIXED: Mobile scroll architecture violations (1 fixes)
import React, { useState } from 'react';
import { AppDrawer } from '../components/AppDrawerClean';
import UniversalHeader from '../components/shared/UniversalHeader';

/** Map blog slug (from post.slug) to router page id for navigation */
const BLOG_SLUG_TO_PAGE: Record<string, string> = {
  'bali-spa-industry-trends-2025': 'blog-bali-spa-trends-2025',
  'top-10-massage-techniques': 'blog-top-10-massage-techniques',
  'massage-career-indonesia': 'blog-massage-career-indonesia',
  'benefits-regular-massage-therapy': 'blog-benefits-regular-massage',
  'hiring-massage-therapists-guide': 'blog-hiring-massage-therapists',
  'traditional-balinese-massage': 'blog-traditional-balinese-massage',
  'spa-tourism-indonesia': 'blog-spa-tourism-indonesia',
  'aromatherapy-massage-oils': 'blog-aromatherapy-massage-oils',
  'pricing-guide-massage-therapists': 'blog-pricing-guide-massage',
  'deep-tissue-vs-swedish-massage': 'blog-deep-tissue-vs-swedish',
  'online-presence-massage-therapist': 'blog-online-presence-therapist',
  'wellness-tourism-ubud': 'blog-wellness-tourism-ubud',
  'wellness-southeast-asia': 'blog-wellness-southeast-asia',
  'massage-spa-standards-asia-europe': 'blog-massage-spa-standards-asia-europe',
  'skin-clinic-trends-international': 'blog-skin-clinic-trends-international',
  'building-wellness-business-international': 'blog-building-wellness-business-international',
};

interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    category: string;
    readTime: string;
    date: string;
    author: string;
    image: string;
    featured: boolean;
    slug: string;
}

interface BlogIndexPageProps {
    onNavigate?: (page: string) => void;
    onLanguageChange?: (lang: string) => void;
    language?: 'en' | 'id';
    t?: any;
    // Add navigation props for the drawer
    onMassageJobsClick?: () => void;

    onVillaPortalClick?: () => void;
    onTherapistPortalClick?: () => void;
    onMassagePlacePortalClick?: () => void;
    onAgentPortalClick?: () => void;
    onCustomerPortalClick?: () => void;
    onAdminPortalClick?: () => void;
    onTermsClick?: () => void;
    onPrivacyClick?: () => void;
    therapists?: any[];
    places?: any[];
}

const BlogIndexPage: React.FC<BlogIndexPageProps> = ({ 
    onNavigate,
    onLanguageChange,
    language = 'id',
    t,
    onMassageJobsClick,

    onVillaPortalClick,
    onTherapistPortalClick,
    onMassagePlacePortalClick,
    onAgentPortalClick,
    onCustomerPortalClick,
    onAdminPortalClick,
    onTermsClick,
    onPrivacyClick,
    therapists = [],
    places = []
}) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const categories = [
        { id: 'all', name: t?.blog?.categoryAll || 'All Articles', count: 16 },
        { id: 'international', name: t?.blog?.categoryInternational || 'International', count: 4 },
        { id: 'industry', name: t?.blog?.categoryIndustry || 'Industry Trends', count: 4 },
        { id: 'techniques', name: t?.blog?.categoryTechniques || 'Massage Techniques', count: 4 },
        { id: 'career', name: t?.blog?.categoryCareer || 'Career Advice', count: 3 },
        { id: 'wellness', name: t?.blog?.categoryWellness || 'Wellness Tips', count: 1 },
    ];

    const blogPosts: BlogPost[] = [
        {
            id: '1',
            title: 'Bali Spa Industry Trends 2025: What Therapists Need to Know',
            excerpt: 'Discover the latest trends shaping Bali\'s wellness industry, from wellness tourism growth to new massage modalities gaining popularity among tourists.',
            category: 'industry',
            readTime: '8 min read',
            date: 'Oct 20, 2025',
            author: 'Dr. Ketut Wijaya',
            image: 'https://ik.imagekit.io/7grri5v7d/bali%20message.png?updatedAt=1761560198622',
            featured: true,
            slug: 'bali-spa-industry-trends-2025'
        },
        {
            id: '2',
            title: 'Top 10 Massage Techniques Every Professional Should Master',
            excerpt: 'From traditional Balinese to hot stone therapy, explore the essential massage techniques that make you a versatile and sought-after therapist.',
            category: 'techniques',
            readTime: '12 min read',
            date: 'Oct 15, 2025',
            author: 'Made Surya',
            image: 'https://ik.imagekit.io/7grri5v7d/bali%20messages.png?updatedAt=1761560397225',
            featured: true,
            slug: 'top-10-massage-techniques'
        },
        {
            id: '3',
            title: 'How to Build a Successful Massage Career in Indonesia',
            excerpt: 'Practical steps to establish yourself as a professional therapist: certifications, marketing, client retention, and growing your income.',
            category: 'career',
            readTime: '10 min read',
            date: 'Oct 10, 2025',
            author: 'Wayan Putra',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20buisness%20indonisea.png?updatedAt=1761560581906',
            featured: true,
            slug: 'massage-career-indonesia'
        },
        {
            id: '4',
            title: 'The Benefits of Regular Massage Therapy: A Scientific Guide',
            excerpt: 'Evidence-based research on how regular massage improves circulation, reduces stress, relieves pain, and enhances overall wellness.',
            category: 'wellness',
            readTime: '7 min read',
            date: 'Oct 5, 2025',
            author: 'Dr. Sarah Chen',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20buisness%20indonisea%20jogja.png?updatedAt=1761560769019',
            featured: false,
            slug: 'benefits-regular-massage-therapy'
        },
        {
            id: '5',
            title: 'Hiring Qualified Massage Therapists: A Hotel Manager\'s Guide',
            excerpt: 'Essential tips for hotel and spa managers on recruiting, vetting, and retaining top massage professionals for your property.',
            category: 'industry',
            readTime: '9 min read',
            date: 'Sep 28, 2025',
            author: 'Komang Dewi',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20sfatt%20indonisea.png?updatedAt=1761560942135',
            featured: false,
            slug: 'hiring-massage-therapists-guide'
        },
        {
            id: '6',
            title: 'Traditional Balinese Massage: History, Techniques & Benefits',
            excerpt: 'Deep dive into the 1,000-year-old healing tradition combining acupressure, reflexology, and aromatherapy unique to Bali.',
            category: 'techniques',
            readTime: '11 min read',
            date: 'Sep 20, 2025',
            author: 'I Nyoman Rai',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20jogja.png?updatedAt=1761561097008',
            featured: false,
            slug: 'traditional-balinese-massage'
        },
        {
            id: '7',
            title: 'Spa Tourism in Indonesia: Growth Opportunities for Therapists',
            excerpt: 'Indonesia attracts millions of wellness tourists annually. Learn how therapists can capitalize on this booming market.',
            category: 'industry',
            readTime: '6 min read',
            date: 'Sep 15, 2025',
            author: 'Kadek Ayu',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20jogja%20indonisea.png?updatedAt=1761561233215',
            featured: false,
            slug: 'spa-tourism-indonesia'
        },
        {
            id: '8',
            title: 'Aromatherapy Essentials: Choosing the Right Oils for Massage',
            excerpt: 'Complete guide to essential oils: lavender for relaxation, eucalyptus for pain relief, and how to blend oils for maximum therapeutic effect.',
            category: 'techniques',
            readTime: '8 min read',
            date: 'Sep 10, 2025',
            author: 'Putu Sari',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20jogja%20indonisea%20spa.png?updatedAt=1761561397701',
            featured: false,
            slug: 'aromatherapy-massage-oils'
        },
        {
            id: '9',
            title: 'Setting Your Rates: Pricing Guide for Freelance Therapists',
            excerpt: 'How to price your services competitively based on location, experience, specialty, and market demand in Indonesia.',
            category: 'career',
            readTime: '7 min read',
            date: 'Sep 5, 2025',
            author: 'Gede Wira',
            image: 'https://ik.imagekit.io/7grri5v7d/jogja%20massage.png?updatedAt=1761561572184',
            featured: false,
            slug: 'pricing-guide-massage-therapists'
        },
        {
            id: '10',
            title: 'Deep Tissue vs Swedish Massage: When to Use Each Technique',
            excerpt: 'Understand the key differences between massage styles and how to recommend the right treatment for each client\'s needs.',
            category: 'techniques',
            readTime: '9 min read',
            date: 'Aug 30, 2025',
            author: 'Made Alit',
            image: 'https://ik.imagekit.io/7grri5v7d/jogja%20massages.png?updatedAt=1761561725353',
            featured: false,
            slug: 'deep-tissue-vs-swedish-massage'
        },
        {
            id: '11',
            title: 'Building Your Online Presence as a Massage Therapist',
            excerpt: 'Social media strategies, profile optimization, and digital marketing tips to attract more clients and bookings.',
            category: 'career',
            readTime: '10 min read',
            date: 'Aug 25, 2025',
            author: 'Ketut Maya',
            image: 'https://ik.imagekit.io/7grri5v7d/jogja%20massages%20indonisea.png?updatedAt=1761561981004',
            featured: false,
            slug: 'online-presence-massage-therapist'
        },
        {
            id: '12',
            title: 'The Rise of Wellness Tourism in Ubud: Opportunities for Therapists',
            excerpt: 'Why Ubud became the wellness capital of Bali and how therapists can tap into the yoga, meditation, and holistic healing market.',
            category: 'industry',
            readTime: '8 min read',
            date: 'Aug 20, 2025',
            author: 'Wayan Surya',
            image: 'https://ik.imagekit.io/7grri5v7d/udun%20massage%20indonisea.png?updatedAt=1761562212712',
            featured: false,
            slug: 'wellness-tourism-ubud'
        },
        // International posts – multi-country information for therapists, massage places & skin clinics (SEO)
        {
            id: '13',
            title: 'Wellness & Spa Trends Across Southeast Asia: Indonesia, Thailand, Malaysia, Singapore, Vietnam',
            excerpt: 'Compare wellness tourism, massage demand, and spa standards across Southeast Asian markets. Practical insights for therapists and spa owners expanding or operating in multiple countries.',
            category: 'international',
            readTime: '10 min read',
            date: 'Nov 5, 2025',
            author: 'IndaStreet Research',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20therapist%20indonisea.png?updatedAt=1761563061042',
            featured: true,
            slug: 'wellness-southeast-asia'
        },
        {
            id: '14',
            title: 'Massage & Spa Standards: What Therapists and Places Need to Know in Asia and Europe',
            excerpt: 'Regulations, certifications, and best practices for massage and spa services in the UK, Germany, Australia, Philippines, and Southeast Asia. Stay compliant and build trust across markets.',
            category: 'international',
            readTime: '9 min read',
            date: 'Oct 28, 2025',
            author: 'IndaStreet Research',
            image: 'https://ik.imagekit.io/7grri5v7d/bali%20messages.png?updatedAt=1761560397225',
            featured: true,
            slug: 'massage-spa-standards-asia-europe'
        },
        {
            id: '15',
            title: 'Skin Clinic & Facial Trends: Insights from Asia, UK, Australia and Germany',
            excerpt: 'How facial and skin clinic demand differs by region. Trends in treatments, pricing, and digital booking for skin clinics and facial providers in multiple countries.',
            category: 'international',
            readTime: '8 min read',
            date: 'Oct 22, 2025',
            author: 'IndaStreet Research',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20jogja%20indonisea%20spa.png?updatedAt=1761561397701',
            featured: false,
            slug: 'skin-clinic-trends-international'
        },
        {
            id: '16',
            title: 'Building a Massage or Spa Business: Regulations and Opportunities in Multiple Markets',
            excerpt: 'A practical guide to starting or scaling a massage or spa business across different countries. Licensing, hiring, and marketing for therapists, massage places, and skin clinics.',
            category: 'international',
            readTime: '11 min read',
            date: 'Oct 15, 2025',
            author: 'IndaStreet Research',
            image: 'https://ik.imagekit.io/7grri5v7d/massage%20buisness%20indonisea.png?updatedAt=1761560581906',
            featured: false,
            slug: 'building-wellness-business-international'
        },
    ];

    const filteredPosts = selectedCategory === 'all' 
        ? blogPosts 
        : blogPosts.filter(post => post.category === selectedCategory);

    const featuredPosts = blogPosts.filter(post => post.featured);

    const getBlogPageId = (slug: string) => BLOG_SLUG_TO_PAGE[slug] || `blog/${slug}`;

    return (
        <div className="min-h-[calc(100vh-env(safe-area-inset-top)-env(safe-area-inset-bottom))] bg-gray-50">
            <UniversalHeader
                language={language}
                onLanguageChange={onLanguageChange}
                onMenuClick={() => setIsMenuOpen(true)}
                onHomeClick={() => onNavigate?.('home')}
                showHomeButton
            />
            <AppDrawer
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onMassageJobsClick={onMassageJobsClick}
                onVillaPortalClick={onVillaPortalClick}
                onTherapistPortalClick={onTherapistPortalClick}
                onMassagePlacePortalClick={onMassagePlacePortalClick}
                onAgentPortalClick={onAgentPortalClick}
                onCustomerPortalClick={onCustomerPortalClick}
                onAdminPortalClick={onAdminPortalClick}
                onNavigate={onNavigate}
                onTermsClick={onTermsClick}
                onPrivacyClick={onPrivacyClick}
                therapists={therapists}
                places={places}
            />

            {/* Hero – rounded corners, padding below header */}
            <section className="px-4 pt-6 sm:px-6 sm:pt-8">
                <div className="relative w-full aspect-[21/9] min-h-[200px] sm:min-h-[260px] bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden">
                    <img
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20blog.png"
                        alt="Blog – Wellness, massage and skin clinic insights"
                        className="absolute inset-0 w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 text-white">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold drop-shadow-sm">
                            {t?.blog?.title || 'Blog'}
                        </h1>
                        <p className="mt-1 text-sm sm:text-base text-white/90 max-w-xl">
                            {t?.blog?.subtitle ?? (language === 'id'
                                ? 'Artikel untuk terapis, tempat pijat, dan klinik kulit — teknik, tren, dan karier'
                                : 'Insights for therapists, massage places and skin clinics — techniques, trends and career')}
                        </p>
                    </div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
                {/* Category filter – pill style aligned with home */}
                <div className="mb-10 sm:mb-12">
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl transition-all duration-200 text-sm font-semibold whitespace-nowrap ${
                                    selectedCategory === cat.id
                                        ? 'bg-orange-500 text-white shadow-md'
                                        : 'bg-white text-gray-600 hover:bg-orange-50 hover:text-orange-600 border border-gray-200'
                                }`}
                            >
                                <span>{cat.name}</span>
                                <span className={`${selectedCategory === cat.id ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-600'} text-xs font-bold rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center`}>
                                    {cat.count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured – cards with images, same feel as home cards */}
                {selectedCategory === 'all' && (
                    <section className="mb-14 sm:mb-16">
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                            {t?.blog?.featuredArticles || 'Featured Articles'}
                        </h2>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {featuredPosts.map((post) => (
                                <article key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                                    <div className="aspect-[16/10] bg-gray-100 overflow-hidden">
                                        {post.image.startsWith('http') ? (
                                            <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">{post.image}</div>
                                        )}
                                    </div>
                                    <div className="p-5 sm:p-6">
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                                                {categories.find(c => c.id === post.category)?.name}
                                            </span>
                                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
                                                {t?.blog?.featured || 'Featured'}
                                            </span>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <span>{post.date}</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => onNavigate?.(getBlogPageId(post.slug))}
                                            className="w-full py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                                        >
                                            {t?.blog?.readArticle || 'Read Article'}
                                        </button>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                )}

                {/* All articles grid */}
                <section>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">
                        {selectedCategory === 'all' ? (t?.blog?.allArticles || 'All Articles') : categories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {filteredPosts.map((post) => (
                            <article key={post.id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
                                <div className="aspect-[16/10] sm:aspect-video bg-gray-100 overflow-hidden">
                                    {post.image.startsWith('http') ? (
                                        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">{post.image}</div>
                                    )}
                                </div>
                                <div className="p-4 sm:p-5">
                                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-semibold uppercase">
                                        {categories.find(c => c.id === post.category)?.name}
                                    </span>
                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-2 mb-2 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                        <span>{post.date}</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => onNavigate?.(getBlogPageId(post.slug))}
                                        className="w-full py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors text-sm"
                                    >
                                        {t?.blog?.readMore || 'Read More'}
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Newsletter – same block style as home CTA */}
                <section className="mt-14 sm:mt-16">
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="grid md:grid-cols-2 gap-0">
                            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[220px] bg-gray-100">
                                <img
                                    src="https://ik.imagekit.io/7grri5v7d/udun%20massage%20indoniseas.png?updatedAt=1761562429353"
                                    alt="Wellness Industry Insights"
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                                    {t?.blog?.stayUpdated || 'Stay Updated'}
                                </h2>
                                <p className="text-orange-100 text-sm sm:text-base mb-5">
                                    {t?.blog?.newsletterDesc ?? (language === 'id'
                                        ? 'Artikel mingguan untuk terapis, tempat pijat, dan klinik kulit — tren dan tips karier'
                                        : 'Weekly articles for therapists, massage places and skin clinics — trends and career tips')}
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <input
                                        type="email"
                                        placeholder={t?.blog?.enterEmail || 'Enter your email'}
                                        className="flex-1 px-4 py-3 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
                                    />
                                    <button type="button" className="px-6 py-3 bg-white text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-colors whitespace-nowrap">
                                        {t?.blog?.subscribe || 'Subscribe'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Popular topics */}
                <section className="mt-14 sm:mt-16 pb-16 sm:pb-20">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
                        {t?.blog?.popularTopics || 'Popular Topics'}
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                        {([
                            { key: 'balineseMassage', fallback: 'Balinese Massage' },
                            { key: 'hotelSpaManagement', fallback: 'Hotel Spa Management' },
                            { key: 'skinClinicTrends', fallback: 'Skin Clinic Trends' },
                            { key: 'therapistCertification', fallback: 'Therapist Certification' },
                            { key: 'wellnessTourism', fallback: 'Wellness Tourism' },
                            { key: 'deepTissueTechniques', fallback: 'Deep Tissue Techniques' },
                            { key: 'careerGrowth', fallback: 'Career Growth' },
                            { key: 'facialTreatments', fallback: 'Facial Treatments' },
                        ] as const).map((topic, i) => (
                            <div key={i} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow text-center border border-gray-100">
                                <span className="text-gray-700 font-semibold text-sm sm:text-base">{t?.blog?.topics?.[topic.key] || topic.fallback}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default BlogIndexPage;

