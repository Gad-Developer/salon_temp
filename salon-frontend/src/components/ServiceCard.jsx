import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import defaultServiceImg from '../assets/temp-service.svg';

const ServiceCard = ({ service, lang, t, isKids = false }) => {
  const [currentImg, setCurrentImg] = useState(0);
  
  const validImages = service.images?.filter(img => img && typeof img === 'string' && img.trim() !== '') || [];
  if (service.image && typeof service.image === 'string' && service.image.trim() !== '') {
    if (validImages.length === 0) validImages.push(service.image);
  }
  const images = validImages.length > 0 ? validImages : [defaultServiceImg];

  const nextImg = (e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    if (images.length > 1) setCurrentImg((prev) => (prev === images.length - 1 ? 0 : prev + 1)); 
  };
  
  const prevImg = (e) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    if (images.length > 1) setCurrentImg((prev) => (prev === 0 ? images.length - 1 : prev - 1)); 
  };

  // Dynamic styling based on category
  const themeColor = isKids ? 'text-[#3b82f6]' : 'text-[#d32f2f]';
  const bgHoverColor = isKids ? 'hover:bg-[#3b82f6]' : 'hover:bg-[#d32f2f]';
  const borderTheme = isKids ? 'hover:border-[#3b82f6]' : 'hover:border-[#d32f2f]';
  
  return (
    <div className={`bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden ${borderTheme} transition-all group flex ${isKids ? 'flex-col h-auto' : 'flex-row h-40 sm:h-48 lg:h-52'}`}>
      
      {/* Image Section */}
      <div className={`relative overflow-hidden bg-[#1a1a1a] flex items-center justify-center ${isKids ? 'w-full h-48 sm:h-56' : 'w-[60%] h-full shrink-0'}`}>
        <img 
          src={images[currentImg]} 
          alt={lang === 'ar' ? service.nameAr : service.nameEn}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
          onError={(e) => {
            if (e.currentTarget.src !== defaultServiceImg) {
              e.currentTarget.src = defaultServiceImg;
            }
          }}
        />
        
        {/* Desktop Arrows (Hidden on Mobile) */}
        {images && images.length > 1 && (
          <div className="hidden md:flex absolute inset-0 justify-between items-center px-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
            <button onClick={prevImg} className="bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-full transition-colors"><ChevronLeft size={16}/></button>
            <button onClick={nextImg} className="bg-black/60 hover:bg-black/90 text-white p-1.5 rounded-full transition-colors"><ChevronRight size={16}/></button>
          </div>
        )}

        {/* Mobile Pagination Circles (Hidden on Desktop) */}
        {images && images.length > 1 && (
          <div className="md:hidden absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20">
            {images.map((_, idx) => (
              <button 
                key={idx} 
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImg(idx); }}
                className={`rounded-full transition-all ${idx === currentImg ? 'w-2 h-2 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        )}

        {/* Gradient Overlays & Badges */}
        {isKids ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-3 right-3 bg-[#3b82f6] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg z-20">Kids</div>
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#141414] pointer-events-none z-10"></div>
        )}
      </div>

      {/* Text Section */}
      <div className={`p-3 sm:p-4 flex flex-col justify-between ${isKids ? 'flex-grow' : 'w-[40%] min-w-0'}`}>
        <div>
          <h3 className={`text-sm sm:text-base font-bold text-white uppercase transition-colors mb-1 truncate group-hover:${themeColor.replace('text-', '')}`}>
            {lang === 'ar' ? service.nameAr : service.nameEn}
          </h3>
          <p className="text-[#a3a3a3] text-[10px] sm:text-xs line-clamp-2 leading-relaxed mb-2">
            {lang === 'ar' ? service.descriptionAr : service.descriptionEn}
          </p>
        </div>
        
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex justify-between items-end">
            <span className="text-[#a3a3a3] text-[10px] sm:text-xs flex items-center gap-1 pb-0.5 whitespace-nowrap">
              <Clock size={12} className={themeColor} />
              {service.durationMinutes} {t('mins')}
            </span>
            
            {service.originalPrice && service.originalPrice > service.price ? (
              <div className="flex flex-col items-end leading-none">
                <span className="text-[#a3a3a3] text-[10px] line-through mb-1">
                  {service.originalPrice} {t('currency')}
                </span>
                <span className={`text-base sm:text-lg font-bold ${themeColor}`}>
                  {service.price} <span className="text-[10px] font-medium">{t('currency')}</span>
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg font-bold text-white pb-0.5">
                {service.price} <span className={`text-[10px] font-medium ${themeColor}`}>{t('currency')}</span>
              </span>
            )}
          </div>
          
          <Link 
            to="/book" 
            className={`block w-full text-center bg-[#1f1f1f] text-[#a3a3a3] py-1.5 sm:py-2 rounded font-bold text-[10px] uppercase tracking-wider transition-colors border border-[#333] hover:text-white ${bgHoverColor} ${borderTheme}`}
          >
            {t('book_now_card')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;