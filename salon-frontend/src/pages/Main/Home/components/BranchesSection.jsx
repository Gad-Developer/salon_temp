import React, { useState, useEffect } from 'react';
import { MapPin, Phone, CalendarDays } from 'lucide-react';
import { useLanguage } from '../../../../utils/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const BranchesSection = ({ branches, isLoading }) => {
  const { t, lang } = useLanguage();
  const [activeBranch, setActiveBranch] = useState(null);

  useEffect(() => {
    if (branches && branches.length > 0 && !activeBranch) {
      setActiveBranch(branches[0]);
    }
  }, [branches, activeBranch]);

  return (
    <section className="py-16 px-4 sm:px-6 bg-[#0a0a0a] border-t border-[#1f1f1f]" id="branches">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">
              {t('nav_branches')}
            </h2>
            <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
        </div>

        {branches.length > 0 ? (
          <div className="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden shadow-2xl">
            
            {/* Tabs: No longer stretching to 50% on desktop */}
            <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory bg-[#1a1a1a] border-b border-[#2a2a2a] scrollbar-hide sm:justify-start">
              {branches.filter(b => b.isActive).map((branch) => (
                <button
                  key={branch._id || branch.nameEn}
                  onClick={() => setActiveBranch(branch)}
                  className={`snap-start min-w-[50%] sm:min-w-[auto] sm:flex-none py-3 px-2 sm:py-4 sm:px-8 text-[10px] sm:text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap border-r border-[#2a2a2a] last:border-r-0 ${
                    activeBranch?.nameEn === branch.nameEn 
                      ? 'bg-[#d32f2f] text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.2)]' 
                      : 'text-[#a3a3a3] hover:bg-[#222] hover:text-white'
                  }`}
                >
                  {lang === 'ar' ? branch.nameAr : branch.nameEn}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {activeBranch && (
                <motion.div 
                  key={activeBranch._id || activeBranch.nameEn}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col lg:flex-row w-full h-auto lg:h-[450px]"
                >
                  
                  <div className="w-full lg:w-1/2 p-4 sm:p-8 flex flex-col justify-center bg-[#141414] overflow-y-auto scrollbar-hide">
                    <h3 className="text-lg sm:text-2xl font-black text-white mb-6 uppercase tracking-wider line-clamp-1 border-b border-[#2a2a2a] pb-4 lg:border-none lg:pb-0">
                       {lang === 'ar' ? activeBranch.nameAr : activeBranch.nameEn}
                    </h3>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                      <div className="flex items-start gap-2 sm:gap-4">
                        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[#d32f2f] shrink-0 mt-0.5">
                          <MapPin className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <span className="block text-[9px] sm:text-xs font-bold text-[#555] uppercase tracking-wider mb-0.5 sm:mb-1">{t('address')}</span>
                          <p className="text-[#d4d4d4] text-[10px] sm:text-sm leading-relaxed line-clamp-3">
                            {lang === 'ar' ? activeBranch.addressAr : activeBranch.addressEn}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 sm:gap-4">
                        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[#d32f2f] shrink-0 mt-0.5">
                          <Phone className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div className="overflow-hidden">
                          <span className="block text-[9px] sm:text-xs font-bold text-[#555] uppercase tracking-wider mb-0.5 sm:mb-1">{t('phone')}</span>
                          <p className="text-[#d4d4d4] text-[10px] sm:text-sm font-medium truncate" dir="ltr">
                            {activeBranch.phone}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-2 sm:gap-4 col-span-2 lg:col-span-1">
                        <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[#d32f2f] shrink-0 mt-0.5">
                          <CalendarDays className="w-3 h-3 sm:w-5 sm:h-5" />
                        </div>
                        <div>
                          <span className="block text-[9px] sm:text-xs font-bold text-[#555] uppercase tracking-wider mb-0.5 sm:mb-1">{t('working_hours')}</span>
                          <p className="text-[#d4d4d4] text-[10px] sm:text-sm leading-relaxed whitespace-pre-line line-clamp-3">
                            {lang === 'ar' ? activeBranch.workingHoursAr : activeBranch.workingHoursEn}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-1/2 h-[250px] lg:h-full bg-[#1f1f1f] relative border-t lg:border-t-0 lg:border-l border-[#2a2a2a]">
                    <iframe 
                      title={activeBranch.nameEn}
                      className="absolute inset-0 w-full h-full border-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
                      src={activeBranch.mapUrl}
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          !isLoading && (
            <div className="w-full text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-xl">
              {t('no_branches')}
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default BranchesSection;