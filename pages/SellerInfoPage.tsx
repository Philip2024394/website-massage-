import React from 'react';

type Props = {
  onNavigate?: (page: string) => void;
  onBack?: () => void;
};

const SellerInfoPage: React.FC<Props> = ({ onNavigate, onBack }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50/30 to-gray-50">
      <style>{`
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.8; } }
        @keyframes slideInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .float { animation: float 3s ease-in-out infinite; }
        .pulse { animation: pulse 2s ease-in-out infinite; }
        .slide-in { animation: slideInUp 0.6s ease-out forwards; }
      `}</style>

      {/* Header */}
      <header className="bg-white shadow-lg border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <button 
            onClick={() => onBack?.()}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-xl sm:text-2xl font-black">
            <span className="text-black">Inda</span>
            <span className="bg-gradient-to-r from-orange-600 to-orange-500 bg-clip-text text-transparent">Street</span>
          </h1>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white py-16 sm:py-24">
        <div className="absolute inset-0 bg-[url('https://ik.imagekit.io/7grri5v7d/massage%20shops.png')] bg-cover bg-center opacity-10"></div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-white/10 rounded-full blur-3xl float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300/20 rounded-full blur-3xl float" style={{ animationDelay: '1s' }}></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full mb-6 shadow-lg slide-in">
            <span className="font-semibold text-sm">🚀 Launch Your Business Today</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 leading-tight slide-in" style={{ animationDelay: '0.1s' }}>
            Start Selling on<br />
            <span className="text-amber-100">IndaStreet Massage Warehouse</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8 font-medium leading-relaxed slide-in" style={{ animationDelay: '0.2s' }}>
            Connect with thousands of massage therapists, spa owners, and wellness enthusiasts worldwide
          </p>
          
          <button 
            onClick={() => onNavigate?.('supplierAuth')}
            className="slide-in inline-flex items-center gap-3 px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300"
            style={{ animationDelay: '0.3s' }}
          >
            <span>Get Started Now</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {/* Key Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 sm:gap-8 mb-16">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center mb-4 float">
              <span className="text-2xl">💰</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">100% Earnings</h3>
            <p className="text-gray-600 leading-relaxed">
              Keep every cent you make. <strong>No commission fees</strong>, no hidden charges eating away at your profit margins. You pocket 100% of your earnings.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center mb-4 float" style={{ animationDelay: '0.2s' }}>
              <span className="text-2xl">🌍</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
            <p className="text-gray-600 leading-relaxed">
              List your products <strong>locally or in any country</strong> on the globe. Reach customers from around the world or just down the road.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center mb-4 float" style={{ animationDelay: '0.4s' }}>
              <span className="text-2xl">☕</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Affordable Pricing</h3>
            <p className="text-gray-600 leading-relaxed">
              Get seen by <strong>thousands of customers</strong> for as little as the price of a morning coffee at Starbucks. Minimum cost, maximum exposure.
            </p>
          </div>
        </div>

        {/* Main Content Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden mb-12">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Left: Image/Visual */}
            <div className="relative bg-gradient-to-br from-orange-100 to-orange-200 p-12 flex items-center justify-center">
              <div className="text-center">
                <div className="text-8xl mb-6 pulse">🛍️</div>
                <h3 className="text-2xl font-bold text-orange-900 mb-2">Your Store</h3>
                <p className="text-orange-700">On the World's Stage</p>
              </div>
              <div className="absolute top-6 left-6 w-32 h-32 bg-orange-300/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-6 right-6 w-40 h-40 bg-yellow-300/30 rounded-full blur-2xl"></div>
            </div>

            {/* Right: Content */}
            <div className="p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
                Why IndaStreet Massage Warehouse?
              </h2>
              
              <div className="space-y-5 text-gray-700 leading-relaxed">
                <p className="text-lg">
                  Connect <strong>retail with wholesale</strong> and reach users who come to our app for massage services and shop in the marketplace for home DIY items or supplies for their massage therapists.
                </p>
                
                <p className="text-lg">
                  <strong>The possibilities are endless</strong> as a seller with IndaStreet Massage Warehouse—bringing new customers from around the globe or just down the road.
                </p>
                
                <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded-r-xl my-6">
                  <p className="text-orange-900 font-semibold text-lg mb-2">
                    🎯 Most Advanced, User-Friendly Interface
                  </p>
                  <p className="text-orange-800">
                    List products locally or in any country on the globe. Reach thousands of customers who rely on massage supplies daily and weekly.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <span className="text-green-600">✓</span> No Hidden Fees
                  </h4>
                  <p className="ml-7">
                    It's as simple as: <strong>List your product → Sell your product → Agree payment terms with your customer → Pocket 100% of earnings</strong>. No more commissions eating away at profit levels.
                  </p>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                    <span className="text-blue-600">✓</span> Equal Service for All
                  </h4>
                  <p className="ml-7">
                    We aim to keep our prices at the <strong>lowest possible</strong> to allow every retail and wholesale outlet the same level of service at minimum cost.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-black text-center text-gray-900 mb-12">
            How It Works
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '📝', title: 'Sign Up', desc: 'Create your seller account in minutes' },
              { step: '2', icon: '📦', title: 'List Products', desc: 'Add your products with photos and details' },
              { step: '3', icon: '🤝', title: 'Connect with Buyers', desc: 'Agree on terms and close the sale' },
              { step: '4', icon: '💵', title: 'Get Paid', desc: 'Receive 100% of your earnings directly' },
            ].map((item, i) => (
              <div key={i} className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 shadow-lg border border-gray-200 hover:border-orange-300 transition-all">
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg">
                  {item.step}
                </div>
                <div className="text-5xl mb-4 mt-4">{item.icon}</div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 rounded-3xl p-12 sm:p-16 text-center text-white shadow-2xl">
          <h2 className="text-3xl sm:text-5xl font-black mb-6">
            So What Are You Waiting For?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed">
            IndaStreet is <strong>the place to be found</strong> for massage-related services and products. Join thousands of sellers already growing their business with us.
          </p>
          <button 
            onClick={() => onNavigate?.('supplierAuth')}
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-orange-600 rounded-full font-black text-xl shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300"
          >
            <span>Start Selling Today</span>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="mt-6 text-white/80 text-sm">
            ⚡ Setup takes less than 5 minutes • No credit card required
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-gray-400">
            © 2025 IndaStreet Massage Warehouse. Empowering sellers worldwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SellerInfoPage;
