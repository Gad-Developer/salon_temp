import React from 'react';

const Step3DateTime = ({ bookingState, setBookingState, t, lang }) => {
  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        fullDate: d.toISOString().split('T')[0],
        day: d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
        date: d.getDate(),
        month: d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { month: 'short' })
      });
    }
    return dates;
  };

  const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center border-b border-[#2a2a2a] pb-4">{t('select_time')}</h2>
      
      <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
        {generateDates().map((d, i) => (
          <div key={i} onClick={() => setBookingState({...bookingState, selectedDate: d.fullDate, selectedTime: null})} className={`min-w-[72px] p-4 rounded-lg border cursor-pointer text-center transition-all ${bookingState.selectedDate === d.fullDate ? 'bg-[#141414] border-[#d32f2f] text-white shadow-[0_0_10px_rgba(211,47,47,0.1)]' : 'bg-[#141414] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#d32f2f] hover:text-white'}`}>
            <span className="block text-[10px] font-bold uppercase tracking-widest mb-1">{d.day}</span>
            <span className={`block text-2xl font-black mb-1 ${bookingState.selectedDate === d.fullDate ? 'text-[#d32f2f]' : ''}`}>{d.date}</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest">{d.month}</span>
          </div>
        ))}
      </div>

      {bookingState.selectedDate && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {timeSlots.map((time) => (
            <div key={time} onClick={() => setBookingState({...bookingState, selectedTime: time})} className={`p-3 rounded-lg border text-sm font-bold text-center cursor-pointer transition-all ${bookingState.selectedTime === time ? 'bg-[#d32f2f] border-[#d32f2f] text-white shadow-lg shadow-red-900/20' : 'bg-[#141414] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#d32f2f] hover:text-white'}`}>{time}</div>
          ))}
        </div>
      )}

      <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
        <button onClick={() => setBookingState({ ...bookingState, step: 2 })} className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start">← {t('back_professional')}</button>
        {bookingState.selectedTime && <button onClick={() => setBookingState({...bookingState, step: 4})} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]">{t('next_step')}</button>}
      </div>
    </div>
  );
};
export default Step3DateTime;