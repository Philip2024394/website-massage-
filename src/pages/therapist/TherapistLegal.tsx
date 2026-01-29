/**
 * TherapistLegal - Terms of Service and Privacy Policy
 * 
 * @ts-expect-error - lucide-react ForwardRefExoticComponent incompatible with React 19 types
 * Component functions correctly at runtime. Type fix pending lucide-react or @types/react update.
 */
import React, { useState } from 'react';
import { FileText, Shield, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import TherapistPageHeader from '../../components/therapist/TherapistPageHeader';
import HelpTooltip from '../../components/therapist/HelpTooltip';
import { legalHelp } from './constants/helpContent';

interface TherapistLegalProps {
  therapist: any;
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const TherapistLegal: React.FC<TherapistLegalProps> = ({ therapist, onBack, onNavigate }) => {
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
      title: 'INDASTREET TERMS OF SERVICE',
      content: `Last Updated: 28 January 2026

These Terms of Service ("Terms") govern your access to and use of the IndaStreet platform ("IndaStreet", "Platform", "we", "us", "our").

By creating an account or using the Platform, you confirm that you have read, understood, and agreed to be legally bound by these Terms.`
    },
    {
      id: 'platform-role',
      title: '1. PLATFORM ROLE & PURPOSE',
      content: `1.1 Platform-Only Service

IndaStreet operates exclusively as a digital marketplace and traffic facilitation platform.

IndaStreet:
• Connects independent massage therapists and massage establishments ("Service Providers") with customers
• Provides listing, booking, communication, and payment facilitation tools

IndaStreet does NOT:
• Provide massage or wellness services
• Employ massage therapists
• Control how services are delivered
• Supervise, direct, or manage Service Providers
• Guarantee bookings, income, or customer behavior

1.2 No Employment Relationship

Nothing in these Terms creates an:
• Employment relationship
• Agency relationship
• Partnership
• Joint venture

between IndaStreet and any Service Provider.`
    },
    {
      id: 'independent-contractor',
      title: '2. INDEPENDENT CONTRACTOR STATUS',
      content: `2.1 Self-Employment

All Service Providers operate as independent, self-employed contractors.

You:
• Control when, where, and whether you work
• Decide which bookings to accept or decline
• Determine your own service methods and standards
• Operate your own business independently

2.2 Taxes & Legal Obligations

You are solely responsible for:
• Declaring and paying all income taxes
• VAT, GST, or similar consumption taxes (if applicable)
• Business registration requirements
• Social security or equivalent contributions
• Professional licensing and renewals
• Compliance with Indonesian law and/or local laws in your country

IndaStreet does not withhold taxes and does not provide tax advice.`
    },
    {
      id: 'account-eligibility',
      title: '3. ACCOUNT ELIGIBILITY & USE',
      content: `3.1 Eligibility

To use IndaStreet, you must:
• Be at least 18 years old
• Have legal capacity to provide massage services
• Hold any licenses or certifications required by law
• Have the legal right to work in your jurisdiction

3.2 Account Accuracy

You agree to:
• Provide accurate and truthful information
• Maintain up-to-date contact, location, and availability details
• Use professional and compliant profile images
• Keep your login credentials secure

False or misleading information may result in suspension or termination.

3.3 One Account Policy

• One account per individual or business
• No account sharing
• No duplicate accounts

Violations may result in permanent termination`
    },
    {
      id: 'bookings-safety',
      title: '4. BOOKINGS & SAFETY',
      content: `4.1 Right to Accept or Decline

You have absolute discretion to:
• Accept or decline any booking
• Cancel accepted bookings if safety or circumstances change
• Decline without explanation

4.2 Safety First

Your safety is paramount. You should decline bookings if:
• You feel unsafe or uncomfortable
• The location raises concerns
• Customer communication is inappropriate
• Any red flags are present

No penalties apply for safety-based decisions.

4.3 Service Responsibility

If you accept a booking, you are solely responsible for:
• Service quality and conduct
• Customer safety and boundaries
• Compliance with health and hygiene standards
• Compliance with applicable laws and regulations`
    },
    {
      id: 'pricing-commission',
      title: '5. PRICING & COMMISSION',
      content: `5.1 Platform Commission

IndaStreet charges a platform facilitation commission on completed bookings.

• Standard commission: 30% of the total booking value
• Commission applies to the full amount charged to the customer

5.2 Right to Change Commission

IndaStreet reserves the unilateral right to:
• Modify commission rates
• Change calculation methods
• Update payment timing

Changes may occur with or without prior notice.
Continued use of the Platform constitutes acceptance.

5.3 Payment & Settlement

• Commission becomes due upon booking completion
• Payments may be processed according to IndaStreet's payout schedule
• Only completed bookings generate earnings

5.4 Late Payments & Enforcement

Unpaid commissions:
• Become a legally enforceable debt
• May result in account suspension or restriction
• May incur late payment charges

Late payment charges may include:
• Interest calculated at the maximum rate permitted by applicable law in the Service Provider's jurisdiction, calculated daily
• Administrative and recovery costs

IndaStreet may pursue lawful debt recovery measures where permitted.`
    },
    {
      id: 'no-guarantee',
      title: '6. NO GUARANTEE OF BOOKINGS OR INCOME',
      content: `IndaStreet does not guarantee:
• Any minimum number of bookings
• Any level of income
• Customer demand or behavior
• Continued platform availability

All services are provided "as is" and "as available."`
    },
    {
      id: 'prohibited',
      title: '7. PROHIBITED ACTIVITIES',
      content: `You must not:
• Bypass the platform to avoid commission
• Solicit customers outside the platform
• Request undisclosed payments
• Engage in illegal, unsafe, or inappropriate behavior
• Misuse customer data
• Manipulate ratings or reviews
• Provide services while impaired or unsafe

Violations may result in immediate termination.`
    },
    {
      id: 'liability',
      title: '8. LIABILITY LIMITATION & DISCLAIMERS',
      content: `8.1 Platform Disclaimer

IndaStreet is not liable for:
• Injuries, damages, or losses during services
• Service quality or outcomes
• Customer-provider disputes
• Theft, accidents, or misconduct
• Medical or physical complications

8.2 Responsibility

All risks associated with massage services rest entirely with the Service Provider.

You are responsible for obtaining appropriate insurance where required.`
    },
    {
      id: 'indemnification',
      title: '9. INDEMNIFICATION',
      content: `You agree to indemnify and hold harmless IndaStreet, its owners, employees, and affiliates from:
• Claims arising from your services
• Legal actions related to your conduct
• Violations of these Terms or applicable laws`
    },
    {
      id: 'termination',
      title: '10. ACCOUNT SUSPENSION & TERMINATION',
      content: `IndaStreet may suspend or terminate accounts for:
• Non-payment
• Policy violations
• Fraud or abuse
• Safety concerns
• Legal compliance issues

You may close your account at any time, subject to settlement of outstanding obligations.`
    },
    {
      id: 'changes',
      title: '11. CHANGES TO TERMS',
      content: `We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting. Your continued use of the platform after changes constitutes acceptance of the new terms.

We will notify you of significant changes via email or in-app notification.`
    },
    {
      id: 'governing-law',
      title: '12. GOVERNING LAW & JURISDICTION',
      content: `These Terms are governed by:
• The laws of the Republic of Indonesia,

Without prejudice to mandatory consumer protection laws applicable in other jurisdictions.

Where legally required, disputes may be resolved in the user's local jurisdiction.`
    },
    {
      id: 'contact',
      title: '13. CONTACT & SUPPORT',
      content: `For questions about these Terms of Service, please contact us:

Email: indastreet.id@gmail.com

Support Chat: Verified members get 24/7 support whats app group

Response Time: Within 48 hours for free users, 2 hours for premium users

IMPORTANT: Members participating on the app must be associated members of the WhatsApp IndaStreet group. Leaving the group without prior admin agreement can result in delayed support times and certain support services not being offered.`
    },
    {
      id: 'acknowledgment',
      title: 'FINAL ACKNOWLEDGMENT',
      content: `By using IndaStreet, you confirm that you:
• Understand these Terms
• Accept full responsibility for your services
• Acknowledge IndaStreet's role as a platform only

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
      id: 'header',
      title: 'INDASTREET PRIVACY POLICY',
      content: `Last Updated: 28 January 2026

This Privacy Policy explains how IndaStreet ("IndaStreet", "we", "us", "our") collects, uses, stores, processes, and protects personal data of therapists and massage establishments ("you", "Service Providers") who use the IndaStreet platform.

IndaStreet is committed to protecting your personal data in accordance with Indonesian Law No. 27 of 2022 on Personal Data Protection (UU PDP) and other applicable international data protection regulations.

By using the Platform, you acknowledge and agree to this Privacy Policy.`
    },
    {
      id: 'scope',
      title: '1. SCOPE & ROLE',
      content: `IndaStreet acts as a Personal Data Controller for data collected through the Platform and may act as a Data Processor where required by law.

This Privacy Policy applies only to therapist and place accounts and does not cover customer privacy policies unless explicitly stated.`
    },
    {
      id: 'collection',
      title: '2. PERSONAL DATA WE COLLECT',
      content: `2.1 Account & Identity Information

We may collect:

• Full name
• Email address
• Phone number
• WhatsApp number (used for booking coordination)
• Profile photo and additional images
• Bank account details for payouts
• Location and service area

2.2 Professional Information

• Years of experience
• Massage types and specializations
• Languages spoken
• Pricing information
• Optional certifications or credentials

2.3 Usage & Platform Activity Data

• Login activity and timestamps
• Booking history and status
• Customer interactions and messages
• Payment and commission records
• Platform analytics (profile views, clicks, booking conversions)

2.4 Device & Technical Data

• IP address
• Browser type and device information
• Operating system
• Approximate location (with permission)
• Cookies and similar technologies`
    },
    {
      id: 'purpose',
      title: '3. PURPOSE OF DATA PROCESSING',
      content: `We process personal data for the following lawful purposes:

3.1 Platform Operations

• Creating and managing your account and profile
• Facilitating bookings and customer connections
• Processing payments and commission calculations
• Providing technical and customer support
• Preventing fraud and unauthorized access

3.2 Platform Improvement & Analytics

• Analyzing platform performance and usage
• Improving search relevance and visibility
• Enhancing user experience and features
• Internal reporting and operational insights

3.3 Communications

• Booking confirmations and reminders
• Service-related notifications
• Payment confirmations
• Important platform updates
• Optional marketing communications (opt-out available)

3.4 Legal & Regulatory Compliance

• Compliance with Indonesian and international laws
• Responding to lawful requests from authorities
• Enforcing Terms of Service
• Protecting platform users, rights, and safety`
    },
    {
      id: 'sharing',
      title: '4. DATA SHARING & DISCLOSURE',
      content: `4.1 Information Shared with Customers

The following information may be visible to customers:

• Public profile details (name, photo, services, pricing, location)
• Availability and booking status
• Ratings and reviews
• WhatsApp contact details only after booking confirmation

4.2 Third-Party Service Providers

We may share limited data with trusted third parties strictly for platform operations, including:

• Payment processors
• Cloud and database providers (e.g., Appwrite)
• Analytics services
• Email and notification services
• WhatsApp Business API (for messaging)

All third parties are contractually required to protect your data.

4.3 No Sale of Personal Data

IndaStreet:

• Does not sell personal data
• Does not share data with advertisers
• Does not allow third-party marketing access to your data

4.4 Legal Disclosure

We may disclose data where required:

• By law or court order
• To comply with legal obligations
• To prevent fraud or security threats
• To protect IndaStreet's legal rights`
    },
    {
      id: 'security',
      title: '5. DATA SECURITY',
      content: `5.1 Security Measures

We implement appropriate technical and organizational safeguards, including:

• Encrypted data transmission (SSL/TLS)
• Secure database hosting
• Access controls and authentication
• Password hashing and secure storage
• Regular system updates and monitoring

5.2 Payment Data Protection

• Bank details encrypted at rest
• Secure payment integrations
• Limited internal access to financial data

5.3 User Responsibilities

You are responsible for:

• Keeping login credentials confidential
• Using strong passwords
• Logging out on shared devices
• Reporting suspicious activity promptly`
    },
    {
      id: 'rights',
      title: '6. YOUR DATA PROTECTION RIGHTS',
      content: `Under Indonesian law and applicable international regulations, you have the right to:

6.1 Access & Portability

• View personal data in your account
• Request a copy of your personal data
• Export booking and activity history

6.2 Correction

• Update or correct inaccurate data
• Request assistance via support if needed

6.3 Deletion & Erasure

• Delete your account at any time
• Request permanent data deletion, subject to legal retention obligations

6.4 Marketing Preferences

• Opt out of promotional communications
• Disable notifications where available

6.5 Data Retention

• Active accounts: Data retained while account is active
• Deleted accounts: Data removed within 90 days
• Financial records: Retained up to 7 years as required by law
• Backup systems: Cleared within 180 days`
    },
    {
      id: 'cookies',
      title: '7. COOKIES & TRACKING TECHNOLOGIES',
      content: `7.1 Types of Cookies

• Essential cookies (platform functionality)
• Authentication cookies
• Analytics cookies (performance and usage)
• Preference cookies

7.2 Third-Party Technologies

• Map services for location display
• Analytics tools (aggregated and anonymized where possible)
• Payment security tools

7.3 Cookie Control

• You may disable cookies via browser settings
• Some features may not function correctly without cookies`
    },
    {
      id: 'international',
      title: '8. INTERNATIONAL DATA TRANSFERS',
      content: `Your personal data may be stored or processed on servers located in Indonesia and other jurisdictions, including the United States.

Where data is transferred internationally, IndaStreet ensures appropriate safeguards in accordance with applicable data protection laws.`
    },
    {
      id: 'children',
      title: '9. CHILDREN\'S PRIVACY',
      content: `IndaStreet does not knowingly collect personal data from individuals under 18 years of age.

If we become aware that a minor's data has been collected, it will be deleted promptly.`
    },
    {
      id: 'updates',
      title: '10. POLICY UPDATES',
      content: `We may update this Privacy Policy from time to time.

• Changes take effect upon posting
• Significant changes will be communicated via email or in-app notice
• Continued use of the Platform constitutes acceptance`
    },
    {
      id: 'contact',
      title: '11. CONTACT & DATA REQUESTS',
      content: `For privacy-related inquiries or requests:

📧 Email: indastreet.id@gmail.com
📌 Subject: Privacy Request – IndaStreet
⏱️ Response Time: Within 48 hours

For data access, correction, or deletion requests, please include:

• Full name
• Registered email
• Description of your request
• Proof of identity (for security)`
    },
    {
      id: 'acknowledgment',
      title: 'FINAL ACKNOWLEDGMENT',
      content: `By using the IndaStreet platform, you acknowledge that you have read, understood, and agreed to this Privacy Policy.`
    }
  ];

  const content = activeTab === 'terms' ? termsContent : privacyContent;

  const handleContactSupport = () => {
    const topic = activeTab === 'terms' ? 'Terms And Conditions' : 'Privacy Policy';
    const message = encodeURIComponent(`Hi i would like to know little more regarding ${topic}`);
    const whatsappUrl = `https://wa.me/6281392000050?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const dict = {
    therapistDashboard: {
      thisMonth: 'this month'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch', touchAction: 'pan-y pan-x' }}>
      {/* Page Header */}
      <TherapistPageHeader
        title="Legal & Privacy"
        subtitle="Terms of Service and Privacy Policy"
        onBackToStatus={onBack}
        icon={<FileText className="w-6 h-6 text-orange-600" />}
        actions={
          <div className="flex items-center gap-2">
            <HelpTooltip
              {...legalHelp.terms}
              position="left"
              size="md"
            />
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-semibold text-gray-700">{(therapist?.onlineHoursThisMonth || 0).toFixed(1)}h</span>
              <span className="text-xs text-gray-500">this month</span>
            </div>
          </div>
        }
      />

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Tab Switcher */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 flex gap-2">
            <button
              onClick={() => setActiveTab('terms')}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${
                activeTab === 'terms'
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <FileText className="w-4 h-4 mx-auto mb-1" />
              Terms of Service
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
              Privacy Policy
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-3">
          {content.map((section) => (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
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

        {/* Agreement Badge */}
        <div className="mt-6">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-orange-900 text-sm mb-1">Your Agreement</h3>
                <p className="text-xs text-orange-800 leading-relaxed">
                  By using this platform, you agree to these Terms & Privacy policies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Button */}
        <div className="mt-6 mb-4">
          <button 
            onClick={handleContactSupport}
            className="w-full bg-white border-2 border-orange-500 text-orange-600 rounded-xl py-3 font-bold hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
          >
            <FileText className="w-5 h-5" />
            Contact Support via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};

export default TherapistLegal;
