import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useLanguage } from '../../utils/LanguageContext';
import { Clock, MapPin, ChevronLeft, ChevronRight, CheckCircle2, Phone, CalendarDays, Mail, Star } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

// NEW IMPORT: Bring in the Products Section
import ProductsSection from '../../components/ProductsSection';

// Internal Component for Package Cards
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
    <div className="w-full h-[350px] sm:h-[450px] lg:h-[500px] rounded-2xl overflow-hidden relative group cursor-pointer border border-[#2a2a2a] bg-black">
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

const getRelativeTime = (dateString, lang) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return lang === 'ar' ? `منذ ${diffDays} يوم` : `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return lang === 'ar' ? `منذ ${diffMonths} شهر` : `${diffMonths} months ago`;
  return lang === 'ar' ? `منذ أكثر من سنة` : `Over a year ago`;
};

const Home = () => {
  const { t, lang } = useLanguage();
  
  const [categories, setCategories] = useState([]);
  const [professionals, setProfessionals] = useState([]);
  const [packages, setPackages] = useState([]);
  const [branches, setBranches] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('All');
  const [activeBranch, setActiveBranch] = useState(null); 
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 8;

  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const scrollRef = useRef(null);
  const isScrollingForward = useRef(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, profRes, pkgRes, branchRes, revRes] = await Promise.all([
          axios.get('/api/categories'),
          axios.get('/api/professionals'),
          axios.get('/api/packages'),
          axios.get('/api/branches'),
          axios.get('/api/reviews').catch(() => ({ data: [] }))
        ]);
        
        setCategories(catRes.data);
        setProfessionals(profRes.data);
        setPackages(pkgRes.data);
        setBranches(branchRes.data);
        setReviews(revRes.data || []);
        
        if(branchRes.data && branchRes.data.length > 0) {
          setActiveBranch(branchRes.data[0]);
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Highlight calculations centered around the middle of the viewport
  useEffect(() => {
    const handleScrollZoom = () => {
      if (!scrollRef.current || scrollRef.current.children.length === 0) return;
      
      const container = scrollRef.current;
      const children = container.children;
      
      // Find the absolute horizontal centerline of the container on the viewport
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + (containerRect.width / 2);
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      // Check each card to see which one is physically closest to the centerline
      for (let i = 0; i < children.length; i++) {
        // Skip our spacing spacer elements if any are explicitly added
        if (children[i].getAttribute('aria-hidden') === 'true') continue;
        
        const cardRect = children[i].getBoundingClientRect();
        const cardCenter = cardRect.left + (cardRect.width / 2);
        const distance = Math.abs(containerCenter - cardCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = i;
        }
      }
      
      setActiveReviewIndex(closestIndex);
    };

    const container = scrollRef.current;
    if (container) {
      container.addEventListener('scroll', handleScrollZoom, { passive: true });
      // Run right away to highlight the first card on load
      setTimeout(handleScrollZoom, 100);
      return () => container.removeEventListener('scroll', handleScrollZoom);
    }
  }, [reviews]);

  // 2. Controlled Smooth Auto-Scroll Interval Loop (2-Second Delay)
  useEffect(() => {
    if (reviews.length <= 1 || !scrollRef.current) return;

    // Custom smooth scroll implementation to slow down the sliding speed
    const customSmoothScroll = (element, targetOffset, duration) => {
      const start = element.scrollLeft;
      const change = targetOffset - start;
      let startTime = null;

      const animateScroll = (currentTime) => {
        if (!startTime) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        
        // Progress percentage (0 to 1)
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Easing function: Ease-In-Out Quad for a velvety start and slow finish
        const easeInOutQuad = progress < 0.5 
          ? 2 * progress * progress 
          : -1 + (4 - 2 * progress) * progress;

        element.scrollLeft = start + change * easeInOutQuad;

        if (timeElapsed < duration) {
          requestAnimationFrame(animateScroll);
        }
      };

      requestAnimationFrame(animateScroll);
    };

    const intervalId = setInterval(() => {
      const container = scrollRef.current;
      const cardWidth = container.children[0].offsetWidth;
      const gap = 24;
      const totalStepWidth = cardWidth + gap;

      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const isRtl = lang === 'ar';
      
      // Target transition execution duration in milliseconds
      // CHANGE THIS: Higher number = slower slide motion (e.g., 800ms or 1000ms)
      const slideDuration = 800; 

      if (isScrollingForward.current) {
        let nextScrollTarget = isRtl ? currentScroll - totalStepWidth : currentScroll + totalStepWidth;
        
        if ((!isRtl && nextScrollTarget >= maxScroll - 20) || (isRtl && Math.abs(nextScrollTarget) >= maxScroll - 20)) {
          isScrollingForward.current = false;
        }

        const step = isRtl ? -totalStepWidth : totalStepWidth;
        customSmoothScroll(container, currentScroll + step, slideDuration);
      } else {
        let nextScrollTarget = isRtl ? currentScroll + totalStepWidth : currentScroll - totalStepWidth;
        
        if ((!isRtl && nextScrollTarget <= 20) || (isRtl && nextScrollTarget >= -20)) {
          isScrollingForward.current = true;
        }

        const step = isRtl ? totalStepWidth : -totalStepWidth;
        customSmoothScroll(container, currentScroll + step, slideDuration);
      }
    }, 2000); // Wait 2 seconds between card movements

    return () => clearInterval(intervalId);
  }, [reviews, lang]);

  const handleScroll = (targetId) => {
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const standardCategories = categories.filter(cat => cat.titleEn.toLowerCase() !== 'kids');
  const kidsCategory = categories.find(cat => cat.titleEn.toLowerCase() === 'kids');
  const kidsServices = kidsCategory ? kidsCategory.services : [];

  const getDisplayServices = () => {
    if (activeTab === 'All') return standardCategories.flatMap(cat => cat.services);
    const selectedCategory = standardCategories.find(cat => (lang === 'ar' ? cat.titleAr : cat.titleEn) === activeTab);
    return selectedCategory ? selectedCategory.services : [];
  };

  const allFilteredServices = getDisplayServices();
  const totalPages = Math.ceil(allFilteredServices.length / cardsPerPage);
  const indexOfLastCard = currentPage * cardsPerPage;
  const indexOfFirstCard = indexOfLastCard - cardsPerPage;
  const currentServices = allFilteredServices.slice(indexOfFirstCard, indexOfLastCard);

  return (
    <div className="bg-[#0a0a0a] min-h-screen font-sans overflow-x-hidden text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] flex flex-col items-center justify-center text-center px-4" id="hero">
        <div className="absolute inset-0 z-0">
          <img 
            src="../../banner/banner.png" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-50 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a]/80 via-transparent to-[#0a0a0a] z-10"></div>
        </div>
        
        <div className="z-20 max-w-3xl mx-auto mt-10">
          <h1 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4 leading-tight">
            {t('hero_title')} <br />
            <span className="text-[#d32f2f] drop-shadow-md">{t('hero_highlight')}</span>
          </h1>
          <p className="text-gray-300 font-medium drop-shadow-md text-base md:text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/book" className="bg-[#d32f2f] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-red-700 transition-all shadow-lg shadow-red-900/20 w-full sm:w-auto text-center">
              {t('hero_cta_primary')}
            </Link>
            <button onClick={() => handleScroll('services')} className="bg-transparent border border-[#333] text-white px-8 py-3 rounded-full font-bold text-sm hover:border-white transition-all w-full sm:w-auto cursor-pointer">
              {t('hero_cta_secondary')}
            </button>
          </div>
        </div>
      </section>

      {/* 2. SERVICES SECTION */}
      <section className="py-16 px-6 bg-[#0a0a0a]" id="services">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
               <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3">{t('services_title')}</h2>
               <div className="w-16 h-1 bg-[#d32f2f] mx-auto rounded-full"></div>
            </div>
            
            {isLoading ? (
              <div className="text-[#a3a3a3] text-center text-sm animate-pulse">{t('loading_services')}</div>
            ) : (
              <>
                <div className="flex flex-wrap justify-center gap-2 mb-10">
                  <button onClick={() => setActiveTab('All')} className={`px-5 py-2 rounded-full font-bold text-xs transition-all border ${activeTab === 'All' ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-transparent border-[#333] text-[#a3a3a3] hover:border-[#666] hover:text-white'}`}>
                    {t('filter_all')}
                  </button>
                  {standardCategories.map((cat) => {
                    const tabName = lang === 'ar' ? cat.titleAr : cat.titleEn;
                    return (
                      <button key={cat._id} onClick={() => setActiveTab(tabName)} className={`px-5 py-2 rounded-full font-bold text-xs transition-all border ${activeTab === tabName ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-transparent border-[#333] text-[#a3a3a3] hover:border-[#666] hover:text-white'}`}>
                        {tabName}
                      </button>
                    );
                  })}
                </div>

                <div key={`${activeTab}-${currentPage}`} className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 min-h-[400px] animate-fade-in-up">
                  {currentServices.map((srv) => (
                    // 1. INCREASED HEIGHT: Changed 'h-32 sm:h-40' to 'h-40 sm:h-48 lg:h-52'
                    <div key={srv._id} className="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden hover:border-[#d32f2f] transition-all group flex flex-row h-40 sm:h-48 lg:h-52">
                                      
                      {/* Left Side: Image */}
                      <div className="w-2/5 sm:w-1/2 h-full relative overflow-hidden bg-black">
                        <img 
                          src={srv.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80"} 
                          alt={lang === 'ar' ? srv.nameAr : srv.nameEn}
                          className="w-full h-full object-cover group-hover:scale-110 transition-all duration-500"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#141414]"></div>
                      </div>

                      {/* Right Side: Text Details */}
                      {/* 2. SPACING FIX: Changed 'justify-center' to 'justify-between' */}
                      <div className="w-3/5 sm:w-1/2 p-3 sm:p-5 flex flex-col justify-between">
                        <div>
                          <h3 className="text-sm sm:text-base font-bold text-white uppercase group-hover:text-[#d32f2f] transition-colors mb-1 line-clamp-1 leading-tight">
                            {lang === 'ar' ? srv.nameAr : srv.nameEn}
                          </h3>
                          
                          <p className="text-[#a3a3a3] text-[10px] sm:text-xs line-clamp-2 leading-relaxed mb-3">
                            {lang === 'ar' ? srv.descriptionAr : srv.descriptionEn}
                          </p>
                        </div>
                        
                        <div className="mt-auto flex flex-col gap-2">
                          <div className="flex justify-between items-end">
                              <span className="text-[#a3a3a3] text-[10px] sm:text-xs flex items-center gap-1.5 pb-0.5">
                                <Clock size={12} className="text-[#d32f2f]" />
                                {srv.durationMinutes} {t('mins')}
                              </span>
                              
                              {srv.originalPrice && srv.originalPrice > srv.price ? (
                                <div className="flex flex-col items-end leading-none">
                                  <span className="text-[#a3a3a3] text-[10px] line-through mb-1">
                                    {srv.originalPrice} {t('currency')}
                                  </span>
                                  <span className="text-base sm:text-lg font-bold text-[#d32f2f]">
                                    {srv.price} <span className="text-[10px] font-medium">{t('currency')}</span>
                                  </span>
                                </div>
                              ) : (
                                <span className="text-base sm:text-lg font-bold text-white pb-0.5">
                                  {srv.price} <span className="text-[10px] text-[#d32f2f] font-medium">{t('currency')}</span>
                                </span>
                              )}

                          </div>
                          <Link to="/book" className="block w-full text-center bg-[#1f1f1f] text-[#a3a3a3] py-1.5 sm:py-2 rounded font-bold text-[10px] uppercase tracking-wider hover:bg-[#d32f2f] hover:text-white transition-colors border border-[#333] hover:border-[#d32f2f]">
                            {t('book_now_card')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-10">
                    <button onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1f1f1f] border border-[#333] hover:border-[#d32f2f] disabled:opacity-50 transition-all">
                      <ChevronLeft size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentPage(idx + 1)} className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border ${currentPage === idx + 1 ? 'bg-[#d32f2f] border-[#d32f2f] text-white' : 'bg-[#1f1f1f] border-[#333] text-[#a3a3a3] hover:border-white'}`}>
                        {idx + 1}
                      </button>
                    ))}
                    <button onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#1f1f1f] border border-[#333] hover:border-[#d32f2f] disabled:opacity-50 transition-all">
                      <ChevronRight size={16} className={lang === 'ar' ? 'rotate-180' : ''} />
                    </button>
                  </div>
                )}
              </>
            )}
         </div>
      </section>

      {/* 2.5 KIDS SERVICES SECTION (DEDICATED UI) */}
      {kidsServices.length > 0 && !isLoading && (
        <section className="py-16 px-6 bg-[#111] border-t border-[#1f1f1f]" id="kids">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3 text-[#3b82f6]">
                {t('kids_title')}
              </h2>
              <div className="w-16 h-1 bg-[#3b82f6] mx-auto rounded-full"></div>
              <p className="text-[#a3a3a3] text-sm md:text-base mt-4 max-w-2xl mx-auto">
                {t('kids_subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {kidsServices.map((srv) => (
                <div key={srv._id} className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] overflow-hidden hover:border-[#3b82f6] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] transition-all duration-300 group flex flex-col h-auto">
                  
                  {/* Image with Blue Gradient Overlay */}
                  <div className="w-full h-48 relative overflow-hidden bg-black">
                    <img 
                      src={srv.image || "https://images.unsplash.com/photo-1595455850942-0f04c633a69c?auto=format&fit=crop&w=600&q=80"} 
                      alt={lang === 'ar' ? srv.nameAr : srv.nameEn}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent"></div>
                    <div className="absolute top-3 right-3 bg-[#3b82f6] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Kids
                    </div>
                  </div>

                  {/* Text Details */}
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white uppercase group-hover:text-[#3b82f6] transition-colors mb-2 leading-tight">
                        {lang === 'ar' ? srv.nameAr : srv.nameEn}
                      </h3>
                      <p className="text-[#a3a3a3] text-xs leading-relaxed mb-4 line-clamp-2">
                        {lang === 'ar' ? srv.descriptionAr : srv.descriptionEn}
                      </p>
                    </div>
                    
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-4">
                        <span className="text-[#a3a3a3] text-xs flex items-center gap-1.5 font-medium">
                          <Clock size={14} className="text-[#3b82f6]" />
                          {srv.durationMinutes} {t('mins')}
                        </span>
                        
                        <span className="text-xl font-black text-white">
                          {srv.price} <span className="text-[10px] text-[#3b82f6] font-bold">{t('currency')}</span>
                        </span>
                      </div>
                      
                      <Link to="/book" className="block w-full text-center bg-transparent text-[#3b82f6] py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-[#3b82f6] hover:text-white transition-all border border-[#3b82f6]">
                        {t('book_now_card')}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. SPECIAL PACKAGES SECTION */}
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

      {/* 3.5. NEW BUYABLE PRODUCTS SECTION */}
      <ProductsSection />

      {/* 4. PROFESSIONALS SECTION */}
      <section className="py-16 px-6 bg-[#0a0a0a] border-t border-[#1f1f1f]" id="professionals">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">
                {t('profs_title')}
              </h2>
              <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {professionals.filter(prof => prof.isActive).map((prof, idx) => (
              <div key={prof._id || idx} className="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden group text-center">
                <div className="h-56 bg-[#1f1f1f] relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent z-10"></div>
                  <img 
                    src={prof.avatar} 
                    alt={lang === 'ar' ? prof.nameAr : prof.nameEn} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-100 grayscale group-hover:grayscale-0"
                  />
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-black text-white uppercase group-hover:text-[#d32f2f] transition-colors">
                    {lang === 'ar' ? prof.nameAr : prof.nameEn}
                  </h3>
                  <p className="text-[#a3a3a3] text-xs font-bold mt-1 uppercase tracking-wider">
                    {lang === 'ar' ? prof.roleAr : prof.roleEn}
                  </p>
                </div>
              </div>
            ))}
            
            {professionals.length === 0 && !isLoading && (
              <div className="col-span-full text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-xl">
                {t('no_professionals')}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. REVIEWS SECTION */}
      <section id="reviews" className="py-24 bg-[#111] border-t border-[#1f1f1f] overflow-hidden">
        <div className="max-w-[1400px] mx-auto text-center">
          <div className="mb-16 px-6">
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3">
              {t('reviews_title')}
            </h2>
            <div className="w-16 h-1 bg-[#d32f2f] mx-auto rounded-full mb-4"></div>
            <p className="text-[#a3a3a3] text-sm md:text-base max-w-2xl mx-auto">{t('reviews_subtitle')}</p>
          </div>
          
          {/* Horizontal Scroll Container */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto gap-6 pb-8 pt-8 px-[calc(50vw-212px)] pointer-events-none select-none scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {reviews.map((review, index) => {
              const isCenter = index === activeReviewIndex;
              return (
                <div 
                  key={review._id || index} 
                  className={`min-w-[350px] sm:min-w-[400px] snap-center bg-[#141414] p-8 rounded-2xl border text-start transition-all duration-500 ease-out flex flex-col justify-between ${
                    isCenter 
                      ? 'scale-105 shadow-[0_10px_40px_rgba(211,47,47,0.15)] border-[#d32f2f] z-10 opacity-100' 
                      : 'scale-95 opacity-30 border-[#2a2a2a]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#2a2a2a] rounded-full flex items-center justify-center text-white font-black text-lg border border-[#444]">
                          {review.clientName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-white font-bold uppercase tracking-wider text-sm">{review.clientName}</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isCenter ? 'text-[#eab308]' : 'text-[#d32f2f]'}`}>
                            {review.memberType}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex gap-1 text-[#eab308]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} stroke={i < review.rating ? "currentColor" : "#444"} />
                        ))}
                      </div>
                      <span className="text-[#555] text-xs font-medium ml-2">{getRelativeTime(review.createdAt, lang)}</span>
                    </div>

                    <p className="text-[#d4d4d4] text-sm leading-relaxed italic mb-4">
                      "{review.text}"
                    </p>
                  </div>
                </div>
              )
            })}
            
            {reviews.length === 0 && !isLoading && (
              <div className="w-full text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-xl mx-6">
                No reviews yet. Be the first!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. BRANCHES SECTION */}
      <section className="py-16 px-6 bg-[#0a0a0a] border-t border-[#1f1f1f]" id="branches">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-2">
                {t('nav_branches')}
              </h2>
              <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
            </div>
          </div>

          {branches.length > 0 ? (
            <div className="bg-[#141414] rounded-xl border border-[#2a2a2a] overflow-hidden shadow-2xl">
              <div className="flex flex-nowrap overflow-x-auto bg-[#1a1a1a] border-b border-[#2a2a2a] scrollbar-hide">
                {branches.filter(b => b.isActive).map((branch) => (
                  <button
                    key={branch._id || branch.nameEn}
                    onClick={() => setActiveBranch(branch)}
                    className={`flex-1 min-w-[150px] py-4 px-6 text-sm font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                      activeBranch?.nameEn === branch.nameEn 
                        ? 'bg-[#d32f2f] text-white shadow-[inset_0_-2px_0_rgba(255,255,255,0.2)]' 
                        : 'text-[#a3a3a3] hover:bg-[#222] hover:text-white'
                    }`}
                  >
                    {lang === 'ar' ? branch.nameAr : branch.nameEn}
                  </button>
                ))}
              </div>

              {activeBranch && (
                <div className="flex flex-col lg:flex-row">
                  <div className="w-full lg:w-1/3 p-8 flex flex-col justify-center space-y-8 bg-[#141414]">
                    <div>
                      <h3 className="text-2xl font-black text-white mb-6 uppercase tracking-wider">
                         {lang === 'ar' ? activeBranch.nameAr : activeBranch.nameEn}
                      </h3>
                      <div className="space-y-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[#d32f2f] shrink-0">
                            <MapPin size={18} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-1">{t('address')}</span>
                            <p className="text-[#d4d4d4] text-sm leading-relaxed">{lang === 'ar' ? activeBranch.addressAr : activeBranch.addressEn}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[#d32f2f] shrink-0">
                            <Phone size={18} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-1">{t('phone')}</span>
                            <p className="text-[#d4d4d4] text-sm font-medium" dir="ltr">{activeBranch.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#1f1f1f] border border-[#2a2a2a] flex items-center justify-center text-[#d32f2f] shrink-0">
                            <CalendarDays size={18} />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-1">{t('working_hours')}</span>
                            <p className="text-[#d4d4d4] text-sm leading-relaxed whitespace-pre-line">
                              {lang === 'ar' ? activeBranch.workingHoursAr : activeBranch.workingHoursEn}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-2/3 h-[300px] lg:h-auto min-h-[400px] bg-[#141414] relative border-l border-[#2a2a2a]">
                    <iframe 
                      title={activeBranch.nameEn}
                      className="absolute inset-0 w-full h-full border-0 grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700" 
                      src={activeBranch.mapUrl}
                      allowFullScreen 
                      loading="lazy" 
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          ) : (
            !isLoading && (
              <div className="w-full text-center text-[#555] text-sm py-10 border border-dashed border-[#333] rounded-xl">
                {t('no_branches')}
              </div>
            )
          )}
        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="bg-[#050505] pt-20 pb-8 border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <div className="lg:col-span-1 text-start">
              <Link to="/" className="text-2xl font-black tracking-widest text-white mb-5 flex items-center gap-1">
                NAME <span className="text-[#d32f2f]">SALON</span>
              </Link>
              <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">
                {t('footer_desc')}
              </p>
              <Link to="/book" className="inline-block bg-[#1a1a1a] border border-[#333] text-white px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#d32f2f] hover:border-[#d32f2f] transition-colors">
                {t('footer_book_btn')}
              </Link>
            </div>

            <div className="lg:col-span-1 text-start">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
                {t('nav_contact')}
              </h4>
              <div className="space-y-4 text-[#a3a3a3] text-sm">
                <div className="flex items-start gap-3">
                  <MapPin size={16} className="text-[#d32f2f] shrink-0 mt-1" />
                  <span className="leading-relaxed">
                    {t('footer_address')}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#d32f2f] shrink-0" />
                  <span dir="ltr">+20 11* *** ****</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={16} className="text-[#d32f2f] shrink-0" />
                  <span dir="ltr">+20 10* *** ****</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-[#d32f2f] shrink-0" />
                  <span>salonBarber@gmail.com</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1 text-start">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
                {t('quick_links')}
              </h4>
              <ul className="space-y-3 text-[#a3a3a3] text-sm">
                <li><button onClick={() => handleScroll('services')} className="hover:text-[#d32f2f] transition-colors">{t('nav_services')}</button></li>
                <li><button onClick={() => handleScroll('packages')} className="hover:text-[#d32f2f] transition-colors">{t('special_packages')}</button></li>
                <li><button onClick={() => handleScroll('professionals')} className="hover:text-[#d32f2f] transition-colors">{t('profs_title')}</button></li>
                <li><button onClick={() => handleScroll('reviews')} className="hover:text-[#d32f2f] transition-colors">{t('reviews_title')}</button></li>
              </ul>
            </div>

            <div className="lg:col-span-1 text-start">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">
                {t('follow_us')}
              </h4>
              <div className="flex gap-3">
                <a href="https://facebook.com/absaloon" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-[#a3a3a3] hover:text-[#1877F2] hover:border-[#1877F2] hover:shadow-[0_0_10px_rgba(24,119,242,0.3)] hover:-translate-y-1 transition-all duration-300">
                  <FaFacebook size={18} />
                </a>
                <a href="https://www.instagram.com/ab.salonn" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-[#a3a3a3] hover:text-[#E1306C] hover:border-[#E1306C] hover:shadow-[0_0_10px_rgba(225,48,108,0.3)] hover:-translate-y-1 transition-all duration-300">
                  <FaInstagram size={18} />
                </a>
                <a href="https://www.tiktok.com/@ab.salon6" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-[#a3a3a3] hover:text-white hover:border-white hover:shadow-[0_0_10px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all duration-300">
                  <FaTiktok size={18} />
                </a>
              </div>
              
            {/* NEW SUB-FOOTER NOTICE CONTAINER */}
              <div className="pt-2 border-t border-[#1a1a1a] max-w-xs">
                <p className="text-gray-400 text-xs leading-relaxed">
                  {t('cancel_notice')}
                  <span className="text-white font-semibold block mt-1 hover:text-[#d32f2f] transition-colors" dir="ltr">
                    +20 11* *** ****
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#1a1a1a] text-[#555] text-xs" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
            <p>© {new Date().getFullYear()} NAME Salon. {t('all_rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;