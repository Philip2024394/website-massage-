import React, { useState } from 'react';

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
}

const BlogIndexPage: React.FC = () => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const categories = [
        { id: 'all', name: 'All Articles', count: 24 },
        { id: 'industry', name: 'Industry Trends', count: 8 },
        { id: 'techniques', name: 'Massage Techniques', count: 6 },
        { id: 'career', name: 'Career Advice', count: 5 },
        { id: 'wellness', name: 'Wellness Tips', count: 5 },
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
            image: '🌺',
            featured: true
        },
        {
            id: '2',
            title: 'Top 10 Massage Techniques Every Professional Should Master',
            excerpt: 'From traditional Balinese to hot stone therapy, explore the essential massage techniques that make you a versatile and sought-after therapist.',
            category: 'techniques',
            readTime: '12 min read',
            date: 'Oct 15, 2025',
            author: 'Made Surya',
            image: '💆',
            featured: true
        },
        {
            id: '3',
            title: 'How to Build a Successful Massage Career in Indonesia',
            excerpt: 'Practical steps to establish yourself as a professional therapist: certifications, marketing, client retention, and growing your income.',
            category: 'career',
            readTime: '10 min read',
            date: 'Oct 10, 2025',
            author: 'Wayan Putra',
            image: '🎯',
            featured: true
        },
        {
            id: '4',
            title: 'The Benefits of Regular Massage Therapy: A Scientific Guide',
            excerpt: 'Evidence-based research on how regular massage improves circulation, reduces stress, relieves pain, and enhances overall wellness.',
            category: 'wellness',
            readTime: '7 min read',
            date: 'Oct 5, 2025',
            author: 'Dr. Sarah Chen',
            image: '🔬',
            featured: false
        },
        {
            id: '5',
            title: 'Hiring Qualified Massage Therapists: A Hotel Manager\'s Guide',
            excerpt: 'Essential tips for hotel and spa managers on recruiting, vetting, and retaining top massage professionals for your property.',
            category: 'industry',
            readTime: '9 min read',
            date: 'Sep 28, 2025',
            author: 'Komang Dewi',
            image: '🏨',
            featured: false
        },
        {
            id: '6',
            title: 'Traditional Balinese Massage: History, Techniques & Benefits',
            excerpt: 'Deep dive into the 1,000-year-old healing tradition combining acupressure, reflexology, and aromatherapy unique to Bali.',
            category: 'techniques',
            readTime: '11 min read',
            date: 'Sep 20, 2025',
            author: 'I Nyoman Rai',
            image: '🌿',
            featured: false
        },
        {
            id: '7',
            title: 'Spa Tourism in Indonesia: Growth Opportunities for Therapists',
            excerpt: 'Indonesia attracts millions of wellness tourists annually. Learn how therapists can capitalize on this booming market.',
            category: 'industry',
            readTime: '6 min read',
            date: 'Sep 15, 2025',
            author: 'Kadek Ayu',
            image: '📈',
            featured: false
        },
        {
            id: '8',
            title: 'Aromatherapy Essentials: Choosing the Right Oils for Massage',
            excerpt: 'Complete guide to essential oils: lavender for relaxation, eucalyptus for pain relief, and how to blend oils for maximum therapeutic effect.',
            category: 'techniques',
            readTime: '8 min read',
            date: 'Sep 10, 2025',
            author: 'Putu Sari',
            image: '🌸',
            featured: false
        },
        {
            id: '9',
            title: 'Setting Your Rates: Pricing Guide for Freelance Therapists',
            excerpt: 'How to price your services competitively based on location, experience, specialty, and market demand in Indonesia.',
            category: 'career',
            readTime: '7 min read',
            date: 'Sep 5, 2025',
            author: 'Gede Wira',
            image: '💰',
            featured: false
        },
        {
            id: '10',
            title: 'Deep Tissue vs Swedish Massage: When to Use Each Technique',
            excerpt: 'Understand the key differences between massage styles and how to recommend the right treatment for each client\'s needs.',
            category: 'techniques',
            readTime: '9 min read',
            date: 'Aug 30, 2025',
            author: 'Made Alit',
            image: '💪',
            featured: false
        },
        {
            id: '11',
            title: 'Building Your Online Presence as a Massage Therapist',
            excerpt: 'Social media strategies, profile optimization, and digital marketing tips to attract more clients and bookings.',
            category: 'career',
            readTime: '10 min read',
            date: 'Aug 25, 2025',
            author: 'Ketut Maya',
            image: '📱',
            featured: false
        },
        {
            id: '12',
            title: 'The Rise of Wellness Tourism in Ubud: Opportunities for Therapists',
            excerpt: 'Why Ubud became the wellness capital of Bali and how therapists can tap into the yoga, meditation, and holistic healing market.',
            category: 'industry',
            readTime: '8 min read',
            date: 'Aug 20, 2025',
            author: 'Wayan Surya',
            image: '🧘',
            featured: false
        },
    ];

    const filteredPosts = selectedCategory === 'all' 
        ? blogPosts 
        : blogPosts.filter(post => post.category === selectedCategory);

    const featuredPosts = blogPosts.filter(post => post.featured);

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-20">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className="text-5xl font-bold mb-6">IndaStreet Wellness Blog</h1>
                    <p className="text-xl text-purple-100 max-w-3xl mx-auto">
                        Industry insights, professional tips, and wellness knowledge for Indonesia's massage community
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-16">
                {/* Category Filter */}
                <div className="mb-12">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-6 py-3 rounded-full font-bold transition-all ${
                                    selectedCategory === cat.id
                                        ? 'bg-purple-600 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-purple-50 shadow'
                                }`}
                            >
                                {cat.name} ({cat.count})
                            </button>
                        ))}
                    </div>
                </div>

                {/* Featured Posts */}
                {selectedCategory === 'all' && (
                    <div className="mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {featuredPosts.map((post) => (
                                <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="bg-gradient-to-br from-purple-500 to-blue-500 h-48 flex items-center justify-center text-8xl">
                                        {post.image}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                                {categories.find(c => c.id === post.category)?.name}
                                            </span>
                                            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                                                Featured
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                            {post.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <span>{post.date}</span>
                                            <span>{post.readTime}</span>
                                        </div>
                                        <button className="w-full py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors">
                                            Read Article
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Posts Grid */}
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">
                        {selectedCategory === 'all' ? 'All Articles' : categories.find(c => c.id === selectedCategory)?.name}
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPosts.map((post) => (
                            <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                                <div className="bg-gradient-to-br from-blue-400 to-purple-400 h-32 flex items-center justify-center text-6xl">
                                    {post.image}
                                </div>
                                <div className="p-5">
                                    <div className="mb-2">
                                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                            {categories.find(c => c.id === post.category)?.name}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                        <span>{post.date}</span>
                                        <span>{post.readTime}</span>
                                    </div>
                                    <button className="w-full py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition-colors text-sm">
                                        Read More
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="mt-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl p-12 text-white text-center">
                    <h2 className="text-3xl font-bold mb-4">Stay Updated with Wellness Industry Insights</h2>
                    <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
                        Get weekly articles, industry trends, and professional tips delivered to your inbox
                    </p>
                    <div className="max-w-md mx-auto flex gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 px-4 py-3 rounded-lg text-gray-900"
                        />
                        <button className="px-8 py-3 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-colors">
                            Subscribe
                        </button>
                    </div>
                </div>

                {/* Popular Topics */}
                <div className="mt-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Topics</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {['Balinese Massage', 'Hotel Spa Management', 'Therapist Certification', 'Wellness Tourism', 'Deep Tissue Techniques', 'Career Growth', 'Client Retention', 'Aromatherapy'].map((topic, i) => (
                            <div key={i} className="bg-white rounded-lg p-4 shadow hover:shadow-lg transition-shadow text-center cursor-pointer">
                                <span className="text-gray-700 font-semibold">{topic}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogIndexPage;
