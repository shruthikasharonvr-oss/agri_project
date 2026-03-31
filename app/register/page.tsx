'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { validateUsername, validateEmail, validatePhone, validateName, validatePassword, validatePasswordMatch, validateRegistrationForm } from '../lib/validations';
import { User, Lock, Phone, Sprout, ShieldCheck, Mail, Eye, EyeOff, CheckCircle, ArrowLeft, Loader2, LogOut } from 'lucide-react';
import { logAction } from '../lib/logger';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { auth } from '../lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import WelcomeAnimation from '../components/WelcomeAnimation';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Info, 2: Verification
  const [userType, setUserType] = useState<'farmer' | 'customer'>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeName, setWelcomeName] = useState('');
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phone: '',
    password: '',
  });

  const [otp, setOtp] = useState('');
  const [generatedEmailOtp, setGeneratedEmailOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null);

  const validateForm = () => {
    const newErrors: any = {};
    
    // Full Name validation
    const nameError = validateName(formData.fullName);
    if (nameError) {
      newErrors.fullName = nameError;
    }

    // Username validation
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      newErrors.username = usernameError;
    }

    // Email validation
    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    // Phone validation
    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      newErrors.phone = phoneError;
    }

    // Password validation
    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    const checkLocalSession = () => {
      if (localStorage.getItem('loggedIn') === 'true') {
        setIsLoggedIn(true);
      }
      setIsChecking(false);
    };

    checkLocalSession();
  }, []);

  // Re-initialize ReCAPTCHA when checking is done and user is not logged in
  useEffect(() => {
    if (!isChecking && !isLoggedIn && typeof window !== 'undefined' && !recaptchaVerifier.current) {
      const container = document.getElementById('recaptcha-container');
      if (container) {
        try {
          recaptchaVerifier.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
            callback: () => {
              console.log('Recaptcha resolved');
            },
            'expired-callback': () => {
              alert(t('Recaptcha expired, please try again.'));
              window.location.reload();
            }
          });
        } catch (error) {
          console.error("Recaptcha error:", error);
        }
      }
    }
  }, [isChecking, isLoggedIn, t]);

  const handleUserTypeChange = (type: 'customer' | 'farmer') => {
    setUserType(type);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      phone: '',
      password: '',
    });
    setOtp('');
    setStep(1);
    setConfirmationResult(null);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 1. Send Email OTP first
      const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedEmailOtp(emailCode);

      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: formData.email,
          type: 'otp',
          data: {
            otp: emailCode,
            name: formData.fullName
          }
        })
      });

      if (!emailRes.ok) {
        const errorData = await emailRes.json();
        throw new Error(errorData.error || "Failed to send email verification code");
      }

      // 2. Trigger Firebase Phone Auth (Optional)
      const appVerifier = recaptchaVerifier.current;
      if (appVerifier) {
        try {
          const result = await signInWithPhoneNumber(auth, formData.phone, appVerifier);
          setConfirmationResult(result);
        } catch (phoneErr: any) {
          console.warn("Firebase Phone Auth skipped or failed:", phoneErr.message);
          // We don't throw here so the user can still proceed with Email OTP
        }
      }

      setStep(2);
      alert(t("A verification code has been sent to your email: ") + formData.email);
    } catch (error: any) {
      console.error("Registration initiation error:", error);
      alert(t("Failed to start verification") + ": " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Check Email OTP
      if (otp !== generatedEmailOtp) {
        // Fallback: Check if it's the Phone OTP (Firebase)
        if (confirmationResult) {
          try {
            await confirmationResult.confirm(otp);
            // If phone confirms, we allow it
          } catch (err) {
            throw new Error("Invalid verification code. Please check your email.");
          }
        } else {
          throw new Error("Invalid verification code.");
        }
      }

      // Success! Proceed with Supabase registration
      await registerUserInSupabase();
    } catch (error: any) {
      alert(t("Verification failed") + ": " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatError = (error: unknown) => {
    if (!error) return 'Unknown error';
    if (error instanceof Error) return error.message;
    if (typeof error === 'string') return error;

    const maybeSupabase = error as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
      error_description?: string;
    };

    const parts = [
      maybeSupabase.message,
      maybeSupabase.details,
      maybeSupabase.hint,
      maybeSupabase.error_description,
      maybeSupabase.code ? `code=${maybeSupabase.code}` : undefined,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' | ') : JSON.stringify(error);
  };

  const registerUserInSupabase = async () => {
    try {
      const userEmail = formData.email.trim();
      const normalizedUsername = formData.username.trim().toLowerCase();
      console.log("Starting Supabase registration for:", userEmail);

      const { data, error } = await supabase.auth.signUp({
        email: userEmail,
        password: formData.password,
        options: {
          data: {
            username: normalizedUsername,
            full_name: formData.fullName,
            phone: formData.phone,
            real_email: userEmail,
            role: userType,
          }
        }
      });

      if (error) {
        console.error("Auth SignUp Error:", error);
        if (error.message.includes('rate limit')) {
          throw new Error("Supabase is temporarily rate-limiting signups. Please try again in a few minutes.");
        }
        throw error;
      }

      const activeUser = data.user;
      if (!activeUser) {
        throw new Error("User creation succeeded but no user data returned. Check if email confirmation is required.");
      }

      console.log("User created successfully:", activeUser.id);

      const profilePayload = {
        id: activeUser.id,
        username: normalizedUsername,
        full_name: formData.fullName,
        email: userEmail,
        phone_number: formData.phone,
        role: userType,
      };

      // 1. Ensure profile exists in our DB
      let profileError: any = null;

      // If signUp did not return a session (email-confirm flow), client upsert may fail RLS.
      if (data.session) {
        const profileWrite = await supabase
          .from('profiles')
          .upsert([profilePayload], { onConflict: 'id' });
        profileError = profileWrite.error;
      }

      if (profileError) {
        console.error("Profile creation error (client, non-fatal):", formatError(profileError));
      }

      if (!data.session || profileError) {
        try {
          const roleRes = await fetch('/api/auth/update-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: activeUser.id,
              role: userType,
              username: normalizedUsername,
              fullName: formData.fullName,
              email: userEmail,
              phone: formData.phone,
            })
          });

          if (!roleRes.ok) {
            const payload = await roleRes.json().catch(() => ({}));
            console.error(
              "Profile creation fallback error (non-fatal):",
              payload?.error || `HTTP ${roleRes.status}`
            );
          }
        } catch (fallbackErr) {
          console.error("Profile creation fallback exception (non-fatal):", formatError(fallbackErr));
        }
      }
      
      // 2. Try to update Auth Metadata Role via Internal API (Optional/Side-task)
      try {
        const roleRes = await fetch('/api/auth/update-role', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: activeUser.id, role: userType })
        });
        if (!roleRes.ok) {
          const payload = await roleRes.json().catch(() => ({}));
          console.warn("Metadata update returned non-OK status:", payload?.error || roleRes.status);
        }
      } catch (e) {
        console.error("Auth metadata role sync failed (non-fatal):", formatError(e));
      }

      logAction('REGISTER_SUCCESS', { userId: activeUser.id, details: { role: userType, username: formData.username } });

      // Save to localStorage
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("username", formData.fullName);
      localStorage.setItem("role", userType.charAt(0).toUpperCase() + userType.slice(1));

      // 3. UI Transition
      setWelcomeName(formData.fullName);
      setShowWelcome(true);

      // 4. Send Welcome Email (Optional/Side-task)
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: userEmail,
            type: 'welcome',
            data: {
              name: formData.fullName,
              url: window.location.origin
            }
          })
        });
      } catch (emailErr) {
        console.error("Failed to send welcome email:", emailErr);
      }

    } catch (error: any) {
      console.error("Critical Registration Error:", error);
      alert(t("Account creation failed") + ": " + (error.message || "Connection Error"));
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            prompt: 'select_account',
          },
        }
      });
      if (error) {
        if (error.message.includes('not enabled')) {
          alert("Google Sign-In is not enabled for this project yet.\n\nPlease:\n1. Go to Supabase Dashboard -> Authentication -> Providers.\n2. Enable 'Google'.\n3. Add your Client ID and Secret from Google Cloud Console.\n4. Make sure Redirect URIs are correctly configured.");
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error("Auth Exception:", error);
      alert(t("Google Sign-In failed") + ": " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showWelcome) {
    return <WelcomeAnimation name={welcomeName} onComplete={() => router.push('/')} />;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-green-700 mb-4" size={48} />
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Verifying Session...')}</p>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-gray-100 shadow-2xl rounded-[40px] p-10 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-[32px] flex items-center justify-center mx-auto mb-8">
            <CheckCircle className="text-green-700" size={40} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tighter mb-4 uppercase">
            {t('Already Registered')}
          </h2>
          <p className="text-gray-500 font-medium mb-10">
            {t('Your account is active and you are already logged in. Time to farm!')}
          </p>

          <div className="space-y-4">
            <Link href="/">
              <button className="w-full bg-gray-900 text-white p-5 rounded-[24px] font-black uppercase tracking-tighter hover:bg-green-700 transition-all">
                {t('Visit Marketplace')}
              </button>
            </Link>
            <button
              onClick={async () => {
                localStorage.removeItem('loggedIn');
                localStorage.removeItem('username');
                localStorage.removeItem('role');
                await supabase.auth.signOut();
                window.location.href = '/';
              }}
              className="w-full bg-red-50 text-red-600 p-5 rounded-[24px] font-black uppercase tracking-tighter hover:bg-red-100 transition-all flex items-center justify-center gap-3"
            >
              <LogOut size={20} />
              <span>{t('Logout Now')}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen fixed inset-0 overflow-auto"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1574943320219-553eb213f72d?q=80&w=2000&auto=format&fit=crop')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        zIndex: 0
      }}
    >
      {/* Background overlay */}
      <div 
        className="fixed inset-0" 
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          zIndex: 1
        }}
      ></div>

      {/* Form container - positioned on top */}
      <div 
        className="fixed inset-0 flex items-center justify-center p-4"
        style={{ zIndex: 10 }}
      >
        <div id="recaptcha-container"></div>
        
        {/* Form card */}
        <div className="w-full max-w-md bg-white rounded-[32px] shadow-2xl p-10 border border-gray-100 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-500">

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Sprout className="text-green-700" size={32} />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-2">{step === 1 ? t('Create Account') : t('Verify Identity')}</h1>
            <p className="text-gray-500 text-xs font-medium">{step === 1 ? t('Join our farming community') : t('Please enter the 6-digit code sent to') + ' ' + formData.email}</p>
          </div>

          <div className="space-y-6">
          {step === 1 ? (
            <>
              <div className="mb-6">
                <label className="block text-xs font-black text-gray-700 mb-3 uppercase tracking-wider">{t('Select your role')}</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange('customer')}
                    className={`p-4 rounded-2xl border-2 font-bold uppercase text-sm transition-all duration-200 flex items-center justify-center gap-2 ${userType === 'customer' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'}`}
                  >
                    👥 {t('Customer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUserTypeChange('farmer')}
                    className={`p-4 rounded-2xl border-2 font-bold uppercase text-sm transition-all duration-200 flex items-center justify-center gap-2 ${userType === 'farmer' ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'}`}
                  >
                    🌾 {t('Farmer')}
                  </button>\n                </div>\n              </div>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                  <input
                    type="text"
                    value={formData.username}
                    placeholder={t('Username')}
                    required
                    className={`w-full p-4 pl-12 bg-white border-2 rounded-2xl outline-none !text-gray-900 placeholder-gray-400 font-medium transition-all duration-200 ${
                      errors.username
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                    }`}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      if (errors.username) setErrors({ ...errors, username: null });
                    }}
                  />
                  {errors.username && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase">{errors.username}</p>}
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    placeholder={t('Email Address')}
                    required
                    className={`w-full p-4 pl-12 bg-white border-2 rounded-2xl outline-none !text-gray-900 placeholder-gray-400 font-medium transition-all duration-200 ${
                      errors.email
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                    }`}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: null });
                    }}
                  />
                  {errors.email && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase">{errors.email}</p>}
                </div>

                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                  <input
                    type="text"
                    value={formData.fullName}
                    placeholder={t('Full Name')}
                    required
                    className={`w-full p-4 pl-12 bg-white border-2 rounded-2xl outline-none !text-gray-900 placeholder-gray-400 font-medium transition-all duration-200 ${
                      errors.fullName
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                    }`}
                    onChange={(e) => {
                      setFormData({ ...formData, fullName: e.target.value });
                      if (errors.fullName) setErrors({ ...errors, fullName: null });
                    }}
                  />
                  {errors.fullName && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase">{errors.fullName}</p>}
                </div>

                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                  <input
                    type="tel"
                    value={formData.phone}
                    placeholder={t('Phone (+91XXXXXXXXXX)')}
                    required
                    className={`w-full p-4 pl-12 bg-white border-2 rounded-2xl outline-none !text-gray-900 placeholder-gray-400 font-medium transition-all duration-200 ${
                      errors.phone
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                    }`}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      if (errors.phone) setErrors({ ...errors, phone: null });
                    }}
                  />
                  {errors.phone && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase">{errors.phone}</p>}
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    placeholder={t('Password (8+ chars)')}
                    required
                    className={`w-full p-4 pl-12 pr-12 bg-white border-2 rounded-2xl outline-none !text-gray-900 placeholder-gray-400 font-medium transition-all duration-200 ${
                      errors.password
                        ? 'border-red-400 focus:border-red-500'
                        : 'border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-100'
                    }`}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: null });
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 transition-all"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 font-bold mt-2 ml-2 uppercase">{errors.password}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-all disabled:opacity-50"
                >
                  {loading ? t('Processing...') : t('Continue')}
                </button>

            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                <input
                  type="text"
                  value={otp}
                  placeholder={t('6-digit OTP')}
                  required
                  maxLength={6}
                  className="w-full p-4 pl-12 bg-white border-2 border-gray-300 rounded-2xl outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 !text-gray-900 placeholder-gray-400 tracking-[0.25em] text-center font-bold transition-all duration-200"
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? t('Verifying...') : (
                  <>
                    <CheckCircle size={20} />
                    {t('Verify & Register')}
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-gray-400 text-sm font-medium hover:text-green-700 flex items-center justify-center gap-2"
              >
                <ArrowLeft size={16} />
                {t('Change details')}
              </button>
            </form>
          )}

          {step === 1 && (
            <>
              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase tracking-widest">{t('or')}</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full border-2 border-gray-100 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-black"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                {t('Continue with Google')}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 text-center text-sm">
            <p className="text-gray-500">
              {t('Already have an account?')}
              <Link href="/login" className="text-green-700 font-bold underline ml-1">{t('Sign In')}</Link>
            </p>
          </div>
        </div>

        {/* End form card */}
      </div>
    </div>
  );
}