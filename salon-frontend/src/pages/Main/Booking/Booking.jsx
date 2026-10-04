import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../../../utils/LanguageContext';
import { X } from 'lucide-react'; // Added Receipt and X icons
import { GiBeard } from "react-icons/gi";
import PageTransition from '../../../components/PageTransition';
import { motion, AnimatePresence } from 'framer-motion';

// Extracted Components
import Stepper from './components/Stepper';
import Step1Services from './components/Step1Services';
import Step2Professional from './components/Step2Professional';
import Step3DateTime from './components/Step3DateTime';
import Step4Branch from './components/Step4Branch';
import Step5Confirm from './components/Step5Confirm';
import SuccessView from './components/SuccessView';
import BookingSummary from './components/BookingSummary';

const Booking = () => {
  const { t, lang } = useLanguage();
  
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [serviceTab, setServiceTab] = useState('services'); 

  // Mobile layout state
  const [isMobile, setIsMobile] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);

  const [bookingState, setBookingState] = useState({
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

  // Handle screen resize detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      let updatedServices = exists 
        ? prev.selectedServices.filter(s => s.serviceId !== serviceItem._id)
        : [...prev.selectedServices, { serviceId: serviceItem._id, nameEn: serviceItem.nameEn, nameAr: serviceItem.nameAr, categoryTitleEn: categoryTitleEn, price: serviceItem.price }];

      return {
        ...prev,
        selectedServices: updatedServices,
        selectedPackage: null, 
        selectedProfessional: null,
        selectedDate: null,
        selectedTime: null,
        selectedBranch: null
      };
    });
  };

  const handleSelectProfessional = (prof) => setBookingState(prev => ({ ...prev, selectedProfessional: prof }));
  const handleSelectBranch = (branch) => setBookingState(prev => ({ ...prev, selectedBranch: branch }));
  
  const handleSelectPackage = (pkgItem) => {
    setBookingState(prev => ({
      ...prev,
      selectedPackage: prev.selectedPackage?._id === pkgItem._id ? null : pkgItem,
      selectedServices: [], 
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

  const hasSelectedSomething = bookingState.selectedServices.length > 0 || bookingState.selectedPackage;

  const handleStepClick = (targetStep) => {
    if (bookingState.step === 6) return; 
    if (targetStep < bookingState.step) {
      setBookingState({ ...bookingState, step: targetStep });
    } else if (targetStep > bookingState.step) {
      if (bookingState.step === 1 && hasSelectedSomething) setBookingState({ ...bookingState, step: targetStep });
      else if (bookingState.step === 2 && bookingState.selectedProfessional) setBookingState({ ...bookingState, step: targetStep });
      else if (bookingState.step === 3 && bookingState.selectedTime) setBookingState({ ...bookingState, step: targetStep });
      else if (bookingState.step === 4 && bookingState.selectedBranch) setBookingState({ ...bookingState, step: targetStep });
    }
  };

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
      setIsSummaryModalOpen(false); // Close modal on success
    } catch (error) {
      alert(lang === 'ar' ? 'فشل الحجز. حاول مرة أخرى.' : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetBooking = () => {
    setBookingState({ step: 1, selectedServices: [], selectedPackage: null, selectedProfessional: null, selectedDate: null, selectedTime: null, selectedBranch: null, clientName: '', clientPhone: '' });
  };

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-[#d32f2f] pt-28 px-6 text-center text-sm font-medium animate-pulse">{t('loading')}</div>;

  return (
    <PageTransition className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* MOBILE FLOATING SUMMARY BUTTON */}
      {isMobile && bookingState.step !== 6 && hasSelectedSomething && (
        <button 
          onClick={() => setIsSummaryModalOpen(true)}
          // Swapped 'right-4' for Arabic and 'left-4' for English
          className={`fixed top-24 ${lang === 'ar' ? 'right-4' : 'left-4'} z-40 bg-[#d32f2f] text-white p-3 rounded-full shadow-[0_5px_20px_rgba(211,47,47,0.4)] flex items-center justify-center hover:scale-105 transition-transform`}
        >
          <GiBeard size={24} />
        </button>
      )}

      {/* MOBILE SUMMARY POPUP OVERLAY */}
      {isMobile && isSummaryModalOpen && bookingState.step !== 6 && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 animate-fade-in">
          <div className="bg-[#141414] w-full max-w-md max-h-[85vh] rounded-t-3xl sm:rounded-2xl border border-[#2a2a2a] relative flex flex-col p-5 sm:p-6 shadow-2xl overflow-y-auto custom-scrollbar">
            <button onClick={() => setIsSummaryModalOpen(false)} className="absolute top-5 right-5 sm:top-4 sm:right-4 text-[#a3a3a3] hover:text-white transition-colors z-20">
              <X size={24} />
            </button>
            <BookingSummary bookingState={bookingState} hasSelectedSomething={hasSelectedSomething} calculateTotalPrice={calculateTotalPrice} t={t} lang={lang} isModal={true} />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-6">
        {bookingState.step === 6 ? (
          <SuccessView bookingState={bookingState} resetBooking={resetBooking} t={t} lang={lang} />
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <Stepper step={bookingState.step} handleStepClick={handleStepClick} hasSelectedSomething={hasSelectedSomething} bookingState={bookingState} t={t} lang={lang} />

              <AnimatePresence mode="wait">
                <motion.div
                  key={bookingState.step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {bookingState.step === 1 && <Step1Services categories={categories} packages={packages} serviceTab={serviceTab} setServiceTab={setServiceTab} bookingState={bookingState} handleSelectService={handleSelectService} handleSelectPackage={handleSelectPackage} hasSelectedSomething={hasSelectedSomething} setBookingState={setBookingState} t={t} lang={lang} />}
                  {bookingState.step === 2 && <Step2Professional professionals={professionals} bookingState={bookingState} handleSelectProfessional={handleSelectProfessional} setBookingState={setBookingState} t={t} lang={lang} />}
                  {bookingState.step === 3 && <Step3DateTime bookingState={bookingState} setBookingState={setBookingState} t={t} lang={lang} />}
                  {bookingState.step === 4 && <Step4Branch branches={branches} bookingState={bookingState} handleSelectBranch={handleSelectBranch} setBookingState={setBookingState} t={t} lang={lang} />}
                  {bookingState.step === 5 && <Step5Confirm bookingState={bookingState} setBookingState={setBookingState} handleConfirmBooking={handleConfirmBooking} isSubmitting={isSubmitting} calculateTotalPrice={calculateTotalPrice} t={t} lang={lang} />}
                </motion.div>
              </AnimatePresence>
            </div> 
            
            {/* Renders normally on Desktop, hidden on mobile */}
            <BookingSummary bookingState={bookingState} hasSelectedSomething={hasSelectedSomething} calculateTotalPrice={calculateTotalPrice} t={t} lang={lang} />
          </>
        )}
      </div>
      </div>
    </PageTransition>
  );
};

export default Booking;