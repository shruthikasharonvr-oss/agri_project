'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTranslation } from '../../contexts/TranslationContext';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import {
    MapPin, ArrowLeft, Loader2, Maximize2,
    Navigation, Camera, ShieldCheck,
    Calendar, CloudRain, Thermometer,
    Compass, Info, Map as MapIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

// Asset 3D Model Mapping
const ASSET_MODELS: Record<string, string> = {
    'animal': 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/Cow/glTF-Binary/Cow.glb',
    'tree': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
    'land': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb',
    'tools': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Lantern/glTF-Binary/Lantern.glb',
    'cow': 'https://modelviewer.dev/shared-assets/models/glTF-Sample-Models/2.0/Cow/glTF-Binary/Cow.glb',
    'mango_tree': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb',
    'paddy_field': 'https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Box/glTF-Binary/Box.glb'
};

export default function AdoptionTrackingDashboard() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);

    const [loading, setLoading] = useState(true);
    const [asset, setAsset] = useState<any>(null);
    const [latestUpdate, setLatestUpdate] = useState<any>(null);
    const [weather, setWeather] = useState({ temp: '28°C', condition: 'Sunny' });

    useEffect(() => {
        // Load model-viewer script
        import('@google/model-viewer');

        async function fetchData() {
            setLoading(true);

            // Fetch Asset Info
            const { data: assetData } = await supabase
                .from('adoptions')
                .select('*, profiles(full_name)')
                .eq('id', id)
                .single();

            if (assetData) {
                // Mix in lat/lng if missing for the demo/dashboard
                const enhancedAsset = {
                    ...assetData,
                    latitude: assetData.latitude || 11.9416, // Default Villupuram
                    longitude: assetData.longitude || 79.4861
                };
                setAsset(enhancedAsset);
                initMap(enhancedAsset.latitude, enhancedAsset.longitude);
            } else {
                // Fallback for demo if ID is not found
                const demoAsset = {
                    id,
                    title: "Malnad Gidda Cow #42",
                    asset_type: "cow",
                    latitude: 12.3375, // Coorg
                    longitude: 75.8069,
                    profiles: { full_name: "Farmer Somanna" },
                    created_at: new Date().toISOString()
                };
                setAsset(demoAsset);
                initMap(demoAsset.latitude, demoAsset.longitude);
            }

            // Fetch Latest Update
            const { data: updateData } = await supabase
                .from('adoption_updates')
                .select('*')
                .eq('adoption_id', id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (updateData) {
                setLatestUpdate(updateData);
            } else {
                // Mock update for demo
                setLatestUpdate({
                    caption: "Morning health check complete. The herd moved to the northern pasture today.",
                    media_url: "https://images.unsplash.com/photo-1546445317-29f4545d9fae?auto=format&fit=crop&q=80&w=800",
                    created_at: new Date().toISOString(),
                    gps_verified: true,
                    latitude: 12.3375,
                    longitude: 75.8069
                });
            }

            setLoading(false);
        }

        fetchData();
    }, [id]);

    const initMap = async (lat: number, lng: number) => {
        setOptions({
            key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '', // Using dedicated maps key with firebase fallback
        });

        const { Map } = await importLibrary("maps");

        if (mapRef.current) {
            const newMap = new Map(mapRef.current, {
                center: { lat, lng },
                zoom: 18,
                heading: 45,
                tilt: 45,
                mapTypeId: 'satellite',
                mapId: 'DEMO_MAP_ID', // Replace with actual map ID for advanced features
                disableDefaultUI: true,
            });
            setMap(newMap);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="flex flex-col items-center">
                    <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('Establishing connection to the farm...')}</p>
                </div>
            </div>
        );
    }

    const modelSrc = ASSET_MODELS[asset?.asset_type?.toLowerCase()] || ASSET_MODELS['Animal'];
    const ModelViewer = 'model-viewer' as any;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-green-500/30">
            {/* TOP NAVIGATION */}
            <nav className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl border-b border-white/10 bg-black/20">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-all">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-green-500">{t('Live Connectivity Dashboard')}</p>
                            <h2 className="text-xl font-bold tracking-tight text-white">{asset?.title}</h2>
                        </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                            <CloudRain size={16} className="text-blue-400" />
                            <span className="text-xs font-bold">{weather.condition}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/5">
                            <Thermometer size={16} className="text-orange-400" />
                            <span className="text-xs font-bold">{weather.temp}</span>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-6rem)]">

                {/* LEFT COLUMN: 3D VIEWER & STATS */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* 3D DIGITAL TWIN */}
                    <div className="flex-1 bg-gradient-to-br from-white/10 to-white/[0.02] rounded-[40px] border border-white/10 relative overflow-hidden group shadow-2xl">
                        <div className="absolute top-6 left-6 z-10">
                            <div className="bg-green-500/20 backdrop-blur-md border border-green-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-green-400">{t('3D Digital Twin')}</span>
                            </div>
                        </div>

                        <ModelViewer
                            src={modelSrc}
                            alt="3D Asset Model"
                            auto-rotate
                            camera-controls
                            shadow-intensity="1"
                            environment-image="neutral"
                            exposure="1"
                            interaction-prompt="none"
                            style={{ width: '100%', height: '100%', backgroundColor: 'transparent' }}
                        ></ModelViewer>

                        <div className="absolute bottom-6 right-6">
                            <button className="p-3 bg-white/10 hover:bg-white/20 rounded-2xl backdrop-blur-md border border-white/10 transition-all">
                                <Maximize2 size={20} />
                            </button>
                        </div>
                    </div>

                    {/* ASSET SPECS CARD */}
                    <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10">
                        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6 flex items-center gap-2">
                            <Info size={14} /> {t('Active Parameters')}
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{t('Health Score')}</p>
                                <p className="text-xl font-black text-green-500">98/100</p>
                            </div>
                            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{t('Last Fed')}</p>
                                <p className="text-xl font-black">2h {t('ago')}</p>
                            </div>
                            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{t('Weight Est.')}</p>
                                <p className="text-xl font-black">240kg</p>
                            </div>
                            <div className="p-4 bg-white/[0.02] rounded-2xl border border-white/5">
                                <p className="text-[10px] font-black text-gray-500 uppercase mb-1">{t('Activity')}</p>
                                <p className="text-xl font-black text-blue-400">High</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MIDDLE COLUMN: MAP & LOCATION */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    {/* ENHANCED GOOGLE MAP */}
                    <div className="flex-grow bg-white/5 rounded-[40px] border border-white/10 relative overflow-hidden group">
                        <div ref={mapRef} className="w-full h-full grayscale-[20%] invert-[5%] contrast-[110%]" />

                        <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
                            <button className="p-3 bg-black/60 hover:bg-black/80 rounded-2xl backdrop-blur-md border border-white/10 transition-all text-white">
                                <MapIcon size={20} />
                            </button>
                            <button className="p-3 bg-black/60 hover:bg-black/80 rounded-2xl backdrop-blur-md border border-white/10 transition-all text-white">
                                <Compass size={20} />
                            </button>
                        </div>

                        <div className="absolute bottom-6 left-6 right-6 bg-black/60 backdrop-blur-xl border border-white/10 p-6 rounded-3xl">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <MapPin size={14} className="text-red-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('Precise Coordinates')}</span>
                                    </div>
                                    <p className="font-bold text-sm tracking-tighter">
                                        {asset?.latitude.toFixed(6)}° N, {asset?.longitude.toFixed(6)}° E
                                    </p>
                                    <p className="text-xs text-gray-500 font-medium">Villupuram Region, Tamil Nadu</p>
                                </div>
                                <button className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                                    {t('Open in Earth')}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* RECENT ACTIVITY TICKER */}
                    <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-6 border border-white/10 overflow-hidden">
                        <div className="flex items-center gap-4 animate-scroll whitespace-nowrap">
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">● {t('Live Feed')}:</span>
                            <span className="text-xs font-medium text-gray-300">IoT Sensor Node-12 reporting optimal soil moisture...</span>
                            <span className="text-xs font-medium text-gray-300">Atmospheric pressure stable at 1013hPa...</span>
                            <span className="text-xs font-medium text-gray-300">Solar panel efficiency at 94%...</span>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: PROGRESS FEED & FARMER INFO */}
                <div className="lg:col-span-3 flex flex-col gap-6">
                    {/* FARMER LATEST UPDATE */}
                    <div className="bg-white/5 backdrop-blur-md rounded-[40px] border border-white/10 overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-white/5 bg-white/5">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 flex items-center justify-between">
                                {t('Farmer Update')}
                                <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-[8px] border border-blue-500/20">NEW</span>
                            </h3>
                        </div>

                        <div className="relative aspect-square">
                            <img
                                src={latestUpdate?.media_url}
                                alt="Farm Update"
                                className="w-full h-full object-cover transition-transform duration-[15s] hover:scale-110"
                            />
                            {/* GPS VERIFICATION TAG */}
                            <div className="absolute top-4 left-4">
                                <div className="flex items-center gap-2 bg-green-500/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                                    <ShieldCheck size={14} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{t('Verified GPS Tag')}</span>
                                </div>
                            </div>

                            <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3 rounded-2xl border border-white/10">
                                <p className="text-[10px] font-mono text-gray-300 leading-tight">
                                    TS: {new Date(latestUpdate?.created_at).toLocaleString()}<br />
                                    LOC: {latestUpdate?.latitude || asset.latitude}, {latestUpdate?.longitude || asset.longitude}
                                </p>
                            </div>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-gray-300 leading-relaxed font-medium mb-4">
                                "{latestUpdate?.caption}"
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-green-500 to-emerald-700 flex items-center justify-center font-bold text-white shadow-lg">
                                    {asset?.profiles?.full_name?.charAt(0) || 'F'}
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-tight">{asset?.profiles?.full_name}</p>
                                    <p className="text-[9px] text-gray-500 font-bold uppercase">{t('Managed Verified Farmer')}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QUICK ACTIONS */}
                    <div className="mt-auto flex flex-col gap-3">
                        <button className="w-full bg-green-600 hover:bg-green-700 text-white py-5 rounded-[24px] font-black uppercase tracking-tighter shadow-xl shadow-green-900/20 transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                            <Navigation size={20} /> {t('Navigate to Farm')}
                        </button>
                        <button className="w-full bg-white/5 hover:bg-white/10 text-white py-5 rounded-[24px] font-black uppercase tracking-tighter border border-white/10 transition-all flex items-center justify-center gap-3">
                            <Camera size={20} /> {t('Request Photo')}
                        </button>
                    </div>
                </div>
            </main>

            <style jsx global>{`
                @keyframes scroll {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-scroll {
                    animation: scroll 30s linear infinite;
                }
                model-viewer {
                    --poster-color: transparent;
                }
            `}</style>
        </div>
    );
}
