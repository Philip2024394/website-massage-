/**
 * 🛡️ SafePass Rules Modal
 * 
 * Clean, user-visible SafePass Rules modal designed for collapsed/expandable UI.
 * Mobile-friendly with tap-to-expand sections.
 */

import React, { useState } from 'react';
import { X } from 'lucide-react';

// Simple chevron components to replace lucide-react imports
const ChevronDown = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface SafePassRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
}

interface ExpandableSection {
  id: string;
  title: string;
  isExpanded: boolean;
}

const SafePassRulesModal: React.FC<SafePassRulesModalProps> = ({
  isOpen,
  onClose,
  onApply
}) => {
  const [agreedToRules, setAgreedToRules] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    eligibility: false,
    fee: false,
    timeline: false,
    documents: false,
    rules: false,
    admin: false
  });

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleApply = () => {
    if (agreedToRules && onApply) {
      onApply();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xl">🛡️</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900">SafePass Rules</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            
            {/* Why SafePass */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Why SafePass?</h3>
              <p className="text-blue-800 text-sm">
                SafePass verifies therapist identity and trust to protect clients and partners on Indastreet Massage.
              </p>
            </div>

            {/* Eligibility Requirements */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('eligibility')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">▶️ Eligibility Requirements</span>
                {expandedSections.eligibility ? 
                  <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                }
              </button>
              {expandedSections.eligibility && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <p className="font-medium text-gray-900">• 2 recommendation letters from a Hotel or Villa</p>
                      <p className="ml-4">- Must confirm they are very satisfied with your service</p>
                      <p className="ml-4">- Letters must clearly match your profile name</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">• Must be clear of any police record, including:</p>
                      <p className="ml-4">- Theft or stolen goods</p>
                      <p className="ml-4">- Violence, misconduct, or abuse against others</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">• Front-facing profile photo required</p>
                      <p className="ml-4">- Clear face, no mask, no sunglasses</p>
                    </div>
                    <p className="italic text-gray-600">
                      Indastreet Massage may request additional information if needed
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* SafePass Fee & Validity */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('fee')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">▶️ SafePass Fee & Validity</span>
                {expandedSections.fee ? 
                  <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                }
              </button>
              {expandedSections.fee && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="space-y-3 text-sm text-gray-700">
                    <div className="bg-yellow-50 p-3 rounded-lg">
                      <p className="font-bold text-lg text-yellow-900">Fee: IDR 7,500,000</p>
                      <p className="font-semibold text-yellow-800">Validity: 1 calendar year</p>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Includes:</p>
                      <p className="ml-4">• SafePass ID</p>
                      <p className="ml-4">• Registration & admin processing</p>
                    </div>
                    <p className="font-medium text-green-700">
                      SafePass is valid in all countries where Indastreet Massage operates
                    </p>
                    <p className="font-medium text-red-600">
                      ⚠️ Fees are non-refundable
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Processing Timeline */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('timeline')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">▶️ Processing Timeline</span>
                {expandedSections.timeline ? 
                  <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                }
              </button>
              {expandedSections.timeline && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p>• <span className="font-medium">Verification review:</span> up to 72 hours</p>
                    <p>• <span className="font-medium">Physical SafePass ID card shipped:</span> within 10 working days after approval</p>
                  </div>
                </div>
              )}
            </div>

            {/* Document Upload */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('documents')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">▶️ Document Upload</span>
                {expandedSections.documents ? 
                  <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                }
              </button>
              {expandedSections.documents && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="space-y-3 text-sm text-gray-700">
                    <p>Upload directly from phone or computer</p>
                    <div>
                      <p className="font-medium text-gray-900">Accepted formats:</p>
                      <p className="ml-4">• PNG</p>
                      <p className="ml-4">• JPG / JPEG</p>
                    </div>
                    <p className="font-medium text-blue-700">
                      📄 Documents must be clear, readable, and uncropped
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Important Rules */}
            <div className="border border-red-200 rounded-lg bg-red-50">
              <button
                onClick={() => toggleSection('rules')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-red-100 transition-colors"
              >
                <span className="font-semibold text-red-900">▶️ Important Rules</span>
                {expandedSections.rules ? 
                  <ChevronDown className="w-5 h-5 text-red-500" /> : 
                  <ChevronRight className="w-5 h-5 text-red-500" />
                }
              </button>
              {expandedSections.rules && (
                <div className="px-4 pb-4 border-t border-red-200">
                  <div className="space-y-3 text-sm text-red-800">
                    <p className="font-bold">🚫 SafePass is personal and non-transferable</p>
                    <div>
                      <p>• Must not be shared, sold, rented, or used by another person</p>
                      <p>• Misuse is considered identity fraud</p>
                    </div>
                    <div>
                      <p className="font-medium text-red-900">Violations may result in:</p>
                      <p className="ml-4">- Immediate SafePass revocation</p>
                      <p className="ml-4">- Account suspension or termination</p>
                      <p className="ml-4">- Legal reporting if required</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Admin Rights */}
            <div className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection('admin')}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-900">▶️ Admin Rights</span>
                {expandedSections.admin ? 
                  <ChevronDown className="w-5 h-5 text-gray-500" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-500" />
                }
              </button>
              {expandedSections.admin && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <div className="space-y-2 text-sm text-gray-700">
                    <p className="font-medium text-gray-900">Indastreet Massage may:</p>
                    <p>• Approve or reject any SafePass application</p>
                    <p>• Request additional documents</p>
                    <p>• Deactivate or revoke SafePass at any time for safety or legal reasons</p>
                    <p className="font-bold text-gray-900 mt-3">⚖️ Admin decisions are final.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">☑️ Confirmation</h3>
              <p className="text-sm text-gray-700 mb-4">By applying, you confirm that:</p>
              <div className="space-y-2 text-sm text-gray-700 mb-6">
                <p>• All information is true and accurate</p>
                <p>• SafePass is issued only for you</p>
                <p>• You agree to all SafePass rules</p>
              </div>
              
              <div className="space-y-4">
                {/* Agreement Checkbox */}
                <label className="flex items-start gap-3 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToRules}
                    onChange={(e) => setAgreedToRules(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    I agree to the SafePass rules
                  </span>
                </label>

                {/* Apply Button */}
                <button
                  onClick={handleApply}
                  disabled={!agreedToRules}
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg transition-all duration-200 ${
                    agreedToRules
                      ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  🛡️ Apply for SafePass
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafePassRulesModal;