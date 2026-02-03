/**
 * Advanced Split Phone Number Detection Service
 * Detects sophisticated circumvention attempts where users split phone numbers across multiple messages
 */

export interface SplitPhoneDetection {
  messages: string[];
  reconstructedNumber: string;
  confidence: number;
  detectionType: 'numeric_split' | 'text_split' | 'mixed_pattern' | 'social_media_split';
  timespan: number; // minutes between first and last message
  isHighRisk: boolean;
}

export interface CircumventionAlert {
  userId: string;
  chatId: string;
  attemptCount: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  detectionHistory: SplitPhoneDetection[];
  recommendedAction: 'warn' | 'restrict' | 'block' | 'escalate';
}

class AdvancedSplitDetectionService {
  private userAttemptHistory = new Map<string, SplitPhoneDetection[]>();
  private suspiciousPatterns: RegExp[];
  private numberWordMap: Record<string, string>;
  
  constructor() {
    this.initializeDetectionPatterns();
  }

  private initializeDetectionPatterns() {
    // Suspicious patterns that indicate phone number sharing intent
    this.suspiciousPatterns = [
      // Context clues
      /my.{0,5}number|phone.{0,5}is|call.{0,5}me|text.{0,5}me/gi,
      /whatsapp|wa.{0,5}me|hubungi|kontak/gi,
      
      // Sequential number indicators  
      /first.{0,5}part|second.{0,5}part|then.{0,5}add|continue.{0,5}with/gi,
      /\d+.{0,5}then|\d+.{0,5}and.{0,5}then/gi,
      
      // Obfuscation attempts
      /zero|oh|null|nol/gi, // Text numbers
      /\s+/g, // Excessive spaces
      /-{2,}|\*{2,}|_{2,}/g // Separator characters
    ];

    // Text-to-number mapping (multilingual)
    this.numberWordMap = {
      // English
      'zero': '0', 'oh': '0', 'null': '0',
      'one': '1', 'two': '2', 'three': '3', 'four': '4', 'five': '5',
      'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
      
      // Indonesian  
      'nol': '0', 'satu': '1', 'dua': '2', 'tiga': '3', 'empat': '4',
      'lima': '5', 'enam': '6', 'tujuh': '7', 'delapan': '8', 'sembilan': '9',
      
      // Common obfuscations
      'o': '0', 'i': '1', 'l': '1', 's': '5', 'g': '9'
    };
  }

  /**
   * Analyze recent messages for split phone number attempts
   */
  analyzeSplitAttempt(userId: string, recentMessages: Array<{text: string, timestamp: Date, chatId: string}>): SplitPhoneDetection | null {
    if (recentMessages.length < 2) return null;

    // Try different detection methods
    const detections = [
      this.detectDirectNumericSplit(recentMessages),
      this.detectTextNumberSplit(recentMessages), 
      this.detectMixedPatternSplit(recentMessages),
      this.detectSocialMediaSplit(recentMessages)
    ].filter(Boolean);

    if (detections.length === 0) return null;

    // Return the detection with highest confidence
    const bestDetection = detections.reduce((best, current) => 
      current!.confidence > best!.confidence ? current : best
    );

    return bestDetection!;
  }

  /**
   * Detect numeric splits: "08", "1234", "5678"
   */
  private detectDirectNumericSplit(messages: Array<{text: string, timestamp: Date, chatId: string}>): SplitPhoneDetection | null {
    const numberSequences: string[] = [];
    const messageTexts: string[] = [];
    
    // Extract number sequences from each message
    for (const msg of messages) {
      messageTexts.push(msg.text);
      const numbers = msg.text.match(/\d{2,6}/g); // 2-6 digit sequences
      if (numbers) {
        numberSequences.push(...numbers);
      }
    }

    if (numberSequences.length < 2) return null;

    // Reconstruct potential phone number
    const reconstructed = numberSequences.join('');
    
    // Calculate confidence based on multiple factors
    const confidence = this.calculateNumericSplitConfidence(reconstructed, messageTexts, messages);
    
    if (confidence < 0.6) return null;

    const timespan = this.calculateTimespan(messages);
    
    return {
      messages: messageTexts,
      reconstructedNumber: reconstructed,
      confidence,
      detectionType: 'numeric_split',
      timespan,
      isHighRisk: confidence > 0.8 && timespan < 5 // High confidence + rapid succession
    };
  }

  /**
   * Detect text number splits: "oh eight one", "two three four"
   */
  private detectTextNumberSplit(messages: Array<{text: string, timestamp: Date, chatId: string}>): SplitPhoneDetection | null {
    const numberSequences: string[] = [];
    const messageTexts: string[] = [];
    
    for (const msg of messages) {
      messageTexts.push(msg.text);
      const words = msg.text.toLowerCase().split(/\s+/);
      const messageNumbers: string[] = [];
      
      for (const word of words) {
        // Check for text numbers
        if (this.numberWordMap[word]) {
          messageNumbers.push(this.numberWordMap[word]);
        }
        // Check for digit sequences
        else if (/^\d+$/.test(word)) {
          messageNumbers.push(word);
        }
      }
      
      if (messageNumbers.length > 0) {
        numberSequences.push(...messageNumbers);
      }
    }

    if (numberSequences.length < 4) return null; // Need at least 4 digits

    const reconstructed = numberSequences.join('');
    const confidence = this.calculateTextSplitConfidence(reconstructed, messageTexts, messages);
    
    if (confidence < 0.5) return null;

    return {
      messages: messageTexts,
      reconstructedNumber: reconstructed,
      confidence,
      detectionType: 'text_split',
      timespan: this.calculateTimespan(messages),
      isHighRisk: confidence > 0.7
    };
  }

  /**
   * Detect mixed patterns: "call zero eight", "1234", "five six seven eight"
   */
  private detectMixedPatternSplit(messages: Array<{text: string, timestamp: Date, chatId: string}>): SplitPhoneDetection | null {
    let totalNumbers: string[] = [];
    const messageTexts: string[] = [];
    let contextScore = 0;

    for (const msg of messages) {
      messageTexts.push(msg.text);
      
      // Check for context clues
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(msg.text)) {
          contextScore += 0.2;
        }
      }
      
      // Extract both text and numeric numbers
      const words = msg.text.toLowerCase().split(/\s+/);
      const messageNumbers: string[] = [];
      
      for (const word of words) {
        if (this.numberWordMap[word]) {
          messageNumbers.push(this.numberWordMap[word]);
        } else if (/^\d+$/.test(word)) {
          messageNumbers.push(word);
        }
      }
      
      totalNumbers.push(...messageNumbers);
    }

    if (totalNumbers.length < 3) return null;

    const reconstructed = totalNumbers.join('');
    let confidence = this.calculateMixedPatternConfidence(reconstructed, messageTexts) + contextScore;
    confidence = Math.min(confidence, 1.0);
    
    if (confidence < 0.5) return null;

    return {
      messages: messageTexts,
      reconstructedNumber: reconstructed,
      confidence,
      detectionType: 'mixed_pattern',
      timespan: this.calculateTimespan(messages),
      isHighRisk: confidence > 0.75
    };
  }

  /**
   * Detect social media splits: "follow me", "@username", "telegram user"
   */
  private detectSocialMediaSplit(messages: Array<{text: string, timestamp: Date, chatId: string}>): SplitPhoneDetection | null {
    let socialHandles: string[] = [];
    const messageTexts: string[] = [];
    let contextMatches = 0;

    const socialPatterns = [
      /@[\w._]+/g,        // @username
      /ig\s*:?\s*[\w._]+/gi,  // Instagram
      /fb\s*:?\s*[\w._]+/gi,  // Facebook  
      /tg\s*:?\s*[\w._]+/gi,  // Telegram
      /wa\s*:?\s*[\w._]+/gi,  // WhatsApp
      /line\s*:?\s*[\w._]+/gi // LINE
    ];

    for (const msg of messages) {
      messageTexts.push(msg.text);
      
      for (const pattern of socialPatterns) {
        const matches = msg.text.match(pattern);
        if (matches) {
          socialHandles.push(...matches);
          contextMatches++;
        }
      }
    }

    if (socialHandles.length === 0 || contextMatches < 2) return null;

    const confidence = Math.min(0.4 + (contextMatches * 0.2), 0.9);
    
    return {
      messages: messageTexts,
      reconstructedNumber: socialHandles.join(', '),
      confidence,
      detectionType: 'social_media_split',
      timespan: this.calculateTimespan(messages),
      isHighRisk: contextMatches >= 3
    };
  }

  /**
   * Calculate confidence for numeric splits
   */
  private calculateNumericSplitConfidence(reconstructed: string, messageTexts: string[], messages: any[]): number {
    let confidence = 0;

    // Length analysis (phone numbers typically 8-15 digits)
    if (reconstructed.length >= 8 && reconstructed.length <= 15) {
      confidence += 0.4;
    } else if (reconstructed.length >= 6) {
      confidence += 0.2;
    }

    // Indonesian phone patterns
    if (reconstructed.startsWith('08') || reconstructed.startsWith('62')) {
      confidence += 0.3;
    }
    
    // International patterns
    if (/^(1|44|91|86|33|49|81|61)/.test(reconstructed)) {
      confidence += 0.25;
    }

    // Context clues in messages
    const allText = messageTexts.join(' ').toLowerCase();
    if (/call|text|phone|whatsapp|wa|contact|hubungi|telpon/.test(allText)) {
      confidence += 0.2;
    }

    // Sequential pattern bonus (messages in quick succession)
    if (messages.length >= 3) {
      const timespan = this.calculateTimespan(messages);
      if (timespan < 2) { // Less than 2 minutes
        confidence += 0.15;
      }
    }

    // Pattern matching (common phone formats)
    if (/^08\d{8,10}$/.test(reconstructed)) { // Indonesian mobile
      confidence += 0.2;  
    }
    if (/^62\d{9,12}$/.test(reconstructed)) { // Indonesian with country code
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence for text-based splits  
   */
  private calculateTextSplitConfidence(reconstructed: string, messageTexts: string[], messages: any[]): number {
    let confidence = 0.3; // Base score for text detection

    // Same length and pattern checks as numeric
    if (reconstructed.length >= 8 && reconstructed.length <= 15) {
      confidence += 0.3;
    }

    // Indonesian patterns
    if (reconstructed.startsWith('08') || reconstructed.startsWith('62')) {
      confidence += 0.25;
    }

    // Context is more important for text splits
    const allText = messageTexts.join(' ').toLowerCase();
    if (/number|phone|contact|call|text/.test(allText)) {
      confidence += 0.3;
    }

    // Text number usage (more suspicious than plain digits)
    const hasTextNumbers = messageTexts.some(text => 
      /zero|one|two|three|four|five|six|seven|eight|nine|oh|nol|satu|dua/i.test(text)
    );
    if (hasTextNumbers) {
      confidence += 0.2;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate confidence for mixed patterns
   */
  private calculateMixedPatternConfidence(reconstructed: string, messageTexts: string[]): number {
    let confidence = 0.25; // Base score

    // Length check
    if (reconstructed.length >= 8 && reconstructed.length <= 15) {
      confidence += 0.3;
    }

    // Pattern recognition
    if (reconstructed.startsWith('08') || reconstructed.startsWith('62')) {
      confidence += 0.25;
    }

    // Mixed usage suggests intentional obfuscation
    confidence += 0.2;

    return Math.min(confidence, 1.0);
  }

  /**
   * Calculate timespan between messages in minutes
   */
  private calculateTimespan(messages: Array<{timestamp: Date}>): number {
    if (messages.length < 2) return 0;
    
    const first = messages[0].timestamp;
    const last = messages[messages.length - 1].timestamp;
    return (last.getTime() - first.getTime()) / (1000 * 60);
  }

  /**
   * Assess user's circumvention risk level
   */
  assessCircumventionRisk(userId: string, detection: SplitPhoneDetection): CircumventionAlert {
    // Get user's detection history
    const history = this.userAttemptHistory.get(userId) || [];
    history.push(detection);
    
    // Keep only recent attempts (last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentHistory = history.filter(h => 
      new Date(h.messages[0]) > twentyFourHoursAgo // Approximate timestamp
    );
    
    this.userAttemptHistory.set(userId, recentHistory);

    // Calculate risk level
    let riskScore = 0;
    
    // Number of attempts
    riskScore += recentHistory.length * 0.3;
    
    // Confidence levels
    const avgConfidence = recentHistory.reduce((sum, h) => sum + h.confidence, 0) / recentHistory.length;
    riskScore += avgConfidence * 0.4;
    
    // High-risk attempts
    const highRiskCount = recentHistory.filter(h => h.isHighRisk).length;
    riskScore += highRiskCount * 0.3;

    // Determine risk level and recommended action
    let riskLevel: 'low' | 'medium' | 'high' | 'critical';
    let recommendedAction: 'warn' | 'restrict' | 'block' | 'escalate';

    if (riskScore >= 0.9) {
      riskLevel = 'critical';
      recommendedAction = 'escalate';
    } else if (riskScore >= 0.7) {
      riskLevel = 'high'; 
      recommendedAction = 'block';
    } else if (riskScore >= 0.5) {
      riskLevel = 'medium';
      recommendedAction = 'restrict';
    } else {
      riskLevel = 'low';
      recommendedAction = 'warn';
    }

    return {
      userId,
      chatId: detection.messages[0], // Placeholder
      attemptCount: recentHistory.length,
      riskLevel,
      detectionHistory: recentHistory,
      recommendedAction
    };
  }

  /**
   * Generate user-friendly warning message based on detection
   */
  generateWarningMessage(detection: SplitPhoneDetection, riskLevel: string): string {
    const baseWarnings = {
      'numeric_split': '🚨 System detected phone number sharing across multiple messages',
      'text_split': '🚨 System detected text-based number sharing attempt', 
      'mixed_pattern': '🚨 System detected suspicious number pattern across messages',
      'social_media_split': '🚨 System detected social media contact sharing attempt'
    };

    let warning = baseWarnings[detection.detectionType];
    
    if (riskLevel === 'high' || riskLevel === 'critical') {
      warning += ' - This is a serious policy violation.';
    }

    if (detection.confidence > 0.8) {
      warning += ' Our system is highly confident in this detection.';
    }

    return warning;
  }

  /**
   * Get suggestions for the user based on detection type
   */
  getSuggestions(detection: SplitPhoneDetection): string[] {
    const baseSuggestions = [
      'Use our built-in booking system for scheduling appointments',
      'Contact exchange is handled automatically when bookings are confirmed',
      'Keep conversations professional and platform-based'
    ];

    const typeSuggestions = {
      'numeric_split': [
        'Avoid splitting numbers across multiple messages',
        'Phone number sharing violates our platform policies'
      ],
      'text_split': [
        'Spelling out numbers is still considered contact sharing',
        'Use platform messaging for all communication'  
      ],
      'mixed_pattern': [
        'Attempts to bypass filters are automatically detected',
        'Continued violations may result in account restrictions'
      ],
      'social_media_split': [
        'Social media handles and external contacts are not allowed',
        'All communication should remain on the platform'
      ]
    };

    return [...baseSuggestions, ...typeSuggestions[detection.detectionType]];
  }
}

export const splitPhoneDetectionService = new AdvancedSplitDetectionService();