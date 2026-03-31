'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { LogIn, UserPlus, Sprout, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '../contexts/TranslationContext';

export default function LoginNagModal() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
        };
        checkAuth();

        // Timer removed to prevent automatic nag modal 
    }, [isLoggedIn]);

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: {
                    prompt: 'select_account',
                },
            }
        });
    };

    if (isLoggedIn) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 50 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 50 }}
                        className="w-full max-w-lg bg-white rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.3)] border-4 border-green-500/20"
                    >
                        <div className="p-10 text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-[32px] flex items-center justify-center mx-auto mb-8 animate-bounce">
                                <Sprout className="text-green-700" size={40} />
                            </div>

                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter mb-4 uppercase">
                                {t('Stop Right There!')}
                            </h2>
                            <p className="text-gray-500 font-medium text-lg leading-relaxed mb-10">
                                {t('You\'ve been exploring our fields for 30 seconds. To see the freshest crops and interact with our farmers, you need to join the community.')}
                            </p>

                            <div className="space-y-4">
                                <button
                                    onClick={handleGoogleLogin}
                                    className="w-full bg-white border-2 border-gray-100 text-gray-700 p-6 rounded-[24px] font-black uppercase tracking-tighter flex items-center justify-center gap-4 hover:border-green-500 hover:bg-green-50 transition-all group"
                                >
                                    <img src="https://www.google.com/favicon.ico" className="w-6 h-6 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
                                    <span>{t('Continue with Google')}</span>
                                </button>

                                <div className="grid grid-cols-2 gap-4">
                                    <Link href="/login" className="flex-1">
                                        <button className="w-full bg-gray-900 text-white p-5 rounded-[24px] font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-green-700 transition-all text-xs">
                                            <LogIn size={18} />
                                            <span>{t('Login')}</span>
                                        </button>
                                    </Link>
                                    <Link href="/register" className="flex-1">
                                        <button className="w-full bg-green-700 text-white p-5 rounded-[24px] font-black uppercase tracking-tighter flex items-center justify-center gap-3 hover:bg-gray-900 transition-all text-xs">
                                            <UserPlus size={18} />
                                            <span>{t('Sign Up')}</span>
                                        </button>
                                    </Link>
                                </div>
                            </div>

                            <p className="mt-8 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                                <ShieldAlert size={12} className="text-red-500" />
                                {t('Registration is free for all farmers and customers')}
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
