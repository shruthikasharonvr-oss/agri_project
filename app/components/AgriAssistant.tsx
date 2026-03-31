'use client';

import { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Loader2, Leaf } from 'lucide-react';

interface ChatMessage {
    role: 'user' | 'model';
    parts: { text: string }[];
}

export default function AgriAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([{
        role: 'model',
        parts: [{ text: "Hello! I am your Agri-Assistant 🌱. How can I help you with farming advice or platform navigation today?" }]
    }]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to latest message
    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Listen for custom global event
    useEffect(() => {
        const handleOpen = () => setIsOpen(true);
        window.addEventListener('open-agri-bot', handleOpen);
        return () => window.removeEventListener('open-agri-bot', handleOpen);
    }, []);

    useEffect(() => {
        const savedTheme = localStorage.getItem('fth-theme');
        setIsDark(savedTheme === 'dark');

        const onThemeChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setIsDark(customEvent.detail === 'dark');
        };

        window.addEventListener('fth-theme-change', onThemeChange as EventListener);
        return () => window.removeEventListener('fth-theme-change', onThemeChange as EventListener);
    }, []);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = input.trim();
        if (!text) return;

        // Add user message to UI immediately
        const userMsg: ChatMessage = { role: 'user', parts: [{ text }] };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        setInput('');
        setIsTyping(true);

        try {
            // Prepare history for API (excluding the immediate new user message and formatting properly for Gemini)
            const history = messages.slice(1).map(m => ({
                role: m.role,
                parts: [{ text: m.parts[0].text }]
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text, history })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'API Error');
            }

            const modelMsg: ChatMessage = {
                role: 'model',
                parts: [{ text: data.text }]
            };
            setMessages(prev => [...prev, modelMsg]);

        } catch (error: any) {
            const errorMessage = error.message || "Sorry, I had trouble with that request. Please try again. 🍃";
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: `⚠️ ${errorMessage}` }]
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl shadow-[0_18px_45px_rgba(22,163,74,0.45)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-[9000] border border-white/30"
                title="Ask Agri-Assistant"
            >
                <Bot size={28} />
            </button>
        );
    }

    return (
        <div className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[360px] sm:w-[380px] max-w-[calc(100vw-48px)] sm:max-w-[calc(100vw-64px)] h-[500px] max-h-[80vh] rounded-2xl shadow-2xl flex flex-col z-[9000] overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500 border ${
            isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-green-200'
        }`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Leaf size={20} />
                    <h3 className="font-bold text-sm uppercase tracking-widest">Agri-Assistant</h3>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-transparent hover:text-green-300 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Chat Body */}
            <div className={`flex-1 overflow-y-auto p-4 space-y-4 flex flex-col custom-scroll ${isDark ? 'bg-slate-950' : 'bg-gray-50'}`}>
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm flex flex-col ${msg.role === 'user'
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white self-end rounded-tr-sm shadow-lg'
                            : isDark
                                ? 'bg-slate-900 border border-slate-700 text-slate-100 self-start shadow-sm rounded-tl-sm font-medium'
                                : 'bg-white border border-gray-100 text-gray-800 self-start shadow-sm rounded-tl-sm font-medium'
                            }`}
                    // Let Google translate this text naturally
                    >
                        {msg.parts[0].text}
                    </div>
                ))}

                {isTyping && (
                    <div className={`text-green-700 self-start shadow-sm rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 ${isDark ? 'bg-slate-900 border border-slate-700' : 'bg-white border border-gray-100'}`}>
                        <Loader2 size={16} className="animate-spin" />
                        <span className="text-xs uppercase font-bold tracking-widest animate-pulse">Thinking...</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <form onSubmit={sendMessage} className={`p-3 border-t flex items-center gap-2 shrink-0 ${isDark ? 'bg-slate-900 border-slate-700' : 'bg-white border-gray-100'}`}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about crops, weather..."
                    className={`flex-1 border rounded-xl px-4 py-3 text-sm outline-none transition-all ${
                        isDark
                            ? 'bg-slate-950 border-slate-700 text-white placeholder:text-slate-400 focus:border-green-500'
                            : 'bg-gray-50 border-gray-200 text-black focus:border-green-500 focus:bg-white'
                    }`}
                    disabled={isTyping}
                />
                <button
                    type="submit"
                    disabled={isTyping || !input.trim()}
                    className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl flex items-center justify-center hover:brightness-110 disabled:opacity-50 transition-all shrink-0"
                >
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
}
