// @ts-nocheck - Temporary fix for React 19 type incompatibility with lucide-react
import React, { useState } from 'react';
import { FileText, Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface TherapistLegalProps {
  therapist: any;
  onBack: () => void;
}

const TherapistLegal: React.FC<TherapistLegalProps> = ({ onBack }) => {
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
      title: '1. Introduction & Acceptance',
      content: `Welcome to Indastreet Therapist Platform. By creating an account and using our services, you agree to these Terms of Service. Please read them carefully.

These terms govern your use of the Indastreet platform as a massage therapist provider. If you do not agree with any part of these terms, you may not use our services.`
    },
    {
      id: 'account',
      title: '2. Therapist Account Requirements',
      content: `2.1 Eligibility
- You must be at least 18 years old
- You must have valid professional credentials/certification
- You must provide accurate and complete information
- You are responsible for maintaining the security of your account

2.2 Profile Information
- All profile information must be truthful and accurate
- Profile photos must comply with our image requirements (professional, clear face)
- You must keep your contact information (WhatsApp, location) up to date
- False or misleading information may result in account suspension

2.3 One Account Policy
- Each therapist may only maintain ONE active account
- Creating multiple accounts to circumvent restrictions is prohibited
- Duplicate accounts will be merged or permanently suspended`
    },
    {
      id: 'services',
      title: '3. Service Provision',
      content: `3.1 Booking Acceptance
- You are responsible for accepting or rejecting bookings within 24 hours
- Repeated failure to respond may affect your search ranking
- You must honor accepted bookings unless emergency circumstances arise

3.2 Professional Standards
- You must provide services professionally and safely
- You are responsible for bringing necessary equipment and supplies
- You must respect customer privacy and boundaries
- You agree to follow industry best practices and local regulations

3.3 Pricing
- You set your own pricing for 60min, 90min, and 120min sessions
- Commission structure: 
  * Free tier: 25% to Indastreet, 75% to you
  * Premium tier (Rp 200k/month): 0% commission - you keep 100%!
- Prices must be competitive and reasonable
- You may not charge customers additional fees beyond agreed booking price`
    },
    {
      id: 'payments',
      title: '4. Payments & Commission',
      content: `4.1 Commission Structure
- Free tier commission: 25% per completed booking (you receive 75%)
- Premium tier commission: 0% (you receive 100% of booking total)
- Premium membership: Rp 200,000/month or Rp 2,000,000/year
- Payments are processed weekly on Mondays
- Payment method: Bank transfer to your registered account

4.2 Payment Terms
- You must provide valid banking information
- Payments are made for all COMPLETED bookings only
- Cancelled or no-show bookings are not paid
- You are responsible for your own tax obligations

4.3 Disputes
- Payment disputes must be raised within 14 days
- We reserve the right to withhold payment pending investigation
- Final payment decisions are at our discretion`
    },
    {
      id: 'membership',
      title: '5. Premium Membership',
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
      title: '6. Code of Conduct',
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
      title: '7. Liability & Insurance',
      content: `7.1 Your Responsibility
- You are an independent contractor, not an employee
- You are responsible for your own liability insurance
- You assume all risk related to providing services
- You are responsible for any injury or damage caused during services

7.2 Platform Liability
- Indastreet is a marketplace platform connecting therapists and customers
- We do not employ therapists or guarantee service quality
- We are not liable for disputes between therapists and customers
- We are not liable for injury, damage, or loss during bookings

7.3 Indemnification
- You agree to indemnify Indastreet against claims arising from your services
- You are responsible for resolving customer complaints
- You will cooperate with any investigations or legal proceedings`
    },
    {
      id: 'termination',
      title: '8. Account Suspension & Termination',
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
      title: '9. Changes to Terms',
      content: `We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the new terms.

We will notify you of significant changes via email or in-app notification.`
    },
    {
      id: 'contact',
      title: '10. Contact & Support',
      content: `For questions about these Terms of Service, please contact us:

Email: indastreet.id@gmail.com
Support Chat: Available in app (Premium members get 24/7 support)
Response Time: Within 48 hours for free users, 2 hours for premium users

Last Updated: December 11, 2024`
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-800 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={onBack}
            className="text-white hover:bg-white/20 rounded-lg px-3 py-2 transition-colors mb-4"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-3 mb-4">
            <FileText className="w-8 h-8" />
            <h1 className="text-3xl font-bold">Legal & Policies</h1>
          </div>
          <p className="text-slate-200">Terms of Service and Privacy Policy for therapists</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-6 py-4 font-semibold border-b-4 transition-colors ${
                activeTab === 'terms'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Terms of Service
              </div>
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-6 py-4 font-semibold border-b-4 transition-colors ${
                activeTab === 'privacy'
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy Policy
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {content.map((section, index) => (
            <div key={section.id} className={index !== 0 ? 'border-t' : ''}>
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h2 className="text-lg font-bold text-gray-900 text-left">{section.title}</h2>
                {expandedSections.has(section.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expandedSections.has(section.id) && (
                <div className="px-6 pb-4">
                  <div className="prose prose-sm max-w-none">
                    {section.content.split('\n').map((paragraph, i) => (
                      <p key={i} className="text-gray-700 mb-3 whitespace-pre-line leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Agreement Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <Shield className="w-6 h-6 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-blue-900 mb-2">Your Agreement</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                By continuing to use the Indastreet therapist platform, you acknowledge that you have read, 
                understood, and agree to be bound by these Terms of Service and Privacy Policy. 
                If you do not agree, please discontinue use of the platform.
              </p>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="mt-6 bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-orange-900 mb-2">Questions or Concerns?</h3>
              <p className="text-sm text-orange-800 leading-relaxed mb-3">
                If you have any questions about these terms or policies, or need clarification on any point, 
                please contact our support team.
              </p>
              <a 
                href="mailto:indastreet.id@gmail.com"
                className="inline-block px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm"
              >
                Contact Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TherapistLegal;
