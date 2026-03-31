// @ts-nocheck
// REMINDER: Run 'npm install @google/model-viewer @react-google-maps/api' if these libraries are missing.

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    ShieldCheck,
    MapPin,
    Activity,
    Zap,
    Wind,
    Droplets,
    Navigation,
    ExternalLink,
    ChevronRight,
    Maximize2,
    Info
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
    styles: [
        {
            featureType: 'all',
            elementType: 'labels',
            stylers: [{ visibility: 'on' }],
        },
    ],
};

export default function AdoptionDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const [weather, setWeather] = useState<'normal' | 'rain' | 'summer' | 'drought'>('normal');
    const [asset, setAsset] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
    });

    useEffect(() => {
        async function fetchAsset() {
            setLoading(true);
            const { data, error } = await supabase
                .from('adoptions')
                .select('*, profiles(full_name)')
                .eq('id', id)
                .single();

            if (!error && data) {
                setAsset({
                    ...data,
                    sq_ft: data.sq_ft || 4500, // Default if not in DB
                });
            } else {
                // Fallback demo data
                setAsset({
                    title: 'Vellore Organic Plot #42',
                    description: 'Premium fertile land plot with active organic certification. Currently growing traditional millets with IoT-enabled irrigation.',
                    asset_type: 'Land',
                    sq_ft: 4500,
                    target_funding: 150000,
                    current_funding: 85000,
                    profit_share: 40,
                    profiles: { full_name: 'Farmer Selvam' }
                });
            }
            setLoading(false);
        }
        fetchAsset();
    }, [id]);

    if (loading || !asset) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-t-2 border-green-500 rounded-full"
                />
            </div>
        );
    }

    const progress = (asset.current_funding / asset.target_funding) * 100;

    return (
        <div className="min-h-screen bg-[#050505] text-white selection:bg-green-500/30 font-sans overflow-x-hidden">
            {/* Weather FX Overlays */}
            <AnimatePresence>
                {weather === 'rain' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] pointer-events-none overflow-hidden"
                    >
                        {[...Array(50)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{ y: -100, x: Math.random() * 100 + 'vw', opacity: 0 }}
                                animate={{ y: '110vh', opacity: [0, 0.5, 0] }}
                                transition={{ 
                                    duration: 0.5 + Math.random(), 
                                    repeat: Infinity, 
                                    delay: Math.random() * 2,
                                    ease: "linear"
                                }}
                                className="absolute w-[1px] h-4 bg-blue-400/40 blur-[1px]"
                            />
                        ))}
                        <div className="absolute inset-0 bg-blue-900/10 backdrop-blur-[1px]" />
                    </motion.div>
                )}
                
                {weather === 'summer' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] pointer-events-none"
                    >
                        <div className="absolute top-[-10%] right-[-10%] w-[80vw] h-[80vw] bg-yellow-400/10 blur-[150px] rounded-full animate-pulse" />
                        <div className="absolute inset-0 bg-orange-500/5 mix-blend-overlay" />
                    </motion.div>
                )}

                {weather === 'drought' && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] pointer-events-none bg-orange-900/20 grayscale-[0.5] sepia-[0.3]"
                    />
                )}
            </AnimatePresence>

            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
                {/* Navigation */}
                <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/5 bg-black/20">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="group flex items-center gap-2 text-white/60 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-full border border-white/10"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-xs font-black uppercase tracking-widest">{t('Back to Marketplace')}</span>
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-4 py-2 rounded-full">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">{t('Syncing Live')}</span>
                            </div>
                        </div>
                    </div>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Digital Twin & Map */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* 3D Model Viewer Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative aspect-video lg:aspect-auto lg:h-[600px] rounded-[48px] overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02] backdrop-blur-3xl group"
                        >
                            {/* LIVE Badge */}
                            <div className="absolute top-8 right-8 z-50 flex flex-col items-end gap-3">
                                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md border border-green-500/50 px-4 py-2 rounded-2xl shadow-[0_0_20px_rgba(34,197,94,0.3)]">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    <span className="text-xs font-black text-green-400 tracking-tighter uppercase">{t('Land Digital Twin')}</span>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <Maximize2 size={14} className="text-gray-400" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/80">{asset.sq_ft} SQ. FT.</span>
                                </div>
                            </div>

                            {/* Data Overlays */}
                            <div className="absolute top-8 left-8 z-50 flex flex-col gap-3">
                                <div className="bg-white/5 border border-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{t('Soil Health')}</p>
                                    <div className="flex items-end gap-2">
                                        <span className={`text-2xl font-black ${weather === 'drought' ? 'text-red-400' : 'text-green-500'}`}>
                                            {weather === 'drought' ? '42%' : '94%'}
                                        </span>
                                        <Droplets size={16} className={`${weather === 'rain' ? 'text-blue-400 animate-bounce' : 'text-green-500'}`} />
                                    </div>
                                </div>
                                
                                {/* Climate Controls */}
                                <div className="bg-black/40 border border-white/10 backdrop-blur-2xl p-2 rounded-[24px] flex flex-col gap-2">
                                    <button 
                                        onClick={() => setWeather('rain')}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${weather === 'rain' ? 'bg-blue-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                                    >
                                        <Droplets size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setWeather('summer')}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${weather === 'summer' ? 'bg-orange-500 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                                    >
                                        <Zap size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setWeather('drought')}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${weather === 'drought' ? 'bg-red-700 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                                    >
                                        <Wind size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setWeather('normal')}
                                        className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${weather === 'normal' ? 'bg-green-600 text-white' : 'hover:bg-white/5 text-gray-400'}`}
                                    >
                                        <Activity size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* @ts-ignore */}
                            <model-viewer
                                src="https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/LowPolyTerrain/glTF-Binary/LowPolyTerrain.glb"
                                alt="3D Land Twin"
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
                                {/* 3D Weather FX via Slots */}
                                {weather === 'rain' && (
                                    <div slot="hotspot-rain" data-position="0 10 0" className="pointer-events-none">
                                        <div className="rain-3d-container">
                                            {[...Array(20)].map((_, i) => (
                                                <div key={i} className="rain-drop-3d" style={{
                                                    top: Math.random() * 200 - 100,
                                                    left: Math.random() * 200 - 100,
                                                    animationDelay: `${Math.random() * 2}s`
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                                
                                {weather === 'summer' && (
                                    <div slot="hotspot-sun" data-position="5 15 -5" className="pointer-events-none">
                                        <div className="sun-3d-glow" />
                                    </div>
                                )}

                                {weather === 'drought' && (
                                    <div slot="hotspot-dust" data-position="0 2 0" className="pointer-events-none">
                                        <div className="drought-dust-3d" />
                                    </div>
                                )}
                            </model-viewer>

                            {/* Controls Footer */}
                            <div className="absolute bottom-8 left-8 right-8 flex items-center justify-between pointer-events-none">
                                <div className="flex gap-2 pointer-events-auto">
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">{t('Current Condition')}</p>
                                        <p className="text-xs font-black uppercase text-green-400">{weather === 'normal' ? 'Optimal' : weather}</p>
                                    </div>
                                </div>
                                <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{t('Interactive Digital Twin Engine')}</p>
                            </div>
                        </motion.div>

                        {/* Satellite View Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-1 md:grid-cols-2 gap-8"
                        >
                            <div className="h-[400px] rounded-[48px] overflow-hidden border border-white/10 relative">
                                <div className="absolute inset-0 z-10 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]" />
                                <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl">
                                    <MapPin size={16} className="text-red-500" />
                                    <span className="text-xs font-black uppercase tracking-widest">{t('GPS Verification')}</span>
                                </div>
                                {isLoaded ? (
                                    <GoogleMap
                                        mapContainerStyle={mapContainerStyle}
                                        center={VILLUPURAM_COORDS}
                                        zoom={18}
                                        options={mapOptions}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                                        <p className="text-xs text-gray-500 uppercase font-black">{t('Loading Earth Data...')}</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-6">
                                <div className="flex-1 bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-2xl font-black tracking-tighter mb-2">{t('Villupuram Smart Farm')}</h3>
                                        <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                            Coordinates: 11.9401° N, 79.4861° E<br />
                                            Altitude: 171m above sea level<br />
                                            Climate: Tropical Savanna
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col gap-1">
                                            <Droplets size={20} className="text-blue-400" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Soil</span>
                                            <span className="text-sm font-black">74%</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Wind size={20} className="text-cyan-400" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Air</span>
                                            <span className="text-sm font-black">12km/h</span>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <Zap size={20} className="text-yellow-400" />
                                            <span className="text-[10px] font-black text-gray-400 uppercase">Solar</span>
                                            <span className="text-sm font-black">9.2kW</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Asset Details & CRM */}
                    <div className="lg:col-span-4 flex flex-col gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white/5 border border-white/10 rounded-[48px] p-10 backdrop-blur-3xl"
                        >
                            <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest mb-6 px-4 py-1.5 border border-green-500/20 bg-green-500/5 rounded-full w-fit">
                                <ShieldCheck size={14} /> {t('Verified Smart Asset')}
                            </div>

                            <h1 className="text-4xl font-black tracking-tighter mb-4 uppercase">{asset?.title}</h1>
                            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">
                                {asset?.description}
                            </p>

                            <div className="space-y-6 mb-10">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{t('Adoption Progress')}</span>
                                    <span className="text-xl font-black text-green-500">{progress.toFixed(0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-gradient-to-r from-green-600 to-emerald-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-10">
                                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl">
                                    <p className="text-[10px] font-black text-gray-500 uppercase mb-1 tracking-widest">{t('Target')}</p>
                                    <p className="text-2xl font-black tracking-tighter">₹{asset?.target_funding?.toLocaleString()}</p>
                                </div>
                                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-3xl">
                                    <p className="text-[10px] font-black text-orange-400 uppercase mb-1 tracking-widest">{t('ROI Est.')}</p>
                                    <p className="text-2xl font-black text-orange-500 tracking-tighter">{asset?.profit_share}%</p>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push(`/adoptions/pay/${id}`)}
                                className="w-full bg-green-600 hover:bg-green-700 text-white py-6 rounded-3xl font-black uppercase tracking-tighter transition-all shadow-[0_20px_40px_rgba(22,163,74,0.3)] hover:shadow-[0_25px_50px_rgba(22,163,74,0.4)] active:scale-95 flex items-center justify-center gap-3"
                            >
                                {t('Initiate Adoption')} <ChevronRight size={20} />
                            </button>
                        </motion.div>

                        {/* Farmer Insight */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/5 border border-white/10 rounded-[40px] p-8 backdrop-blur-3xl flex items-center gap-6"
                        >
                            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 flex items-center justify-center font-black text-xl shadow-xl">
                                {asset?.profiles?.full_name?.charAt(0) || 'F'}
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">{t('Guardian Farmer')}</p>
                                <h4 className="text-lg font-black uppercase tracking-tighter">{asset?.profiles?.full_name}</h4>
                                <div className="flex items-center gap-4 mt-2">
                                    <button className="text-[10px] font-black uppercase text-green-500 hover:text-green-400 transition-colors flex items-center gap-1">
                                        {t('View Profile')} <ExternalLink size={10} />
                                    </button>
                                    <button className="text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1">
                                        {t('History')} <Info size={10} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            {/* Global Aesthetics */}
            <style jsx global>{`
        body {
          background-color: #050505;
        }
        model-viewer {
          --poster-color: transparent;
        }
        .backdrop-blur-3xl {
          backdrop-filter: blur(60px);
        }
        .rain-3d-container {
          position: relative;
          width: 200px;
          height: 200px;
          transform-style: preserve-3d;
        }
        .rain-drop-3d {
          position: absolute;
          width: 2px;
          height: 30px;
          background: linear-gradient(to bottom, rgba(59, 130, 246, 0), rgba(59, 130, 246, 0.8));
          animation: rain-fall-3d 0.8s linear infinite;
        }
        @keyframes rain-fall-3d {
          from { transform: translateY(-100px) translateZ(0); opacity: 0; }
          to { transform: translateY(100px) translateZ(0); opacity: 1; }
        }
        .sun-3d-glow {
          width: 150px;
          height: 150px;
          background: radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%);
          border-radius: 50%;
          filter: blur(20px);
          animation: sun-pulse-3d 3s ease-in-out infinite;
        }
        @keyframes sun-pulse-3d {
          0%, 100% { scale: 1; opacity: 0.5; }
          50% { scale: 1.2; opacity: 0.8; }
        }
        .drought-dust-3d {
          width: 300px;
          height: 100px;
          background: radial-gradient(ellipse at center, rgba(120, 53, 15, 0.2) 0%, transparent 80%);
          filter: blur(30px);
          animation: dust-drift-3d 10s linear infinite;
        }
        @keyframes dust-drift-3d {
          0% { transform: translateX(-50px) rotate(0deg); }
          100% { transform: translateX(50px) rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
