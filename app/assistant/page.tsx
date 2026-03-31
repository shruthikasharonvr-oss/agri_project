'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, User, Sparkles, Sprout } from 'lucide-react';
import { useTranslation } from '../contexts/TranslationContext';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
}

export default function AssistantPage() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: 'Hello! I am your Agriculture AI Assistant. How can I help you with your farming today?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setIsLoading(true);

        try {
            // Format history for Gemini API
            const history = messages
                .filter(m => m.text !== 'Hello! I am your Agriculture AI Assistant. How can I help you with your farming today?')
                .map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));

            const response = await fetch('/api/assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userText, history })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Failed to get response');
            }

            setMessages(prev => [...prev, { role: 'model', text: data.text }]);
        } catch (error: any) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col">
            <div className="bg-white rounded-[32px] shadow-lg border border-gray-100 flex flex-col h-full overflow-hidden">
                
                {/* Header */}
                <div className="bg-green-700 p-4 md:p-6 flex items-center gap-4 shrink-0">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-inner">
                        <Sparkles className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-white">{t('AI Assistant')}</h1>
                        <p className="text-green-100 text-sm font-medium flex items-center gap-1">
                            <Sprout size={14} /> Powered by Gemini
                        </p>
                    </div>
                </div>

                {/* Chat Area */}
                <div 
                    ref={scrollRef} 
                    className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-gray-50/50"
                >
                    {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl ${
                                msg.role === 'user' 
                                    ? 'bg-green-700 text-white rounded-tr-sm' 
                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                            }`}>
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                            <div className="bg-white text-gray-500 border border-gray-100 p-4 rounded-2xl rounded-tl-sm shadow-sm font-medium text-sm flex items-center gap-2">
                                <Sparkles size={16} className="animate-pulse text-green-600" />
                                {t('Thinking...')}
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <form onSubmit={handleSend} className="flex gap-2 max-w-4xl mx-auto relative">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={t('Ask me about agriculture...')}
                            className="flex-1 bg-gray-50 border border-gray-200 text-gray-800 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-all text-sm font-medium"
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="bg-green-700 text-white p-4 rounded-full hover:bg-green-800 disabled:opacity-50 disabled:hover:bg-green-700 transition-all shadow-md shrink-0 flex items-center justify-center w-14 h-14"
                        >
                            <Send size={20} className="ml-1" />
                        </button>
                    </form>
                </div>

            </div>
        </div>
    );
}
