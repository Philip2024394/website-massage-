/**
 * Enhanced Professional Notification Service
 * MP3 music + vibration for bookings, special sound effects for chat interactions
 */

export interface NotificationSound {
  id: string;
  name: string;
  filename: string;
  category: 'booking_music' | 'chat_effect' | 'status_alert';
  description: string;
  volume: number;
  vibrationPattern?: number[];
}

export interface MessageStatus {
  id: string;
  messageId: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  timestamp: Date;
  recipientId: string;
}

export interface TypingStatus {
  userId: string;
  userName: string;
  chatId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: Date;
  deviceType?: 'mobile' | 'desktop' | 'tablet';
}

class ProfessionalChatNotificationService {
  private audioContext: AudioContext | null = null;
  private soundCache = new Map<string, AudioBuffer>();
  private messageStatuses = new Map<string, MessageStatus>();
  private typingIndicators = new Map<string, TypingStatus>();
  private userPresence = new Map<string, UserPresence>();
  private notificationBadges = new Map<string, number>();
  
  // Professional notification sounds
  private readonly notificationSounds: NotificationSound[] = [
    // 🎵 MAIN BOOKING NOTIFICATIONS (MP3 Music + Vibration)
    {
      id: 'booking_urgent',
      name: 'Booking Request (Urgent)',
      filename: 'booking_urgent_music.mp3',
      category: 'booking_music',
      description: 'Urgent MP3 music for new booking requests',
      volume: 0.9,
      vibrationPattern: [800, 200, 800, 200, 800, 400, 1200] // Strong urgent pattern
    },
    {
      id: 'booking_scheduled',
      name: 'Scheduled Booking',
      filename: 'booking_scheduled_music.mp3',
      category: 'booking_music', 
      description: 'Pleasant MP3 music for scheduled bookings',
      volume: 0.8,
      vibrationPattern: [400, 200, 400, 200, 400] // Gentle pattern
    },
    {
      id: 'booking_accepted',
      name: 'Booking Accepted',
      filename: 'booking_success_music.mp3',
      category: 'booking_music',
      description: 'Success MP3 music when booking is accepted',
      volume: 0.7,
      vibrationPattern: [200, 100, 200, 100, 200] // Quick success pattern
    },

    // 🔊 SPECIAL SOUND EFFECTS (Chat Interactions)
    {
      id: 'message_received',
      name: 'New Message',
      filename: 'message_pop.mp3',
      category: 'chat_effect',
      description: 'Subtle pop sound for new messages',
      volume: 0.6
    },
    {
      id: 'message_sent',
      name: 'Message Sent',
      filename: 'message_whoosh.mp3',
      category: 'chat_effect',
      description: 'Whoosh sound for sent messages',
      volume: 0.5
    },
    {
      id: 'payment_notification',
      name: 'Payment Alert',
      filename: 'payment_ding.mp3',
      category: 'chat_effect',
      description: 'Ding sound for payment notifications',
      volume: 0.7,
      vibrationPattern: [300, 150, 300] // Payment pattern
    },
    {
      id: 'typing_start',
      name: 'Typing Started',
      filename: 'typing_subtle.mp3',
      category: 'chat_effect',
      description: 'Subtle typing sound',
      volume: 0.4
    },
    {
      id: 'user_online',
      name: 'User Online',
      filename: 'user_online_chime.mp3',
      category: 'status_alert',
      description: 'Chime when user comes online',
      volume: 0.5
    },
    {
      id: 'on_the_way',
      name: 'Therapist On The Way',
      filename: 'journey_bell.mp3',
      category: 'booking_music',
      description: 'Bell sound when therapist starts journey',
      volume: 0.8,
      vibrationPattern: [500, 300, 500, 300, 500] // Journey pattern
    }
  ];

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('✅ Professional chat notifications initialized');
    } catch (error) {
      console.warn('⚠️ Audio context initialization failed:', error);
    }
  }

  /**
   * 🎵 MAIN BOOKING NOTIFICATION (MP3 Music + Strong Vibration)
   */
  async playBookingNotification(
    bookingType: 'urgent' | 'scheduled' | 'accepted' = 'urgent',
    options?: { loop?: boolean; stopAfter?: number }
  ): Promise<void> {
    const soundId = `booking_${bookingType}`;
    const sound = this.notificationSounds.find(s => s.id === soundId);
    
    if (!sound) return;

    console.log(`🎵 Playing booking notification: ${sound.name}`);

    // Play MP3 music
    await this.playSound(soundId, {
      volume: sound.volume,
      loop: options?.loop || false,
      category: 'booking_music'
    });

    // Strong vibration pattern
    if (sound.vibrationPattern && 'vibrate' in navigator) {
      navigator.vibrate(sound.vibrationPattern);
    }

    // Auto-stop looped booking sound after specified time
    if (options?.loop && options.stopAfter) {
      setTimeout(() => {
        this.stopSound(soundId);
      }, options.stopAfter);
    }
  }

  /**
   * 🔊 SPECIAL SOUND EFFECTS (Chat Interactions)
   */
  async playChatEffect(effectType: 'message_received' | 'message_sent' | 'payment_notification' | 'typing_start' | 'user_online' | 'on_the_way'): Promise<void> {
    const sound = this.notificationSounds.find(s => s.id === effectType);
    if (!sound) return;

    await this.playSound(effectType, {
      volume: sound.volume,
      category: 'chat_effect'
    });

    // Light vibration for certain effects
    if (sound.vibrationPattern && 'vibrate' in navigator) {
      navigator.vibrate(sound.vibrationPattern);
    }
  }

  /**
   * Generic sound player with caching
   */
  private async playSound(soundId: string, options: {
    volume?: number;
    loop?: boolean;
    category?: string;
  } = {}): Promise<void> {
    const sound = this.notificationSounds.find(s => s.id === soundId);
    if (!sound) return;

    try {
      if (this.audioContext) {
        await this.playWithAudioContext(sound.filename, options);
      } else {
        await this.playWithHTMLAudio(sound.filename, options);
      }
    } catch (error) {
      console.warn(`Failed to play ${soundId}:`, error);
    }
  }

  private async playWithAudioContext(filename: string, options: any): Promise<void> {
    if (!this.audioContext) return;

    let audioBuffer = this.soundCache.get(filename);
    if (!audioBuffer) {
      audioBuffer = await this.loadAudioBuffer(filename);
      if (!audioBuffer) return;
    }

    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = audioBuffer;
    source.loop = options.loop || false;
    gainNode.gain.value = options.volume || 0.7;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    source.start();
  }

  private async playWithHTMLAudio(filename: string, options: any): Promise<void> {
    const audio = new Audio(`/sounds/${filename}`);
    audio.volume = options.volume || 0.7;
    audio.loop = options.loop || false;
    
    return new Promise((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = reject;
      audio.play().catch(reject);
    });
  }

  private async loadAudioBuffer(filename: string): Promise<AudioBuffer | null> {
    try {
      const response = await fetch(`/sounds/${filename}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext!.decodeAudioData(arrayBuffer);
      this.soundCache.set(filename, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load ${filename}:`, error);
      return null;
    }
  }

  private stopSound(soundId: string): void {
    // Implementation to stop specific looped sounds
    console.log(`🔇 Stopping sound: ${soundId}`);
  }

  /**
   * ✅ MESSAGE STATUS TRACKING
   */
  updateMessageStatus(messageId: string, status: MessageStatus['status'], recipientId: string): void {
    const messageStatus: MessageStatus = {
      id: `${messageId}_${Date.now()}`,
      messageId,
      status,
      timestamp: new Date(),
      recipientId
    };

    this.messageStatuses.set(messageId, messageStatus);

    // Broadcast status update
    window.dispatchEvent(new CustomEvent('messageStatusUpdate', {
      detail: messageStatus
    }));

    // Play subtle sound for status changes
    if (status === 'sent') {
      this.playChatEffect('message_sent');
    }
  }

  getMessageStatus(messageId: string): MessageStatus | null {
    return this.messageStatuses.get(messageId) || null;
  }

  /**
   * 💭 TYPING INDICATORS
   */
  setTypingStatus(userId: string, userName: string, chatId: string, isTyping: boolean): void {
    const typingStatus: TypingStatus = {
      userId,
      userName,
      chatId,
      isTyping,
      timestamp: new Date()
    };

    this.typingIndicators.set(`${chatId}_${userId}`, typingStatus);

    // Broadcast typing status
    window.dispatchEvent(new CustomEvent('typingStatusUpdate', {
      detail: typingStatus
    }));

    // Play subtle typing sound when user starts typing
    if (isTyping) {
      this.playChatEffect('typing_start');
    }

    // Auto-clear typing status after 3 seconds
    if (isTyping) {
      setTimeout(() => {
        this.setTypingStatus(userId, userName, chatId, false);
      }, 3000);
    }
  }

  getTypingUsers(chatId: string): TypingStatus[] {
    return Array.from(this.typingIndicators.values())
      .filter(status => status.chatId === chatId && status.isTyping);
  }

  /**
   * 🟢 USER PRESENCE TRACKING
   */
  updateUserPresence(userId: string, status: UserPresence['status'], deviceType?: string): void {
    const presence: UserPresence = {
      userId,
      status,
      lastSeen: new Date(),
      deviceType: deviceType as any
    };

    const previousStatus = this.userPresence.get(userId)?.status;
    this.userPresence.set(userId, presence);

    // Play sound when user comes online
    if (previousStatus === 'offline' && status === 'online') {
      this.playChatEffect('user_online');
    }

    // Broadcast presence update
    window.dispatchEvent(new CustomEvent('userPresenceUpdate', {
      detail: presence
    }));
  }

  getUserPresence(userId: string): UserPresence | null {
    return this.userPresence.get(userId) || null;
  }

  /**
   * 🔴 NOTIFICATION BADGES
   */
  updateNotificationBadge(chatId: string, count: number): void {
    if (count <= 0) {
      this.notificationBadges.delete(chatId);
    } else {
      this.notificationBadges.set(chatId, count);
    }

    // Broadcast badge update
    window.dispatchEvent(new CustomEvent('notificationBadgeUpdate', {
      detail: { chatId, count }
    }));
  }

  getNotificationBadge(chatId: string): number {
    return this.notificationBadges.get(chatId) || 0;
  }

  incrementNotificationBadge(chatId: string): number {
    const current = this.getNotificationBadge(chatId);
    const newCount = current + 1;
    this.updateNotificationBadge(chatId, newCount);
    return newCount;
  }

  clearNotificationBadge(chatId: string): void {
    this.updateNotificationBadge(chatId, 0);
  }

  /**
   * 🔧 UTILITY METHODS
   */
  preloadSounds(categories?: string[]): Promise<void> {
    const soundsToLoad = categories 
      ? this.notificationSounds.filter(s => categories.includes(s.category))
      : this.notificationSounds;

    const loadPromises = soundsToLoad.map(sound => 
      this.loadAudioBuffer(sound.filename)
    );

    return Promise.all(loadPromises).then(() => {
      console.log(`✅ Preloaded ${soundsToLoad.length} notification sounds`);
    });
  }

  getAvailableSounds(): NotificationSound[] {
    return [...this.notificationSounds];
  }
}

// Export singleton instance
export const professionalChatService = new ProfessionalChatNotificationService();

// Preload booking sounds immediately
professionalChatService.preloadSounds(['booking_music']).catch(console.error);

export default professionalChatService;