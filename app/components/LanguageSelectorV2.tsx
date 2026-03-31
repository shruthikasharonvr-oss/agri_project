'use client';

import { useState, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

// Type declaration for Google Translate functions
declare global {
  interface Window {
    changeLanguage?: (languageCode: string) => void;
    googleTranslateElementInit?: () => void;
  }
}

interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🇮🇳' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡିଆ', flag: '🇮🇳' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', flag: '🇮🇳' },
];

export default function LanguageSelectorV2() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);

  useEffect(() => {
    // Just restore the UI state, don't try to restore translation
    const savedLanguage = localStorage.getItem('googleTranslateLanguage');
    if (savedLanguage) {
      const lang = LANGUAGES.find(l => l.code === savedLanguage) || LANGUAGES[0];
      setSelectedLanguage(lang);
    }
  }, []);

  const handleLanguageChange = (language: Language) => {
    if (language.code === selectedLanguage.code) {
      setIsOpen(false);
      return;
    }

    setSelectedLanguage(language);
    setIsOpen(false);

    // Call changeLanguage if available
    if (typeof window !== 'undefined' && window.changeLanguage) {
      window.changeLanguage(language.code);
    }
  };

  return (
    <div className="relative">
      {/* Language Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 transition-all duration-200 font-semibold text-sm"
      >
        <Globe size={18} />
        <span>{selectedLanguage.flag}</span>
        <span className="hidden sm:inline">{selectedLanguage.name}</span>
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border-2 border-green-600 rounded-lg shadow-xl z-50 overflow-hidden">
          {/* Language List */}
          <div className="max-h-80 overflow-y-auto">
            {LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language)}
                className={`w-full px-4 py-3 text-left transition-all duration-150 flex items-center gap-3 ${
                  language.code === selectedLanguage.code
                    ? 'bg-green-700 text-white'
                    : 'bg-white text-gray-900 hover:bg-green-50'
                }`}
              >
                <span className="text-xl">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-semibold text-sm">{language.name}</div>
                  <div className="text-xs text-gray-500">{language.nativeName}</div>
                </div>
                {language.code === selectedLanguage.code && (
                  <span className="text-lg">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
