import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../utils/LanguageContext';
import { useAdminAuth } from '../../context/AdminContext';
import {
  LayoutDashboard, Calendar, ShoppingBag, Scissors, Package,
  Store, Users, MapPin, Star, Key, Shield, LogOut
} from 'lucide-react';

const AdminSidebar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { lang } = useLanguage();
  const { admin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const navSections = [
    {
      title: lang === 'ar' ? 'نظرة عامة' : 'Overview',
      items: [
        { name: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard', path: '/admin', icon: LayoutDashboard }
      ]
    },
    {
      title: lang === 'ar' ? 'العمليات اليومية' : 'Daily Operations',
      items: [
        { name: lang === 'ar' ? 'الحجوزات' : 'Appointments', path: '/admin/appointments', icon: Calendar },
        { name: lang === 'ar' ? 'طلبات المنتجات' : 'Product Orders', path: '/admin/orders', icon: ShoppingBag }
      ]
    },
    {
      title: lang === 'ar' ? 'القائمة والمتجر' : 'Menu & Retail',
      items: [
        { name: lang === 'ar' ? 'الخدمات' : 'Services', path: '/admin/services', icon: Scissors },
        { name: lang === 'ar' ? 'الباقات' : 'VIP Packages', path: '/admin/packages', icon: Package },
        { name: lang === 'ar' ? 'المنتجات' : 'Products', path: '/admin/products', icon: Store }
      ]
    },
    {
      title: lang === 'ar' ? 'إعدادات العمل' : 'Business Setup',
      items: [
        { name: lang === 'ar' ? 'الموظفين' : 'Professionals', path: '/admin/professionals', icon: Users, restrict: 'Super Admin' },
        { name: lang === 'ar' ? 'الفروع' : 'Branches', path: '/admin/branches', icon: MapPin, restrict: 'Super Admin' }
      ]
    },
    {
      title: lang === 'ar' ? 'العملاء والصلاحيات' : 'Client Relations & Access',
      items: [
        // COMBINED REVIEWS AND CODES INTO ONE LINK
        { name: lang === 'ar' ? 'التقييمات والأكواد' : 'Reviews & Codes', path: '/admin/reviews', icon: Star },
        { name: lang === 'ar' ? 'إدارة النظام' : 'System Settings', path: '/admin/settings', icon: Shield, restrict: 'Super Admin' }
      ]
    }
  ];

  const filteredNavSections = navSections.map(section => ({
    ...section,
    items: section.items.filter(item => !item.restrict || item.restrict === admin?.role)
  })).filter(section => section.items.length > 0);

  return (
    <aside className={`
      ${isMobileMenuOpen ? 'block' : 'hidden'} 
      md:block w-full md:w-56 bg-[#141414] border-r border-[#2a2a2a] 
      flex-shrink-0 sticky top-0 h-screen overflow-y-auto custom-scrollbar z-40 flex flex-col
    `}>
      {/* Tighter header padding and smaller text size to prevent wrapping */}
      <div className="p-4 hidden md:block">
        <h1 className="text-lg font-black tracking-wider text-white mb-0.5" dir="ltr">
          NAME <span className="text-[#d32f2f]">ADMIN</span>
        </h1>
        <p className="text-[#a3a3a3] text-[9px] uppercase tracking-wider font-bold">
          {lang === 'ar' ? 'مركز القيادة' : 'Command Center'}
        </p>
      </div>

      {/* Reduced vertical space from space-y-6 to space-y-4 */}
      <nav className="p-3 space-y-4 flex-grow">
        {filteredNavSections.map((section, idx) => (
          <div key={idx}>
            {/* Reduced margin bottom */}
            <h3 className="text-[10px] font-bold text-[#555] uppercase tracking-widest mb-1.5 px-3">
              {section.title}
            </h3>
            {/* Reduced spacing between items from space-y-1 to space-y-0.5 */}
            <div className="space-y-0.5">
              {section.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  end={item.path === '/admin'}
                  onClick={() => setIsMobileMenuOpen(false)}
                  // Shrunk padding from py-2.5 to py-1.5, smaller icons, smaller text
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                      isActive
                        ? 'bg-[#d32f2f]/10 text-[#d32f2f] border border-[#d32f2f]/30 shadow-[0_0_10px_rgba(211,47,47,0.1)]'
                        : 'text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-white border border-transparent'
                    }`
                  }
                >
                  <item.icon size={14} />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-[#2a2a2a] sticky bottom-0 bg-[#141414]">
        <button 
          onClick={() => {
            logout();
            navigate('/');
          }} 
          className="flex items-center gap-2.5 px-3 py-2 w-full rounded-md text-[11px] font-bold text-[#a3a3a3] hover:bg-[#1a1a1a] hover:text-[#d32f2f] transition-all border border-transparent"
        >
          <LogOut size={14} />
          {lang === 'ar' ? 'تسجيل الخروج' : 'Logout / Home'}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;