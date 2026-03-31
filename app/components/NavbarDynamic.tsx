'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { logAction } from '../lib/auditLog';
import { motion } from 'framer-motion';
import { Menu, X, LogOut, User, ShoppingCart } from 'lucide-react';
import LanguageSelectorV2 from './LanguageSelectorV2';

// Type declaration for Google Translate
declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: any;
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

export default function NavbarDynamic() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthContext();
  const { itemCount } = useCart();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const menuItems = [
    { href: '/', label: 'Home', roles: ['Farmer', 'Customer'] },
    { href: '/shopping', label: 'Marketplace', roles: ['Farmer', 'Customer'] },
    { href: '/experience/harvest-game', label: 'Game', roles: ['Customer'] },
    { href: '/chat', label: 'Chat', roles: ['Farmer', 'Customer'] },
    { href: '/weather', label: 'Weather', roles: ['Farmer', 'Customer'] },
    { href: '/ai-assistant', label: 'AI Assistant', roles: ['Farmer', 'Customer'] },
    { href: '/about', label: 'About', roles: ['Farmer', 'Customer'] },
  ];

  // Filter menu items based on user role - use capitalized role
  const userRole = user.role ? (typeof user.role === 'string' ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : user.role) : null;
  const visibleMenuItems = user.isLoggedIn && userRole
    ? menuItems.filter(item => item.roles.includes(userRole))
    : menuItems;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Re-initialize Google Translate on route changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Ensure Google Translate element is properly initialized
      const initTranslate = () => {
        if (window.google && window.google.translate) {
          try {
            const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
            if (selectElement) {
              selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            }
          } catch (e) {
            // Silently fail if translate element not ready
          }
        }
      };
      
      // Call immediately
      initTranslate();
      
      // Call again after a short delay to ensure everything is loaded
      const timer = setTimeout(initTranslate, 500);
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleLogout = () => {
    logAction(user.username || '', user.role === 'farmer' ? 'Farmer' : 'Customer', 'Logout');
    logout();
    setShowUserMenu(false);
    router.push('/');
  };

  const isActive = (href: string) => pathname === href;

  return (
    <motion.nav
      className={`sticky top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/40 backdrop-blur-md border-b border-green-500/10 shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <motion.div
              className="flex items-center gap-2 cursor-pointer group"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                🌾 FarmToHome
              </span>
            </motion.div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {visibleMenuItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <motion.div
                  className={`relative px-4 py-2 text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'text-green-400'
                      : 'text-gray-300 hover:text-white'
                  }`}
                  whileHover={{ y: -2 }}
                >
                  {item.label}
                  {isActive(item.href) && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full"
                      layoutId="navbar-underline"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.div>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Language Selector - V2 with improved UI */}
            <LanguageSelectorV2 />

            {/* Cart */}
            <Link href="/cart">
              <motion.button
                className="relative p-2 rounded-lg text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-all"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <ShoppingCart size={18} />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full text-xs flex items-center justify-center text-white font-bold">
                  {itemCount}
                </span>
              </motion.button>
            </Link>

            {/* User Menu */}
            {user.isLoggedIn ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-lg text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-all"
                  whileHover={{ scale: 1.05 }}
                >
                  <User size={18} />
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    className="absolute right-0 mt-2 w-48 bg-black/80 backdrop-blur-md border border-green-500/20 rounded-lg p-2 shadow-xl"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="px-3 py-2 border-b border-gray-700 mb-2">
                      <p className="text-white text-sm font-semibold">{user.username}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role === 'farmer' ? 'Farmer' : 'Customer'}</p>
                    </div>
                    <Link href="/account">
                      <button className="w-full text-left px-3 py-2 rounded text-sm text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-all flex items-center gap-2">
                        <User size={14} />
                        Account
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 rounded text-sm text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <motion.button
                  className="px-4 py-2 rounded-lg text-sm font-semibold bg-green-600 text-white hover:bg-green-700 transition-all hidden sm:block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Login
                </motion.button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-green-500/10 transition-all"
            >
              {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <motion.div
            className="md:hidden pb-4 border-t border-green-500/10"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-2">
              {menuItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                      isActive(item.href)
                        ? 'text-green-400 bg-green-500/10'
                        : 'text-gray-300 hover:text-white hover:bg-green-500/10'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
