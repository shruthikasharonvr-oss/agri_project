'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import { Sprout, User, CheckCircle, Loader2 } from 'lucide-react';
import { useTranslation } from '../../contexts/TranslationContext';

export default function ChooseRolePage() {
    const [loading, setLoading] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [user, setUser] = useState<any>(null);
    const router = useRouter();
    const { t } = useTranslation();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/register');
                return;
            }
            if (user.user_metadata?.role) {
                router.push('/');
                return;
            }
            setUser(user);
            setIsChecking(false);
        };
        checkUser();
    }, [router]);

    const handleSelectRole = async (role: 'farmer' | 'customer') => {
        setLoading(true);
        try {
            // Update via metadata API
            const response = await fetch('/api/auth/update-role', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, role })
            });

            if (!response.ok) throw new Error('Failed to update role');

            // Force session refresh
            await supabase.auth.refreshSession();
            
            router.push('/');
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to save selection. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-green-700" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center">
                <div className="bg-green-100 w-20 h-20 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-green-100">
                    <Sprout className="text-green-700" size={40} />
                </div>
                
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter uppercase mb-2">
                    {t('One Last Step!')}
                </h1>
                <p className="text-gray-500 font-bold mb-10 leading-relaxed uppercase text-[10px] tracking-widest">
                    {t('How would you like to participate in our agricultural revolution?')}
                </p>

                <div className="space-y-4">
                    <button
                        onClick={() => handleSelectRole('customer')}
                        disabled={loading}
                        className="group w-full bg-white border-2 border-gray-100 p-8 rounded-[32px] hover:border-green-600 transition-all text-left relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-gray-900 uppercase">{t('I am a Customer')}</h3>
                            <p className="text-xs text-gray-400 font-medium">{t('I want to buy fresh produce directly from farmers.')}</p>
                        </div>
                        <CheckCircle className="absolute right-6 top-1/2 -translate-y-1/2 text-green-600 opacity-0 group-hover:opacity-100 transition-all" />
                        <div className="absolute top-0 right-0 w-24 h-full bg-green-50/20 skew-x-12 translate-x-10"></div>
                    </button>

                    <button
                        onClick={() => handleSelectRole('farmer')}
                        disabled={loading}
                        className="group w-full bg-white border-2 border-gray-100 p-8 rounded-[32px] hover:border-green-600 transition-all text-left relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <h3 className="text-xl font-black text-gray-900 uppercase">{t('I am a Farmer')}</h3>
                            <p className="text-xs text-gray-400 font-medium">{t('I want to sell my harvest and list adoptions.')}</p>
                        </div>
                        <CheckCircle className="absolute right-6 top-1/2 -translate-y-1/2 text-green-600 opacity-0 group-hover:opacity-100 transition-all" />
                        <div className="absolute top-0 right-0 w-24 h-full bg-blue-50/20 skew-x-12 translate-x-10"></div>
                    </button>
                </div>

                {loading && (
                    <div className="mt-8 flex items-center justify-center gap-2 text-green-700 font-black uppercase text-[10px] tracking-[0.3em]">
                        <Loader2 className="animate-spin" size={16} />
                        {t('Saving Preference...')}
                    </div>
                )}
            </div>
        </div>
    );
}
