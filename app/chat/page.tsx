'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Phone, Video, Info, Search, Smile, Paperclip } from 'lucide-react';

type Message = {
  id: number;
  text: string;
  sender: 'me' | 'other';
  time: string;
  isTyping?: boolean;
};

const STORAGE_KEY = 'simple_chat_messages';

const formatRole = (role: string | null) => {
  const normalized = (role || '').toLowerCase();
  return normalized === 'farmer' ? 'Farmer' : 'Customer';
};

const now = () =>
  new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ChatPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

    setName(user.name || '');
    setRole(user.role || 'customer');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setMessages(JSON.parse(saved));
      return;
    }

    const welcomeMessage: Message = {
      id: Date.now(),
      text: `Hi ${user.name} (${formatRole(user.role)}), you are now connected.`,
      sender: 'other',
      time: now(),
    };
    setMessages([welcomeMessage]);
  }, [router, user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const displayName = useMemo(() => {
    if (!name) {
      return '';
    }
    return `${name} (${formatRole(role)})`;
  }, [name, role]);

  const scrollToBottom = () => {
    const element = document.getElementById('messages-container');
    if (element) {
      setTimeout(() => {
        element.scrollTop = element.scrollHeight;
      }, 100);
    }
  };

  const sendMessage = () => {
    const text = input.trim();
    if (!text) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      text,
      sender: 'me',
      time: now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    // Show typing indicator
    setIsTyping(true);

    setTimeout(() => {
      const reply: Message = {
        id: Date.now() + 1,
        text: 'That sounds great! Let me get back to you on that.',
        sender: 'other',
        time: now(),
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
      scrollToBottom();
    }, 1500);

    scrollToBottom();
  };

  // Show loading state while auth is being initialized
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-[#0a1f1e] via-[#0f2f2e] to-[#0a1f1e] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-green-500/30 border-t-green-500 animate-spin"></div>
          <p className="text-gray-400">Loading chat...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a1f1e] via-[#0f2f2e] to-[#0a1f1e] flex items-center justify-center p-4">
      <motion.section
        className="glass w-full max-w-2xl h-[90vh] md:h-[85vh] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <motion.header
          className="bg-gradient-to-r from-green-600/20 to-cyan-600/20 backdrop-blur-md border-b border-gray-700 px-6 py-4"
          initial={{ y: -50 }}
          animate={{ y: 0 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <motion.div
                className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-cyan-500 flex items-center justify-center text-white font-bold text-lg"
                whileHover={{ scale: 1.05 }}
              >
                {name.charAt(0).toUpperCase()}
              </motion.div>

              {/* Chat Details */}
              <div>
                <h1 className="text-lg font-bold text-white">{displayName}</h1>
                <div className="flex items-center gap-2">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <motion.button
                className="btn-icon"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Phone size={18} />
              </motion.button>
              <motion.button
                className="btn-icon"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Video size={18} />
              </motion.button>
              <motion.button
                className="btn-icon"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Info size={18} />
              </motion.button>
            </div>
          </div>
        </motion.header>

        {/* Messages Container */}
        <motion.div
          id="messages-container"
          className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <motion.div
                key={message.id}
                className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <motion.div
                  className={`max-w-[70%] rounded-2xl px-5 py-3 backdrop-blur-md ${
                    message.sender === 'me'
                      ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-br-none'
                      : 'glass text-white rounded-bl-none border border-gray-600'
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <p className="text-sm md:text-base break-words">{message.text}</p>
                  <p
                    className={`mt-2 text-xs font-medium ${
                      message.sender === 'me'
                        ? 'text-green-100/70'
                        : 'text-gray-400'
                    }`}
                  >
                    {message.time}
                  </p>
                </motion.div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <motion.div
                key="typing"
                className="flex justify-start"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <motion.div className="glass px-5 py-3 rounded-2xl rounded-bl-none flex items-center gap-2 border border-gray-600">
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
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Input Footer */}
        <motion.footer
          className="bg-gradient-to-r from-green-600/10 to-cyan-600/10 backdrop-blur-md border-t border-gray-700 p-4"
          initial={{ y: 50 }}
          animate={{ y: 0 }}
        >
          <div className="flex gap-3 items-center">
            <motion.button
              className="btn-icon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Paperclip size={18} />
            </motion.button>

            <motion.input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="input flex-1 rounded-full px-5 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            />

            <motion.button
              className="btn-icon"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Smile size={18} />
            </motion.button>

            <motion.button
              onClick={sendMessage}
              className="btn-icon-glow"
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              disabled={!input.trim()}
            >
              <Send size={18} />
            </motion.button>
          </div>
        </motion.footer>
      </motion.section>
    </main>
  );
}