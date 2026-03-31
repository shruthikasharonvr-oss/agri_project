'use client';

import { createContext, useContext, ReactNode } from 'react';

// This is a dummy context to avoid breaking existing pages that use translate hooks.
// The real translation is now handled by the Google Translate Web Widget.

interface TranslationContextType {
    currentLang: string;
    setLanguage: (lang: string) => void;
    t: (text: string) => string;
    isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType>({
    currentLang: 'en',
    setLanguage: () => { },
    t: (text: string) => text,
    isTranslating: false,
});

export function TranslationProvider({ children }: { children: ReactNode }) {
    return (
        <TranslationContext.Provider
            value={{
                currentLang: 'en',
                setLanguage: () => { },
                t: (text: string) => text,
                isTranslating: false
            }}
        >
            {children}
        </TranslationContext.Provider>
    );
}

export function useTranslation() {
    return useContext(TranslationContext);
}
