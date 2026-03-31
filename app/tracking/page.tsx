'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/TranslationContext';
import Navbar from '../components/Navbar';
import {
    MapPin, Truck, CheckCircle2, Factory,
    Home, Clock, Navigation,
    ChevronRight, ArrowRight, Package, ArrowLeft
} from 'lucide-react';
import Link from 'next/link';

export default function TrackingPage() {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);

    // Simulate truck movement for a dynamic feel
    useEffect(() => {
        const timer = setTimeout(() => setProgress(65), 500);
        return () => clearTimeout(timer);
    }, []);

    const steps = [
        { title: t('Harvested'), location: 'Mandya Farm Hub', time: '06:00 AM', status: 'completed', icon: <MapPin /> },
        { title: t('Quality Check'), location: 'Regional Sorting Center', time: '09:30 AM', status: 'completed', icon: <CheckCircle2 /> },
        { title: t('In Transit'), location: 'On NH-275 Highway', time: 'Active', status: 'current', icon: <Truck /> },
        { title: t('Local Hub'), location: 'Bengaluru Fulfillment Hub', time: 'Est. 02:00 PM', status: 'pending', icon: <Factory /> },
        { title: t('Delivered'), location: 'Your Doorstep', time: 'Est. 04:30 PM', status: 'pending', icon: <Home /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <main className="max-w-5xl mx-auto p-6 md:p-12">

                {/* HEADER */}
                <div className="mb-12">
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 w-fit">
                        <Package size={14} /> Tracking Order #FH-99824
                    </div>
                    <h1 className="text-5xl font-black text-gray-900 tracking-tighter uppercase leading-none mb-4">
                        {t('Live')} <span className="text-green-700">{t('Tracking')}</span>
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">
                        {t('Transparent farm-to-plate supply chain visualization')}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: MAP VISUALIZATION (STYLED CSS MOCKUP) */}
                    <div className="lg:col-span-2 bg-white rounded-[48px] p-4 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden h-[600px]">

                        {/* Map Background Pattern */}
                        <div className="absolute inset-0 opacity-10" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)',
                            backgroundSize: '32px 32px'
                        }}></div>

                        {/* Animated Route Line */}
                        <div className="absolute top-[20%] left-[15%] w-[70%] h-[60%] border-4 border-dashed border-gray-200 rounded-[100px] z-10"></div>
                        <div
                            className="absolute top-[20%] left-[15%] w-[70%] h-[60%] border-4 border-green-500 rounded-[100px] z-10 transition-all duration-[3000ms] ease-out"
                            style={{ clipPath: `inset(0 ${100 - progress}% 0 0)` }}
                        ></div>

                        {/* Hub Markers */}
                        <div className="absolute top-[20%] left-[15%] -translate-x-1/2 -translate-y-1/2 z-20 group">
                            <div className="w-12 h-12 bg-green-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                                <MapPin size={24} />
                            </div>
                            <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 whitespace-nowrap">
                                <p className="text-[10px] font-black uppercase text-gray-900">Mandya Farm</p>
                            </div>
                        </div>

                        <div className="absolute bottom-[20%] right-[15%] -translate-x-1/2 -translate-y-1/2 z-20 group">
                            <div className="w-12 h-12 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                <Home size={24} />
                            </div>
                            <div className="absolute top-14 left-1/2 -translate-x-1/2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 whitespace-nowrap">
                                <p className="text-[10px] font-black uppercase text-gray-400">Destination</p>
                            </div>
                        </div>

                        {/* Moving Truck */}
                        <div
                            className="absolute top-[20%] z-30 transition-all duration-[3000ms] ease-out -translate-y-1/2 -translate-x-1/2"
                            style={{ left: `${15 + (70 * progress / 100)}%` }}
                        >
                            <div className="relative">
                                <div className="absolute -inset-4 bg-green-500/20 rounded-full animate-ping"></div>
                                <div className="w-16 h-16 bg-white border-4 border-green-500 text-green-600 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                                    <Truck size={28} />
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-8 left-8 right-8 bg-black/80 backdrop-blur-md rounded-3xl p-6 text-white flex justify-between items-center z-40">
                            <div>
                                <p className="text-[10px] font-black text-green-400 uppercase tracking-widest mb-1">{t('EST. TIME OF ARRIVAL')}</p>
                                <p className="text-3xl font-black tracking-tighter">04:30 PM</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('DISTANCE LEFT')}</p>
                                <p className="text-xl font-bold">42 km</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: TIMELINE */}
                    <div className="bg-white rounded-[48px] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-black uppercase tracking-tight text-gray-900 mb-8">{t('Supply Chain Steps')}</h2>

                        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                            {steps.map((step, idx) => (
                                <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                                    <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2
                                        ${step.status === 'completed' ? 'bg-green-600 border-white text-white' :
                                            step.status === 'current' ? 'bg-white border-green-500 text-green-600 animate-pulse' :
                                                'bg-white border-gray-200 text-gray-300'}`}>
                                        {step.icon}
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-3xl border border-gray-50 bg-gray-50 shadow-sm">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className={`font-bold text-sm uppercase tracking-tight ${step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>{step.title}</h3>
                                            <span className="text-[9px] font-black text-gray-400">{step.time}</span>
                                        </div>
                                        <p className="text-[10px] text-gray-500 uppercase font-bold">{step.location}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* DRIVER INFO */}
                        <div className="mt-12 bg-green-50 p-6 rounded-[32px] flex items-center gap-4">
                            <div className="w-14 h-14 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold shrink-0 text-xl shadow-sm">
                                R
                            </div>
                            <div className="flex-1">
                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">{t('Delivery Partner')}</p>
                                <p className="font-bold text-gray-900">Raju Transport</p>
                                <p className="text-xs text-gray-500 font-medium">KA-04-HG-4921</p>
                            </div>
                            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm hover:scale-110 transition-transform">
                                <Navigation size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-center">
                    <Link href="/market-place">
                        <button className="flex items-center gap-3 text-sm font-bold text-gray-400 hover:text-green-700 transition-colors uppercase tracking-widest">
                            <ArrowLeft size={16} /> {t('Back to Market')}
                        </button>
                    </Link>
                </div>

            </main>
        </div>
    );
}
