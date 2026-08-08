import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { Link } from 'react-router-dom';
import { Scissors, User, CalendarDays, CheckCircle2, Clock, Check, Package, MapPin, Phone } from 'lucide-react';

const Booking = () => {
  const { t, lang } = useLanguage();
  
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [serviceTab, setServiceTab] = useState('services'); 

  const [bookingState, setBookingState] = useState({
    step: 1,
    selectedServices: [], // Dynamically tracks multiple standard service items
    selectedPackage: null,  // Holds individual single package item selection
    selectedProfessional: null,
    selectedDate: null,
    selectedTime: null,
    selectedBranch: null,
    clientName: '',
    clientPhone: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, profRes, pkgRes, branchRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/professionals'),
          axios.get('/api/packages'),
          axios.get('/api/branches')
        ]);
        setCategories(catRes.data);
        setProfessionals(profRes.data);
        setPackages(pkgRes.data);
        setBranches(branchRes.data || []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching booking data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSelectService = (serviceItem, categoryTitleEn) => {
    setBookingState(prev => {
      const exists = prev.selectedServices.find(s => s.serviceId === serviceItem._id);
      let updatedServices = [];

      if (exists) {
        updatedServices = prev.selectedServices.filter(s => s.serviceId !== serviceItem._id);
      } else {
        updatedServices = [
          ...prev.selectedServices,
          {
            serviceId: serviceItem._id,
            nameEn: serviceItem.nameEn,
            nameAr: serviceItem.nameAr,
            categoryTitleEn: categoryTitleEn,
            price: serviceItem.price
          }
        ];
      }

      return {
        ...prev,
        selectedServices: updatedServices,
        selectedPackage: null, // Constraint Rule: Selecting standard services completely clears package selections
        selectedProfessional: null,
        selectedDate: null,
        selectedTime: null,
        selectedBranch: null
      };
    });
  };

  // Ensure both of these helper handlers are present in your Booking component:
  const handleSelectProfessional = (prof) => {
    setBookingState(prev => ({ ...prev, selectedProfessional: prof }));
  };

  const handleSelectBranch = (branch) => {
    setBookingState(prev => ({ ...prev, selectedBranch: branch }));
  };

  const handleSelectPackage = (pkgItem) => {
    setBookingState(prev => ({
      ...prev,
      selectedPackage: prev.selectedPackage?._id === pkgItem._id ? null : pkgItem,
      selectedServices: [], // Constraint Rule: Selecting a VIP package completely clears individual services
      selectedProfessional: null,
      selectedDate: null,
      selectedTime: null,
      selectedBranch: null
    }));
  };

  const calculateTotalPrice = () => {
    if (bookingState.selectedPackage) return bookingState.selectedPackage.price;
    return bookingState.selectedServices.reduce((acc, curr) => acc + curr.price, 0);
  };

  const handleStepClick = (targetStep) => {
    if (bookingState.step === 6) return; 

    if (targetStep < bookingState.step) {
      setBookingState({ ...bookingState, step: targetStep });
    } else if (targetStep > bookingState.step) {
      const hasSelection = bookingState.selectedServices.length > 0 || bookingState.selectedPackage;
      if (bookingState.step === 1 && hasSelection) {
        setBookingState({ ...bookingState, step: targetStep });
      } else if (bookingState.step === 2 && bookingState.selectedProfessional) {
        setBookingState({ ...bookingState, step: targetStep });
      } else if (bookingState.step === 3 && bookingState.selectedTime) {
        setBookingState({ ...bookingState, step: targetStep });
      } else if (bookingState.step === 4 && bookingState.selectedBranch) {
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
    { num: 4, label: lang === 'ar' ? "الفرع" : "Branch", icon: MapPin },
    { num: 5, label: t('step_4'), icon: CheckCircle2 }
  ];

  const handleConfirmBooking = async () => {
    if (!bookingState.clientName || !bookingState.clientPhone) {
      alert(lang === 'ar' ? 'يرجى إدخال جميع البيانات' : 'Please fill in all details');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      services: bookingState.selectedServices,
      packageId: bookingState.selectedPackage?._id || null,
      isPackage: !!bookingState.selectedPackage,
      professionalId: bookingState.selectedProfessional._id || 'any',
      date: bookingState.selectedDate,
      time: bookingState.selectedTime,
      branchId: bookingState.selectedBranch._id,
      clientName: bookingState.clientName,
      clientPhone: bookingState.clientPhone,
      totalPrice: calculateTotalPrice()
    };

    try {
      await axios.post('/api/appointments', payload);
      setBookingState({ ...bookingState, step: 6 });
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
      selectedServices: [],
      selectedPackage: null,
      selectedProfessional: null,
      selectedDate: null,
      selectedTime: null,
      selectedBranch: null,
      clientName: '',
      clientPhone: ''
    });
  };

  if (isLoading) {
    return <div className="min-h-screen bg-[#0a0a0a] text-[#d32f2f] pt-28 px-6 text-center text-sm font-medium animate-pulse">{t('loading')}</div>;
  }

  const hasSelectedSomething = bookingState.selectedServices.length > 0 || bookingState.selectedPackage;

  // Groups frontend raw elements into matching category headers dynamically
  const groupedSelectedServices = bookingState.selectedServices.reduce((acc, curr) => {
    const key = curr.categoryTitleEn;
    if (!acc[key]) acc[key] = [];
    acc[key].push(curr);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-6">
        
        {/* STEP 6: SUCCESS UI */}
        {bookingState.step === 6 ? (
          <div className="w-full max-w-2xl mx-auto bg-[#141414] p-10 rounded-xl border border-[#2a2a2a] text-center mt-8 shadow-2xl">
            <div className="w-20 h-20 bg-[#d32f2f]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d32f2f]/30">
              <CheckCircle2 size={40} className="text-[#d32f2f]" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-3">{t('success_title')}</h2>
            <p className="text-[#a3a3a3] mb-8 text-sm leading-relaxed max-w-md mx-auto">
              {t('success_message')}
            </p>
            
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
              <Link to="/" className="px-8 py-3 rounded-full text-sm font-bold border border-[#333] hover:bg-[#333] transition-colors">
                {t('return_home')}
              </Link>
              <button onClick={resetBooking} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-red-700 transition-all border border-[#d32f2f]">
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
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-[#333] z-0">
                    <div 
                      className="h-full bg-[#d32f2f] transition-all duration-500"
                      style={{ width: `${((bookingState.step - 1) / 4) * 100}%` }}
                    ></div>
                  </div>

                  {steps.map((s) => {
                    const isActive = bookingState.step === s.num;
                    const isPast = bookingState.step > s.num;
                    const isClickable = isPast || 
                                       (s.num === 2 && hasSelectedSomething) || 
                                       (s.num === 3 && bookingState.selectedProfessional) ||
                                       (s.num === 4 && bookingState.selectedTime) ||
                                       (s.num === 5 && bookingState.selectedBranch);
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

                  {serviceTab === 'services' && categories.map((cat) => (
                    <div key={cat._id} className="mb-8">
                      <div className="flex items-center gap-4 mb-4">
                        <h3 className="text-xs font-bold text-[#a3a3a3] uppercase tracking-widest text-start whitespace-nowrap">
                          {lang === 'ar' ? cat.titleAr : cat.titleEn}
                        </h3>
                        <div className="h-[1px] w-full bg-[#2a2a2a]"></div>
                      </div>
                      
                      <div className="grid gap-3">
                        {cat.services.map((service) => {
                          const isItemSelected = !!bookingState.selectedServices.find(s => s.serviceId === service._id);
                          return (
                            <div 
                              key={service._id}
                              onClick={() => handleSelectService(service, cat.titleEn)}
                              className={`p-5 rounded-lg cursor-pointer transition-all flex justify-between items-center text-start group ${
                                isItemSelected 
                                  ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                                  : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'
                              }`}
                            >
                              <div>
                                <h4 className={`text-base font-bold mb-1 transition-colors ${isItemSelected ? 'text-white' : 'text-[#d4d4d4] group-hover:text-white'}`}>
                                  {lang === 'ar' ? service.nameAr : service.nameEn}
                                </h4>
                                <span className="text-[#a3a3a3] text-xs flex items-center gap-1.5">
                                  <Clock size={12} className={isItemSelected ? 'text-[#d32f2f]' : ''} /> 
                                  {service.durationMinutes} {t('mins')}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="font-bold text-lg text-white">
                                  {service.price} <span className="text-xs text-[#d32f2f]">{t('currency')}</span>
                                </span>
                                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                                  isItemSelected ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                                }`}>
                                  {isItemSelected && <Check size={12} strokeWidth={4} className="text-white" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {serviceTab === 'packages' && (
                    <div className="grid gap-4 mb-8">
                      {packages.filter(p => p.isActive).map((pkg) => {
                        const isPkgSelected = bookingState.selectedPackage?._id === pkg._id;
                        return (
                          <div 
                            key={pkg._id}
                            onClick={() => handleSelectPackage(pkg)}
                            className={`p-5 rounded-lg cursor-pointer transition-all text-start group ${
                              isPkgSelected 
                                ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                                : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h4 className={`text-lg font-black uppercase mb-1 transition-colors ${isPkgSelected ? 'text-white' : 'text-[#d4d4d4] group-hover:text-white'}`}>
                                  {lang === 'ar' ? pkg.nameAr : pkg.nameEn}
                                </h4>
                                <span className="text-[#a3a3a3] text-xs flex items-center gap-1.5">
                                  <Clock size={12} className={isPkgSelected ? 'text-[#d32f2f]' : ''} /> 
                                  {pkg.durationMinutes} {t('mins')}
                                </span>
                              </div>
                              
                              <div className="flex flex-col items-end">
                                {pkg.oldPrice && pkg.oldPrice > pkg.price ? (
                                  <span className="text-[#a3a3a3] text-xs line-through mb-0.5">
                                    {pkg.oldPrice} {t('currency')}
                                  </span>
                                ) : null}
                                <div className="flex items-center gap-3">
                                  <span className="font-bold text-xl text-[#d32f2f]">
                                    {pkg.price} <span className="text-xs">{t('currency')}</span>
                                  </span>
                                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    isPkgSelected ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                                  }`}>
                                    {isPkgSelected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-[#2a2a2a]">
                              {(lang === 'ar' ? pkg.itemsAr : pkg.itemsEn).map((item, idx) => (
                                <span key={idx} className={`border px-2 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                  isPkgSelected ? 'bg-[#d32f2f]/10 border-[#d32f2f]/30 text-[#d32f2f]' : 'bg-[#0a0a0a] border-[#2a2a2a] text-[#a3a3a3]'
                                }`}>
                                  {item}
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {hasSelectedSomething && (
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
                        nameAr: t('random_name')
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
                        key={prof._id} 
                        onClick={() => handleSelectProfessional(prof)}
                        className={`p-5 rounded-lg cursor-pointer transition-all flex items-center gap-4 text-start group ${
                          bookingState.selectedProfessional?._id === prof._id
                            ? 'bg-[#141414] border border-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.1)]' 
                            : 'bg-[#141414] border border-[#2a2a2a] hover:border-[#d32f2f]'
                        }`}
                      >
                        <div className={`w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold transition-colors ${
                           bookingState.selectedProfessional?._id === prof._id ? 'bg-[#d32f2f]' : 'bg-[#2a2a2a] group-hover:bg-[#333]'
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
                          bookingState.selectedProfessional?._id === prof._id ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                        }`}>
                          {bookingState.selectedProfessional?._id === prof._id && <div className="w-2 h-2 bg-white rounded-full"></div>}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
                    <button onClick={() => setBookingState({ ...bookingState, step: 1 })} className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start">
                      ← {t('back_services')}
                    </button>
                    {bookingState.selectedProfessional && (
                      <button onClick={() => setBookingState({ ...bookingState, step: 3 })} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]">
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
                  
                  <div className="flex gap-3 overflow-x-auto pb-4 mb-6 scrollbar-hide">
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
                    <button onClick={() => setBookingState({ ...bookingState, step: 2 })} className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start">
                      ← {t('back_professional')}
                    </button>
                    {bookingState.selectedTime && (
                      <button onClick={() => setBookingState({...bookingState, step: 4})} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]">
                        {t('next_step')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Branch Layout & Map Embed */}
              {bookingState.step === 4 && (
                <div className="animate-fade-in">
                  <h2 className="text-2xl font-black uppercase tracking-widest mb-8 text-center border-b border-[#2a2a2a] pb-4">
                    {lang === 'ar' ? "اختر الفرع الأقرب إليك" : "Select Nearest Branch"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {branches.filter(b => b.isActive).map((branch) => {
                      const isSelected = bookingState.selectedBranch?._id === branch._id;
                      return (
                        <div
                          key={branch._id}
                          onClick={() => handleSelectBranch(branch)}
                          className={`bg-[#141414] rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer text-start flex flex-col justify-between ${
                            isSelected 
                              ? 'border-[#d32f2f] shadow-[0_10px_30px_rgba(211,47,47,0.15)] scale-[1.01]' 
                              : 'border-[#2a2a2a] hover:border-[#d32f2f]'
                          }`}
                        >
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-lg font-black uppercase tracking-wider text-white">
                                {lang === 'ar' ? branch.nameAr : branch.nameEn}
                              </h3>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'
                              }`}>
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
                            <iframe
                              title={branch.nameEn}
                              src={branch.mapUrl}
                              className={`w-full h-full border-0 transition-all duration-500 ${isSelected ? 'opacity-100 grayscale-0' : 'opacity-40 grayscale'}`}
                              allowFullScreen
                              loading="lazy"
                              referrerPolicy="no-referrer-when-downgrade"
                            ></iframe>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-between mt-8 border-t border-[#2a2a2a] pt-6">
                    <button onClick={() => setBookingState({ ...bookingState, step: 3 })} className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start">
                      {lang === 'ar' ? "← العودة للوقت" : "← Back to Time"}
                    </button>
                    {bookingState.selectedBranch && (
                      <button onClick={() => setBookingState({ ...bookingState, step: 5 })} className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f]">
                        {t('next_step')}
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step 5: Confirm Details */}
              {bookingState.step === 5 && (
                <div className="animate-fade-in bg-[#141414] p-8 rounded-xl border border-[#2a2a2a]">
                  <h2 className="text-xl font-black uppercase tracking-widest mb-6 text-start">{t('client_details')}</h2>
                  
                  <div className="bg-[#1c1c1c] border border-[#2a2a2a] border-l-4 border-l-[#d32f2f] rounded-r-lg p-4 mb-4 flex items-start gap-3 text-start">
                    <div className="text-[#d32f2f] mt-0.5">
                      <CheckCircle2 size={18} />
                    </div>
                    <p className="text-[#a3a3a3] text-xs leading-relaxed font-medium">
                      {t('whatsapp_notice')}
                    </p>
                  </div>

                  <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-l-4 border-l-amber-600 rounded-r-lg p-4 mb-8 flex items-start gap-3 text-start">
                    <div className="text-amber-600 mt-0.5 shrink-0">
                      <Clock size={16} />
                    </div>
                    <p className="text-[#a3a3a3] text-xs leading-relaxed font-medium">
                      {t('cancel_notice')}
                      <span className="text-[#d32f2f] font-bold mx-1" dir="ltr">
                        +20 11* *** ****
                      </span>
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
                      onClick={() => setBookingState({ ...bookingState, step: 4 })} 
                      className="text-xs text-[#a3a3a3] font-bold uppercase tracking-wider hover:text-white transition-colors cursor-pointer text-start"
                      disabled={isSubmitting}
                    >
                      {lang === 'ar' ? "← العودة للفرع" : "← Back to Branch"}
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

            {/* RIGHT COLUMN: Sticky Categorized Summary Cart */}
            <div className="w-full lg:w-80 relative flex-shrink-0 mt-8 lg:mt-0">
              <div className="bg-[#141414] p-6 rounded-xl border border-[#2a2a2a] sticky top-24 shadow-lg">
                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-5 border-b border-[#2a2a2a] pb-3 text-start">
                  {t('summary')}
                </h3>
                
                {hasSelectedSomething ? (
                  <div className="space-y-4">
                    
                    {/* Render Category Blocks Dynamically for Multi-Services mapping */}
                    {bookingState.selectedServices.length > 0 && Object.entries(groupedSelectedServices).map(([categoryName, itemsList]) => (
                      <div key={categoryName} className="text-start border-b border-[#2a2a2a]/40 pb-3 last:border-0 last:pb-0">
                        <span className="block text-[10px] font-bold text-[#d32f2f] uppercase tracking-widest mb-1.5">
                          {categoryName}
                        </span>
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

                    {/* Render Package Single Row Layout */}
                    {bookingState.selectedPackage && (
                      <div className="text-start animate-fade-in">
                        <span className="block text-[10px] font-bold text-[#d32f2f] uppercase tracking-widest mb-1">
                          {t('tab_packages')}
                        </span>
                        <div className="flex justify-between items-start text-xs font-bold text-white">
                          <span className="leading-snug">{lang === 'ar' ? bookingState.selectedPackage.nameAr : bookingState.selectedPackage.nameEn}</span>
                          <span className="text-gray-400 font-medium">{bookingState.selectedPackage.price} {t('currency')}</span>
                        </div>
                      </div>
                    )}
                    
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

                    {bookingState.selectedBranch && (
                      <div className="text-start border-t border-[#2a2a2a] pt-4 animate-fade-in">
                        <span className="block text-[10px] font-bold text-[#a3a3a3] uppercase tracking-wider mb-1">
                          {lang === 'ar' ? "الفرع" : "Branch"}
                        </span>
                        <span className="text-white text-sm font-bold block">
                          {lang === 'ar' ? bookingState.selectedBranch.nameAr : bookingState.selectedBranch.nameEn}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between border-t border-[#2a2a2a] pt-5 mt-5 text-start">
                      <span className="font-black uppercase tracking-wider">{t('total')}</span>
                      <span className="font-black text-xl text-white">
                        {calculateTotalPrice()} <span className="text-[#d32f2f] text-sm">{t('currency')}</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[#555] text-xs font-medium text-center py-4 flex items-center justify-center gap-2 mt-4">
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