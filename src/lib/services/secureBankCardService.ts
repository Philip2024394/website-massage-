/**
 * 🔒 SECURE BANK CARD SERVICE
 * Handles secure display and validation of bank card information
 * 
 * Security Rules:
 * - Bank details are NEVER typed manually in chat
 * - System auto-injects bank card when therapist accepts scheduled booking
 * - Card numbers are always masked (show only last 4 digits)
 * - Block all attempts to send bank numbers manually in messages
 * - User cannot copy raw bank card data
 */

// ============================================================================
// BANK CARD INTERFACE
// ============================================================================

export interface SecureBankCard {
  bankName: string;
  accountNumber: string;      // Full number (stored securely, never displayed raw)
  accountHolderName: string;
  bankCode?: string;          // Optional bank code (e.g., BSB, SWIFT)
}

export interface MaskedBankCard {
  bankName: string;
  maskedAccountNumber: string;  // e.g., "•••• •••• •••• 1234"
  accountHolderName: string;
  lastFourDigits: string;       // For display purposes
}

export interface BankCardValidationResult {
  isValid: boolean;
  containsBankNumber: boolean;
  warning?: string;
}

// ============================================================================
// REGEX PATTERNS FOR BANK NUMBER DETECTION
// ============================================================================

// Indonesian bank account patterns (typically 10-16 digits)
const BANK_ACCOUNT_PATTERNS = [
  /\b\d{10,16}\b/g,                           // 10-16 consecutive digits
  /\b\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{3,4}[-.\s]?\d{0,4}\b/g,  // Formatted with separators
  /\b(?:rekening|rek|norek|no\.?\s*rek|account|acc|acct)\.?\s*:?\s*\d{6,}/gi,  // With labels
];

// Keywords that indicate bank account sharing
const BANK_KEYWORDS = [
  /\b(rekening|rek|norek|no\.\s*rek|account|acc|acct|bank)\b/gi,
  /\b(transfer|tf|kirim|bayar|payment)\s*(ke|to)?\s*\d{6,}/gi,
  /\b(bca|mandiri|bni|bri|cimb|danamon|permata|maybank|btn|ocbc|hsbc|panin|mega|bukopin)\b.*\d{6,}/gi,
];

// ============================================================================
// SECURE BANK CARD SERVICE
// ============================================================================

export const secureBankCardService = {
  /**
   * Mask a bank account number for display
   * Shows only last 4 digits with bullets
   */
  maskAccountNumber(accountNumber: string): string {
    if (!accountNumber) return '•••• •••• ••••';
    
    // Remove all non-digit characters
    const digits = accountNumber.replace(/\D/g, '');
    
    if (digits.length < 4) {
      return '•••• •••• ••••';
    }
    
    const lastFour = digits.slice(-4);
    const maskedLength = digits.length - 4;
    
    // Create masked portion with groups of 4
    const maskedGroups = Math.ceil(maskedLength / 4);
    const maskedPart = Array(maskedGroups).fill('••••').join(' ');
    
    return `${maskedPart} ${lastFour}`.trim();
  },

  /**
   * Get last 4 digits of account number
   */
  getLastFourDigits(accountNumber: string): string {
    const digits = accountNumber.replace(/\D/g, '');
    return digits.slice(-4) || '****';
  },

  /**
   * Create a masked version of bank card for display
   */
  createMaskedCard(bankCard: SecureBankCard): MaskedBankCard {
    return {
      bankName: bankCard.bankName,
      maskedAccountNumber: this.maskAccountNumber(bankCard.accountNumber),
      accountHolderName: bankCard.accountHolderName,
      lastFourDigits: this.getLastFourDigits(bankCard.accountNumber),
    };
  },

  /**
   * Parse bank card details string into structured format
   * Expected format: "BankName|AccountNumber|HolderName"
   */
  parseBankCardString(bankCardString: string): SecureBankCard | null {
    if (!bankCardString) return null;
    
    // Try pipe-separated format first
    const pipeParts = bankCardString.split('|');
    if (pipeParts.length >= 3) {
      return {
        bankName: pipeParts[0].trim(),
        accountNumber: pipeParts[1].trim(),
        accountHolderName: pipeParts[2].trim(),
      };
    }
    
    // Try newline-separated format
    const lineParts = bankCardString.split('\n').map(s => s.trim()).filter(Boolean);
    if (lineParts.length >= 3) {
      return {
        bankName: lineParts[0],
        accountNumber: lineParts[1],
        accountHolderName: lineParts[2],
      };
    }
    
    // Try to extract from labeled format (Bank: X, Account: Y, Name: Z)
    const bankMatch = bankCardString.match(/(?:bank|nama\s*bank)\s*:?\s*([^\n,|]+)/i);
    const accountMatch = bankCardString.match(/(?:rekening|rek|norek|account|acc|nomor)\s*:?\s*(\d[\d\s.-]*\d)/i);
    const nameMatch = bankCardString.match(/(?:nama|name|holder|a\.n\.?|atas\s*nama)\s*:?\s*([^\n,|]+)/i);
    
    if (bankMatch && accountMatch && nameMatch) {
      return {
        bankName: bankMatch[1].trim(),
        accountNumber: accountMatch[1].replace(/[\s.-]/g, ''),
        accountHolderName: nameMatch[1].trim(),
      };
    }
    
    return null;
  },

  /**
   * Check if a message contains bank account numbers
   * Used to BLOCK manual bank number sharing
   */
  containsBankNumber(message: string): BankCardValidationResult {
    if (!message) {
      return { isValid: true, containsBankNumber: false };
    }
    
    // Check for bank account patterns
    for (const pattern of BANK_ACCOUNT_PATTERNS) {
      pattern.lastIndex = 0; // Reset regex
      const matches = message.match(pattern);
      if (matches) {
        // Filter to only include numbers that look like bank accounts (10+ digits)
        const bankNumbers = matches.filter(m => {
          const digits = m.replace(/\D/g, '');
          return digits.length >= 10 && digits.length <= 20;
        });
        
        if (bankNumbers.length > 0) {
          return {
            isValid: false,
            containsBankNumber: true,
            warning: '🚫 Sharing bank account numbers manually is not allowed for security reasons. Bank details are shared automatically through the secure system.',
          };
        }
      }
    }
    
    // Check for bank keywords with numbers
    for (const pattern of BANK_KEYWORDS) {
      pattern.lastIndex = 0;
      if (pattern.test(message)) {
        // Double check if there's actually a long number nearby
        const nearbyDigits = message.match(/\d{8,}/g);
        if (nearbyDigits && nearbyDigits.some(d => d.length >= 10)) {
          return {
            isValid: false,
            containsBankNumber: true,
            warning: '🚫 Sharing bank account numbers manually is not allowed for security reasons. Bank details are shared automatically through the secure system.',
          };
        }
      }
    }
    
    return { isValid: true, containsBankNumber: false };
  },

  /**
   * Format bank card for secure display in chat
   * Returns HTML-safe string with masked data
   */
  formatForChat(bankCard: SecureBankCard | null): string {
    if (!bankCard) {
      return '💳 Bank card details not available. Please contact support at indastreet.id@gmail.com.';
    }
    
    const masked = this.createMaskedCard(bankCard);
    
    return `💳 **Payment Details**
━━━━━━━━━━━━━━━━━━━━
🏦 Bank: ${masked.bankName}
💰 Account: ${masked.maskedAccountNumber}
👤 Name: ${masked.accountHolderName}
━━━━━━━━━━━━━━━━━━━━
*Tap "Payment Transferred" when done*`;
  },

  /**
   * Format bank card as a system message (for scheduled booking acceptance)
   */
  formatSystemMessage(bankCard: SecureBankCard | null, bookingAmount?: number): string {
    if (!bankCard) {
      return '💳 Bank card details are not available. The therapist needs to update their payment information.';
    }
    
    const masked = this.createMaskedCard(bankCard);
    const amountText = bookingAmount 
      ? `\n💵 Amount: Rp ${bookingAmount.toLocaleString('id-ID')}`
      : '';
    
    return `💳 **Secure Payment Information**
━━━━━━━━━━━━━━━━━━━━
🏦 Bank: ${masked.bankName}
💰 Account: ${masked.maskedAccountNumber}
👤 Name: ${masked.accountHolderName}${amountText}
━━━━━━━━━━━━━━━━━━━━

Please transfer the booking amount to the account above.
Tap "Payment Transferred" button after completing the transfer.

⚠️ *This is a secure, auto-generated message. Do not share bank details manually.*`;
  },

  /**
   * Validate that bank card details are properly configured
   */
  isValidBankCard(bankCard: SecureBankCard | null): boolean {
    if (!bankCard) return false;
    
    return !!(
      bankCard.bankName &&
      bankCard.accountNumber &&
      bankCard.accountHolderName &&
      bankCard.accountNumber.replace(/\D/g, '').length >= 10
    );
  },
};

export default secureBankCardService;
