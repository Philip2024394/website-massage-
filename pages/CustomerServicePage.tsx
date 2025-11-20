import React, { useState } from 'react';

type Props = {
  onBack: () => void;
};

const CustomerServicePage: React.FC<Props> = ({ onBack }) => {
  const [caseId] = useState(() => `CS-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');
  const [screenshots, setScreenshots] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5);
      setScreenshots(files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !message.trim()) {
      alert('Please fill in email and message fields');
      return;
    }

    setSubmitting(true);
    try {
      // Here you would implement actual submission logic
      // For now, just simulate
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert(`Thank you for contacting us!\n\nYour Case ID: ${caseId}\n\nWe will review your case and respond within 24-48 hours.`);
      
      // Reset form
      setContactNumber('');
      setEmail('');
      setCountry('');
      setMessage('');
      setScreenshots([]);
    } catch (error) {
      alert('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-gray-600 hover:text-gray-900">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Customer Service</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Contact Customer Service</h2>
            <p className="text-gray-600">
              Report issues, suspicious activity, or request assistance. Please provide as much detail as possible.
            </p>
          </div>

          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Your Case ID:</strong> <span className="font-mono">{caseId}</span>
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Please save this Case ID for tracking your inquiry.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Number <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+1234567890"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-gray-500">(Optional)</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g., United States"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Contact / Issue Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Please describe your issue or inquiry in detail..."
                required
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Screenshots <span className="text-gray-500">(Optional, max 5 images)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {screenshots.length > 0 && (
                <div className="mt-2 text-sm text-gray-600">
                  {screenshots.length} file(s) selected
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={submitting}
                className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Case'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Common Issues We Handle:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Suspicious seller activity or fraud reports</li>
              <li>Platform technical issues</li>
              <li>Account access problems</li>
              <li>Report policy violations</li>
              <li>General inquiries and feedback</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CustomerServicePage;
