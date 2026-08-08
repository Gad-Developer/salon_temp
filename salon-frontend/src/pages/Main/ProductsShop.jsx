import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, MapPin, Phone, ArrowLeft, ArrowRight, CalendarDays, Check } from 'lucide-react';

const ProductsShop = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Expanded to 4 steps: 1=Cart, 2=Branch, 3=Time, 4=Confirm
  const [shopStep, setShopStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);

  const [cart, setCart] = useState({});
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const [prodRes, branchRes] = await Promise.all([
          axios.get('/api/products'),
          axios.get('/api/branches')
        ]);
        setProducts(prodRes.data);
        setBranches(branchRes.data || []);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching store data:", err);
        setIsLoading(false);
      }

      if (location.state?.preselectId) {
        setCart({ [location.state.preselectId]: 1 });
      }
    };
    
    fetchStoreData();
  }, [location.state]);

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;
      
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const calculateTotal = () => {
    return Object.entries(cart).reduce((total, [id, qty]) => {
      const product = products.find(p => p._id === id);
      return total + (product ? product.price * qty : 0);
    }, 0);
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

  const handleConfirmOrder = async () => {
    if (Object.keys(cart).length === 0 || !selectedBranch || !selectedDate || !selectedTime) return;
    if (!clientName || !clientPhone) {
      alert(lang === 'ar' ? 'يرجى إدخال جميع البيانات' : 'Please fill in all details');
      return;
    }

    setIsSubmitting(true);

    const orderItems = Object.entries(cart).map(([id, quantity]) => ({
      productId: id,
      quantity
    }));

    const payload = {
      clientName,
      clientPhone,
      branchId: selectedBranch._id,
      date: selectedDate,
      time: selectedTime,
      items: orderItems,
      totalPrice: calculateTotal()
    };

    try {
      await axios.post('/api/orders', payload);
      setIsSuccess(true);
    } catch (error) {
      console.error("Order failed:", error);
      alert(lang === 'ar' ? 'فشل الطلب. حاول مرة أخرى.' : 'Order failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-[#d32f2f] pt-28 text-center text-sm font-medium animate-pulse">{t('loading')}</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-6">
        
        {isSuccess ? (
          <div className="w-full max-w-2xl mx-auto bg-[#141414] p-10 rounded-xl border border-[#2a2a2a] text-center mt-8 shadow-2xl">
            <div className="w-20 h-20 bg-[#d32f2f]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d32f2f]/30">
              <CheckCircle2 size={40} className="text-[#d32f2f]" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-3">{t('order_success_title')}</h2>
            <p className="text-[#a3a3a3] mb-6 text-sm leading-relaxed max-w-md mx-auto">
              {t('order_success_msg')}
            </p>

            <div className="bg-[#1c1c1c] border border-[#333] rounded-lg p-6 mb-8 text-start max-w-sm mx-auto space-y-3">
              <div>
                <p className="text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-0.5">{lang === 'ar' ? 'فرع الاستلام' : 'Pickup Branch'}</p>
                <p className="font-bold text-base text-white">{lang === 'ar' ? selectedBranch?.nameAr : selectedBranch?.nameEn}</p>
              </div>
              <div className="border-t border-[#2a2a2a] pt-2">
                <p className="text-[10px] text-[#a3a3a3] uppercase tracking-wider mb-0.5">{lang === 'ar' ? 'وقت الاستلام' : 'Pickup Time'}</p>
                <p className="font-bold text-lg text-white">{selectedDate} <span className="text-[#d32f2f]">{selectedTime}</span></p>
              </div>
            </div>

            <Link to="/" className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-red-700 transition-all inline-block border border-[#d32f2f]">
              {t('return_home')}
            </Link>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Products Grid */}
            <div className="flex-1 min-w-0">
              <div className="mb-8">
                <h2 className="text-3xl font-black uppercase tracking-widest text-start">{t('shop_title')}</h2>
                <div className="w-16 h-1 bg-[#d32f2f] mt-3 rounded-full"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products.map((product) => (
                  <div key={product._id} className="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden flex flex-col group hover:border-[#d32f2f] transition-all">
                    <div className="h-48 relative bg-black overflow-hidden">
                      <img src={product.image} alt={product.nameEn} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-all duration-500" />
                      <div className="absolute top-3 left-3 bg-[#d32f2f] text-white text-[10px] font-bold px-2 py-1 rounded uppercase">
                        {product.brand}
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow text-start">
                      <h3 className="font-bold text-white mb-1 leading-tight">{lang === 'ar' ? product.nameAr : product.nameEn}</h3>
                      <span className="text-[#d32f2f] font-bold text-lg mb-4 mt-auto">
                        {product.price} <span className="text-xs">{t('currency')}</span>
                      </span>
                      
                      {cart[product._id] ? (
                        <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#333] rounded-lg p-1 w-full">
                          <button onClick={() => updateQuantity(product._id, -1)} className="w-10 h-8 flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors">
                            {cart[product._id] === 1 ? <Trash2 size={16} className="text-red-500" /> : <Minus size={16} />}
                          </button>
                          <span className="font-bold text-sm w-8 text-center">{cart[product._id]}</span>
                          <button onClick={() => updateQuantity(product._id, 1)} className="w-10 h-8 flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors">
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => updateQuantity(product._id, 1)}
                          className="w-full bg-transparent border border-[#333] hover:border-[#d32f2f] hover:bg-[#d32f2f] text-white py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all"
                        >
                          {t('add_to_cart')}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: 4-Phase Multi-Step Sidebar Checkout Flow */}
            <div className="w-full lg:w-[380px] relative flex-shrink-0 mt-8 lg:mt-0">
              <div className="bg-[#141414] p-6 rounded-xl border border-[#2a2a2a] sticky top-24 shadow-lg flex flex-col h-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                
                {/* Visual Step Stepper Progress Indicators */}
                <div className="flex justify-between items-center mb-6 border-b border-[#2a2a2a] pb-4 relative">
                   <div className="absolute left-0 top-3 -translate-y-1/2 w-full h-[1px] bg-[#333] z-0">
                     <div className="h-full bg-[#d32f2f] transition-all duration-500" style={{ width: `${((shopStep - 1) / 3) * 100}%` }}></div>
                   </div>
                  {[1, 2, 3, 4].map((stepNum) => {
                     const isPast = shopStep > stepNum;
                     const isActive = shopStep === stepNum;
                     return (
                      <div key={stepNum} className="relative z-10 flex flex-col items-center gap-1">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border bg-[#141414] ${
                          isActive ? 'border-[#d32f2f] text-[#d32f2f] shadow-[0_0_10px_rgba(211,47,47,0.3)]' : 
                          isPast ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'border-[#333] text-[#555]'
                        }`}>
                          {isPast ? <Check size={12} strokeWidth={4} /> : stepNum}
                        </div>
                      </div>
                     );
                  })}
                </div>

                {/* PHASE 1: CART */}
                {shopStep === 1 && (
                  <div className="animate-fade-in flex flex-col h-full text-start">
                    <div className="flex items-center gap-2 mb-4">
                      <ShoppingBag size={16} className="text-[#d32f2f]" />
                      <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('your_cart')}</h3>
                    </div>

                    {Object.keys(cart).length === 0 ? (
                      <p className="text-[#555] text-xs font-medium text-center py-10 border border-dashed border-[#333] rounded-lg mb-4">
                        {t('cart_empty')}
                      </p>
                    ) : (
                      <div className="space-y-4 mb-6">
                        {Object.entries(cart).map(([id, qty]) => {
                          const p = products.find(prod => prod._id === id);
                          if (!p) return null;
                          return (
                            <div key={id} className="flex justify-between items-start gap-3 border-b border-[#2a2a2a] pb-3 last:border-0 last:pb-0">
                              <div className="flex-1 min-w-0">
                                <span className="text-white text-xs font-bold leading-tight block truncate">{lang === 'ar' ? p.nameAr : p.nameEn}</span>
                                <span className="text-[#a3a3a3] text-[10px]">x{qty} • {p.price} {t('currency')}</span>
                              </div>
                              <span className="text-white font-bold text-sm whitespace-nowrap">
                                {p.price * qty} <span className="text-[10px] text-[#d32f2f]">{t('currency')}</span>
                              </span>
                            </div>
                          );
                        })}
                        
                        <div className="flex justify-between bg-[#1a1a1a] p-3 rounded-lg mt-2">
                          <span className="font-black uppercase text-xs tracking-wider">{t('total')}</span>
                          <span className="font-black text-lg text-[#d32f2f]">
                            {calculateTotal()} <span className="text-[10px]">{t('currency')}</span>
                          </span>
                        </div>

                        <button onClick={() => setShopStep(2)} className="w-full bg-[#d32f2f] hover:bg-red-700 text-white py-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 mt-4">
                          {lang === 'ar' ? 'اختر الفرع' : 'Select Branch'} <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* PHASE 2: BRANCH */}
                {shopStep === 2 && (
                  <div className="animate-fade-in text-start">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
                      {lang === 'ar' ? 'اختر فرع الاستلام' : 'Select Pickup Branch'}
                    </h3>

                    <div className="space-y-4 mb-6">
                      {branches.filter(b => b.isActive).map((branch) => {
                        const isSelected = selectedBranch?._id === branch._id;
                        return (
                          <div key={branch._id} onClick={() => setSelectedBranch(branch)} className={`bg-[#0a0a0a] rounded-xl border transition-all duration-300 overflow-hidden cursor-pointer flex flex-col ${isSelected ? 'border-[#d32f2f] shadow-[0_5px_15px_rgba(211,47,47,0.1)]' : 'border-[#2a2a2a] hover:border-[#d32f2f]'}`}>
                            <div className="p-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-bold text-white">{lang === 'ar' ? branch.nameAr : branch.nameEn}</span>
                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-[#d32f2f] bg-[#d32f2f]' : 'border-[#444]'}`}>
                                  {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </div>
                              </div>
                              <div className="flex items-start gap-2 text-[11px] text-[#a3a3a3]">
                                <MapPin size={12} className="text-[#d32f2f] shrink-0 mt-0.5" />
                                <p className="truncate">{lang === 'ar' ? branch.addressAr : branch.addressEn}</p>
                              </div>
                            </div>
                            
                            {/* RESTORED: Active Map View Embed Frame */}
                            <div className="w-full h-32 bg-[#050505] border-t border-[#2a2a2a]">
                              <iframe
                                title={branch.nameEn}
                                src={branch.mapUrl}
                                className={`w-full h-full border-0 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-30'}`}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                              ></iframe>
                            </div>

                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-3 mt-4">
                      <button onClick={() => setShopStep(1)} className="flex-1 py-2.5 bg-transparent border border-[#333] text-[#a3a3a3] hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft size={14} className={lang === 'ar' ? 'rotate-180' : ''} /> {lang === 'ar' ? 'السابق' : 'Back'}
                      </button>
                      <button disabled={!selectedBranch} onClick={() => setShopStep(3)} className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${selectedBranch ? 'bg-[#d32f2f] text-white hover:bg-red-700' : 'bg-[#333] text-[#555] cursor-not-allowed border-transparent'}`}>
                        {lang === 'ar' ? 'التالي' : 'Next'} <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 3: CALENDAR & TIME (NEW) */}
                {shopStep === 3 && (
                  <div className="animate-fade-in text-start">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
                      {lang === 'ar' ? 'وقت الاستلام' : 'Pickup Time'}
                    </h3>
                    
                    <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
                      {generateDates().map((d, i) => (
                        <div key={i} onClick={() => { setSelectedDate(d.fullDate); setSelectedTime(null); }} className={`min-w-[65px] p-3 rounded-lg border cursor-pointer text-center transition-all ${selectedDate === d.fullDate ? 'bg-[#141414] border-[#d32f2f] text-white' : 'bg-[#0a0a0a] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#d32f2f]'}`}>
                          <span className="block text-[9px] font-bold uppercase tracking-widest mb-1">{d.day}</span>
                          <span className={`block text-xl font-black mb-1 ${selectedDate === d.fullDate ? 'text-[#d32f2f]' : ''}`}>{d.date}</span>
                        </div>
                      ))}
                    </div>

                    {selectedDate && (
                      <div className="grid grid-cols-2 gap-2 mb-6">
                        {timeSlots.map((time) => (
                          <div key={time} onClick={() => setSelectedTime(time)} className={`p-2.5 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${selectedTime === time ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-[#0a0a0a] border-[#2a2a2a] text-[#a3a3a3] hover:border-[#d32f2f]'}`}>
                            {time}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button onClick={() => setShopStep(2)} className="flex-1 py-2.5 bg-transparent border border-[#333] text-[#a3a3a3] hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft size={14} className={lang === 'ar' ? 'rotate-180' : ''} /> {lang === 'ar' ? 'السابق' : 'Back'}
                      </button>
                      <button disabled={!selectedTime} onClick={() => setShopStep(4)} className={`flex-1 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${selectedTime ? 'bg-[#d32f2f] text-white hover:bg-red-700' : 'bg-[#333] text-[#555] cursor-not-allowed border-transparent'}`}>
                        {lang === 'ar' ? 'التالي' : 'Next'} <ArrowRight size={14} className={lang === 'ar' ? 'rotate-180' : ''} />
                      </button>
                    </div>
                  </div>
                )}

                {/* PHASE 4: CHECKOUT FORM */}
                {shopStep === 4 && (
                  <div className="animate-fade-in text-start">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">
                      {t('checkout_details')}
                    </h3>
                    
                    {/* RESTORED: WhatsApp Notice */}
                    <div className="bg-[#1c1c1c] border border-[#2a2a2a] border-l-4 border-l-[#d32f2f] rounded-r-lg p-3 mb-4 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-[#d32f2f] mt-0.5 shrink-0" />
                      <p className="text-[#a3a3a3] text-[10px] leading-relaxed font-medium">
                        {t('whatsapp_notice')}
                      </p>
                    </div>

                    {/* Integrated Cancellation Warning Parameter Block Context */}
                    <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-l-4 border-l-amber-600 rounded-r-lg p-3 mb-5 flex items-start gap-2">
                      <CheckCircle2 size={14} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-[#a3a3a3] text-[10px] leading-relaxed font-medium">
                        {t('cancel_notice')} <span className="text-[#d32f2f] font-bold" dir="ltr">+20 11* *** ****</span>
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={t('full_name')} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#d32f2f]" disabled={isSubmitting} />
                      <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder={t('whatsapp_number')} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#d32f2f] text-left" dir="ltr" disabled={isSubmitting} />
                    </div>

                    <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-3 rounded-lg text-xs space-y-1.5 mb-6">
                      <div className="flex justify-between text-gray-400">
                        <span>{lang === 'ar' ? 'الفرع:' : 'Branch:'}</span>
                        <span className="text-white font-semibold">{lang === 'ar' ? selectedBranch?.nameAr : selectedBranch?.nameEn}</span>
                      </div>
                      <div className="flex justify-between text-gray-400">
                        <span>{lang === 'ar' ? 'الوقت:' : 'Time:'}</span>
                        <span className="text-white font-semibold">{selectedDate} <span className="text-[#d32f2f]">{selectedTime}</span></span>
                      </div>
                      <div className="flex justify-between border-t border-[#2a2a2a] pt-1.5 text-gray-400 font-bold">
                        <span>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                        <span className="text-[#d32f2f]">{calculateTotal()} {t('currency')}</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button disabled={isSubmitting} onClick={() => setShopStep(3)} className="flex-1 py-2.5 bg-transparent border border-[#333] text-[#a3a3a3] hover:text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1">
                        <ArrowLeft size={14} className={lang === 'ar' ? 'rotate-180' : ''} /> {lang === 'ar' ? 'السابق' : 'Back'}
                      </button>
                      <button onClick={handleConfirmOrder} disabled={isSubmitting || !clientName || !clientPhone} className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${isSubmitting || !clientName || !clientPhone ? 'bg-[#333] border-[#333] text-[#a3a3a3] cursor-not-allowed' : 'bg-[#d32f2f] border-[#d32f2f] text-white hover:bg-red-700'}`}>
                        {isSubmitting ? t('processing') : t('confirm_order')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default ProductsShop;