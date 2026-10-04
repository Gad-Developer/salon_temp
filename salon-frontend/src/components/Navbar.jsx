import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import { Menu, X } from 'lucide-react'; // Added hamburger icons

const Navbar = () => {
  const { lang, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const isHome = location.pathname === '/';
  
  // State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleScroll = (e, targetId) => {
    if (isHome) {
      e.preventDefault();
      setIsMobileMenuOpen(false); // Close mobile menu on click
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  // Helper array to keep links DRY for both desktop and mobile
  const navLinks = [
    { id: 'hero', label: t('nav_home') },
    { id: 'services', label: t('nav_services') },
    { id: 'packages', label: t('nav_packages') },
    { id: 'professionals', label: t('nav_professionals') },
    { id: 'reviews', label: t('nav_reviews') },
    { id: 'branches', label: t('nav_branches') },
  ];

  return (
    <nav className="fixed w-full z-50 bg-[#121212]/80 backdrop-blur-xl border-b border-[#1e1e1e] transition-all duration-300 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        
        {/* Brand Logo */}
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xl font-black tracking-widest text-[#f5f5f5] cursor-pointer flex items-center gap-1 z-50 transition-transform hover:scale-105">
          NAME <span className="text-[#d32f2f]">SALON</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center bg-[#1e1e1e]/60 rounded-full px-1.5 py-1.5 border border-[#2a2a2a] shadow-inner text-[11px] font-bold text-[#b3b3b3] uppercase tracking-widest">
          {isHome ? (
            navLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={(e) => handleScroll(e, link.id)} className="px-4 py-2 rounded-full hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-all duration-300">
                {link.label}
              </a>
            ))
          ) : (
            <Link to="/" className="px-4 py-2 rounded-full hover:bg-[#2a2a2a] hover:text-[#f5f5f5] transition-all duration-300">{t('nav_home')}</Link>
          )}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="text-xs font-bold text-[#b3b3b3] hover:text-[#f5f5f5] flex items-center gap-1.5 cursor-pointer transition-colors px-2"
          >
            {lang === 'ar' ? 'EN' : 'عربي'} 
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
          </button>
          
          <Link 
            to="/contact"
            className="hidden lg:flex text-xs font-bold text-[#b3b3b3] hover:text-[#f5f5f5] transition-colors px-2 uppercase tracking-wide"
          >
            {lang === 'ar' ? 'اتصل بنا' : 'Contact'}
          </Link>

          <Link 
            to="/book"
            className="bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] text-[#f5f5f5] px-6 py-2.5 rounded-full font-bold hover:shadow-[0_0_15px_rgba(211,47,47,0.4)] transition-all cursor-pointer text-[11px] uppercase tracking-widest border border-transparent hover:border-[#ff4d4d]"
          >
            {t('nav_book')}
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button 
          className="md:hidden text-[#f5f5f5] z-50 p-1"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-[#121212]/95 backdrop-blur-xl min-h-screen flex flex-col items-center justify-center gap-8 transition-transform duration-300 ease-in-out z-40 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
      >
        <div className="flex flex-col items-center gap-6 text-xl font-black uppercase tracking-widest">
          {isHome ? (
            navLinks.map((link) => (
              <a key={link.id} href={`#${link.id}`} onClick={(e) => handleScroll(e, link.id)} className="text-[#f5f5f5] hover:text-[#d32f2f] transition-colors">
                {link.label}
              </a>
            ))
          ) : (
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-[#f5f5f5] hover:text-[#d32f2f] transition-colors">
              {t('nav_home')}
            </Link>
          )}
        </div>

        <div className="flex flex-col items-center gap-6 mt-4">
          <button 
            onClick={toggleLanguage}
            className="text-sm font-bold text-[#b3b3b3] hover:text-[#f5f5f5] flex items-center gap-2 cursor-pointer transition-colors uppercase tracking-wider"
          >
            {lang === 'ar' ? 'Switch to English' : 'التبديل للعربية'}
          </button>
          
          <Link 
            to="/book"
            onClick={() => setIsMobileMenuOpen(false)}
            className="bg-gradient-to-r from-[#d32f2f] to-[#b71c1c] text-[#f5f5f5] px-10 py-3 rounded-full font-bold hover:shadow-[0_0_15px_rgba(211,47,47,0.4)] transition-all cursor-pointer text-sm uppercase tracking-wide"
          >
            {t('nav_book')}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;