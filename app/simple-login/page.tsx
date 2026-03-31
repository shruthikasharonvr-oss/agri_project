'use client';

import { useState } from 'react';
import { Sprout, User, LogIn, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/TranslationContext';

export default function SimpleLoginPage() {
  const [step, setStep] = useState<'choice' | 'form'>('choice');
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'customer' | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { t } = useTranslation();

  const handleRoleSelect = (role: 'farmer' | 'customer') => {
    setSelectedRole(role);
    setStep('form');
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim()) {
      setError(t('Please enter your name'));
      return;
    }

    if (username.trim().length < 2) {
      setError(t('Name must be at least 2 characters'));
      return;
    }

    setLoading(true);

    try {
      // Store user data in localStorage
      localStorage.setItem('userName', username.trim());
      localStorage.setItem('userRole', selectedRole!);
      localStorage.setItem('isLoggedIn', 'true');

      // Optional: Send to backend if you have an API
      const response = await fetch('/api/auth/simple-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: username.trim(),
          role: selectedRole
        })
      }).catch(() => null); // Gracefully handle if API doesn't exist

      if (response?.ok) {
        const data = await response.json();
        console.log('Login response:', data);
      }

      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || t('Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="bg-white w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-lg">
            <Sprout className="text-green-700" size={40} />
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-2">FarmToHome</h1>
          <p className="text-gray-600 font-medium">{t('Direct from Farm to Your Door')}</p>
        </div>

        {/* Choice Step */}
        {step === 'choice' && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-2xl font-black text-gray-900 text-center mb-8">{t('How would you like to join us?')}</h2>

            {/* Farmer Option */}
            <button
              onClick={() => handleRoleSelect('farmer')}
              className="w-full bg-white border-2 border-gray-200 p-8 rounded-[24px] hover:border-green-600 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-[16px] flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 transition">
                  <User className="text-green-700 group-hover:text-white" size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-black text-gray-900 mb-1">{t('Login as Farmer')}</h3>
                  <p className="text-sm text-gray-600">{t('Sell your produce directly to customers')}</p>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-green-600 transition mt-1" size={20} />
              </div>
            </button>

            {/* Customer Option */}
            <button
              onClick={() => handleRoleSelect('customer')}
              className="w-full bg-white border-2 border-gray-200 p-8 rounded-[24px] hover:border-green-600 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-[16px] flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 transition">
                  <LogIn className="text-blue-700 group-hover:text-white" size={24} />
                </div>
                <div className="text-left flex-1">
                  <h3 className="text-lg font-black text-gray-900 mb-1">{t('Login as Customer')}</h3>
                  <p className="text-sm text-gray-600">{t('Buy fresh produce from local farmers')}</p>
                </div>
                <ArrowRight className="text-gray-400 group-hover:text-green-600 transition mt-1" size={20} />
              </div>
            </button>
          </div>
        )}

        {/* Login Form Step */}
        {step === 'form' && selectedRole && (
          <div className="animate-fade-in">
            <button
              onClick={() => setStep('choice')}
              className="mb-6 text-green-700 font-bold text-sm hover:text-green-800 flex items-center gap-2"
            >
              ← {t('Back')}
            </button>

            <h2 className="text-2xl font-black text-gray-900 mb-2">
              {selectedRole === 'farmer' ? t('Farmer Login') : t('Customer Login')}
            </h2>
            <p className="text-gray-600 text-sm mb-8">{t('Welcome! Please enter your details.')}</p>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Name Input */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  {t('Your Name')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={
                    selectedRole === 'farmer'
                      ? t('e.g., Ramesh Kumar')
                      : t('e.g., Priya Sharma')
                  }
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-[16px] focus:outline-none focus:border-green-600 transition font-medium text-gray-900"
                  disabled={loading}
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-[12px] p-4">
                  <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
              )}

              {/* Role Display */}
              <div className="bg-green-50 border-2 border-green-200 rounded-[16px] p-4">
                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mb-1">{t('You are logging in as')}</p>
                <p className="text-lg font-black text-green-900">
                  {selectedRole === 'farmer' ? t('🌾 Farmer') : t('🛒 Customer')}
                </p>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-black py-4 rounded-[16px] transition-all duration-300 uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t('Logging in...')}
                  </>
                ) : (
                  <>
                    <LogIn size={20} />
                    {t('Login')}
                  </>
                )}
              </button>

              {/* Additional Info */}
              <p className="text-center text-xs text-gray-600">
                {t('Your information is stored securely and only used for your account.')}
              </p>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
