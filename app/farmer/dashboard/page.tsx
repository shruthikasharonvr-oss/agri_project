'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    LayoutDashboard, Package, Heart, MessageSquare,
    TrendingUp, IndianRupee, Users, ArrowUpRight,
    Loader2, PlusCircle, CheckCircle2, Clock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../../contexts/TranslationContext';

export default function FarmerDashboard() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState<any>(null);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalAdoptions: 0,
        totalSales: 0,
        activeChats: 0
    });
    const [recentAdoptions, setRecentAdoptions] = useState<any[]>([]);

    useEffect(() => {
        async function fetchDashboardData() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/auth');
                return;
            }

            // 1. Fetch Profile
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single();
            if (profileData?.role !== 'farmer') {
                router.push('/');
                return;
            }
            setProfile(profileData);

            // 2. Fetch Stats
            const [productsRes, adoptionsRes, messagesRes] = await Promise.all([
                supabase.from('products').select('id', { count: 'exact' }).eq('farmer_id', user.id),
                supabase.from('adoptions').select('*').eq('farmer_id', user.id),
                supabase.from('messages').select('id').or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            ]);

            setStats({
                totalProducts: productsRes.count || 0,
                totalAdoptions: adoptionsRes.data?.length || 0,
                totalSales: 0, // Mocked for now
                activeChats: messagesRes.data?.length || 0
            });

            setRecentAdoptions(adoptionsRes.data?.slice(0, 3) || []);
            setLoading(false);
        }
        fetchDashboardData();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-green-700" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* TOP BAR */}
            <div className="bg-white border-b p-6 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg shadow-green-100">
                            {profile?.full_name?.[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
                                {t('Namaste')}, {profile?.full_name?.split(' ')[0]}
                            </h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('Farmer ID')}: #{profile?.id?.slice(0, 8)}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/add-product">
                            <button className="bg-green-700 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-green-800 transition-all shadow-xl shadow-green-100 uppercase tracking-tighter text-sm">
                                <PlusCircle size={18} /> {t('Sell Harvest')}
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6 space-y-8 mt-4">
                {/* STATS GRID */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4"><Package size={20} /></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Total Products')}</p>
                        <div className="flex items-baseline justify-between">
                            <h2 className="text-3xl font-black text-gray-900">{stats.totalProducts}</h2>
                            <span className="text-xs font-bold text-green-600 flex items-center gap-1">+2 <ArrowUpRight size={12} /></span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-4"><Heart size={20} /></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Adoptions')}</p>
                        <h2 className="text-3xl font-black text-gray-900">{stats.totalAdoptions}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center mb-4"><IndianRupee size={20} /></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Est. Earning')}</p>
                        <h2 className="text-3xl font-black text-gray-900">₹{stats.totalSales.toLocaleString()}</h2>
                    </div>
                    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
                        <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-4"><MessageSquare size={20} /></div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{t('Active Chats')}</p>
                        <h2 className="text-3xl font-black text-gray-900">{stats.activeChats}</h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* RECENT ADOPTIONS */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">{t('Recent Adoptions')}</h3>
                            <Link href="/adoptions" className="text-xs font-bold text-green-700 hover:underline">{t('View All')}</Link>
                        </div>

                        <div className="space-y-4">
                            {recentAdoptions.length > 0 ? recentAdoptions.map((asset) => (
                                <div key={asset.id} className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all">
                                    <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center text-4xl shrink-0">
                                        {asset.asset_type === 'Animal' ? '🐄' : '🌾'}
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-bold text-gray-800 uppercase text-sm mb-1">{t(asset.title)}</h4>
                                        <div className="flex gap-4">
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                <Clock size={12} /> {t('Status')}: <span className="text-green-600">{t(asset.status)}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                                                <TrendingUp size={12} /> {t('Goal')}: ₹{asset.target_funding.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <Link href={`/adoptions/add`} className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-green-700 group-hover:text-white transition-all">
                                        <ArrowUpRight size={20} />
                                    </Link>
                                </div>
                            )) : (
                                <div className="bg-white p-12 rounded-[40px] text-center border-2 border-dashed border-gray-100">
                                    <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">{t('No active adoptions yet')}</p>
                                    <Link href="/adoptions/add" className="text-green-700 text-xs font-black underline mt-2 block">{t('List your first asset')}</Link>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* QUICK ACTIONS & NOTIFICATIONS */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-6 px-2">{t('Marketplace Tips')}</h3>
                            <div className="bg-green-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-green-400 text-[10px] font-black uppercase tracking-widest mb-2">{t('Daily Tip')}</p>
                                    <h4 className="text-lg font-bold mb-4 leading-tight">{t('Update your photos every week to build trust.')}</h4>
                                    <p className="text-green-100/70 text-xs leading-relaxed mb-6">
                                        {t('Investors and customers love seeing real growth. Periodic updates increase your funding rate by 40%.')}
                                    </p>
                                    <button className="bg-white text-green-900 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-tighter">
                                        {t('Learn More')}
                                    </button>
                                </div>
                                <div className="absolute top-0 right-0 opacity-10 p-4">
                                    <TrendingUp size={150} />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-sm">
                            <h3 className="text-sm font-black text-gray-900 uppercase tracking-tighter mb-4">{t('Platform Status')}</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <p className="text-xs font-bold text-gray-600">{t('Marketplace Live')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <p className="text-xs font-bold text-gray-600">{t('Real-time Sync Active')}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                    <p className="text-xs font-bold text-gray-600">{t('Support Online')}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
