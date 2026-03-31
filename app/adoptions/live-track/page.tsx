// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    MapPin,
    Activity,
    Maximize2,
    Navigation,
    ExternalLink,
    ChevronRight,
    ShieldCheck,
    Compass,
    Layers,
    Box,
    Droplets,
    Zap,
    Wind,
    Sun,
    Loader2,
    AlertCircle,
    ShoppingBag
} from 'lucide-react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useTranslation } from '../../contexts/TranslationContext';
import { supabase } from '../../lib/supabase';

// model-viewer needs to be imported on the client side
if (typeof window !== 'undefined') {
    import('@google/model-viewer');
}

const VILLUPURAM_COORDS = { lat: 11.9401, lng: 79.4861 };

const mapContainerStyle = {
    width: '100%',
    height: '100%',
};

const mapOptions = {
    tilt: 45,
    heading: 90,
    mapTypeId: 'satellite',
    disableDefaultUI: true,
    gestureHandling: 'none',
};

const MODEL_URLS = {
    Land: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/LowPolyTerrain/glTF-Binary/LowPolyTerrain.glb",
    Tree: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/PottedRoseBush/glTF-Binary/PottedRoseBush.glb",
    Animal: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Cow/glTF-Binary/Cow.glb"
};

export default function LiveTrackPage() {
    const router = useRouter();
    const { t } = useTranslation();
    const [preparing, setPreparing] = useState(true);
    const [loading, setLoading] = useState(true);
    const [myAdoptions, setMyAdoptions] = useState<any[]>([]);
    const [selectedAsset, setSelectedAsset] = useState<any>(null);
    const [weather, setWeather] = useState<'normal' | 'rain' | 'summer' | 'drought'>('normal');

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    });

    useEffect(() => {
        async function fetchMyAdoptions() {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            const { data, error } = await supabase
                .from('adoptions')
                .select('*, profiles(full_name)')
                .eq('adopted_by_id', user.id);

            if (!error && data && data.length > 0) {
                setMyAdoptions(data);
                setSelectedAsset(data[0]);
            }
            setLoading(false);
            
            // Artificial delay to show the "Preparing 3D Environment" state
            setTimeout(() => {
                setPreparing(false);
            }, 2000);
        }
        fetchMyAdoptions();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-green-700 mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Syncing Satellite Data...')}</p>
            </div>
        );
    }

    if (myAdoptions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-32 h-32 bg-white rounded-[48px] shadow-2xl flex items-center justify-center mb-10 text-gray-200">
                    <ShoppingBag size={64} />
                </div>
                <h1 className="text-4xl font-black text-gray-900 uppercase tracking-tighter mb-4">{t("No Assets Adopted Yet")}</h1>
                <p className="text-gray-500 max-w-sm font-bold mb-12 leading-relaxed">
                    {t("You haven't adopted any agricultural assets yet. Adopt a cow, a tree, or land to unlock live 3D tracking and profit sharing.")}
                </p>
                <button
                    onClick={() => router.push('/adoptions')}
                    className="bg-green-700 text-white px-10 py-5 rounded-3xl font-black uppercase tracking-tighter shadow-2xl shadow-green-100 hover:bg-green-800 transition-all active:scale-95"
                >
                    {t('Go to Adoptions')}
                </button>
                <div className="mt-8">
                    <button onClick={() => router.back()} className="text-gray-400 font-bold uppercase tracking-widest text-xs hover:text-gray-900 transition-colors">
                        {t('Back')}
                    </button>
                </div>
            </div>
        );
    }

    const modelSource = selectedAsset ? (MODEL_URLS[selectedAsset.asset_type as keyof typeof MODEL_URLS] || MODEL_URLS.Land) : MODEL_URLS.Land;

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-green-500/30 font-sans overflow-hidden">
            <AnimatePresence>
                {preparing && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1000] bg-white flex flex-col items-center justify-center p-6 text-center"
                    >
                        <div className="relative mb-12">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="w-32 h-32 border-8 border-gray-100 border-t-green-600 rounded-full"
                            />
                            <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 flex items-center justify-center text-4xl"
                            >
                                {selectedAsset?.asset_type === 'Animal' ? '🐄' : selectedAsset?.asset_type === 'Tree' ? '🌳' : '🌾'}
                            </motion.div>
                        </div>
                        <motion.h2
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl font-black tracking-tighter uppercase mb-4"
                        >
                            {t('Preparing Live Twin')}
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-gray-400 font-bold uppercase tracking-widest text-xs"
                        >
                            {t('Establishing secure satellite bridge for')} {selectedAsset?.title}...
                        </motion.p>
                    </motion.div>
                )}
            </AnimatePresence>
            
            {/* Weather FX Overlays */}
            <AnimatePresence>
                {weather === 'rain' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1001] pointer-events-none overflow-hidden"
                    >
                        {[...Array(60)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -100, x: Math.random() * 100 + 'vw', opacity: 0 }}
                                animate={{ y: '110vh', opacity: [0, 0.4, 0] }}
                                transition={{ 
                                    duration: 0.4 + Math.random(), 
                                    repeat: Infinity, 
                                    delay: Math.random() * 2,
                                    ease: "linear"
                                }}
                                className="absolute w-[1.5px] h-6 bg-blue-300/30 blur-[1px]"
                            />
                        ))}
                    </motion.div>
                )}
                
                {weather === 'summer' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1001] pointer-events-none"
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] bg-amber-400/5 blur-[150px] rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-orange-500/5 mix-blend-overlay" />
                    </motion.div>
                )}

                {weather === 'drought' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[1001] pointer-events-none bg-orange-900/15 grayscale-[0.6] sepia-[0.4]"
                    />
                )}
            </AnimatePresence>

            <main className="h-screen w-screen flex flex-col lg:flex-row relative">
                {/* Navigation Overlays */}
                <div className="absolute top-8 left-8 z-[100]">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-3 bg-white/90 backdrop-blur-xl border border-gray-200 px-6 py-4 rounded-[32px] shadow-2xl hover:scale-105 transition-all text-gray-950 font-black uppercase tracking-tighter"
                    >
                        <ArrowLeft size={20} /> {t('Exit Tracking')}
                    </button>
                </div>

                {/* Asset Switcher */}
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-[100] hidden lg:block">
                    <div className="bg-white/90 backdrop-blur-xl border border-gray-100 p-2 rounded-full shadow-2xl flex gap-1">
                        {myAdoptions.map((asset) => (
                            <button
                                key={asset.id}
                                onClick={() => {
                                    setSelectedAsset(asset);
                                    setPreparing(true);
                                    setTimeout(() => setPreparing(false), 1500);
                                }}
                                className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedAsset?.id === asset.id ? 'bg-green-700 text-white shadow-lg shadow-green-100' : 'hover:bg-gray-50 text-gray-400'}`}
                            >
                                {asset.title}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="absolute top-8 right-8 z-[100] flex flex-col gap-4">
                    <div className="bg-white/90 backdrop-blur-xl border border-gray-200 p-6 rounded-[40px] shadow-2xl flex items-center gap-6">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{t('Connectivity')}</span>
                            <span className="text-xl font-black text-green-600 uppercase">{weather === 'normal' ? 'LIVE SYNC' : weather}</span>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center">
                            {weather === 'rain' ? <Droplets className="text-blue-500" /> : 
                             weather === 'summer' ? <Sun className="text-orange-500" /> :
                             weather === 'drought' ? <Wind className="text-red-500" /> :
                             <Box size={24} className="text-green-600" />}
                        </div>
                    </div>
                </div>

                {/* 3D Visualizer Section */}
                <div className="flex-1 relative bg-gray-50 overflow-hidden">
                    {/* Internal Overlays */}
                    <div className="absolute top-32 left-8 z-10 flex flex-col gap-4">
                        <motion.div
                            key={selectedAsset?.id}
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-white border border-gray-100 p-6 rounded-[32px] shadow-xl max-w-[280px]"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-600">{t('Digital Twin Status')}</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight mb-2 uppercase">{selectedAsset?.title}</h3>
                            <div className="mb-4 inline-flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <span className="text-[10px] font-black uppercase text-green-700">{selectedAsset?.asset_type}</span>
                            </div>
                            <p className="text-gray-400 text-xs font-bold uppercase leading-relaxed">
                                {t('Asset ID')}: {selectedAsset?.id?.slice(0, 8)}<br/>
                                {t('Location')}: {selectedAsset?.location || 'Tamil Nadu'}<br/>
                                {t('Guardian')}: {selectedAsset?.profiles?.full_name}
                            </p>
                        </motion.div>
                        
                        {/* Climate Control Switcher */}
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/80 backdrop-blur-2xl border border-gray-100 p-2 rounded-[28px] shadow-2xl flex flex-col gap-2 w-fit"
                        >
                            <button 
                                onClick={() => setWeather('rain')}
                                title="Rain"
                                className={`w-14 h-14 flex items-center justify-center rounded-[20px] transition-all ${weather === 'rain' ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'hover:bg-gray-50 text-gray-400'}`}
                            >
                                <Droplets size={24} />
                            </button>
                            <button 
                                onClick={() => setWeather('summer')}
                                title="Summer"
                                className={`w-14 h-14 flex items-center justify-center rounded-[20px] transition-all ${weather === 'summer' ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'hover:bg-gray-50 text-gray-400'}`}
                            >
                                <Sun size={24} />
                            </button>
                            <button 
                                onClick={() => setWeather('drought')}
                                title="Drought"
                                className={`w-14 h-14 flex items-center justify-center rounded-[20px] transition-all ${weather === 'drought' ? 'bg-red-700 text-white shadow-lg shadow-red-200' : 'hover:bg-gray-50 text-gray-400'}`}
                            >
                                <Wind size={24} />
                            </button>
                            <div className="h-px bg-gray-100 mx-2 my-1" />
                            <button 
                                onClick={() => setWeather('normal')}
                                title="Normal"
                                className={`w-14 h-14 flex items-center justify-center rounded-[20px] transition-all ${weather === 'normal' ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'hover:bg-gray-50 text-gray-400'}`}
                            >
                                <Activity size={24} />
                            </button>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 z-10 flex items-center justify-between">
                        <div className="flex gap-4">
                            {[
                                { icon: <Compass />, label: 'Compass' },
                                { icon: <Layers />, label: 'Layers' },
                                { icon: <Maximize2 />, label: 'Zoom' }
                            ].map((tool, i) => (
                                <button key={i} className="p-4 bg-white border border-gray-100 rounded-3xl shadow-lg hover:bg-gray-50 transition-all text-gray-500">
                                    {tool.icon}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">{t('Farm Computing Core v4.2')}</p>
                    </div>

                    {/* @ts-ignore */}
                    <model-viewer
                        key={selectedAsset?.id}
                        src={modelSource}
                        alt="3D Asset Twin"
                        auto-rotate
                        camera-controls
                        shadow-intensity="2"
                        environment-image="neutral"
                        exposure={weather === 'summer' ? "2" : "1"}
                        interaction-prompt="none"
                        style={{ 
                            width: '100%', 
                            height: '100%', 
                            backgroundColor: 'transparent',
                            filter: weather === 'drought' ? 'sepia(0.6) contrast(1.2)' : 'none'
                        }}
                    >
                    </model-viewer>
                </div>

                {/* Satellite Map Section */}
                <div className="h-[40%] lg:h-full lg:w-[450px] border-l border-gray-100 relative bg-white">
                    <div className="absolute top-32 right-8 z-10">
                        <div className="bg-black/80 backdrop-blur-xl text-white p-6 rounded-[40px] shadow-2xl border border-white/10 flex flex-col items-center text-center">
                            <MapPin size={24} className="text-red-500 mb-2" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Surface Scan')}</span>
                            <p className="text-lg font-black tracking-tighter uppercase">{selectedAsset?.location || 'VILLUPURAM'}</p>
                        </div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 z-10 bg-white/90 backdrop-blur-xl border border-gray-200 p-8 rounded-[48px] shadow-2xl">
                        <div className="flex flex-col gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldCheck size={16} className="text-green-600" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-green-600">{t('Precision Tracking')}</span>
                                </div>
                                <h4 className="text-2xl font-black tracking-tight uppercase leading-none">{t('Live Location')}</h4>
                            </div>

                            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    animate={{ x: [-200, 400] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="h-full w-1/3 bg-green-600"
                                />
                            </div>

                            <p className="text-gray-400 text-xs font-bold leading-relaxed">
                                {t('Currently rendering high-resolution terrain data for your adopted asset. Real-time satellite link stable.')}
                            </p>

                            <button className="w-full bg-gray-900 text-white py-5 rounded-3xl font-black uppercase tracking-tighter shadow-large hover:scale-[1.02] transition-all">
                                {t('Request Drone Update')}
                            </button>
                        </div>
                    </div>

                    {isLoaded ? (
                        <GoogleMap
                            mapContainerStyle={mapContainerStyle}
                            center={VILLUPURAM_COORDS}
                            zoom={18}
                            options={mapOptions}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                            <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-xs font-black text-gray-300 uppercase tracking-widest"
                            >
                                {t('Synchronizing Earth Data...')}
                            </motion.div>
                        </div>
                    )}
                </div>
            </main>

            <style jsx global>{`
                model-viewer {
                    --poster-color: transparent;
                }
                .shadow-large {
                    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
                }
            `}</style>
        </div>
    );
}
