'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useCart } from '../../contexts/CartContext';
import { useTranslation } from '../../contexts/TranslationContext';
import {
    ShoppingBag, ArrowLeft, Star, MapPin,
    Calendar, ShieldCheck, Leaf, User,
    Zap, Loader2, Info, ChevronRight,
    Droplets, ThermometerSun
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const { addToCart } = useCart();

    const [loading, setLoading] = useState(true);
    const [product, setProduct] = useState<any>(null);
    const [quantity, setQuantity] = useState(1);
    const [isSubscription, setIsSubscription] = useState(false);
    const [subscriptionFrequency, setSubscriptionFrequency] = useState<'Weekly' | 'Monthly'>('Weekly');

    useEffect(() => {
        async function fetchProduct() {
            setLoading(true);
            const { data, error } = await supabase
                .from('products')
                .select('*, profiles(*)')
                .eq('id', id)
                .single();

            if (error || !data) {
                // Fallback for demo if ID isn't in real DB yet
                setProduct({
                    id: id,
                    name: "Premium Finger Millet",
                    price: 120,
                    unit: "kg",
                    category: "Grains",
                    image_url: null,
                    description: "Hand-harvested from the nutrient-rich red soil of Mandya. This finger millet (Ragi) is grown using 100% natural farming techniques without any synthetic pesticides. Rich in calcium and fiber.",
                    profiles: {
                        full_name: "Farmer Somanna",
                        bio: "Somanna has been practicing natural farming for 20 years. He specializes in drought-resistant ancient grains.",
                        location: "Mandya, Karnataka"
                    },
                    created_at: new Date().toISOString(),
                });
            } else {
                setProduct(data);
            }
            setLoading(false);
        }
        fetchProduct();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-green-700" size={40} />
            </div>
        );
    }

    const harvestDate = new Date(product.created_at);
    const daysSinceHarvest = Math.floor((new Date().getTime() - harvestDate.getTime()) / (1000 * 3600 * 24));

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-32">
            {/* HEADER */}
            <div className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-all">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-all">
                        <Info size={20} className="text-gray-400" />
                    </button>
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-6 pt-24 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* LEFT: VISUALS */}
                <div className="space-y-8">
                    <div className="relative aspect-square bg-green-50 rounded-[48px] overflow-hidden group shadow-2xl shadow-green-100/50">
                        {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-9xl">🌾</div>
                        )}
                        <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl text-[10px] font-black text-green-700 uppercase tracking-widest shadow-sm">
                            {t(product.category)}
                        </div>
                    </div>

                    {/* FRESHNESS TIMELINE */}
                    <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Zap size={18} className="text-orange-500" />
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{t('Freshness Timeline')}</h3>
                        </div>
                        <div className="relative flex justify-between">
                            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200"></div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center shadow-lg"><Calendar size={14} /></div>
                                <p className="text-[10px] font-bold uppercase text-gray-900">{t('Harvested')}</p>
                                <p className="text-[9px] text-gray-400">{harvestDate.toLocaleDateString()}</p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-white border-2 border-green-600 text-green-600 flex items-center justify-center"><Droplets size={14} /></div>
                                <p className="text-[10px] font-bold uppercase text-gray-900">{t('Quality Check')}</p>
                                <p className="text-[9px] text-gray-400">{t('Passed')}</p>
                            </div>
                            <div className="relative z-10 flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-300 flex items-center justify-center"><ShoppingBag size={14} /></div>
                                <p className="text-[10px] font-bold uppercase text-gray-400">{t('Delivered')}</p>
                                <p className="text-[9px] text-gray-400">T-3 Days</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: NARRATIVE */}
                <div className="space-y-10">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} className="fill-yellow-400 text-yellow-400" />)}
                            </div>
                            <span className="text-xs font-bold text-gray-400 underline decoration-dotted">48 {t('Farmer Reviews')}</span>
                        </div>
                        <h1 className="text-5xl font-black tracking-tighter text-gray-900 uppercase mb-4 leading-none">{t(product.name)}</h1>
                        <p className="text-lg text-gray-500 leading-relaxed font-medium mb-6">
                            {product.description}
                        </p>
                        <div className="flex items-baseline gap-4 mb-8">
                            <span className="text-4xl font-black text-green-800">
                                ₹{isSubscription ? (product.price * 0.9).toFixed(0) : product.price}
                            </span>
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">per {product.unit}</span>
                            {isSubscription && (
                                <span className="bg-orange-100 text-orange-700 font-bold text-[10px] px-2 py-1 rounded-full uppercase tracking-widest">
                                    {t('Save 10%')}
                                </span>
                            )}
                        </div>

                        {/* SMART SUBSCRIPTIONS */}
                        <div className="bg-gray-50 p-2 rounded-[24px] border border-gray-100 flex mb-8">
                            <button
                                onClick={() => setIsSubscription(false)}
                                className={`flex-1 py-4 px-6 rounded-[20px] font-black uppercase text-xs tracking-widest transition-all ${!isSubscription ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                                {t('One-Time Purchase')}
                            </button>
                            <button
                                onClick={() => setIsSubscription(true)}
                                className={`flex-1 py-4 px-6 rounded-[20px] font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 ${isSubscription ? 'bg-green-100 text-green-800 shadow-sm border border-green-200' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Calendar size={14} /> {t('Subscribe')}
                            </button>
                        </div>

                        {isSubscription && (
                            <div className="mb-8 animate-in slide-in-from-top-2 fade-in duration-300">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-3">{t('Delivery Frequency')}</p>
                                <div className="flex gap-4">
                                    {['Weekly', 'Bi-Weekly', 'Monthly'].map((freq) => (
                                        <button
                                            key={freq}
                                            onClick={() => setSubscriptionFrequency(freq as any)}
                                            className={`px-6 py-3 rounded-[16px] font-bold text-xs uppercase tracking-widest transition-all ${subscriptionFrequency === freq ? 'bg-green-700 text-white shadow-lg shadow-green-200' : 'bg-white border-2 border-gray-50 text-gray-500 hover:border-gray-100'}`}
                                        >
                                            {t(freq)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* FARMER PROFILE CARD */}
                    <div className="bg-white border-2 border-green-600/10 p-8 rounded-[40px] flex gap-6 items-start relative overflow-hidden group hover:border-green-600 transition-colors cursor-pointer shadow-xl shadow-green-100/20">
                        <div className="w-20 h-20 rounded-[28px] bg-green-700 flex items-center justify-center text-white text-3xl font-black shrink-0 shadow-lg">
                            {product.profiles?.full_name?.[0]}
                        </div>
                        <div>
                            <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-2">
                                <ShieldCheck size={12} /> {t('Verified Natural Farmer')}
                            </div>
                            <h3 className="text-xl font-black uppercase tracking-tight mb-1">{product.profiles?.full_name}</h3>
                            <p className="text-xs font-bold text-gray-400 flex items-center gap-1 mb-3 uppercase tracking-tighter">
                                <MapPin size={12} /> {product.profiles?.location || 'Karnataka'}
                            </p>
                            <p className="text-xs text-gray-500 leading-relaxed italic line-clamp-2">
                                "{product.profiles?.bio || 'Dedicated to sustainable earth practices.'}"
                            </p>
                        </div>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 group-hover:text-green-700 transition-all" />
                    </div>

                    {/* SOIL & ENVIRONMENT SCORE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-orange-50 p-6 rounded-[32px] border border-orange-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Leaf className="text-orange-600" size={18} />
                                <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest">{t('Soil Health')}</span>
                            </div>
                            <p className="text-2xl font-black text-orange-900">9.4/10</p>
                            <p className="text-[10px] font-bold text-orange-600/70 uppercase pt-1">{t('Rich in Nitrogen')}</p>
                        </div>
                        <div className="bg-blue-50 p-6 rounded-[32px] border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <ThermometerSun className="text-blue-600" size={18} />
                                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">{t('Growing Conditions')}</span>
                            </div>
                            <p className="text-2xl font-black text-blue-900">Optimal</p>
                            <p className="text-[10px] font-bold text-blue-600/70 uppercase pt-1">{t('Monsoon Fed')}</p>
                        </div>
                    </div>

                    {/* QUANTITY & ACTIONS */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <div className="flex items-center bg-gray-50 p-2 rounded-3xl border border-gray-100">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-gray-600 hover:text-green-700 transition-all"
                            >
                                -
                            </button>
                            <span className="w-12 text-center font-black text-gray-900">{quantity}</span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl shadow-sm text-gray-600 hover:text-green-700 transition-all"
                            >
                                +
                            </button>
                        </div>
                        <button
                            onClick={() => {
                                addToCart({
                                    id: product.id + (isSubscription ? '-sub' : ''),
                                    name: product.name + (isSubscription ? ` (${subscriptionFrequency} Sub)` : ''),
                                    price: isSubscription ? Number((product.price * 0.9).toFixed(0)) : product.price,
                                    quantity: quantity,
                                    unit: product.unit,
                                    image_url: product.image_url || '',
                                    farmer_name: product.profiles?.full_name || 'Farmer'
                                });
                                alert(isSubscription ? t('Subscription Added to Cart!') : t('Added to Cart!'));
                            }}
                            className={`flex-1 text-white py-5 rounded-3xl font-black uppercase tracking-tighter text-lg shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3 ${isSubscription ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-200' : 'bg-green-700 hover:bg-green-800 shadow-green-100'}`}
                        >
                            <ShoppingBag size={24} /> {isSubscription ? t('Subscribe Now') : t('Add to Basket')}
                        </button>
                    </div>

                </div>
            </main>

            {/* RELATED PROMISE */}
            <section className="bg-gray-900 mt-24 py-24 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <User className="text-green-500 mx-auto mb-6" size={48} />
                    <h2 className="text-3xl font-black uppercase tracking-tight mb-4">{t('Our Farm-to-Home Promise')}</h2>
                    <p className="text-gray-400 leading-relaxed font-medium">
                        {t('Every grain of this')} {t(product.name)} {t('is tracked from seed to your door. We ensure the farmer receives 70% of what you pay today, bypassing all industrial middlemen.')}
                    </p>
                </div>
            </section>
        </div>
    );
}
