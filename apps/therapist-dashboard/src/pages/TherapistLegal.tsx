/**
 * TherapistLegal - Terms of Service and Privacy Policy
 * 
 * @ts-expect-error - lucide-react ForwardRefExoticComponent incompatible with React 19 types
 * Component functions correctly at runtime. Type fix pending lucide-react or @types/react update.
 */
import React, { useState } from 'react';
import { FileText, Shield, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface TherapistLegalProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const TherapistLegal: React.FC<TherapistLegalProps> = ({ onBack, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy'>('terms');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['intro']));

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const termsContent = [
    {
      id: 'intro',
      title: '1. Platform Definition & Independent Operation',
      content: `WARNING: CRITICAL UNDERSTANDING: INDASTREET IS A TRAFFIC PLATFORM ONLY

1.1 Platform Purpose
INDASTREET operates EXCLUSIVELY as a digital marketplace platform that connects massage therapy providers with potential customers. We are NOT:
- An employment agency
- A massage therapy service provider
- A direct employer of therapists
- Responsible for the actual delivery of massage services

1.2 Independent Decision Making
ALL therapists and massage establishments operate under their OWN independent decision-making authority. You maintain COMPLETE autonomy over:
- Which bookings to accept or decline
- Your service standards and methods
- Your business operations and practices
- Your professional conduct and protocols

1.3 No Obligation to Accept Bookings
⭐ FUNDAMENTAL RIGHT: You are NEVER obligated to accept any booking if:
- You feel uneasy or uncomfortable with the client or location
- You perceive any danger, risk, or safety concerns
- The booking details seem suspicious or inappropriate
- You are not available or prefer not to work at the requested time
- The location seems unsafe or you have concerns about accessibility
- Any other reason that makes you feel the booking is not suitable

1.4 Safety First Policy
Your personal safety and comfort is PARAMOUNT. ALWAYS trust your instincts and decline any booking that makes you feel unsafe or uncomfortable. No explanation or justification is required to decline bookings.

By creating an account, you acknowledge and accept these terms governing your use of our traffic facilitation platform.`
    },
    {
      id: 'employment',
      title: '2. Self-Employment Status & Tax Obligations',
      content: `WARNING: CRITICAL: INDEPENDENT CONTRACTOR STATUS

2.1 Self-Employment Classification
ALL therapists using the Indastreet platform are classified as SELF-EMPLOYED INDEPENDENT CONTRACTORS, NOT employees of Indastreet. This means:
- You are your own business entity
- You control your own work schedule and methods
- You are responsible for your own business expenses
- You maintain complete professional independence
- Indastreet has NO employer-employee relationship with you

2.2 Tax Responsibilities - YOUR OBLIGATION
🏛️ MANDATORY TAX COMPLIANCE: You are SOLELY responsible for:
- ALL income taxes on earnings from the platform
- Business registration with local authorities (if required)
- VAT/GST obligations (if applicable in your jurisdiction)
- Social security contributions (as per local laws)
- Professional license fees and renewal costs
- ANY other government fees, taxes, or dues as required by your country/region

2.3 Tax Declaration & Payment
- You MUST declare ALL platform earnings to your local tax authority
- Payment of taxes is YOUR responsibility - Indastreet does NOT withhold taxes
- You should consult with local tax professionals for proper compliance
- Keep detailed records of all earnings and business expenses
- Indastreet may provide earning summaries but you are responsible for tax calculations

2.4 Government Compliance
- You must comply with ALL local business and healthcare regulations
- Obtain required professional licenses and certifications
- Follow local health and safety standards
- Comply with consumer protection laws in your jurisdiction

2.5 No Employment Benefits
As an independent contractor, you are NOT entitled to:
- Employee benefits, insurance, or pension contributions
- Vacation pay, sick leave, or employment protections
- Minimum wage guarantees or overtime compensation
- Any employment-related benefits typically provided to employees`
    },
    {
      id: 'account',
      title: '3. Account Requirements & Platform Usage',
      content: `3.1 Eligibility Requirements
- You must be at least 18 years old
- You must have valid professional credentials/certification
- You must provide accurate and complete information
- You are responsible for maintaining the security of your account
- You must have legal right to work as a massage therapist in your jurisdiction

3.2 Profile Information Standards
- All profile information must be truthful and accurate
- Profile photos must comply with our image requirements (professional, clear face)
- You must keep your contact information (WhatsApp, location) up to date
- False or misleading information may result in account suspension
- You are responsible for updating your availability status

3.3 One Account Policy
- Each therapist may only maintain ONE active account
- Creating multiple accounts to circumvent restrictions is prohibited
- Duplicate accounts will be merged or permanently suspended
- Account sharing is strictly forbidden

3.4 Platform Usage Guidelines
- Use the platform solely for legitimate massage therapy bookings
- Maintain professional standards in all communications
- Respect customer privacy and platform policies
- Do not use the platform for any illegal activities`
    },
    {
      id: 'services',
      title: '4. Service Provision & Booking Management',
      content: `4.1 Booking Acceptance Rights
ABSOLUTE DISCRETION: You have COMPLETE authority to:
- Accept or decline ANY booking for ANY reason
- Decline bookings without providing explanation
- Refuse service if you feel unsafe, uncomfortable, or at risk
- Cancel accepted bookings if circumstances change (safety concerns, emergency, etc.)
- Set your own availability and working hours

4.2 Safety-First Booking Policy
YOUR SAFETY IS PARAMOUNT. You may decline bookings if:
- The location seems unsafe or high-risk
- The customer communication seems inappropriate or concerning
- You have any intuitive concerns about the booking
- The timing or circumstances don't feel right
- You detect any red flags in customer behavior or requests
- The booking conflicts with your personal safety standards

4.3 Professional Service Standards (When You Choose to Accept)
When you voluntarily accept a booking:
- Provide services professionally and safely
- Bring necessary equipment and supplies
- Respect customer privacy and boundaries
- Follow industry best practices and local regulations
- Honor the agreed service duration and scope

4.4 Response Time Guidelines
- Aim to respond to bookings within 24 hours when possible
- Extended non-response may affect your search ranking
- No penalties for declining bookings for safety reasons
- Quality is prioritized over quantity of accepted bookings

4.5 Pricing Independence
- You set your own pricing for all service durations
- Prices should be competitive and reasonable for your market
- You may not charge customers additional fees beyond the agreed booking price
- All pricing changes are at your discretion`
    },
    {
      id: 'payments',
      title: '5. Commission Structure & Payment Terms',
      content: `WARNING: MANDATORY PLATFORM COMMISSION - 30%

5.1 Commission Structure - NON-NEGOTIABLE
STANDARD COMMISSION RATE: 30% per completed booking
- Standard Plan: 30% commission to Indastreet, 70% to therapist
- Premium Plan (Rp 250,000/month): 0% commission - keep 100%
- The 30% commission is MANDATORY and DUE for every completed booking
- Commission rate applies to the full booking amount (including tips if processed through platform)

5.2 Payment Processing & Timing
- Commission is automatically calculated and due upon booking completion
- Therapist payments are processed weekly on Mondays
- Payment method: Bank transfer to your registered account
- You must provide valid banking information for payment processing
- Payments are made ONLY for completed bookings
- Cancelled or no-show bookings do not generate commission obligations

5.3 Commission Payment Enforcement
CRITICAL PAYMENT OBLIGATIONS:
- Commission payments are legally binding obligations
- Payment overdue after 7 days results in immediate account suspension
- Additional penalty fees of 5% per week charged on overdue amounts
- Account reactivation requires FULL payment of commission + penalties
- Repeated non-payment may result in permanent account termination
- Legal action may be taken for debt collection of unpaid commissions

5.4 Premium Membership Benefits
- Premium Tier: Rp 200,000/month or Rp 2,000,000/year (save 16%)
- 0% commission rate - keep 100% of all booking earnings
- Priority search placement and verified badge
- Advanced analytics and 24/7 support access
- Auto-renewal unless cancelled 48 hours before renewal

5.5 Payment Disputes & Resolution
- Commission disputes must be raised within 14 days of the booking
- Indastreet reserves the right to investigate and make final payment decisions
- Payments may be withheld pending dispute resolution
- Fraudulent dispute claims may result in account termination
- All commission calculations are final unless proven erroneous`
    },
    {
      id: 'membership',
      title: '7. Premium Membership Terms',
      content: `5.1 Membership Tiers
- Free Tier: Basic profile listing and booking management
- Premium Tier: Rp 200,000/month or Rp 2,000,000/year (save 16%)

5.2 Premium Benefits
- 0% commission - keep 100% of all booking earnings
- Verified badge displayed on profile (top-left of main image)
- Best times analytics (peak hours, busy days)
- 24/7 customer support chat with 2-hour response time
- Discount badges (5%, 10%, 15%, 20%)
- Priority search placement
- Advanced analytics dashboard
- Profile optimization support
- Visual booking calendar with 3-hour advance reminders

5.3 Membership Terms
- Premium memberships auto-renew unless cancelled
- Cancellation must be done 48 hours before renewal date
- No refunds for partial months
- Downgrade to Free tier if payment fails after 7 days
- Verified badge removed upon membership cancellation`
    },
    {
      id: 'conduct',
      title: '8. Code of Conduct & Platform Usage',
      content: `6.1 Prohibited Activities
- Harassment, discrimination, or inappropriate behavior
- Soliciting customers outside the platform to avoid commission
- Requesting additional payments not disclosed on platform
- Sharing customer contact information without consent
- Using customer information for marketing purposes
- Providing services while impaired or unsafe

6.2 Customer Interactions
- Maintain professional communication at all times
- Respond to messages within 24 hours
- Use WhatsApp integration for booking coordination only
- Do not request personal favors from customers
- Report any inappropriate customer behavior to support

6.3 Platform Rules
- Do not manipulate ratings or reviews
- Do not create fake customer accounts for self-reviews
- Do not spam customers with unsolicited messages
- Do not advertise competing services on your profile`
    },
    {
      id: 'liability',
      title: '6. Liability Limitation & Platform Protection',
      content: `WARNING: CRITICAL LEGAL PROTECTIONS FOR INDASTREET PLATFORM

6.1 Platform Role Definition
INDASTREET OPERATES EXCLUSIVELY AS:
- A digital marketplace connecting therapists with potential customers
- A traffic facilitation platform providing booking management tools
- A payment processing intermediary (commission collection only)
- An advertising and marketing platform for massage therapy services

INDASTREET IS NOT:
- An employer of massage therapists
- A provider of massage therapy services
- Responsible for the quality, safety, or outcomes of massage services
- Liable for any disputes, injuries, or damages arising from massage sessions

6.2 Complete Liability Disclaimer
COMPREHENSIVE LIABILITY EXEMPTION:
Indastreet, its owners, employees, and affiliated entities are NOT liable for:
- Any injury, damage, or harm occurring during massage sessions
- Quality or standard of massage services provided by therapists
- Disputes between therapists and customers
- Theft, loss, or damage of personal property during bookings
- Medical complications or adverse reactions during massage
- Professional misconduct or inappropriate behavior by therapists
- Accidents, injuries, or safety incidents at booking locations
- Financial losses or business disputes related to massage services

6.3 Therapist Full Responsibility
As an independent service provider, YOU are completely responsible for:
- Your own professional liability insurance coverage
- All risks associated with providing massage therapy services
- Ensuring your professional competence and appropriate training
- Maintaining safe working practices and procedures
- Resolving any customer complaints or service issues
- Your personal safety and security during bookings
- Compliance with all professional and legal standards

6.4 Customer-Therapist Relationship
- The service relationship exists ONLY between therapist and customer
- Indastreet is NOT a party to the service agreement
- All service-related issues must be resolved directly between therapist and customer
- Indastreet may facilitate communication but bears no responsibility for outcomes

6.5 Indemnification Requirement
By using this platform, you agree to indemnify and hold harmless Indastreet from:
- Any claims arising from your massage therapy services
- Legal action taken against Indastreet related to your services
- Damages or losses resulting from your professional activities
- Any breach of these terms or applicable laws by you`
    },
    {
      id: 'termination',
      title: '9. Account Suspension & Termination',
      content: `8.1 Suspension Reasons
- Multiple customer complaints about service quality
- Repeated no-shows or cancellations
- Violation of code of conduct
- Fraudulent activity or payment disputes
- Providing false information
- Creating multiple accounts

8.2 Suspension Process
- Warning for first minor violation
- Temporary suspension (7-30 days) for repeated violations
- Permanent ban for serious violations

8.3 Your Right to Terminate
- You may delete your account at any time
- Outstanding payments will be processed before account closure
- Deleted accounts cannot be restored
- You must cancel premium membership separately`
    },
    {
      id: 'changes',
      title: '10. Changes to Terms',
      content: `We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the new terms.

We will notify you of significant changes via email or in-app notification.`
    },
    {
      id: 'contact',
      title: '11. Contact & Support',
      content: `For questions about these Terms of Service, please contact us:

Email: indastreet.id@gmail.com
Support Chat: Available in app (Premium members get 24/7 support)
Response Time: Within 48 hours for free users, 2 hours for premium users

IMPORTANT LEGAL DISCLAIMERS:
⚖️ These Terms of Service constitute a legally binding agreement
🏛️ Local laws and regulations take precedence over platform policies
🔐 By using this platform, you acknowledge understanding and acceptance of all terms
📋 Regular review of these terms is recommended as they may be updated

Last Updated: January 28, 2026`
    }
  ];

  const privacyContent = [
    {
      id: 'intro',
      title: '1. Introduction',
      content: `This Privacy Policy explains how Indastreet collects, uses, and protects your personal information as a therapist on our platform.

We are committed to protecting your privacy and ensuring transparency about data collection and usage.`
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      content: `2.1 Account Information
- Name, email address, phone number
- Profile photo and additional images
- WhatsApp number for customer contact
- Bank account information for payments
- Location and service area

2.2 Professional Information
- Years of experience
- Massage types and specializations
- Languages spoken
- Pricing information
- Professional certifications (optional)

2.3 Usage Data
- Login activity and timestamps
- Booking history and status
- Customer interactions and messages
- Payment transactions
- Analytics data (views, clicks, conversion rates)

2.4 Device & Technical Data
- IP address, browser type, device information
- Location data (with your permission)
- Cookies and similar tracking technologies`
    },
    {
      id: 'usage',
      title: '3. How We Use Your Information',
      content: `3.1 Platform Operations
- Create and maintain your therapist profile
- Process bookings and facilitate customer connections
- Handle payments and commission calculations
- Provide customer support
- Verify identity and prevent fraud

3.2 Analytics & Improvement
- Analyze platform usage to improve user experience
- Generate insights about booking patterns (Premium feature)
- Optimize search rankings and visibility
- Personalize your dashboard experience

3.3 Communications
- Send booking notifications and reminders
- Provide customer support responses
- Send payment confirmations
- Notify about platform updates and new features
- Marketing communications (you can opt-out)

3.4 Legal Compliance
- Comply with applicable laws and regulations
- Respond to legal requests and prevent fraud
- Enforce our Terms of Service
- Protect rights and safety of users`
    },
    {
      id: 'sharing',
      title: '4. Information Sharing',
      content: `4.1 With Customers
- Your public profile information (name, photo, services, location, pricing)
- Availability status and booking calendar
- Reviews and ratings from previous customers
- WhatsApp number (only after booking confirmation)

4.2 With Third Parties
- Payment processors (for handling transactions)
- Cloud storage providers (Appwrite for database)
- Analytics services (for platform improvement)
- Email service providers (for notifications)
- WhatsApp Business API (for messaging)

4.3 We DO NOT Sell Your Data
- We never sell your personal information to third parties
- We do not share your data with advertisers
- Customer contact information is never shared without consent

4.4 Legal Requirements
- We may disclose information if required by law
- To protect our rights or comply with legal proceedings
- To prevent fraud or investigate security issues`
    },
    {
      id: 'security',
      title: '5. Data Security',
      content: `5.1 Security Measures
- Industry-standard encryption for data transmission (SSL/TLS)
- Secure database hosting with Appwrite
- Regular security audits and updates
- Access controls and authentication
- Password hashing and secure storage

5.2 Payment Security
- Bank account information encrypted at rest
- PCI-DSS compliant payment processing
- Secure payment gateway integration
- Regular transaction monitoring

5.3 Your Responsibility
- Keep your account credentials secure
- Use a strong, unique password
- Log out from shared devices
- Report suspicious activity immediately
- Enable two-factor authentication (when available)`
    },
    {
      id: 'rights',
      title: '6. Your Privacy Rights',
      content: `6.1 Access & Portability
- View your personal information in your profile
- Request a copy of your data (via support email)
- Export your booking history and analytics

6.2 Correction & Updates
- Update your profile information at any time
- Correct inaccurate data through account settings
- Request manual updates via customer support

6.3 Deletion & Erasure
- Delete your account at any time
- Request permanent data deletion (subject to legal retention)
- Note: Some data may be retained for legal/financial records

6.4 Marketing Opt-Out
- Unsubscribe from promotional emails
- Disable push notifications in app settings
- Opt-out of SMS marketing (if applicable)

6.5 Data Retention
- Active accounts: Data retained indefinitely
- Deleted accounts: Data removed within 90 days
- Financial records: Retained for 7 years (legal requirement)
- Backup copies: Removed within 180 days`
    },
    {
      id: 'cookies',
      title: '7. Cookies & Tracking',
      content: `7.1 Types of Cookies
- Essential cookies: Required for platform functionality
- Analytics cookies: Track usage patterns and performance
- Preference cookies: Remember your settings and choices
- Authentication cookies: Keep you logged in

7.2 Third-Party Cookies
- Google Maps API (for location services)
- Analytics providers (anonymized data)
- Payment processors (secure transaction handling)

7.3 Managing Cookies
- You can disable cookies in your browser settings
- Note: Some features may not work without cookies
- We respect "Do Not Track" browser signals`
    },
    {
      id: 'international',
      title: '8. International Data Transfers',
      content: `Our servers are located in Indonesia and the United States. By using our platform, you consent to the transfer of your information to these locations.

We ensure appropriate safeguards are in place for international data transfers in compliance with applicable data protection laws.`
    },
    {
      id: 'children',
      title: '9. Children\'s Privacy',
      content: `Our platform is not intended for users under 18 years of age. We do not knowingly collect personal information from minors.

If you believe a minor has provided us with personal information, please contact us immediately for removal.`
    },
    {
      id: 'changes',
      title: '10. Policy Updates',
      content: `We may update this Privacy Policy from time to time. Changes will be posted on this page with a new "Last Updated" date.

Significant changes will be communicated via email or in-app notification.`
    },
    {
      id: 'contact',
      title: '11. Contact Us',
      content: `For privacy-related questions or requests, contact us:

Email: indastreet.id@gmail.com
Subject: Privacy Request - Therapist Platform
Response Time: Within 48 hours

For data access, correction, or deletion requests, please include:
- Your full name and account email
- Specific request details
- Proof of identity (for security purposes)

Last Updated: December 11, 2024`
    }
  ];

  const content = activeTab === 'terms' ? termsContent : privacyContent;

  const dict = {
    therapistDashboard: {
      thisMonth: 'this month'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-sm mx-auto">
        {/* Minimalist Orange Header */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 px-4 pt-6 pb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Legal</h1>
              <p className="text-orange-100 text-sm mt-1">Terms & Privacy</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-lg">
              <Clock className="w-4 h-4 text-white" />
              <span className="text-sm font-bold text-white">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}j</span>
            </div>
          </div>

          {/* Minimalist Status Pills */}
          <div className="flex gap-2">
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              therapist?.status === 'available' && therapist?.availability === 'online'
                ? 'bg-green-500 text-white'
                : 'bg-white/20 text-white/60'
            }`}>
              Tersedia
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              therapist?.status === 'busy'
                ? 'bg-amber-500 text-white'
                : 'bg-white/20 text-white/60'
            }`}>
              Sibuk
            </div>
            <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
              therapist?.availability === 'offline'
                ? 'bg-red-500 text-white'
                : 'bg-white/20 text-white/60'
            }`}>
              Offline
            </div>
          </div>
        </div>

        {/* Floating Tab Switcher */}
        <div className="px-4 -mt-6 mb-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'terms'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 mx-auto mb-1" />
              Terms
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'privacy'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Shield className="w-4 h-4 mx-auto mb-1" />
              Privacy
            </button>
          </div>
        </div>

        {/* Clean Content Sections */}
        <div className="px-4 space-y-3">
          {content.map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-4 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-sm font-bold text-gray-900 text-left">{section.title}</h2>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-orange-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {expandedSections.has(section.id) && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="pt-3 space-y-2">
                    {section.content.split('\n').map((paragraph, i) => (
                      paragraph.trim() && (
                        <p key={i} className="text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                          {paragraph}
                        </p>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Minimalist Agreement Badge */}
        <div className="px-4 mt-4">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-orange-900 text-sm mb-1">Persetujuan Anda</h3>
                <p className="text-xs text-orange-800 leading-relaxed">
                  Dengan menggunakan platform, Anda menyetujui Terms & Privacy ini.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <div className="px-4 mt-4 mb-4">
          <button 
            onClick={() => window.open('mailto:indastreet.id@gmail.com', '_blank')}
            className="w-full bg-white border-2 border-orange-500 text-orange-600 rounded-xl py-3 font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Hubungi Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistLegal;
