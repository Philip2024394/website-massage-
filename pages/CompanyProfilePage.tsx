import React from 'react';
import { ArrowLeft, Building2, Globe, Award, Users, TrendingUp, Shield, Target, Heart, CheckCircle, Download, Share2, MapPin, Mail, Phone, Facebook, Instagram, Linkedin, Home } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';

interface CompanyProfilePageProps {
  onBack: () => void;
}

const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ onBack }) => {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Indastreet Company Profile',
        text: 'Learn about Indastreet - Indonesia\'s Premier Massage Directory Platform',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Generate PDF or link to static PDF file
    window.print();
  };

  const stats = [
    { value: '20+', label: 'Years Combined Experience' },
    { value: '500+', label: 'Verified Massage Partners' },
    { value: '50+', label: 'Cities Covered' },
    { value: '98%', label: 'Customer Satisfaction' },
  ];

  const services = [
    {
      icon: Shield,
      title: 'Verified Partners',
      description: 'Every therapist and spa is personally inspected and certified by our team',
    },
    {
      icon: TrendingUp,
      title: 'Business Analytics',
      description: 'Monitor traffic, reviews, and bookings with actionable insights',
    },
    {
      icon: Globe,
      title: 'International Reach',
      description: 'Connect with tourists and locals across Indonesia and beyond',
    },
    {
      icon: Award,
      title: 'Quality Standards',
      description: 'European-standard compliance adapted for Asian culture',
    },
  ];

  const values = [
    {
      icon: Heart,
      title: 'Trust',
      description: 'Building lasting relationships with verified, ethical businesses',
    },
    {
      icon: Shield,
      title: 'Quality',
      description: 'Maintaining the highest massage therapy standards',
    },
    {
      icon: Users,
      title: 'Partnership',
      description: 'We\'re your partner, not just a platform',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'Cutting-edge technology for modern massage businesses',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <PageContainer className="py-3">
          <div className="flex justify-between items-center">
            <h1 className="text-xl sm:text-2xl font-bold">
              <span className="text-gray-900">Inda</span>
              <span className="text-orange-500">street</span>
            </h1>
            <button 
              onClick={onBack}
              className="p-2 rounded-lg transition-colors text-gray-700 hover:text-orange-500 hover:bg-orange-50 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Home className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </PageContainer>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20">
          <PageContainer>
            <div className="max-w-4xl mx-auto text-center">
              <Building2 className="w-20 h-20 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Company Profile
              </h2>
              <p className="text-xl md:text-2xl mb-8 text-orange-50">
                Indonesia's Premier Massage Directory Platform
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                  Share Profile
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-700 text-white font-semibold rounded-lg hover:bg-orange-800 transition-all shadow-lg"
                >
                  <Download className="w-5 h-5" />
                  Download PDF
                </button>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* About Section */}
        <section className="py-16">
          <PageContainer>
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <h3 className="text-3xl font-bold text-gray-900 mb-6">About Indastreet</h3>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    <span className="font-bold text-orange-600">Indastreet</span> operates under the registered company <span className="font-semibold">PT Hammerex Product Indonesia</span>, established in partnership with European IT specialists residing in Indonesia.
                  </p>
                  
                  <p>
                    Founded in <span className="font-semibold">2007</span>, <span className="font-semibold">Hammerex Products</span> brings over <span className="font-semibold">20 years of experience</span> in marketing and software development, with established connections in major tech platforms. Our team combines cutting-edge IT expertise with deep understanding of the massage therapy industry.
                  </p>

                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                    <p className="font-semibold text-gray-900 mb-2">Our Headquarters:</p>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                        <span><strong>Indonesia Office:</strong> Pleret, Bantul, Yogyakarta, Indonesia</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-orange-600 mt-1 flex-shrink-0" />
                        <span><strong>Europe Office:</strong> Shelbourne Place, Campile, Co Wexford, Ireland</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-orange-600 to-orange-500">
          <PageContainer>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center text-white">
                  <div className="text-4xl md:text-5xl font-bold mb-2">{stat.value}</div>
                  <div className="text-orange-100 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </PageContainer>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <PageContainer>
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Mission & Vision</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Mission */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <Target className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Our Mission</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    To regulate and elevate the massage therapy industry in Indonesia by providing a trusted, verified platform that protects legitimate businesses from the underground, unregulated market. We empower massage investors and therapists to stand out with proven credentials, ethical practices, and professional standards.
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <TrendingUp className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="text-2xl font-bold text-gray-900">Our Vision (2030)</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To become Indonesia's most trusted online massage directory - the definitive quality stamp for proven, inspected, and certified massage therapists.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Establish training centers across Indonesia</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Implement European standards in Asian markets</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>Maintain fair market pricing while ensuring quality</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Core Values */}
        <section className="py-16 bg-gray-100">
          <PageContainer>
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Core Values</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                    <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
                      <value.icon className="w-8 h-8 text-orange-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h4>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </PageContainer>
        </section>

        {/* What We Do */}
        <section className="py-16">
          <PageContainer>
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">What Makes Indastreet Different</h3>
              <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                We're not a sales platform - we're your strategic partner in building a successful massage therapy business
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="p-4 bg-orange-100 rounded-xl flex-shrink-0">
                        <service.icon className="w-8 h-8 text-orange-600" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h4>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-8 md:p-12">
                <h4 className="text-2xl font-bold text-gray-900 mb-6">Why Partner with Indastreet?</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">No Overcrowding Policy</p>
                      <p className="text-gray-700 text-sm">We carefully manage partner numbers to prevent supply/demand issues</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Expert Guidance</p>
                      <p className="text-gray-700 text-sm">We analyze your traffic, reviews, and bookings to optimize profitability</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">Cost-Effective Marketing</p>
                      <p className="text-gray-700 text-sm">No expensive Google Ads needed - affordable monthly packages</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">24/7 Online Presence</p>
                      <p className="text-gray-700 text-sm">Shareable links, scheduled bookings, and direct customer connections</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Expertise */}
        <section className="py-16 bg-gray-900 text-white">
          <PageContainer>
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold mb-8 text-center">Unmatched Expertise</h3>
              
              <div className="bg-gray-800 rounded-2xl p-8 md:p-12">
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  Indastreet is a standalone directory platform that requires years of specialized skill and knowledge across multiple disciplines:
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">20+</div>
                    <p className="text-gray-400">Years IT & Programming</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">16+</div>
                    <p className="text-gray-400">Years Marketing Experience</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">100%</div>
                    <p className="text-gray-400">Industry Understanding</p>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed mt-8">
                  Our team understands Google's algorithms, Indonesian massage therapy techniques, and international tourism patterns. This unique combination makes Indastreet the <span className="font-bold text-orange-500">only proven platform of its kind</span>.
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Leadership */}
        <section className="py-16">
          <PageContainer>
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Leadership Team</h3>
              
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="md:w-1/3">
                    <div className="aspect-square bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl flex items-center justify-center">
                      <Users className="w-32 h-32 text-white opacity-50" />
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-2">Photo coming soon</p>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Philip Francis O'Farrell</h4>
                    <p className="text-orange-600 font-semibold mb-4">Founder & CEO</p>
                    
                    <div className="space-y-4 text-gray-700">
                      <p className="leading-relaxed">
                        Specialist in high-build platforms for international clients with <span className="font-semibold">16 years of marketing experience</span> and a degree in marketing.
                      </p>
                      
                      <p className="leading-relaxed">
                        Philip leads a team of Irish-based full-time IT specialists, partnered with Indonesian representatives and customer service teams to deliver world-class service across continents.
                      </p>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">International Team:</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-orange-600" />
                            <span>Irish-based IT specialists (Full-time)</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-orange-600" />
                            <span>Indonesian partner representatives</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-orange-600" />
                            <span>Dedicated customer service team</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Partnerships */}
        <section className="py-16 bg-gradient-to-r from-orange-50 to-orange-100">
          <PageContainer>
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">International Partnerships</h3>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Indastreet collaborates with tourism operators and travel agents across <span className="font-semibold">Europe, USA, Americas, and Indonesia</span>, creating a global network of trusted massage therapy providers.
              </p>
              
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                  <div className="text-center">
                    <Globe className="w-16 h-16 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">European Tourism</p>
                  </div>
                  <div className="text-center">
                    <Building2 className="w-16 h-16 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">USA Operators</p>
                  </div>
                  <div className="text-center">
                    <Users className="w-16 h-16 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Travel Agents</p>
                  </div>
                  <div className="text-center">
                    <Award className="w-16 h-16 text-orange-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">Local Partners</p>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Contact Information */}
        <section className="py-16">
          <PageContainer>
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">Get in Touch</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Indonesia Office */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Indonesia Office</h4>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Pleret, Bantul<br />
                      Yogyakarta, Indonesia
                    </p>
                    <div className="pt-4 border-t border-gray-200">
                      <a href="tel:+6281392000050" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors">
                        <Phone className="w-5 h-5 text-orange-600" />
                        <span>+62 813 9200 0050</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Ireland Office */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <MapPin className="w-6 h-6 text-orange-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900">Europe Office</h4>
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-700">
                      Shelbourne Place, Campile<br />
                      Co Wexford, Ireland
                    </p>
                    <div className="pt-4 border-t border-gray-200">
                      <a href="mailto:indastreet.id@gmail.com" className="flex items-center gap-3 text-gray-700 hover:text-orange-600 transition-colors">
                        <Mail className="w-5 h-5 text-orange-600" />
                        <span className="text-sm">indastreet.id@gmail.com</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Registration */}
              <div className="mt-8 bg-gray-50 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Business Registration:</span> PT Hammerex Product Indonesia
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-500 text-white">
          <PageContainer>
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Elevate Your Massage Business?
              </h3>
              <p className="text-xl text-orange-50 mb-8">
                Join Indonesia's most trusted massage therapy platform today
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => window.location.href = 'https://wa.me/6281392000050'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-lg hover:bg-orange-50 transition-all shadow-xl text-lg"
                >
                  <Phone className="w-6 h-6" />
                  Contact Us on WhatsApp
                </button>
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-orange-700 text-white font-bold rounded-lg hover:bg-orange-800 transition-all shadow-xl text-lg"
                >
                  <Share2 className="w-6 h-6" />
                  Share This Profile
                </button>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <PageContainer>
          <div className="text-center">
            <p className="mb-4">
              <span className="text-white font-bold">Inda</span>
              <span className="text-orange-500 font-bold">street</span>
            </p>
            <p className="text-sm">
              © {new Date().getFullYear()} PT Hammerex Product Indonesia. All rights reserved.
            </p>
          </div>
        </PageContainer>
      </footer>
    </div>
  );
};

export default CompanyProfilePage;