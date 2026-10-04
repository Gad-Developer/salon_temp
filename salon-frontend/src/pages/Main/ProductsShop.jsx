import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, MapPin, ArrowLeft, ArrowRight, CalendarDays, Check, X } from 'lucide-react';
import PageTransition from '../../components/PageTransition';

// ==========================================
// 1. EXTRACTED COMPONENT: Shop Item Card
// ==========================================
const ShopItemCard = ({ product, qty, updateQuantity, lang, t }) => (
  // h-[40vh] min-h-[220px] ensures exactly 2 rows fit inside a standard mobile screen height
  <div className="w-full h-[40vh] min-h-[220px] max-h-[280px] sm:max-h-none sm:h-[350px] lg:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden relative group cursor-pointer border border-[#2a2a2a] bg-[#1e1e1e]/40 backdrop-blur-md shadow-inner transition-all duration-300 hover:border-[#d32f2f] hover:shadow-[0_0_20px_rgba(211,47,47,0.15)]">
    
    <div className="absolute inset-0 bg-black/50">
      <img src={product.image} alt={product.nameEn} className="w-full h-full object-cover opacity-100 group-hover:opacity-95 group-hover:scale-105 transition-all duration-500" loading="lazy" />
    </div>

    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none"></div>
    <div className="absolute inset-0 p-3 sm:p-5 flex flex-col justify-end">
      <div className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} bg-[#d32f2f] text-white text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-lg`}>
        {product.brand}
      </div>

      <div className="flex flex-col justify-end mt-auto z-10">
        <h3 className="text-xs sm:text-base lg:text-lg font-black text-white uppercase leading-tight mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#d32f2f] transition-colors">
          {lang === 'ar' ? product.nameAr : product.nameEn}
        </h3>
        
        <p className="text-[#a3a3a3] text-xs mb-4 line-clamp-2 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
           {lang === 'ar' ? product.taglineAr : product.taglineEn}
        </p>

        <span className="text-[#d32f2f] font-bold text-sm sm:text-lg mb-3">
          {product.price} <span className="text-[10px] sm:text-xs">{t('currency')}</span>
        </span>
        
        {qty ? (
          <div className="flex items-center justify-between bg-[#0a0a0a] border border-[#333] rounded-lg p-1 w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => updateQuantity(product._id, -1)} className="w-8 h-7 sm:w-10 sm:h-8 flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors">
              {qty === 1 ? <Trash2 size={14} className="text-red-500" /> : <Minus size={14} />}
            </button>
            <span className="font-bold text-xs sm:text-sm w-6 sm:w-8 text-center">{qty}</span>
            <button onClick={() => updateQuantity(product._id, 1)} className="w-8 h-7 sm:w-10 sm:h-8 flex items-center justify-center text-[#a3a3a3] hover:text-white hover:bg-[#1a1a1a] rounded transition-colors">
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button 
            onClick={(e) => { e.stopPropagation(); updateQuantity(product._id, 1); }}
            className="w-full bg-[#1f1f1f] border border-[#333] hover:border-[#d32f2f] hover:bg-[#d32f2f] hover:text-white text-[#a3a3a3] py-2 sm:py-2.5 rounded font-bold text-[9px] sm:text-xs uppercase tracking-wider transition-all"
          >
            {t('add_to_cart')}
          </button>
        )}
      </div>
    </div>
  </div>
);

// ==========================================
// 2. MAIN COMPONENT: Products Shop
// ==========================================
const ProductsShop = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Checkout & UI State
  const [isMobile, setIsMobile] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [shopStep, setShopStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [cart, setCart] = useState({});
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Pagination State (Mobile = 6 items, Desktop = 4 items to balance grid)
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = isMobile ? 6 : 4; 

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        if (window.innerWidth < 1024) setIsCartModalOpen(true);
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
        if (Object.keys(rest).length === 0 && isMobile) setIsCartModalOpen(false); // Close modal if empty
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

  const totalItemsInCart = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        fullDate: d.toISOString().split('T')[0],
        day: d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { weekday: 'short' }),
        date: d.getDate(),
      });
    }
    return dates;
  };

  const timeSlots = ["10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "06:00 PM", "07:00 PM", "08:00 PM"];

  const handleConfirmOrder = async () => {
    if (Object.keys(cart).length === 0 || !selectedBranch || !selectedDate || !selectedTime) return;
    if (!clientName || !clientPhone) return alert(lang === 'ar' ? 'يرجى إدخال جميع البيانات' : 'Please fill in all details');

    setIsSubmitting(true);
    const payload = {
      clientName, clientPhone, branchId: selectedBranch._id, date: selectedDate, time: selectedTime,
      items: Object.entries(cart).map(([id, quantity]) => ({ productId: id, quantity })),
      totalPrice: calculateTotal()
    };

    try {
      await axios.post('/api/orders', payload);
      setIsSuccess(true);
    } catch (error) {
      alert(lang === 'ar' ? 'فشل الطلب. حاول مرة أخرى.' : 'Order failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==========================================
  // SHARED CHECKOUT UI (Used in Desktop Sidebar & Mobile Modal)
  // ==========================================
  const renderCheckoutFlow = () => (
    <div className="flex flex-col h-full">
      {/* Visual Step Stepper */}
      <div className="flex justify-between items-center mb-6 border-b border-[#2a2a2a] pb-4 relative">
        <div className="absolute left-0 top-3 -translate-y-1/2 w-full h-[1px] bg-[#333] z-0">
          <div className="h-full bg-[#d32f2f] transition-all duration-500" style={{ width: `${((shopStep - 1) / 3) * 100}%` }}></div>
        </div>
        {[1, 2, 3, 4].map((stepNum) => {
           const isPast = shopStep > stepNum;
           const isActive = shopStep === stepNum;
           return (
            <div key={stepNum} className="relative z-10 flex flex-col items-center">
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

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        {/* PHASE 1: CART */}
        {shopStep === 1 && (
          <div className="animate-fade-in flex flex-col h-full text-start">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={16} className="text-[#d32f2f]" />
              <h3 className="text-xs font-black text-white uppercase tracking-widest">{t('your_cart')}</h3>
            </div>

            {Object.keys(cart).length === 0 ? (
              <p className="text-[#555] text-xs font-medium text-center py-10 border border-dashed border-[#333] rounded-lg">
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
                        <span className="text-[#a3a3a3] text-[10px]">x{qty} • {p.price}</span>
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
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">{lang === 'ar' ? 'اختر فرع الاستلام' : 'Select Branch'}</h3>
            <div className="space-y-3 mb-6">
              {branches.filter(b => b.isActive).map((branch) => (
                <div key={branch._id} onClick={() => setSelectedBranch(branch)} className={`bg-[#0a0a0a] rounded-lg border p-3 cursor-pointer flex flex-col transition-colors ${selectedBranch?._id === branch._id ? 'border-[#d32f2f] shadow-[0_2px_10px_rgba(211,47,47,0.1)]' : 'border-[#2a2a2a] hover:border-[#d32f2f]'}`}>
                  <span className="text-xs font-bold text-white mb-1 line-clamp-1">{lang === 'ar' ? branch.nameAr : branch.nameEn}</span>
                  <div className="flex items-start gap-1 text-[10px] text-[#a3a3a3]">
                    <MapPin size={12} className="text-[#d32f2f] shrink-0 mt-0.5" />
                    <p className="truncate">{lang === 'ar' ? branch.addressAr : branch.addressEn}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShopStep(1)} className="flex-1 py-2.5 border border-[#333] text-[#a3a3a3] hover:text-white rounded-lg font-bold text-xs flex items-center justify-center"><ArrowLeft size={14} /></button>
              <button disabled={!selectedBranch} onClick={() => setShopStep(3)} className={`flex-[3] py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${selectedBranch ? 'bg-[#d32f2f] text-white' : 'bg-[#333] text-[#555]'}`}>Next</button>
            </div>
          </div>
        )}

        {/* PHASE 3: TIME */}
        {shopStep === 3 && (
          <div className="animate-fade-in text-start">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">{lang === 'ar' ? 'وقت الاستلام' : 'Pickup Time'}</h3>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
              {generateDates().map((d, i) => (
                <div key={i} onClick={() => { setSelectedDate(d.fullDate); setSelectedTime(null); }} className={`min-w-[65px] p-3 rounded-lg border cursor-pointer text-center transition-all ${selectedDate === d.fullDate ? 'bg-[#141414] border-[#d32f2f] text-white' : 'bg-[#0a0a0a] border-[#2a2a2a] text-[#a3a3a3]'}`}>
                  <span className="block text-[9px] font-bold uppercase mb-1">{d.day}</span>
                  <span className={`block text-xl font-black ${selectedDate === d.fullDate ? 'text-[#d32f2f]' : ''}`}>{d.date}</span>
                </div>
              ))}
            </div>
            {selectedDate && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                {timeSlots.map((time) => (
                  <div key={time} onClick={() => setSelectedTime(time)} className={`p-2.5 rounded-lg border text-xs font-bold text-center cursor-pointer transition-all ${selectedTime === time ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-[#0a0a0a] border-[#2a2a2a] text-[#a3a3a3]'}`}>
                    {time}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setShopStep(2)} className="flex-1 py-2.5 border border-[#333] text-[#a3a3a3] hover:text-white rounded-lg font-bold text-xs flex items-center justify-center"><ArrowLeft size={14} /></button>
              <button disabled={!selectedTime} onClick={() => setShopStep(4)} className={`flex-[3] py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all ${selectedTime ? 'bg-[#d32f2f] text-white' : 'bg-[#333] text-[#555]'}`}>Next</button>
            </div>
          </div>
        )}

        {/* PHASE 4: CHECKOUT FORM */}
        {shopStep === 4 && (
          <div className="animate-fade-in text-start pb-4">
            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">{t('checkout_details')}</h3>
            
            {/* RESTORED: WhatsApp Notice */}
            <div className="bg-[#1c1c1c] border border-[#2a2a2a] border-l-2 border-l-[#d32f2f] rounded-r-lg p-2.5 sm:p-3 mb-3 flex items-start gap-2">
              <CheckCircle2 size={12} className="text-[#d32f2f] mt-0.5 shrink-0" />
              <p className="text-[#a3a3a3] text-[9px] sm:text-[10px] leading-relaxed font-medium">
                {t('whatsapp_notice')}
              </p>
            </div>

            {/* RESTORED: Cancellation Warning */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] border-l-2 border-l-amber-600 rounded-r-lg p-2.5 sm:p-3 mb-5 flex items-start gap-2">
              <CheckCircle2 size={12} className="text-amber-600 mt-0.5 shrink-0" />
              <p className="text-[#a3a3a3] text-[9px] sm:text-[10px] leading-relaxed font-medium">
                {t('cancel_notice')} <span className="text-[#d32f2f] font-bold" dir="ltr">+20 11* *** ****</span>
              </p>
            </div>
            
            <div className="space-y-3 mb-6">
              <input type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder={t('full_name')} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#d32f2f]" disabled={isSubmitting} />
              <input type="tel" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder={t('whatsapp_number')} className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#d32f2f] text-left" dir="ltr" disabled={isSubmitting} />
            </div>

            <div className="bg-[#0a0a0a] border border-[#2a2a2a] p-3 rounded-lg text-xs space-y-2 mb-6">
              <div className="flex justify-between text-gray-400">
                <span>{lang === 'ar' ? 'الفرع:' : 'Branch:'}</span>
                <span className="text-white font-semibold line-clamp-1">{lang === 'ar' ? selectedBranch?.nameAr : selectedBranch?.nameEn}</span>
              </div>
              <div className="flex justify-between border-t border-[#2a2a2a] pt-2 text-gray-400 font-bold">
                <span>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</span>
                <span className="text-[#d32f2f]">{calculateTotal()} {t('currency')}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button disabled={isSubmitting} onClick={() => setShopStep(3)} className="flex-1 py-2.5 border border-[#333] text-[#a3a3a3] hover:text-white rounded-lg font-bold text-xs flex items-center justify-center"><ArrowLeft size={14} /></button>
              <button onClick={handleConfirmOrder} disabled={isSubmitting || !clientName || !clientPhone} className={`flex-[3] py-2.5 rounded-lg text-xs font-bold uppercase transition-all ${isSubmitting || !clientName || !clientPhone ? 'bg-[#333] text-[#a3a3a3]' : 'bg-[#d32f2f] text-white hover:bg-red-700'}`}>
                {isSubmitting ? t('processing') : t('confirm_order')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-[#d32f2f] pt-28 text-center text-sm font-medium animate-pulse">{t('loading')}</div>;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const currentProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  return (
    <PageTransition className="min-h-screen bg-[#0a0a0a] text-white pt-20 pb-12 px-4 sm:px-6 font-sans">
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* MOBILE FLOATING CART BUTTON (Language-aware positioning) */}
      {isMobile && !isSuccess && (
        <button 
          onClick={() => setIsCartModalOpen(true)}
          className={`fixed top-24 ${lang === 'ar' ? 'left-4' : 'right-4'} z-40 bg-[#d32f2f] text-white p-3.5 rounded-full shadow-[0_5px_20px_rgba(211,47,47,0.4)] flex items-center justify-center hover:scale-105 transition-transform`}
        >
          <ShoppingBag size={20} />
          {totalItemsInCart > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-white text-[#d32f2f] text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#d32f2f]">
              {totalItemsInCart}
            </span>
          )}
        </button>
      )}

      {/* MOBILE CART POPUP OVERLAY */}
      {isMobile && isCartModalOpen && !isSuccess && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-2 animate-fade-in">
          <div className="bg-[#121212]/90 backdrop-blur-xl w-full max-w-md h-[85vh] rounded-t-3xl sm:rounded-2xl border border-[#2a2a2a] relative flex flex-col p-5 sm:p-6 shadow-2xl">
            <button onClick={() => setIsCartModalOpen(false)} className="absolute top-5 right-5 sm:top-4 sm:right-4 text-[#a3a3a3] hover:text-white transition-colors z-20">
              <X size={24} />
            </button>
            {renderCheckoutFlow()}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto mt-4 sm:mt-6">
        {isSuccess ? (
          <div className="w-full max-w-2xl mx-auto bg-[#141414] p-8 sm:p-10 rounded-xl border border-[#2a2a2a] text-center mt-8 shadow-2xl">
            <div className="w-20 h-20 bg-[#d32f2f]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d32f2f]/30">
              <CheckCircle2 size={40} className="text-[#d32f2f]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase mb-3">{t('order_success_title')}</h2>
            <p className="text-[#a3a3a3] mb-6 text-xs sm:text-sm leading-relaxed max-w-md mx-auto">{t('order_success_msg')}</p>
            <Link to="/" className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-xs sm:text-sm font-bold hover:bg-red-700 transition-all inline-block border border-[#d32f2f]">
              {t('return_home')}
            </Link>
          </div>
        ) : (
          <div className="flex flex-row gap-8 w-full">
            
            {/* LEFT COLUMN: Products Grid (100% on Mobile, 70% on Desktop) */}
            <div className="w-full lg:flex-1 min-w-0">
              <div className="mb-6 sm:mb-8 text-start">
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-widest">{t('shop_title')}</h2>
                <div className="w-12 sm:w-16 h-1 bg-[#d32f2f] mt-3 rounded-full"></div>
              </div>

              {/* GRID: 2 Columns for both Mobile and Desktop */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {currentProducts.map((product) => (
                  <ShopItemCard key={product._id} product={product} qty={cart[product._id]} updateQuantity={updateQuantity} lang={lang} t={t} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8 sm:mt-10">
                  <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1f1f1f] border border-[#333] hover:border-[#d32f2f] disabled:opacity-50 transition-all">
                    <ArrowLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>
                  <span className="text-xs sm:text-sm font-bold mx-2">{currentPage} / {totalPages}</span>
                  <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1f1f1f] border border-[#333] hover:border-[#d32f2f] disabled:opacity-50 transition-all">
                    <ArrowRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                  </button>
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: Sidebar Checkout Flow (Hidden on Mobile) */}
            {!isMobile && (
              <div className="hidden lg:block w-[380px] relative flex-shrink-0">
                <div className="bg-[#121212]/80 backdrop-blur-xl p-6 rounded-2xl border border-[#2a2a2a] sticky top-24 shadow-2xl flex flex-col h-auto max-h-[85vh] overflow-hidden">
                  {renderCheckoutFlow()}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
      </div>
    </PageTransition>
  );
};

export default ProductsShop;