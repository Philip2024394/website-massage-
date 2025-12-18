/**
 * WhatsApp Messaging Service
 * Professional system for sending WhatsApp messages to providers when bookings are made
 * Includes automatic language translation and message templates
 */

import { translateText } from './translationService';

export interface WhatsAppMessage {
    to: string; // Phone number
    message: string;
    language: 'en' | 'id';
    bookingDetails?: {
        customerName: string;
        service: string;
        datetime: string;
        duration: string;
        location?: string;
    };
}

export interface WhatsAppResponse {
    success: boolean;
    messageId?: string;
    error?: string;
}

/**
 * WhatsApp Service Class
 * Handles sending WhatsApp messages with automatic translation
 */
export class WhatsAppService {
    private apiEndpoint: string;
    private apiKey: string;

    constructor() {
        // In production, these would come from environment variables
        this.apiEndpoint = process.env.NEXT_PUBLIC_WHATSAPP_API_ENDPOINT || 'https://api.whatsapp.business/v1/messages';
        this.apiKey = process.env.NEXT_PUBLIC_WHATSAPP_API_KEY || 'demo-key';
    }

    /**
     * Format WhatsApp number to international format
     */
    private formatPhoneNumber(phoneNumber: string): string {
        // Remove all non-digit characters
        let cleaned = phoneNumber.replace(/\D/g, '');
        
        // Add country code if missing (Indonesia +62)
        if (cleaned.startsWith('0')) {
            cleaned = '62' + cleaned.substring(1);
        } else if (!cleaned.startsWith('62')) {
            cleaned = '62' + cleaned;
        }
        
        return '+' + cleaned;
    }

    /**
     * Generate booking message template
     */
    private async generateBookingMessage(
        bookingDetails: WhatsAppMessage['bookingDetails'],
        targetLanguage: 'en' | 'id',
        customerLanguage: 'en' | 'id'
    ): Promise<string> {
        const templates = {
            en: `🎉 NEW BOOKING REQUEST!

👤 Customer: {customerName}
💆 Service: {service}
📅 Date & Time: {datetime}
⏱️ Duration: {duration}
📍 Location: {location}

💬 A chat window has been opened for direct communication with your customer.

⚠️ **IMPORTANT - RESPONSE REQUIRED WITHIN 10 MINUTES**
• ⏰ You have 10 minutes to respond to this booking
• 🚨 No response = Automatic penalties:
  - ⭐ 1-star review added to your profile
  - 🪙 200 coins deducted from account
  - 📢 Warning issued for terms violation
• 🔄 Booking will be sent to nearby therapists
• 💼 Repeated violations = Account deactivation WITHOUT notice

✅ Please respond immediately to avoid penalties.
📱 Open IndaStreet app now to accept this booking.

👨‍💼 - Admin Team IndaStreet`,

            id: `🎉 PERMINTAAN BOOKING BARU!

👤 Pelanggan: {customerName}
💆 Layanan: {service}
📅 Tanggal & Waktu: {datetime}
⏱️ Durasi: {duration}
📍 Lokasi: {location}

💬 Jendela chat telah dibuka untuk komunikasi langsung dengan pelanggan Anda.

⚠️ **PENTING - RESPON DIPERLUKAN DALAM 10 MENIT**
• ⏰ Anda punya 10 menit untuk merespon booking ini
• 🚨 Tidak ada respon = Penalti otomatis:
  - ⭐ Review 1 bintang ditambahkan ke profil Anda
  - 🪙 200 koin dikurangi dari akun
  - 📢 Peringatan diberikan untuk pelanggaran syarat
• 🔄 Booking akan dikirim ke terapis terdekat
• 💼 Pelanggaran berulang = Akun dinonaktifkan TANPA pemberitahuan

✅ Harap respon segera untuk menghindari penalti.
📱 Buka aplikasi IndaStreet sekarang untuk menerima booking ini.

👨‍💼 - Tim Admin IndaStreet`
        };

        let message = templates[targetLanguage];

        // Replace placeholders with actual data
        if (bookingDetails) {
            message = message
                .replace('{customerName}', bookingDetails.customerName)
                .replace('{service}', bookingDetails.service)
                .replace('{datetime}', bookingDetails.datetime)
                .replace('{duration}', bookingDetails.duration)
                .replace('{location}', bookingDetails.location || 'Customer Location');
        }

        // If languages don't match, add translated version
        if (customerLanguage !== targetLanguage) {
            try {
                const translatedService = await translateText(bookingDetails?.service || '', customerLanguage, targetLanguage);
                message = message.replace(bookingDetails?.service || '', `${bookingDetails?.service} (${translatedService})`);
            } catch (error) {
                console.warn('Translation failed, using original text:', error);
            }
        }

        return message;
    }

    /**
     * Send WhatsApp message to provider about new booking
     */
    async sendBookingNotification(
        providerPhone: string,
        providerLanguage: 'en' | 'id',
        customerLanguage: 'en' | 'id',
        bookingDetails: WhatsAppMessage['bookingDetails']
    ): Promise<WhatsAppResponse> {
        try {
            const formattedNumber = this.formatPhoneNumber(providerPhone);
            const message = await this.generateBookingMessage(bookingDetails, providerLanguage, customerLanguage);

            console.log('📱 Sending WhatsApp message to:', formattedNumber);
            console.log('📝 Message:', message);

            // In development/demo mode, we'll simulate the API call
            if (this.apiKey === 'demo-key') {
                console.log('🔧 DEMO MODE: WhatsApp message simulated');
                console.log('📱 To:', formattedNumber);
                console.log('📝 Message:', message);
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500));
                
                return {
                    success: true,
                    messageId: `demo_${Date.now()}`
                };
            }

            // Real WhatsApp API call
            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    to: formattedNumber,
                    type: 'text',
                    text: {
                        body: message
                    }
                })
            });

            const result = await response.json();

            if (response.ok) {
                console.log('✅ WhatsApp message sent successfully:', result);
                return {
                    success: true,
                    messageId: result.messages?.[0]?.id
                };
            } else {
                console.error('❌ WhatsApp API error:', result);
                return {
                    success: false,
                    error: result.error?.message || 'Failed to send message'
                };
            }

        } catch (error) {
            console.error('❌ WhatsApp service error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Send urgent reminder to provider
     */
    async sendBookingReminder(
        providerPhone: string,
        providerLanguage: 'en' | 'id',
        customerName: string,
        minutesLeft: number
    ): Promise<WhatsAppResponse> {
        try {
            const formattedNumber = this.formatPhoneNumber(providerPhone);
            
            const templates = {
                en: `⏰ URGENT BOOKING REMINDER!

👤 Customer ${customerName} is still waiting for your response.

⏱️ Only ${minutesLeft} minutes left to confirm!

Please check your IndaStreet chat window immediately.

💼 Don't miss this opportunity!`,

                id: `⏰ PENGINGAT BOOKING MENDESAK!

👤 Pelanggan ${customerName} masih menunggu respon Anda.

⏱️ Hanya tersisa ${minutesLeft} menit untuk konfirmasi!

Silakan cek jendela chat IndaStreet Anda segera.

💼 Jangan lewatkan kesempatan ini!`
            };

            const message = templates[providerLanguage];

            console.log('📱 Sending WhatsApp reminder to:', formattedNumber);

            if (this.apiKey === 'demo-key') {
                console.log('🔧 DEMO MODE: WhatsApp reminder simulated');
                console.log('📝 Message:', message);
                return {
                    success: true,
                    messageId: `demo_reminder_${Date.now()}`
                };
            }

            const response = await fetch(this.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    to: formattedNumber,
                    type: 'text',
                    text: {
                        body: message
                    }
                })
            });

            const result = await response.json();

            if (response.ok) {
                return {
                    success: true,
                    messageId: result.messages?.[0]?.id
                };
            } else {
                return {
                    success: false,
                    error: result.error?.message || 'Failed to send reminder'
                };
            }

        } catch (error) {
            console.error('❌ WhatsApp reminder error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Open WhatsApp with pre-filled message (fallback method)
     */
    openWhatsAppChat(phoneNumber: string, message: string): void {
        const formattedNumber = this.formatPhoneNumber(phoneNumber);
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/${formattedNumber.replace('+', '')}?text=${encodedMessage}`;
        
        console.log('🔗 Opening WhatsApp URL:', whatsappUrl);
        window.open(whatsappUrl, '_blank');
    }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();

/**
 * Helper function to get provider's WhatsApp number
 */
export function getProviderWhatsApp(provider: any, providerType: 'therapist' | 'place'): string {
    if (providerType === 'therapist') {
        return provider.whatsappNumber || provider.whatsapp || provider.phone || '';
    } else {
        return provider.whatsappNumber || provider.whatsapp || provider.contactNumber || provider.phone || '';
    }
}

/**
 * Helper function to get provider's preferred language
 */
export function getProviderLanguage(provider: any): 'en' | 'id' {
    return provider.language || provider.preferredLanguage || 'id'; // Default to Indonesian
}