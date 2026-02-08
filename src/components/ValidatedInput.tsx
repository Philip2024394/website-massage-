/**
 * Validated Input Components
 * 
 * Ready-to-use form components with built-in validation
 * Drop-in replacements for standard HTML inputs
 */

import React from 'react';
import { InputValidator } from '../lib/inputValidator.production';
import { logger } from '../utils/logger';

interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: 'email' | 'phone' | 'text' | 'password' | 'whatsapp';
  onValidation?: (isValid: boolean, error?: string) => void;
  showErrorImmediately?: boolean;
}

export const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ validationType = 'text', onValidation, showErrorImmediately = false, ...props }, ref) => {
    const [error, setError] = React.useState<string | null>(null);
    const [touched, setTouched] = React.useState(false);

    const validate = (value: string) => {
      let result;
      switch (validationType) {
        case 'email':
          result = InputValidator.validateEmail(value);
          break;
        case 'phone':
          result = InputValidator.validatePhone(value);
          break;
        case 'whatsapp':
          result = InputValidator.validateWhatsApp(value);
          break;
        case 'password':
          result = InputValidator.validatePassword(value);
          break;
        case 'text':
        default:
          result = InputValidator.validateText(value, { required: props.required });
          break;
      }

      setError(result.isValid ? null : result.error || null);
      onValidation?.(result.isValid, result.error);
      return result;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (touched || showErrorImmediately) {
        validate(e.target.value);
      }
      props.onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setTouched(true);
      validate(e.target.value);
      props.onBlur?.(e);
    };

    const showError = touched && error;

    return (
      <div className="validated-input-wrapper">
        <input
          {...props}
          ref={ref}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${props.className || ''} ${showError ? 'error' : ''}`}
          aria-invalid={showError ? 'true' : 'false'}
          aria-describedby={showError ? `${props.id}-error` : undefined}
        />
        {showError && (
          <span 
            id={`${props.id}-error`}
            className="error-message"
            role="alert"
            style={{
              color: '#ef4444',
              fontSize: '0.875rem',
              marginTop: '0.25rem',
              display: 'block'
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

ValidatedInput.displayName = 'ValidatedInput';

// Example usage in existing forms:
/*

BEFORE:
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
/>

AFTER:
<ValidatedInput
  type="email"
  validationType="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  placeholder="Enter your email"
  required
  onValidation={(isValid, error) => {
    setEmailValid(isValid);
    if (!isValid) logger.debug('Email error:', error);
  }}
/>

*/

// Booking validation example
export function useBookingValidation() {
  const [isValid, setIsValid] = React.useState(false);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const validateBooking = React.useCallback((data: {
    therapistId?: string;
    date?: string;
    time?: string;
    duration?: number;
    address?: string;
    notes?: string;
  }) => {
    const result = InputValidator.validateBookingData(data);
    
    if (!result.isValid) {
      const errorObj: { [key: string]: string } = {};
      result.error?.split(', ').forEach((err, i) => {
        errorObj[`field_${i}`] = err;
      });
      setErrors(errorObj);
      setIsValid(false);
      return false;
    }

    setErrors({});
    setIsValid(true);
    return true;
  }, []);

  return {
    isValid,
    errors,
    validateBooking
  };
}
