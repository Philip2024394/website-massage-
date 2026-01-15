/**
 * Transactional Email Service - PLATFORM PROTECTION
 * 
 * PURPOSE: Send booking notifications via email WITHOUT exposing customer contact details
 * 
 * FEATURES:
 * - Therapist gets email notification about booking
 * - NO customer phone, email, or external contact info shared
 * - All responses must happen through platform
 * - Booking link directs to platform only
 * - Protects commission by preventing bypass
 */

import { Client, Account } from 'appwrite';

interface BookingEmailData {
  therapistEmail: string;
  therapistName: string;
  bookingId: string;
  serviceName: string;
  date: string;
  time: string;
  duration: string;
  price: string;
  customerInitials: string; // e.g., "J.S." instead of full name
  expiresAt: string; // ISO timestamp
}

export class TransactionalEmailService {
  
  /**
   * Send booking notification email to therapist
   * NOTE: Uses Appwrite's email system for transactional emails
   */
  static async sendBookingNotification(data: BookingEmailData): Promise<boolean> {
    try {
      // In production, this would use Appwrite's email service or external provider like SendGrid
      // For now, we'll structure the email content
      
      const emailContent = this.generateBookingEmailHTML(data);
      
      // TODO: Integrate with actual email service
      // await sendEmail({
      //   to: data.therapistEmail,
      //   subject: '🔴 URGENT: New Booking Request - Respond Within 5 Minutes',
      //   html: emailContent
      // });
      
      console.log(`📧 Booking notification email prepared for ${data.therapistEmail}`);
      console.log('Email content:', emailContent);
      
      return true;
    } catch (error) {
      console.error('Failed to send booking notification email:', error);
      return false;
    }
  }

  /**
   * Generate HTML email template
   */
  private static generateBookingEmailHTML(data: BookingEmailData): string {
    const expiryTime = new Date(data.expiresAt);
    const now = new Date();
    const minutesLeft = Math.ceil((expiryTime.getTime() - now.getTime()) / 60000);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Booking Request</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
      font-weight: 900;
      text-transform: uppercase;
    }
    .urgency-timer {
      background: rgba(255,255,255,0.2);
      padding: 15px;
      border-radius: 50px;
      margin-top: 15px;
      font-size: 28px;
      font-weight: 900;
      letter-spacing: 2px;
    }
    .content {
      padding: 30px;
    }
    .warning-box {
      background: #fef3c7;
      border: 2px solid #f59e0b;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }
    .warning-box strong {
      color: #92400e;
      display: block;
      margin-bottom: 5px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 12px;
      margin-bottom: 8px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .detail-row.highlight {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      font-weight: 700;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 50px;
      font-weight: 700;
      font-size: 18px;
      text-align: center;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    .platform-notice {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      margin-top: 20px;
      font-size: 14px;
      color: #6b7280;
    }
    .platform-notice strong {
      color: #1f2937;
      display: block;
      margin-bottom: 5px;
    }
    .footer {
      background: #1f2937;
      color: #9ca3af;
      padding: 20px;
      text-align: center;
      font-size: 12px;
    }
    @media (max-width: 600px) {
      body {
        padding: 10px;
      }
      .content {
        padding: 20px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔴 URGENT: New Booking Request</h1>
      <div class="urgency-timer">
        ⏰ ${minutesLeft} Minutes Left
      </div>
    </div>

    <div class="content">
      <div class="warning-box">
        <strong>⚠️ Action Required Within 5 Minutes</strong>
        Your availability score will be impacted if you don't respond in time.
        <br><strong>Miss deadline: -10 points | Accept on time: +5 points</strong>
      </div>

      <h2>Booking Details</h2>
      
      <div class="detail-row">
        <span><strong>Customer:</strong></span>
        <span>${data.customerInitials}</span>
      </div>
      
      <div class="detail-row">
        <span><strong>Service:</strong></span>
        <span>${data.serviceName}</span>
      </div>
      
      <div class="detail-row">
        <span><strong>Date:</strong></span>
        <span>${data.date}</span>
      </div>
      
      <div class="detail-row">
        <span><strong>Time:</strong></span>
        <span>${data.time}</span>
      </div>
      
      <div class="detail-row">
        <span><strong>Duration:</strong></span>
        <span>${data.duration}</span>
      </div>
      
      <div class="detail-row highlight">
        <span><strong>Your Earnings:</strong></span>
        <span>${data.price}</span>
      </div>

      <center>
        <a href="https://indastreet.com/?page=therapist-dashboard&forceBookingView=${data.bookingId}" class="cta-button">
          ✅ ACCEPT BOOKING NOW
        </a>
      </center>

      <div class="platform-notice">
        <strong>🔒 Platform-Only Communication</strong>
        All communication with customers must happen through the IndaStreet platform.
        Customer contact details are NOT shared to protect your commission.
        <br><br>
        <strong>💰 Why?</strong> This ensures you receive your full commission for every booking.
      </div>
    </div>

    <div class="footer">
      <p>
        <strong>IndaStreet</strong> - Professional Massage Booking Platform
        <br>
        This email was sent to ${data.therapistEmail}
        <br>
        <a href="https://indastreet.com/therapist/settings" style="color: #60a5fa;">Email Preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * Send booking accepted confirmation to therapist
   */
  static async sendBookingAcceptedEmail(data: {
    therapistEmail: string;
    therapistName: string;
    bookingId: string;
    serviceName: string;
    date: string;
    time: string;
    customerInitials: string;
  }): Promise<boolean> {
    try {
      const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .success-icon {
      font-size: 64px;
      text-align: center;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Booking Accepted!</h1>
    </div>
    <div class="content">
      <div class="success-icon">🎉</div>
      <h2>Great job, ${data.therapistName}!</h2>
      <p>
        You have successfully accepted the booking for customer <strong>${data.customerInitials}</strong>.
      </p>
      <p>
        <strong>Service:</strong> ${data.serviceName}<br>
        <strong>Date & Time:</strong> ${data.date} at ${data.time}
      </p>
      <p>
        <strong>Next Steps:</strong>
      </p>
      <ul>
        <li>Check the platform for any customer messages</li>
        <li>Prepare for the appointment</li>
        <li>Confirm arrival time through platform chat</li>
      </ul>
      <p>
        <strong>💡 Tip:</strong> Responding quickly improves your availability score and search ranking!
      </p>
      <center>
        <a href="https://indastreet.com/?page=therapist-dashboard" style="display: inline-block; background: #10b981; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; margin: 20px 0;">
          View Dashboard
        </a>
      </center>
    </div>
  </div>
</body>
</html>
      `.trim();

      // TODO: Send actual email
      console.log(`📧 Booking accepted email prepared for ${data.therapistEmail}`);
      
      return true;
    } catch (error) {
      console.error('Failed to send booking accepted email:', error);
      return false;
    }
  }

  /**
   * Send booking expired notification
   */
  static async sendBookingExpiredEmail(data: {
    therapistEmail: string;
    therapistName: string;
    bookingId: string;
    scoreImpact: number;
  }): Promise<boolean> {
    try {
      const emailContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    .content {
      padding: 30px;
    }
    .warning-icon {
      font-size: 64px;
      text-align: center;
      margin: 20px 0;
    }
    .penalty-box {
      background: #fee2e2;
      border: 2px solid #dc2626;
      border-radius: 8px;
      padding: 15px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⏰ Booking Request Expired</h1>
    </div>
    <div class="content">
      <div class="warning-icon">😞</div>
      <h2>Missed Opportunity</h2>
      <p>
        Hi ${data.therapistName},
      </p>
      <p>
        A booking request (ID: ${data.bookingId}) expired because there was no response within 5 minutes.
      </p>
      <div class="penalty-box">
        <strong>Availability Score Impact: ${penalty} points</strong>
        <br>
        Missing bookings reduces your visibility in search results.
      </div>
      <p>
        <strong>💡 Tips to Avoid This:</strong>
      </p>
      <ul>
        <li>Enable push notifications on your device</li>
        <li>Keep the IndaStreet dashboard open during work hours</li>
        <li>Set notification sounds to maximum volume</li>
        <li>Check the platform regularly</li>
      </ul>
      <p>
        Don't worry - you can improve your score by responding quickly to future bookings!
      </p>
      <center>
        <a href="https://indastreet.com/?page=therapist-dashboard" style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; margin: 20px 0;">
          View Dashboard
        </a>
      </center>
    </div>
  </div>
</body>
</html>
      `.trim();

      // TODO: Send actual email
      console.log(`📧 Booking expired email prepared for ${data.therapistEmail}`);
      
      return true;
    } catch (error) {
      console.error('Failed to send booking expired email:', error);
      return false;
    }
  }
}

/**
 * Email Configuration
 * 
 * For production deployment, integrate with:
 * - Appwrite Email Service (built-in)
 * - SendGrid (transactional emails)
 * - AWS SES (cost-effective)
 * - Mailgun (developer-friendly)
 * 
 * Environment variables needed:
 * - EMAIL_SERVICE_API_KEY
 * - EMAIL_FROM_ADDRESS (e.g., bookings@indastreet.com)
 * - EMAIL_FROM_NAME (e.g., "IndaStreet Bookings")
 */
