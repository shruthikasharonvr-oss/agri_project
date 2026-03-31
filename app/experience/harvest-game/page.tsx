'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Trophy, Clock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function HarvestGame() {
    const router = useRouter();
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);
    const [isPlaying, setIsPlaying] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [activeCell, setActiveCell] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const role = localStorage.getItem('role');
        const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
        
        if (!isLoggedIn) {
            router.push('/login');
            return;
        }
        
        setUserRole(role);
        setIsLoading(false);
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4">🌾</div>
                    <p className="text-gray-600 font-semibold">Loading...</p>
                </div>
            </div>
        );
    }

    if (userRole === 'Farmer') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                    <span className="text-4xl">⚠️</span>
                </div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4 uppercase">Access Restricted</h1>
                <p className="text-gray-500 uppercase font-bold tracking-widest mb-8 max-w-sm">
                    This interactive game is exclusively available for our customers.
                </p>
                <Link href="/">
                    <button className="bg-green-700 text-white px-8 py-4 rounded-[24px] font-black uppercase tracking-widest hover:bg-green-800 transition-all shadow-xl active:scale-95">
                        Return Home
                    </button>
                </Link>
            </div>
        );
    }

    useEffect(() => {
        let spawner: NodeJS.Timeout;
        if (isPlaying && !gameOver) {
            const spawnRate = Math.max(400, 1000 - score * 5); // Speeds up as score increases
            spawner = setInterval(() => {
                const randomCell = Math.floor(Math.random() * 9);
                setActiveCell(randomCell);
            }, spawnRate);
        }
        return () => clearInterval(spawner);
    }, [isPlaying, gameOver, score]);

    const startGame = () => {
        setScore(0);
        setTimeLeft(30);
        setIsPlaying(true);
        setGameOver(false);
    };

    const handleHarvest = (index: number) => {
        if (!isPlaying) return;
        if (index === activeCell) {
            setScore((prev) => prev + 10);
            setActiveCell(null); // Instantly hide crop after harvest
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex flex-col items-center justify-center p-6 relative">
            <Link href="/">
                <button className="absolute top-8 left-8 bg-white text-gray-900 border-2 border-gray-100 px-6 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-gray-900 hover:text-white transition-all shadow-sm flex items-center gap-2">
                    <ArrowLeft size={18} /> Back
                </button>
            </Link>

            <div className="max-w-xl w-full text-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-5xl font-black text-green-700 tracking-tighter mb-4 uppercase">
                        Game
                    </h1>
                    <p className="text-gray-500 font-bold uppercase tracking-widest">
                        Tap the crops before they disappear!
                    </p>
                </motion.div>

                {/* Stats */}
                <div className="flex justify-between items-center mb-10 bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
                    <div className="flex items-center gap-3">
                        <Trophy size={32} className="text-orange-500" />
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Yield</p>
                            <p className="text-3xl font-black text-gray-900 leading-none">{score} <span className="text-lg text-gray-400">kg</span></p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Clock size={32} className={timeLeft <= 5 ? "text-red-500" : "text-blue-500"} />
                        <div className="text-right">
                            <p className="text-[10px] uppercase font-black tracking-widest text-gray-400">Time</p>
                            <p className={`text-3xl font-black leading-none ${timeLeft <= 5 ? 'text-red-500' : 'text-gray-900'}`}>{timeLeft}s</p>
                        </div>
                    </div>
                </div>

                {/* Game Grid */}
                <div className="grid grid-cols-3 gap-4 mb-10 mx-auto aspect-square max-w-[400px]">
                    {Array.from({ length: 9 }).map((_, i) => (
                        <motion.div
                            key={i}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleHarvest(i)}
                            className="bg-white rounded-3xl shadow-[0_10px_30px_-15px_rgba(0,0,0,0.1)] border border-gray-100 flex items-center justify-center cursor-pointer overflow-hidden relative"
                        >
                            <AnimatePresence>
                                {activeCell === i && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 0, opacity: 0, y: -20 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="absolute inset-0 flex items-center justify-center text-green-500"
                                    >
                                        <Sprout size={64} className="drop-shadow-lg" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>

                {/* Controls / Game Over Screen */}
                {!isPlaying && !gameOver && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={startGame}
                        className="w-full bg-green-600 text-white py-6 rounded-3xl font-black text-2xl uppercase tracking-tighter shadow-xl hover:bg-green-700 transition"
                    >
                        Start Harvesting
                    </motion.button>
                )}

                <AnimatePresence>
                    {gameOver && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-50"
                        >
                            <div className="bg-white p-12 rounded-[50px] shadow-2xl max-w-md w-full text-center relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 bg-orange-100 w-40 h-40 rounded-full blur-3xl" />
                                <div className="absolute -bottom-10 -left-10 bg-green-100 w-40 h-40 rounded-full blur-3xl" />

                                <div className="relative z-10">
                                    <motion.div
                                        initial={{ scale: 0, rotate: -180 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                                        className="w-32 h-32 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-8 border-8 border-white shadow-xl"
                                    >
                                        <span className="text-6xl">🎉</span>
                                    </motion.div>

                                    <h2 className="text-4xl font-black text-gray-900 mb-4 tracking-tighter">Congratulations!</h2>
                                    <p className="text-xl text-gray-500 font-bold mb-8">
                                        You successfully harvested <br />
                                        <span className="text-green-600 text-5xl font-black my-4 block">{score} kg</span>
                                        of fresh produce!
                                    </p>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={startGame}
                                            className="flex-1 bg-gray-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition shadow-lg"
                                        >
                                            Play Again
                                        </button>
                                        <Link href="/experience/certificate" className="flex-1">
                                            <button className="w-full bg-green-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-green-600 transition shadow-lg">
                                                Claim Cert
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
