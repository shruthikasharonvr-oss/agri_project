'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface WelcomeAnimationProps {
    name: string;
    onComplete: () => void;
}

export default function WelcomeAnimation({ name, onComplete }: WelcomeAnimationProps) {
    const [phase, setPhase] = useState<'intro' | 'logo' | 'text' | 'exit'>('intro');

    useEffect(() => {
        // Logic timeline
        const timer1 = setTimeout(() => setPhase('logo'), 300);
        const timer2 = setTimeout(() => setPhase('text'), 1000);
        const timer3 = setTimeout(() => setPhase('exit'), 3500);
        const timer4 = setTimeout(() => onComplete(), 4500);

        return () => {
            [timer1, timer2, timer3, timer4].forEach(clearTimeout);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[10000] bg-black flex flex-col items-center justify-center overflow-hidden">
            {/* The "Netflix" Zooming Background Effect */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                <div className="text-green-600 font-black text-[80vh] opacity-0 animate-netflix-zoom select-none leading-none tracking-tighter italic">
                    F
                </div>
            </div>

            <div className="relative z-10 flex flex-col items-center">
                <AnimatePresence>
                    {(phase === 'logo' || phase === 'text') && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ scale: 1.2, opacity: 0, filter: 'blur(20px)' }}
                            transition={{ duration: 0.8 }}
                            className="mb-6 flex flex-col items-center"
                        >
                            <div className="text-green-500 font-black text-9xl md:text-[12rem] tracking-tighter italic drop-shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                                F
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {phase === 'text' && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="text-center bg-black/50 backdrop-blur-sm p-8 rounded-3xl"
                        >
                            <h2 className="text-gray-400 text-sm md:text-lg font-bold uppercase tracking-[0.4em] mb-3">
                                Welcome Home
                            </h2>
                            <h1 className="text-white text-4xl md:text-7xl font-black tracking-tight">
                                {name.split('').map((char, i) => (
                                    <motion.span
                                        key={i}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 + i * 0.05 }}
                                    >
                                        {char}
                                    </motion.span>
                                ))}
                            </h1>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 2, delay: 1, ease: "easeInOut" }}
                                className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent mt-6 rounded-full"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Subtle radial glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(21,128,61,0.15)_0%,transparent_70%)] pointer-events-none" />
        </div>
    );
}
