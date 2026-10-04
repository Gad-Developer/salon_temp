import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../../../utils/LanguageContext';
import ServiceCard from '../../../../components/ServiceCard';
import { motion, AnimatePresence } from 'framer-motion';

const ServicesSection = ({ categories, isLoading }) => {
  const { t, lang } = useLanguage();
  
  // Screen size detection for dynamic pagination
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      // 1024px matches Tailwind's 'lg' breakpoint
      setIsMobile(window.innerWidth < 1024);
    };
    
    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Adult Services State & Math
  const [activeTab, setActiveTab] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const adultCardsPerPage = isMobile ? 4 : 8;

  // Kids Services State & Math
  const [kidsCurrentPage, setKidsCurrentPage] = useState(1);
  const kidsCardsPerPage = isMobile ? 4 : 6;

  // Reset pages when tabs or screen sizes change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, adultCardsPerPage]);

  useEffect(() => {
    setKidsCurrentPage(1);
  }, [kidsCardsPerPage]);

  // Data Filtering
  const standardCategories = categories.filter(cat => cat.titleEn.toLowerCase() !== 'kids');
  const kidsCategory = categories.find(cat => cat.titleEn.toLowerCase() === 'kids');
  const kidsServices = kidsCategory ? kidsCategory.services : [];

  const getDisplayServices = () => {
    if (activeTab === 'All') return standardCategories.flatMap(cat => cat.services);
    const selectedCategory = standardCategories.find(cat => (lang === 'ar' ? cat.titleAr : cat.titleEn) === activeTab);
    return selectedCategory ? selectedCategory.services : [];
  };

  // Adult Pagination Calculations
  const allFilteredServices = getDisplayServices();
  const totalPages = Math.ceil(allFilteredServices.length / adultCardsPerPage);
  const indexOfLastCard = currentPage * adultCardsPerPage;
  const indexOfFirstCard = indexOfLastCard - adultCardsPerPage;
  const currentServices = allFilteredServices.slice(indexOfFirstCard, indexOfLastCard);

  // Kids Pagination Calculations
  const kidsTotalPages = Math.ceil(kidsServices.length / kidsCardsPerPage);
  const kidsIndexOfLastCard = kidsCurrentPage * kidsCardsPerPage;
  const kidsIndexOfFirstCard = kidsIndexOfLastCard - kidsCardsPerPage;
  const currentKidsServices = kidsServices.slice(kidsIndexOfFirstCard, kidsIndexOfLastCard);

  return (
    <>
      {/* ADULT SERVICES */}
      <section className="py-16 px-6 bg-[#0a0a0a]" id="services">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3">{t('services_title')}</h2>
            <div className="w-16 h-1 bg-[#d32f2f] mx-auto rounded-full"></div>
          </div>
          
          {isLoading ? (
            <div className="text-[#a3a3a3] text-center text-sm animate-pulse">{t('loading_services')}</div>
          ) : (
            <>
              <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-2 mb-10 pb-2 px-2 sm:justify-center">
                <button onClick={() => setActiveTab('All')} className={`snap-start whitespace-nowrap px-5 py-2 rounded-full font-bold text-xs transition-all border ${activeTab === 'All' ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-transparent border-[#333] text-[#a3a3a3] hover:border-[#666] hover:text-white'}`}>
                  {t('filter_all')}
                </button>
                {standardCategories.map((cat) => {
                  const tabName = lang === 'ar' ? cat.titleAr : cat.titleEn;
                  return (
                    <button key={cat._id} onClick={() => setActiveTab(tabName)} className={`snap-start whitespace-nowrap px-5 py-2 rounded-full font-bold text-xs transition-all border ${activeTab === tabName ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-transparent border-[#333] text-[#a3a3a3] hover:border-[#666] hover:text-white'}`}>
                      {tabName}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                <motion.div 
                  key={`${activeTab}-${currentPage}-${isMobile}`} 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 min-h-[400px]"
                >
                  {currentServices.map((srv) => (
                    <ServiceCard key={srv._id} service={srv} lang={lang} t={t} isKids={false} />
                  ))}
                </motion.div>
              </AnimatePresence>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-10">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1f1f1f] border border-[#333] hover:border-[#d32f2f] disabled:opacity-50 transition-all">
                    <ChevronLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${currentPage === idx + 1 ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-[#1f1f1f] border-[#333] text-[#a3a3a3] hover:border-white'}`}>
                      {idx + 1}
                    </button>
                  ))}
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1f1f1f] border border-[#333] hover:border-[#d32f2f] disabled:opacity-50 transition-all">
                    <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* KIDS SERVICES */}
      {kidsServices.length > 0 && !isLoading && (
        <section className="py-16 px-6 bg-[#111] border-t border-[#1f1f1f]" id="kids">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3 text-[#3b82f6]">
                {t('kids_title')}
              </h2>
              <div className="w-16 h-1 bg-[#3b82f6] mx-auto rounded-full"></div>
              <p className="text-[#a3a3a3] text-sm md:text-base mt-4 max-w-2xl mx-auto">
                {t('kids_subtitle')}
              </p>
            </div>

            <AnimatePresence mode="wait">
              <motion.div 
                key={`kids-${kidsCurrentPage}-${isMobile}`} 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 min-h-[400px]"
              >
                {currentKidsServices.map((srv) => (
                  <ServiceCard key={srv._id} service={srv} lang={lang} t={t} isKids={true} />
                ))}
              </motion.div>
            </AnimatePresence>

            {kidsTotalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button onClick={() => setKidsCurrentPage(prev => Math.max(prev - 1, 1))} disabled={kidsCurrentPage === 1} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a1a1a] border border-[#333] hover:border-[#3b82f6] hover:text-[#3b82f6] disabled:opacity-50 transition-all">
                  <ChevronLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
                {[...Array(kidsTotalPages)].map((_, idx) => (
                  <button key={idx} onClick={() => setKidsCurrentPage(idx + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${kidsCurrentPage === idx + 1 ? 'bg-[#3b82f6] border-[#3b82f6] text-white' : 'bg-[#1a1a1a] border-[#333] text-[#a3a3a3] hover:border-[#3b82f6] hover:text-[#3b82f6]'}`}>
                    {idx + 1}
                  </button>
                ))}
                <button onClick={() => setKidsCurrentPage(prev => Math.min(prev + 1, kidsTotalPages))} disabled={kidsCurrentPage === kidsTotalPages} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1a1a1a] border border-[#333] hover:border-[#3b82f6] hover:text-[#3b82f6] disabled:opacity-50 transition-all">
                  <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default ServicesSection;