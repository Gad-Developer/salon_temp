import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { Link } from 'react-router-dom';
import { Scissors, User, CalendarDays, CheckCircle2, Clock, Check, Package } from 'lucide-react';

const Booking = () => {
  const { t, lang } = useLanguage();
  
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Toggle between standard services and special packages in Step 1
  const [serviceTab, setServiceTab] = useState('services'); 

  const [bookingState, setBookingState] = useState({
    step: 1,
    selectedService: null,
    selectedProfessional: null,
    selectedDate: null,
    selectedTime: null,
    clientName: '',
    clientPhone: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, profRes, pkgRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/professionals'),
          axios.get('/api/packages')
        ]);
        setCategories(catRes.data);
        setProfessionals(profRes.data);
        setPackages(pkgRes.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching booking data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectService = (serviceItem, isPackage = false) => {
    if (bookingState.selectedService?._id !== serviceItem._id) {
      setBookingState({ 
        ...bookingState, 
        selectedService: { ...serviceItem, isPackage },
        selectedProfessional: null,
        selectedDate: null,
        selectedTime: null,
      });
    }
  };

  const handleSelectProfessional = (prof) => {
    setBookingState({ ...bookingState, selectedProfessional: prof });
  };

  const handleStepClick = (targetStep) => {
    if (bookingState.step === 5) return; 

    if (targetStep < bookingState.step) {
      setBookingState({ ...bookingState, step: targetStep });
    } else if (targetStep > bookingState.step) {
      if (bookingState.step === 1 && bookingState.selectedService) {
        setBookingState({ ...bookingState, step: targetStep });
      } else if (bookingState.step === 2 && bookingState.selectedProfessional) {
        setBookingState({ ...bookingState, step: targetStep });
      } else if (bookingState.step === 3 && bookingState.selectedTime) {
        setBookingState({ ...bookingState, step: targetStep });
      }
    }
  };

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

  const steps = [
    { num: 1, label: t('step_1'), icon: Scissors },
    { num: 2, label: t('step_2'), icon: User },
    { num: 3, label: t('step_3'), icon: CalendarDays },
    { num: 4, label: t('step_4'), icon: CheckCircle2 }
  ];

  const handleConfirmBooking = async () => {
    if (!bookingState.clientName || !bookingState.clientPhone) {
      alert(lang === 'ar' ? 'يرجى إدخال جميع البيانات' : 'Please fill in all details');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      // Using serviceId for both packages and services to match backend structure
      serviceId: bookingState.selectedService._id,
      isPackage: bookingState.selectedService.isPackage || false,
      professionalId: bookingState.selectedProfessional._id || 'any',
      date: bookingState.selectedDate,
      time: bookingState.selectedTime,
      clientName: bookingState.clientName,
      clientPhone: bookingState.clientPhone,
      totalPrice: bookingState.selectedService.price
    };

    try {
      await axios.post('/api/appointments', payload);
      setBookingState({ ...bookingState, step: 5 });
    } catch (error) {
      console.error("Booking failed:", error);
      alert(lang === 'ar' ? 'فشل الحجز. حاول مرة أخرى.' : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBookingState({
      step: 1,
      selectedService: null,
      selectedProfessional: null,
      selectedDate: null,
      selectedTime: null,
      clientName: '',
      clientPhone: ''
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-[#d32f2f] pt-28 px-6 text-center text-sm font-medium animate-pulse">{t('loading')}</div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-6">
        
        {/* STEP 5: SUCCESS UI */}
        {bookingState.step === 5 ? (
          <div className="w-full max-w-2xl mx-auto bg-[#141414] p-10 rounded-xl border border-[#2a2a2a] text-center mt-8 shadow-2xl">
            <div className="w-20 h-20 bg-[#d32f2f]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d32f2f]/30">
              <CheckCircle2 size={40} className="text-[#d32f2f]" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-3">{t('success_title')}</h2>
            <p className="text-[#a3a3a3] mb-8 text-sm leading-relaxed max-w-md mx-auto">
              {t('success_message')}
            </p>
            
            <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-6 mb-8 text-start max-w-sm mx-auto">
              <p className="text-xs text-[#a3a3a3] uppercase tracking-wider mb-1">{t('date_time')}</p>
              <p className="font-bold text-lg">{bookingState.selectedDate} <span className="text-[#d32f2f]">{bookingState.selectedTime}</span></p>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                to="/"
                className="px-8 py-3 rounded-full text-sm font-bold border border-[#333] hover:bg-[#333] transition-colors"
              >
                {t('return_home')}
              </Link>
              <button 
                onClick={resetBooking}
                className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-red-700 transition-all border border-[#d32f2f]"
              >
                {t('book_another')}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Stepper & Forms */}
            <div className="flex-1 min-w-0">
              
              {/* Sleek Horizontal Stepper */}
              <div className="mb-10">
                <div className="flex justify-between items-center relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-[#333] z-0" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    <div 
                      className="h-full bg-[#d32f2f] transition-all duration-500"
                      style={{ width: `${((bookingState.step - 1) / 3) * 100}%` }}
                    ></div>
                  </div>

                  {steps.map((s) => {
                    const isActive = bookingState.step === s.num;
                    const isPast = bookingState.step > s.num;
                    const isClickable = isPast || 
                                       (s.num === 2 && bookingState.selectedService) || 
                                       (s.num === 3 && bookingState.selectedProfessional) ||
                                       (s.num === 4 && bookingState.selectedTime);
                    const Icon = s.icon;
                    
                    return (
                      <div 
                        key={s.num}
                        onClick={() => isClickable && handleStepClick(s.num)}
                        className={`relative z-10 flex flex-col items-center gap-2 transition-colors ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-[#0a0a0a] transition-all duration-300 ${
                          isActive ? "border-[#d32f2f] text-[#d32f2f] shadow-[0_0_15px_rgba(211,47,47,0.3)]" : 
                          isPast ? "border-[#d32f2f] bg-[#d32f2f] text-white" : "border-[#333] text-[#555]"
                        }`}>
                          {isPast ? <Check size={16} strokeWidth={3} /> : <Icon size={16} />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${
                          isActive ? "text-[#d32f2f]" : isPast ? "text-white" : "text-[#555]"
                        }`}>
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 1: Services & Packages */}
              {bookingState.step === 1 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black uppercase tracking-widest mb-6 text-center">{t('select_service')}</h2>
                  
                  {/* Toggle Between Services and Packages */}
                  <div className="flex bg-[#141414] rounded-lg p-1.5 border border-[#2a2a2a] mb-8 max-w-md mx-auto relative z-10">
                    <button 
                      onClick={() => setServiceTab('services')}
                      className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${
                        serviceTab === 'services' ? 'bg-[#d32f2f] text-white shadow-lg' : 'text-[#a3a3a3] hover:text-white'
                      }`}
                    >
                      <Scissors size={14} />
                      {t('tab_services')}
                    </button>
                    <button 
                      onClick={() => setServiceTab('packages')}
                      className={`flex-1 py-2.5 flex items-center justify-center gap-2 rounded-md font-bold text-xs uppercase tracking-wider transition-all ${
                        serviceTab === 'packages' ? 'bg-[#d32f2f] text-white shadow-lg' : 'text-[#a3a3a3] hover:text-white'
                      }`}
                    >
                      <Package size={14} />
                      {t('tab_packages')}
                    </button>
                  </div>

                  {/* Standard Services List */}
                  {serviceTab === 'services' && categories.map((cat) => (
                    <div key={cat._id} className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest text-start whitespace-nowrap">
                          {lang === 'ar' ? cat.titleAr : cat.titleEn}
                        </h3>
                        <div className="h-[1px] w-full bg-[#2a2a2a]"></div>
                      </div>
                      
                      <div className="grid gap-3">
                        {cat.services.map((service) => (
                          <div 
                            key={service._id}
                            onClick={() => handleSelectService(service, false)}
                            className={`p-5 rounded-lg cursor-pointer transition-all flex justify-between items-center text-start group ${
                              bookingState.selectedService?._id === service._id 
                                ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                                : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'
                            }`}
                          >
                            <div>
                              <h4 className={`text-base font-bold mb-1 transition-colors ${bookingState.selectedService?._id === service._id ? 'text-white' : 'text-[#d4d4d4] group-hover:text-white'}`}>
                                {lang === 'ar' ? service.nameAr : service.nameEn}
                              </h4>
                              <span className="text-[#a3a3a3] text-xs flex items-center gap-1.5">
                                <Clock size={12} className={bookingState.selectedService?._id === service._id ? 'text-[#d32f2f]' : ''} /> 
                                {service.durationMinutes} {t('mins')}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-bold text-lg text-white">
                                {service.price} <span className="text-xs text-[#d32f2f]">{t('currency')}</span>
                              </span>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                bookingState.selectedService?._id === service._id ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                              }`}>
                                {bookingState.selectedService?._id === service._id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Special Packages List */}
                  {serviceTab === 'packages' && (
                    <div className="grid gap-4 mb-8">
                      {packages.filter(p => p.isActive).map((pkg) => (
                        <div 
                          key={pkg._id}
                          onClick={() => handleSelectService(pkg, true)}
                          className={`p-5 rounded-lg cursor-pointer transition-all text-start group ${
                            bookingState.selectedService?._id === pkg._id 
                              ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                              : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'
                          }`}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <h4 className={`text-lg font-black uppercase mb-1 transition-colors ${bookingState.selectedService?._id === pkg._id ? 'text-white' : 'text-[#d4d4d4] group-hover:text-white'}`}>
                                {lang === 'ar' ? pkg.nameAr : pkg.nameEn}
                              </h4>
                              <span className="text-[#a3a3a3] text-xs flex items-center gap-1.5">
                                <Clock size={12} className={bookingState.selectedService?._id === pkg._id ? 'text-[#d32f2f]' : ''} /> 
                                {pkg.durationMinutes} {t('mins')}
                              </span>
                            </div>
                            
                            <div className="flex flex-col items-end">
                              <span className="text-[#a3a3a3] text-xs line-through mb-0.5">{pkg.oldPrice} {t('currency')}</span>
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-xl text-[#d32f2f]">
                                  {pkg.price} <span className="text-xs">{t('currency')}</span>
                                </span>
                                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  bookingState.selectedService?._id === pkg._id ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                                }`}>
                                  {bookingState.selectedService?._id === pkg._id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Items Preview Tags */}
                          <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-[#2a2a2a]">
                            {(lang === 'ar' ? pkg.itemsAr : pkg.itemsEn).map((item, idx) => (
                              <span key={idx} className={`border px-2 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                bookingState.selectedService?._id === pkg._id ? 'bg-[#d32f2f]/10 border-[#d32f2f]/30 text-[#d32f2f]' : 'bg-[#0a0a0a] border-[#2a2a2a] text-[#a3a3a3]'
                              }`}>
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                      
                      {packages.length === 0 && (
                        <div className="text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-lg">
                          No special packages available.
                        </div>
                      )}
                    </div>
                  )}

                  {bookingState.selectedService && (
                    <div className="mt-8 flex justify-end">
                      <button 
                        onClick={() => setBookingState({ ...bookingState, step: 2 })}
                        className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]"
                      >
                        {t('next_step')}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Professional */}
              {bookingState.step === 2 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center border-b border-[#2a2a2a] pb-4">{t('select_professional')}</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div 
                      onClick={() => handleSelectProfessional({
                        _id: 'any',
                        nameEn: t('random_name'),
                        nameAr: t('random_name'),
                        roleEn: t('random_role'),
                        roleAr: t('random_role')
                      })}
                      className={`p-5 rounded-lg cursor-pointer transition-all flex items-center gap-4 text-start group ${
                        bookingState.selectedProfessional?._id === 'any' 
                          ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                          : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white transition-colors ${
                         bookingState.selectedProfessional?._id === 'any' ? 'bg-[#d32f2f]' : 'bg-[#2a2a2a] group-hover:bg-[#333]'
                      }`}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white">{t('random_name')}</h4>
                        <span className="text-[#a3a3a3] text-xs block mt-0.5">{t('random_role')}</span>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                        bookingState.selectedProfessional?._id === 'any' ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                      }`}>
                        {bookingState.selectedProfessional?._id === 'any' && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>

                    {professionals.map((prof) => (
                      <div 
                        key={prof.nameEn} 
                        onClick={() => handleSelectProfessional(prof)}
                        className={`p-5 rounded-lg cursor-pointer transition-all flex items-center gap-4 text-start group ${
                          bookingState.selectedProfessional?.nameEn === prof.nameEn
                            ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                            : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold transition-colors ${
                           bookingState.selectedProfessional?.nameEn === prof.nameEn ? 'bg-[#d32f2f]' : 'bg-[#2a2a2a] group-hover:bg-[#333]'
                        }`}>
                           {prof.image ? (
                             <img src={prof.image} alt={prof.nameEn} className="w-full h-full object-cover grayscale opacity-80" />
                           ) : (
                             prof.nameEn.charAt(0)
                           )}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white">{lang === 'ar' ? prof.nameAr : prof.nameEn}</h4>
                          <span className="text-[#a3a3a3] text-xs block mt-0.5">{lang === 'ar' ? prof.roleAr : prof.roleEn}</span>
                        </div>
                        <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                          bookingState.selectedProfessional?.nameEn === prof.nameEn ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                        }`}>
                          {bookingState.selectedProfessional?.nameEn === prof.nameEn && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
                    <button 
                      onClick={() => handleStepClick(1)}
                      className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start"
                    >
                      ← {t('back_services')}
                    </button>
                    {bookingState.selectedProfessional && (
                      <button 
                        onClick={() => setBookingState({ ...bookingState, step: 3 })}
                        className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]"
                      >
                        {t('next_step')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Date & Time */}
              {bookingState.step === 3 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center border-b border-[#2a2a2a] pb-4">{t('select_time')}</h2>
                  
                  <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {generateDates().map((d, i) => (
                      <div 
                        key={i}
                        onClick={() => setBookingState({...bookingState, selectedDate: d.fullDate, selectedTime: null})}
                        className={`min-w-[72px] p-4 rounded-lg border cursor-pointer text-center transition-all ${
                          bookingState.selectedDate === d.fullDate 
                            ? 'bg-[#141414] border-[#d32f2f] text-white shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                            : 'bg-[#141414] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#d32f2f] hover:text-white'
                        }`}
                      >
                        <span className="block text-[10px] font-bold uppercase tracking-widest mb-1">{d.day}</span>
                        <span className={`block text-2xl font-black mb-1 ${bookingState.selectedDate === d.fullDate ? 'text-[#d32f2f]' : ''}`}>{d.date}</span>
                        <span className="block text-[10px] font-bold uppercase tracking-widest">{d.month}</span>
                      </div>
                    ))}
                  </div>

                  {bookingState.selectedDate && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {timeSlots.map((time) => (
                        <div 
                          key={time}
                          onClick={() => setBookingState({...bookingState, selectedTime: time})}
                          className={`p-3 rounded-lg border text-sm font-bold text-center cursor-pointer transition-all ${
                            bookingState.selectedTime === time 
                              ? 'bg-[#d32f2f] border-[#d32f2f] text-white shadow-lg shadow-red-900/20' 
                              : 'bg-[#141414] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#d32f2f] hover:text-white'
                          }`}
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
                    <button 
                      onClick={() => handleStepClick(2)} 
                      className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start"
                    >
                      ← {t('back_professional')}
                    </button>
                    {bookingState.selectedTime && (
                      <button 
                        onClick={() => setBookingState({...bookingState, step: 4})} 
                        className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]"
                      >
                        {t('next_step')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 4: Confirm Details */}
              {bookingState.step === 4 && (
                <div className="animate-fade-in bg-[#141414] p-8 rounded-xl border border-[#2a2a2a]">
                  <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-start">{t('client_details')}</h2>
                  
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] border-l-4 border-l-[#d32f2f] rounded-r-lg p-4 mb-8 flex items-start gap-3 text-start">
                    <div className="text-[#d32f2f] mt-0.5">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-[#a3a3a3] text-xs leading-relaxed font-medium">
                      {t('whatsapp_notice')}
                    </p>
                  </div>

                  <div className="space-y-5 mb-8">
                    <div className="text-start">
                      <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-2">{t('full_name')}</label>
                      <input 
                        type="text" 
                        value={bookingState.clientName}
                        onChange={(e) => setBookingState({...bookingState, clientName: e.target.value})}
                        placeholder={t('enter_name')}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-[#d32f2f] transition-colors"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="text-start">
                      <label className="block text-xs font-bold text-[#a3a3a3] uppercase tracking-wider mb-2">{t('whatsapp_number')}</label>
                      <input 
                        type="tel" 
                        value={bookingState.clientPhone}
                        onChange={(e) => setBookingState({...bookingState, clientPhone: e.target.value})}
                        placeholder={t('enter_whatsapp')}
                        className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3.5 text-sm text-white focus:outline-none focus:border-[#d32f2f] transition-colors text-left"
                        dir="ltr"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
                    <button 
                      onClick={() => handleStepClick(3)} 
                      className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start"
                      disabled={isSubmitting}
                    >
                      ← {t('back_time')}
                    </button>
                    <button 
                      onClick={handleConfirmBooking} 
                      disabled={isSubmitting}
                      className={`px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider transition-all border ${
                        isSubmitting 
                          ? 'bg-[#333] border-[#333] text-[#a3a3a3] cursor-not-allowed' 
                          : 'bg-[#d32f2f] border-[#d32f2f] text-white hover:bg-red-700 shadow-lg shadow-red-900/20'
                      }`}
                    >
                      {isSubmitting ? t('processing') : t('confirm_booking')}
                    </button>
                  </div>
                </div>
              )}

            </div> {/* <-- End Left Column */}

            {/* RIGHT COLUMN: Sticky Summary Cart */}
            <div className="w-full lg:w-80 relative flex-shrink-0 mt-8 lg:mt-0">
              <div className="bg-[#141414] p-6 rounded-xl border border-[#2a2a2a] sticky top-24 shadow-lg">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 border-b border-[#2a2a2a] pb-3 text-start">
                  {t('summary')}
                </h3>
                
                {bookingState.selectedService ? (
                  <div className="space-y-4">
                    <div className="text-start">
                      <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1">
                        {bookingState.selectedService.isPackage ? 'Package' : 'Service'}
                      </span>
                      <div className="flex justify-between items-start">
                        <span className="text-white text-sm font-bold leading-tight">
                          {lang === 'ar' ? bookingState.selectedService.nameAr : bookingState.selectedService.nameEn}
                        </span>
                        <span className="text-white font-bold whitespace-nowrap ml-4">
                          {bookingState.selectedService.price} <span className="text-[#d32f2f] text-xs">{t('currency')}</span>
                        </span>
                      </div>
                    </div>
                    
                    {bookingState.selectedProfessional && (
                      <div className="text-start border-t border-[#2a2a2a] pt-4">
                        <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1">{t('professional')}</span>
                        <span className="text-white text-sm font-bold">
                          {lang === 'ar' ? bookingState.selectedProfessional.nameAr : bookingState.selectedProfessional.nameEn}
                        </span>
                      </div>
                    )}

                    {bookingState.selectedDate && bookingState.selectedTime && (
                      <div className="text-start border-t border-[#2a2a2a] pt-4">
                        <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1">{t('date_time')}</span>
                        <span className="text-white text-sm font-bold block">{bookingState.selectedDate}</span>
                        <span className="text-[#d32f2f] text-sm font-bold">{bookingState.selectedTime}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t border-[#2a2a2a] pt-5 mt-5 text-start">
                      <span className="font-black uppercase tracking-wider">{t('total')}</span>
                      <span className="font-black text-xl text-white">
                        {bookingState.selectedService.price} <span className="text-[#d32f2f] text-sm">{t('currency')}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#555] text-xs font-medium text-start flex items-center gap-2 mt-4">
                    <Scissors size={14} /> {t('no_service')}
                  </p>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Booking;