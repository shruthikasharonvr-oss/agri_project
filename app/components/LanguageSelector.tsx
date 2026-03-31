"use client"

import { useState } from 'react';
import { Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिंदी' },
    { code: 'ta', name: 'தமிழ்' },
    { code: 'te', name: 'తెలుగు' },
    { code: 'ml', name: 'മലയാളം' },
    { code: 'kn', name: 'ಕನ್ನಡ' },
    { code: 'mr', name: 'मराठी' },
    { code: 'gu', name: 'ગુજરાતી' },
    { code: 'bn', name: 'বাংলা' },
    { code: 'pa', name: 'ਪੰਜਾਬੀ' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh-CN', name: '简体中文' },
    { code: 'ja', name: '日本語' },
    { code: 'ar', name: 'العربية' },
    { code: 'pt', name: 'Português' },
    { code: 'ru', name: 'Русский' },
  ];

  const handleLanguageChange = (langCode: string) => {
    if (typeof window !== 'undefined') {
      const selectElement = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (selectElement) {
        selectElement.value = langCode;
        const event = new Event('change', { bubbles: true });
        selectElement.dispatchEvent(event);
      }
      if ((window as any).changeLanguage) {
        (window as any).changeLanguage(langCode);
      }
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-green-500/10 transition-all"
        whileHover={{ scale: 1.05 }}
      >
        <Globe size={18} />
        <span className="text-xs font-medium">EN</span>
      </motion.button>

      {isOpen && (
        <motion.div
          className="absolute right-0 mt-2 w-56 bg-black/80 backdrop-blur-md border border-green-500/20 rounded-lg p-3 shadow-xl z-50"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className="w-full text-left px-3 py-2 rounded text-sm text-gray-300 hover:text-green-400 hover:bg-green-500/10 transition-all"
              >
                {lang.name}
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}