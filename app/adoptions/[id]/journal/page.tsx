'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { useTranslation } from '../../../contexts/TranslationContext';
import {
    Clock, Heart, Camera, Video,
    Share2, ArrowLeft, Loader2, X,
    Image as ImageIcon, PlusCircle, Sprout, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function GrowthJournalPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();

    const [loading, setLoading] = useState(true);
    const [asset, setAsset] = useState<any>(null);
    const [userRole, setUserRole] = useState<'farmer' | 'customer'>('customer');
    const [updates, setUpdates] = useState<any[]>([]);

    // Farmer Upload State
    const [isUploading, setIsUploading] = useState(false);
    const [uploadCaption, setUploadCaption] = useState('');
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploadPreview, setUploadPreview] = useState<string | null>(null);

    useEffect(() => {
        async function fetchJournal() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
                setUserRole(profile?.role || 'customer');
            }

            // Fetch Asset Info
            const { data: assetData } = await supabase
                .from('adoptions')
                .select('*, profiles(full_name)')
                .eq('id', id)
                .single();

            if (assetData) {
                setAsset(assetData);
            } else {
                // Fallback for demo
                setAsset({
                    id: id,
                    title: "Malnad Gidda Calf",
                    asset_type: "Animal",
                    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    profiles: { full_name: "Farmer Krishna" }
                });
            }

            // Try to fetch updates (Assuming 'adoption_updates' table)
            const { data: updatesData, error: updatesError } = await supabase
                .from('adoption_updates')
                .select('*')
                .eq('adoption_id', id)
                .order('created_at', { ascending: false });

            if (updatesData && !updatesError) {
                setUpdates(updatesData);
            } else {
                // Fallback Mock Updates for UI demonstration
                setUpdates([
                    {
                        id: '3',
                        caption: "The calf is now 1 month old! Very active and healthy. Weight has increased by 12kg.",
                        media_url: "https://images.unsplash.com/photo-1546445317-29f4545d9fae?auto=format&fit=crop&q=80&w=800",
                        media_type: 'image',
                        created_at: new Date().toISOString()
                    },
                    {
                        id: '2',
                        caption: "First vaccination done today. Diet includes milk and fresh green fodder.",
                        media_url: null,
                        media_type: 'text',
                        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
                    },
                    {
                        id: '1',
                        caption: "Welcome to the farm! The adoption is officially initiated.",
                        media_url: "https://images.unsplash.com/photo-1596733430284-f743727520d6?auto=format&fit=crop&q=80&w=800",
                        media_type: 'image',
                        created_at: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString()
                    }
                ]);
            }

            setLoading(false);
        }
        fetchJournal();
    }, [id]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setUploadFile(file);
            setUploadPreview(URL.createObjectURL(file));
        }
    };

    const handlePostUpdate = async () => {
        if (!uploadCaption.trim() && !uploadFile) return;
        setIsUploading(true);

        try {
            let media_url = null;
            let media_type = 'text';

            if (uploadFile) {
                const fileName = `journal-${Date.now()}-${Math.random().toString(36).substring(7)}`;
                const { error: uploadError } = await supabase.storage
                    .from('chat-media') // Reusing existing bucket for simplicity
                    .upload(`journal/${fileName}`, uploadFile);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('chat-media')
                    .getPublicUrl(`journal/${fileName}`);

                media_url = publicUrl;
                media_type = uploadFile.type.startsWith('video/') ? 'video' : 'image';
            }

            const newUpdate = {
                adoption_id: id,
                caption: uploadCaption,
                media_url,
                media_type
            };

            const { data, error } = await supabase.from('adoption_updates').insert(newUpdate).select().single();

            if (!error && data) {
                setUpdates([data, ...updates]);
            } else {
                // If table doesn't exist, just update local state for demo
                setUpdates([{ ...newUpdate, id: Date.now().toString(), created_at: new Date().toISOString() }, ...updates]);
            }

            setUploadCaption('');
            setUploadFile(null);
            setUploadPreview(null);
        } catch (error: any) {
            alert(t("Failed to post update") + ": " + error.message);
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin text-green-700" size={48} />
            </div>
        );
    }

    const startAge = new Date(asset?.created_at).getTime();
    const currentAgeDays = Math.floor((Date.now() - startAge) / (1000 * 3600 * 24));

    return (
        <div className="min-h-screen bg-gray-50 pb-20 font-sans">

            {/* HERO HEADER */}
            <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Sprout size={14} className="text-green-600" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-700">{t('Growth Journal')}</span>
                            </div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none uppercase">{t(asset?.title || 'Asset Tracker')}</h1>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* LEFT: TIMELINE FEED */}
                <div className="md:col-span-2 space-y-6">

                    {/* FARMER POST BOX */}
                    {userRole === 'farmer' && (
                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                                <PlusCircle size={14} className="text-green-500" /> {t('Add New Update')}
                            </h3>

                            <textarea
                                placeholder={t('How is the growth progressing? Add a quick note...')}
                                value={uploadCaption}
                                onChange={(e) => setUploadCaption(e.target.value)}
                                className="w-full text-lg outline-none text-gray-800 placeholder:text-gray-300 min-h-[100px] resize-none border-none font-medium mb-4"
                            />

                            <AnimatePresence>
                                {uploadPreview && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
                                        className="relative rounded-2xl overflow-hidden mb-6 aspect-video bg-gray-100 w-full md:w-2/3 shadow-inner"
                                    >
                                        <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => { setUploadFile(null); setUploadPreview(null); }}
                                            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-md hover:bg-black/70 transition-colors"
                                        >
                                            <X size={16} />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex gap-2">
                                    <input type="file" id="media-upload" className="hidden" accept="image/*,video/*" onChange={handleFileChange} />
                                    <label htmlFor="media-upload" className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center cursor-pointer hover:bg-green-50 hover:text-green-700 transition-colors">
                                        <Camera size={20} />
                                    </label>
                                    <label htmlFor="media-upload" className="w-12 h-12 rounded-full bg-gray-50 text-gray-400 flex items-center justify-center cursor-pointer hover:bg-blue-50 hover:text-blue-700 transition-colors">
                                        <Video size={20} />
                                    </label>
                                </div>
                                <button
                                    onClick={handlePostUpdate}
                                    disabled={loading || (!uploadCaption && !uploadFile)}
                                    className="bg-green-700 text-white px-8 py-4 rounded-[20px] font-black uppercase tracking-widest text-xs hover:bg-green-800 shadow-xl shadow-green-100 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    {isUploading ? <Loader2 size={16} className="animate-spin" /> : t('Post Update')}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TIMELINE RENDER */}
                    {updates.length === 0 ? (
                        <div className="text-center py-20 px-6 bg-white rounded-[40px] border border-dashed border-gray-200">
                            <Clock size={40} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-black tracking-tight text-gray-800 uppercase mb-2">{t('No updates yet')}</h3>
                            <p className="text-gray-400 text-sm font-medium">{t('Check back soon for the first photo from the farm.')}</p>
                        </div>
                    ) : (
                        <div className="space-y-12 pl-4 border-l-2 border-gray-100 ml-4 py-6 relative">
                            {/* Animated Timeline Highlight */}
                            <div className="absolute top-0 bottom-0 left-[-2px] w-0.5 bg-gradient-to-b from-green-500 via-green-300 to-transparent"></div>

                            {updates.map((update, index) => {
                                const date = new Date(update.created_at);
                                const isLatest = index === 0;

                                return (
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        key={update.id}
                                        className="relative group"
                                    >
                                        {/* Timeline Node */}
                                        <div className={`absolute -left-[27px] w-5 h-5 rounded-full border-4 shadow-sm flex items-center justify-center transition-all duration-500
                                            ${isLatest ? 'bg-green-500 border-white ring-4 ring-green-100 scale-125' : 'bg-gray-200 border-white group-hover:bg-green-400'}
                                        `}></div>

                                        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 group-hover:shadow-xl transition-shadow ml-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Clock size={12} className={isLatest ? 'text-green-500' : ''} />
                                                    {date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                                {isLatest && (
                                                    <span className="bg-green-100 text-green-700 font-bold text-[8px] px-2 py-1 rounded-full uppercase tracking-widest">
                                                        {t('Latest Update')}
                                                    </span>
                                                )}
                                            </div>

                                            {update.media_url && (
                                                <div className="mb-6 rounded-[24px] overflow-hidden bg-gray-50 max-h-[400px]">
                                                    {update.media_type === 'video' ? (
                                                        <video src={update.media_url} controls className="w-full h-full object-cover" />
                                                    ) : (
                                                        <img src={update.media_url} alt="Update" className="w-full object-cover transition-transform duration-[10s] group-hover:scale-105" />
                                                    )}
                                                </div>
                                            )}

                                            {update.caption && (
                                                <p className="text-gray-700 text-lg leading-relaxed font-medium">
                                                    {update.caption}
                                                </p>
                                            )}

                                            <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-50">
                                                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-widest group/btn">
                                                    <Heart size={16} className="group-hover/btn:fill-red-500" /> {t('Love')}
                                                </button>
                                                <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors text-xs font-bold uppercase tracking-widest">
                                                    <Share2 size={16} /> {t('Share')}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* RIGHT: ASSET STATS WIDGET */}
                <div className="space-y-6">
                    <div className="bg-white border-2 border-green-600/10 rounded-[40px] p-8 shadow-xl shadow-green-100/20 sticky top-32">
                        <div className="w-20 h-20 bg-green-50 text-green-700 rounded-full flex items-center justify-center text-3xl mb-6 shadow-inner mx-auto">
                            {asset?.asset_type === 'Animal' ? '🐄' : asset?.asset_type === 'Tree' ? '🥭' : '🌾'}
                        </div>
                        <h4 className="text-xl font-black text-center text-gray-900 uppercase tracking-tighter mb-2">{t('Growth Stats')}</h4>
                        <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-widest mb-8">{t('Nurtured by')} {asset?.profiles?.full_name}</p>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Clock size={14} className="text-blue-400" /> {t('Time Since Adoption')}
                                </span>
                                <span className="font-black text-gray-900">{currentAgeDays} {t('Days')}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-gray-50 pb-4">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <ImageIcon size={14} className="text-purple-400" /> {t('Total Updates')}
                                </span>
                                <span className="font-black text-gray-900">{updates.length}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <AlertCircle size={14} className="text-orange-400" /> {t('Health Status')}
                                </span>
                                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Excellent</span>
                            </div>
                        </div>

                        <button className="w-full mt-8 bg-gray-50 text-gray-600 py-4 rounded-[20px] font-bold uppercase tracking-tighter text-xs hover:bg-gray-100 transition-colors">
                            {t('Download Report')}
                        </button>
                    </div>
                </div>

            </main>
        </div>
    );
}
