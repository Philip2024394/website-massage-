/**
 * 🌍 ELITE CHAT TRANSLATION MODULE
 * 
 * Multi-language support for chat messages with:
 * - Automatic language detection
 * - Browser-based translation (Chrome 90+)
 * - Pre-translated system messages
 * - Translation caching (avoid repeated API calls)
 * - Fallback to original text if translation fails
 * 
 * @module chatTranslation
 */

import { logger } from './logger';
import * as storage from './storageHelper';

export interface TranslationConfig {
  userLanguage: string; // 'en', 'id', 'zh', 'ja', 'ko', etc.
  autoTranslate: boolean;
  showOriginal: boolean; // Show "Translated from English" indicator
  translationProvider: 'browser' | 'fallback';
}

export interface TranslatedMessage {
  originalText: string;
  translatedText: string;
  originalLanguage: string;
  targetLanguage: string;
  translatedAt: Date;
  provider: string;
  cached: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string; // Unicode flag emoji
  rtl?: boolean; // Right-to-left languages
}

/**
 * Supported languages with flags
 */
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' }
];

/**
 * Get language by code
 */
export function getLanguage(code: string): LanguageOption | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Detect language of text using heuristics
 */
export function detectLanguage(text: string): string {
  // Japanese (Hiragana, Katakana, Kanji)
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/.test(text)) {
    return 'ja';
  }
  
  // Korean (Hangul)
  if (/[\uAC00-\uD7AF]/.test(text)) {
    return 'ko';
  }
  
  // Chinese (CJK Unified Ideographs)
  if (/[\u4E00-\u9FFF]/.test(text)) {
    return 'zh';
  }
  
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ar';
  }
  
  // Thai
  if (/[\u0E00-\u0E7F]/.test(text)) {
    return 'th';
  }
  
  // Vietnamese (with diacritics)
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
    return 'vi';
  }
  
  // English (default for Latin alphabet)
  if (/[a-zA-Z]/.test(text)) {
    return 'en';
  }
  
  // Default to Indonesian for unknown
  return 'id';
}

/**
 * Translate text using browser Translation API (Chrome 90+, Edge 91+)
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslatedMessage> {
  const detected = sourceLanguage || detectLanguage(text);
  
  // If same language, no translation needed
  if (detected === targetLanguage) {
    return {
      originalText: text,
      translatedText: text,
      originalLanguage: detected,
      targetLanguage,
      translatedAt: new Date(),
      provider: 'none',
      cached: false
    };
  }

  // Check cache first
  const cacheKey = `translation_${detected}_${targetLanguage}_${hashString(text)}`;
  const cached = storage.getItem<string>(cacheKey);
  if (cached.success && cached.data) {
    logger.info('🌍 Using cached translation', { from: detected, to: targetLanguage });
    return {
      originalText: text,
      translatedText: cached.data,
      originalLanguage: detected,
      targetLanguage,
      translatedAt: new Date(),
      provider: 'cache',
      cached: true
    };
  }

  try {
    // Browser Translation API (Chrome 90+)
    if ('translation' in navigator) {
      const translator = await (navigator as any).translation.createTranslator({
        sourceLanguage: detected,
        targetLanguage
      });
      const translated = await translator.translate(text);
      
      // Cache translation (expire in 7 days)
      storage.setItemWithExpiry(cacheKey, translated, 7 * 24 * 60 * 60 * 1000);
      
      logger.info('🌍 Translation success (browser)', { from: detected, to: targetLanguage });
      
      return {
        originalText: text,
        translatedText: translated,
        originalLanguage: detected,
        targetLanguage,
        translatedAt: new Date(),
        provider: 'browser',
        cached: false
      };
    }

    // Fallback: Google Translate API (if API key configured)
    // This would require backend integration
    
    logger.warn('⚠️ Translation API not available, showing original', { text: text.substring(0, 50) });
    
    // Fallback: Return original text
    return {
      originalText: text,
      translatedText: text,
      originalLanguage: detected,
      targetLanguage,
      translatedAt: new Date(),
      provider: 'fallback',
      cached: false
    };
    
  } catch (error) {
    logger.error('❌ Translation failed', { error, from: detected, to: targetLanguage });
    
    // Return original on error
    return {
      originalText: text,
      translatedText: text,
      originalLanguage: detected,
      targetLanguage,
      translatedAt: new Date(),
      provider: 'error',
      cached: false
    };
  }
}

/**
 * Simple string hash for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Pre-translated system messages (for common booking events)
 */
const SYSTEM_MESSAGES: Record<string, Record<string, string>> = {
  'booking_created': {
    en: 'Chat started for booking #{bookingId}. Your therapist will provide updates and coordinate arrival.',
    id: 'Chat dimulai untuk pemesanan #{bookingId}. Terapis Anda akan memberikan update dan mengkoordinasikan kedatangan.',
    zh: '预订 #{bookingId} 的聊天已开始。您的治疗师将提供更新并协调到达时间。',
    ja: '予約 #{bookingId} のチャットが開始されました。セラピストが更新情報を提供し、到着を調整します。',
    ko: '예약 #{bookingId}에 대한 채팅이 시작되었습니다. 테라피스트가 업데이트를 제공하고 도착을 조정합니다.',
    es: 'Chat iniciado para la reserva #{bookingId}. Su terapeuta proporcionará actualizaciones y coordinará la llegada.',
    fr: 'Chat démarré pour la réservation #{bookingId}. Votre thérapeute fournira des mises à jour et coordonnera l\'arrivée.',
    de: 'Chat für Buchung #{bookingId} gestartet. Ihr Therapeut wird Updates bereitstellen und die Ankunft koordinieren.',
    it: 'Chat avviata per la prenotazione #{bookingId}. Il tuo terapista fornirà aggiornamenti e coordinerà l\'arrivo.',
    ru: 'Чат начат для бронирования #{bookingId}. Ваш терапевт предоставит обновления и согласует прибытие.',
    th: 'เริ่มแชทสำหรับการจอง #{bookingId} นักบำบัดของคุณจะให้ข้อมูลและประสานงานการมาถึง',
    vi: 'Đã bắt đầu trò chuyện cho đặt chỗ #{bookingId}. Nhà trị liệu của bạn sẽ cung cấp thông tin và phối hợp lịch đến.',
    ar: 'بدأت المحادثة للحجز #{bookingId}. سيقدم معالجك التحديثات وينسق الوصول.',
    pt: 'Chat iniciado para a reserva #{bookingId}. Seu terapeuta fornecerá atualizações e coordenará a chegada.',
    nl: 'Chat gestart voor boeking #{bookingId}. Uw therapeut zal updates geven en de aankomst coördineren.'
  },
  'booking_confirmed': {
    en: 'Booking confirmed! Your therapist will coordinate arrival time and any special instructions.',
    id: 'Pemesanan dikonfirmasi! Terapis Anda akan mengkoordinasikan waktu kedatangan dan instruksi khusus.',
    zh: '预订已确认！您的治疗师将协调到达时间和任何特殊说明。',
    ja: '予約が確認されました！セラピストが到着時間と特別な指示を調整します。',
    ko: '예약이 확인되었습니다! 테라피스트가 도착 시간과 특별 지시사항을 조정합니다.',
    es: '¡Reserva confirmada! Su terapeuta coordinará la hora de llegada e instrucciones especiales.',
    fr: 'Réservation confirmée ! Votre thérapeute coordonnera l\'heure d\'arrivée et les instructions spéciales.',
    de: 'Buchung bestätigt! Ihr Therapeut wird die Ankunftszeit und besondere Anweisungen koordinieren.',
    it: 'Prenotazione confermata! Il tuo terapista coordinerà l\'orario di arrivo e le istruzioni speciali.',
    ru: 'Бронирование подтверждено! Ваш терапевт согласует время прибытия и любые специальные инструкции.',
    th: 'ยืนยันการจองแล้ว! นักบำบัดของคุณจะประสานงานเวลามาถึงและคำแนะนำพิเศษ',
    vi: 'Đặt chỗ đã được xác nhận! Nhà trị liệu của bạn sẽ phối hợp thời gian đến và các hướng dẫn đặc biệt.',
    ar: 'تم تأكيد الحجز! سينسق معالجك وقت الوصول وأي تعليمات خاصة.',
    pt: 'Reserva confirmada! Seu terapeuta coordenará o horário de chegada e instruções especiais.',
    nl: 'Boeking bevestigd! Uw therapeut zal de aankomsttijd en speciale instructies coördineren.'
  },
  'booking_cancelled': {
    en: 'Booking cancelled. Thank you for using our service.',
    id: 'Pemesanan dibatalkan. Terima kasih telah menggunakan layanan kami.',
    zh: '预订已取消。感谢您使用我们的服务。',
    ja: '予約がキャンセルされました。ご利用ありがとうございました。',
    ko: '예약이 취소되었습니다. 서비스를 이용해 주셔서 감사합니다.',
    es: 'Reserva cancelada. Gracias por usar nuestro servicio.',
    fr: 'Réservation annulée. Merci d\'avoir utilisé notre service.',
    de: 'Buchung storniert. Vielen Dank für die Nutzung unseres Service.',
    it: 'Prenotazione cancellata. Grazie per aver utilizzato il nostro servizio.',
    ru: 'Бронирование отменено. Спасибо за использование нашего сервиса.',
    th: 'ยกเลิกการจองแล้ว ขอบคุณที่ใช้บริการของเรา',
    vi: 'Đặt chỗ đã bị hủy. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.',
    ar: 'تم إلغاء الحجز. شكرا لاستخدام خدمتنا.',
    pt: 'Reserva cancelada. Obrigado por usar nosso serviço.',
    nl: 'Boeking geannuleerd. Bedankt voor het gebruiken van onze service.'
  },
  'therapist_on_way': {
    en: 'Therapist is on the way! ETA: {eta} minutes.',
    id: 'Terapis sedang dalam perjalanan! Perkiraan tiba: {eta} menit.',
    zh: '治疗师正在路上！预计到达时间：{eta}分钟。',
    ja: 'セラピストが向かっています！到着予定：{eta}分。',
    ko: '테라피스트가 가는 중입니다! 도착 예정 시간: {eta}분.',
    es: '¡El terapeuta está en camino! ETA: {eta} minutos.',
    fr: 'Le thérapeute est en route ! ETA : {eta} minutes.',
    de: 'Therapeut ist unterwegs! ETA: {eta} Minuten.',
    it: 'Il terapista è in arrivo! ETA: {eta} minuti.',
    ru: 'Терапевт в пути! Прибытие через {eta} минут.',
    th: 'นักบำบัดกำลังเดินทาง! เวลาโดยประมาณ: {eta} นาที',
    vi: 'Nhà trị liệu đang trên đường đến! Thời gian dự kiến: {eta} phút.',
    ar: 'المعالج في الطريق! الوقت المتوقع: {eta} دقيقة.',
    pt: 'Terapeuta a caminho! ETA: {eta} minutos.',
    nl: 'Therapeut is onderweg! ETA: {eta} minuten.'
  },
  'chat_ended': {
    en: 'Chat session ended. Thank you for using our service!',
    id: 'Sesi chat berakhir. Terima kasih telah menggunakan layanan kami!',
    zh: '聊天会话结束。感谢您使用我们的服务！',
    ja: 'チャットセッションが終了しました。ご利用ありがとうございました！',
    ko: '채팅 세션이 종료되었습니다. 서비스를 이용해 주셔서 감사합니다!',
    es: 'Sesión de chat finalizada. ¡Gracias por usar nuestro servicio!',
    fr: 'Session de chat terminée. Merci d\'avoir utilisé notre service !',
    de: 'Chat-Sitzung beendet. Vielen Dank für die Nutzung unseres Service!',
    it: 'Sessione di chat terminata. Grazie per aver utilizzato il nostro servizio!',
    ru: 'Сеанс чата завершен. Спасибо за использование нашего сервиса!',
    th: 'สิ้นสุดการสนทนา ขอบคุณที่ใช้บริการของเรา!',
    vi: 'Phiên trò chuyện đã kết thúc. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!',
    ar: 'انتهت جلسة الدردشة. شكرا لاستخدام خدمتنا!',
    pt: 'Sessão de chat encerrada. Obrigado por usar nosso serviço!',
    nl: 'Chatsessie beëindigd. Bedankt voor het gebruiken van onze service!'
  }
};

/**
 * Get pre-translated system message
 */
export function getSystemMessage(
  messageKey: string,
  language: string,
  params?: Record<string, any>
): string {
  const messages = SYSTEM_MESSAGES[messageKey];
  if (!messages) {
    logger.warn('Unknown system message key', { messageKey });
    return messageKey;
  }
  
  let message = messages[language] || messages['en'] || messageKey;
  
  // Replace template variables {key}
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      message = message.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
    });
  }
  
  return message;
}

/**
 * Get user's language preference from localStorage
 */
export function getUserLanguagePreference(): string {
  const result = storage.getItem<string>('chat_language_preference');
  return result.success && result.data ? result.data : 'en';
}

/**
 * Set user's language preference
 */
export function setUserLanguagePreference(language: string): void {
  storage.setItem('chat_language_preference', language);
  logger.info('🌍 Language preference saved', { language });
}

/**
 * Check if browser supports Translation API
 */
export function isTranslationSupported(): boolean {
  return 'translation' in navigator;
}

/**
 * Get translation config for session
 */
export function getTranslationConfig(sessionId: string): TranslationConfig {
  const result = storage.getItem<TranslationConfig>(`translation_config_${sessionId}`);
  
  if (result.success && result.data) {
    return result.data;
  }
  
  // Default config
  return {
    userLanguage: getUserLanguagePreference(),
    autoTranslate: true,
    showOriginal: true,
    translationProvider: isTranslationSupported() ? 'browser' : 'fallback'
  };
}

/**
 * Save translation config for session
 */
export function saveTranslationConfig(sessionId: string, config: TranslationConfig): void {
  storage.setItem(`translation_config_${sessionId}`, config);
  logger.info('🌍 Translation config saved', { sessionId, config });
}

/**
 * Clear translation cache (for memory management)
 */
export function clearTranslationCache(): void {
  const keys = storage.getKeysByPrefix('translation_');
  keys.forEach(key => storage.removeItem(key));
  logger.info('🌍 Translation cache cleared', { clearedKeys: keys.length });
}
