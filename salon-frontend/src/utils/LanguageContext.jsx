import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../data/translations';

const LanguageContext = createContext();

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('en');

  // Toggle language and update HTML direction for RTL support
  const toggleLanguage = () => {
    setLang((prevLang) => {
      const newLang = prevLang === 'en' ? 'ar' : 'en';
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
      return newLang;
    });
  };

  // Translation hook
  const t = (key) => {
    return translations[lang][key] || key;
  };

  // Set initial direction on mount
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};