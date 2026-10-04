import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

const SuccessView = ({ bookingState, resetBooking, t, lang }) => (
  <div className="w-full max-w-2xl mx-auto bg-[#141414] p-10 rounded-xl border border-[#2a2a2a] text-center mt-8 shadow-2xl">
    <div className="w-20 h-20 bg-[#d32f2f]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d32f2f]/30">
      <CheckCircle2 size={40} className="text-[#d32f2f]" />
    </div>
    <h2 className="text-3xl font-black uppercase mb-3">{t('success_title')}</h2>
    <p className="text-[#a3a3a3] mb-8 text-sm leading-relaxed max-w-md mx-auto">{t('success_message')}</p>
    
    <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-6 mb-8 text-start max-w-sm mx-auto space-y-3">
      <div>
        <p className="text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-0.5">{lang === 'ar' ? "الفرع المختار" : "Selected Branch"}</p>
        <p className="font-bold text-base text-white">{lang === 'ar' ? bookingState.selectedBranch?.nameAr : bookingState.selectedBranch?.nameEn}</p>
      </div>
      <div className="border-t border-[#2a2a2a] pt-2">
        <p className="text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-0.5">{t('date_time')}</p>
        <p className="font-bold text-lg text-white">{bookingState.selectedDate} <span className="text-[#d32f2f]">{bookingState.selectedTime}</span></p>
      </div>
    </div>
    <div className="flex flex-col sm:flex-row justify-center gap-4">
      <Link to="/" className="px-8 py-3 rounded-full text-sm font-bold border border-[#333] hover:bg-[#333] transition-colors">{t('return_home')}</Link>
      <button onClick={resetBooking} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-red-700 transition-all border border-[#d32f2f]">{t('book_another')}</button>
    </div>
  </div>
);
export default SuccessView;