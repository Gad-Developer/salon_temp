import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useLanguage } from '../../utils/LanguageContext';
import { Globe, Bell, UserCircle, Menu, X, Loader2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminContext';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const { lang, toggleLanguage } = useLanguage();
  const { admin, isLoading } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#d32f2f]" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#141414] border-b border-[#2a2a2a] sticky top-0 z-50">
        <h1 className="text-xl font-black tracking-widest" dir="ltr">
          NAME <span className="text-[#d32f2f]">ADMIN</span>
        </h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-[#a3a3a3] hover:text-white transition-colors">
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Imported Sidebar */}
      <AdminSidebar 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />

      {/* Main Content Rendering Area */}
      <main className="flex-1 min-w-0 p-4 md:p-6 bg-[#0a0a0a] overflow-x-hidden flex flex-col h-screen">
        
        {/* TOP HEADER */}
        <header className="flex justify-end items-center gap-4 md:gap-6 mb-6 pb-4 border-b border-[#2a2a2a] flex-shrink-0">
          <button 
            onClick={toggleLanguage} 
            className="flex items-center gap-2 text-xs font-bold text-[#a3a3a3] hover:text-white transition-colors uppercase"
          >
            <Globe size={16} />
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          
          <button className="relative text-[#a3a3a3] hover:text-white transition-colors">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#d32f2f] rounded-full border-2 border-[#0a0a0a]"></span>
          </button>

          <div className={`flex items-center gap-3 ${lang === 'ar' ? 'pr-4 border-r' : 'pl-4 border-l'} border-[#2a2a2a]`}>
            <UserCircle size={32} className="text-white" />
            <div className="hidden sm:block text-start">
              <p className="text-xs font-black text-white uppercase tracking-wider leading-tight">{admin.role}</p>
              <p className="text-[10px] text-[#a3a3a3]">{admin.email}</p>
            </div>
          </div>
        </header>

        {/* SCROLLABLE OUTLET CONTAINER */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-8">
            <Outlet />
          </div>
        </div>

      </main>
    </div>
  );
};

export default AdminLayout;