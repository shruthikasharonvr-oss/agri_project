'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Phone, Video, Info, Smile, Plus } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Message {
  id: string;
  sender: 'user' | 'other';
  text: string;
  timestamp: Date;
  senderName: string;
}

// Sample farmers/customers for chat
const CHAT_CONTACTS = [
  { id: 1, name: 'Ramesh Kumar', role: 'Farmer', status: 'active', image: '🌾' },
  { id: 2, name: 'Priya Sharma', role: 'Customer', status: 'active', image: '👤' },
  { id: 3, name: 'Harish Patel', role: 'Farmer', status: 'inactive', image: '🌾' },
  { id: 4, name: 'Sneha Gupta', role: 'Customer', status: 'active', image: '👤' },
  { id: 5, name: 'Vijay Singh', role: 'Farmer', status: 'inactive', image: '🌾' },
];

export default function ChatPage() {
  const router = useRouter();
  const { name, role, isLoggedIn } = useAuth();
  const [selectedContact, setSelectedContact] = useState(CHAT_CONTACTS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize messages for the selected contact
  useEffect(() => {
    if (!isLoggedIn) {
      router.push('/simple-login');
      return;
    }
    setLoading(false);

    // Simulate loading existing messages
    const sampleMessages: Message[] = [
      {
        id: '1',
        sender: 'other',
        text: 'Hello! Do you have fresh tomatoes available?',
        timestamp: new Date(Date.now() - 3600000),
        senderName: selectedContact.name
      },
      {
        id: '2',
        sender: 'user',
        text: 'Hi! Yes, we have fresh tomatoes. 1kg for ₹40',
        timestamp: new Date(Date.now() - 3000000),
        senderName: name || 'You'
      },
      {
        id: '3',
        sender: 'other',
        text: "That's great! Can I order 5kg?",
        timestamp: new Date(Date.now() - 1800000),
        senderName: selectedContact.name
      },
      {
        id: '4',
        sender: 'user',
        text: 'Sure! That will be ₹200. When do you need it?',
        timestamp: new Date(Date.now() - 900000),
        senderName: name || 'You'
      }
    ];
    setMessages(sampleMessages);
  }, [isLoggedIn, selectedContact, name, router]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage.trim(),
      timestamp: new Date(),
      senderName: name || 'You'
    };

    setMessages([...messages, userMessage]);
    setNewMessage('');

    // Simulate reply after a short delay
    setTimeout(() => {
      const replyMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'other',
        text: getAutoReply(),
        timestamp: new Date(),
        senderName: selectedContact.name
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1000);
  };

  const getAutoReply = () => {
    const replies = [
      "That sounds great! When can you deliver?",
      "Sure, I'd love to buy that.",
      "What's the quality like?",
      "Can I get more details about this product?",
      "Perfect! Please confirm the order.",
      "Thank you! Looking forward to it.",
    ];
    return replies[Math.floor(Math.random() * replies.length)];
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-300 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-bold">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Contacts List */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="mb-4">
            <h1 className="text-2xl font-black text-gray-900">Messages</h1>
            <p className="text-xs text-gray-500 font-bold">
              <span className="text-green-600">●</span> Available to chat
            </p>
          </div>

          {/* User Info Card */}
          <div className="bg-green-50 border border-green-200 rounded-[16px] p-4">
            <p className="text-[11px] font-black text-gray-600 uppercase tracking-wider mb-1">You are logged in as</p>
            <p className="text-lg font-black text-gray-900">
              {name || 'User'} <span className="text-green-700">({role})</span>
            </p>
            <div className="mt-3 pt-3 border-t border-green-200">
              <Link href="/simple-login">
                <button className="text-[11px] font-black text-green-700 hover:text-green-800 uppercase tracking-wider">
                  Switch Account
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {CHAT_CONTACTS.map(contact => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition-all ${
                selectedContact.id === contact.id ? 'bg-green-50 border-b-green-200' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{contact.image}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">{contact.name}</h3>
                  <p className="text-xs text-gray-600 truncate">
                    <span className={`inline-block w-2 h-2 rounded-full mr-1 ${
                      contact.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    {contact.status === 'active' ? 'Active now' : 'Offline'}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0">
          <div>
            <h2 className="text-lg font-black text-gray-900">
              {selectedContact.name}
              <span className="text-sm text-gray-600 ml-2">({selectedContact.role})</span>
            </h2>
            <p className="text-xs text-gray-500 font-medium">
              <span className="text-green-600">●</span> {selectedContact.status === 'active' ? 'Active now' : 'Offline'}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-700">
              <Phone size={18} />
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-700">
              <Video size={18} />
            </button>
            <button className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-700">
              <Info size={18} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💬</div>
              <p className="text-gray-600 font-bold">No messages yet</p>
              <p className="text-sm text-gray-500">Start a conversation!</p>
            </div>
          ) : (
            messages.map(msg => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md ${
                  msg.sender === 'user'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                } rounded-2xl px-4 py-2`}>
                  <p className="text-sm font-medium">{msg.text}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="px-6 py-4 border-t border-gray-200 bg-white">
          <form onSubmit={handleSendMessage} className="flex items-end gap-3">
            <button
              type="button"
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition text-gray-700 flex-shrink-0"
            >
              <Plus size={20} />
            </button>

            <div className="flex-1 flex items-center bg-gray-100 rounded-full px-4 py-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Aa"
                className="flex-1 bg-transparent outline-none text-gray-900 placeholder-gray-500 font-medium"
              />
              <button
                type="button"
                className="ml-2 text-gray-600 hover:text-gray-800 flex-shrink-0"
              >
                <Smile size={20} />
              </button>
            </div>

            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-full flex items-center justify-center transition flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
