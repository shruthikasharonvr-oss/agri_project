'use client';

import { Shield, ArrowLeft, Lock, Eye, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function PrivacyPage() {
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
                            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">Privacy <span className="text-green-700">Policy</span></h1>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Last Updated: March 2026</p>
                        </div>
                    </div>
                    <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center text-green-700 shadow-xl shadow-green-100/50">
                        <Shield size={32} />
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto p-6 md:p-12 space-y-16 pb-32">
                {/* 1. Introduction */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-700 text-white rounded-xl flex items-center justify-center font-black text-xs">01</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">Our Commitment</h2>
                    </div>
                    <div className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 leading-relaxed text-gray-600 font-medium">
                        At <span className="text-green-700 font-bold">FarmToHome</span>, we believe that transparency is the foundation of trust. Just as we believe in knowing exactly where your food comes from, we believe you should know exactly how your data is handled. This policy explains how we collect, use, and protect your information when you use our digital soil platform.
                    </div>
                </section>

                {/* 2. Data Collection */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-700 text-white rounded-xl flex items-center justify-center font-black text-xs">02</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">Information We Collect</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-6"><Lock size={20} /></div>
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-4 text-sm">Personal Identity</h3>
                            <ul className="space-y-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
                                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Full Name & Username</li>
                                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Email & Phone Number</li>
                                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Billing & Shipping Address</li>
                            </ul>
                        </div>
                        <div className="p-8 bg-white border border-gray-100 rounded-[32px] shadow-sm hover:shadow-md transition-all">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center mb-6"><Eye size={20} /></div>
                            <h3 className="font-black text-gray-900 uppercase tracking-tighter mb-4 text-sm">Platform Usage</h3>
                            <ul className="space-y-3 text-xs text-gray-500 font-bold uppercase tracking-widest">
                                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Interaction with Chatbot</li>
                                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Adoption Tracking History</li>
                                <li className="flex items-center gap-2"><CheckCircle size={12} className="text-green-500" /> Geological Preferences</li>
                            </ul>
                        </div>
                    </div>
                </section>

                {/* 3. Data Usage */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-700 text-white rounded-xl flex items-center justify-center font-black text-xs">03</div>
                        <h2 className="text-xl font-black uppercase tracking-tight text-gray-800">How We Use Your Data</h2>
                    </div>
                    <div className="bg-gray-50 p-10 rounded-[48px] border border-gray-100 space-y-8">
                        {[
                            { title: 'Personalization', desc: 'To tailor your marketplace experience and recommend crops based on your climate and history.' },
                            { title: 'Security', desc: 'To prevent fraudulent transactions and ensure only verified farmers can list harvest assets.' },
                            { title: 'AI Training', desc: 'Anonymous chatbot data is used to improve the Agri-Expert\'s accuracy for farming advice.' }
                        ].map((item, i) => (
                            <div key={i} className="flex gap-6">
                                <div className="text-green-700 mt-1"><FileText size={24} /></div>
                                <div>
                                    <h4 className="font-black text-gray-900 uppercase tracking-tighter mb-1">{item.title}</h4>
                                    <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 4. Contact */}
                <section className="bg-gray-900 rounded-[60px] p-12 md:p-20 text-white relative overflow-hidden text-center">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-black mb-6 uppercase tracking-tight">Questions <br /> about your <span className="text-green-500">Privacy?</span></h2>
                        <p className="text-gray-400 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
                            We are always open to discussing our data security measures and how we protect the FarmToHome community.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link href="/chat">
                                <button className="bg-white text-gray-900 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-tighter hover:bg-gray-100 transition-all">
                                    Chat with Support
                                </button>
                            </Link>
                            <a href="mailto:privacy@farmtohome.com">
                                <button className="bg-transparent border-2 border-white/20 hover:border-white text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-tighter transition-all">
                                    Email Legal Team
                                </button>
                            </a>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Shield size={300} />
                    </div>
                </section>
            </main>
        </div>
    );
}
