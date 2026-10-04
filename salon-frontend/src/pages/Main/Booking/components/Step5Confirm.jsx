import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

const Step5Confirm = ({ bookingState, setBookingState, handleConfirmBooking, isSubmitting, calculateTotalPrice, t, lang }) => (
  <div className="animate-fade-in bg-[#141414] p-8 rounded-xl border border-[#2a2a2a]">
    <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-start">{t('client_details')}</h2>
    <div className="bg-[#1c1c1c] border border-[#2a2a2a] border-l-4 border-l-[#d32f2f] rounded-r-lg p-4 mb-4 flex items-start gap-3 text-start">
      <div className="text-[#d32f2f] mt-0.5"><CheckCircle2 size={18} /></div>
      <p className="text-[#a3a3a3] text-xs leading-relaxed font-medium">{t('whatsapp_notice')}</p>
    </div>
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-l-4 border-l-amber-600 rounded-r-lg p-4 mb-8 flex items-start gap-3 text-start">
      <div className="text-amber-600 mt-0.5 shrink-0"><Clock size={16} /></div>
      <p className="text-[#a3a3a3] text-xs leading-relaxed font-medium">{t('cancel_notice')}<span className="text-[#d32f2f] font-bold mx-1" dir="ltr">+20 11* *** ****</span></p>
    </div>
    <div className="space-y-5 mb-8">
      <div className="text-start">
        <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-2">{t('full_name')}</label>
        <input type="text" value={bookingState.clientName} onChange={(e) => setBookingState({...bookingState, clientName: e.target.value})} placeholder={t('enter_name')} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-[#d32f2f] transition-colors" disabled={isSubmitting} />
      </div>
      <div className="text-start">
        <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-2">{t('whatsapp_number')}</label>
        <input type="tel" value={bookingState.clientPhone} onChange={(e) => setBookingState({...bookingState, clientPhone: e.target.value})} placeholder={t('enter_whatsapp')} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-[#d32f2f] transition-colors text-left" dir="ltr" disabled={isSubmitting} />
      </div>
    </div>
    <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
      <button onClick={() => setBookingState({ ...bookingState, step: 4 })} className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start" disabled={isSubmitting}>{lang === 'ar' ? "← العودة للفرع" : "← Back to Branch"}</button>
      <button onClick={handleConfirmBooking} disabled={isSubmitting} className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${isSubmitting ? 'bg-[#333] border-[#333] text-[#a3a3a3] cursor-not-allowed' : 'bg-[#d32f2f] border-[#d32f2f] text-white hover:bg-red-700 shadow-lg shadow-red-900/20'}`}>
        {isSubmitting ? t('processing') : t('confirm_booking')}
      </button>
    </div>
  </div>
);
export default Step5Confirm;