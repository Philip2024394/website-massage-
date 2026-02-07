/**
 * 🏆 GOLD-STANDARD VALIDATION USAGE EXAMPLES
 * 
 * Shows how to implement the separated validation functions correctly.
 * Copy these patterns to other components that handle bank/KTP validation.
 */

import React, { useState } from 'react';
import { 
  validateKTP, 
  validateBankAccount, 
  validateAccountHolderName,
  validateBankDetails,
  sanitizeKTPInput,
  sanitizeBankAccountInput,
  sanitizeAccountHolderInput,
  type ValidationResult 
} from '../utils/goldStandardValidation';

// ============================================================================
// EXAMPLE 1: INDIVIDUAL FIELD VALIDATION
// ============================================================================

const KTPValidationExample: React.FC = () => {
  const [ktpNumber, setKTPNumber] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleKTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ CORRECT: Use type="text" with sanitization
    const sanitized = sanitizeKTPInput(e.target.value);
    setKTPNumber(sanitized);
    
    // Validate on every change for real-time feedback
    const result = validateKTP(sanitized);
    setValidation(result);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        KTP Number (Indonesian National ID)
      </label>
      {/* ✅ ALWAYS use type="text" for numeric data that can be large */}
      {/* ✅ Shows numeric keyboard on mobile */}
      <input
        type="text"
        inputMode="numeric"
        value={ktpNumber}
        onChange={handleKTPChange}
        placeholder="16 digits exactly"
        maxLength={16}
        className={`w-full px-3 py-2 border rounded-lg font-mono ${
          validation?.isValid === false ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      
      {/* Error Display */}
      {validation?.errors.map((error, index) => (
        <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
      ))}
      
      {/* Warning Display */}
      {validation?.warnings?.map((warning, index) => (
        <p key={index} className="text-sm text-yellow-600 mt-1">{warning}</p>
      ))}
      
      {/* Success Display */}
      {validation?.isValid && (
        <p className="text-sm text-green-600 mt-1">✓ Valid KTP number</p>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 2: BANK ACCOUNT WITH SMART FORMATTING
// ============================================================================

const BankAccountValidationExample: React.FC = () => {
  const [bankAccount, setBankAccount] = useState('');
  const [validation, setValidation] = useState<ValidationResult | null>(null);

  const handleBankAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // ✅ CORRECT: Allow digits, spaces, dashes, dots, underscores
    const sanitized = sanitizeBankAccountInput(e.target.value);
    setBankAccount(sanitized);
    
    // Validate immediately
    const result = validateBankAccount(sanitized);
    setValidation(result);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Bank Account Number
      </label>
      <input
        type="text" {/* ✅ NEVER use type="number" for account numbers */}
        inputMode="numeric" {/* ✅ Mobile optimization */}
        value={bankAccount}
        onChange={handleBankAccountChange}
        placeholder="1234 5678 9012 3456"
        maxLength={30} {/* ✅ Allow space for separators */}
        className={`w-full px-3 py-2 border rounded-lg font-mono ${
          validation?.isValid === false ? 'border-red-500 bg-red-50' : 'border-gray-300'
        }`}
      />
      
      <p className="text-xs text-gray-500 mt-1">
        Enter 10-20 digits. Spaces and separators are allowed.
      </p>
      
      {/* Real-time digit count */}
      {bankAccount && (
        <p className="text-xs text-gray-400 mt-1">
          Digits: {bankAccount.replace(/\D/g, '').length}/20
        </p>
      )}
      
      {/* Validation feedback */}
      {validation?.errors.map((error, index) => (
        <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
      ))}
      {validation?.isValid && (
        <p className="text-sm text-green-600 mt-1">✓ Valid account number</p>
      )}
    </div>
  );
};

// ============================================================================
// EXAMPLE 3: COMPLETE BANK DETAILS FORM (RECOMMENDED APPROACH)
// ============================================================================

const CompleteBankDetailsExample: React.FC = () => {
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    ktpNumber: ''
  });
  
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateBankDetails> | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ BEST PRACTICE: Validate all fields at once
    const validation = validateBankDetails({
      bankName: formData.bankName,
      accountHolderName: formData.accountHolderName,
      accountNumber: formData.accountNumber,
      ktpNumber: formData.ktpNumber
    });
    
    setValidationResult(validation);
    
    if (validation.isAllValid) {
      // ✅ All validation passed - safe to submit
      console.log('✅ Form is valid - submitting:', {
        bankName: validation.bankName.cleaned,
        accountHolderName: validation.accountHolderName.cleaned,
        accountNumber: validation.accountNumber.cleaned,
        ktpNumber: validation.ktpNumber?.cleaned
      });
      
      // TODO: Submit to backend
    } else {
      console.log('❌ Validation failed:', validation.allErrors);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Complete Bank Details Form
      </h3>
      
      {/* Bank Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bank Name
        </label>
        <input
          type="text"
          value={formData.bankName}
          onChange={(e) => {
            const sanitized = sanitizeAccountHolderInput(e.target.value);
            setFormData(prev => ({ ...prev, bankName: sanitized }));
          }}
          placeholder="Bank Central Asia"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {validationResult?.bankName.errors.map((error, i) => (
          <p key={i} className="text-sm text-red-600 mt-1">{error}</p>
        ))}
      </div>
      
      {/* Account Holder Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Holder Name
        </label>
        <input
          type="text"
          value={formData.accountHolderName}
          onChange={(e) => {
            const sanitized = sanitizeAccountHolderInput(e.target.value);
            setFormData(prev => ({ ...prev, accountHolderName: sanitized }));
          }}
          placeholder="John Doe"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
        />
        {validationResult?.accountHolderName.errors.map((error, i) => (
          <p key={i} className="text-sm text-red-600 mt-1">{error}</p>
        ))}
      </div>
      
      {/* Account Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Number
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={formData.accountNumber}
          onChange={(e) => {
            const sanitized = sanitizeBankAccountInput(e.target.value);
            setFormData(prev => ({ ...prev, accountNumber: sanitized }));
          }}
          placeholder="1234 5678 9012 3456"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
        />
        {validationResult?.accountNumber.errors.map((error, i) => (
          <p key={i} className="text-sm text-red-600 mt-1">{error}</p>
        ))}
      </div>
      
      {/* KTP Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          KTP Number (Optional)
        </label>
        <input
          type="text"
          inputMode="numeric"
          value={formData.ktpNumber}
          onChange={(e) => {
            const sanitized = sanitizeKTPInput(e.target.value);
            setFormData(prev => ({ ...prev, ktpNumber: sanitized }));
          }}
          placeholder="16 digit KTP number"
          maxLength={16}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
        />
        {validationResult?.ktpNumber?.errors.map((error, i) => (
          <p key={i} className="text-sm text-red-600 mt-1">{error}</p>
        ))}
      </div>
      
      {/* Submit Button */}
      <button
        type="submit"
        className={`w-full px-4 py-3 rounded-lg font-semibold transition-colors ${
          validationResult?.isAllValid === false 
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        Validate & Submit
      </button>
      
      {/* Overall Validation Summary */}
      {validationResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Validation Summary:</h4>
          <p className={`text-sm ${
            validationResult.isAllValid ? 'text-green-600' : 'text-red-600'
          }`}>
            {validationResult.isAllValid ? '✅ All fields valid' : `❌ ${validationResult.allErrors.length} errors found`}
          </p>
          
          {validationResult.allWarnings.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium text-yellow-600">Warnings:</p>
              {validationResult.allWarnings.map((warning, i) => (
                <p key={i} className="text-sm text-yellow-600">• {warning}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </form>
  );
};

// ============================================================================
// ANTI-PATTERNS TO AVOID ❌
// ============================================================================

const BadExamples = () => {
  return (
    <div className="border-l-4 border-red-500 pl-4 bg-red-50 p-4 rounded">
      <h4 className="font-semibold text-red-800 mb-2">❌ DON'T DO THIS:</h4>
      
      {/* ❌ BAD: Using type="number" */}
      <div className="mb-4">
        <p className="text-sm text-red-600 mb-2">❌ Type "number" causes precision loss:</p>
        <code className="block bg-red-100 p-2 rounded text-sm">
          {`// ❌ BAD - Loses precision for large numbers\n<input type="number" onChange={(e) => parseFloat(e.target.value)} />`}
        </code>
      </div>
      
      {/* ❌ BAD: No validation */}
      <div className="mb-4">
        <p className="text-sm text-red-600 mb-2">❌ No validation:</p>
        <code className="block bg-red-100 p-2 rounded text-sm">
          {`// ❌ BAD - No validation, accepts anything\n<input onChange={(e) => setValue(e.target.value)} />`}
        </code>
      </div>
      
      {/* ❌ BAD: Inconsistent validation */}
      <div>
        <p className="text-sm text-red-600 mb-2">❌ Scattered validation logic:</p>
        <code className="block bg-red-100 p-2 rounded text-sm">
          {`// ❌ BAD - Different validation in every component\nif (value.length > 0 && /^[0-9]+$/.test(value) && value.length >= 10)...`}
        </code>
      </div>
    </div>
  );
};

// Export examples for documentation
export {
  KTPValidationExample,
  BankAccountValidationExample,
  CompleteBankDetailsExample,
  BadExamples
};