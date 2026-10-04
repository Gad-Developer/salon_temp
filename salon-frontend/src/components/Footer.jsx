import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../utils/LanguageContext';
import { MapPin, Phone, Mail } from 'lucide-react';
import { FaFacebook, FaInstagram, FaTiktok } from 'react-icons/fa';

const Footer = () => {
  const { t, lang } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  const handleScroll = (targetId) => {
    if (isHome) {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      // Navigate to home first, then scroll to section
      navigate('/');
      setTimeout(() => {
        const target = document.getElementById(targetId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  return (
    <footer className="bg-[#050505] pt-12 md:pt-20 pb-8 border-t border-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-10 md:gap-12 mb-12 md:mb-16" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          
          {/* Column 1 */}
          <div className="text-start">
            <Link to="/" className="text-lg md:text-2xl font-black tracking-widest text-white mb-4 md:mb-5 flex items-center gap-1">
              NAME <span className="text-[#d32f2f]">SALON</span>
            </Link>
            <p className="text-[#a3a3a3] text-xs md:text-sm leading-relaxed mb-6 line-clamp-4">
              {t('footer_desc')}
            </p>
            <Link to="/book" className="inline-block bg-[#1a1a1a] border border-[#333] text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider hover:bg-[#d32f2f] hover:border-[#d32f2f] transition-colors">
              {t('footer_book_btn')}
            </Link>
          </div>

          {/* Column 2 */}
          <div className="text-start">
            <h4 className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
              {t('nav_contact')}
            </h4>
            <div className="space-y-4 text-[#a3a3a3] text-[10px] md:text-sm">
              <div className="flex items-start gap-2 md:gap-3">
                <MapPin size={16} className="text-[#d32f2f] shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  {t('footer_address')}
                </span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Phone size={16} className="text-[#d32f2f] shrink-0" />
                <span dir="ltr">+20 11* *** ****</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Phone size={16} className="text-[#d32f2f] shrink-0" />
                <span dir="ltr">+20 10* *** ****</span>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <Mail size={16} className="text-[#d32f2f] shrink-0" />
                <span className="break-all">salonBarber@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="text-start">
            <h4 className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
              {t('quick_links')}
            </h4>
            <ul className="space-y-3 text-[#a3a3a3] text-[10px] md:text-sm">
              <li><button onClick={() => handleScroll('services')} className="hover:text-[#d32f2f] transition-colors cursor-pointer">{t('nav_services')}</button></li>
              <li><button onClick={() => handleScroll('packages')} className="hover:text-[#d32f2f] transition-colors cursor-pointer">{t('special_packages')}</button></li>
              <li><button onClick={() => handleScroll('professionals')} className="hover:text-[#d32f2f] transition-colors cursor-pointer">{t('profs_title')}</button></li>
              <li><button onClick={() => handleScroll('reviews')} className="hover:text-[#d32f2f] transition-colors cursor-pointer">{t('reviews_title')}</button></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="text-start flex flex-col h-full">
            <h4 className="text-white text-[10px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-6">
              {t('follow_us')}
            </h4>
            <div className="flex flex-wrap gap-2 md:gap-3 mb-6">
              <a href="https://facebook.com/absaloon" target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-[#a3a3a3] hover:text-[#1877F2] hover:border-[#1877F2] hover:-translate-y-1 transition-all duration-300">
                <FaFacebook size={16} />
              </a>
              <a href="https://www.instagram.com/ab.salonn" target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-[#a3a3a3] hover:text-[#E1306C] hover:border-[#E1306C] hover:-translate-y-1 transition-all duration-300">
                <FaInstagram size={16} />
              </a>
              <a href="https://www.tiktok.com/@ab.salon6" target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center text-[#a3a3a3] hover:text-white hover:border-white hover:-translate-y-1 transition-all duration-300">
                <FaTiktok size={16} />
              </a>
            </div>
            
            <div className="pt-2 border-t border-[#1a1a1a] mt-auto">
              <p className="text-gray-400 text-[10px] leading-relaxed">
                {t('cancel_notice')}
                <span className="text-white font-semibold block mt-1 hover:text-[#d32f2f] transition-colors" dir="ltr">
                  +20 11* *** ****
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-center md:justify-between items-center pt-8 border-t border-[#1a1a1a] text-[#555] text-[10px] md:text-xs text-center gap-2" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          <p>© {new Date().getFullYear()} NAME Salon. {t('all_rights')}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;