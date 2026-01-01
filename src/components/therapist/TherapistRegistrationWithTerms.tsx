/**
 * Therapist Registration with Terms Acceptance
 * 
 * CRITICAL: Therapist must accept terms before registration
 * 
 * STORES IN DATABASE:
 * - termsAccepted: boolean (true)
 * - termsAcceptedDate: ISO timestamp
 * - termsVersion: string ("2.0")
 */

import React, { useState } from 'react';
import './TherapistRegistrationWithTerms.css';

interface RegistrationFormData {
  name: string;
  email: string;
  phone: string;
  city: string;
  specialties: string[];
  acceptedTerms: boolean;
}

export const TherapistRegistrationWithTerms: React.FC = () => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    name: '',
    email: '',
    phone: '',
    city: '',
    specialties: [],
    acceptedTerms: false
  });

  const [errors, setErrors] = useState<Partial<Record<keyof RegistrationFormData, string>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    // Validation
    const newErrors: Partial<Record<keyof RegistrationFormData, string>> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.phone) newErrors.phone = 'Phone is required';
    if (!formData.city) newErrors.city = 'City is required';
    
    // CRITICAL: Terms must be accepted
    if (!formData.acceptedTerms) {
      newErrors.acceptedTerms = 'You must accept the Terms & Conditions to register';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // TODO: Create therapist account in Appwrite
      const therapistData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        specialties: formData.specialties,
        
        // CRITICAL: Store terms acceptance
        termsAccepted: true,
        termsAcceptedDate: new Date().toISOString(),
        termsVersion: '2.0', // Version from TherapistTermsAndConditions
        
        // Initial scores
        availabilityScore: 80, // Start at 80 (Good)
        searchVisibilityMultiplier: 1.0,
        
        // Timestamps
        createdAt: new Date().toISOString(),
        status: 'active'
      };

      console.log('Creating therapist account:', therapistData);

      // await databases.createDocument('therapists', ID.unique(), therapistData);

      alert('Registration successful! Welcome to IndaStreet.');
      
      // Redirect to dashboard
      window.location.href = '/?page=therapist-dashboard';
    } catch (error) {
      console.error('Registration failed:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="therapist-registration-with-terms">
      <div className="registration-container">
        <div className="registration-header">
          <h1>Therapist Registration</h1>
          <p>Join IndaStreet and grow your massage business</p>
        </div>

        <form onSubmit={handleSubmit} className="registration-form">
          {/* Personal Information */}
          <div className="form-section">
            <h2>Personal Information</h2>
            
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number *</label>
              <input
                type="tel"
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+62 812-3456-7890"
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <span className="error-message">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="city">City *</label>
              <select
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className={errors.city ? 'error' : ''}
              >
                <option value="">-- Select City --</option>
                <option value="Ubud">Ubud</option>
                <option value="Canggu">Canggu</option>
                <option value="Seminyak">Seminyak</option>
                <option value="Denpasar">Denpasar</option>
                <option value="Sanur">Sanur</option>
              </select>
              {errors.city && <span className="error-message">{errors.city}</span>}
            </div>
          </div>

          {/* Terms & Conditions - CRITICAL SECTION */}
          <div className="form-section terms-section">
            <h2>📜 Terms & Conditions</h2>
            
            <div className="terms-preview">
              <h3>Key Requirements:</h3>
              <ul>
                <li>✅ Respond to bookings within <strong>5 minutes</strong></li>
                <li>⚡ Maintain device readiness (push notifications enabled)</li>
                <li>📊 Availability score affects booking visibility</li>
                <li>🔒 All communication through platform only (no WhatsApp)</li>
                <li>⚖️ Platform has final authority on disputes</li>
              </ul>
              
              <button 
                type="button"
                className="btn-read-terms"
                onClick={() => setShowTermsModal(true)}
              >
                📖 Read Full Terms & Conditions
              </button>
            </div>

            <div className={`terms-acceptance ${errors.acceptedTerms ? 'error' : ''}`}>
              <label className="terms-checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.acceptedTerms}
                  onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                  className="terms-checkbox"
                />
                <span className="checkbox-text">
                  <strong>I have read and agree to the</strong>{' '}
                  <a 
                    href="/?page=therapist-terms-and-conditions" 
                    target="_blank"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowTermsModal(true);
                    }}
                  >
                    Therapist Terms & Conditions
                  </a>
                </span>
              </label>
              
              {submitted && errors.acceptedTerms && (
                <div className="error-banner">
                  <span className="error-icon">⚠️</span>
                  <span className="error-text">{errors.acceptedTerms}</span>
                </div>
              )}
            </div>

            <div className="terms-notice">
              <p>
                <strong>Important:</strong> By accepting these terms, you acknowledge:
              </p>
              <ul>
                <li>You understand the 5-minute booking response requirement</li>
                <li>You are responsible for device configuration and readiness</li>
                <li>Your availability score will determine booking visibility</li>
                <li>Platform-only communication is mandatory</li>
                <li>All decisions are final and based on system logs</li>
              </ul>
            </div>
          </div>

          {/* Submit Button */}
          <div className="form-actions">
            <button type="submit" className="btn-submit">
              Register as Therapist
            </button>
          </div>
        </form>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="terms-modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="terms-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="terms-modal-header">
              <h2>📜 Therapist Terms & Conditions</h2>
              <button 
                className="close-modal"
                onClick={() => setShowTermsModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="terms-modal-body">
              <iframe
                src="/?page=therapist-terms-and-conditions"
                className="terms-iframe"
                title="Terms and Conditions"
              />
            </div>
            <div className="terms-modal-footer">
              <button 
                className="btn-accept-terms"
                onClick={() => {
                  setFormData({ ...formData, acceptedTerms: true });
                  setShowTermsModal(false);
                  setErrors({ ...errors, acceptedTerms: undefined });
                }}
              >
                ✅ I Accept These Terms
              </button>
              <button 
                className="btn-cancel"
                onClick={() => setShowTermsModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistRegistrationWithTerms;
