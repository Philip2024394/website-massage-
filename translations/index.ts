// Main translations index - combines all translation modules
import { commonTranslations } from './common';
import { authTranslations } from './auth';
import { homeTranslations } from './home';
import { dashboardTranslations } from './dashboard';
import { massageTypesTranslations } from './massageTypes';
import { jobsTranslations } from './jobs';
import { partnersTranslations } from './partners';
import { companyProfileTranslations } from './companyProfile';
import { reviewsTranslations } from './reviews';
import { membershipTranslations } from './membership';
import { therapistDashboardTranslations } from './therapistDashboard';
import { placeDashboardTranslations } from './placeDashboard';
import { uiComponentsTranslations } from './uiComponents';

type LangDict = Record<string, any>;
type Translations = { en: LangDict; id: LangDict };

// Function to deep merge translation objects
function mergeTranslations(...translationObjects: Translations[]): Translations {
  const merged: Translations = { en: {}, id: {} };

  for (const obj of translationObjects) {
    // Deep merge for nested objects
    for (const key in obj.en) {
      const value = (obj.en as LangDict)[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged.en[key] = { ...(merged.en[key] || {}), ...value };
      } else {
        merged.en[key] = value;
      }
    }
    for (const key in obj.id) {
      const value = (obj.id as LangDict)[key];
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        merged.id[key] = { ...(merged.id[key] || {}), ...value };
      } else {
        merged.id[key] = value;
      }
    }
  }

  return merged;
}

// Export combined translations
const translations: Translations = mergeTranslations(
  commonTranslations,
  authTranslations,
  homeTranslations,
  dashboardTranslations,
  massageTypesTranslations,
  jobsTranslations,
  partnersTranslations,
  companyProfileTranslations,
  reviewsTranslations,
  membershipTranslations,
  therapistDashboardTranslations,
  placeDashboardTranslations,
  uiComponentsTranslations
);

// Add remaining translations that weren't split yet
translations.en.registrationChoice = {
  title: 'Join Us',
  prompt: 'Are you an individual therapist or a massage establishment?',
  therapistButton: "I'm a Therapist",
  placeButton: "I'm a Massage Place",
};
translations.en.joinIndastreet = {
  title: "Join Indonesia's Massage Directory",
  titleHighlight: "FREE TODAY",
  subtitle: "Experience the true potential of online massage booking",
  whyJoinTitle: "🌟 Why Join Indastreet?",
  whyJoinText: "No matter where you are across Indonesia, Indastreet customers are searching for massage services right now. Don't miss out—register your account for FREE and scale your business to the next level with Indonesia's largest massage booking platform.",
  benefitsTitle: "Benefits",
  benefit1Title: "Get More Bookings",
  benefit1Text: "Reach customers 24/7 with instant online booking",
  benefit2Title: "Grow Your Income",
  benefit2Text: "Fill your schedule with verified customers",
  benefit3Title: "Build Your Brand",
  benefit3Text: "Showcase reviews and grow your reputation",
  platformFeaturesTitle: "✨ Platform Features",
  feature1Title: "Your Own Profile Page",
  feature1Text: "Professional profile with photos, services, and pricing",
  feature2Title: "Real-Time Notifications",
  feature2Text: "Get instant alerts for new booking requests",
  feature3Title: "Customer Reviews",
  feature3Text: "Build trust with verified customer feedback",
  feature4Title: "Mobile Dashboard",
  feature4Text: "Manage bookings anywhere, anytime",
  feature5Title: "Hotel & Villa Partnerships",
  feature5Text: "Get bookings from luxury properties",
  feature6Title: "No Commission Fees",
  feature6Text: "Keep 100% of your earnings from bookings",
  successStoriesTitle: "❤️ Success Stories",
  testimonial1Name: "Balinese Massage Therapist",
  testimonial1Text: "I doubled my bookings in the first month. Customers love the easy online booking system!",
  testimonial1Rating: "⭐⭐⭐⭐⭐ 4.9 rating • 250+ bookings",
  testimonial2Name: "Ubud Wellness Spa",
  testimonial2Text: "The hotel partnership program connected us with luxury villas. Our revenue increased 3x!",
  testimonial2Rating: "⭐⭐⭐⭐⭐ 5.0 rating • 500+ bookings",
  howItWorksTitle: "🚀 How It Works",
  step1Title: "Create Your Profile",
  step1Text: "Add photos, services, pricing, and availability",
  step2Title: "Get Verified",
  step2Text: "Complete verification to build customer trust",
  step3Title: "Receive Bookings",
  step3Text: "Accept or reject requests instantly via notifications",
  step4Title: "Grow Your Business",
  step4Text: "Collect reviews, build reputation, and increase earnings",
  ctaTherapistTitle: "JOIN THERAPIST",
  ctaTherapistButton: "Create Therapist Account →",
  ctaSpaTitle: "JOIN MASSAGE SPA",
  ctaSpaButton: "Create Massage Spa Account →",
  contactTitle: "Need Help Getting Started?",
  contactText: "Our team is ready to assist you with the registration process",
  contactButton: "Contact Us on WhatsApp",
};
translations.en.home = {
  homeServiceTab: 'Home Service',
  massagePlacesTab: 'Massage Places',
  therapistsTitle: 'Home Service Therapists',
  therapistsSubtitle: 'Find the best therapists in Bali',
  noTherapistsAvailable: 'No therapists available in your area at the moment.',
  noPlacesAvailable: 'No massage places available in your area',
  massagePlacesTitle: 'Featured Massage Spas',
  massagePlacesSubtitle: 'Find the best massage places in Bali',
  massageDirectory: 'Massage Directory',
  massageDirectoryTitle: 'Go to Massage Directory',
  viewMassageSpa: 'View Massage Spa',
  cityLocation: 'City / Location',
  // Massage Types Page
  readMore: 'Read More',
  readLess: 'Read Less',
  aboutMassage: 'About',
  keyBenefits: 'Key Benefits',
  bestFor: 'Best For',
  findTherapists: 'Find Therapists',
  findMassagePlaces: 'Find Massage Places',
  pressure: 'Pressure',
};

// About Us page
translations.en.about = {
  subtitle: "Indonesia's First Comprehensive Wellness Marketplace Connecting Therapists, Hotels, and Employers",
  missionTitle: 'Our IndaStreet Mission',
  missionText: 'Connecting customers with quality massage therapists while empowering local wellness professionals',
  cta: {
    getStarted: 'Get Started Today',
    viewCompanyProfile: 'View Company Profile',
    contactTeam: 'Contact Our Team',
  },
};
translations.id.about = {
  subtitle: 'Marketplace Kesehatan Terlengkap Pertama di Indonesia yang Menghubungkan Terapis, Hotel, dan Pemberi Kerja',
  missionTitle: 'Misi IndaStreet Kami',
  missionText: 'Menghubungkan pelanggan dengan terapis pijat berkualitas sambil memberdayakan profesional kesehatan lokal',
  cta: {
    getStarted: 'Mulai Hari Ini',
    viewCompanyProfile: 'Lihat Profil Perusahaan',
    contactTeam: 'Hubungi Tim Kami',
  },
};

// Contact Us page (hero)
translations.en.contact = {
  title: 'Contact IndaStreet',
  subtitle: "We're here to help. Get in touch with our team for support, partnerships, or inquiries.",
  form: {
    title: "Let's Connect",
    nameLabel: 'Your Name *',
    namePlaceholder: 'Enter your full name',
    emailLabel: 'Email Address *',
    emailPlaceholder: 'your.email@example.com',
    phoneLabel: 'Phone Number',
    phonePlaceholder: '+62 812 3456 7890',
    userTypeLabel: 'I am a... *',
    userTypeSelect: 'Select user type',
    userTypes: {
      therapist: 'Massage Therapist',
      hotel: 'Hotel/Villa Owner',
      employer: 'Employer/Spa Manager',
      agent: 'Agent',
      client: 'Client/Customer',
      other: 'Other',
    },
    subjectLabel: 'Subject *',
    subjectPlaceholder: 'What is your inquiry about?',
    messageLabel: 'Message *',
    messagePlaceholder: 'Tell us how we can help you...',
    sendButton: 'Send Message',
  },
  support: {
    title: 'Support Resources',
    quickSupport: { title: 'Quick Support', button: 'Visit FAQ →' },
    partnerships: { title: 'Partnership Inquiries', button: 'Learn More →' },
    pressMedia: { title: 'Press & Media', button: 'Press Kit →' },
    careers: { title: 'Career Opportunities', button: 'View Jobs →' },
  },
};
translations.id.contact = {
  title: 'Hubungi IndaStreet',
  subtitle: 'Kami siap membantu. Hubungi tim kami untuk dukungan, kemitraan, atau pertanyaan.',
  form: {
    title: 'Mari Terhubung',
    nameLabel: 'Nama Anda *',
    namePlaceholder: 'Masukkan nama lengkap Anda',
    emailLabel: 'Alamat Email *',
    emailPlaceholder: 'email.anda@contoh.com',
    phoneLabel: 'Nomor Telepon',
    phonePlaceholder: '+62 812 3456 7890',
    userTypeLabel: 'Saya adalah... *',
    userTypeSelect: 'Pilih jenis pengguna',
    userTypes: {
      therapist: 'Terapis Pijat',
      hotel: 'Pemilik Hotel/Vila',
      employer: 'Pemberi Kerja/Manajer Spa',
      agent: 'Agen',
      client: 'Klien/Pelanggan',
      other: 'Lainnya',
    },
    subjectLabel: 'Subjek *',
    subjectPlaceholder: 'Tentang apa pertanyaan Anda?',
    messageLabel: 'Pesan *',
    messagePlaceholder: 'Beritahu kami bagaimana kami dapat membantu Anda...',
    sendButton: 'Kirim Pesan',
  },
  support: {
    title: 'Sumber Dukungan',
    quickSupport: { title: 'Dukungan Cepat', button: 'Kunjungi FAQ →' },
    partnerships: { title: 'Permintaan Kemitraan', button: 'Pelajari Lebih Lanjut →' },
    pressMedia: { title: 'Pers & Media', button: 'Kit Pers →' },
    careers: { title: 'Lowongan Kerja', button: 'Lihat Pekerjaan →' },
  },
};
// FAQ page (hero + categories)
translations.en.faq = {
  title: 'Frequently Asked Questions',
  subtitle: 'Everything you need to know about using IndaStreet',
  stillHaveQuestions: 'Still Have Questions?',
  contactSupport: 'Our support team is here to help you succeed on IndaStreet',
  contactSupportButton: 'Contact Support',
  whatsappButton: 'WhatsApp Us',
  categories: {
    booking: 'Bookings',
    therapist: 'For Therapists',
    hotel: 'For Hotels',
    employer: 'For Employers',
    agent: 'For Agents',
    payment: 'Payments',
    technical: 'Technical',
  },
};
translations.id.faq = {
  title: 'Pertanyaan yang Sering Diajukan',
  subtitle: 'Semua yang perlu Anda ketahui tentang menggunakan IndaStreet',
  stillHaveQuestions: 'Masih Ada Pertanyaan?',
  contactSupport: 'Tim dukungan kami siap membantu Anda sukses di IndaStreet',
  contactSupportButton: 'Hubungi Dukungan',
  whatsappButton: 'WhatsApp Kami',
  categories: {
    booking: 'Pemesanan',
    therapist: 'Untuk Terapis',
    hotel: 'Untuk Hotel',
    employer: 'Untuk Pemberi Kerja',
    agent: 'Untuk Agen',
    payment: 'Pembayaran',
    technical: 'Teknis',
  },
};
translations.en.blog = {
  pageTitle: 'IndaStreet Blog',
  featuredArticles: 'Featured Articles',
  allArticles: 'All Articles',
  readArticle: 'Read Article',
  readMore: 'Read More',
  stayUpdated: 'Stay Updated with Wellness Industry Insights',
  newsletterDesc: 'Get weekly articles, industry trends, and professional tips delivered to your inbox',
  enterEmail: 'Enter your email',
  subscribe: 'Subscribe',
  popularTopics: 'Popular Topics',
  topics: {
    balineseMassage: 'Balinese Massage',
    hotelSpaManagement: 'Hotel Spa Management',
    therapistCertification: 'Therapist Certification',
    wellnessTourism: 'Wellness Tourism',
    deepTissueTechniques: 'Deep Tissue Techniques',
    careerGrowth: 'Career Growth',
    clientRetention: 'Client Retention',
    aromatherapy: 'Aromatherapy',
  },
  categoryAll: 'All Articles',
  categoryIndustry: 'Industry Trends',
  categoryTechniques: 'Massage Techniques',
  categoryCareer: 'Career Advice',
  categoryWellness: 'Wellness Tips',
  featured: 'Featured',
};
translations.en.howItWorks = {
  heroTitle: 'How IndaStreet Works',
  heroSubtitle: "Your Complete Guide to Indonesia's Leading Wellness Marketplace",
  tabTherapists: 'Therapists',
  tabHotels: 'Hotels & Villas',
  tabEmployers: 'Employers',
  tabAgents: 'Agents',
  therapistTitle: 'How Therapists Succeed on IndaStreet',
  therapistSubtitle: 'Build your career, find opportunities, grow your client base',
  step1Title: 'Create Your Profile',
  step1Desc: 'Sign up and create a detailed profile showcasing your certifications, specializations, experience, and languages.',
  step1Item1: 'Upload certifications',
  step1Item2: 'List specializations',
  step1Item3: 'Add work experience',
  step2Title: 'Choose Your Membership',
  step2Desc: 'Select a membership package that fits your needs. Get verified and featured in search results.',
  step2Item1: '1, 3, 6, or 12 months',
  step2Item2: 'Verified badge',
  step2Item3: 'Priority placement',
  step3Title: 'Start Getting Bookings',
  step3Desc: 'Receive booking requests from hotels, spas, and direct clients. Accept jobs that fit your schedule.',
  step3Item1: 'Instant notifications',
  step3Item2: 'WhatsApp integration',
  step3Item3: 'Flexible scheduling',
  membershipBenefitsTitle: 'Membership Benefits',
  benefit1Title: 'Enhanced Visibility',
  benefit1Desc: 'Appear at the top of search results',
  benefit2Title: 'Direct Client Bookings',
  benefit2Desc: 'Receive bookings from verified clients',
  benefit3Title: 'Professional Dashboard',
  benefit3Desc: 'Manage bookings and profile easily',
  benefit4Title: 'Verified Badge',
  benefit4Desc: 'Build trust with verified status',
  hotelTitle: 'Partner Hotels & Villas',
  hotelSubtitle: 'Connect with verified therapists, streamline bookings, enhance guest experience',
  employerTitle: 'For Employers',
  employerSubtitle: 'Find qualified therapists, hire with confidence, grow your business',
  agentTitle: 'For Agents & Partners',
  agentSubtitle: 'Earn commissions, grow your network, support local wellness',
  needHelpTitle: 'Need Help?',
  needHelpDesc: 'Contact our support team for any questions',
  chatSupport: 'Chat Customer Support',
  // Hotel tab
  hotelSectionTitle: 'How Hotels & Villas Use IndaStreet',
  hotelSectionSubtitle: 'Find qualified therapists, manage your spa, grow your business',
  hotelStep1Title: 'Register Your Property',
  hotelStep1Desc: 'Create hotel/villa account with property details',
  hotelStep2Title: 'Browse Therapists',
  hotelStep2Desc: 'Search verified professionals by specialty and location',
  hotelStep3Title: 'Send Booking Requests',
  hotelStep3Desc: 'Contact therapists directly via WhatsApp integration',
  hotelStep4Title: 'Manage Your Spa',
  hotelStep4Desc: 'Track bookings, therapists, and services from dashboard',
  hotelBenefitsTitle: 'Hotel Benefits',
  hotelBenefit1Title: 'Access to 500+ Verified Therapists',
  hotelBenefit1Desc: 'All certified with background checks',
  hotelBenefit2Title: 'Same-Day Staffing Solutions',
  hotelBenefit2Desc: 'Find replacement therapists quickly',
  hotelBenefit3Title: 'Spa Management Dashboard',
  hotelBenefit3Desc: 'Track services, bookings, and therapists',
  hotelBenefit4Title: 'Multi-Language Therapists',
  hotelBenefit4Desc: 'Serve international guests effectively',
  // Employer tab
  employerSectionTitle: 'How Employers Hire on IndaStreet',
  employerSectionSubtitle: 'Privacy-protected job marketplace for contract hiring',
  employerCard1Title: 'Browse Job Seekers',
  employerCard1Desc: 'Search our "Therapist For Contract" marketplace to find qualified professionals actively seeking employment opportunities.',
  employerCard1Item1: 'Filter by specialty, experience, location',
  employerCard1Item2: 'View certifications and work history',
  employerCard1Item3: 'Names protected until you unlock',
  employerCard2Title: 'Unlock Contact Details',
  employerCard2Desc: 'Pay one-time fee of IDR 300,000 to unlock full contact information including WhatsApp number and full name.',
  employerCard2Item1: 'Secure payment via bank transfer',
  employerCard2Item2: 'Instant access after verification',
  employerCard2Item3: 'Direct WhatsApp communication',
  employerCard3Title: 'Interview & Hire',
  employerCard3Desc: 'Contact therapists directly via WhatsApp. Conduct interviews, check references, and make your hiring decision.',
  employerCard3Item1: 'No platform fees on hiring',
  employerCard3Item2: 'Negotiate terms directly',
  employerCard3Item3: 'Verify certifications yourself',
  employerCard4Title: 'Leave Reviews',
  employerCard4Desc: 'After hiring, leave honest reviews to help other employers and build the therapist\'s reputation on the platform.',
  employerCard4Item1: 'Rate professionalism',
  employerCard4Item2: 'Share your experience',
  employerCard4Item3: 'Help build community trust',
  employerPrivacyTitle: 'Why Our Privacy Model Works',
  employerPrivacyTherapist: 'For Therapists:',
  employerPrivacyTherapistDesc: 'Protects them from spam, harassment, and unwanted contact. Only serious employers who pay can reach them.',
  employerPrivacyEmployer: 'For Employers:',
  employerPrivacyEmployerDesc: 'Ensures access to serious job seekers. Small fee filters out time-wasters and ensures quality candidates.',
  // Agent tab
  agentSectionTitle: 'How Agents Earn on IndaStreet',
  agentSectionSubtitle: 'Recruit therapists, earn commissions, build your network',
  agentStat1: '20%',
  agentStat1Label: 'Commission Rate',
  agentStat2: '∞',
  agentStat2Label: 'Unlimited Recruits',
  agentStat3: '💰',
  agentStat3Label: 'Passive Income',
  agentStep1Title: 'Sign Up as Agent',
  agentStep1Desc: 'Register as an agent and get your unique referral code to start recruiting therapists.',
  agentStep2Title: 'Recruit Therapists',
  agentStep2Desc: 'Share your referral code with therapists. When they sign up and purchase membership, you earn.',
  agentStep3Title: 'Earn Commissions',
  agentStep3Desc: 'Receive 20% commission on every membership purchase from your referred therapists. Track earnings in dashboard.',
  agentCommissionTitle: 'Commission Example',
  agentTablePackage: 'Package',
  agentTablePrice: 'Price',
  agentTableCommission: 'Your Commission (20%)',
  agentTableRecurring: 'Recurring Commission (20%)',
  agentPackage1Month: '1 Month',
  agentPackage3Months: '3 Months',
  agentPackage6Months: '6 Months',
  agentPackage1Year: '1 Year',
  agentCommissionWorksTitle: '💰 How Commission Works:',
  agentCommissionFirstMonth: 'First Month: Earn 20% commission when a therapist you recruit signs up for the first time',
  agentCommissionRecurring: 'Recurring (Month 2+): Earn 20% commission every month the same therapist renews their membership',
  agentExampleTitle: 'Example:',
  agentExampleDesc: 'You recruit 1 therapist who buys a 1 Month package (IDR 200,000):',
  agentExampleMonth1: 'Month 1: You earn IDR 40,000 (20%)',
  agentExampleMonth2: 'Month 2: If they renew, you earn IDR 40,000 (20%)',
  agentExampleMonth3Plus: 'Month 3+: You continue earning IDR 40,000 (20%) each month they stay active',
  agentPassiveIncomeTitle: '🚀 Build Passive Income:',
  agentPassiveIncomeDesc: 'Recruit 10 therapists on 1-month plans = IDR 400,000 first month + IDR 400,000 every month they renew!',
  agentTotalEarningsTitle: '📊 Total Earnings From 1 Active Member (IDR 200,000/month):',
  agentEarningsAfter1Month: 'After 1 Month',
  agentEarningsAfter1MonthAmount: 'IDR 40,000',
  agentEarningsAfter1MonthDesc: '20% first month',
  agentEarningsAfter3Months: 'After 3 Months',
  agentEarningsAfter3MonthsAmount: 'IDR 120,000',
  agentEarningsAfter3MonthsDesc: 'Month 1 (20%) + Month 2-3 (20% each)',
};
translations.en.app = {
  mapsApiKeyWarning: 'Google Maps API key is missing. Please configure it in the Admin Dashboard to enable location features.',
};
translations.en.membershipPage = {
  title: 'Choose Membership',
  selectPackage: 'Select a membership package:',
  oneMonth: '1 Month - Rp 100,000',
  threeMonths: '3 Months - Rp 250,000',
  sixMonths: '6 Months - Rp 450,000',
  oneYear: '1 Year - Rp 800,000',
  contactAdmin: 'Please contact our admin at {number} to complete payment.',
  whatsappButton: 'Contact Admin',
};
translations.en.bookingPage = {
  title: 'Book Appointment',
  selectDate: 'Select Date',
  selectTime: 'Select Time',
  customerInfo: 'Customer Information',
  nameLabel: 'Name',
  whatsappLabel: 'WhatsApp Number',
  notesLabel: 'Additional Notes (Optional)',
  bookButton: 'Book Appointment',
  fillFieldsError: 'Please fill all required fields.',
  bookingSuccess: 'Appointment booked successfully!',
  loginPrompt: 'Please login to make a booking',
  bookingSuccessTitle: 'Booking Confirmed!',
  bookingSuccessMessage: 'Your booking with {name} has been confirmed.',
};
translations.en.agentPage = {
  title: 'Agent Portal',
  description: 'Join our agent program and earn commissions by referring massage therapists and places.',
  joinButton: 'Join as Agent',
  learnMore: 'Learn More',
};
translations.en.agentTermsPage = {
  title: 'Agent Terms & Conditions',
  accept: 'I Accept',
  decline: 'Decline',
  terms: 'Please read and accept the terms and conditions to continue.',
};
translations.en.detail = {
  title: 'Details',
  description: 'Description',
  contact: 'Contact',
  book: 'Book Now',
  location: 'Location',
  rating: 'Rating',
  reviews: 'Reviews',
  pricing: 'Pricing',
  availability: 'Availability',
  pricingTitle: 'Pricing',
  contactButton: 'WhatsApp',
  bookButton: 'Book Now'
};
translations.en.supabaseSettings = {
  title: 'Database Settings',
  url: 'Supabase URL',
  key: 'Supabase Key',
  connect: 'Connect',
  disconnect: 'Disconnect',
  status: 'Connection Status'
};
translations.en.notificationsPage = {
  title: 'Notifications',
  noNotifications: 'No notifications yet.',
  markAllRead: 'Mark All as Read',
};
translations.en.serviceTerms = {
  title: 'Terms of Service',
  effectiveDate: 'Effective Date: January 5, 2026 | Last Updated: January 5, 2026',
  intro: 'Welcome to IndaStreet ("indastreet.id", "indastreetmassage.com", and other platforms operated by IndaStreet). These Terms of Service ("Terms") constitute a legally binding agreement between you ("User", "You", or "Your") and IndaStreet ("We", "Us", or "Our"). By accessing or using any of our platforms, websites, mobile applications, or services, you acknowledge that you have read, understood, and agree to be bound by these Terms in their entirety. If you do not agree to these Terms, you must immediately cease all use of our platforms and services.',
  acceptance: {
    title: '1. Acceptance of Terms',
    content: 'By creating an account, browsing any of our platforms (indastreet.id, indastreetmassage.com, or other sites), or engaging with any service provider listed on our network, you expressly agree to comply with and be legally bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations of the Republic of Indonesia. Your continued use of any platform constitutes ongoing acceptance of any modifications or updates to these Terms. We reserve the right to update, modify, or replace any part of these Terms at our sole discretion without prior notice. It is your responsibility to review these Terms periodically for changes.'
  },
  platformNature: {
    title: '2. Nature of Platform and Services',
    content: 'IndaStreet operates indastreet.id as our primary platform along with sister websites including indastreetmassage.com and other sites currently in development. We provide an online directory and connection platform that allows users to discover and connect with independent massage therapists and massage establishments ("Service Providers"). IndaStreet does not employ, contract with, supervise, direct, or control any Service Providers listed on any of our platforms. All Service Providers are independent contractors or independent business entities operating under their own business licenses and legal authority. IndaStreet does not provide massage services, wellness services, or any therapeutic services directly. We are solely a technology platform facilitating connections between users and independent service providers across our network of websites.'
  },
  governingLaw: {
    title: '3. Governing Law and Jurisdiction',
    content: 'These Terms of Service apply to all IndaStreet platforms including indastreet.id and sister sites. All transactions, operations, services, and activities conducted through or facilitated by any IndaStreet platform are governed exclusively by and construed in accordance with the laws of the Republic of Indonesia. Any legal proceedings, disputes, or claims arising from these Terms must be filed exclusively in the courts of Jakarta, Indonesia, and you hereby consent to the exclusive jurisdiction and venue of such courts. By using our platforms, you acknowledge and agree that Indonesian law shall apply to all aspects of your use of our services, regardless of your physical location or residence.'
  },
  userRights: {
    title: '4. User Account Management and Platform Access Rights',
    content: 'IndaStreet reserves the absolute and unconditional right to suspend, terminate, deactivate, or permanently ban any user account across all our platforms (indastreet.id, indastreetmassage.com, and other sites) at any time, for any reason or no reason whatsoever, without prior notice, without explanation, and without liability to the user or any third party. This right includes situations where we suspect or determine that a user has violated these Terms, engaged in fraudulent activity, abused any platform, harassed service providers or other users, provided false information, engaged in illegal activities, or for any other reason we deem appropriate. Account termination applies across all IndaStreet platforms. Users whose accounts have been terminated are prohibited from creating new accounts on any of our platforms without our express written permission. We reserve the right to refuse service to anyone for any reason at any time. All decisions regarding account status are final and not subject to appeal.'
  },
  confidentiality: {
    title: '5. Confidentiality and Data Privacy',
    content: 'All information, personal data, correspondence, and materials submitted by users to any IndaStreet platform shall be treated as confidential and proprietary information. This information will be collected, stored, processed, and used in accordance with our Privacy Policy and Indonesian data protection regulations across all our platforms. Data may be shared between our platforms (indastreet.id, indastreetmassage.com, and other sites) to provide seamless service. IndaStreet implements reasonable security measures to protect user information; however, no method of transmission or electronic storage is 100% secure. By using our platforms, you acknowledge the inherent risks of providing information online. We will not sell, rent, or share your personal information with third parties except as outlined in our Privacy Policy or as required by Indonesian law. You grant IndaStreet a perpetual, irrevocable, worldwide license to use any feedback, suggestions, or ideas you provide regarding any of our platforms without compensation or attribution.'
  },
  therapistRightsTitle: '6. Service Provider Rights and Safety',
  therapistRightsContent: 'All services facilitated through IndoStreet are strictly for professional, legitimate massage therapy and wellness services only. Service Providers, as independent contractors, retain the absolute right to refuse service, decline appointments, or terminate any session at any time if they feel uncomfortable, unsafe, threatened, or if they determine that the client is under the influence of alcohol or controlled substances, if there is an unauthorized person present in the service location, if the client makes inappropriate requests or displays inappropriate behavior, or for any other reason the Service Provider deems appropriate. IndoStreet fully supports Service Providers in exercising their professional judgment and personal safety rights. Users who demonstrate disrespectful, threatening, or inappropriate behavior toward Service Providers will have their accounts immediately terminated and may be reported to local law enforcement authorities. The safety and professional integrity of Service Providers are paramount priorities.',
  paymentTitle: '7. Payment Terms and Financial Transactions',
  paymentContent: 'Payment for all massage packages, services, and membership fees must be made in full, in Indonesian Rupiah (IDR), before the commencement of any service or activation of any membership. All payments are processed through our authorized payment channels. Payment confirms your acceptance of the service terms and the specific package selected. Services will be provided for the duration and specifications of the paid package only. All sales are final unless otherwise specified. IndoStreet is not responsible for payment disputes between users and Service Providers. Any refund requests must be submitted in writing within 24 hours of the transaction and will be reviewed on a case-by-case basis at our sole discretion. Processing fees, transaction fees, and administrative charges are non-refundable under any circumstances.',
  clientCommunicationTitle: '8. User-Provider Communication and Service Delivery',
  clientCommunicationContent: 'Users are encouraged and expected to maintain clear, professional communication with their chosen Service Providers throughout the service delivery process. You may request adjustments to massage pressure (firm, light, medium), focus areas, or techniques at any point during your session to ensure your comfort and satisfaction. If you experience any discomfort, pain, or concerns during your massage, you must immediately communicate this to your Service Provider. Complaints, disputes, or issues regarding service quality, provider conduct, or service delivery cannot be accepted, processed, or addressed after the completion of the massage session. All concerns must be raised during the active service period. IndoStreet encourages real-time communication between users and providers to ensure optimal service experiences.',
  clientRightsTitle: '9. User Rights and Service Verification',
  clientRightsContent: 'Users have the right to verify that the Service Provider who arrives for their appointment matches the profile, photographs, and information displayed on the IndoStreet platform. In the event that the arriving Service Provider does not match the advertised profile or if there are significant discrepancies in the provider\'s identity, qualifications, or appearance, the user has the right to cancel the appointment without any payment obligation or cancellation penalty. Your trust, safety, and satisfaction are important to us. However, minor variations in appearance due to photography, lighting, or natural changes over time should be expected and do not constitute grounds for cancellation. Users are expected to exercise reasonable judgment when verifying provider identity.',
  therapistObligationsTitle: '10. Service Provider Obligations and Standards',
  therapistObligationsContent: 'Service Providers are required to provide all essential materials, equipment, and supplies necessary to deliver professional massage services, including but not limited to clean linens, bed covers, massage tables or portable equipment, hand sanitizing wipes, certified massage oils or lotions, and any other materials standard to professional massage therapy practice. All materials must meet Indonesian health and safety standards. If a Service Provider arrives without the necessary equipment or materials required to perform the advertised service safely and professionally, the user has the right to cancel the appointment without payment and without penalty. Service Providers are expected to maintain the highest standards of professionalism, hygiene, and service quality.',
  professionalismTitle: '11. Professional Standards and Code of Conduct',
  professionalismContent: 'All Service Providers listed on IndoStreet are represented as licensed, trained professionals who must maintain strict adherence to professional massage therapy standards, ethical conduct, and Indonesian business regulations. If any Service Provider fails to maintain professional boundaries, engages in inappropriate conduct, violates professional ethics, or behaves in any manner inconsistent with professional massage therapy practice, users are strongly encouraged and obligated to immediately report such conduct to IndoStreet customer service. We take all reports seriously and will investigate complaints thoroughly. Service Providers found to have violated professional standards will be subject to immediate removal from our platform and may be reported to relevant licensing authorities and law enforcement as appropriate.',
  userConduct: {
    title: '12. Prohibited User Conduct',
    content: 'Users of the IndoStreet platform are strictly prohibited from engaging in the following activities:',
    prohibitions: [
      'Using the platform for any illegal, unlawful, or unauthorized purpose under Indonesian law or international law',
      'Requesting, soliciting, or engaging in any services of a sexual nature, illegal activities, or activities that violate professional massage therapy ethics',
      'Harassing, threatening, intimidating, or abusing Service Providers, other users, or IndoStreet staff',
      'Providing false, misleading, or fraudulent information during registration or at any point while using the platform',
      'Attempting to circumvent, disable, or interfere with security features of the platform or access unauthorized areas',
      'Using automated systems, bots, scrapers, or any technology to access or collect data from the platform without authorization',
      'Posting, transmitting, or sharing any content that is defamatory, obscene, offensive, or violates intellectual property rights',
      'Impersonating any person or entity, or falsely representing your affiliation with any person or entity',
      'Interfering with or disrupting the platform, servers, or networks connected to the platform',
      'Violating any applicable local, state, national, or international law or regulation',
      'Using the platform to transmit any malicious code, viruses, or harmful technology',
      'Attempting to gain unauthorized access to other user accounts or any systems or networks connected to the platform'
    ]
  },
  intellectualProperty: {
    title: '13. Intellectual Property Rights',
    content: 'All content, features, functionality, designs, logos, trademarks, service marks, graphics, photographs, text, software, and all other materials available on the IndoStreet platform ("Platform Content") are owned by IndoStreet Massage, our licensors, or other content providers and are protected by Indonesian and international copyright, trademark, patent, trade secret, and other intellectual property laws. The IndoStreet name, logo, and all related names, logos, product and service names, designs, images, and slogans are trademarks of IndoStreet or our affiliates. You may not use these marks without our prior written permission. All rights not expressly granted to you in these Terms are reserved by IndoStreet. Unauthorized use of Platform Content may violate copyright, trademark, and other laws and may subject you to civil and criminal penalties.'
  },
  disclaimerTitle: '14. Comprehensive Disclaimer of Warranties and Liabilities',
  disclaimerContent: 'INDASTREET (OPERATING INDASTREET.ID, INDASTREETMASSAGE.COM, AND OTHER PLATFORMS) IS A DIRECTORY AND CONNECTION PLATFORM ONLY. WE DO NOT EMPLOY, SUPERVISE, DIRECT, CONTROL, VERIFY, VET, BACKGROUND CHECK, CERTIFY, OR GUARANTEE ANY SERVICE PROVIDERS LISTED ON ANY OF OUR PLATFORMS. ALL SERVICE PROVIDERS ARE INDEPENDENT CONTRACTORS OPERATING THEIR OWN BUSINESSES. WE MAKE NO REPRESENTATIONS, WARRANTIES, OR GUARANTEES REGARDING THE QUALIFICATIONS, SKILLS, LICENSING, INSURANCE, BACKGROUND, CONDUCT, SAFETY, RELIABILITY, QUALITY, OR LEGALITY OF ANY SERVICE PROVIDER. YOU ENGAGE WITH SERVICE PROVIDERS ENTIRELY AT YOUR OWN RISK AND DISCRETION. INDASTREET IS NOT RESPONSIBLE AND SHALL NOT BE LIABLE FOR ANY ACTIONS, CONDUCT, OMISSIONS, SERVICES, QUALITY OF SERVICES, SAFETY ISSUES, INJURIES, DAMAGES, LOSSES, DISPUTES, CLAIMS, OR ANY OTHER MATTERS ARISING FROM OR RELATED TO YOUR INTERACTIONS WITH, SERVICES RECEIVED FROM, OR CONDUCT OF ANY SERVICE PROVIDER FOUND THROUGH ANY OF OUR PLATFORMS. BY USING ANY INDASTREET PLATFORM, YOU EXPRESSLY ACKNOWLEDGE AND AGREE THAT WE PROVIDE THE PLATFORMS "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.',
  limitationOfLiability: {
    title: '15. Limitation of Liability and Damages',
    content: 'TO THE MAXIMUM EXTENT PERMITTED BY INDONESIAN LAW, INDOSTREET, ITS PARENT COMPANIES, SUBSIDIARIES, AFFILIATES, OFFICERS, DIRECTORS, EMPLOYEES, AGENTS, PARTNERS, LICENSORS, AND SERVICE PROVIDERS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, PUNITIVE, OR EXEMPLARY DAMAGES, INCLUDING BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA, OR OTHER INTANGIBLE LOSSES, ARISING FROM OR RELATED TO YOUR USE OR INABILITY TO USE THE PLATFORM OR SERVICES, UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR TRANSMISSIONS OR DATA, STATEMENTS OR CONDUCT OF ANY SERVICE PROVIDER OR THIRD PARTY ON THE PLATFORM, ANY SERVICES RECEIVED THROUGH THE PLATFORM, OR ANY OTHER MATTER RELATING TO THE PLATFORM OR SERVICES, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF INDOSTREET HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. IN NO EVENT SHALL INDOSTREET\'S TOTAL LIABILITY TO YOU FOR ALL DAMAGES, LOSSES, AND CAUSES OF ACTION EXCEED THE AMOUNT PAID BY YOU TO INDOSTREET IN THE SIX (6) MONTHS PRECEDING THE CLAIM, OR IDR 100,000 (ONE HUNDRED THOUSAND INDONESIAN RUPIAH), WHICHEVER IS LESS.'
  },
  disputeResolution: {
    title: '16. Dispute Resolution and User-Provider Relations',
    content: 'Any and all disputes, disagreements, conflicts, claims, or issues arising from services rendered, quality of services, conduct of Service Providers, payment disputes, cancellations, scheduling conflicts, or any other matters related to the provision of massage services MUST be resolved directly between the user and the Service Provider. IndoStreet is not a party to any service agreement between users and Service Providers. IndoStreet will not and shall not act as a mediator, arbitrator, adjudicator, or dispute resolver in any conflict between users and Service Providers. We will not intervene in disputes, make judgments regarding fault or liability, or enforce any remedies between parties. All service-related disputes are outside the scope of IndoStreet\'s responsibilities and liabilities. Users and Service Providers are encouraged to communicate directly and professionally to resolve any issues that may arise.'
  },
  indemnification: {
    title: '17. User Indemnification Obligations',
    content: 'You agree to defend, indemnify, compensate, and hold completely harmless IndoStreet Massage, its parent companies, subsidiaries, affiliates, partners, officers, directors, employees, agents, contractors, licensors, service providers, and all IndoStreet representatives (collectively, "IndoStreet Parties") from and against any and all claims, damages, obligations, losses, liabilities, costs, debts, expenses (including but not limited to attorney\'s fees and legal costs), and demands arising from or related to: (a) your use or misuse of the platform and services; (b) your violation of these Terms and Conditions; (c) your violation of any third-party rights, including but not limited to intellectual property rights, privacy rights, or other proprietary rights; (d) your interactions with, services received from, or disputes with any Service Provider; (e) any content you submit, post, or transmit through the platform; (f) your violation of any applicable laws or regulations; (g) any claim that your use of the platform caused damage to a third party; (h) your negligent or wrongful conduct; or (i) any other matter arising from your use of or conduct on the platform. This indemnification obligation shall survive termination of your account and your use of the platform.'
  },
  modifications: {
    title: '18. Modifications to Terms and Services',
    content: 'IndoStreet reserves the right, in our sole and absolute discretion, to modify, amend, update, change, add to, or remove portions of these Terms and Conditions at any time without prior notice to users. We may also modify, suspend, or discontinue any aspect of the platform or services, including features, functionality, databases, content, or hours of availability, temporarily or permanently, without notice and without liability. Your continued use of the platform following any changes to these Terms constitutes your acceptance of such changes. It is your responsibility to review these Terms periodically. If you do not agree with any modifications, your sole remedy is to discontinue use of the platform and close your account. We may also impose limits on certain features or restrict your access to parts or all of the platform without notice or liability.'
  },
  severability: {
    title: '19. Severability and Enforceability',
    content: 'If any provision of these Terms and Conditions is found by a court of competent jurisdiction or arbitrator to be invalid, illegal, or unenforceable under Indonesian law or any applicable law, such provision shall be deemed modified to the minimum extent necessary to make it valid, legal, and enforceable while preserving its intent, or if such modification is not possible, such provision shall be severed from these Terms. The invalidity, illegality, or unenforceability of any provision shall not affect the validity, legality, or enforceability of any other provision of these Terms, which shall remain in full force and effect. The remaining provisions shall be interpreted to give effect to the intentions of the parties as reflected in the original provision to the greatest extent permitted by law.'
  },
  entireAgreement: {
    title: '20. Entire Agreement and Waiver',
    content: 'These Terms and Conditions, together with our Privacy Policy and any additional terms, policies, or guidelines posted on the platform, constitute the entire agreement between you and IndoStreet regarding your use of the platform and services, and supersede all prior or contemporaneous understandings, agreements, representations, and warranties, whether written or oral, regarding the subject matter. No waiver of any term or condition of these Terms shall be deemed a further or continuing waiver of such term or condition or any other term or condition. Any failure by IndoStreet to enforce any right or provision of these Terms shall not constitute a waiver of such right or provision unless acknowledged and agreed to by IndoStreet in writing.'
  },
  contactInformation: {
    title: '21. Contact Information and Customer Support',
    content: 'If you have any questions, concerns, complaints, or inquiries regarding these Terms of Service, our services across any platform (indastreet.id, indastreetmassage.com, or other sites), your account, billing matters, technical support, or any other issues, please contact our customer service team at: Email: indastreet.id@gmail.com | WhatsApp: +62 XXX-XXXX-XXXX | Address: Jakarta, Indonesia. We strive to respond to all legitimate inquiries within 48-72 business hours. For urgent safety concerns or to report violations of these Terms, please use our priority reporting system available through the app.'
  },
  customerServiceButton: 'Contact Customer Service',
};
translations.en.privacyPolicy = {
  title: 'Privacy Policy',
  lastUpdated: 'Last Updated: January 5, 2026',
  introduction: {
    title: '1. Introduction',
    content: 'IndaStreet ("we", "our", or "us") operates indastreet.id as our primary platform along with sister websites including indastreetmassage.com and other sites currently in development. We respect your privacy and are committed to protecting your personal data across all our platforms. This Privacy Policy explains how we collect, use, store, and share your information when you use any of our services. By using IndaStreet\'s platforms, you agree to the collection and use of information in accordance with this policy. This policy is governed by Indonesian Law including but not limited to Law No. 27 of 2022 on Personal Data Protection (UU PDP).',
  },
  dataCollection: {
    title: '2. Information We Collect',
    personal: 'Personal Information: Name, email address, phone number, WhatsApp number, and payment information you provide during registration or booking across any of our platforms',
    usage: 'Usage Data: IP address, browser type, device information, pages visited, time spent on pages, and other diagnostic data collected across our network of sites',
    location: 'Location Data: GPS coordinates and address information when you use location-based features to find nearby therapists and massage places on any of our platforms',
    photos: 'Photos and Media: Profile pictures, business photos, and other images you upload to any of our platforms',
    communications: 'Communications: Messages, reviews, ratings, and feedback you provide through any of our platforms',
  },
  dataUsage: {
    title: '3. How We Use Your Information',
    content: 'We use the collected information across all our platforms for the following purposes:',
    points: [
      'To provide and maintain our directory and booking services across indastreet.id and sister sites',
      'To process your bookings and facilitate connections between users and service providers',
      'To calculate distances between your location and therapists/massage places',
      'To send booking confirmations, notifications, and important updates',
      'To improve our platforms and develop new features',
      'To detect, prevent, and address technical issues and fraudulent activity',
      'To comply with legal obligations under Indonesian law',
      'To enforce our Terms and Conditions across all platforms',
      'To provide seamless service across our network of websites',
    ],
  },
  dataSharing: {
    title: '4. Information Sharing and Disclosure',
    content: 'We may share your information across our platforms and with:',
    points: [
      'Sister Sites: Your data may be shared between indastreet.id, indastreetmassage.com, and our other platforms to provide seamless service',
      'Service Providers: Therapists and massage places you book with will receive your name, contact information, and booking details',
      'Agents: Our authorized agents may access user data to facilitate connections and manage the platform',
      'Payment Processors: Third-party payment services to process your transactions',
      'Government Authorities: When required by Indonesian law or legal proceedings',
      'Business Transfers: In the event of a merger, acquisition, or sale of assets',
    ],
    note: 'We do not sell your personal data to third parties for marketing purposes. Data shared between our platforms is for operational purposes only.',
  },
  legalBasis: {
    title: '5. Legal Basis for Processing (Indonesian Law)',
    content: 'Under Indonesian Personal Data Protection Law (UU PDP), we process your data across all our platforms based on:',
    points: [
      'Consent: You have given clear consent for us to process your personal data across our network',
      'Contract: Processing is necessary to fulfill our service agreement with you',
      'Legal Obligation: To comply with Indonesian laws and regulations',
      'Legitimate Interest: To operate and improve our platform services',
    ],
  },
  dataRetention: {
    title: '6. Data Retention',
    content: 'We retain your personal data across all our platforms for as long as necessary to provide our services and comply with legal obligations. Specifically: Active accounts are retained indefinitely; Inactive accounts may be deleted after 2 years of inactivity; Booking records are kept for 5 years for legal and tax purposes; Communications and reviews are retained for platform integrity. Your data may be accessible across indastreet.id and our sister sites.',
  },
  security: {
    title: '7. Data Security',
    content: 'We implement appropriate technical and organizational security measures to protect your personal data across all our platforms against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your account credentials across all our platforms.',
  },
  yourRights: {
    title: '8. Your Rights Under Indonesian Law',
    content: 'Under UU PDP and applicable Indonesian regulations, you have the right to: Access your personal data across all our platforms; Correct inaccurate or incomplete data; Request deletion of your data from all our platforms (subject to legal retention requirements); Object to processing of your data; Withdraw consent at any time; Request data portability; File complaints with Indonesian authorities (Kementerian Komunikasi dan Informatika). To exercise these rights, contact us at the details provided below. Note: IndaStreet reserves the right to suspend or ban any user account across all our platforms at our sole discretion, with or without cause, as stated in our Terms and Conditions.',
  },
  cookies: {
    title: '9. Cookies and Tracking Technologies',
    content: 'We use cookies and similar tracking technologies across indastreet.id and our sister websites to enhance your experience, analyze usage patterns, and improve our services. Cookies may be shared between our platforms to provide seamless service. You can control cookies through your browser settings, but disabling cookies may affect platform functionality.',
  },
  thirdPartyServices: {
    title: '10. Third-Party Services',
    content: 'Our platforms (indastreet.id, indastreetmassage.com, and other sites) may contain links to third-party websites or services (including Google Maps, payment gateways, and WhatsApp). We are not responsible for the privacy practices of these third parties. We encourage you to review their privacy policies.',
  },
  childrenPrivacy: {
    title: '11. Children\'s Privacy',
    content: 'IndaStreet\'s platforms, including indastreet.id and sister sites, are not intended for users under the age of 18. We do not knowingly collect personal data from children across any of our platforms. If you believe a child has provided us with personal information, please contact us immediately.',
  },
  dataTransfer: {
    title: '12. International Data Transfers',
    content: 'Your data is primarily stored and processed in Indonesia across our network of platforms. Data may be transferred between our platforms (indastreet.id, indastreetmassage.com, and other sites) as needed to provide services. If we transfer data outside Indonesia, we will ensure appropriate safeguards are in place as required by Indonesian law.',
  },
  policyChanges: {
    title: '13. Changes to This Privacy Policy',
    content: 'We may update this Privacy Policy from time to time. Changes will be posted across all our platforms with an updated "Last Updated" date. Continued use of any IndaStreet platform after changes constitutes acceptance of the updated policy. For material changes, we will provide prominent notice across our network.',
  },
  governing: {
    title: '14. Governing Law and Jurisdiction',
    content: 'This Privacy Policy applies to all IndaStreet platforms including indastreet.id and sister sites. It is governed by and construed in accordance with the laws of the Republic of Indonesia. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in Jakarta, Indonesia.',
  },
  disclaimer: {
    title: '15. Disclaimer',
    content: 'IndaStreet (operating indastreet.id, indastreetmassage.com, and other platforms) is a directory and connection platform only. We are not responsible for the actions, services, or privacy practices of therapists, massage places, or other users. All interactions between users and service providers are at your own risk.',
  },
  contact: {
    title: '16. Contact Us',
    content: 'If you have questions about this Privacy Policy, wish to exercise your rights, or have privacy concerns regarding any of our platforms (indastreet.id, indastreetmassage.com, or other sites), please contact us at: Email: indastreet.id@gmail.com | WhatsApp: +62 XXX-XXXX-XXXX | Address: Jakarta, Indonesia',
  },
};

translations.id.registrationChoice = {
  title: 'Bergabung dengan Kami',
  prompt: 'Apakah Anda terapis individu atau tempat pijat?',
  therapistButton: 'Saya Terapis',
  placeButton: 'Saya Tempat Pijat',
};
translations.id.joinIndastreet = {
  title: "Bergabung dengan Direktori Pijat Indonesia",
  titleHighlight: "GRATIS HARI INI",
  subtitle: "Rasakan potensi sejati dari pemesanan pijat online",
  whyJoinTitle: "🌟 Mengapa Bergabung dengan Indastreet?",
  whyJoinText: "Tidak peduli di mana Anda berada di seluruh Indonesia, pelanggan Indastreet sedang mencari layanan pijat sekarang. Jangan lewatkan—daftarkan akun Anda GRATIS dan skalakan bisnis Anda ke tingkat berikutnya dengan platform pemesanan pijat terbesar di Indonesia.",
  benefitsTitle: "Manfaat",
  benefit1Title: "Dapatkan Lebih Banyak Pesanan",
  benefit1Text: "Jangkau pelanggan 24/7 dengan pemesanan online instan",
  benefit2Title: "Tingkatkan Pendapatan Anda",
  benefit2Text: "Isi jadwal Anda dengan pelanggan terverifikasi",
  benefit3Title: "Bangun Merek Anda",
  benefit3Text: "Tampilkan ulasan dan kembangkan reputasi Anda",
  platformFeaturesTitle: "✨ Fitur Platform",
  feature1Title: "Halaman Profil Anda Sendiri",
  feature1Text: "Profil profesional dengan foto, layanan, dan harga",
  feature2Title: "Notifikasi Real-Time",
  feature2Text: "Dapatkan peringatan instan untuk permintaan pemesanan baru",
  feature3Title: "Ulasan Pelanggan",
  feature3Text: "Bangun kepercayaan dengan umpan balik pelanggan terverifikasi",
  feature4Title: "Dashboard Mobile",
  feature4Text: "Kelola pemesanan di mana saja, kapan saja",
  feature5Title: "Kemitraan Hotel & Villa",
  feature5Text: "Dapatkan pemesanan dari properti mewah",
  feature6Title: "Tanpa Biaya Komisi",
  feature6Text: "Simpan 100% pendapatan Anda dari pemesanan",
  successStoriesTitle: "❤️ Kisah Sukses",
  testimonial1Name: "Terapis Pijat Bali",
  testimonial1Text: "Saya menggandakan pemesanan saya dalam bulan pertama. Pelanggan menyukai sistem pemesanan online yang mudah!",
  testimonial1Rating: "⭐⭐⭐⭐⭐ rating 4.9 • 250+ pemesanan",
  testimonial2Name: "Spa Kesehatan Ubud",
  testimonial2Text: "Program kemitraan hotel menghubungkan kami dengan villa mewah. Pendapatan kami meningkat 3x!",
  testimonial2Rating: "⭐⭐⭐⭐⭐ rating 5.0 • 500+ pemesanan",
  howItWorksTitle: "🚀 Cara Kerjanya",
  step1Title: "Buat Profil Anda",
  step1Text: "Tambahkan foto, layanan, harga, dan ketersediaan",
  step2Title: "Dapatkan Verifikasi",
  step2Text: "Selesaikan verifikasi untuk membangun kepercayaan pelanggan",
  step3Title: "Terima Pemesanan",
  step3Text: "Terima atau tolak permintaan langsung melalui notifikasi",
  step4Title: "Kembangkan Bisnis Anda",
  step4Text: "Kumpulkan ulasan, bangun reputasi, dan tingkatkan pendapatan",
  ctaTherapistTitle: "BERGABUNG SEBAGAI TERAPIS",
  ctaTherapistButton: "Buat Akun Terapis →",
  ctaSpaTitle: "BERGABUNG SEBAGAI SPA PIJAT",
  ctaSpaButton: "Buat Akun Spa Pijat →",
  contactTitle: "Butuh Bantuan untuk Memulai?",
  contactText: "Tim kami siap membantu Anda dengan proses pendaftaran",
  contactButton: "Hubungi Kami di WhatsApp",
};
translations.id.home = {
  homeServiceTab: 'Layanan Rumah',
  massagePlacesTab: 'Tempat Pijat',
  therapistsTitle: 'Terapis Pijat Rumahan',
  therapistsSubtitle: 'Temukan terapis terbaik di Bali',
  noTherapistsAvailable: 'Tidak ada terapis tersedia di area Anda saat ini.',
  noPlacesAvailable: 'Tidak ada tempat pijat tersedia di area Anda',
  massagePlacesTitle: 'Spa Pijat Unggulan',
  massagePlacesSubtitle: 'Temukan tempat pijat terbaik di Bali',
  massageDirectory: 'Direktori Pijat',
  massageDirectoryTitle: 'Pergi ke Direktori Pijat',
  viewMassageSpa: 'Lihat Spa Pijat',
  cityLocation: 'Kota / Lokasi',
  // Massage Types Page
  readMore: 'Baca Selengkapnya',
  readLess: 'Baca Lebih Sedikit',
  aboutMassage: 'Tentang',
  keyBenefits: 'Manfaat Utama',
  bestFor: 'Terbaik Untuk',
  findTherapists: 'Cari Terapis',
  findMassagePlaces: 'Cari Tempat Pijat',
  pressure: 'Tekanan',
};
translations.id.blog = {
  pageTitle: 'Blog IndaStreet',
  featuredArticles: 'Artikel Unggulan',
  allArticles: 'Semua Artikel',
  readArticle: 'Baca Artikel',
  readMore: 'Baca Selengkapnya',
  stayUpdated: 'Tetap Terupdate dengan Wawasan Industri Kesehatan',
  newsletterDesc: 'Dapatkan artikel mingguan, tren industri, dan tips profesional langsung ke inbox Anda',
  enterEmail: 'Masukkan email Anda',
  subscribe: 'Berlangganan',
  popularTopics: 'Topik Populer',
  topics: {
    balineseMassage: 'Pijat Bali',
    hotelSpaManagement: 'Manajemen Spa Hotel',
    therapistCertification: 'Sertifikasi Terapis',
    wellnessTourism: 'Pariwisata Kesehatan',
    deepTissueTechniques: 'Teknik Deep Tissue',
    careerGrowth: 'Pengembangan Karier',
    clientRetention: 'Retensi Klien',
    aromatherapy: 'Aromaterapi',
  },
  categoryAll: 'Semua Artikel',
  categoryIndustry: 'Tren Industri',
  categoryTechniques: 'Teknik Pijat',
  categoryCareer: 'Nasihat Karir',
  categoryWellness: 'Tips Kesehatan',
  featured: 'Unggulan',
};
translations.id.howItWorks = {
  heroTitle: 'Cara Kerja IndaStreet',
  heroSubtitle: 'Panduan Lengkap Pasar Kesehatan Terkemuka di Indonesia',
  tabTherapists: 'Terapis',
  tabHotels: 'Hotel & Villa',
  tabEmployers: 'Pemberi Kerja',
  tabAgents: 'Agen',
  therapistTitle: 'Bagaimana Terapis Sukses di IndaStreet',
  therapistSubtitle: 'Bangun karir Anda, temukan peluang, kembangkan basis klien',
  step1Title: 'Buat Profil Anda',
  step1Desc: 'Daftar dan buat profil detail yang menampilkan sertifikat, spesialisasi, pengalaman, dan bahasa Anda.',
  step1Item1: 'Unggah sertifikat',
  step1Item2: 'Daftarkan spesialisasi',
  step1Item3: 'Tambahkan pengalaman kerja',
  step2Title: 'Pilih Keanggotaan Anda',
  step2Desc: 'Pilih paket keanggotaan yang sesuai dengan kebutuhan Anda. Dapatkan verifikasi dan tampil di hasil pencarian.',
  step2Item1: '1, 3, 6, atau 12 bulan',
  step2Item2: 'Lencana terverifikasi',
  step2Item3: 'Penempatan prioritas',
  step3Title: 'Mulai Menerima Pemesanan',
  step3Desc: 'Terima permintaan pemesanan dari hotel, spa, dan klien langsung. Terima pekerjaan yang sesuai jadwal Anda.',
  step3Item1: 'Notifikasi instan',
  step3Item2: 'Integrasi WhatsApp',
  step3Item3: 'Penjadwalan fleksibel',
  membershipBenefitsTitle: 'Manfaat Keanggotaan',
  benefit1Title: 'Visibilitas Ditingkatkan',
  benefit1Desc: 'Muncul di bagian atas hasil pencarian',
  benefit2Title: 'Pemesanan Klien Langsung',
  benefit2Desc: 'Terima pemesanan dari klien terverifikasi',
  benefit3Title: 'Dashboard Profesional',
  benefit3Desc: 'Kelola pemesanan dan profil dengan mudah',
  benefit4Title: 'Lencana Terverifikasi',
  benefit4Desc: 'Bangun kepercayaan dengan status terverifikasi',
  hotelTitle: 'Hotel & Villa Mitra',
  hotelSubtitle: 'Terhubung dengan terapis terverifikasi, sederhanakan pemesanan, tingkatkan pengalaman tamu',
  employerTitle: 'Untuk Pemberi Kerja',
  employerSubtitle: 'Temukan terapis berkualitas, rekrut dengan percaya diri, kembangkan bisnis Anda',
  agentTitle: 'Untuk Agen & Mitra',
  agentSubtitle: 'Dapatkan komisi, kembangkan jaringan Anda, dukung kesehatan lokal',
  needHelpTitle: 'Butuh Bantuan?',
  needHelpDesc: 'Hubungi tim dukungan kami untuk pertanyaan apa pun',
  chatSupport: 'Chat Dukungan Pelanggan',
  // Hotel tab
  hotelSectionTitle: 'Cara Hotel & Villa Menggunakan IndaStreet',
  hotelSectionSubtitle: 'Temukan terapis berkualitas, kelola spa Anda, kembangkan bisnis',
  hotelStep1Title: 'Daftarkan Properti Anda',
  hotelStep1Desc: 'Buat akun hotel/villa dengan detail properti',
  hotelStep2Title: 'Jelajahi Terapis',
  hotelStep2Desc: 'Cari profesional terverifikasi berdasarkan spesialisasi dan lokasi',
  hotelStep3Title: 'Kirim Permintaan Pemesanan',
  hotelStep3Desc: 'Hubungi terapis langsung melalui integrasi WhatsApp',
  hotelStep4Title: 'Kelola Spa Anda',
  hotelStep4Desc: 'Lacak pemesanan, terapis, dan layanan dari dashboard',
  hotelBenefitsTitle: 'Manfaat Hotel',
  hotelBenefit1Title: 'Akses ke 500+ Terapis Terverifikasi',
  hotelBenefit1Desc: 'Semua bersertifikat dengan pemeriksaan latar belakang',
  hotelBenefit2Title: 'Solusi Staf Hari yang Sama',
  hotelBenefit2Desc: 'Temukan terapis pengganti dengan cepat',
  hotelBenefit3Title: 'Dashboard Manajemen Spa',
  hotelBenefit3Desc: 'Lacak layanan, pemesanan, dan terapis',
  hotelBenefit4Title: 'Terapis Multi-Bahasa',
  hotelBenefit4Desc: 'Layani tamu internasional secara efektif',
  // Employer tab
  employerSectionTitle: 'Cara Pemberi Kerja Merekrut di IndaStreet',
  employerSectionSubtitle: 'Pasar kerja terlindungi privasi untuk perekrutan kontrak',
  employerCard1Title: 'Jelajahi Pencari Kerja',
  employerCard1Desc: 'Cari pasar "Terapis Untuk Kontrak" kami untuk menemukan profesional berkualitas yang aktif mencari peluang kerja.',
  employerCard1Item1: 'Filter berdasarkan spesialisasi, pengalaman, lokasi',
  employerCard1Item2: 'Lihat sertifikat dan riwayat pekerjaan',
  employerCard1Item3: 'Nama dilindungi sampai Anda membuka',
  employerCard2Title: 'Buka Detail Kontak',
  employerCard2Desc: 'Bayar biaya satu kali IDR 300.000 untuk membuka informasi kontak lengkap termasuk nomor WhatsApp dan nama lengkap.',
  employerCard2Item1: 'Pembayaran aman melalui transfer bank',
  employerCard2Item2: 'Akses instan setelah verifikasi',
  employerCard2Item3: 'Komunikasi WhatsApp langsung',
  employerCard3Title: 'Wawancara & Rekrut',
  employerCard3Desc: 'Hubungi terapis langsung melalui WhatsApp. Lakukan wawancara, periksa referensi, dan buat keputusan perekrutan.',
  employerCard3Item1: 'Tidak ada biaya platform untuk perekrutan',
  employerCard3Item2: 'Negosiasi persyaratan secara langsung',
  employerCard3Item3: 'Verifikasi sertifikat sendiri',
  employerCard4Title: 'Tinggalkan Ulasan',
  employerCard4Desc: 'Setelah merekrut, tinggalkan ulasan jujur untuk membantu pemberi kerja lain dan membangun reputasi terapis di platform.',
  employerCard4Item1: 'Nilai profesionalisme',
  employerCard4Item2: 'Bagikan pengalaman Anda',
  employerCard4Item3: 'Bantu membangun kepercayaan komunitas',
  employerPrivacyTitle: 'Mengapa Model Privasi Kami Bekerja',
  employerPrivacyTherapist: 'Untuk Terapis:',
  employerPrivacyTherapistDesc: 'Melindungi mereka dari spam, pelecehan, dan kontak yang tidak diinginkan. Hanya pemberi kerja serius yang membayar dapat menghubungi mereka.',
  employerPrivacyEmployer: 'Untuk Pemberi Kerja:',
  employerPrivacyEmployerDesc: 'Memastikan akses ke pencari kerja serius. Biaya kecil menyaring pembuang waktu dan memastikan kandidat berkualitas.',
  // Agent tab
  agentSectionTitle: 'Cara Agen Menghasilkan di IndaStreet',
  agentSectionSubtitle: 'Rekrut terapis, dapatkan komisi, bangun jaringan Anda',
  agentStat1: '20%',
  agentStat1Label: 'Tingkat Komisi',
  agentStat2: '∞',
  agentStat2Label: 'Rekrutan Tidak Terbatas',
  agentStat3: '💰',
  agentStat3Label: 'Penghasilan Pasif',
  agentStep1Title: 'Daftar sebagai Agen',
  agentStep1Desc: 'Daftar sebagai agen dan dapatkan kode referral unik untuk mulai merekrut terapis.',
  agentStep2Title: 'Rekrut Terapis',
  agentStep2Desc: 'Bagikan kode referral Anda dengan terapis. Ketika mereka mendaftar dan membeli keanggotaan, Anda mendapat komisi.',
  agentStep3Title: 'Dapatkan Komisi',
  agentStep3Desc: 'Terima komisi 20% untuk setiap pembelian keanggotaan dari terapis yang Anda referensikan. Lacak pendapatan di dashboard.',
  agentCommissionTitle: 'Contoh Komisi',
  agentTablePackage: 'Paket',
  agentTablePrice: 'Harga',
  agentTableCommission: 'Komisi Anda (20%)',
  agentTableRecurring: 'Komisi Berulang (20%)',
  agentPackage1Month: '1 Bulan',
  agentPackage3Months: '3 Bulan',
  agentPackage6Months: '6 Bulan',
  agentPackage1Year: '1 Tahun',
  agentCommissionWorksTitle: '💰 Cara Kerja Komisi:',
  agentCommissionFirstMonth: 'Bulan Pertama: Dapatkan komisi 20% ketika terapis yang Anda rekrut mendaftar untuk pertama kali',
  agentCommissionRecurring: 'Berulang (Bulan 2+): Dapatkan komisi 20% setiap bulan terapis yang sama memperpanjang keanggotaan',
  agentExampleTitle: 'Contoh:',
  agentExampleDesc: 'Anda merekrut 1 terapis yang membeli paket 1 Bulan (IDR 200.000):',
  agentExampleMonth1: 'Bulan 1: Anda mendapat IDR 40.000 (20%)',
  agentExampleMonth2: 'Bulan 2: Jika mereka perpanjang, Anda mendapat IDR 40.000 (20%)',
  agentExampleMonth3Plus: 'Bulan 3+: Anda terus mendapat IDR 40.000 (20%) setiap bulan mereka aktif',
  agentPassiveIncomeTitle: '🚀 Bangun Penghasilan Pasif:',
  agentPassiveIncomeDesc: 'Rekrut 10 terapis dengan paket 1 bulan = IDR 400.000 bulan pertama + IDR 400.000 setiap bulan mereka perpanjang!',
  agentTotalEarningsTitle: '📊 Total Pendapatan Dari 1 Anggota Aktif (IDR 200.000/bulan):',
  agentEarningsAfter1Month: 'Setelah 1 Bulan',
  agentEarningsAfter1MonthAmount: 'IDR 40.000',
  agentEarningsAfter1MonthDesc: '20% bulan pertama',
  agentEarningsAfter3Months: 'Setelah 3 Bulan',
  agentEarningsAfter3MonthsAmount: 'IDR 120.000',
  agentEarningsAfter3MonthsDesc: 'Bulan 1 (20%) + Bulan 2-3 (20% masing-masing)',
};
translations.id.app = {
  mapsApiKeyWarning: 'Kunci API Google Maps tidak ada. Silakan konfigurasi di Admin Dashboard untuk mengaktifkan fitur lokasi.',
};
translations.id.membershipPage = {
  title: 'Pilih Keanggotaan',
  selectPackage: 'Pilih paket keanggotaan:',
  oneMonth: '1 Bulan - Rp 100,000',
  threeMonths: '3 Bulan - Rp 250,000',
  sixMonths: '6 Bulan - Rp 450,000',
  oneYear: '1 Tahun - Rp 800,000',
  contactAdmin: 'Silakan hubungi admin kami di {number} untuk menyelesaikan pembayaran.',
  whatsappButton: 'Hubungi Admin',
};
translations.id.bookingPage = {
  title: 'Buat Janji',
  selectDate: 'Pilih Tanggal',
  selectTime: 'Pilih Waktu',
  customerInfo: 'Informasi Pelanggan',
  nameLabel: 'Nama',
  whatsappLabel: 'Nomor WhatsApp',
  notesLabel: 'Catatan Tambahan (Opsional)',
  bookButton: 'Buat Janji',
  fillFieldsError: 'Mohon isi semua field yang diperlukan.',
  bookingSuccess: 'Janji berhasil dibuat!',
  loginPrompt: 'Silakan login untuk membuat booking',
  bookingSuccessTitle: 'Booking Dikonfirmasi!',
  bookingSuccessMessage: 'Booking Anda dengan {name} telah dikonfirmasi.',
};
translations.id.notificationsPage = {
  title: 'Notifikasi',
  noNotifications: 'Belum ada notifikasi.',
  markAllRead: 'Tandai Semua Sudah Dibaca',
};
translations.id.agentPage = {
  title: 'Portal Agen',
  description: 'Bergabunglah dengan program agen kami dan dapatkan komisi dengan mereferensikan terapis pijat dan tempat.',
  joinButton: 'Bergabung sebagai Agen',
  learnMore: 'Pelajari Lebih Lanjut',
};
translations.id.agentTermsPage = {
  title: 'Syarat & Ketentuan Agen',
  accept: 'Saya Setuju',
  decline: 'Tolak',
  terms: 'Silakan baca dan terima syarat dan ketentuan untuk melanjutkan.',
};
translations.id.detail = {
  title: 'Detail',
  description: 'Deskripsi',
  contact: 'Kontak',
  book: 'Pesan Sekarang',
  location: 'Lokasi',
  rating: 'Rating',
  reviews: 'Ulasan',
  pricing: 'Harga',
  availability: 'Ketersediaan',
  pricingTitle: 'Harga',
  contactButton: 'WhatsApp',
  bookButton: 'Pesan Sekarang'
};
translations.id.supabaseSettings = {
  title: 'Pengaturan Database',
  url: 'URL Supabase',
  key: 'Kunci Supabase',
  connect: 'Hubungkan',
  disconnect: 'Putuskan',
  status: 'Status Koneksi'
};
translations.id.serviceTerms = {
  title: 'Kebijakan Layanan',
  effectiveDate: 'Tanggal Berlaku: 1 Januari 2025 | Terakhir Diperbarui: 25 Oktober 2025',
  intro: 'Selamat datang di Platform Pijat IndoStreet. Syarat dan Ketentuan ini ("Ketentuan") merupakan perjanjian yang mengikat secara hukum antara Anda ("Pengguna", "Anda", atau "Milik Anda") dan IndoStreet Massage ("IndoStreet", "Kami", "Kita", atau "Milik Kami"). Dengan mengakses atau menggunakan platform, situs web, aplikasi seluler kami, atau layanan apa pun yang disediakan oleh IndoStreet, Anda mengakui bahwa Anda telah membaca, memahami, dan setuju untuk terikat oleh Ketentuan ini secara keseluruhan. Jika Anda tidak setuju dengan Ketentuan ini, Anda harus segera menghentikan semua penggunaan platform dan layanan kami.',
  acceptance: {
    title: '1. Penerimaan Ketentuan',
    content: 'Dengan membuat akun, menjelajahi platform kami, atau terlibat dengan penyedia layanan apa pun yang terdaftar di IndoStreet, Anda secara tegas setuju untuk mematuhi dan terikat secara hukum oleh Syarat dan Ketentuan ini, Kebijakan Privasi kami, dan semua hukum dan peraturan yang berlaku di Republik Indonesia. Penggunaan platform Anda yang berkelanjutan merupakan penerimaan berkelanjutan atas modifikasi atau pembaruan Ketentuan ini. Kami berhak untuk memperbarui, memodifikasi, atau mengganti bagian mana pun dari Ketentuan ini atas kebijakan kami sendiri tanpa pemberitahuan sebelumnya. Adalah tanggung jawab Anda untuk meninjau Ketentuan ini secara berkala untuk perubahan.'
  },
  platformNature: {
    title: '2. Sifat Platform dan Layanan',
    content: 'IndoStreet beroperasi secara eksklusif sebagai direktori online dan platform koneksi. Kami menyediakan antarmuka teknologi yang memungkinkan pengguna untuk menemukan dan terhubung dengan terapis pijat independen dan tempat pijat ("Penyedia Layanan"). IndoStreet tidak mempekerjakan, berkontrak dengan, mengawasi, mengarahkan, atau mengontrol Penyedia Layanan apa pun yang terdaftar di platform kami. Semua Penyedia Layanan adalah kontraktor independen atau entitas bisnis independen yang beroperasi di bawah lisensi bisnis dan otoritas hukum mereka sendiri. IndoStreet tidak menyediakan layanan pijat, layanan kesehatan, atau layanan terapeutik apa pun secara langsung. Kami hanyalah platform teknologi yang memfasilitasi koneksi antara pengguna dan penyedia layanan independen.'
  },
  governingLaw: {
    title: '3. Hukum yang Mengatur dan Yurisdiksi',
    content: 'Syarat dan Ketentuan ini, dan semua transaksi, operasi, layanan, dan aktivitas yang dilakukan melalui atau difasilitasi oleh platform IndoStreet, diatur secara eksklusif oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Semua operasi bisnis, transaksi komersial, perjanjian layanan, dan sengketa yang timbul dari atau terkait dengan penggunaan IndoStreet harus tunduk pada hukum perdagangan Indonesia, peraturan komersial, hukum perlindungan konsumen, dan kebijakan bisnis sebagaimana diberlakukan dan ditegakkan oleh Pemerintah Republik Indonesia. Setiap proses hukum, sengketa, atau klaim yang timbul dari Ketentuan ini harus diajukan secara eksklusif di pengadilan Jakarta, Indonesia, dan Anda dengan ini menyetujui yurisdiksi eksklusif dan tempat pengadilan tersebut. Dengan menggunakan platform kami, Anda mengakui dan setuju bahwa hukum Indonesia akan berlaku untuk semua aspek penggunaan layanan kami, terlepas dari lokasi fisik atau tempat tinggal Anda.'
  },
  userRights: {
    title: '4. Manajemen Akun Pengguna dan Hak Akses Platform',
    content: 'IndoStreet berhak mutlak dan tanpa syarat untuk menangguhkan, menghentikan, menonaktifkan, atau secara permanen memblokir akun pengguna mana pun kapan saja, untuk alasan apa pun atau tanpa alasan sama sekali, tanpa pemberitahuan sebelumnya, tanpa penjelasan, dan tanpa kewajiban kepada pengguna atau pihak ketiga mana pun. Hak ini termasuk, namun tidak terbatas pada, situasi di mana kami menduga atau menentukan (atas kebijakan kami sendiri) bahwa pengguna telah melanggar Ketentuan ini, terlibat dalam aktivitas penipuan, menyalahgunakan platform, melecehkan penyedia layanan atau pengguna lain, memberikan informasi palsu, terlibat dalam aktivitas ilegal, atau karena alasan lain yang kami anggap sesuai untuk perlindungan platform kami, kepentingan bisnis kami, pengguna lain, atau penyedia layanan. IndoStreet tidak berkewajiban untuk memberikan alasan penangguhan atau penghentian akun. Pengguna yang akunnya telah dihentikan dilarang membuat akun baru tanpa izin tertulis kami. Kami berhak menolak layanan kepada siapa pun karena alasan apa pun kapan saja. Semua keputusan mengenai status akun bersifat final dan tidak dapat diajukan banding.'
  },
  confidentiality: {
    title: '5. Kerahasiaan dan Privasi Data',
    content: 'Semua informasi, data pribadi, korespondensi, dan materi yang diserahkan oleh pengguna ke IndoStreet, termasuk namun tidak terbatas pada informasi pendaftaran, data profil, komunikasi, informasi pembayaran, data penggunaan, dan informasi lain yang diberikan melalui platform kami, akan diperlakukan sebagai informasi rahasia dan kepemilikan yang dibagikan secara eksklusif antara pengguna dan manajemen IndoStreet. Informasi ini akan dikumpulkan, disimpan, diproses, dan digunakan sesuai dengan Kebijakan Privasi kami dan peraturan perlindungan data Indonesia. IndoStreet menerapkan langkah-langkah keamanan yang wajar untuk melindungi informasi pengguna; namun, tidak ada metode transmisi atau penyimpanan elektronik yang 100% aman. Dengan menggunakan platform kami, Anda mengakui risiko inheren dalam memberikan informasi online. IndoStreet tidak akan menjual, menyewakan, atau membagikan informasi pribadi Anda dengan pihak ketiga kecuali sebagaimana diuraikan dalam Kebijakan Privasi kami atau sebagaimana diwajibkan oleh hukum Indonesia. Kami dapat menggunakan data agregat dan anonim untuk tujuan analitik bisnis dan peningkatan platform. Anda memberikan IndoStreet lisensi abadi, tidak dapat dibatalkan, di seluruh dunia untuk menggunakan umpan balik, saran, atau ide yang Anda berikan mengenai platform kami tanpa kompensasi atau atribusi.'
  },
  therapistRightsTitle: '6. Hak dan Keamanan Penyedia Layanan',
  therapistRightsContent: 'Semua layanan yang difasilitasi melalui IndoStreet adalah ketat untuk terapi pijat profesional dan layanan kesehatan yang sah saja. Penyedia Layanan, sebagai kontraktor independen, mempertahankan hak mutlak untuk menolak layanan, menolak janji temu, atau mengakhiri sesi kapan saja jika mereka merasa tidak nyaman, tidak aman, terancam, atau jika mereka menentukan bahwa klien berada di bawah pengaruh alkohol atau zat yang dikendalikan, jika ada orang yang tidak sah hadir di lokasi layanan, jika klien membuat permintaan yang tidak pantas atau menampilkan perilaku yang tidak pantas, atau untuk alasan lain yang dianggap sesuai oleh Penyedia Layanan. IndoStreet sepenuhnya mendukung Penyedia Layanan dalam menjalankan penilaian profesional dan hak keselamatan pribadi mereka. Pengguna yang menunjukkan perilaku tidak hormat, mengancam, atau tidak pantas terhadap Penyedia Layanan akan memiliki akun mereka segera dihentikan dan dapat dilaporkan kepada otoritas penegak hukum setempat. Keamanan dan integritas profesional Penyedia Layanan adalah prioritas utama.',
  paymentTitle: '7. Ketentuan Pembayaran dan Transaksi Keuangan',
  paymentContent: 'Pembayaran untuk semua paket pijat, layanan, dan biaya keanggotaan harus dilakukan secara penuh, dalam Rupiah Indonesia (IDR), sebelum dimulainya layanan atau aktivasi keanggotaan apa pun. Semua pembayaran diproses melalui saluran pembayaran resmi kami. Pembayaran mengonfirmasi penerimaan Anda terhadap ketentuan layanan dan paket spesifik yang dipilih. Layanan akan diberikan untuk durasi dan spesifikasi paket yang dibayar saja. Semua penjualan bersifat final kecuali ditentukan lain. IndoStreet tidak bertanggung jawab atas sengketa pembayaran antara pengguna dan Penyedia Layanan. Setiap permintaan pengembalian dana harus diajukan secara tertulis dalam waktu 24 jam setelah transaksi dan akan ditinjau berdasarkan kasus per kasus atas kebijakan kami sendiri. Biaya pemrosesan, biaya transaksi, dan biaya administratif tidak dapat dikembalikan dalam keadaan apa pun.',
  clientCommunicationTitle: '8. Komunikasi Pengguna-Penyedia dan Penyampaian Layanan',
  clientCommunicationContent: 'Pengguna didorong dan diharapkan untuk menjaga komunikasi yang jelas dan profesional dengan Penyedia Layanan yang mereka pilih sepanjang proses penyampaian layanan. Anda dapat meminta penyesuaian tekanan pijat (keras, ringan, sedang), area fokus, atau teknik pada titik mana pun selama sesi Anda untuk memastikan kenyamanan dan kepuasan Anda. Jika Anda mengalami ketidaknyamanan, rasa sakit, atau kekhawatiran selama pijat Anda, Anda harus segera mengkomunikasikan ini kepada Penyedia Layanan Anda. Keluhan, sengketa, atau masalah mengenai kualitas layanan, perilaku penyedia, atau penyampaian layanan tidak dapat diterima, diproses, atau ditangani setelah selesainya sesi pijat. Semua kekhawatiran harus diangkat selama periode layanan aktif. IndoStreet mendorong komunikasi real-time antara pengguna dan penyedia untuk memastikan pengalaman layanan yang optimal.',
  clientRightsTitle: '9. Hak Pengguna dan Verifikasi Layanan',
  clientRightsContent: 'Pengguna memiliki hak untuk memverifikasi bahwa Penyedia Layanan yang tiba untuk janji temu mereka sesuai dengan profil, foto, dan informasi yang ditampilkan di platform IndoStreet. Jika Penyedia Layanan yang tiba tidak sesuai dengan profil yang diiklankan atau jika ada perbedaan signifikan dalam identitas, kualifikasi, atau penampilan penyedia, pengguna berhak untuk membatalkan janji temu tanpa kewajiban pembayaran atau penalti pembatalan. Kepercayaan, keamanan, dan kepuasan Anda penting bagi kami. Namun, variasi kecil dalam penampilan karena fotografi, pencahayaan, atau perubahan alami dari waktu ke waktu harus diharapkan dan tidak merupakan alasan pembatalan. Pengguna diharapkan untuk menggunakan penilaian yang wajar saat memverifikasi identitas penyedia.',
  therapistObligationsTitle: '10. Kewajiban dan Standar Penyedia Layanan',
  therapistObligationsContent: 'Penyedia Layanan diminta untuk menyediakan semua bahan, peralatan, dan perlengkapan penting yang diperlukan untuk memberikan layanan pijat profesional, termasuk namun tidak terbatas pada linen bersih, penutup tempat tidur, meja pijat atau peralatan portabel, tisu pembersih tangan, minyak atau lotion pijat bersertifikat, dan bahan lain yang standar untuk praktik terapi pijat profesional. Semua bahan harus memenuhi standar kesehatan dan keselamatan Indonesia. Jika Penyedia Layanan tiba tanpa peralatan atau bahan yang diperlukan untuk melakukan layanan yang diiklankan dengan aman dan profesional, pengguna berhak untuk membatalkan janji temu tanpa pembayaran dan tanpa penalti. Penyedia Layanan diharapkan untuk mempertahankan standar tertinggi profesionalisme, kebersihan, dan kualitas layanan.',
  professionalismTitle: '11. Standar Profesional dan Kode Etik',
  professionalismContent: 'Semua Penyedia Layanan yang terdaftar di IndoStreet diwakili sebagai profesional berlisensi dan terlatih yang harus mempertahankan kepatuhan ketat terhadap standar terapi pijat profesional, perilaku etis, dan peraturan bisnis Indonesia. Jika Penyedia Layanan gagal mempertahankan batasan profesional, terlibat dalam perilaku yang tidak pantas, melanggar etika profesional, atau berperilaku dengan cara apa pun yang tidak konsisten dengan praktik terapi pijat profesional, pengguna sangat didorong dan diwajibkan untuk segera melaporkan perilaku tersebut kepada layanan pelanggan IndoStreet. Kami menangani semua laporan dengan serius dan akan menyelidiki keluhan secara menyeluruh. Penyedia Layanan yang ditemukan telah melanggar standar profesional akan dikenakan penghapusan segera dari platform kami dan dapat dilaporkan kepada otoritas perizinan yang relevan dan penegakan hukum sebagaimana mestinya.',
  userConduct: {
    title: '12. Perilaku Pengguna yang Dilarang',
    content: 'Pengguna platform IndoStreet dilarang keras untuk terlibat dalam aktivitas berikut:',
    prohibitions: [
      'Menggunakan platform untuk tujuan ilegal, melawan hukum, atau tidak sah berdasarkan hukum Indonesia atau hukum internasional',
      'Meminta, mengajak, atau terlibat dalam layanan bersifat seksual, aktivitas ilegal, atau aktivitas yang melanggar etika terapi pijat profesional',
      'Melecehkan, mengancam, mengintimidasi, atau menyalahgunakan Penyedia Layanan, pengguna lain, atau staf IndoStreet',
      'Memberikan informasi palsu, menyesatkan, atau penipuan selama pendaftaran atau pada titik mana pun saat menggunakan platform',
      'Mencoba untuk menghindari, menonaktifkan, atau mengganggu fitur keamanan platform atau mengakses area yang tidak sah',
      'Menggunakan sistem otomatis, bot, scraper, atau teknologi apa pun untuk mengakses atau mengumpulkan data dari platform tanpa otorisasi',
      'Memposting, mengirimkan, atau membagikan konten apa pun yang mencemarkan nama baik, cabul, ofensif, atau melanggar hak kekayaan intelektual',
      'Menyamar sebagai orang atau entitas mana pun, atau secara salah mewakili afiliasi Anda dengan orang atau entitas mana pun',
      'Mengganggu atau mengganggu platform, server, atau jaringan yang terhubung ke platform',
      'Melanggar hukum atau peraturan lokal, negara bagian, nasional, atau internasional yang berlaku',
      'Menggunakan platform untuk mengirimkan kode berbahaya, virus, atau teknologi berbahaya',
      'Mencoba mendapatkan akses tidak sah ke akun pengguna lain atau sistem atau jaringan apa pun yang terhubung ke platform'
    ]
  },
  intellectualProperty: {
    title: '13. Hak Kekayaan Intelektual',
    content: 'Semua konten, fitur, fungsi, desain, logo, merek dagang, merek layanan, grafik, foto, teks, perangkat lunak, dan semua materi lain yang tersedia di platform IndoStreet ("Konten Platform") dimiliki oleh IndoStreet Massage, pemberi lisensi kami, atau penyedia konten lain dan dilindungi oleh hukum kekayaan intelektual Indonesia dan internasional termasuk hak cipta, merek dagang, paten, rahasia dagang, dan lainnya. Nama IndoStreet, logo, dan semua nama, logo, nama produk dan layanan, desain, gambar, dan slogan terkait adalah merek dagang IndoStreet atau afiliasi kami. Anda tidak boleh menggunakan tanda-tanda ini tanpa izin tertulis kami sebelumnya. Semua hak yang tidak secara tegas diberikan kepada Anda dalam Ketentuan ini dicadangkan oleh IndoStreet. Penggunaan Konten Platform yang tidak sah dapat melanggar hukum hak cipta, merek dagang, dan hukum lainnya dan dapat mengenakan Anda pada hukuman perdata dan pidana.'
  },
  disclaimerTitle: '14. Penafian Komprehensif atas Jaminan dan Kewajiban',
  disclaimerContent: 'INDOSTREET MASSAGE ADALAH PLATFORM DIREKTORI DAN KONEKSI SAJA. KAMI TIDAK MEMPEKERJAKAN, MENGAWASI, MENGARAHKAN, MENGONTROL, MEMVERIFIKASI, MEMERIKSA, MEMERIKSA LATAR BELAKANG, MENSERTIFIKASI, ATAU MENJAMIN PENYEDIA LAYANAN APA PUN YANG TERDAFTAR DI PLATFORM KAMI. SEMUA PENYEDIA LAYANAN ADALAH KONTRAKTOR INDEPENDEN YANG MENGOPERASIKAN BISNIS MEREKA SENDIRI. KAMI TIDAK MEMBUAT REPRESENTASI, JAMINAN, ATAU GARANSI MENGENAI KUALIFIKASI, KETERAMPILAN, PERIZINAN, ASURANSI, LATAR BELAKANG, PERILAKU, KEAMANAN, KEANDALAN, KUALITAS, ATAU LEGALITAS PENYEDIA LAYANAN APA PUN. ANDA TERLIBAT DENGAN PENYEDIA LAYANAN SEPENUHNYA ATAS RISIKO DAN KEBIJAKAN ANDA SENDIRI. INDOSTREET TIDAK BERTANGGUNG JAWAB DAN TIDAK AKAN BERTANGGUNG JAWAB ATAS TINDAKAN, PERILAKU, KELALAIAN, LAYANAN, KUALITAS LAYANAN, MASALAH KESELAMATAN, CEDERA, KERUSAKAN, KERUGIAN, SENGKETA, KLAIM, ATAU HAL LAIN APA PUN YANG TIMBUL DARI ATAU TERKAIT DENGAN INTERAKSI ANDA DENGAN, LAYANAN YANG DITERIMA DARI, ATAU PERILAKU PENYEDIA LAYANAN APA PUN. DENGAN MENGGUNAKAN PLATFORM KAMI, ANDA SECARA TEGAS MENGAKUI DAN SETUJU BAHWA INDOSTREET MENYEDIAKAN PLATFORM "SEBAGAIMANA ADANYA" DAN "SEBAGAIMANA TERSEDIA" TANPA JAMINAN APA PUN, BAIK TERSURAT MAUPUN TERSIRAT, TERMASUK NAMUN TIDAK TERBATAS PADA JAMINAN TERSIRAT ATAS KELAYAKAN UNTUK DIPERDAGANGKAN, KESESUAIAN UNTUK TUJUAN TERTENTU, TIDAK ADA PELANGGARAN, ATAU JAMINAN APA PUN YANG TIMBUL DARI KURSUS KESEPAKATAN ATAU PENGGUNAAN PERDAGANGAN.',
  limitationOfLiability: {
    title: '15. Pembatasan Kewajiban dan Kerusakan',
    content: 'SEJAUH MAKSIMUM YANG DIIZINKAN OLEH HUKUM INDONESIA, INDOSTREET, PERUSAHAAN INDUK, ANAK PERUSAHAAN, AFILIASI, PEJABAT, DIREKTUR, KARYAWAN, AGEN, MITRA, PEMBERI LISENSI, DAN PENYEDIA LAYANANNYA TIDAK AKAN BERTANGGUNG JAWAB ATAS KERUSAKAN TIDAK LANGSUNG, INSIDENTAL, KHUSUS, KONSEKUENSIAL, HUKUMAN, ATAU TELADAN APA PUN, TERMASUK NAMUN TIDAK TERBATAS PADA KERUSAKAN UNTUK KEHILANGAN KEUNTUNGAN, GOODWILL, PENGGUNAAN, DATA, ATAU KERUGIAN TAK BERWUJUD LAINNYA, YANG TIMBUL DARI ATAU TERKAIT DENGAN PENGGUNAAN ATAU KETIDAKMAMPUAN ANDA UNTUK MENGGUNAKAN PLATFORM ATAU LAYANAN, AKSES TIDAK SAH KE ATAU PERUBAHAN TRANSMISI ATAU DATA ANDA, PERNYATAAN ATAU PERILAKU PENYEDIA LAYANAN ATAU PIHAK KETIGA PADA PLATFORM, LAYANAN APA PUN YANG DITERIMA MELALUI PLATFORM, ATAU HAL LAIN APA PUN YANG TERKAIT DENGAN PLATFORM ATAU LAYANAN, BAIK BERDASARKAN JAMINAN, KONTRAK, GUGATAN (TERMASUK KELALAIAN), ATAU TEORI HUKUM LAINNYA, BAHKAN JIKA INDOSTREET TELAH DIBERITAHU TENTANG KEMUNGKINAN KERUSAKAN TERSEBUT. DALAM KEADAAN APA PUN TOTAL KEWAJIBAN INDOSTREET KEPADA ANDA UNTUK SEMUA KERUSAKAN, KERUGIAN, DAN PENYEBAB TINDAKAN TIDAK AKAN MELEBIHI JUMLAH YANG DIBAYARKAN OLEH ANDA KEPADA INDOSTREET DALAM ENAM (6) BULAN SEBELUM KLAIM, ATAU IDR 100.000 (SERATUS RIBU RUPIAH INDONESIA), MANA YANG LEBIH KECIL.'
  },
  disputeResolution: {
    title: '16. Penyelesaian Sengketa dan Hubungan Pengguna-Penyedia',
    content: 'Setiap dan semua sengketa, perselisihan, konflik, klaim, atau masalah yang timbul dari layanan yang diberikan, kualitas layanan, perilaku Penyedia Layanan, sengketa pembayaran, pembatalan, konflik penjadwalan, atau hal lain yang terkait dengan penyediaan layanan pijat HARUS diselesaikan secara langsung antara pengguna dan Penyedia Layanan. IndoStreet bukan pihak dalam perjanjian layanan apa pun antara pengguna dan Penyedia Layanan. IndoStreet tidak akan dan tidak akan bertindak sebagai mediator, arbiter, ajudikator, atau penyelesai sengketa dalam konflik apa pun antara pengguna dan Penyedia Layanan. Kami tidak akan campur tangan dalam sengketa, membuat penilaian mengenai kesalahan atau kewajiban, atau menegakkan obat apa pun antara pihak. Semua sengketa terkait layanan berada di luar lingkup tanggung jawab dan kewajiban IndoStreet. Pengguna dan Penyedia Layanan didorong untuk berkomunikasi secara langsung dan profesional untuk menyelesaikan masalah apa pun yang mungkin timbul.'
  },
  indemnification: {
    title: '17. Kewajiban Ganti Rugi Pengguna',
    content: 'Anda setuju untuk membela, mengganti rugi, mengkompensasi, dan menjaga sepenuhnya tidak berbahaya IndoStreet Massage, perusahaan induk, anak perusahaan, afiliasi, mitra, pejabat, direktur, karyawan, agen, kontraktor, pemberi lisensi, penyedia layanan, dan semua perwakilan IndoStreet (secara kolektif, "Pihak IndoStreet") dari dan terhadap setiap dan semua klaim, kerusakan, kewajiban, kerugian, kewajiban, biaya, utang, pengeluaran (termasuk namun tidak terbatas pada biaya pengacara dan biaya hukum), dan tuntutan yang timbul dari atau terkait dengan: (a) penggunaan atau penyalahgunaan Anda terhadap platform dan layanan; (b) pelanggaran Anda terhadap Syarat dan Ketentuan ini; (c) pelanggaran Anda terhadap hak pihak ketiga mana pun, termasuk namun tidak terbatas pada hak kekayaan intelektual, hak privasi, atau hak kepemilikan lainnya; (d) interaksi Anda dengan, layanan yang diterima dari, atau sengketa dengan Penyedia Layanan mana pun; (e) konten apa pun yang Anda kirimkan, posting, atau transmisikan melalui platform; (f) pelanggaran Anda terhadap hukum atau peraturan yang berlaku; (g) klaim apa pun bahwa penggunaan Anda terhadap platform menyebabkan kerusakan kepada pihak ketiga; (h) perilaku lalai atau salah Anda; atau (i) hal lain apa pun yang timbul dari penggunaan atau perilaku Anda di platform. Kewajiban ganti rugi ini akan tetap berlaku setelah penghentian akun Anda dan penggunaan Anda terhadap platform.'
  },
  modifications: {
    title: '18. Modifikasi terhadap Ketentuan dan Layanan',
    content: 'IndoStreet berhak, atas kebijakan kami sendiri dan mutlak, untuk memodifikasi, mengubah, memperbarui, mengubah, menambahkan, atau menghapus bagian dari Syarat dan Ketentuan ini kapan saja tanpa pemberitahuan sebelumnya kepada pengguna. Kami juga dapat memodifikasi, menangguhkan, atau menghentikan aspek apa pun dari platform atau layanan, termasuk fitur, fungsi, basis data, konten, atau jam ketersediaan, sementara atau permanen, tanpa pemberitahuan dan tanpa kewajiban. Penggunaan platform Anda yang berkelanjutan setelah perubahan apa pun terhadap Ketentuan ini merupakan penerimaan Anda terhadap perubahan tersebut. Adalah tanggung jawab Anda untuk meninjau Ketentuan ini secara berkala. Jika Anda tidak setuju dengan modifikasi apa pun, satu-satunya obat Anda adalah untuk menghentikan penggunaan platform dan menutup akun Anda. Kami juga dapat memberlakukan batasan pada fitur tertentu atau membatasi akses Anda ke bagian atau semua platform tanpa pemberitahuan atau kewajiban.'
  },
  severability: {
    title: '19. Keterpisahan dan Keberlakuan',
    content: 'Jika ketentuan apa pun dari Syarat dan Ketentuan ini ditemukan oleh pengadilan yang berwenang atau arbiter sebagai tidak valid, ilegal, atau tidak dapat ditegakkan berdasarkan hukum Indonesia atau hukum yang berlaku, ketentuan tersebut akan dianggap dimodifikasi seminimal mungkin untuk membuatnya valid, legal, dan dapat ditegakkan sambil mempertahankan niatnya, atau jika modifikasi tersebut tidak mungkin, ketentuan tersebut akan dipisahkan dari Ketentuan ini. Ketidakvalidan, ilegalitas, atau ketidakmampuan untuk ditegakkan dari ketentuan apa pun tidak akan memengaruhi keabsahan, legalitas, atau keberlakuan dari ketentuan lain dari Ketentuan ini, yang akan tetap berlaku penuh. Ketentuan yang tersisa akan ditafsirkan untuk memberikan efek pada niat para pihak sebagaimana tercermin dalam ketentuan asli sejauh diizinkan oleh hukum.'
  },
  entireAgreement: {
    title: '20. Keseluruhan Perjanjian dan Pengabaian',
    content: 'Syarat dan Ketentuan ini, bersama dengan Kebijakan Privasi kami dan ketentuan, kebijakan, atau pedoman tambahan yang diposting di platform, merupakan keseluruhan perjanjian antara Anda dan IndoStreet mengenai penggunaan Anda terhadap platform dan layanan, dan menggantikan semua pemahaman, perjanjian, representasi, dan jaminan sebelumnya atau kontemporer, baik tertulis maupun lisan, mengenai materi pelajaran. Tidak ada pengabaian dari syarat atau ketentuan apa pun dari Ketentuan ini yang akan dianggap sebagai pengabaian lebih lanjut atau berkelanjutan dari syarat atau ketentuan tersebut atau syarat atau ketentuan lain apa pun. Setiap kegagalan oleh IndoStreet untuk menegakkan hak atau ketentuan apa pun dari Ketentuan ini tidak akan merupakan pengabaian dari hak atau ketentuan tersebut kecuali diakui dan disetujui oleh IndoStreet secara tertulis.'
  },
  contactInformation: {
    title: '21. Informasi Kontak dan Dukungan Pelanggan',
    content: 'Jika Anda memiliki pertanyaan, kekhawatiran, keluhan, atau pertanyaan mengenai Syarat dan Ketentuan ini, layanan kami, akun Anda, masalah penagihan, dukungan teknis, atau masalah lain yang terkait dengan platform IndoStreet, silakan hubungi tim layanan pelanggan kami melalui saluran layanan pelanggan resmi yang disediakan dalam aplikasi. Kami berusaha untuk menanggapi semua pertanyaan yang sah dalam waktu 48-72 jam kerja. Untuk masalah keselamatan mendesak atau untuk melaporkan pelanggaran Ketentuan ini, silakan gunakan sistem pelaporan prioritas kami yang tersedia melalui aplikasi.'
  },
  customerServiceButton: 'Hubungi Layanan Pelanggan',
};
translations.id.privacyPolicy = {
  title: 'Kebijakan Privasi',
  lastUpdated: 'Terakhir Diperbarui: 1 Januari 2025',
  introduction: {
    title: '1. Pendahuluan',
    content: 'IndoStreet ("kami", "milik kami", atau "kita") menghormati privasi Anda dan berkomitmen untuk melindungi data pribadi Anda. Kebijakan Privasi ini menjelaskan bagaimana kami mengumpulkan, menggunakan, menyimpan, dan membagikan informasi Anda saat menggunakan platform kami. Dengan menggunakan IndoStreet, Anda menyetujui pengumpulan dan penggunaan informasi sesuai dengan kebijakan ini. Kebijakan ini diatur oleh Hukum Indonesia termasuk namun tidak terbatas pada UU No. 27 Tahun 2022 tentang Perlindungan Data Pribadi (UU PDP).',
  },
  dataCollection: {
    title: '2. Informasi yang Kami Kumpulkan',
    personal: 'Informasi Pribadi: Nama, alamat email, nomor telepon, nomor WhatsApp, dan informasi pembayaran yang Anda berikan saat registrasi atau booking',
    usage: 'Data Penggunaan: Alamat IP, jenis browser, informasi perangkat, halaman yang dikunjungi, waktu yang dihabiskan di halaman, dan data diagnostik lainnya',
    location: 'Data Lokasi: Koordinat GPS dan informasi alamat saat Anda menggunakan fitur berbasis lokasi untuk menemukan terapis dan tempat pijat terdekat',
    photos: 'Foto dan Media: Foto profil, foto bisnis, dan gambar lain yang Anda unggah ke platform',
    communications: 'Komunikasi: Pesan, ulasan, rating, dan feedback yang Anda berikan melalui platform kami',
  },
  dataUsage: {
    title: '3. Bagaimana Kami Menggunakan Informasi Anda',
    content: 'Kami menggunakan informasi yang dikumpulkan untuk tujuan berikut:',
    points: [
      'Untuk menyediakan dan memelihara layanan direktori dan pemesanan kami',
      'Untuk memproses booking Anda dan memfasilitasi koneksi antara pengguna dan penyedia layanan',
      'Untuk menghitung jarak antara lokasi Anda dengan terapis/tempat pijat',
      'Untuk mengirim konfirmasi booking, notifikasi, dan pembaruan penting',
      'Untuk meningkatkan platform kami dan mengembangkan fitur baru',
      'Untuk mendeteksi, mencegah, dan menangani masalah teknis dan aktivitas penipuan',
      'Untuk mematuhi kewajiban hukum berdasarkan hukum Indonesia',
      'Untuk menegakkan Syarat dan Ketentuan kami',
    ],
  },
  dataSharing: {
    title: '4. Berbagi dan Pengungkapan Informasi',
    content: 'Kami dapat membagikan informasi Anda dengan:',
    points: [
      'Penyedia Layanan: Terapis dan tempat pijat yang Anda booking akan menerima nama, informasi kontak, dan detail booking Anda',
      'Agen: Agen resmi kami dapat mengakses data pengguna untuk memfasilitasi koneksi dan mengelola platform',
      'Pemroses Pembayaran: Layanan pembayaran pihak ketiga untuk memproses transaksi Anda',
      'Otoritas Pemerintah: Saat diwajibkan oleh hukum Indonesia atau proses hukum',
      'Transfer Bisnis: Dalam hal merger, akuisisi, atau penjualan aset',
    ],
    note: 'Kami tidak menjual data pribadi Anda kepada pihak ketiga untuk tujuan pemasaran.',
  },
  legalBasis: {
    title: '5. Dasar Hukum Pemrosesan (Hukum Indonesia)',
    content: 'Berdasarkan UU Perlindungan Data Pribadi Indonesia (UU PDP), kami memproses data Anda berdasarkan:',
    points: [
      'Persetujuan: Anda telah memberikan persetujuan yang jelas untuk kami memproses data pribadi Anda',
      'Kontrak: Pemrosesan diperlukan untuk memenuhi perjanjian layanan kami dengan Anda',
      'Kewajiban Hukum: Untuk mematuhi hukum dan peraturan Indonesia',
      'Kepentingan Sah: Untuk mengoperasikan dan meningkatkan layanan platform kami',
    ],
  },
  dataRetention: {
    title: '6. Penyimpanan Data',
    content: 'Kami menyimpan data pribadi Anda selama diperlukan untuk menyediakan layanan kami dan mematuhi kewajiban hukum. Secara khusus: Akun aktif disimpan tanpa batas waktu; Akun tidak aktif dapat dihapus setelah 2 tahun tidak aktif; Catatan booking disimpan selama 5 tahun untuk tujuan hukum dan pajak; Komunikasi dan ulasan disimpan untuk integritas platform.',
  },
  security: {
    title: '7. Keamanan Data',
    content: 'Kami menerapkan langkah-langkah keamanan teknis dan organisasi yang sesuai untuk melindungi data pribadi Anda dari akses, perubahan, pengungkapan, atau penghancuran yang tidak sah. Namun, tidak ada metode transmisi melalui internet yang 100% aman. Meskipun kami berusaha melindungi informasi Anda, kami tidak dapat menjamin keamanan absolut. Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda.',
  },
  yourRights: {
    title: '8. Hak Anda Berdasarkan Hukum Indonesia',
    content: 'Berdasarkan UU PDP dan peraturan Indonesia yang berlaku, Anda memiliki hak untuk: Mengakses data pribadi Anda; Memperbaiki data yang tidak akurat atau tidak lengkap; Meminta penghapusan data Anda (tunduk pada persyaratan retensi hukum); Menolak pemrosesan data Anda; Menarik persetujuan kapan saja; Meminta portabilitas data; Mengajukan keluhan kepada otoritas Indonesia (Kementerian Komunikasi dan Informatika). Untuk menggunakan hak-hak ini, hubungi kami di detail yang diberikan di bawah. Catatan: IndoStreet berhak untuk menangguhkan atau memblokir akun pengguna mana pun atas kebijakan kami sendiri, dengan atau tanpa alasan, sebagaimana dinyatakan dalam Syarat dan Ketentuan kami.',
  },
  cookies: {
    title: '9. Cookie dan Teknologi Pelacakan',
    content: 'Kami menggunakan cookie dan teknologi pelacakan serupa untuk meningkatkan pengalaman Anda, menganalisis pola penggunaan, dan meningkatkan layanan kami. Anda dapat mengontrol cookie melalui pengaturan browser Anda, tetapi menonaktifkan cookie dapat memengaruhi fungsi platform.',
  },
  thirdPartyServices: {
    title: '10. Layanan Pihak Ketiga',
    content: 'Platform kami dapat berisi tautan ke situs web atau layanan pihak ketiga (termasuk Google Maps, gateway pembayaran, dan WhatsApp). Kami tidak bertanggung jawab atas praktik privasi pihak ketiga ini. Kami mendorong Anda untuk meninjau kebijakan privasi mereka.',
  },
  childrenPrivacy: {
    title: '11. Privasi Anak',
    content: 'IndoStreet tidak ditujukan untuk pengguna di bawah usia 18 tahun. Kami tidak secara sengaja mengumpulkan data pribadi dari anak-anak. Jika Anda yakin seorang anak telah memberikan informasi pribadi kepada kami, segera hubungi kami.',
  },
  dataTransfer: {
    title: '12. Transfer Data Internasional',
    content: 'Data Anda terutama disimpan dan diproses di Indonesia. Jika kami mentransfer data di luar Indonesia, kami akan memastikan perlindungan yang sesuai sesuai dengan hukum Indonesia.',
  },
  policyChanges: {
    title: '13. Perubahan Kebijakan Privasi Ini',
    content: 'Kami dapat memperbarui Kebijakan Privasi ini dari waktu ke waktu. Perubahan akan diposting di halaman ini dengan tanggal "Terakhir Diperbarui" yang diperbarui. Penggunaan IndoStreet yang berkelanjutan setelah perubahan merupakan penerimaan kebijakan yang diperbarui. Untuk perubahan material, kami akan memberikan pemberitahuan yang jelas.',
  },
  governing: {
    title: '14. Hukum yang Mengatur dan Yurisdiksi',
    content: 'Kebijakan Privasi ini diatur oleh dan ditafsirkan sesuai dengan hukum Republik Indonesia. Setiap sengketa yang timbul dari kebijakan ini akan tunduk pada yurisdiksi eksklusif pengadilan di Jakarta, Indonesia.',
  },
  disclaimer: {
    title: '15. Penafian',
    content: 'IndoStreet adalah platform direktori dan koneksi saja. Kami tidak bertanggung jawab atas tindakan, layanan, atau praktik privasi terapis, tempat pijat, atau pengguna lain. Semua interaksi antara pengguna dan penyedia layanan adalah risiko Anda sendiri.',
  },
  contact: {
    title: '16. Hubungi Kami',
    content: 'Jika Anda memiliki pertanyaan tentang Kebijakan Privasi ini, ingin menggunakan hak Anda, atau memiliki masalah privasi, silakan hubungi kami di: Email: privacy@indostreet.com | WhatsApp: +62 XXX-XXXX-XXXX | Alamat: Jakarta, Indonesia',
  },
};

// Hotel/Villa Menu translations
translations.en.hotelVillaMenu = {
  loadingMenu: 'Loading menu...',
  venueNotFound: 'Venue Not Found',
  menuNotAvailable: 'This menu is not available.',
  welcomeTitle: 'Welcome to Our Wellness Menu',
  welcomeDescription: 'Browse our exclusive selection of professional therapists and wellness centers.',
  bookingNote: 'Note the ID number and contact our front desk to book your perfect relaxation experience.',
  therapistsTab: 'Therapists',
  wellnessCentersTab: 'Wellness Centers',
  noTherapistsAvailable: 'No therapists available at the moment',
  noWellnessCentersAvailable: 'No wellness centers available at the moment',
  bookingId: 'BOOKING ID',
  showToFrontDesk: 'Show this number to our front desk',
  allRightsReserved: 'All Rights Reserved',
};

translations.id.hotelVillaMenu = {
  loadingMenu: 'Memuat menu...',
  venueNotFound: 'Venue Tidak Ditemukan',
  menuNotAvailable: 'Menu ini tidak tersedia.',
  welcomeTitle: 'Selamat Datang di Menu Wellness Kami',
  welcomeDescription: 'Jelajahi pilihan eksklusif terapis profesional dan pusat kesehatan kami.',
  bookingNote: 'Catat nomor ID dan hubungi front desk kami untuk memesan pengalaman relaksasi yang sempurna.',
  therapistsTab: 'Terapis',
  wellnessCentersTab: 'Pusat Wellness',
  noTherapistsAvailable: 'Tidak ada terapis yang tersedia saat ini',
  noWellnessCentersAvailable: 'Tidak ada pusat wellness yang tersedia saat ini',
  bookingId: 'ID BOOKING',
  showToFrontDesk: 'Tunjukkan nomor ini ke front desk kami',
  allRightsReserved: 'Hak Cipta Dilindungi',
};

export default translations;
export { translations };
