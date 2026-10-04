import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../../../utils/LanguageContext';

const PackageCard = ({ pkg, lang, t }) => {
  const [currentImg, setCurrentImg] = useState(0);
  
  const validImages = pkg.images && pkg.images.length > 0 ? pkg.images : [[
    "https://images.unsplash.com/photo-1622288432450-277d0fce04b4?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1622288432450-277d0fce04b4?auto=format&fit=crop&w=500&q=80",
    "https://images.unsplash.com/photo-1622288432450-277d0fce04b4?auto=format&fit=crop&w=700&q=80"
  ]];

  const nextImg = (e) => { e.stopPropagation(); setCurrentImg((prev) => (prev === validImages.length - 1 ? 0 : prev + 1)); };
  const prevImg = (e) => { e.stopPropagation(); setCurrentImg((prev) => (prev === 0 ? validImages.length - 1 : prev - 1)); };

  const imageSet = validImages[currentImg];
  const fallbackSrc = imageSet[1] || imageSet[0]; 
  
  const srcSetString = imageSet.length >= 3  
    ? `${imageSet[0]} 300w, ${imageSet[1]} 500w, ${imageSet[2]} 700w` 
    : undefined;

  return (
    <div className="w-full h-[40vh] min-h-[250px] max-h-[300px] sm:max-h-none sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden relative group cursor-pointer border border-[#2a2a2a] bg-black">
      <div className="absolute inset-0">
        <img 
          src={fallbackSrc} 
          srcSet={srcSetString}
          sizes="(max-width: 1023px) 50vw, 25vw"
          alt={lang === 'ar' ? pkg.nameAr : pkg.nameEn} 
          className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-100 group-hover:opacity-95"
          loading="lazy"
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 lg:p-6 flex flex-col justify-end transition-all duration-500 group-hover:bg-black/30">
        {validImages.length > 1 && (
          <div className="absolute top-4 left-4 right-4 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
             <button onClick={prevImg} className="bg-white/20 hover:bg-[#d32f2f] text-white p-2 rounded-full transition-all"><ChevronLeft size={16} /></button>
             <button onClick={nextImg} className="bg-white/20 hover:bg-[#d32f2f] text-white p-2 rounded-full transition-all"><ChevronRight size={16} /></button>
          </div>
        )}

        <div className="transition-all duration-500">
          <div className="flex justify-between items-end mb-2 sm:mb-3 gap-2">
            <h3 className="text-lg lg:text-xl font-black text-white uppercase leading-tight">{lang === 'ar' ? pkg.nameAr : pkg.nameEn}</h3>
            {pkg.oldPrice && pkg.oldPrice > pkg.price ? (
              <div className="flex flex-col items-end leading-none">
                <span className="text-white/70 font-medium text-[10px] sm:text-xs line-through mb-1">
                  {pkg.oldPrice} {t('currency')}
                </span>
                <span className="text-lg lg:text-xl font-bold text-[#d32f2f] whitespace-nowrap">
                  {pkg.price} <span className="text-[10px]">{t('currency')}</span>
                </span>
              </div>
            ) : (
              <span className="text-lg lg:text-xl font-bold text-[#d32f2f] whitespace-nowrap">
                {pkg.price} <span className="text-[10px]">{t('currency')}</span>
              </span>
            )}
          </div>
          
          <ul className="space-y-1 mb-4 opacity-0 group-hover:opacity-100 transition-opacity delay-100 h-0 group-hover:h-auto overflow-hidden">
            {(lang === 'ar' ? pkg.itemsAr : pkg.itemsEn).map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-[10px] lg:text-xs text-white/80">
                <CheckCircle2 size={12} className="text-[#d32f2f]" /> {item}
              </li>
            ))}
          </ul>

          <Link to="/book" className="w-full block text-center bg-[#d32f2f] text-white py-2 lg:py-2.5 rounded-lg font-bold text-[10px] lg:text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all">
            {t('book_package')}
          </Link>
        </div>
      </div>
    </div>
  );
};

const PackagesSection = ({ packages, isLoading }) => {
  const { t, lang } = useLanguage();

  return (
    <section className="py-16 px-4 sm:px-6 bg-[#0a0a0a]" id="packages">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8 lg:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-widest mb-2 lg:mb-3">
              {t('special_packages')}
            </h2>
            <div className="w-12 sm:w-16 h-1 bg-[#d32f2f] rounded-full"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
          {packages.filter(pkg => pkg.isActive).map((pkg, idx) => (
            <PackageCard key={pkg._id || idx} pkg={pkg} lang={lang} t={t} />
          ))}
        </div>

        {packages.length === 0 && !isLoading && (
          <div className="w-full text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-xl mt-6">
            {t('no_packages')}
          </div>
        )}
      </div>
    </section>
  );
};

export default PackagesSection;