import React from 'react';
import { Scissors } from 'lucide-react';

const BookingSummary = ({ bookingState, hasSelectedSomething, calculateTotalPrice, t, lang, isModal = false }) => {
  const groupedSelectedServices = bookingState.selectedServices.reduce((acc, curr) => {
    const key = curr.categoryTitleEn;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  // The inner content handles its own padding and background conditionally
  const innerContent = (
    <div className={`bg-[#121212]/80 backdrop-blur-xl ${isModal ? 'pt-4' : 'p-6 rounded-2xl border border-[#2a2a2a] sticky top-24 shadow-2xl'}`}>
      <h3 className={`text-xs font-black text-white uppercase tracking-widest mb-5 border-b border-[#2a2a2a] pb-3 text-start ${isModal ? 'pr-8' : ''}`}>
        {t('summary')}
      </h3>
      
      {hasSelectedSomething ? (
        <div className="space-y-4">
          {bookingState.selectedServices.length > 0 && Object.entries(groupedSelectedServices).map(([categoryName, itemsList]) => (
            <div key={categoryName} className="text-start border-b border-[#2a2a2a]/40 pb-3 last:border-0 last:pb-0">
              <span className="block text-[10px] font-bold text-[#d32f2f] uppercase tracking-widest mb-1.5">{categoryName}</span>
              <div className="space-y-2">
                {itemsList.map((item) => (
                  <div key={item.serviceId} className="flex justify-between items-start text-xs font-bold text-white">
                    <span className="leading-snug max-w-[160px]">{lang === 'ar' ? item.nameAr : item.nameEn}</span>
                    <span className="text-gray-400 font-medium whitespace-nowrap">{item.price} {t('currency')}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {bookingState.selectedPackage && (
            <div className="text-start animate-fade-in">
              <span className="block text-[10px] font-bold text-[#d32f2f] uppercase tracking-widest mb-1">{t('tab_packages')}</span>
              <div className="flex justify-between items-start text-xs font-bold text-white">
                <span className="leading-snug">{lang === 'ar' ? bookingState.selectedPackage.nameAr : bookingState.selectedPackage.nameEn}</span>
                <span className="text-gray-400 font-medium">{bookingState.selectedPackage.price} {t('currency')}</span>
              </div>
            </div>
          )}
          
          {bookingState.selectedProfessional && (
            <div className="text-start border-t border-[#2a2a2a] pt-4">
              <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1">{t('professional')}</span>
              <span className="text-white text-sm font-bold">{lang === 'ar' ? bookingState.selectedProfessional.nameAr : bookingState.selectedProfessional.nameEn}</span>
            </div>
          )}

          {bookingState.selectedDate && bookingState.selectedTime && (
            <div className="text-start border-t border-[#2a2a2a] pt-4">
              <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1">{t('date_time')}</span>
              <span className="text-white text-sm font-bold block">{bookingState.selectedDate}</span>
              <span className="text-[#d32f2f] text-sm font-bold">{bookingState.selectedTime}</span>
            </div>
          )}

          {bookingState.selectedBranch && (
            <div className="text-start border-t border-[#2a2a2a] pt-4 animate-fade-in">
              <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1">{lang === 'ar' ? "الفرع" : "Branch"}</span>
              <span className="text-white text-sm font-bold block">{lang === 'ar' ? bookingState.selectedBranch.nameAr : bookingState.selectedBranch.nameEn}</span>
            </div>
          )}
          
          <div className="flex justify-between border-t border-[#2a2a2a] pt-5 mt-5 text-start">
            <span className="font-black uppercase tracking-wider">{t('total')}</span>
            <span className="font-black text-xl text-white">{calculateTotalPrice()} <span className="text-[#d32f2f] text-sm">{t('currency')}</span></span>
          </div>
        </div>
      ) : (
        <p className="text-[#555] text-xs font-medium text-center py-4 flex items-center justify-center gap-2 mt-4"><Scissors size={14} /> {t('no_service')}</p>
      )}
    </div>
  );

  if (isModal) {
    return innerContent;
  }

  // Only render on desktop layout
  return (
    <div className="hidden lg:block w-[380px] relative flex-shrink-0 mt-8 lg:mt-0">
      {innerContent}
    </div>
  );
};

export default BookingSummary;