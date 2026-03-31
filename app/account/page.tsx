'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import {
    User, Settings, ShoppingBag, Heart, LogOut,
    ChevronRight, MapPin, Phone, Mail, Loader2,
    Calendar, TrendingUp, ArrowRight, Package,
    Clock, ThumbsUp, Wallet, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/TranslationContext';
import { logAction } from '../lib/logger';

export default function CustomerDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [myAdoptions, setMyAdoptions] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const [profileRes, adoptionsRes, ordersRes] = await Promise.all([
                supabase.from('profiles').select('*').eq('id', user.id).single(),
                supabase.from('adoptions').select('*, profiles(full_name)').eq('adopted_by_id', user.id),
                supabase.from('orders').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            ]);

            setProfile(profileRes.data);
            setMyAdoptions(adoptionsRes.data || []);
            setOrders(ordersRes.data || []);
            setLoading(false);
        }
        fetchDashboardData();
    }, [router]);

    const handleSignOut = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        await logAction('LOGOUT', { userId: user?.id });
        await supabase.auth.signOut();
        router.push('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                    <Loader2 className="text-green-700" size={48} />
                </motion.div>
            </div>
        );
    }

    const totalSpent = orders.reduce((acc, o) => acc + (o.total_amount || 0), 0);
    const activeAdoptions = myAdoptions.filter(a => a.status === 'Adopted').length;

    return (
        <div className="min-h-screen bg-[#fafafa] text-gray-900 selection:bg-green-500/30 font-sans pb-24">
            {/* 1. Dashboard Header (Glassmorphic) */}
            <div className="bg-white border-b border-gray-100 sticky top-16 z-30 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <motion.div 
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            className="w-20 h-20 bg-green-700 rounded-[32px] flex items-center justify-center text-white text-3xl font-black shadow-2xl shadow-green-100"
                        >
                            {profile?.full_name?.[0].toUpperCase()}
                        </motion.div>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-black tracking-tighter uppercase">{profile?.full_name}</h1>
                                <div className="bg-green-50 px-3 py-1 rounded-full border border-green-100 flex items-center gap-1.5">
                                    <ShieldCheck size={12} className="text-green-700" />
                                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t('Verified Member')}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-400 uppercase tracking-tighter">
                                <span className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"><Mail size={14} className="text-gray-300" /> {profile?.email}</span>
                                {profile?.phone_number && <span className="flex items-center gap-1.5 hover:text-gray-900 transition-colors cursor-pointer"><Phone size={14} className="text-gray-300" /> {profile?.phone_number}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <button className="w-14 h-14 bg-white border border-gray-100 rounded-[22px] flex items-center justify-center text-gray-400 hover:text-green-700 hover:border-green-100 hover:bg-green-50 transition-all shadow-sm">
                            <Settings size={24} />
                        </button>
                        <button
                            onClick={handleSignOut}
                            className="w-14 h-14 bg-white border border-gray-100 rounded-[22px] flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
                        >
                            <LogOut size={24} />
                        </button>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 pt-12">
                {/* 2. Key Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Contribution', value: `₹${totalSpent.toLocaleString()}`, icon: <Wallet size={24} />, color: 'bg-green-50 text-green-700' },
                        { label: 'Active Adoptions', value: activeAdoptions, icon: <Heart size={24} />, color: 'bg-orange-50 text-orange-600' },
                        { label: 'Fair Trade Impact', value: '1.4x', icon: <TrendingUp size={24} />, color: 'bg-blue-50 text-blue-600' },
                        { label: 'Fresh Harvests', value: orders.length, icon: <Package size={24} />, color: 'bg-purple-50 text-purple-600' }
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center text-center group"
                        >
                            <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                                {stat.icon}
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 tracking-tighter mb-1">{stat.value}</h3>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t(stat.label)}</p>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* 3. Left Channel: Adoptions & Impact */}
                    <div className="lg:col-span-8 flex flex-col gap-10">
                        {/* ADOPTIONS SECTION */}
                        <section className="space-y-8">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{t('Agricultural Investments')}</h2>
                                <Link href="/adoptions" className="text-xs font-black text-green-700 flex items-center gap-1.5 hover:underline decoration-2">
                                    {t('Browse Marketplace')} <ArrowRight size={14} />
                                </Link>
                            </div>

                            <div className="space-y-6">
                                {myAdoptions.length > 0 ? myAdoptions.map((asset) => (
                                    <motion.div 
                                        key={asset.id} 
                                        whileHover={{ x: 10 }}
                                        className="bg-white p-2 pr-10 rounded-[48px] border border-gray-50 shadow-sm flex items-center gap-8 group transition-all"
                                    >
                                        <div className="w-40 h-40 bg-gray-50 rounded-[40px] overflow-hidden shrink-0 border border-white shadow-inner">
                                            {asset.image_url ? (
                                                <img src={asset.image_url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">
                                                    {asset.asset_type === 'Animal' ? '🐄' : asset.asset_type === 'Tree' ? '🌳' : '🌾'}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                                <span className="text-[10px] font-black text-green-600 uppercase tracking-widest leading-none">{t('Active Growth')}</span>
                                            </div>
                                            <h3 className="text-2xl font-black text-gray-900 tracking-tighter uppercase mb-4">{t(asset.title)}</h3>
                                            <div className="flex flex-wrap gap-8">
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('Farmer')}</span>
                                                    <span className="text-sm font-bold text-gray-800">{asset.profiles?.full_name}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('Maturity')}</span>
                                                    <span className="text-sm font-black text-green-600">82%</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('Est. ROI')}</span>
                                                    <span className="text-sm font-black text-orange-500">+{asset.profit_share}%</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Link href="/adoptions/live-track">
                                            <button className="bg-gray-900 text-white w-14 h-14 rounded-full flex items-center justify-center hover:bg-green-700 transition-all shadow-xl group-hover:scale-110">
                                                <ArrowRight size={24} />
                                            </button>
                                        </Link>
                                    </motion.div>
                                )) : (
                                    <div className="bg-white p-20 rounded-[56px] text-center border-2 border-dashed border-gray-100 flex flex-col items-center">
                                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-8">
                                            <Heart size={48} />
                                        </div>
                                        <h3 className="text-2xl font-black text-gray-400 uppercase tracking-tighter mb-4">{t('No Assets Adopted')}</h3>
                                        <Link href="/adoptions">
                                            <button className="bg-green-700 text-white px-10 py-5 rounded-[24px] font-black uppercase tracking-tighter shadow-large hover:scale-105 transition-all">
                                                {t('Discover Farm Gains')}
                                            </button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* ORDER HISTORY SECTION */}
                        <section className="space-y-8">
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter px-2">{t('Recent Fresh Harvests')}</h2>
                            <div className="bg-white rounded-[48px] border border-gray-100 shadow-sm overflow-hidden">
                                {orders.length > 0 ? (
                                    <div className="divide-y divide-gray-50">
                                        {orders.map((order) => (
                                            <div key={order.id} className="p-8 hover:bg-gray-50/50 transition-colors flex items-center justify-between">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-green-700">
                                                        <Package size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{new Date(order.created_at).toLocaleDateString()}</p>
                                                        <h4 className="font-black text-gray-900 uppercase tracking-tight">Order #{order.id.slice(0, 8)}</h4>
                                                        <p className="text-xs text-green-600 font-bold uppercase">{order.status}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-black text-gray-900">₹{order.total_amount.toLocaleString()}</p>
                                                    <button className="text-[10px] font-black text-green-700 uppercase tracking-[0.2em] border-b border-green-700/30 hover:border-green-700 transition-all">Details</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-20 text-center">
                                        <p className="text-gray-400 font-bold uppercase tracking-widest">{t('No orders found')}</p>
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* 4. Right Channel: Support & Community */}
                    <div className="lg:col-span-4 flex flex-col gap-10">
                        {/* PLATFORM IMPACT CARD */}
                        <div className="bg-gray-900 rounded-[56px] p-10 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-6">
                                    <TrendingUp size={16} className="text-green-500" />
                                    <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{t('Impact Summary')}</span>
                                </div>
                                <h3 className="text-4xl font-black tracking-tighter leading-[0.9] mb-6 uppercase">
                                    Feeding <br /> <span className="text-green-500">Community.</span>
                                </h3>
                                <p className="text-gray-400 text-xs font-medium leading-relaxed mb-10">
                                    {t('Your purchases have directly supported 5 farming families this season. Your carbon footprint is 60% lower than retail shopping.')}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <ThumbsUp size={16} className="text-green-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('12kg CO2 Saved')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Clock size={16} className="text-green-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{t('Direct Sourcing')}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="absolute top-0 right-0 p-10 opacity-5">
                                <Sprout size={200} />
                            </div>
                        </div>

                        {/* SUPPORT TICKET */}
                        <div className="bg-[#fff9ef] border border-orange-100 rounded-[48px] p-10">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-2">{t('Support Sanctuary')}</h3>
                            <p className="text-gray-500 text-xs font-medium leading-relaxed mb-10">
                                {t('Need help with your order or investment? Our farmers are one tap away.')}
                            </p>
                            <Link href="/chat">
                                <button className="w-full bg-white text-gray-950 py-5 rounded-[24px] font-black uppercase tracking-tighter shadow-sm hover:shadow-xl transition-all flex items-center justify-center gap-3 border border-orange-50">
                                    <MessageSquare size={20} /> {t('Start Chat')}
                                </button>
                            </Link>
                        </div>

                        {/* QUICK ACCOUNT LINKS */}
                        <div className="bg-white border border-gray-100 rounded-[48px] p-4 flex flex-col gap-2">
                             <button className="flex items-center justify-between p-6 hover:bg-gray-50 rounded-[32px] transition-all group">
                                <div className="flex items-center gap-4">
                                    <MapPin size={18} className="text-gray-400 group-hover:text-green-700" />
                                    <span className="text-xs font-black uppercase tracking-tight">{t('Addresses')}</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-200 group-hover:text-gray-400" />
                             </button>
                             <button className="flex items-center justify-between p-6 hover:bg-gray-50 rounded-[32px] transition-all group">
                                <div className="flex items-center gap-4">
                                    <Settings size={18} className="text-gray-400 group-hover:text-green-700" />
                                    <span className="text-xs font-black uppercase tracking-tight">{t('Account Settings')}</span>
                                </div>
                                <ChevronRight size={18} className="text-gray-200 group-hover:text-gray-400" />
                             </button>
                        </div>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                .shadow-large {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}

// Minimal icons for local use
function Sprout({ size, className }: { size: number, className?: string }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7 2 10 10-5 5-10-10Z"/><path d="M2 15h5"/><path d="M7 15l4-4"/><path d="M12 9l5-5"/><path d="m21 21-6-6"/></svg>;
}
function MessageSquare({ size, className }: { size: number, className?: string }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
}
