/**
 * React Hook for Form Validation
 * 
 * Provides easy-to-use validation hooks for React forms
 * Integrates with production input validator
 */

import { useState, useCallback } from 'react';
import { InputValidator, ValidationResult } from './inputValidator.production';

export interface FieldValidation {
  value: string;
  error: string | null;
  touched: boolean;
}

export interface FormValidation {
  [key: string]: FieldValidation;
}

export function useFormValidation(initialValues: { [key: string]: string } = {}) {
  const [fields, setFields] = useState<FormValidation>(() => {
    const initial: FormValidation = {};
    for (const [key, value] of Object.entries(initialValues)) {
      initial[key] = { value, error: null, touched: false };
    }
    return initial;
  });

  const validateField = useCallback((name: string, value: string, validationType: 'email' | 'phone' | 'text' | 'password' | 'whatsapp'): ValidationResult => {
    switch (validationType) {
      case 'email':
        return InputValidator.validateEmail(value);
      case 'phone':
        return InputValidator.validatePhone(value);
      case 'whatsapp':
        return InputValidator.validateWhatsApp(value);
      case 'password':
        return InputValidator.validatePassword(value);
      case 'text':
      default:
        return InputValidator.validateText(value);
    }
  }, []);

  const setValue = useCallback((name: string, value: string, validationType?: 'email' | 'phone' | 'text' | 'password' | 'whatsapp') => {
    setFields(prev => {
      const field = prev[name] || { value: '', error: null, touched: false };
      
      let error: string | null = null;
      if (validationType && field.touched) {
        const result = validateField(name, value, validationType);
        error = result.isValid ? null : (result.error || 'Invalid input');
      }

      return {
        ...prev,
        [name]: {
          ...field,
          value,
          error
        }
      };
    });
  }, [validateField]);

  const setTouched = useCallback((name: string, validationType?: 'email' | 'phone' | 'text' | 'password' | 'whatsapp') => {
    setFields(prev => {
      const field = prev[name] || { value: '', error: null, touched: false };
      
      let error: string | null = null;
      if (validationType) {
        const result = validateField(name, field.value, validationType);
        error = result.isValid ? null : (result.error || 'Invalid input');
      }

      return {
        ...prev,
        [name]: {
          ...field,
          touched: true,
          error
        }
      };
    });
  }, [validateField]);

  const validate = useCallback((validationRules: { [key: string]: 'email' | 'phone' | 'text' | 'password' | 'whatsapp' }): boolean => {
    let isValid = true;
    const newFields = { ...fields };

    for (const [name, type] of Object.entries(validationRules)) {
      const field = fields[name];
      if (!field) continue;

      const result = validateField(name, field.value, type);
      if (!result.isValid) {
        isValid = false;
        newFields[name] = {
          ...field,
          touched: true,
          error: result.error || 'Invalid input'
        };
      } else {
        newFields[name] = {
          ...field,
          touched: true,
          error: null
        };
      }
    }

    setFields(newFields);
    return isValid;
  }, [fields, validateField]);

  const reset = useCallback(() => {
    setFields(() => {
      const reset: FormValidation = {};
      for (const key of Object.keys(fields)) {
        reset[key] = { value: '', error: null, touched: false };
      }
      return reset;
    });
  }, [fields]);

  const getFieldProps = useCallback((name: string, validationType?: 'email' | 'phone' | 'text' | 'password' | 'whatsapp') => {
    const field = fields[name] || { value: '', error: null, touched: false };
    
    return {
      value: field.value,
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue(name, e.target.value, validationType);
      },
      onBlur: () => {
        setTouched(name, validationType);
      }
    };
  }, [fields, setValue, setTouched]);

  return {
    fields,
    setValue,
    setTouched,
    validate,
    reset,
    getFieldProps,
    isValid: Object.values(fields).every(f => !f.error),
    hasErrors: Object.values(fields).some(f => f.error !== null)
  };
}
