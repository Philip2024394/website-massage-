import React, { useEffect, useState } from 'react';
import { account } from '../lib/appwrite';

type Props = {
  onBack?: () => void;
  onNavigate?: (page: string) => void;
};

const VerifyEmailPage: React.FC<Props> = ({ onBack, onNavigate }) => {
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        setStatus('verifying');
        const url = new URL(window.location.href);
        const userId = url.searchParams.get('userId') || '';
        const secret = url.searchParams.get('secret') || '';
        if (!userId || !secret) {
          setStatus('error');
          setMessage('Missing verification parameters. Please use the link from your email.');
          return;
        }
        await account.updateVerification(userId, secret);
        setStatus('success');
        setMessage('Your email has been verified successfully.');
      } catch (e: any) {
        setStatus('error');
        setMessage(e?.message || 'Email verification failed.');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow p-6 text-center">
        <div className="text-5xl mb-3">{status === 'success' ? '✅' : status === 'verifying' ? '⏳' : '⚠️'}</div>
        <h1 className="text-xl font-bold mb-2">Email Verification</h1>
        <p className={`text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-700'}`}>{message || 'Verifying your email…'}</p>
        <div className="mt-6 grid grid-cols-1 gap-2">
          {status === 'success' && (
            <button
              onClick={() => onNavigate?.('supplierAuth')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Continue
            </button>
          )}
          {status === 'error' && (
            <button
              onClick={() => onBack ? onBack() : onNavigate?.('supplierAuth')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
