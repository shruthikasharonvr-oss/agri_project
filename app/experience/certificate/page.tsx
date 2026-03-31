'use client';

import { useRef } from 'react';
import html2canvas from 'html2canvas';
import { Download, ArrowLeft, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function CertificatePage() {
    const certificateRef = useRef<HTMLDivElement>(null);

    // Mock Data (In a real app, this would come from user session/database)
    const userData = {
        name: "Alex Johnson",
        asset: "Alphonso Mango Orchard",
        location: "Ratnagiri, Maharashtra"
    };

    const handleDownload = async () => {
        if (certificateRef.current) {
            const canvas = await html2canvas(certificateRef.current, { scale: 3 });
            const image = canvas.toDataURL("image/png", 1.0);
            const link = document.createElement('a');
            link.download = 'FarmToHome-Adoption-Certificate.png';
            link.href = image;
            link.click();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 relative">
            <Link href="/">
                <button className="absolute top-8 left-8 bg-white text-gray-900 border-2 border-gray-100 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm flex items-center gap-2">
                    <ArrowLeft size={18} /> Back
                </button>
            </Link>

            <div className="max-w-4xl w-full flex flex-col items-center">
                {/* Certificate Container */}
                <div
                    ref={certificateRef}
                    className="bg-white p-2 w-full aspect-[1.414/1] md:aspect-[1.5/1] relative shadow-2xl mb-12"
                    style={{
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                    }}
                >
                    {/* Inner Gold Border */}
                    <div className="border-[12px] md:border-[16px] border-[#D4AF37] w-full h-full p-8 md:p-16 flex flex-col items-center justify-center relative bg-white">

                        {/* Subtle Corner Accents */}
                        <div className="absolute top-4 left-4 border-t-4 border-l-4 border-[#D4AF37] w-12 h-12" />
                        <div className="absolute top-4 right-4 border-t-4 border-r-4 border-[#D4AF37] w-12 h-12" />
                        <div className="absolute bottom-4 left-4 border-b-4 border-l-4 border-[#D4AF37] w-12 h-12" />
                        <div className="absolute bottom-4 right-4 border-b-4 border-r-4 border-[#D4AF37] w-12 h-12" />

                        <div className="text-center w-full max-w-3xl">
                            <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-2 tracking-tighter uppercase">
                                Certificate of Adoption
                            </h1>
                            <div className="w-24 h-1 bg-[#D4AF37] mx-auto mb-10" />

                            <p className="text-xl md:text-2xl italic text-gray-500 mb-8 font-serif">
                                This certifies that
                            </p>

                            <h2 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 font-serif whitespace-nowrap overflow-hidden text-ellipsis border-b-2 border-gray-200 inline-block px-12 pb-2">
                                {userData.name}
                            </h2>

                            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto">
                                has officially adopted <span className="font-bold text-gray-900">{userData.asset}</span> in <span className="font-bold text-gray-900">{userData.location}</span>.
                                <br /><br />
                                Thank you for supporting sustainable farming and building a better future.
                            </p>

                            {/* Badges/Signatures Footer */}
                            <div className="flex items-end justify-between w-full mt-10">
                                <div className="text-center">
                                    <div className="w-40 border-b-2 border-gray-400 mb-2 h-12 flex items-end justify-center">
                                        <span className="font-['Brush_Script_MT',cursive] text-3xl text-gray-800">David Reynolds</span>
                                    </div>
                                    <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Founder, FarmToHome</p>
                                </div>

                                {/* Green Seal */}
                                <div className="relative flex items-center justify-center">
                                    <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex flex-col items-center justify-center text-white shadow-lg border-4 border-white outline outline-[4px] outline-[#D4AF37]">
                                        <span className="absolute w-[110%] h-[110%] border-[2px] border-dashed border-[#D4AF37] rounded-full animate-[spin_20s_linear_infinite]" />
                                        <Award size={48} className="mb-2" />
                                        <span className="font-black uppercase tracking-widest text-xs">FarmToHome</span>
                                        <span className="text-[8px] font-bold uppercase tracking-widest opacity-80 mt-1">Official Seal</span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <div className="w-40 border-b-2 border-gray-400 mb-2 h-12 flex items-center justify-center text-gray-800 font-bold text-lg">
                                        {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                    <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Date of Certification</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <button
                    onClick={handleDownload}
                    className="bg-gray-900 hover:bg-black text-white px-12 py-6 rounded-full font-black uppercase tracking-widest flex items-center gap-4 transition-all hover:scale-105 shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] active:scale-95 group"
                >
                    <Download size={24} className="group-hover:-translate-y-1 transition-transform" />
                    Download as Image
                </button>
            </div>
        </div>
    );
}
