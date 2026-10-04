import React, { useState, useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { useLanguage } from '../../../../utils/LanguageContext';

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

const ReviewsSection = ({ reviews, isLoading }) => {
  const { t, lang } = useLanguage();
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const scrollRef = useRef(null);
  const isScrollingForward = useRef(true);

  // Zoom on active card
  useEffect(() => {
    const handleScrollZoom = () => {
      if (!scrollRef.current || scrollRef.current.children.length === 0) return;
      const container = scrollRef.current;
      const children = container.children;
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + (containerRect.width / 2);
      
      let closestIndex = 0;
      let minDistance = Infinity;
      
      for (let i = 0; i < children.length; i++) {
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
      setTimeout(handleScrollZoom, 100);
      return () => container.removeEventListener('scroll', handleScrollZoom);
    }
  }, [reviews]);

  // Auto Scroll
  useEffect(() => {
    if (reviews.length <= 1 || !scrollRef.current) return;

    const intervalId = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;
      const cardWidth = container.children[0].offsetWidth;
      const gap = 24;
      const totalStepWidth = cardWidth + gap;
      const currentScroll = container.scrollLeft;
      const maxScroll = container.scrollWidth - container.clientWidth;
      const isRtl = lang === 'ar';

      if (isScrollingForward.current) {
        let nextScrollTarget = isRtl ? currentScroll - totalStepWidth : currentScroll + totalStepWidth;
        if ((!isRtl && nextScrollTarget >= maxScroll - 20) || (isRtl && Math.abs(nextScrollTarget) >= maxScroll - 20)) {
          isScrollingForward.current = false;
        }
        const step = isRtl ? -totalStepWidth : totalStepWidth;
        container.scrollBy({ left: step, behavior: 'smooth' });
      } else {
        let nextScrollTarget = isRtl ? currentScroll + totalStepWidth : currentScroll - totalStepWidth;
        if ((!isRtl && nextScrollTarget <= 20) || (isRtl && nextScrollTarget >= -20)) {
          isScrollingForward.current = true;
        }
        const step = isRtl ? totalStepWidth : -totalStepWidth;
        container.scrollBy({ left: step, behavior: 'smooth' });
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [reviews, lang]);

  return (
    <section id="reviews" className="py-24 bg-[#111] border-t border-[#1f1f1f] overflow-hidden">
      <div className="max-w-[1400px] mx-auto text-center">
        <div className="mb-16 px-6">
          <h2 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-3">
            {t('reviews_title')}
          </h2>
          <div className="w-16 h-1 bg-[#d32f2f] mx-auto rounded-full mb-4"></div>
          <p className="text-[#a3a3a3] text-sm md:text-base max-w-2xl mx-auto">{t('reviews_subtitle')}</p>
        </div>
        
        {/* Adjusted padding for true centering */}
        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 sm:gap-6 pb-8 pt-8 px-[12vw] sm:px-[calc(50vw-190px)] snap-x snap-mandatory pointer-events-none select-none scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {reviews.map((review, index) => {
            const isCenter = index === activeReviewIndex;
            return (
              <div 
                key={review._id || index} 
                className={`min-w-[75vw] sm:min-w-[380px] max-w-[400px] snap-center bg-[#141414] p-5 sm:p-6 rounded-2xl border text-start transition-all duration-500 ease-out flex flex-col justify-between ${
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
  );
};

export default ReviewsSection;