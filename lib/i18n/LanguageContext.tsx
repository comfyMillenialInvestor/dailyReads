'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en, { type TranslationKey } from './translations/en';
import de from './translations/de';

type Lang = 'en' | 'de';

const dictionaries: Record<Lang, Record<TranslationKey, string>> = { en, de };

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('en');
  const [hydrated, setHydrated] = useState(false);

  // On mount, read from localStorage or detect browser language
  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored && (stored === 'en' || stored === 'de')) {
      setLangState(stored);
    } else {
      // Auto-detect: if the browser signals German, use it
      const browserLang = navigator.language?.toLowerCase() || '';
      if (browserLang.startsWith('de')) {
        setLangState('de');
      }
    }
    setHydrated(true);
  }, []);

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang);
    localStorage.setItem('lang', newLang);
    // Update the html lang attribute
    document.documentElement.lang = newLang;
  }, []);

  // Keep html lang in sync
  useEffect(() => {
    if (hydrated) {
      document.documentElement.lang = lang;
    }
  }, [lang, hydrated]);

  const t = useCallback(
    (key: TranslationKey): string => {
      return dictionaries[lang][key] || dictionaries['en'][key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export type { Lang, TranslationKey };
