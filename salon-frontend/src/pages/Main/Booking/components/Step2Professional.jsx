import React from 'react';
import { User } from 'lucide-react';

const Step2Professional = ({ professionals, bookingState, handleSelectProfessional, setBookingState, t, lang }) => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center border-b border-[#2a2a2a] pb-4">{t('select_professional')}</h2>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
      <div onClick={() => handleSelectProfessional({ _id: 'any', nameEn: t('random_name'), nameAr: t('random_name') })} className={`p-5 rounded-lg cursor-pointer transition-all flex items-center gap-4 text-start group ${bookingState.selectedProfessional?._id === 'any' ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${bookingState.selectedProfessional?._id === 'any' ? 'bg-[#d32f2f]' : 'bg-[#2a2a2a] group-hover:bg-[#333]'}`}><User size={20} /></div>
        <div>
          <h4 className="font-bold text-sm text-white">{t('random_name')}</h4>
          <span className="text-[#a3a3a3] text-xs block mt-0.5">{t('random_role')}</span>
        </div>
        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${bookingState.selectedProfessional?._id === 'any' ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'}`}>
          {bookingState.selectedProfessional?._id === 'any' && <div className="w-2 h-2 bg-white rounded-full"></div>}
        </div>
      </div>
      {professionals.map((prof) => (
        <div key={prof._id} onClick={() => handleSelectProfessional(prof)} className={`p-5 rounded-lg cursor-pointer transition-all flex items-center gap-4 text-start group ${bookingState.selectedProfessional?._id === prof._id ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'}`}>
          <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold transition-colors ${bookingState.selectedProfessional?._id === prof._id ? 'bg-[#d32f2f]' : 'bg-[#2a2a2a] group-hover:bg-[#333]'}`}>
            {prof.image ? <img src={prof.image} alt={prof.nameEn} className="w-full h-full object-cover grayscale opacity-80" /> : prof.nameEn.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">{lang === 'ar' ? prof.nameAr : prof.nameEn}</h4>
            <span className="text-[#a3a3a3] text-xs block mt-0.5">{lang === 'ar' ? prof.roleAr : prof.roleEn}</span>
          </div>
          <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${bookingState.selectedProfessional?._id === prof._id ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'}`}>
            {bookingState.selectedProfessional?._id === prof._id && <div className="w-2 h-2 bg-white rounded-full"></div>}
          </div>
        </div>
      ))}
    </div>
    <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
      <button onClick={() => setBookingState({ ...bookingState, step: 1 })} className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start">← {t('back_services')}</button>
      {bookingState.selectedProfessional && <button onClick={() => setBookingState({ ...bookingState, step: 3 })} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]">{t('next_step')}</button>}
    </div>
  </div>
);
export default Step2Professional;