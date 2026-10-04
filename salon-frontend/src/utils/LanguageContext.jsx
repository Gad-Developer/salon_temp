import React, { createContext, useState, useContext, useEffect } from 'react';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import your new JSON locale files
import enTranslations from '../locales/en.json';
import arTranslations from '../locales/ar.json';

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      ar: { translation: arTranslations }
    },
    lng: 'en', // default starting language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values to prevent XSS
    }
  });

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(i18n.language);

  // Toggle language, update i18n, and update HTML direction for RTL support
  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'ar' : 'en';
    
    i18n.changeLanguage(newLang).then(() => {
      setLang(newLang);
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    });
  };

  // Expose a custom 't' function that passes keys to i18n 
  // (Maintains exact compatibility with your existing code)
  const t = (key) => i18n.t(key);

  // Set initial direction on mount based on default language
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};