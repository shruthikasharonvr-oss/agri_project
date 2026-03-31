'use client';

import { ShieldCheck, Lock, FileText, ChevronRight, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../contexts/TranslationContext';
import Link from 'next/link';

export default function PolicyPage() {
    const { t } = useTranslation();
    const router = useRouter();

    const policies = [
        {
            title: 'Privacy Policy',
            icon: <Lock className="text-blue-500" />,
            desc: 'Learn how we protect your data and maintain your privacy while using our platform.',
            link: '/privacy'
        },
        {
            title: 'Terms of Service',
            icon: <FileText className="text-green-600" />,
            desc: 'The legal agreement governing your use of the Farm to Home marketplace and adoption tracking.',
            link: '/terms'
        },
        {
            title: 'Refund & Cancellation',
            icon: <ShieldCheck className="text-orange-500" />,
            desc: 'Our commitment to fair trade and how we handle order issues or investment changes.',
            link: '/terms'
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 selection:bg-green-500/30 font-sans">
            <nav className="p-8 max-w-7xl mx-auto flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-400 font-black uppercase tracking-widest text-xs hover:text-gray-950 transition-colors"
                >
                    <ArrowLeft size={16} /> {t('Back')}
                </button>
                <div className="text-xl font-black text-green-700 tracking-tighter uppercase">FarmToHome</div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-20">
                <div className="text-center mb-20 space-y-6">
                    <div className="w-16 h-16 bg-green-50 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-green-100/50">
                        <ShieldCheck className="text-green-700 font-black" size={32} />
                    </div>
                    <h1 className="text-6xl font-black tracking-tighter uppercase leading-[0.9] text-gray-950">
                        Reliable <br /> <span className="text-green-700">Policies.</span>
                    </h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">
                        {t('Transparency building trust from soil to your table')}
                    </p>
                </div>

                <div className="space-y-6">
                    {policies.map((p, i) => (
                        <Link href={p.link} key={i}>
                            <div className="bg-white border border-gray-100 p-8 rounded-[48px] shadow-sm hover:shadow-2xl hover:scale-[1.02] transition-all flex flex-col md:flex-row items-center gap-8 group cursor-pointer">
                                <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center shrink-0 border border-white shadow-inner">
                                    {p.icon}
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase mb-2">{t(p.title)}</h3>
                                    <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-md">{t(p.desc)}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-2xl text-gray-300 group-hover:bg-green-700 group-hover:text-white transition-all">
                                    <ChevronRight size={24} />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-20 bg-gray-900 rounded-[56px] p-12 text-center text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">{t('Still have questions?')}</h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm mx-auto font-medium">
                            {t('Our legal team and farmers is here to help you understand how we operate together.')}
                        </p>
                        <Link href="/chat">
                            <button className="bg-white text-gray-900 px-10 py-5 rounded-[24px] font-black uppercase tracking-tighter hover:bg-green-700 hover:text-white transition-all shadow-xl">
                                {t('Contact Support')}
                            </button>
                        </Link>
                    </div>
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <FileText size={200} />
                    </div>
                </div>
            </main>
        </div>
    );
}
