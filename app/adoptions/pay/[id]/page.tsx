'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft, CreditCard, ShieldCheck,
    Loader2, CheckCircle2, Ticket, TrendingUp,
    AlertCircle, Lock, Wallet
} from 'lucide-react';
import { logAction } from '../../../lib/logger';
import Link from 'next/link';

export default function PaymentSummaryPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [completed, setCompleted] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [asset, setAsset] = useState<any>(null);

    useEffect(() => {
        async function fetchAsset() {
            const { data, error } = await supabase
                .from('adoptions')
                .select('*, profiles(full_name)')
                .eq('id', id)
                .single();

            if (error || !data) {
                alert('Asset not found');
                router.push('/adoptions');
                return;
            }

            setAsset(data);
            setLoading(false);
        }
        fetchAsset();
    }, [id, router]);

    const handleMockPayment = async () => {
        setProcessing(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/login');
                return;
            }

            // Simulate network delay
            await new Promise(resolve => setTimeout(resolve, 2500));

            const { error } = await supabase
                .from('adoptions')
                .update({
                    status: 'Adopted',
                    adopted_by_id: user.id,
                    adopted_at: new Date().toISOString()
                })
                .eq('id', id);

            if (error) throw error;

            logAction('ADOPTION_SUCCESS', { userId: user.id, details: { assetId: id, assetTitle: asset?.title } });

            setCompleted(true);
            setShowCertificate(true);
        } catch (error: any) {
            alert('Payment failed: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <Loader2 className="animate-spin text-green-700" size={40} />
            </div>
        );
    }

    if (completed) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center relative">
                {/* E-Certificate Modal */}
                {showCertificate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white max-w-3xl w-full rounded-[40px] shadow-2xl overflow-hidden relative border-8 border-green-50 animate-in fade-in zoom-in duration-500">
                            <button onClick={() => setShowCertificate(false)} className="absolute top-6 right-6 text-gray-300 hover:text-gray-900 z-10 p-2">
                                <span className="font-bold text-2xl">&times;</span>
                            </button>

                            <div className="absolute inset-0 border-[12px] border-double border-green-700/20 m-4 rounded-[28px] pointer-events-none"></div>

                            <div className="p-16 text-center">
                                <ShieldCheck className="w-20 h-20 text-green-600 mx-auto mb-6" />
                                <h2 className="text-sm font-black text-green-700 uppercase tracking-[0.3em] mb-4">Official E-Certificate</h2>
                                <h3 className="text-5xl font-black text-gray-900 mb-8 font-serif italic text-center leading-tight">Certificate of <br /> Adoption</h3>
                                <div className="w-16 h-1 bg-green-500 mx-auto mb-8"></div>
                                <p className="text-xl text-gray-600 mb-4 uppercase tracking-widest text-center">This certifies that</p>
                                <p className="text-4xl font-bold text-gray-900 mb-8 text-center">{asset.profiles?.full_name}</p>
                                <p className="text-lg text-gray-500 mb-2 text-center">has successfully adopted the asset</p>
                                <p className="text-2xl font-black text-green-800 mb-12 uppercase tracking-wide text-center">{asset.title}</p>

                                <div className="text-center font-bold text-gray-400 border-t border-gray-100 pt-8 inline-block px-12 text-sm uppercase tracking-widest">
                                    Thank you for contributing!
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-8 animate-bounce">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Adoption Successful!</h1>
                <p className="text-gray-500 max-w-sm mb-10">
                    Congratulations! You have successfully adopted <b>{asset.title}</b>. Your investment is now active and supporting <b>{asset.profiles?.full_name}</b>.
                </p>
                <div className="flex flex-col gap-4 w-full max-w-xs">
                    {!showCertificate && (
                        <button
                            onClick={() => setShowCertificate(true)}
                            className="w-full bg-green-50 text-green-700 py-4 rounded-2xl font-bold hover:bg-green-100 transition-all border border-green-200"
                        >
                            View Certificate
                        </button>
                    )}
                    <button
                        onClick={() => router.push('/account')}
                        className="w-full bg-green-700 text-white py-4 rounded-2xl font-bold hover:bg-green-800 transition-all shadow-xl shadow-green-100"
                    >
                        View My Adoptions
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-white text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-100 transition-all border border-gray-200"
                    >
                        Return Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-green-700 font-bold mb-8 hover:underline">
                    <ArrowLeft size={18} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Summary */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 md:p-12 overflow-hidden relative">
                            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center gap-3">
                                <Ticket className="text-green-700" /> Payment Summary
                            </h1>

                            <div className="flex items-center gap-6 mb-10 pb-10 border-b border-gray-100">
                                <div className="w-24 h-24 rounded-3xl bg-green-50 flex items-center justify-center text-5xl shrink-0 overflow-hidden">
                                    {asset.image_url ? (
                                        <img src={asset.image_url} alt={asset.title} className="w-full h-full object-cover" />
                                    ) : (
                                        '🌾'
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{asset.title}</h2>
                                    <p className="text-sm text-gray-400">by {asset.profiles?.full_name}</p>
                                    <span className="inline-block mt-2 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">{asset.asset_type}</span>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-gray-500">
                                    <p className="text-sm">Contribution Amount</p>
                                    <p className="font-bold text-gray-900">₹{asset.target_funding.toLocaleString()}</p>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <p className="text-sm">Platform Fee (0%)</p>
                                    <p className="font-bold text-green-600">₹0.00</p>
                                </div>
                                <div className="flex justify-between items-center text-gray-500">
                                    <p className="text-sm">GST (Included)</p>
                                    <p className="font-bold text-gray-900">₹0.00</p>
                                </div>
                                <div className="pt-6 border-t border-gray-100 flex justify-between items-center">
                                    <p className="text-lg font-bold text-gray-900">Total Payable</p>
                                    <p className="text-2xl font-black text-green-700">₹{asset.target_funding.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Why Support? */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-1">Secure Transaction</h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">Your payment is held in escrow until certification is issued.</p>
                                </div>
                            </div>
                            <div className="bg-white rounded-[30px] p-6 shadow-sm border border-gray-100 flex items-start gap-4">
                                <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                                    <TrendingUp size={20} />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-1">Guaranteed Profits</h4>
                                    <p className="text-[10px] text-gray-400 leading-relaxed">You are eligible for a 30% share of the net profit from this asset.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Checkout Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-8 sticky top-24">
                            <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <Wallet size={20} className="text-green-700" /> Payment Method
                            </h3>

                            <div className="space-y-4 mb-8">
                                <div className="border-2 border-green-500 bg-green-50 p-4 rounded-2xl flex items-center justify-between cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <CreditCard className="text-green-700" size={20} />
                                        <span className="text-sm font-bold text-green-900">Mock UPI / Card</span>
                                    </div>
                                    <CheckCircle2 size={18} className="text-green-700" />
                                </div>
                                <div className="border-2 border-gray-100 p-4 rounded-2xl flex items-center justify-between opacity-50 cursor-not-allowed">
                                    <div className="flex items-center gap-3">
                                        <ArrowLeft className="text-gray-400 rotate-180" size={20} />
                                        <span className="text-sm font-bold text-gray-400">Wallet</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-2xl p-4 mb-8 flex items-start gap-3">
                                <AlertCircle size={16} className="text-orange-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-gray-500 leading-relaxed">
                                    This is a <span className="font-bold">MOCK PAYMENT</span> simulation for development purposes. No real money will be charged.
                                </p>
                            </div>

                            <button
                                onClick={handleMockPayment}
                                disabled={processing}
                                className="w-full bg-green-700 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-green-800 shadow-xl shadow-green-100 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Lock size={18} />
                                        Pay ₹{asset.target_funding.toLocaleString()}
                                    </>
                                )}
                            </button>

                            <p className="text-center mt-6 text-[10px] text-gray-400 font-medium">
                                Secured by FarmToHome Escrow Systems
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
