"use client"

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logAction } from '../lib/auditLog';
import { motion } from 'framer-motion';
import { Globe, Search, ShoppingCart, Menu, X, LogOut, User } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function Navbar() {
  const router = useRouter();
  const { itemCount } = useCart();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('English');
  const [scrolled, setScrolled] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' },
    { code: 'zh-CN', name: '中文' },
    { code: 'ar', name: 'العربية' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
  ];

  // Track scroll for navbar effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = localStorage.getItem('loggedIn') === 'true';
      const name = localStorage.getItem('username') || '';
      const userRole = localStorage.getItem('role') || '';
      
      setIsLoggedIn(loggedIn);
      setUsername(name);
      setRole(userRole);
    };

    checkLogin();
    window.addEventListener('storage', checkLogin);
    window.addEventListener('login-success', checkLogin);
    
    return () => {
      window.removeEventListener('storage', checkLogin);
      window.removeEventListener('login-success', checkLogin);
    };
  }, []);

  const handleLogout = () => {
    logAction(username, role, 'Logout');
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    
    setIsLoggedIn(false);
    setUsername('');
    setRole('');
    setShowDropdown(false);
    
    window.dispatchEvent(new Event('logout'));
    router.push('/');
  };

  const handleLanguageChange = (langCode: string, langName: string) => {
    setCurrentLanguage(langName);
    setShowLanguageMenu(false);
    
    const element = document.querySelector('.goog-te-combo') as any;
    if (element) {
      element.value = langCode;
      element.dispatchEvent(new Event('change'));
    }
  };

  const filteredLanguages = languages.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container-wide">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <motion.div
              className="flex items-center gap-3 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-3xl">🌾</div>
              <div>
                <h2 className="text-xl font-bold text-white group-hover:text-green-400 transition">
                  FarmToHome
                </h2>
                <p className="text-xs text-gray-400">Fresh & Smart</p>
              </div>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/shopping">
              <motion.span
                className="text-gray-300 hover:text-green-400 font-medium transition cursor-pointer"
                whileHover={{ y: -2 }}
              >
                Marketplace
              </motion.span>
            </Link>
            <Link href="/chat">
              <motion.span
                className="text-gray-300 hover:text-green-400 font-medium transition cursor-pointer"
                whileHover={{ y: -2 }}
              >
                Chat
              </motion.span>
            </Link>
            <Link href="/weather">
              <motion.span
                className="text-gray-300 hover:text-green-400 font-medium transition cursor-pointer"
                whileHover={{ y: -2 }}
              >
                Weather
              </motion.span>
            </Link>
            <Link href="/ai-assistant">
              <motion.span
                className="text-gray-300 hover:text-green-400 font-medium transition cursor-pointer"
                whileHover={{ y: -2 }}
              >
                AI Assistant
              </motion.span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Search */}
            <motion.div
              className="hidden lg:flex items-center gap-2 glass px-4 py-2 rounded-lg"
              whileHover={{ scale: 1.05 }}
            >
              <Search size={18} className="text-green-400" />
              <input
                type="text"
                placeholder="Search products..."
                className="bg-transparent outline-none text-sm text-white placeholder-gray-500 w-40"
              />
            </motion.div>

            {/* Language Selector */}
            <motion.div
              className="relative"
              whileHover={{ scale: 1.05 }}
            >
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="btn-icon flex items-center gap-2 px-3"
              >
                <Globe size={18} />
                <span className="hidden sm:inline text-sm">EN</span>
              </button>

              {showLanguageMenu && (
                <motion.div
                  className="absolute top-full right-0 mt-2 glass p-4 rounded-lg w-56 max-h-80 overflow-y-auto shadow-lg"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <input
                    type="text"
                    placeholder="Search language..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full mb-2 px-3 py-2 rounded bg-gray-700 text-white outline-none"
                  />
                  <div className="space-y-1">
                    {filteredLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code, lang.name)}
                        className="w-full text-left px-3 py-2 hover:bg-green-600/20 rounded transition text-gray-300 hover:text-green-400"
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Cart */}
            <Link href="/cart">
              <motion.button
                className="btn-icon relative"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full text-xs flex items-center justify-center text-white">
                  {itemCount}
                </span>
              </motion.button>
            </Link>

            {/* User Menu */}
            {isLoggedIn ? (
              <motion.div
                className="relative"
                whileHover={{ scale: 1.05 }}
              >
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="btn-icon-glow"
                >
                  <User size={20} />
                </button>

                {showDropdown && (
                  <motion.div
                    className="absolute top-full right-0 mt-2 glass p-3 rounded-lg w-48 shadow-lg"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="border-b border-gray-600 pb-3 mb-3">
                      <p className="text-white font-semibold">{username}</p>
                      <p className="text-xs text-gray-400 capitalize">{role}</p>
                    </div>
                    <Link href="/account">
                      <motion.button
                        className="w-full text-left px-3 py-2 hover:bg-green-600/20 rounded transition text-gray-300 hover:text-green-400 flex items-center gap-2"
                        whileHover={{ x: 5 }}
                      >
                        <User size={16} />
                        Account
                      </motion.button>
                    </Link>
                    <motion.button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 hover:bg-red-600/20 rounded transition text-gray-300 hover:text-red-400 flex items-center gap-2 mt-2"
                      whileHover={{ x: 5 }}
                    >
                      <LogOut size={16} />
                      Logout
                    </motion.button>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <Link href="/login">
                <motion.button
                  className="btn-primary px-6 py-2 text-sm font-semibold hidden sm:block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden btn-icon"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div
            className="md:hidden pb-4 space-y-2"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Link href="/shopping">
              <motion.button className="w-full text-left px-4 py-2 text-gray-300 hover:text-green-400 transition">
                Marketplace
              </motion.button>
            </Link>
            <Link href="/chat">
              <motion.button className="w-full text-left px-4 py-2 text-gray-300 hover:text-green-400 transition">
                Chat
              </motion.button>
            </Link>
            <Link href="/weather">
              <motion.button className="w-full text-left px-4 py-2 text-gray-300 hover:text-green-400 transition">
                Weather
              </motion.button>
            </Link>
            <Link href="/ai-assistant">
              <motion.button className="w-full text-left px-4 py-2 text-gray-300 hover:text-green-400 transition">
                AI Assistant
              </motion.button>
            </Link>
            {!isLoggedIn && (
              <Link href="/login">
                <motion.button className="w-full mt-4 btn-primary text-sm">
                  Sign In
                </motion.button>
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
