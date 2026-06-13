import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';

const Navbar = () => {
  const { lang, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const handleScroll = (e, targetId) => {
    if (isHome) {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <nav className="fixed w-full z-50 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#2a2a2a] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        <Link to="/" className="text-xl font-black tracking-widest text-white cursor-pointer flex items-center gap-1">
          NAME <span className="text-[#d32f2f]">SALON</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-xs font-bold text-[#a3a3a3] uppercase tracking-wider">
          {isHome ? (
            <>
              <a href="#hero" onClick={(e) => handleScroll(e, 'hero')} className="hover:text-[#d32f2f] transition-colors">{t('nav_home')}</a>
              <a href="#services" onClick={(e) => handleScroll(e, 'services')} className="hover:text-[#d32f2f] transition-colors">{t('nav_services')}</a>
              <a href="#packages" onClick={(e) => handleScroll(e, 'packages')} className="hover:text-[#d32f2f] transition-colors">{t('nav_packages')}</a>
              <a href="#professionals" onClick={(e) => handleScroll(e, 'professionals')} className="hover:text-[#d32f2f] transition-colors">{t('nav_professionals')}</a>
              <a href="#reviews" onClick={(e) => handleScroll(e, 'reviews')} className="hover:text-[#d32f2f] transition-colors">{t('nav_reviews')}</a>
              <a href="#branches" onClick={(e) => handleScroll(e, 'branches')} className="hover:text-[#d32f2f] transition-colors">{t('nav_branches')}</a>
            </>
          ) : (
            <Link to="/" className="hover:text-[#d32f2f] transition-colors">{t('nav_home')}</Link>
          )}
        </div>

        <div className="flex items-center gap-5">
          <button 
            onClick={toggleLanguage}
            className="text-xs font-bold text-[#a3a3a3] hover:text-white flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            {lang === 'ar' ? 'EN' : 'عربي'} 
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </button>
          
          <Link 
            to="/book"
            className="bg-[#d32f2f] text-white px-5 py-2 rounded-full font-bold hover:bg-red-700 transition-all cursor-pointer text-xs uppercase tracking-wide border border-[#d32f2f]"
          >
            {t('nav_book')}
          </Link>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;