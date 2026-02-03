/**
 * Chat Content Moderation & Spam Prevention Service
 * Filters phone numbers, inappropriate content, and prevents spam
 */

export interface ContentFilterResult {
  isAllowed: boolean;
  allowed?: boolean; // for backward compatibility
  reason?: 'phone_number' | 'spam' | 'inappropriate' | 'profanity' | 'rate_limit' | 'split_phone_attempt' | 'circumvention_detected';
  filteredContent?: string;
  warning?: string;
  severity: 'low' | 'medium' | 'high';
  suggestions?: string[];
  circumventionDetected?: boolean;
  splitPhoneAttempt?: {
    messages: string[];
    reconstructedNumber: string;
    confidence: number;
  };
}

export interface SpamDetectionSettings {
  maxMessagesPerMinute: number;
  maxSimilarMessages: number;
  phoneNumberBlocking: boolean;
  profanityFiltering: boolean;
  customBlockedWords: string[];
  splitPhoneDetection: boolean;
  circumventionThreshold: number;
}

interface UserModerationStats {
  userId: string;
  messagesCount: number;
  spamWarnings: number;
  lastMessageTime: Date;
  rateLimitHits: number;
  flaggedContent: number;
  messageHistory: string[];
  recentMessages: MessageSequence[];
  phoneNumberAttempts: PhoneNumberAttempt[];
  circumventionScore: number;
}

interface MessageSequence {
  messageId: string;
  text: string;
  timestamp: Date;
  chatId: string;
  suspiciousScore: number;
}

interface PhoneNumberAttempt {
  messages: string[];
  timestamps: Date[];
  chatId: string;
  detectionType: 'numeric_split' | 'text_split' | 'mixed_pattern' | 'social_media_split';
  confidence: number;
  isBlocked: boolean;
}

class ChatModerationService {
  private userMessageHistory = new Map<string, Array<{ content: string; timestamp: Date }>>();
  private userModerationStats = new Map<string, UserModerationStats>();
  private phoneNumberPatterns: RegExp[];
  private profanityList: string[];
  private spamPatterns: RegExp[];
  private numberWordPatterns: Record<string, string>;
  
  private settings: SpamDetectionSettings = {
    maxMessagesPerMinute: 10,
    maxSimilarMessages: 3,
    phoneNumberBlocking: true,
    profanityFiltering: true,
    customBlockedWords: [],
    splitPhoneDetection: true,
    circumventionThreshold: 4
  };

  constructor() {
    this.initializeFilters();
  }

  private initializeFilters() {
    // Phone number patterns (various international formats)
    this.phoneNumberPatterns = [
      // Indonesian numbers
      /(?:\+62|62|0)[0-9]{8,13}/g,
      // International formats
      /(?:\+\d{1,3}[-\s]?)?\(?[0-9]{3,4}\)?[-\s]?[0-9]{3,4}[-\s]?[0-9]{3,5}/g,
      // WhatsApp format
      /wa\.me\/[0-9]+/gi,
      // General patterns
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
      /\b\d{4}[-.\s]?\d{3}[-.\s]?\d{3}\b/g,
      // Text representations
      /(?:call|text|whatsapp|wa|phone|number|contact)\s*:?\s*[0-9\-\s\(\)]{8,15}/gi
    ];

    // Text representations of numbers (for split detection)
    this.numberWordPatterns = {
      'zero': '0', 'oh': '0', 'null': '0',
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      // Indonesian number words
      'nol': '0', 'satu': '1', 'dua': '2', 'tiga': '3', 'empat': '4',
      'lima': '5', 'enam': '6', 'tujuh': '7', 'delapan': '8', 'sembilan': '9'
    };

    // Common profanity and inappropriate words (basic list)
    this.profanityList = [
      // Keep this list minimal and professional
      'scam', 'fraud', 'fake', 'illegal', 'drugs', 'sex', 'prostitute', 'escort'
    ];

    // Spam detection patterns
    this.spamPatterns = [
      /(.)\1{4,}/g, // Repeated characters (aaaaa)
      /([A-Z]){5,}/g, // Too many caps
      /(\$|\₹|IDR|USD)\s*\d+/g, // Suspicious money amounts
      /(buy|sell|cheap|discount|offer|deal).*(now|today|urgent|fast)/gi
    ];
  }

  /**
   * Main content filtering function
   */
  async filterMessage(
    userId: string,
    content: string,
    chatType: 'booking' | 'payment' | 'general' = 'general'
  ): Promise<ContentFilterResult> {
    console.log(`🛡️ Filtering message from user ${userId.substring(0, 8)}...`);

    // Check rate limiting first
    const rateLimitCheck = this.checkRateLimit(userId);
    if (!rateLimitCheck.isAllowed) {
      return rateLimitCheck;
    }

    // Check for phone numbers
    if (this.settings.phoneNumberBlocking) {
      const phoneCheck = this.detectPhoneNumbers(content);
      if (!phoneCheck.isAllowed) {
        this.addToMessageHistory(userId, content);
        return phoneCheck;
      }
    }

    // Check for profanity
    if (this.settings.profanityFiltering) {
      const profanityCheck = this.detectProfanity(content);
      if (!profanityCheck.isAllowed) {
        this.addToMessageHistory(userId, content);
        return profanityCheck;
      }
    }

    // Check for spam patterns
    const spamCheck = this.detectSpam(userId, content);
    if (!spamCheck.isAllowed) {
      this.addToMessageHistory(userId, content);
      return spamCheck;
    }

    // Check custom blocked words
    const customCheck = this.checkCustomBlockedWords(content);
    if (!customCheck.isAllowed) {
      this.addToMessageHistory(userId, content);
      return customCheck;
    }

    // Message is clean
    this.addToMessageHistory(userId, content);
    return {
      isAllowed: true,
      filteredContent: content,
      severity: 'low'
    };
  }

  /**
   * Detect phone numbers in messages
   */
  private detectPhoneNumbers(content: string): ContentFilterResult {
    const phoneMatches = [];
    
    for (const pattern of this.phoneNumberPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        phoneMatches.push(...matches);
      }
    }

    if (phoneMatches.length > 0) {
      // Replace phone numbers with [CONTACT INFO REMOVED]
      let filteredContent = content;
      phoneMatches.forEach(phone => {
        filteredContent = filteredContent.replace(phone, '[CONTACT INFO REMOVED]');
      });

      return {
        isAllowed: false,
        reason: 'phone_number',
        filteredContent,
        severity: 'high',
        warning: '⚠️ Sharing contact information is not allowed. Please use the platform\'s messaging system.',
        suggestions: [
          'Use the built-in chat for communication',
          'Contact information will be shared after booking confirmation',
          'This helps protect both parties'
        ]
      };
    }

    return { isAllowed: true, severity: 'low' };
  }

  /**
   * Detect profanity and inappropriate content
   */
  private detectProfanity(content: string): ContentFilterResult {
    const lowerContent = content.toLowerCase();
    const foundProfanity = this.profanityList.filter(word => 
      lowerContent.includes(word.toLowerCase())
    );

    if (foundProfanity.length > 0) {
      // Replace profanity with asterisks
      let filteredContent = content;
      foundProfanity.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredContent = filteredContent.replace(regex, '*'.repeat(word.length));
      });

      return {
        isAllowed: false,
        reason: 'profanity',
        filteredContent,
        severity: 'medium',
        warning: '⚠️ Please keep messages professional and appropriate.',
        suggestions: [
          'Use respectful language',
          'Focus on booking details and service requests',
          'Maintain professional communication'
        ]
      };
    }

    return { isAllowed: true, severity: 'low' };
  }

  /**
   * Detect spam patterns
   */
  private detectSpam(userId: string, content: string): ContentFilterResult {
    const history = this.userMessageHistory.get(userId) || [];
    
    // Check for repeated similar messages
    const recentMessages = history.filter(msg => 
      Date.now() - msg.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const similarMessages = recentMessages.filter(msg => 
      this.calculateSimilarity(msg.content, content) > 0.8
    );

    if (similarMessages.length >= this.settings.maxSimilarMessages) {
      return {
        isAllowed: false,
        reason: 'spam',
        severity: 'high',
        warning: '⚠️ Please avoid sending similar messages repeatedly.',
        suggestions: [
          'Wait for a response before sending another message',
          'Vary your message content',
          'Be patient with responses'
        ]
      };
    }

    // Check spam patterns
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        return {
          isAllowed: false,
          reason: 'spam',
          filteredContent: content.replace(pattern, '[FILTERED]'),
          severity: 'medium',
          warning: '⚠️ This message appears to contain spam-like content.',
          suggestions: [
            'Use normal language and formatting',
            'Avoid excessive punctuation or caps',
            'Focus on genuine communication'
          ]
        };
      }
    }

    return { isAllowed: true, severity: 'low' };
  }

  /**
   * Check custom blocked words
   */
  private checkCustomBlockedWords(content: string): ContentFilterResult {
    const lowerContent = content.toLowerCase();
    const foundBlocked = this.settings.customBlockedWords.filter(word =>
      lowerContent.includes(word.toLowerCase())
    );

    if (foundBlocked.length > 0) {
      let filteredContent = content;
      foundBlocked.forEach(word => {
        const regex = new RegExp(word, 'gi');
        filteredContent = filteredContent.replace(regex, '[FILTERED]');
      });

      return {
        isAllowed: false,
        reason: 'inappropriate',
        filteredContent,
        severity: 'medium',
        warning: '⚠️ This content is not allowed on our platform.',
        suggestions: [
          'Please follow our community guidelines',
          'Focus on booking-related communication'
        ]
      };
    }

    return { isAllowed: true, severity: 'low' };
  }

  /**
   * Check rate limiting
   */
  private checkRateLimit(userId: string): ContentFilterResult {
    const history = this.userMessageHistory.get(userId) || [];
    const recentMessages = history.filter(msg =>
      Date.now() - msg.timestamp.getTime() < 60 * 1000 // Last minute
    );

    if (recentMessages.length >= this.settings.maxMessagesPerMinute) {
      return {
        isAllowed: false,
        reason: 'rate_limit',
        severity: 'high',
        warning: '⚠️ You are sending messages too quickly. Please slow down.',
        suggestions: [
          'Wait a moment before sending another message',
          'Take time to compose thoughtful messages',
          'Allow time for responses'
        ]
      };
    }

    return { isAllowed: true, severity: 'low' };
  }

  /**
   * Add message to user history
   */
  private addToMessageHistory(userId: string, content: string) {
    const history = this.userMessageHistory.get(userId) || [];
    history.push({ content, timestamp: new Date() });
    
    // Keep only last 50 messages per user
    if (history.length > 50) {
      history.shift();
    }
    
    this.userMessageHistory.set(userId, history);
  }

  /**
   * Calculate message similarity
   */
  private calculateSimilarity(msg1: string, msg2: string): number {
    if (msg1 === msg2) return 1;
    
    const longer = msg1.length > msg2.length ? msg1 : msg2;
    const shorter = msg1.length > msg2.length ? msg2 : msg1;
    
    if (longer.length === 0) return 1;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance between strings
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Update moderation settings
   */
  updateSettings(newSettings: Partial<SpamDetectionSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    console.log('🛡️ Moderation settings updated:', this.settings);
  }

  /**
   * Add custom blocked words
   */
  addBlockedWords(words: string[]) {
    this.settings.customBlockedWords.push(...words);
    console.log(`🛡️ Added ${words.length} blocked words`);
  }

  /**
   * Remove custom blocked words
   */
  removeBlockedWords(words: string[]) {
    this.settings.customBlockedWords = this.settings.customBlockedWords.filter(
      word => !words.includes(word)
    );
    console.log(`🛡️ Removed ${words.length} blocked words`);
  }

  /**
   * Get user message statistics
   */
  getUserStats(userId: string): {
    totalMessages: number;
    messagesLastHour: number;
    averageLength: number;
    lastMessage?: Date;
  } {
    const history = this.userMessageHistory.get(userId) || [];
    const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const recentMessages = history.filter(msg => msg.timestamp > hourAgo);
    const totalLength = history.reduce((sum, msg) => sum + msg.content.length, 0);
    
    return {
      totalMessages: history.length,
      messagesLastHour: recentMessages.length,
      averageLength: history.length > 0 ? Math.round(totalLength / history.length) : 0,
      lastMessage: history.length > 0 ? history[history.length - 1].timestamp : undefined
    };
  }

  /**
   * Clear user history (admin function)
   */
  clearUserHistory(userId: string) {
    this.userMessageHistory.delete(userId);
    console.log(`🛡️ Cleared history for user ${userId.substring(0, 8)}...`);
  }

  /**
   * Get current moderation settings
   */
  getSettings(): SpamDetectionSettings {
    return { ...this.settings };
  }
}

// Export singleton instance
export const chatModerationService = new ChatModerationService();

export default chatModerationService;