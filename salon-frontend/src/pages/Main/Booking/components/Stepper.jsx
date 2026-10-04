import React from 'react';
import { Scissors, User, CalendarDays, MapPin, CheckCircle2, Check } from 'lucide-react';

const Stepper = ({ step, handleStepClick, hasSelectedSomething, bookingState, t, lang }) => {
  const steps = [
    { num: 1, label: t('step_1'), icon: Scissors },
    { num: 2, label: t('step_2'), icon: User },
    { num: 3, label: t('step_3'), icon: CalendarDays },
    { num: 4, label: lang === 'ar' ? "الفرع" : "Branch", icon: MapPin },
    { num: 5, label: t('step_4'), icon: CheckCircle2 }
  ];

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-[#333] z-0">
          <div className="h-full bg-[#d32f2f] transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
        </div>
        {steps.map((s) => {
          const isActive = step === s.num;
          const isPast = step > s.num;
          const isClickable = isPast || (s.num === 2 && hasSelectedSomething) || (s.num === 3 && bookingState.selectedProfessional) || (s.num === 4 && bookingState.selectedTime) || (s.num === 5 && bookingState.selectedBranch);
          const Icon = s.icon;
          return (
            <div key={s.num} onClick={() => isClickable && handleStepClick(s.num)} className={`relative z-10 flex flex-col items-center gap-2 transition-colors ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-[#0a0a0a] transition-all duration-300 ${isActive ? "border-[#d32f2f] text-[#d32f2f] shadow-[0_0_15px_rgba(211,47,47,0.3)]" : isPast ? "border-[#d32f2f] bg-[#d32f2f] text-white" : "border-[#333] text-[#555]"}`}>
                {isPast ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
              </div>
              <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${isActive ? "text-[#d32f2f]" : isPast ? "text-white" : "text-[#555]"}`}>{s.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default Stepper;