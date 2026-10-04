import React from 'react';
import { useNavigate } from 'react-router-dom';
import defaultProductImg from '../assets/temp-service.svg';

const ProductCard = ({ product, lang, t }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[260px] sm:h-[350px] lg:h-[400px] rounded-xl sm:rounded-2xl overflow-hidden relative group cursor-pointer border border-[#2a2a2a] bg-[#141414] transition-all hover:border-[#d32f2f]">
      
      {/* Background Image */}
      <div className="absolute inset-0 bg-[#0a0a0a]">
        <img 
          src={product.image && product.image.trim() !== '' ? product.image : defaultProductImg} 
          alt={lang === 'ar' ? product.nameAr : product.nameEn} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = defaultProductImg;
          }}
        />
      </div>

      {/* Floating Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent p-3 sm:p-5 flex flex-col justify-end">
        
        {/* Brand Badge - Positioned dynamically based on RTL/LTR */}
        <div className={`absolute top-3 ${lang === 'ar' ? 'right-3' : 'left-3'} bg-[#d32f2f] text-white text-[8px] sm:text-[10px] font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-wider shadow-lg`}>
          {product.brand}
        </div>

        <div className="flex flex-col justify-end mt-auto z-10">
          <h3 className="text-xs sm:text-base lg:text-lg font-black text-white uppercase leading-tight mb-2 sm:mb-3 line-clamp-2 group-hover:text-[#d32f2f] transition-colors">
            {lang === 'ar' ? product.nameAr : product.nameEn}
          </h3>
          
          {/* Tagline: Hidden on mobile to save space, visible on large screens inside hover */}
          <p className="text-[#a3a3a3] text-xs mb-4 line-clamp-2 hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto">
             {lang === 'ar' ? product.taglineAr : product.taglineEn}
          </p>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/products', { state: { preselectId: product._id } });
            }}
            className="w-full block text-center bg-[#1f1f1f] border border-[#333] group-hover:border-[#d32f2f] group-hover:bg-[#d32f2f] group-hover:text-white text-[#a3a3a3] py-1.5 sm:py-2.5 rounded font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-wider transition-all"
          >
            {t('order_now')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;