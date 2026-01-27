// @ts-ignore - services may not be fully implemented
import { translationService, chatTranslationService } from '../lib/appwriteService';

export const useChatTranslation = () => {
    const translate = async (text: string, targetLang: string, sourceLang: string) => {
        try {
            const result = await translationService.translate(text, targetLang, sourceLang);
            return result.translatedText;
        } catch (error) {
            console.error('Translation error:', error);
            return text; // Return original if translation fails
        }
    };

    const translateChatMessage = async (
        message: string,
        from: string,
        to: string
    ): Promise<{ original: string; translated: string }> => {
        if (from === to) {
            return { original: message, translated: message };
        }

        const translated = await translate(message, to, from);
        return { original: message, translated };
    };

    const getTranslations = (key: string, lang: 'en' | 'id'): string => {
        const translations: Record<string, Record<'en' | 'id', string>> = {
            scheduleYourMassage: {
                en: 'Schedule Your Massage',
                id: 'Jadwalkan Pijat Anda'
            },
            selectDuration: {
                en: 'Select Duration',
                id: 'Pilih Durasi'
            },
            selectTime: {
                en: 'Select Time',
                id: 'Pilih Waktu'
            },
            yourName: {
                en: 'Your Name',
                id: 'Nama Anda'
            },
            whatsappNumber: {
                en: 'WhatsApp Number',
                id: 'Nomor WhatsApp'
            },
            location: {
                en: 'Your Location',
                id: 'Lokasi Anda'
            },
            activateChat: {
                en: 'Activate Chat',
                id: 'Aktifkan Chat'
            },
            createBooking: {
                en: 'Create Booking',
                id: 'Buat Booking'
            },
            enterName: {
                en: 'Enter your name',
                id: 'Masukkan nama Anda'
            },
            enterWhatsApp: {
                en: 'Enter WhatsApp number (628xxx)',
                id: 'Masukkan nomor WhatsApp (628xxx)'
            },
            enterLocation: {
                en: 'Enter your address',
                id: 'Masukkan alamat Anda'
            }
        };

        return translations[key]?.[lang] || key;
    };

    return {
        translate,
        translateChatMessage,
        getTranslations
    };
};
