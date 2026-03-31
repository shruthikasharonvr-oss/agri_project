'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Loader2, MessageCircle, X, Sparkles, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '../contexts/TranslationContext';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

const GREETING_RESPONSES = {
  'hello': '👋 Hello! How can I help you with agriculture today?',
  'hi': '👋 Hi there! Ask me anything about farming, crops, or agriculture!',
  'hey': '👋 Hey! What farming questions do you have?',
  'good morning': '🌅 Good morning! Ready to help with your farming needs!',
  'good evening': '🌆 Good evening! How can I assist you?',
};

export default function AIAssistantPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for auth context to finish loading
    if (isLoading) {
      return;
    }

    // Check if user is logged in
    if (!user.isLoggedIn) {
      router.push('/login');
      return;
    }

    setIsPageLoading(false);

    const welcomeMessage: ChatMessage = {
      id: '0',
      sender: 'ai',
      text: `Hello ${user.name}! 👋 I'm your agricultural AI assistant. Ask me anything about farming, crops, soil, weather, or agricultural innovations!`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [isLoading, user.isLoggedIn, user.name, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isGreeting = (text: string): boolean => {
    const lowerText = text.toLowerCase().trim();
    return Object.keys(GREETING_RESPONSES).some(greeting => 
      lowerText.includes(greeting)
    );
  };

  const getGreetingResponse = (text: string): string => {
    const lowerText = text.toLowerCase().trim();
    for (const [greeting, response] of Object.entries(GREETING_RESPONSES)) {
      if (lowerText.includes(greeting)) {
        return response;
      }
    }
    return GREETING_RESPONSES['hello'];
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || loading) return;

    const userMessage = inputValue.trim();
    setInputValue('');

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setLoading(true);

    try {
      if (isGreeting(userMessage)) {
        const greetingResponse = getGreetingResponse(userMessage);
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          sender: 'ai',
          text: greetingResponse,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        setLoading(false);
        return;
      }

      const response = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiResponse = data.response || 'I could not generate a response. Please try again.';

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: '❌ Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const displayRole = user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Customer';

  if (isPageLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a1f1e] via-[#0f2f2e] to-[#0a1f1e] flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Brain className="text-green-400" size={48} />
          </motion.div>
          <p className="text-gray-300 font-semibold">Loading AI Assistant...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1f1e] via-[#0f2f2e] to-[#0a1f1e] flex flex-col">
      {/* Header */}
      <motion.header
        className="sticky top-0 z-40 glass backdrop-blur-md border-b border-gray-700"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container-wide flex items-center justify-between py-4">
          <motion.div className="flex items-center gap-4">
            {/* AI Avatar */}
            <motion.div
              className="w-14 h-14 rounded-full bg-gradient-to-br from-green-600 to-cyan-600 flex items-center justify-center text-white relative"
              animate={{ boxShadow: ['0 0 20px rgba(34, 197, 94, 0.3)', '0 0 40px rgba(34, 197, 94, 0.6)', '0 0 20px rgba(34, 197, 94, 0.3)'] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Brain size={24} />
            </motion.div>

            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles size={20} className="text-green-400" />
                AI Agricultural Assistant
              </h1>
              <p className="text-sm text-gray-400">Powered by advanced AI</p>
            </div>
          </motion.div>

          <Link href="/">
            <motion.button
              className="btn-icon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X size={20} />
            </motion.button>
          </Link>
        </div>
      </motion.header>

      {/* User Info Banner */}
      <motion.div
        className="glass backdrop-blur-md border-b border-gray-700 px-4 py-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="container-wide">
          <p className="text-sm text-gray-300">
            Chatting as <span className="text-green-400 font-semibold">{user.name} ({displayRole})</span>
          </p>
        </div>
      </motion.div>

      {/* Chat Messages */}
      <motion.div
        className="flex-1 overflow-y-auto p-6 custom-scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="container-narrow space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, idx) => (
              <motion.div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <motion.div
                  className={`max-w-[75%] rounded-2xl px-5 py-3 backdrop-blur-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-br-none'
                      : 'glass text-white border border-gray-600 rounded-bl-none'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm leading-relaxed break-words">{msg.text}</p>
                  <motion.p
                    className={`text-xs mt-2 font-medium ${
                      msg.sender === 'user'
                        ? 'text-green-100/70'
                        : 'text-gray-400'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {formatTime(msg.timestamp)}
                  </motion.p>
                </motion.div>
              </motion.div>
            ))}

            {/* Loading Indicator */}
            {loading && (
              <motion.div
                key="loading"
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div className="glass px-5 py-3 rounded-2xl rounded-bl-none border border-gray-600">
                  <div className="flex items-center gap-2">
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.1 }}
                    />
                    <motion.div
                      className="w-2 h-2 bg-green-500 rounded-full"
                      animate={{ y: [0, -8, 0] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                    />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </motion.div>

      {/* Input Area */}
      <motion.div
        className="glass backdrop-blur-md border-t border-gray-700 p-4"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="container-narrow">
          <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
            <motion.input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about farming, crops, weather..."
              disabled={loading}
              className="input flex-1 rounded-2xl px-5 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            />

            <motion.button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="btn-icon-glow disabled:opacity-50"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity }}>
                  <Loader2 size={20} />
                </motion.div>
              ) : (
                <Send size={20} />
              )}
            </motion.button>
          </form>

          {/* Help Text */}
          <motion.p
            className="text-xs text-gray-400 mt-3 text-center font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            💡 Ask me about farming techniques, crop health, weather patterns, or agricultural innovations!
          </motion.p>
        </div>
      </motion.div>
    </main>
  );
}
