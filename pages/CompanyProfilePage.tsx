import React from 'react';
import { ArrowLeft, Building2, Globe, Award, Users, TrendingUp, Shield, Target, Heart, CheckCircle, Download, Share2, MapPin, Mail, Phone, Facebook, Instagram, Linkedin, Home, MessageCircle } from 'lucide-react';
import PageContainer from '../components/layout/PageContainer';
import UniversalHeader from '../components/shared/UniversalHeader';

interface CompanyProfilePageProps {
  onBack: () => void;
  t?: any;
  language?: 'en' | 'id';
}

const CompanyProfilePage: React.FC<CompanyProfilePageProps> = ({ onBack, t, language }) => {
  const handleShare = () => {
    // Create proper company profile URL
    const baseUrl = window.location.origin;
    const companyProfileUrl = `${baseUrl}?page=company-profile`;
    
    if (navigator.share) {
      navigator.share({
        title: language === 'en' ? 'Indastreet Company Profile' : 'Profil Perusahaan Indastreet',
        text: language === 'en' ? 'Learn about Indastreet - Indonesia\'s Premier Massage Directory Platform' : 'Pelajari tentang Indastreet - Platform Direktori Pijat Terkemuka Indonesia',
        url: companyProfileUrl,
      });
    } else {
      navigator.clipboard.writeText(companyProfileUrl);
      alert(language === 'en' ? 'Company profile link copied to clipboard!' : 'Link profil perusahaan disalin ke clipboard!');
    }
  };

  const handleDownloadPDF = () => {
    // TODO: Generate PDF or link to static PDF file
    window.print();
  };

  const stats = [
    { value: '20+', label: language === 'en' ? 'Years Combined Experience' : 'Tahun Pengalaman Gabungan' },
    { value: '500+', label: language === 'en' ? 'Verified Massage Partners' : 'Mitra Pijat Terverifikasi' },
    { value: '50+', label: language === 'en' ? 'Cities Covered' : 'Kota Tersedia' },
    { value: '98%', label: language === 'en' ? 'Customer Satisfaction' : 'Kepuasan Pelanggan' },
  ];

  const services = [
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/partners%20indo.png',
      title: language === 'en' ? 'Verified Partners' : 'Mitra Terverifikasi',
      description: language === 'en' ? 'Every therapist and spa is personally inspected and certified by our team' : 'Setiap terapis dan spa diperiksa secara pribadi dan disertifikasi oleh tim kami',
    },
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/partners%20indod.png',
      title: language === 'en' ? 'Business Analytics' : 'Analitik Bisnis',
      description: language === 'en' ? 'Monitor traffic, reviews, and bookings with actionable insights' : 'Pantau lalu lintas, ulasan, dan pemesanan dengan wawasan yang dapat ditindaklanjuti',
    },
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/international%20reach.png',
      title: language === 'en' ? 'International Reach' : 'Jangkauan Internasional',
      description: language === 'en' ? 'Connect with tourists and locals across Indonesia and beyond' : 'Terhubung dengan wisatawan dan penduduk lokal di seluruh Indonesia dan sekitarnya',
    },
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/quality%20standards.png',
      title: language === 'en' ? 'Quality Standards' : 'Standar Kualitas',
      description: language === 'en' ? 'European-standard compliance adapted for Asian culture' : 'Kepatuhan standar Eropa yang disesuaikan dengan budaya Asia',
    },
  ];

  const values = [
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/trust-removebg-preview.png',
      title: language === 'en' ? 'Trust' : 'Kepercayaan',
      description: language === 'en' ? 'Building lasting relationships with verified, ethical businesses' : 'Membangun hubungan yang langgeng dengan bisnis yang terverifikasi dan etis',
    },
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/quality_image-removebg-preview.png',
      title: language === 'en' ? 'Quality' : 'Kualitas',
      description: language === 'en' ? 'Maintaining the highest massage therapy standards' : 'Mempertahankan standar terapi pijat tertinggi',
    },
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/partnership_indonisea-removebg-preview.png',
      title: language === 'en' ? 'Partnership' : 'Kemitraan',
      description: language === 'en' ? 'We\'re your partner, not just a platform' : 'Kami adalah mitra Anda, bukan hanya platform',
    },
    {
      icon: 'https://ik.imagekit.io/7grri5v7d/partnership_indoniseas-removebg-preview.png',
      title: language === 'en' ? 'Innovation' : 'Inovasi',
      description: language === 'en' ? 'Cutting-edge technology for modern massage businesses' : 'Teknologi canggih untuk bisnis pijat modern',
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
        <section 
          className="relative bg-gradient-to-r from-orange-600 to-orange-500 text-white py-20 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/website%20profile%20page.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
          <PageContainer className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                {language === 'en' ? (t?.companyProfile?.titleEn || 'Company Profile') : (t?.companyProfile?.title || 'Profil Perusahaan')}
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-orange-50 drop-shadow-lg">
                Indonesia's Premier Massage Directory Platform
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all shadow-lg"
                >
                  <Share2 className="w-5 h-5" />
                  {language === 'en' ? 'Share Profile' : 'Bagikan Profil'}
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
                <h3 className="text-3xl font-bold mb-6">
                  <span className="text-gray-900">Inda</span>
                  <span className="text-orange-500">street</span>
                  <span className="text-gray-900"> Indonesia</span>
                </h3>
                
                <div className="space-y-6 text-gray-700 leading-relaxed">
                  <p className="text-lg">
                    {language === 'en' 
                      ? (<><span className="font-bold text-orange-600">Indastreetmassage.com</span> trading under the registered company <span className="font-semibold">PT Hammerex Product Indonesia</span>, established in partnership with European IT specialists residing in Indonesia 2025.</>) 
                      : (<><span className="font-bold text-orange-600">Indastreetmassage.com</span> beroperasi di bawah perusahaan terdaftar <span className="font-semibold">PT Hammerex Product Indonesia</span>, didirikan dalam kemitraan dengan spesialis IT Eropa yang berdomisili di Indonesia 2025.</>)
                    }
                  </p>
                  
                  <p>
                    {language === 'en'
                      ? (<><span className="font-semibold">Hammerex Europe</span> Founded in <span className="font-semibold">2007</span>, with <span className="font-semibold">20 years of experience</span> in marketing and software development, with established connections in major tech platforms. The <span className="font-semibold">indastreet team</span> combines cutting-edge IT expertise with deep understanding of the massage industry.</>)
                      : (<><span className="font-semibold">Hammerex Europe</span> Didirikan pada <span className="font-semibold">2007</span>, dengan <span className="font-semibold">20 tahun pengalaman</span> dalam pemasaran dan pengembangan perangkat lunak, dengan koneksi yang mapan di platform teknologi besar. <span className="font-semibold">Tim indastreet</span> menggabungkan keahlian IT mutakhir dengan pemahaman mendalam tentang industri pijat.</>)
                    }
                  </p>

                  <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded-r-lg">
                    <p className="font-semibold text-gray-900 mb-4">{language === 'en' ? 'Our Headquarters:' : 'Kantor Pusat Kami:'}</p>
                    
                    {/* Ireland Office */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <img 
                          src="https://ik.imagekit.io/7grri5v7d/indo_flags-removebg-preview.png" 
                          alt="Ireland Flag" 
                          className="w-5 h-5 object-contain flex-shrink-0" 
                        />
                        <h4 className="font-bold text-gray-900">Indastreet Ireland</h4>
                      </div>
                      <img 
                        src="https://ik.imagekit.io/7grri5v7d/indastreet%20apps.png?updatedAt=1761568212865" 
                        alt="Ireland Office & Team"
                        className="w-full h-48 object-cover rounded-lg shadow-md mb-2"
                      />
                      <p className="text-sm"><strong>{language === 'en' ? 'Europe Office:' : 'Kantor Eropa:'}</strong> Shelbourne Place, Campile, Co Wexford, Ireland</p>
                    </div>

                    {/* Indonesia Office - Placeholder for now */}
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <img 
                          src="https://ik.imagekit.io/7grri5v7d/indo_flag-removebg-preview%20(1).png" 
                          alt="Indonesia Flag" 
                          className="w-5 h-5 object-contain flex-shrink-0" 
                        />
                        <h4 className="font-bold text-gray-900">Indastreet Indonesia</h4>
                      </div>
                      <img 
                        src="https://ik.imagekit.io/7grri5v7d/office%20indoniseas.png" 
                        alt="Indonesia Office"
                        className="w-full h-48 object-cover rounded-lg shadow-md mb-2"
                      />
                      <p className="text-sm"><strong>{language === 'en' ? 'Indonesia Office:' : 'Kantor Indonesia:'}</strong> Pleret, Bantul, Yogyakarta, Indonesia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Your Marketing Mentor Section */}
        <section 
          className="py-16 bg-gradient-to-r from-orange-600 to-orange-500 bg-cover bg-center relative"
          style={{
            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/social%20media.png)',
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <PageContainer className="relative z-10">
            <div className="max-w-4xl mx-auto text-center text-white">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">{language === 'en' ? 'We Are Your Marketing Mentor' : 'Kami Adalah Mentor Pemasaran Anda'}</h3>
              <p className="text-lg md:text-xl leading-relaxed text-white mb-6 drop-shadow-lg">
                {language === 'en' 
                  ? "Smart investment doesn't always mean spending more—it means spending wisely. Rather than pouring substantial budgets into marketing strategies that leave your massage spa undifferentiated from competitors, we invite you to connect with our team first."
                  : 'Investasi cerdas tidak selalu berarti mengeluarkan lebih banyak—tetapi mengeluarkan dengan bijak. Daripada menuangkan anggaran besar ke strategi pemasaran yang membuat spa pijat Anda tidak berbeda dari pesaing, kami mengundang Anda untuk terhubung dengan tim kami terlebih dahulu.'}
              </p>
              <p className="text-lg md:text-xl leading-relaxed text-white drop-shadow-lg">
                {language === 'en'
                  ? 'From day one, we partner with you to develop strategic, cost-effective growth plans. Our experienced team provides the expertise and guidance to help your massage business flourish sustainably—proving that sometimes, spending less delivers more.'
                  : 'Sejak hari pertama, kami bermitra dengan Anda untuk mengembangkan rencana pertumbuhan strategis yang hemat biaya. Tim berpengalaman kami memberikan keahlian dan bimbingan untuk membantu bisnis pijat Anda berkembang berkelanjutan—membuktikan bahwa terkadang, mengeluarkan lebih sedikit memberikan hasil lebih banyak.'}
              </p>
            </div>
          </PageContainer>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <PageContainer>
            <div className="max-w-6xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">{language === 'en' ? 'The Future Marketing Knowledge' : 'Pengetahuan Pemasaran Masa Depan'}</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Mission */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-6">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/icon_image-removebg-preview.png" 
                      alt="Our Mission"
                      className="w-12 h-12 object-contain"
                    />
                    <h4 className="text-2xl font-bold text-gray-900">{language === 'en' ? 'Our Mission' : 'Misi Kami'}</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed">
                    {language === 'en' 
                      ? 'To regulate and elevate the massage therapy industry in Indonesia by providing a trusted, verified platform that protects legitimate businesses from the underground, unregulated market. We empower massage investors and therapists to stand out with proven credentials, ethical practices, and professional standards.'
                      : 'Mengatur dan meningkatkan industri terapi pijat di Indonesia dengan menyediakan platform terpercaya dan terverifikasi yang melindungi bisnis yang sah dari pasar bawah tanah yang tidak diatur. Kami memberdayakan investor pijat dan terapis untuk menonjol dengan kredensial yang terbukti, praktik etis, dan standar profesional.'}
                  </p>
                </div>

                {/* Vision */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border-t-4 border-orange-500">
                  <div className="flex items-center gap-3 mb-6">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/u_see-removebg-preview.png" 
                      alt="Our Vision 2030"
                      className="w-12 h-12 object-contain"
                    />
                    <h4 className="text-2xl font-bold text-gray-900">{language === 'en' ? 'Our Vision (2030)' : 'Visi Kami (2030)'}</h4>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    {language === 'en'
                      ? "To become Indonesia's most trusted online massage directory - the definitive quality stamp for proven, inspected, and certified massage therapists."
                      : 'Menjadi direktori pijat online terpercaya di Indonesia - cap kualitas definitif untuk terapis pijat yang terbukti, diinspeksi, dan disertifikasi.'}
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{language === 'en' ? 'Establish training centers across Indonesia' : 'Mendirikan pusat pelatihan di seluruh Indonesia'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{language === 'en' ? 'Implement European standards in Asian markets' : 'Menerapkan standar Eropa di pasar Asia'}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                      <span>{language === 'en' ? 'Maintain fair market pricing while ensuring quality' : 'Mempertahankan harga pasar yang adil sambil memastikan kualitas'}</span>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">{language === 'en' ? 'Our Core Values' : 'Nilai-Nilai Inti Kami'}</h3>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {values.map((value, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-xl transition-shadow">
                    <div className="w-fit mb-4">
                      {typeof value.icon === 'string' ? (
                        <img 
                          src={value.icon} 
                          alt={value.title}
                          className="w-16 h-16 object-contain"
                        />
                      ) : (
                        <div className="p-3 bg-orange-100 rounded-lg w-fit">
                          {(() => {
                            const IconComponent = value.icon as any;
                            return <IconComponent className="w-8 h-8 text-orange-600" />;
                          })()}
                        </div>
                      )}
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
              <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">{language === 'en' ? 'What Makes Indastreet Different' : 'Apa yang Membuat Indastreet Berbeda'}</h3>
              <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
                {language === 'en' 
                  ? "We're not a sales platform - we're your strategic partner in building a successful massage therapy business"
                  : 'Kami bukan platform penjualan - kami adalah mitra strategis Anda dalam membangun bisnis terapi pijat yang sukses'}
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {services.map((service, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-lg p-8 hover:shadow-2xl transition-all">
                    <div className="flex items-start gap-6">
                      <div className="flex-shrink-0">
                        {typeof service.icon === 'string' ? (
                          <img 
                            src={service.icon} 
                            alt={service.title}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          (() => {
                            const IconComponent = service.icon as any;
                            return <IconComponent className="w-16 h-16 text-orange-600" />;
                          })()
                        )}
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
                <h4 className="text-2xl font-bold text-gray-900 mb-6">{language === 'en' ? 'Why Partner with Indastreet?' : 'Mengapa Bermitra dengan Indastreet?'}</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{language === 'en' ? 'No Overcrowding Policy' : 'Kebijakan Tanpa Kepadatan Berlebih'}</p>
                      <p className="text-gray-700 text-sm">{language === 'en' ? 'We carefully manage partner numbers to prevent supply/demand issues' : 'Kami mengelola jumlah mitra dengan hati-hati untuk mencegah masalah penawaran/permintaan'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{language === 'en' ? 'Expert Guidance' : 'Panduan Ahli'}</p>
                      <p className="text-gray-700 text-sm">{language === 'en' ? 'We analyze your traffic, reviews, and bookings to optimize profitability' : 'Kami menganalisis lalu lintas, ulasan, dan pemesanan Anda untuk mengoptimalkan profitabilitas'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{language === 'en' ? 'Cost-Effective Marketing' : 'Pemasaran Hemat Biaya'}</p>
                      <p className="text-gray-700 text-sm">{language === 'en' ? 'No expensive Google Ads needed - affordable monthly packages' : 'Tidak perlu Google Ads mahal - paket bulanan yang terjangkau'}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-gray-900">{language === 'en' ? '24/7 Online Presence' : 'Kehadiran Online 24/7'}</p>
                      <p className="text-gray-700 text-sm">{language === 'en' ? 'Shareable links, scheduled bookings, and direct customer connections' : 'Link yang dapat dibagikan, pemesanan terjadwal, dan koneksi pelanggan langsung'}</p>
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
              <h3 className="text-3xl font-bold mb-8 text-center">{language === 'en' ? 'Unmatched Expertise' : 'Keahlian Yang Tak Tertandingi'}</h3>
              
              <div className="bg-gray-800 rounded-2xl p-8 md:p-12">
                <p className="text-lg text-gray-300 leading-relaxed mb-6">
                  {language === 'en' 
                    ? 'Indastreet is a standalone directory platform that requires years of specialized skill and knowledge across multiple disciplines:'
                    : 'Indastreet adalah platform direktori mandiri yang memerlukan keahlian khusus dan pengetahuan bertahun-tahun di berbagai disiplin ilmu:'}
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">20+</div>
                    <p className="text-gray-400">{language === 'en' ? 'Years IT & Programming' : 'Tahun IT & Pemrograman'}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">16+</div>
                    <p className="text-gray-400">{language === 'en' ? 'Years Marketing Experience' : 'Tahun Pengalaman Pemasaran'}</p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-500 mb-2">100%</div>
                    <p className="text-gray-400">{language === 'en' ? 'Industry Understanding' : 'Pemahaman Industri'}</p>
                  </div>
                </div>

                <p className="text-gray-300 leading-relaxed mt-8">
                  {language === 'en' 
                    ? <>Our team understands Google's algorithms, Indonesian massage therapy techniques, and international tourism patterns. This unique combination makes Indastreet the <span className="font-bold text-orange-500">only proven platform of its kind</span>.</>
                    : <>Tim kami memahami algoritma Google, teknik terapi pijat Indonesia, dan pola pariwisata internasional. Kombinasi unik ini menjadikan Indastreet sebagai <span className="font-bold text-orange-500">satu-satunya platform terbukti sejenis</span>.</>
                  }
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* Leadership */}
        <section className="py-16">
          <PageContainer>
            <div className="max-w-4xl mx-auto">
              <h3 className="text-3xl font-bold text-gray-900 mb-12 text-center">{language === 'en' ? 'Leadership Team' : 'Tim Kepemimpinan'}</h3>
              
              <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="md:w-1/3">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/income%20graphs.png" 
                      alt="Liam Thomas Keefe"
                      className="w-full aspect-square object-cover rounded-2xl shadow-lg"
                    />
                    <p className="text-center text-sm text-gray-500 mt-2">Ireland Office & Team</p>
                  </div>
                  
                  <div className="md:w-2/3">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">Liam Thomas Keefe</h4>
                    <p className="text-orange-600 font-semibold mb-4">{language === 'en' ? 'Founder & CEO' : 'Pendiri & CEO'}</p>
                    
                    <div className="space-y-4 text-gray-700">
                      <p className="leading-relaxed">
                        {language === 'en'
                          ? <>Specialist in high-build platforms for international clients with <span className="font-semibold">16 years of marketing experience</span> and a degree in marketing.</>
                          : <>Spesialis dalam platform tingkat tinggi untuk klien internasional dengan <span className="font-semibold">16 tahun pengalaman pemasaran</span> dan gelar dalam bidang pemasaran.</>
                        }
                      </p>
                      
                      <p className="leading-relaxed">
                        {language === 'en'
                          ? 'Liam leads a team of Irish-based full-time IT specialists, partnered with Indonesian representatives and customer service teams to deliver world-class service across continents.'
                          : 'Liam memimpin tim spesialis IT full-time berbasis Irlandia, bermitra dengan perwakilan Indonesia dan tim layanan pelanggan untuk memberikan layanan kelas dunia lintas benua.'
                        }
                      </p>

                      <div className="pt-4 border-t border-gray-200">
                        <p className="font-semibold text-gray-900 mb-2">{language === 'en' ? 'International Team:' : 'Tim Internasional:'}</p>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-orange-600" />
                            <span>{language === 'en' ? 'Irish-based IT specialists (Full-time)' : 'Spesialis IT berbasis Irlandia (Full-time)'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-orange-600" />
                            <span>{language === 'en' ? 'Indonesian partner representatives' : 'Perwakilan mitra Indonesia'}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-orange-600" />
                            <span>{language === 'en' ? 'Dedicated customer service team' : 'Tim layanan pelanggan khusus'}</span>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-6">{language === 'en' ? 'International Partnerships' : 'Kemitraan Internasional'}</h3>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {language === 'en'
                  ? <>Indastreet collaborates with tourism operators and travel agents across <span className="font-semibold">Europe, USA, Americas, and Indonesia</span>, creating a global network of trusted massage therapy providers.</>
                  : <>Indastreet berkolaborasi dengan operator pariwisata dan agen perjalanan di <span className="font-semibold">Eropa, Amerika Serikat, Amerika, dan Indonesia</span>, menciptakan jaringan global penyedia terapi pijat terpercaya.</>
                }
              </p>
              
              <div className="bg-white rounded-xl shadow-lg p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
                  <div className="text-center">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/uk%20england.png" 
                      alt="European Tourism" 
                      className="w-24 h-24 object-contain mx-auto mb-2" 
                    />
                    <p className="text-sm font-semibold text-gray-700">European Tourism</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/usa%20flags.png" 
                      alt="USA Operators" 
                      className="w-24 h-24 object-contain mx-auto mb-2" 
                    />
                    <p className="text-sm font-semibold text-gray-700">USA Operators</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/usa%20flagss.png" 
                      alt="Travel Agents" 
                      className="w-24 h-24 object-contain mx-auto mb-2" 
                    />
                    <p className="text-sm font-semibold text-gray-700">Travel Agents</p>
                  </div>
                  <div className="text-center">
                    <img 
                      src="https://ik.imagekit.io/7grri5v7d/partners%20indo.png" 
                      alt="Local Partners" 
                      className="w-24 h-24 object-contain mx-auto mb-2" 
                    />
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
              <h3 className="text-3xl font-bold text-gray-900 mb-4 text-center">
                {t?.companyProfile?.contact?.title || (language === 'en' ? 'Get in Touch' : 'Hubungi Kami')}
              </h3>
              <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
                {t?.companyProfile?.contact?.description || (language === 'en' ? 
                  'We would love to hear from you and discuss your marketing promotional ideas and our team will always provide the best knowledge for your business needs.' : 
                  'Kami ingin mendengar dari Anda dan mendiskusikan ide-ide promosi pemasaran Anda. Tim kami akan selalu memberikan pengetahuan terbaik untuk kebutuhan bisnis Anda.'
                )}
              </p>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Indonesia Office */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-orange-100 rounded-lg">
                      <img 
                        src="https://ik.imagekit.io/7grri5v7d/indo_flag-removebg-preview%20(1).png" 
                        alt="Indonesia Flag" 
                        className="w-6 h-6 object-contain" 
                      />
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
                      <img 
                        src="https://ik.imagekit.io/7grri5v7d/indo_flags-removebg-preview.png" 
                        alt="Ireland Flag" 
                        className="w-6 h-6 object-contain" 
                      />
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
                  <span className="font-semibold">{language === 'en' ? 'Business Registration:' : 'Registrasi Bisnis:'}</span> PT Hammerex Product Indonesia
                </p>
              </div>
            </div>
          </PageContainer>
        </section>

        {/* CTA Section */}
        <section 
          className="py-20 bg-gradient-to-r from-orange-600 to-orange-500 text-white bg-cover bg-center relative"
          style={{
            backgroundImage: 'url(https://ik.imagekit.io/7grri5v7d/indastreet%20massage.png?updatedAt=1761978080830)',
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
          <PageContainer className="relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl md:text-4xl font-bold mb-6 drop-shadow-lg">
                {language === 'en' ? (t?.companyProfile?.ctaTitleEn || 'Ready to Elevate Your Massage Business?') : (t?.companyProfile?.ctaTitle || 'Siap Meningkatkan Bisnis Pijat Anda?')}
              </h3>
              <p className="text-xl text-white mb-8 drop-shadow-lg">
                {language === 'en' ? (t?.companyProfile?.ctaDescriptionEn || "Join Indonesia's most trusted massage therapy platform today") : (t?.companyProfile?.ctaDescription || 'Bergabunglah dengan platform terapi pijat terpercaya di Indonesia hari ini')}
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => window.location.href = 'https://wa.me/6281392000050'}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-xl text-lg"
                >
                  <MessageCircle className="w-6 h-6" />
                  {language === 'en' ? (t?.companyProfile?.contactWhatsAppEn || 'Contact Us on WhatsApp') : (t?.companyProfile?.contactWhatsApp || 'Hubungi Kami di WhatsApp')}
                </button>
              </div>
            </div>
          </PageContainer>
        </section>
      </main>
    </div>
  );
};

export default CompanyProfilePage;