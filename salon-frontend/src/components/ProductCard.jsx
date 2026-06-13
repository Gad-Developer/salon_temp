import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const ProductCard = ({ product, lang, t }) => {
  const navigate = useNavigate();

  return (
    <div className="min-w-[280px] sm:min-w-[320px] lg:min-w-[350px] h-[350px] sm:h-[400px] lg:h-[450px] rounded-2xl overflow-hidden relative group cursor-pointer border border-[#2a2a2a] bg-black snap-center shrink-0">
      
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={product.image} 
          alt={lang === 'ar' ? product.nameAr : product.nameEn} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-100 group-hover:opacity-90"
          loading="lazy"
        />
      </div>

      {/* Floating Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent p-5 lg:p-6 flex flex-col justify-end transition-all duration-500">
        
        {/* Brand Badge */}
        <div className="absolute top-4 left-4 bg-[#d32f2f] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
          {product.brand}
        </div>

        <div className="transition-all duration-500 translate-y-2 group-hover:translate-y-0">
          <h3 className="text-lg lg:text-xl font-black text-white uppercase leading-tight mb-2">
            {lang === 'ar' ? product.nameAr : product.nameEn}
          </h3>
          
          <p className="text-[#a3a3a3] text-xs lg:text-sm mb-5 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
             {lang === 'ar' ? product.taglineAr : product.taglineEn}
          </p>

          <button 
            onClick={() => navigate('/products', { state: { preselectId: product._id } })}
            className="w-full block text-center bg-transparent border border-[#333] group-hover:border-[#d32f2f] group-hover:bg-[#d32f2f] text-white py-2 lg:py-2.5 rounded-lg font-bold text-[10px] lg:text-xs uppercase tracking-wider transition-all"
          >
            {t('order_now')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;