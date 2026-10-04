import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../../utils/LanguageContext'; // Adjusted path if needed based on your folder structure

const HeroSection = ({ handleScroll }) => {
  const { t } = useLanguage();

  return (
    <section className="relative h-[85vh] flex flex-col items-center justify-center text-center px-4" id="hero">
      <div className="absolute inset-0 z-0">
        <img 
          src="/banner/banner.png" 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-50 grayscale"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a] z-10"></div>
      </div>
      
      <div className="z-20 max-w-3xl mx-auto mt-10 w-full">
        <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
          {t('hero_title')} <br />
          <span className="text-[#d32f2f] drop-shadow-md">{t('hero_highlight')}</span>
        </h1>
        <p className="text-gray-300 font-medium drop-shadow-md text-sm sm:text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed px-2">
          {t('hero_subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
          <Link to="/book" className="bg-[#d32f2f] text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 w-[80%] sm:w-auto text-center max-w-[280px]">
            {t('hero_cta_primary')}
          </Link>
          <button onClick={() => handleScroll('services')} className="bg-transparent border border-[#333] text-white px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-xs sm:text-sm hover:border-white transition-all w-[80%] sm:w-auto cursor-pointer max-w-[280px]">
            {t('hero_cta_secondary')}
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;