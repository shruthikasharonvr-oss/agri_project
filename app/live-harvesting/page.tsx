'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, Trophy, Sprout } from 'lucide-react';

export default function LiveHarvestingPage() {
    const [score, setScore] = useState(0);
    const totalCrops = 6;
    const [planted, setPlanted] = useState<number[]>([]);
    const [draggedItem, setDraggedItem] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);

    // Audio context for sound effects
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        setUserRole(localStorage.getItem('role'));
    }, []);

    if (userRole === 'Farmer') {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-900/40 rounded-full flex items-center justify-center mb-6 shadow-inner border border-red-500/50">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h1 className="text-4xl font-black text-white tracking-tighter mb-4 uppercase">Access Restricted</h1>
                <p className="text-gray-400 uppercase font-bold tracking-widest mb-8 max-w-sm">
                    This interactive game is exclusively available for our customers.
                </p>
                <Link href="/">
                    <button className="bg-green-600 text-white px-8 py-4 rounded-[24px] font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl border border-green-500/50 active:scale-95">
                        Return Home
                    </button>
                </Link>
            </div>
        );
    }

    useEffect(() => {
        // Initialize audio context on first interaction to comply with browser policies
        const initAudio = () => {
            if (!audioCtxRef.current) {
                const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
                if (AudioContextClass) {
                    audioCtxRef.current = new AudioContextClass();
                }
            }
        };
        window.addEventListener('click', initAudio, { once: true });
        return () => window.removeEventListener('click', initAudio);
    }, []);

    const playPopSound = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const playWinSound = () => {
        if (!audioCtxRef.current) return;
        const ctx = audioCtxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        // Play an arpeggio
        [440, 554, 659, 880].forEach((freq, i) => {
            osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
        });
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    };

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: number) => {
        setDraggedItem(id);
        e.dataTransfer.setData('cropId', id.toString());
        // Optional: make it look better while dragging
        const img = new Image();
        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"><text y="20" font-size="20">🌱</text></svg>';
        e.dataTransfer.setDragImage(img, 20, 20);
    };

    const handleDragEnd = () => {
        setDraggedItem(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDraggedItem(null);
        const id = parseInt(e.dataTransfer.getData('cropId'));
        if (!isNaN(id) && !planted.includes(id)) {
            const newPlanted = [...planted, id];
            setPlanted(newPlanted);
            setScore(newPlanted.length * 10);

            if (newPlanted.length === totalCrops) {
                playWinSound();
            } else {
                playPopSound();
            }
        }
    };

    return (
        <main className="min-h-screen bg-gray-950 text-white overflow-hidden flex flex-col items-center justify-center relative [perspective:2000px]">
            {/* Background 3D Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#22c55e_0%,_transparent_40%)] opacity-20" />
                <motion.div animate={{ rotateZ: 360 }} transition={{ duration: 100, repeat: Infinity, ease: 'linear' }} className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
            </div>

            <div className="absolute top-8 left-8 z-50">
                <Link href="/">
                    <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-md">
                        <ArrowLeft size={20} /> <span className="font-bold tracking-widest uppercase text-sm">Return Home</span>
                    </button>
                </Link>
            </div>

            <div className="relative z-10 max-w-7xl w-full px-6 flex flex-col items-center">
                <motion.h1
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-7xl lg:text-9xl font-black uppercase italic tracking-tighter mb-4 text-center"
                >
                    Live <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Harvest</span>
                </motion.h1>
                <motion.p
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-xl text-gray-400 mb-16 font-medium text-center max-w-2xl"
                >
                    Experience the future of farming. Drag the fresh seedlings into the agricultural grid to plant them.
                </motion.p>

                <div className="flex w-full max-w-5xl justify-between items-center bg-white/5 border border-white/10 rounded-[40px] p-8 mb-16 backdrop-blur-xl shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-2xl flex items-center justify-center border border-green-500/30">
                            <Sprout size={32} />
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Progress</p>
                            <p className="text-3xl font-black">{planted.length} <span className="text-gray-500 text-xl">/ {totalCrops}</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-right">
                        <div>
                            <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Score</p>
                            <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">{score}</p>
                        </div>
                        <div className="w-16 h-16 bg-orange-500/20 text-orange-400 rounded-2xl flex items-center justify-center border border-orange-500/30">
                            <Trophy size={32} />
                        </div>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {planted.length === totalCrops ? (
                        <motion.div
                            key="success"
                            initial={{ scale: 0.8, opacity: 0, rotateX: -30 }}
                            animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                            transition={{ type: "spring", bounce: 0.5 }}
                            className="bg-gradient-to-br from-green-500 to-emerald-700 p-16 rounded-[60px] text-center border-8 border-green-400/30 shadow-[0_0_100px_rgba(34,197,94,0.5)] transform-gpu"
                        >
                            <motion.div
                                animate={{ y: [0, -20, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="text-9xl mb-8 filter drop-shadow-2xl"
                            >
                                🌾
                            </motion.div>
                            <h2 className="text-6xl font-black uppercase tracking-tighter mb-4 text-white">Harvest Complete!</h2>
                            <p className="text-2xl text-green-100 font-bold mb-10">You've successfully planted all crops. Excellent work, farmer!</p>
                            <button
                                onClick={() => { setPlanted([]); setScore(0); }}
                                className="bg-white text-green-700 px-12 py-6 rounded-full font-black uppercase tracking-widest hover:scale-110 active:scale-95 transition-all shadow-2xl"
                            >
                                Play Again
                            </button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="game"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex flex-col lg:flex-row gap-12 w-full items-center justify-center h-96"
                        >
                            {/* Inventory */}
                            <div className="w-full lg:w-1/3 h-full bg-white/5 border-2 border-dashed border-white/20 rounded-[40px] p-8 flex flex-wrap gap-6 items-center justify-center content-center backdrop-blur-md relative">
                                <span className="absolute -top-4 left-8 bg-gray-900 px-4 py-1 text-sm font-bold tracking-widest uppercase text-gray-400 rounded-full border border-white/10">Inventory</span>
                                {[...Array(totalCrops)].map((_, i) => (
                                    !planted.includes(i) && (
                                        <motion.div
                                            key={i}
                                            layoutId={`crop-${i}`}
                                            draggable
                                            onDragStart={(e: any) => handleDragStart(e, i)}
                                            onDragEnd={handleDragEnd}
                                            whileHover={{ scale: 1.2, rotate: 10 }}
                                            whileDrag={{ scale: 1.5, zIndex: 50, rotate: -15 }}
                                            className="w-20 h-20 bg-gradient-to-br from-white to-gray-200 rounded-2xl flex items-center justify-center text-5xl cursor-grab active:cursor-grabbing shadow-2xl transform-gpu border-4 border-white/40"
                                        >
                                            🌱
                                        </motion.div>
                                    )
                                ))}
                            </div>

                            {/* Field */}
                            <motion.div
                                animate={draggedItem !== null ? { scale: 1.05, borderColor: "rgba(34,197,94,0.6)" } : { scale: 1, borderColor: "rgba(139,90,43,0.4)" }}
                                className="w-full lg:w-2/3 h-full bg-gradient-to-br from-[#5C3A21] to-[#3B2211] rounded-[40px] border-8 shadow-inner flex flex-wrap items-center justify-center gap-6 p-8 relative overflow-hidden transition-all duration-300 transform-gpu"
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, #000 20px, #000 40px)' }}></div>
                                {planted.length === 0 && (
                                    <h3 className="absolute inset-0 flex items-center justify-center text-4xl font-black uppercase tracking-widest text-white/20 pointer-events-none text-center px-4">
                                        Drop Seeds Here
                                    </h3>
                                )}

                                <AnimatePresence>
                                    {planted.map(id => (
                                        <motion.div
                                            key={`planted-${id}`}
                                            layoutId={`crop-${id}`}
                                            initial={{ scale: 0, rotateX: 90 }}
                                            animate={{ scale: 1, rotateX: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                            className="relative z-10 text-6xl drop-shadow-2xl"
                                        >
                                            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: Math.random() }}>
                                                🌾
                                            </motion.div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
