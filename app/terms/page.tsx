'use client';

import { FileText, ArrowLeft, Scale, Gavel, AlertTriangle, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-green-500/30">
            {/* Header */}
            <div className="bg-white border-b border-gray-100 py-12 px-6">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                        <Link href="/">
                            <button className="p-4 bg-gray-50 text-gray-400 hover:text-green-700 hover:bg-green-50 rounded-2xl transition-all shadow-sm">
                                <ArrowLeft size={20} />
                            </button>
                        </Link>
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">Terms of <span className="text-green-700">Service</span></h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Last Updated: March 2026</p>
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-700 shadow-xl shadow-blue-100/50">
                        <Scale size={32} />
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-16 pb-32">
                {/* Introduction */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-xs">01</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">Agreement to Terms</h2>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 leading-relaxed text-gray-600 font-medium">
                        By accessing or using <span className="text-green-700 font-bold">FarmToHome</span>, you agree to be bound by these terms. This platform operates as a decentralized marketplace for agricultural assets. Whether you are a farmer listing your harvest or a customer adopting a crop, you are entering into a legally binding agreement across our digital soil ecosystem.
                    </div>
                </section>

                {/* User Responsibilities */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-xs">02</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">Community Conduct</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-green-700">
                                <ShieldCheck size={20} />
                                <h3 className="font-black uppercase tracking-tighter text-sm">For Farmers</h3>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                Farmers must provide accurate, real-world data regarding their crops. Misleading 3D models or GPS tags will result in immediate platform suspension and forfeiture of adoption funds.
                            </p>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-blue-600">
                                <Gavel size={20} />
                                <h3 className="font-black uppercase tracking-tighter text-sm">For Customers</h3>
                            </div>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">
                                Adoption is an investment in a living asset. Returns are subject to natural yields, weather conditions, and organic growth cycles. Customers accept the inherent risks of modern agriculture.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Marketplace Rules */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-xs">03</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">Payments & Refunds</h2>
                    </div>
                    <div className="bg-orange-50/50 p-10 rounded-[48px] border border-orange-100 space-y-6">
                        <div className="flex items-center gap-3 text-orange-600">
                            <AlertTriangle size={24} />
                            <h4 className="font-black uppercase tracking-tighter">Refund Policy Disclaimer</h4>
                        </div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                            Due to the perishable nature of agricultural products, refunds are only issued if the product delivered is substantially different from the listing or if the farmer fails to provide verified tracking updates for a period exceeding 14 days.
                        </p>
                    </div>
                </section>

                {/* Limitation of Liability */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-700 text-white rounded-xl flex items-center justify-center font-black text-xs">04</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">Limitation of Liability</h2>
                    </div>
                    <div className="bg-gray-50 p-10 rounded-[40px] border border-gray-100 text-gray-500 text-xs font-bold uppercase tracking-widest leading-loose">
                        FarmToHome Global shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from crop failures, logistical delays, or marketplace fluctuations. You use the service at your own risk.
                    </div>
                </section>

                {/* Contact */}
                <section className="bg-gray-900 rounded-[60px] p-12 md:p-20 text-white relative overflow-hidden text-center">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tight">Legal <span className="text-blue-500">Notice</span></h2>
                        <p className="text-gray-400 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                            Need clarification on these terms? Our team is available 24/7 to discuss the legal framework of our digital soil platform.
                        </p>
                        <div className="flex justify-center">
                            <Link href="/chat">
                                <button className="bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-gray-100 transition-all">
                                    Contact Support
                                </button>
                            </Link>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Scale size={300} />
                    </div>
                </section>
            </main>
        </div>
    );
}
