import React from 'react';
import './TherapistTermsAndConditions.css';

/**
 * Therapist Terms & Conditions
 * 
 * LEGAL FRAMEWORK for:
 * - Booking response obligations
 * - Availability score system
 * - Visibility adjustments
 * - Platform-only communication
 * - Penalties and account removal
 * 
 * Must be accepted during registration
 */

const TherapistTermsAndConditions: React.FC = () => {
  return (
    <div className="therapist-terms-container">
      <div className="terms-header">
        <h1>Therapist Terms & Conditions</h1>
        <p className="last-updated">Last Updated: January 1, 2026</p>
        <p className="version">Version 2.0</p>
      </div>

      <div className="terms-content">
        <section className="terms-intro">
          <h2>Introduction</h2>
          <p>
            By registering as a massage therapist, facial therapist, or wellness provider 
            (collectively "Therapist") on the IndaStreet platform (the "Platform"), you 
            acknowledge that you have read, understood, and agree to be bound by these 
            Therapist Terms & Conditions ("Terms").
          </p>
          <p>
            <strong>These Terms are legally binding.</strong> If you do not agree with any 
            provision, you must not register or use the Platform.
          </p>
        </section>

        <section className="terms-section critical">
          <div className="section-number">1</div>
          <h2>Mandatory Booking Response Obligation</h2>
          
          <h3>1.1 Response Requirement</h3>
          <p>
            When your availability status is set to <strong>"Available"</strong> or 
            <strong>"Online"</strong> on the Platform, you hereby agree and acknowledge that:
          </p>
          <ul>
            <li>
              You <strong>must respond</strong> to all booking requests within <strong>five (5) minutes</strong> 
              of receiving notification from the Platform.
            </li>
            <li>
              "Response" means either:
              <ul>
                <li>(a) Accepting the booking request, or</li>
                <li>(b) Declining the booking request with a valid reason</li>
              </ul>
            </li>
            <li>
              Failure to respond within the five (5) minute window constitutes a <strong>"Missed Booking"</strong>.
            </li>
          </ul>

          <h3>1.2 Missed Booking Definition</h3>
          <p>
            A booking is considered "missed" when:
          </p>
          <ul>
            <li>No action (accept or decline) is taken within five (5) minutes</li>
            <li>The booking request expires due to timeout</li>
            <li>The Platform system logs indicate no timely response</li>
          </ul>

          <h3>1.3 Legal Justification</h3>
          <p>
            This requirement exists to:
          </p>
          <ul>
            <li>Maintain customer trust and Platform reliability</li>
            <li>Ensure fair opportunity distribution among therapists</li>
            <li>Protect the Platform's reputation and business operations</li>
            <li>Provide customers with timely service confirmation</li>
          </ul>

          <div className="legal-notice">
            <strong>⚖️ LEGAL NOTICE:</strong> By marking yourself as "Available", you represent 
            that you are ready, willing, and able to receive and respond to booking requests 
            immediately. This constitutes an offer to perform services and creates reasonable 
            customer expectations.
          </div>
        </section>

        <section className="terms-section critical">
          <div className="section-number">2</div>
          <h2>Notification Responsibility & Device Readiness</h2>
          
          <h3>2.1 Technology Acknowledgment</h3>
          <p>
            You acknowledge and understand that the Platform delivers booking notifications via:
          </p>
          <ul>
            <li>Web Push Notifications (browser-based)</li>
            <li>Progressive Web App (PWA) notifications</li>
            <li>In-app alerts and modals</li>
            <li>Badge counters and visual indicators</li>
            <li>Email notifications (supplementary)</li>
          </ul>

          <h3>2.2 Sole Responsibility</h3>
          <p>
            You, as the Therapist, are <strong>solely and exclusively responsible</strong> for:
          </p>
          <ol>
            <li>
              <strong>Maintaining an Active Login Session:</strong> Ensuring you are logged 
              into the Platform when marked as "Available".
            </li>
            <li>
              <strong>Enabling Push Notifications:</strong> Granting necessary browser and 
              device permissions for notification delivery.
            </li>
            <li>
              <strong>Device Configuration:</strong> Ensuring your device is:
              <ul>
                <li>Not on silent or mute mode (if sound alerts are required)</li>
                <li>Connected to a stable internet connection</li>
                <li>Running a compatible browser version</li>
                <li>Not in battery-saving mode that restricts notifications</li>
              </ul>
            </li>
            <li>
              <strong>Platform Monitoring:</strong> Actively checking the Platform when your 
              status is "Available".
            </li>
            <li>
              <strong>Browser/App Status:</strong> Keeping the Platform open or the PWA installed 
              and running to receive notifications.
            </li>
          </ol>

          <h3>2.3 Platform Non-Liability</h3>
          <p>
            <strong>The Platform is NOT responsible</strong> for missed bookings resulting from:
          </p>
          <ul>
            <li>Device on silent, mute, or do-not-disturb mode</li>
            <li>Network connectivity issues (Wi-Fi, mobile data)</li>
            <li>Browser or operating system restrictions on notifications</li>
            <li>Device battery dead or powered off</li>
            <li>Notification permissions not granted</li>
            <li>Platform app/browser not actively open or running</li>
            <li>Third-party browser extensions blocking notifications</li>
            <li>Operating system updates requiring app restart</li>
            <li>Any other technical issue on the Therapist's end</li>
          </ul>

          <div className="legal-notice warning">
            <strong>⚠️ IMPORTANT:</strong> The Platform provides reasonable notification 
            mechanisms. It is your professional obligation to ensure you are equipped to 
            receive them. "I didn't hear/see the notification" is not a valid defense for 
            missed bookings.
          </div>
        </section>

        <section className="terms-section critical">
          <div className="section-number">3</div>
          <h2>Performance-Based Availability Scoring System</h2>
          
          <h3>3.1 Scoring System Overview</h3>
          <p>
            The Platform operates an automated <strong>Availability Score</strong> system 
            (0-100 points) that tracks and measures therapist responsiveness.
          </p>

          <h3>3.2 Score Calculation</h3>
          <p>
            Your Availability Score is calculated based on:
          </p>
          <table className="scoring-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Response Time</th>
                <th>Points</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              <tr className="positive">
                <td>Accept Booking</td>
                <td>&lt; 1 minute</td>
                <td><strong>+7 points</strong></td>
                <td>Excellent</td>
              </tr>
              <tr className="positive">
                <td>Accept Booking</td>
                <td>1-5 minutes</td>
                <td><strong>+5 points</strong></td>
                <td>Good</td>
              </tr>
              <tr className="neutral">
                <td>Accept Booking</td>
                <td>&gt; 5 minutes</td>
                <td>+2 points</td>
                <td>Late but better than miss</td>
              </tr>
              <tr className="neutral">
                <td>Decline Booking</td>
                <td>Any (with reason)</td>
                <td>0 points</td>
                <td>No penalty</td>
              </tr>
              <tr className="negative">
                <td>Missed Booking</td>
                <td>&gt; 5 minutes</td>
                <td><strong>-10 points</strong></td>
                <td>Significant penalty</td>
              </tr>
              <tr className="negative-severe">
                <td>Missed Booking (3+ consecutive)</td>
                <td>&gt; 5 minutes</td>
                <td><strong>-20 points</strong></td>
                <td>Severe penalty</td>
              </tr>
            </tbody>
          </table>

          <h3>3.3 Visibility & Ranking Adjustment</h3>
          <p>
            <strong>The Platform reserves the right</strong> to automatically adjust your:
          </p>
          <ul>
            <li><strong>Search Visibility:</strong> Your ranking in customer search results</li>
            <li><strong>Booking Priority:</strong> Your position in booking request queues</li>
            <li><strong>Featured Status:</strong> Eligibility for "Top Therapist" or featured placements</li>
            <li><strong>Badge Display:</strong> Visibility of "Highly Responsive" and similar badges</li>
            <li><strong>Profile Prominence:</strong> Display priority on the Platform homepage</li>
          </ul>

          <h3>3.4 Score Ranges & Effects</h3>
          <table className="score-ranges-table">
            <thead>
              <tr>
                <th>Score Range</th>
                <th>Classification</th>
                <th>Search Visibility</th>
                <th>Badges</th>
              </tr>
            </thead>
            <tbody>
              <tr className="elite">
                <td>90-100</td>
                <td>Elite</td>
                <td>1.5x boost (50% increase)</td>
                <td>🌟 Highly Responsive, Lightning Fast</td>
              </tr>
              <tr className="excellent">
                <td>80-89</td>
                <td>Excellent</td>
                <td>1.2x boost (20% increase)</td>
                <td>✅ Responsive, Quick Responder</td>
              </tr>
              <tr className="good">
                <td>60-79</td>
                <td>Good</td>
                <td>1.0x (Normal visibility)</td>
                <td>Standard profile</td>
              </tr>
              <tr className="fair">
                <td>40-59</td>
                <td>Fair</td>
                <td>0.6x penalty (40% reduction)</td>
                <td>⚠️ Warning displayed</td>
              </tr>
              <tr className="poor">
                <td>0-39</td>
                <td>Needs Improvement</td>
                <td>0.3x penalty (70% reduction)</td>
                <td>🚫 Improvement Required flag</td>
              </tr>
            </tbody>
          </table>

          <h3>3.5 Automated & Non-Negotiable</h3>
          <p>
            <strong>You acknowledge and agree that:</strong>
          </p>
          <ul>
            <li>Score adjustments are <strong>automated</strong> and calculated by platform algorithms</li>
            <li>Visibility changes are <strong>non-negotiable</strong> and applied immediately</li>
            <li>The system is <strong>applied equally</strong> to all therapists without discrimination</li>
            <li>Scores are based on <strong>objective metrics</strong> (timestamps, response logs)</li>
            <li>You have <strong>no right to dispute</strong> automated score calculations unless proven system error</li>
          </ul>

          <div className="legal-notice">
            <strong>⚖️ LEGAL BASIS:</strong> This performance-based system is standard practice 
            in marketplace platforms (Uber, DoorDash, Airbnb) and is necessary to maintain 
            platform quality, customer satisfaction, and fair competition among service providers.
          </div>
        </section>

        <section className="terms-section critical">
          <div className="section-number">4</div>
          <h2>Penalties for Missed Bookings & Non-Responsiveness</h2>
          
          <h3>4.1 Penalty Authority</h3>
          <p>
            <strong>The Platform may apply one or more of the following actions</strong> in 
            response to missed bookings, repeated non-responsiveness, or poor availability scores:
          </p>

          <h3>4.2 Progressive Enforcement Actions</h3>
          <ol>
            <li>
              <strong>First Tier: Visibility Reduction</strong>
              <ul>
                <li>Automatic lowering of search ranking</li>
                <li>Removal from "Featured Therapists" section</li>
                <li>Badge removal ("Highly Responsive", "Top Rated")</li>
                <li>No notification to therapist (automatic enforcement)</li>
              </ul>
            </li>
            <li>
              <strong>Second Tier: Booking Eligibility Suspension</strong>
              <ul>
                <li>Temporary suspension from receiving new booking requests (24-72 hours)</li>
                <li>Warning notice displayed on therapist dashboard</li>
                <li>Required acknowledgment of terms before re-activation</li>
              </ul>
            </li>
            <li>
              <strong>Third Tier: Extended Suspension</strong>
              <ul>
                <li>Suspension from Platform for 7-30 days</li>
                <li>Removal from all customer-facing search results</li>
                <li>Mandatory performance improvement plan</li>
                <li>May require re-verification or re-training</li>
              </ul>
            </li>
            <li>
              <strong>Fourth Tier: Permanent Account Deactivation</strong>
              <ul>
                <li>Permanent removal from the Platform</li>
                <li>Loss of all accumulated reviews and ratings</li>
                <li>Ineligibility for future re-registration</li>
                <li>Applied in cases of:
                  <ul>
                    <li>Chronic non-responsiveness (10+ missed bookings in 30 days)</li>
                    <li>Availability score consistently below 30 for 60+ days</li>
                    <li>Repeated violations of platform policies</li>
                    <li>Evidence of intentional booking manipulation</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ol>

          <h3>4.3 Enforcement Criteria</h3>
          <p>
            Penalties are applied based on:
          </p>
          <ul>
            <li><strong>Frequency:</strong> Number of missed bookings within a rolling 30-day period</li>
            <li><strong>Severity:</strong> Impact on customers and Platform operations</li>
            <li><strong>Pattern:</strong> Consistent poor performance vs. isolated incidents</li>
            <li><strong>Score Trend:</strong> Declining vs. improving availability scores</li>
            <li><strong>Customer Impact:</strong> Number of customers affected by no-shows or delays</li>
          </ul>

          <h3>4.4 No Refund or Compensation</h3>
          <p>
            <strong>You acknowledge and agree that:</strong>
          </p>
          <ul>
            <li>No refund of any fees or commissions will be issued upon suspension or termination</li>
            <li>You are not entitled to compensation for lost bookings during suspension</li>
            <li>The Platform has no obligation to restore your account or data after termination</li>
            <li>Penalties are <strong>in addition to</strong> any other remedies available to the Platform</li>
          </ul>

          <div className="legal-notice warning">
            <strong>⚠️ CRITICAL:</strong> Repeated missed bookings directly harm customer 
            experience, damage Platform reputation, and violate the fundamental performance 
            expectations set forth in these Terms. The Platform has a legitimate business 
            interest in maintaining service quality through enforcement actions.
          </div>
        </section>

        <section className="terms-section critical">
          <div className="section-number">5</div>
          <h2>Platform-Only Communication Policy</h2>
          
          <h3>5.1 Exclusive Communication Channel</h3>
          <p>
            <strong>All booking-related communication MUST occur exclusively within the Platform.</strong>
          </p>
          <p>
            "Booking-related communication" includes but is not limited to:
          </p>
          <ul>
            <li>Initial booking inquiries and requests</li>
            <li>Service details, pricing, and availability discussions</li>
            <li>Appointment confirmations and modifications</li>
            <li>Pre-appointment coordination (arrival time, location details)</li>
            <li>Payment discussions and receipt confirmations</li>
            <li>Post-service follow-up and feedback</li>
          </ul>

          <h3>5.2 Strict Prohibition on External Contact</h3>
          <p>
            <strong>Therapists are STRICTLY PROHIBITED from:</strong>
          </p>
          <ol>
            <li>Requesting customer phone numbers for direct contact</li>
            <li>Requesting customer email addresses</li>
            <li>Requesting customer WhatsApp, Telegram, or other messaging app contacts</li>
            <li>Sharing their own phone number or WhatsApp with customers</li>
            <li>Encouraging customers to contact them outside the Platform</li>
            <li>Coordinating bookings through any channel other than the Platform</li>
            <li>Arranging direct payments that bypass Platform commission</li>
            <li>Soliciting customers for future bookings outside the Platform</li>
          </ol>

          <h3>5.3 Legal Justification for This Policy</h3>
          <p>
            This policy exists to:
          </p>
          <ul>
            <li><strong>Protect Commission Revenue:</strong> The Platform earns commission only on tracked bookings</li>
            <li><strong>Ensure Quality Control:</strong> Platform can monitor and resolve disputes</li>
            <li><strong>Maintain Customer Privacy:</strong> Prevent unauthorized use of customer data</li>
            <li><strong>Enable Dispute Resolution:</strong> All communication is logged for evidence</li>
            <li><strong>Comply with Data Protection Laws:</strong> Customer data must remain within secure Platform</li>
            <li><strong>Prevent Platform Bypass:</strong> Customers and therapists building direct relationships outside platform</li>
          </ul>

          <h3>5.4 Violation Consequences</h3>
          <p>
            <strong>Violation of this policy may result in:</strong>
          </p>
          <table className="violation-table">
            <thead>
              <tr>
                <th>Offense</th>
                <th>First Violation</th>
                <th>Second Violation</th>
                <th>Third Violation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Requesting customer contact</td>
                <td>7-day suspension</td>
                <td>30-day suspension</td>
                <td>Permanent termination</td>
              </tr>
              <tr>
                <td>Sharing personal contact</td>
                <td>14-day suspension</td>
                <td>Permanent termination</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td>Coordinating direct bookings</td>
                <td>30-day suspension + fine</td>
                <td>Permanent termination + legal action</td>
                <td>N/A</td>
              </tr>
              <tr>
                <td>Repeated pattern of bypass</td>
                <td colSpan={3}>Immediate permanent termination + legal action for lost revenue</td>
              </tr>
            </tbody>
          </table>

          <h3>5.5 Monitoring & Enforcement</h3>
          <p>
            <strong>You acknowledge and agree that:</strong>
          </p>
          <ul>
            <li>The Platform may monitor all in-platform messages for policy compliance</li>
            <li>Automated systems may flag suspicious communication patterns</li>
            <li>Customer reports of external contact requests will be investigated</li>
            <li>Evidence of policy violations may result in immediate action without prior warning</li>
            <li>The Platform reserves the right to share evidence of violations with legal authorities if fraud is suspected</li>
          </ul>

          <div className="legal-notice danger">
            <strong>🚨 SEVERE VIOLATION:</strong> Attempting to bypass the Platform by 
            coordinating bookings externally constitutes breach of contract, violation of 
            commission agreements, and potential fraud. The Platform reserves all legal 
            remedies including pursuing lost commission revenue through legal action.
          </div>
        </section>

        <section className="terms-section critical">
          <div className="section-number">6</div>
          <h2>Platform Authority & Final Determination</h2>
          
          <h3>6.1 Platform's Final Authority</h3>
          <p>
            <strong>You acknowledge and irrevocably agree that the Platform retains final, 
            absolute, and non-appealable authority</strong> in determining:
          </p>
          <ul>
            <li>Whether a booking was missed or properly responded to</li>
            <li>Accuracy of availability scores and performance metrics</li>
            <li>Appropriateness of visibility adjustments and ranking changes</li>
            <li>Application of penalties, suspensions, or terminations</li>
            <li>Interpretation of policy violations</li>
            <li>Resolution of disputes between therapists and customers</li>
            <li>Any other matter related to Platform operations and these Terms</li>
          </ul>

          <h3>6.2 Evidentiary Standard</h3>
          <p>
            <strong>Decisions based on the following shall be considered final and conclusive:</strong>
          </p>
          <ol>
            <li>
              <strong>System Logs:</strong> Platform database records, timestamps, and API logs
            </li>
            <li>
              <strong>Automated Metrics:</strong> Response times, acceptance rates, score calculations
            </li>
            <li>
              <strong>Notification Delivery Records:</strong> Push notification sent timestamps and delivery confirmations
            </li>
            <li>
              <strong>User Action Timestamps:</strong> Login times, page views, button clicks
            </li>
            <li>
              <strong>Platform Analytics:</strong> Aggregate data showing therapist performance patterns
            </li>
            <li>
              <strong>Customer Reports:</strong> Verified customer complaints or feedback
            </li>
            <li>
              <strong>In-Platform Messages:</strong> All communication logs within the Platform chat system
            </li>
          </ol>

          <h3>6.3 Limited Appeal Rights</h3>
          <p>
            You may appeal a penalty or termination decision <strong>ONLY</strong> if you can provide:
          </p>
          <ul>
            <li><strong>Clear and convincing evidence</strong> of a Platform system error (e.g., server logs showing notification failure on Platform's end)</li>
            <li><strong>Technical documentation</strong> proving Platform malfunction beyond reasonable doubt</li>
            <li><strong>Third-party verification</strong> of extraordinary circumstances (medical emergency, natural disaster, etc.)</li>
          </ul>
          <p>
            <strong>The following are NOT valid grounds for appeal:</strong>
          </p>
          <ul>
            <li>"I didn't see the notification" (Your responsibility per Section 2)</li>
            <li>"My phone was on silent" (Your responsibility per Section 2)</li>
            <li>"I was busy with another customer" (Manage availability status accordingly)</li>
            <li>"The notification came too fast" (5 minutes is reasonable industry standard)</li>
            <li>"This is unfair" (Subjective opinion; policy applies equally to all)</li>
            <li>"I disagree with the score" (Scores are objective algorithmic calculations)</li>
          </ul>

          <h3>6.4 No Obligation to Provide Service</h3>
          <p>
            <strong>You acknowledge that:</strong>
          </p>
          <ul>
            <li>The Platform operates as a <strong>marketplace</strong>, not an employer</li>
            <li>The Platform has <strong>no obligation</strong> to provide you with bookings</li>
            <li>You are an <strong>independent contractor</strong>, not an employee or agent</li>
            <li>The Platform may <strong>terminate your account at any time</strong> for any reason or no reason, with or without notice</li>
            <li>These Terms do not create any partnership, joint venture, or employment relationship</li>
          </ul>

          <h3>6.5 Waiver of Legal Claims</h3>
          <p>
            <strong>By accepting these Terms, you waive any right to:</strong>
          </p>
          <ul>
            <li>Sue the Platform for enforcement of these policies</li>
            <li>Claim lost income due to visibility reduction or suspension</li>
            <li>Demand restoration of account or data after termination</li>
            <li>Challenge the Platform's scoring algorithms or enforcement decisions</li>
            <li>Seek injunctive relief to prevent account suspension or termination</li>
          </ul>

          <div className="legal-notice">
            <strong>⚖️ BINDING AGREEMENT:</strong> This section establishes the Platform's 
            authority to enforce all policies in these Terms. By continuing to use the Platform, 
            you acknowledge that you have read, understood, and voluntarily agreed to be bound 
            by these provisions.
          </div>
        </section>

        <section className="terms-section">
          <div className="section-number">7</div>
          <h2>Additional Terms</h2>
          
          <h3>7.1 Modification of Terms</h3>
          <p>
            The Platform reserves the right to modify these Terms at any time. You will be 
            notified of material changes via email or in-app notification. Continued use of 
            the Platform after modification constitutes acceptance of the updated Terms.
          </p>

          <h3>7.2 Severability</h3>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that 
            provision shall be limited or eliminated to the minimum extent necessary, and 
            the remaining provisions shall remain in full force and effect.
          </p>

          <h3>7.3 Governing Law</h3>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of 
            the Republic of Indonesia, without regard to conflict of law principles.
          </p>

          <h3>7.4 Dispute Resolution</h3>
          <p>
            Any dispute arising from these Terms shall be resolved through binding arbitration 
            in Bali, Indonesia, in accordance with the rules of the Indonesian National Board 
            of Arbitration (BANI).
          </p>

          <h3>7.5 Entire Agreement</h3>
          <p>
            These Terms, together with the Platform's Privacy Policy and General Terms of Service, 
            constitute the entire agreement between you and the Platform regarding your use of 
            the Platform as a therapist.
          </p>
        </section>

        <section className="terms-acceptance">
          <h2>Acceptance & Acknowledgment</h2>
          <p>
            By clicking "I Accept" or "Register" or by using the Platform as a therapist, you 
            acknowledge that:
          </p>
          <ul>
            <li>✅ You have read and understood these Therapist Terms & Conditions in their entirety</li>
            <li>✅ You agree to be legally bound by all provisions</li>
            <li>✅ You understand the penalties for missed bookings and policy violations</li>
            <li>✅ You accept the Platform's authority to enforce these Terms</li>
            <li>✅ You waive any rights that conflict with these Terms</li>
            <li>✅ You understand this is a legally binding contract</li>
          </ul>
          
          <div className="signature-section">
            <p><strong>IndaStreet Platform</strong></p>
            <p>Effective Date: January 1, 2026</p>
            <p>Version 2.0 - Includes Platform-Only Communication & Availability Scoring</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TherapistTermsAndConditions;
