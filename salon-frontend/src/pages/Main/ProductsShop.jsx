import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';

const ProductsShop = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Cart maps productId to quantity: { "1": 2, "3": 1 }
  const [cart, setCart] = useState({});
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    // Simulated Fetch - Will replace with real API call in Phase 2
    const fetchProducts = () => {
      axios.get('/api/products')
        .then(res => {
            setProducts(res.data);
            setIsLoading(false);
        })
        .catch(err => {
            console.error("Error fetching products:", err);
            setIsLoading(false);
        });

      // If user clicked a specific product from the homepage, add it to cart automatically
      if (location.state?.preselectId) {
        setCart({ [location.state.preselectId]: 1 });
      }
    };
    
    fetchProducts();
  }, [location.state]);

  const updateQuantity = (productId, delta) => {
    setCart(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;
      
      if (newQty <= 0) {
        const { [productId]: _, ...rest } = prev; // Remove item from cart
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

  const handleConfirmOrder = async () => {
    if (Object.keys(cart).length === 0) return;
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
      items: orderItems,
      totalPrice: calculateTotal()
    };

    try {
      await axios.post('/api/orders', payload); // Real API call for Phase 2
      setTimeout(() => {
        setIsSuccess(true);
        setIsSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Order failed:", error);
      alert(lang === 'ar' ? 'فشل الطلب. حاول مرة أخرى.' : 'Order failed. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen bg-[#0a0a0a] text-[#d32f2f] pt-28 text-center text-sm font-medium animate-pulse">{t('loading')}</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-12 px-4 sm:px-6 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8 mt-6">
        
        {isSuccess ? (
          /* SUCCESS UI */
          <div className="w-full max-w-2xl mx-auto bg-[#141414] p-10 rounded-xl border border-[#2a2a2a] text-center mt-8 shadow-2xl">
            <div className="w-20 h-20 bg-[#d32f2f]/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#d32f2f]/30">
              <CheckCircle2 size={40} className="text-[#d32f2f]" />
            </div>
            <h2 className="text-3xl font-black uppercase mb-3">{t('order_success_title')}</h2>
            <p className="text-[#a3a3a3] mb-8 text-sm leading-relaxed max-w-md mx-auto">
              {t('order_success_msg')}
            </p>
            <Link to="/" className="bg-[#d32f2f] text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-red-700 transition-all inline-block border border-[#d32f2f]">
              {t('return_home')}
            </Link>
          </div>
        ) : (
          <>
            {/* LEFT COLUMN: Products List */}
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
                      
                      {/* Add to Cart / Quantity Controls */}
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

            {/* RIGHT COLUMN: Sticky Cart & Checkout Form */}
            <div className="w-full lg:w-[350px] relative flex-shrink-0 mt-8 lg:mt-0">
              <div className="bg-[#141414] p-6 rounded-xl border border-[#2a2a2a] sticky top-24 shadow-lg flex flex-col h-auto max-h-[85vh] overflow-y-auto custom-scrollbar">
                
                <div className="flex items-center gap-2 mb-5 border-b border-[#2a2a2a] pb-3 text-start">
                  <ShoppingBag size={18} className="text-[#d32f2f]" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">{t('your_cart')}</h3>
                </div>
                
                {Object.keys(cart).length === 0 ? (
                  <p className="text-[#555] text-xs font-medium text-center py-6 border border-dashed border-[#333] rounded-lg mb-6">
                    {t('cart_empty')}
                  </p>
                ) : (
                  <div className="space-y-4 mb-6 text-start">
                    {Object.entries(cart).map(([id, qty]) => {
                      const p = products.find(prod => prod._id === id);
                      if (!p) return null;
                      return (
                        <div key={id} className="flex justify-between items-start gap-3 border-b border-[#2a2a2a] pb-3 last:border-0 last:pb-0">
                          <div className="flex-1 min-w-0">
                            <span className="text-white text-xs font-bold leading-tight block truncate">
                              {lang === 'ar' ? p.nameAr : p.nameEn}
                            </span>
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
                  </div>
                )}

                {/* Client Details Form */}
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 border-b border-[#2a2a2a] pb-3 text-start mt-4">
                  {t('checkout_details')}
                </h3>
                
                <div className="bg-[#1c1c1c] border border-[#2a2a2a] border-l-4 border-l-[#d32f2f] rounded-r-lg p-3 mb-5 flex items-start gap-2 text-start">
                  <CheckCircle2 size={14} className="text-[#d32f2f] mt-0.5 shrink-0" />
                  <p className="text-[#a3a3a3] text-[10px] leading-relaxed font-medium">
                    {t('whatsapp_notice')}
                  </p>
                </div>

                <div className="space-y-4 mb-6">
                  <div className="text-start">
                    <input 
                      type="text" 
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder={t('full_name')}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#d32f2f] transition-colors"
                      disabled={isSubmitting || Object.keys(cart).length === 0}
                    />
                  </div>
                  <div className="text-start">
                    <input 
                      type="tel" 
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder={t('whatsapp_number')}
                      className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg p-3 text-xs text-white focus:outline-none focus:border-[#d32f2f] transition-colors text-left"
                      dir="ltr"
                      disabled={isSubmitting || Object.keys(cart).length === 0}
                    />
                  </div>
                </div>

                <button 
                  onClick={handleConfirmOrder} 
                  disabled={isSubmitting || Object.keys(cart).length === 0}
                  className={`w-full py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border mt-auto ${
                    isSubmitting || Object.keys(cart).length === 0
                      ? 'bg-[#333] border-[#333] text-[#a3a3a3] cursor-not-allowed' 
                      : 'bg-[#d32f2f] border-[#d32f2f] text-white hover:bg-red-700 shadow-lg shadow-red-900/20'
                  }`}
                >
                  {isSubmitting ? t('processing') : t('confirm_order')}
                </button>

              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default ProductsShop;