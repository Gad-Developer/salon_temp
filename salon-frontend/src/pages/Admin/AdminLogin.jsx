import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminContext';
import { useLanguage } from '../../utils/LanguageContext';
import { Lock, User, Loader2, ShieldCheck } from 'lucide-react';

const AdminLogin = () => {
  const { lang } = useLanguage();
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-md bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#d32f2f] to-[#141414]"></div>

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#0a0a0a] border border-[#333] rounded-full mx-auto flex items-center justify-center mb-4 shadow-[0_0_15px_rgba(211,47,47,0.15)]">
            <ShieldCheck size={32} className="text-[#d32f2f]" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-widest text-white" dir="ltr">
            ADMIN <span className="text-[#d32f2f]">PORTAL</span>
          </h1>
          <p className="text-[#a3a3a3] text-xs font-bold uppercase tracking-wider mt-2">
            {lang === 'ar' ? 'تسجيل دخول الإدارة' : 'Secure Authorization Required'}
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 text-red-500 text-xs font-bold p-3 rounded text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-[#555] uppercase mb-1.5">
              {lang === 'ar' ? 'البريد الإلكتروني' : 'Admin Email'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#555]">
                <User size={16} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-[#d32f2f] transition-colors text-sm font-bold"
                placeholder="admin@salon.com"
                dir="ltr"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-[#555] uppercase mb-1.5">
              {lang === 'ar' ? 'كلمة المرور' : 'Password'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#555]">
                <Lock size={16} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-[#333] rounded-lg pl-10 pr-4 py-3 text-white outline-none focus:border-[#d32f2f] transition-colors text-sm font-bold"
                placeholder="••••••••"
                dir="ltr"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#d32f2f] hover:bg-red-700 text-white py-3.5 rounded-lg font-black text-xs uppercase tracking-widest transition-all mt-4 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(211,47,47,0.3)] hover:shadow-[0_0_20px_rgba(211,47,47,0.5)] disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={18} /> : (lang === 'ar' ? 'تأكيد الدخول' : 'Authorize & Enter')}
          </button>
        </form>

        <button 
          onClick={() => navigate('/')}
          className="w-full text-center mt-6 text-[#555] hover:text-white text-[10px] font-bold uppercase tracking-widest transition-colors"
        >
          {lang === 'ar' ? 'العودة للموقع' : 'Return to Public Site'}
        </button>

      </div>
    </div>
  );
};

export default AdminLogin;
