'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'en' | 'bn';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export const useLocale = () => useContext(LocaleContext);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [messages, setMessages] = useState<any>({});

  useEffect(() => {
    // Load locale from localStorage
    const savedLocale = localStorage.getItem('locale') as Locale;
    if (savedLocale) {
      setLocaleState(savedLocale);
    }
  }, []);

  useEffect(() => {
    // Load messages for current locale
    import(`../../messages/${locale}.json`).then((module) => {
      setMessages(module.default);
    });
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value = messages;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    return value || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}
