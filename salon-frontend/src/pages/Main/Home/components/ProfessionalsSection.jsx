import React from 'react';
import { useLanguage } from '../../../../utils/LanguageContext';

const ProfessionalsSection = ({ professionals, isLoading }) => {
  const { t, lang } = useLanguage();

  return (
    <section className="py-16 px-6 bg-[#0a0a0a] border-t border-[#1f1f1f]" id="professionals">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">
              {t('profs_title')}
            </h2>
            <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {professionals.filter(prof => prof.isActive).map((prof, idx) => (
            <div key={prof._id || idx} className="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden group text-center">
              <div className="h-32 sm:h-56 bg-[#1f1f1f] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10"></div>
                <img 
                  src={prof.avatar} 
                  alt={lang === 'ar' ? prof.nameAr : prof.nameEn} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-100 grayscale group-hover:grayscale-0"
                />
              </div>
              <div className="p-3 sm:p-5">
                <h3 className="text-xs sm:text-lg font-black text-white uppercase group-hover:text-[#d32f2f] transition-colors truncate">
                  {lang === 'ar' ? prof.nameAr : prof.nameEn}
                </h3>
                <p className="text-[#a3a3a3] text-[10px] sm:text-xs font-bold mt-1 uppercase tracking-wider truncate">
                  {lang === 'ar' ? prof.roleAr : prof.roleEn}
                </p>
              </div>
            </div>
          ))}
          
          {professionals.length === 0 && !isLoading && (
            <div className="col-span-full text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-xl">
              {t('no_professionals')}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProfessionalsSection;