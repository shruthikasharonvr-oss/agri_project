'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../contexts/AuthContext';
import { logAction } from '../lib/auditLog';
import { getOTPRemainingTime, getRemainingAttempts } from '../lib/otpService';
import { validateUsername, validateEmail, validatePhone, validateOTP } from '../lib/validations';
import { Mail, User, Phone, AlertCircle, CheckCircle, Loader } from 'lucide-react';

type Role = 'farmer' | 'customer';
type LoginStep = 'role-selection' | 'otp-verification';

const roleLabel = (role: Role) => (role === 'farmer' ? 'Farmer' : 'Customer');

export default function LoginPage() {
  const router = useRouter();
  const { login: setAuthLogin } = useAuthContext();
  
  const [step, setStep] = useState<LoginStep>('role-selection');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [remainingAttempts, setRemainingAttempts] = useState(5);
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (step !== 'otp-verification') return;
    
    const interval = setInterval(() => {
      const remaining = getOTPRemainingTime(email);
      setTimer(remaining);
      
      if (remaining === 0) {
        setError('OTP has expired. Please request a new one.');
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [step, email]);

  // Resend timer effect - allows resend after 30 seconds
  useEffect(() => {
    if (step !== 'otp-verification') return;
    if (canResend) return;
    
    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [step, canResend]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Comprehensive validations
    if (!selectedRole) {
      setError('Please select a role.');
      return;
    }

    const usernameError = validateUsername(username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    const phoneError = validatePhone(phone);
    if (phoneError) {
      setError(phoneError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          name,
          email,
          phone,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        setLoading(false);
        return;
      }

      setSuccess(`OTP sent to ${email}. Please check your inbox.`);
      setTimer(1200); // 20 minutes as per backend setting
      setResendTimer(30); // 30 seconds before can resend
      setCanResend(false);
      setOtp('');
      setRemainingAttempts(5);
      setStep('otp-verification');
    } catch (err) {
      setError('Error sending OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canResend) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          name,
          email,
          phone,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to resend OTP');
        setLoading(false);
        return;
      }

      setSuccess(`New OTP sent to ${email}. Please check your inbox.`);
      setTimer(1200); // 20 minutes
      setResendTimer(30); // 30 seconds before can resend again
      setCanResend(false);
      setOtp('');
      setRemainingAttempts(5);
    } catch (err) {
      setError('Error resending OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate OTP format
    const otpError = validateOTP(otp);
    if (otpError) {
      setError(otpError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRemainingAttempts(data.remaining || 0);
        setError(data.error || 'Invalid OTP');
        setOtp('');
        setLoading(false);
        return;
      }

      setSuccess('OTP verified! Logging you in...');
      
      // Use auth context to login and persist session
      setAuthLogin({
        name,
        username,
        email,
        phone,
        role: selectedRole || 'customer',
      });

      logAction(username, roleLabel(selectedRole || 'customer'), 'Login');
      window.dispatchEvent(new Event('login-success'));

      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1000);
    } catch (err) {
      setError('Error verifying OTP. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('role-selection');
    setOtp('');
    setError('');
    setSuccess('');
    setTimer(0);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="flex items-center justify-center gap-2 text-3xl font-bold text-gray-900">
            <span className="text-4xl">🌾</span> Farm To Home
          </h1>
          <p className="mt-2 text-gray-600">
            {step === 'role-selection' ? 'Create your account' : 'Verify OTP'}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {step === 'role-selection' && (
            <form onSubmit={handleSendOTP} className="space-y-6">
              <div>
                <label className="mb-3 block text-sm font-semibold text-gray-700">
                  Select Your Role
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('farmer');
                      setError('');
                    }}
                    className={`rounded-lg border-2 px-4 py-3 font-medium transition ${
                      selectedRole === 'farmer'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                    }`}
                  >
                    👨‍🌾 Farmer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('customer');
                      setError('');
                    }}
                    className={`rounded-lg border-2 px-4 py-3 font-medium transition ${
                      selectedRole === 'customer'
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                    }`}
                  >
                    👤 Customer
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="username" className="mb-2 block text-sm font-medium text-gray-700">
                  Username
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 outline-none transition bg-white !text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none transition bg-white !text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 outline-none transition bg-white !text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 outline-none transition bg-white !text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !selectedRole}
                className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white transition hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" /> Sending OTP...
                  </span>
                ) : (
                  'Send OTP to Email'
                )}
              </button>
            </form>
          )}

          {step === 'otp-verification' && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {success && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700">
                  <CheckCircle size={18} />
                  {success}
                </div>
              )}

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-600">OTP sent to:</p>
                <p className="font-semibold text-gray-900">{email}</p>
              </div>

              <div>
                <label htmlFor="otp" className="mb-2 block text-sm font-medium text-gray-700">
                  Enter 6-Digit OTP
                </label>
                <input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full rounded-lg border border-gray-300 px-3 py-3 text-center text-2xl font-bold tracking-widest outline-none transition bg-white !text-gray-900 placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-xs text-blue-600">Time Remaining</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
                  </p>
                </div>
                <div className="rounded-lg bg-orange-50 p-3 text-center">
                  <p className="text-xs text-orange-600">Attempts Left</p>
                  <p className={`text-2xl font-bold ${remainingAttempts > 2 ? 'text-orange-700' : 'text-red-700'}`}>
                    {remainingAttempts}
                  </p>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 font-semibold text-white transition hover:from-green-700 hover:to-emerald-700 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" /> Verifying...
                  </span>
                ) : (
                  'Verify OTP & Login'
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading || !canResend}
                className="w-full rounded-lg border-2 border-green-600 px-4 py-3 font-semibold text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" /> Resending...
                  </span>
                ) : canResend ? (
                  'Resend OTP'
                ) : (
                  `Resend OTP in ${resendTimer}s`
                )}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Back to Form
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          No password needed! We'll send an OTP to your email.
        </p>
      </div>
    </main>
  );
}
