'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';
import {
    Camera, Loader2, ArrowLeft,
    HelpCircle, CheckCircle2, AlertCircle,
    TrendingUp, Ruler, IndianRupee, Info, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useTranslation } from '../../contexts/TranslationContext';
import { logAction } from '../../lib/logger';

export default function AddAdoptionPage() {
    const { t } = useTranslation();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        asset_type: '',
        title: '',
        description: '',
        target_funding: '',
        profit_share: '30',
        sq_ft: '1000',
        location: ''
    });

    useEffect(() => {
        async function checkRole() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('role, location')
                .eq('id', user.id)
                .single();

            if (!profile || profile.role !== 'farmer') {
                router.push('/adoptions');
                return;
            }

            setUserRole(profile.role);
            setFormData(prev => ({ ...prev, location: profile.location || '' }));
            setLoading(false);
        }
        checkRole();
    }, [router]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            let image_url = '';
            if (image) {
                const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('chat-media')
                    .upload(`adoptions/${fileName}`, image);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chat-media')
                    .getPublicUrl(`adoptions/${fileName}`);

                image_url = publicUrl;
            }

            const assetData = {
                farmer_id: user.id,
                asset_type: formData.asset_type,
                title: formData.title,
                description: formData.description,
                target_funding: parseFloat(formData.target_funding),
                profit_share: parseInt(formData.profit_share),
                sq_ft: parseInt(formData.sq_ft),
                location: formData.location,
                image_url: image_url,
                status: 'Available',
                current_funding: 0
            };

            const { error } = await supabase.from('adoptions').insert([assetData]);

            if (error) throw error;

            await logAction('ADOPTION_SUCCESS', {
                userId: user.id,
                details: {
                    assetTitle: formData.title,
                    target: formData.target_funding,
                    assetType: formData.asset_type,
                },
            });

            router.push('/farmer/dashboard');
        } catch (error: any) {
            alert('Failed to list adoption: ' + error.message);
        } finally {
            setSubmitting(false);
        }
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

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-green-500/30 font-sans pb-24">
            <nav className="p-8 max-w-7xl mx-auto flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-950 transition-colors"
                >
                    <ArrowLeft size={16} /> {t('Back')}
                </button>
                <div className="px-4 py-1.5 bg-green-50 border border-green-100 rounded-full flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">{t('Farmer Portal v2.0')}</span>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row gap-16">
                    {/* LEFT CHANNEL: Guidance & Assets */}
                    <div className="flex-1 space-y-12">
                        <div className="space-y-6">
                            <h1 className="text-6xl font-black text-gray-950 tracking-tighter uppercase leading-[0.85]">
                                List your <br /> <span className="text-green-700">Harvest.</span>
                            </h1>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                                {t('Direct Investment from soil to city supporters')}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-gray-50 p-8 rounded-[48px] border border-white shadow-inner">
                                <h3 className="text-sm font-black text-gray-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                                    <TrendingUp size={18} className="text-green-600" /> {t('Yield Factor Guide')}
                                </h3>
                                <p className="text-xs text-gray-400 font-medium leading-relaxed mb-6">
                                    {t('Assets with a 3D digital twin and weekly media updates receive 2.5x more funding than static listings.')}
                                </p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-gray-700">{t('Verified Soil Quality')}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                                        <span className="text-[10px] font-black uppercase text-gray-700">{t('Transparent ROI sharing')}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-orange-900 text-white p-10 rounded-[56px] shadow-2xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <p className="text-orange-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4">{t('Farmer Safety')}</p>
                                    <h4 className="text-2xl font-black mb-4 uppercase leading-none">{t('Guaranteed <br/> Baseline.')}</h4>
                                    <p className="text-orange-100/60 text-xs leading-relaxed mb-8">
                                        {t('The platform ensures you get 70% of the harvest value upfront, covering all your initial labor and seed costs.')}
                                    </p>
                                    <div className="flex items-center gap-2 font-black text-xs uppercase text-orange-400">
                                        <ShieldCheck size={16} /> {t('Platform Insured')}
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-10 opacity-10">
                                    <SproutIcon size={150} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT CHANNEL: Listing Form */}
                    <div className="flex-[1.5]">
                        <form onSubmit={handleSubmit} className="space-y-10">
                            {/* Image Upload Area */}
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                onClick={() => document.getElementById('asset-photo')?.click()}
                                className="group relative aspect-[16/10] bg-gray-50 border-2 border-dashed border-gray-100 rounded-[56px] flex flex-col items-center justify-center cursor-pointer hover:bg-green-50/50 hover:border-green-200 transition-all overflow-hidden shadow-inner"
                            >
                                <AnimatePresence mode="wait">
                                    {imagePreview ? (
                                        <motion.img
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            src={imagePreview}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="flex flex-col items-center text-center px-10"
                                        >
                                            <div className="w-20 h-20 bg-white rounded-[32px] flex items-center justify-center text-gray-300 mb-6 shadow-sm group-hover:scale-110 group-hover:text-green-600 transition-all">
                                                <Camera size={32} />
                                            </div>
                                            <h4 className="text-lg font-black text-gray-900 uppercase tracking-tighter mb-2">{t('Hero Asset Image')}</h4>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('Tap to record your farm\'s life')}</p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <input id="asset-photo" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Asset Designation')}</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. 1 Acre Turmeric Plot"
                                        className="w-full p-6 bg-gray-50 rounded-[28px] border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 outline-none transition-all font-bold text-gray-950 placeholder:text-gray-300"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Domain Category')}</label>
                                    <select
                                        required
                                        className="w-full p-6 bg-gray-50 rounded-[28px] border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 outline-none transition-all font-bold text-gray-950 appearance-none cursor-pointer"
                                        value={formData.asset_type}
                                        onChange={(e) => setFormData({ ...formData, asset_type: e.target.value })}
                                    >
                                        <option value="">{t('Select Domain')}</option>
                                        <option value="Animal">{t('Animal (Cattle)')}</option>
                                        <option value="Land">{t('Land (Plots)')}</option>
                                        <option value="Tree">{t('Tree (Orchards)')}</option>
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                        <IndianRupee size={12} /> {t('Funding Ceiling')}
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        placeholder="Enter Amount"
                                        className="w-full p-6 bg-gray-50 rounded-[28px] border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 outline-none transition-all font-black text-gray-950 placeholder:text-gray-300"
                                        value={formData.target_funding}
                                        onChange={(e) => setFormData({ ...formData, target_funding: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                        <TrendingUp size={12} /> {t('ROI Promise (%)')}
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full p-6 bg-gray-50 rounded-[28px] border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 outline-none transition-all font-black text-green-700"
                                        value={formData.profit_share}
                                        onChange={(e) => setFormData({ ...formData, profit_share: e.target.value })}
                                    />
                                </div>
                                
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                        <Ruler size={12} /> {t('Measured Area (SQ. FT.)')}
                                    </label>
                                    <input
                                        required
                                        type="number"
                                        className="w-full p-6 bg-gray-50 rounded-[28px] border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 outline-none transition-all font-black text-gray-950"
                                        value={formData.sq_ft}
                                        onChange={(e) => setFormData({ ...formData, sq_ft: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-3 flex items-end">
                                    <div className="w-full p-6 bg-green-50 rounded-[28px] border border-green-100 flex items-center gap-4">
                                        <Info size={20} className="text-green-700 shrink-0" />
                                        <p className="text-[9px] font-black text-green-700 uppercase tracking-wider leading-relaxed">
                                            {t('Ensure GPS location is enabled during harvest for tracking validation.')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-4">{t('Asset Narrative')}</label>
                                <textarea
                                    required
                                    rows={5}
                                    placeholder={t('Tell the story of your asset. What seeds? What organic methods? Why adopt it?')}
                                    className="w-full p-8 bg-gray-50 rounded-[40px] border border-transparent focus:border-green-100 focus:bg-white focus:ring-4 focus:ring-green-50/50 outline-none transition-all font-medium text-gray-800 placeholder:text-gray-300 resize-none leading-relaxed"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                disabled={submitting}
                                type="submit"
                                className="w-full bg-gray-900 text-white py-8 rounded-[36px] font-black uppercase tracking-tighter flex items-center justify-center gap-4 hover:bg-green-700 active:scale-[0.98] transition-all shadow-[0_30px_60px_rgba(0,0,0,0.1)] disabled:opacity-50"
                            >
                                {submitting ? <Loader2 className="animate-spin" /> : <Plus size={24} />}
                                {t('Initialize Asset Listing')}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Icons
function SproutIcon({ size, className }: { size: number, className?: string }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7 2 10 10-5 5-10-10Z"/><path d="M2 15h5"/><path d="M7 15l4-4"/><path d="M12 9l5-5"/><path d="m21 21-6-6"/></svg>;
}
function ShieldCheck({ size, className }: { size: number, className?: string }) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
}
