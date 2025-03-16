import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import * as Storage from 'expo-storage';

interface LanguageContextType {
  locale: string;
  setLocale: (locale: string) => void;
  t: (key: string, params?: object) => string;
}

const i18n = new I18n({
  en: {
    welcome: 'Welcome to DareMeX',
    tagline: 'Dare to be different',
    publicDares: 'Public Dares',
    privateDares: 'Private Dares',
    aiDares: 'AI Dares',
    // Add more translations
  },
  es: {
    welcome: 'Bienvenido a DareMeX',
    tagline: 'Atrévete a ser diferente',
    publicDares: 'Retos Públicos',
    privateDares: 'Retos Privados',
    aiDares: 'Retos IA',
    // Add more translations
  },
  // Add more languages
});

i18n.enableFallback = true;
i18n.defaultLocale = 'en';

const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  setLocale: () => {},
  t: (key: string) => key,
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState(Localization.locale.split('-')[0]);

  useEffect(() => {
    loadLocale();
  }, []);

  const loadLocale = async () => {
    try {
      const savedLocale = await Storage.getItem({ key: '@locale' });
      if (savedLocale) {
        setLocaleState(savedLocale);
      }
    } catch (error) {
      console.error('Error loading locale:', error);
    }
  };

  const setLocale = async (newLocale: string) => {
    setLocaleState(newLocale);
    i18n.locale = newLocale;
    try {
      await Storage.setItem({
        key: '@locale',
        value: newLocale,
      });
    } catch (error) {
      console.error('Error saving locale:', error);
    }
  };

  const t = (key: string, params?: object) => i18n.t(key, params);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}