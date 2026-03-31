'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Phone, ArrowLeft, ShieldCheck, Sprout, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../contexts/TranslationContext';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(false);
  const [userType, setUserType] = useState<'farmer' | 'customer'>('customer');
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [isChecking, setIsChecking] = useState(true);
  const { t } = useTranslation();

  // Form States
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    password: '',
    otp: ''
  });

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push('/');
      } else {
        setIsChecking(false);
      }
    }
    checkUser();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-green-700 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Verifying Session...')}</p>
      </div>
    );
  }

  const isPasswordStrong = formData.password.length >= 8 && /[0-9]/.test(formData.password);

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !isPasswordStrong) {
      alert(t("Password must be 8+ characters and include a number."));
      return;
    }
    setStep(2); // Move to OTP
    alert(t("OTP sent to") + " " + formData.phone);
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col items-center justify-center p-6">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-green-700 font-bold">
        <ArrowLeft size={20} /> {t('Back')}
      </Link>

      <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-[40px] p-8">
        <div className="text-center mb-8">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sprout className="text-green-700" size={32} />
          </div>
          <h1 className="text-2xl font-bold">{isLogin ? t('Welcome Back') : t('Create Account')}</h1>
          <p className="text-gray-500 text-sm">{isLogin ? t('Sign in to your farm') : t('Join our agricultural community')}</p>
        </div>

        {/* Farmer/Customer Toggle (Only for Register) */}
        {!isLogin && step === 1 && (
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-6">
            <button
              onClick={() => setUserType('customer')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${userType === 'customer' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
            >
              {t('Customer')}
            </button>
            <button
              onClick={() => setUserType('farmer')}
              className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${userType === 'farmer' ? 'bg-white shadow-sm text-green-700' : 'text-gray-500'}`}
            >
              {t('Farmer')}
            </button>
          </div>
        )}

        <form onSubmit={handleNext} className="space-y-4">
          {step === 1 ? (
            <>
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-4 top-4 text-gray-400" size={18} />
                  <input
                    type="text" placeholder={t('Full Name')} required
                    className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none"
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
              )}
              <div className="relative">
                <Phone className="absolute left-4 top-4 text-gray-400" size={18} />
                <input
                  type="tel" placeholder={t('Phone Number')} required
                  className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none"
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-4 text-gray-400" size={18} />
                <input
                  type="password" placeholder={t('Password')} required
                  className="w-full p-4 pl-12 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none"
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                {!isLogin && (
                  <p className={`text-[10px] mt-1 ml-2 ${isPasswordStrong ? 'text-green-600' : 'text-red-400'}`}>
                    {t('Must be 8+ chars with a number')}
                  </p>
                )}
              </div>
              <button type="submit" className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-green-800 transition-all">
                {isLogin ? t('Sign In') : t('Get OTP')}
              </button>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <ShieldCheck className="mx-auto text-green-600 mb-2" size={40} />
                <p className="text-sm text-gray-600">{t('Enter the 4-digit code sent to your phone')}</p>
              </div>
              <input
                type="text" maxLength={4} placeholder="0 0 0 0" required
                className="w-full p-4 text-center text-2xl tracking-[1rem] bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-green-500 outline-none"
              />
              <button type="button" onClick={() => alert(t("Registered!"))} className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold">
                {t('Verify')} & {isLogin ? t('Login') : t('Register')}
              </button>
              <button onClick={() => setStep(1)} className="w-full text-xs text-gray-400">{t('Back to details')}</button>
            </>
          )}
        </form>

        <div className="mt-8 text-center">
          <button
            onClick={() => { setIsLogin(!isLogin); setStep(1); }}
            className="text-sm text-gray-600"
          >
            {isLogin ? t("Don't have an account?") + " " : t("Already have an account?") + " "}
            <span className="text-green-700 font-bold underline">
              {isLogin ? t('Sign Up') : t('Sign In')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}