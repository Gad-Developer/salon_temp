import React from 'react';
import { Scissors, Package, Clock, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import defaultServiceImg from '../../../../assets/temp-service.svg';

const slideVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const Step1Services = ({ categories, packages, serviceTab, setServiceTab, bookingState, handleSelectService, handleSelectPackage, hasSelectedSomething, setBookingState, t, lang }) => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-black uppercase tracking-widest mb-6 text-center">{t('select_service')}</h2>
    
    <div className="flex bg-[#1e1e1e]/60 backdrop-blur-md rounded-lg p-1.5 border border-[#2a2a2a] mb-8 max-w-md mx-auto relative z-10 shadow-inner">
      <button onClick={() => setServiceTab('services')} className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${serviceTab === 'services' ? 'bg-[#d32f2f] text-white shadow-lg' : 'text-[#a3a3a3] hover:text-white'}`}>
        <Scissors size={14} /> {t('tab_services')}
      </button>
      <button onClick={() => setServiceTab('packages')} className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${serviceTab === 'packages' ? 'bg-[#d32f2f] text-white shadow-lg' : 'text-[#a3a3a3] hover:text-white'}`}>
        <Package size={14} /> {t('tab_packages')}
      </button>
    </div>

    <AnimatePresence mode="wait">
      {serviceTab === 'services' && (
        <motion.div 
          key="services"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
        >
          {categories.map((cat) => (
            <div key={cat._id} className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="text-xs font-bold text-[var(--ab-silver)] uppercase tracking-widest text-start whitespace-nowrap">{lang === 'ar' ? cat.titleAr : cat.titleEn}</h3>
                <div className="h-[1px] w-full bg-[var(--ab-charcoal)]"></div>
              </div>
              <div className="grid gap-3">
                {cat.services.map((service) => {
                  const isItemSelected = !!bookingState.selectedServices.find(s => s.serviceId === service._id);
                  const validImgs = service.images?.filter(img => img && typeof img === 'string' && img.trim() !== '') || [];
                  const imageUrl = validImgs.length > 0 ? validImgs[0] : (service.image?.trim() || defaultServiceImg);
                  return (
                    <div key={service._id} onClick={() => handleSelectService(service, cat.titleEn)} className={`p-4 rounded-xl cursor-pointer transition-all duration-300 flex justify-between items-center text-start group ${isItemSelected ? 'bg-[var(--ab-charcoal)]/90 border border-[var(--ab-red)] shadow-[0_0_20px_rgba(225,29,72,0.15)]' : 'bg-[var(--ab-charcoal)]/40 backdrop-blur-md border border-transparent hover:border-[var(--ab-red)] hover:bg-[var(--ab-charcoal)]/80'}`}>
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#1f1f22] flex items-center justify-center shrink-0 border border-[#333]">
                          <img 
                            src={imageUrl} 
                            alt={service.nameEn} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                            loading="lazy" 
                            onError={(e) => {
                              if (e.currentTarget.src !== defaultServiceImg) {
                                e.currentTarget.src = defaultServiceImg;
                              }
                            }}
                          />
                        </div>
                        <div>
                          <h4 className={`text-base font-bold mb-1 transition-colors ${isItemSelected ? 'text-white' : 'text-[var(--ab-silver)] group-hover:text-white'}`}>{lang === 'ar' ? service.nameAr : service.nameEn}</h4>
                          <span className="text-[#888] text-xs flex items-center gap-1.5"><Clock size={12} className={isItemSelected ? 'text-[var(--ab-red)]' : ''} /> {service.durationMinutes} {t('mins')}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-bold text-lg text-white">{service.price} <span className="text-xs text-[var(--ab-red)]">{t('currency')}</span></span>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isItemSelected ? 'border-[var(--ab-red)] bg-[var(--ab-red)]' : 'border-[#444]'}`}>
                          {isItemSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {serviceTab === 'packages' && (
        <motion.div 
          key="packages"
          variants={slideVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3 }}
          className="grid gap-4 mb-8"
        >
          {packages.filter(p => p.isActive).map((pkg) => {
            const isPkgSelected = bookingState.selectedPackage?._id === pkg._id;
            return (
              <div key={pkg._id} onClick={() => handleSelectPackage(pkg)} className={`p-5 rounded-xl cursor-pointer transition-all duration-300 text-start group ${isPkgSelected ? 'bg-[#1a1a1a]/90 border border-[#d32f2f] shadow-[0_0_20px_rgba(211,47,47,0.15)]' : 'bg-[#1e1e1e]/40 backdrop-blur-md border border-[#2a2a2a] hover:border-[#d32f2f] hover:bg-[#1a1a1a]/80'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className={`text-lg font-black uppercase mb-1 transition-colors ${isPkgSelected ? 'text-white' : 'text-[#d4d4d4] group-hover:text-white'}`}>{lang === 'ar' ? pkg.nameAr : pkg.nameEn}</h4>
                    <span className="text-[#a3a3a3] text-xs flex items-center gap-1.5"><Clock size={12} className={isPkgSelected ? 'text-[#d32f2f]' : ''} /> {pkg.durationMinutes} {t('mins')}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    {pkg.oldPrice && pkg.oldPrice > pkg.price && <span className="text-[#a3a3a3] text-xs line-through mb-0.5">{pkg.oldPrice} {t('currency')}</span>}
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-xl text-[#d32f2f]">{pkg.price} <span className="text-xs">{t('currency')}</span></span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isPkgSelected ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'}`}>
                        {isPkgSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-[#2a2a2a]">
                  {(lang === 'ar' ? pkg.itemsAr : pkg.itemsEn).map((item, idx) => (
                    <span key={idx} className={`border px-2.5 py-1.5 rounded-md text-[10px] uppercase font-bold tracking-wider transition-colors ${isPkgSelected ? 'bg-[#d32f2f]/10 border-[#d32f2f]/30 text-[#d32f2f]' : 'bg-[#121212]/50 border-[#2a2a2a] text-[#a3a3a3]'}`}>{item}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>

    {hasSelectedSomething && (
      <div className="mt-8 flex justify-end">
        <button onClick={() => setBookingState({ ...bookingState, step: 2 })} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]">{t('next_step')}</button>
      </div>
    )}
  </div>
);
export default Step1Services;