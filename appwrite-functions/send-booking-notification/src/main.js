/**
 * Appwrite Function: Send WhatsApp Booking Notification
 * 
 * This function sends WhatsApp notifications to therapists when a guest books a massage.
 * The guest never sees the WhatsApp message - they only see a booking confirmation.
 * 
 * Prerequisites:
 * 1. Twilio Account (https://www.twilio.com/whatsapp)
 * 2. Set these environment variables in Appwrite:
 *    - TWILIO_ACCOUNT_SID
 *    - TWILIO_AUTH_TOKEN
 *    - TWILIO_WHATSAPP_NUMBER (e.g., whatsapp:+14155238886)
 * 
 * Alternative: Use other WhatsApp API providers:
 * - MessageBird: https://messagebird.com
 * - 360dialog: https://www.360dialog.com
 * - WATI: https://www.wati.io
 */

import { Client } from 'node-appwrite';

export default async ({ req, res, log, error }) => {
  try {
    // Parse request body
    const body = JSON.parse(req.body || '{}');
    
    const {
      to,
      hotelName,
      hotelLocation,
      guestName,
      roomNumber,
      bookingTime,
      bookingId,
      duration,
      price,
      therapistName,
      notice
    } = body;

    // Validate required fields
    if (!to || !guestName || !roomNumber) {
      return res.json({
        success: false,
        error: 'Missing required fields'
      }, 400);
    }

    // Format WhatsApp message
    const message = `
🏨 *NEW BOOKING ALERT*

📍 Hotel: ${hotelName}
📌 Location: ${hotelLocation}

👤 Guest Name: ${guestName}
🚪 Room Number: ${roomNumber}
🆔 Booking ID: ${bookingId}
⏰ Booking Time: ${bookingTime}

💆 Service Details:
• Duration: ${duration} minutes
• Price: Rp ${price.toLocaleString()}

${notice}

Please confirm your availability and update status to "On The Way" in your app.
    `.trim();

    log(`Sending WhatsApp to: ${to}`);
    log(`Message: ${message}`);

    // Send WhatsApp via Twilio
    const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
    const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
    const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

    if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
      error('Twilio credentials not configured');
      // Don't fail the booking - log error and continue
      return res.json({
        success: false,
        error: 'WhatsApp service not configured',
        bookingCreated: true
      });
    }

    // Make request to Twilio
    const auth = Buffer.from(`${twilioAccountSid}:${twilioAuthToken}`).toString('base64');
    
    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioWhatsAppNumber,
          To: `whatsapp:${to}`,
          Body: message
        })
      }
    );

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      error(`Twilio error: ${JSON.stringify(twilioData)}`);
      return res.json({
        success: false,
        error: 'Failed to send WhatsApp message',
        details: twilioData,
        bookingCreated: true
      });
    }

    log(`WhatsApp sent successfully! SID: ${twilioData.sid}`);

    // Return success
    return res.json({
      success: true,
      messageSid: twilioData.sid,
      bookingId: bookingId
    });

  } catch (err) {
    error(`Error: ${err.message}`);
    return res.json({
      success: false,
      error: err.message,
      bookingCreated: true // Still confirm booking to guest
    }, 500);
  }
};
