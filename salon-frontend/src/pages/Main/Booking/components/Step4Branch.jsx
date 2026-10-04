import React from 'react';
import { MapPin, Phone } from 'lucide-react';

const Step4Branch = ({ branches, bookingState, handleSelectBranch, setBookingState, t, lang }) => (
  <div className="animate-fade-in">
    <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center border-b border-[#2a2a2a] pb-4">{lang === 'ar' ? "اختر الفرع الأقرب إليك" : "Select Nearest Branch"}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {branches.filter(b => b.isActive).map((branch) => {
        const isSelected = bookingState.selectedBranch?._id === branch._id;
        return (
          <div key={branch._id} onClick={() => handleSelectBranch(branch)} className={`bg-[#141414] rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer text-start flex flex-col justify-between ${isSelected ? 'border-[#d32f2f] shadow-[0_10px_30px_rgba(211,47,47,0.15)] scale-[1.01]' : 'border-[#2a2a2a] hover:border-[#d32f2f]'}`}>
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-black uppercase tracking-wider text-white">{lang === 'ar' ? branch.nameAr : branch.nameEn}</h3>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'}`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-start gap-3 text-xs text-[#a3a3a3]">
                  <MapPin size={14} className="text-[#d32f2f] shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{lang === 'ar' ? branch.addressAr : branch.addressEn}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#a3a3a3]">
                  <Phone size={14} className="text-[#d32f2f] shrink-0" />
                  <p dir="ltr" className="font-semibold">{branch.phone}</p>
                </div>
              </div>
            </div>
            <div className="w-full h-48 bg-[#0f0f0f] border-t border-[#2a2a2a] relative">
              <iframe title={branch.nameEn} src={branch.mapUrl} className={`w-full h-full border-0 transition-all duration-500 ${isSelected ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'}`} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"></iframe>
            </div>
          </div>
        );
      })}
    </div>
    <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
      <button onClick={() => setBookingState({ ...bookingState, step: 3 })} className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start">{lang === 'ar' ? "← العودة للوقت" : "← Back to Time"}</button>
      {bookingState.selectedBranch && <button onClick={() => setBookingState({ ...bookingState, step: 5 })} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]">{t('next_step')}</button>}
    </div>
  </div>
);
export default Step4Branch;