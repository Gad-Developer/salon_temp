import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { KeyRound, Copy, CheckCircle2, MessageSquare, Star, Trash2, Loader2 } from 'lucide-react';
import { useLanguage } from '../../utils/LanguageContext';
import { useAdminAuth } from '../../context/AdminContext';

const StaffPortal = () => {
  const { t, lang } = useLanguage();
  const { admin } = useAdminAuth();
  const [error, setError] = useState('');
  const [activeCodes, setActiveCodes] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [codesRes, reviewsRes] = await Promise.all([
        axios.get('/api/reviews/active-codes'),
        axios.get('/api/reviews')
      ]);
      if (codesRes.data.codes) setActiveCodes(codesRes.data.codes);
      if (reviewsRes.data) setReviews(reviewsRes.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 30 seconds for live updates to codes and new reviews
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const response = await axios.post('/api/reviews/generate-code');
      setActiveCodes(prev => [{ code: response.data.code, _id: Date.now() }, ...prev]);
    } catch (err) {
      setError(t('error_generate_failed') || 'Failed to generate code.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (codeString) => {
    navigator.clipboard.writeText(codeString);
    setCopiedCode(codeString);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm(lang === 'ar' ? 'هل أنت متأكد من حذف هذا التقييم؟' : 'Permanently delete this review?')) return;
    try {
      await axios.delete(`/api/reviews/${id}`);
      fetchData(); // Refresh inbox
    } catch (err) {
      alert("Failed to delete review.");
    }
  };

  return (
    <div className="w-full animate-fade-in-up" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-white mb-2">
          {lang === 'ar' ? 'بوابة الموظفين والتقييمات' : 'Staff Portal & Reviews'}
        </h2>
        <div className="w-16 h-1 bg-[#d32f2f] rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Code Generator */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl">
            {error && <div className="bg-[#d32f2f]/10 border border-[#d32f2f]/50 text-[#d32f2f] p-3 rounded-lg text-sm mb-6">{error}</div>}

            <div className="text-start mb-6">
              <p className="text-[#a3a3a3] text-[10px] uppercase font-bold tracking-wider mb-4 px-1 flex items-center gap-2">
                <KeyRound size={14} className="text-blue-400" />
                {t('active_code_label') || 'Active Codes'} ({activeCodes.length})
              </p>
              
              {activeCodes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 overflow-y-auto max-h-[300px] custom-scrollbar pb-2 pr-1">
                  {activeCodes.map((item) => (
                    <div key={item._id} className="bg-[#0a0a0a] border border-[#333] rounded-xl p-4 flex flex-col items-center justify-center h-[120px] group hover:border-[#d32f2f] transition-all relative">
                      <p className="text-lg font-black tracking-widest font-mono text-white mb-3" dir="ltr">
                        {item.code}
                      </p>
                      <button 
                        onClick={() => handleCopy(item.code)}
                        className={`flex items-center justify-center gap-2 w-full py-2 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all border ${
                          copiedCode === item.code 
                            ? 'bg-green-500/20 border-green-500/50 text-green-500' 
                            : 'bg-[#1a1a1a] hover:bg-[#333] border-[#333] text-white'
                        }`}
                      >
                        {copiedCode === item.code ? <><CheckCircle2 size={12}/> {t('copied_btn') || 'Copied'}</> : <><Copy size={12}/> {t('copy_code_btn') || 'Copy'}</>}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-[#0a0a0a] border border-dashed border-[#333] rounded-xl p-8 text-[#555] flex flex-col items-center justify-center">
                  <KeyRound size={24} className="mb-3 opacity-50" />
                  <p className="text-xs uppercase tracking-wider font-bold">{t('no_active_code') || 'No Active Codes'}</p>
                </div>
              )}
            </div>

            <button 
              onClick={handleGenerateCode}
              disabled={isGenerating}
              className="w-full bg-[#d32f2f] text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-red-700 transition-all border border-[#d32f2f] flex justify-center items-center gap-2"
            >
              {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              {isGenerating ? (t('generating_btn') || 'Generating...') : (t('generate_new_code_btn') || 'Generate Code')}
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Reviews Inbox */}
        <div className="lg:col-span-2">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 shadow-xl h-full min-h-[500px]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2a2a2a]">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <MessageSquare size={20} className="text-green-400" />
              </div>
              <h2 className="text-lg font-black uppercase tracking-wider">{lang === 'ar' ? 'صندوق التقييمات' : 'Client Feedback Inbox'}</h2>
            </div>

            {isLoading ? (
              <div className="text-center py-20 text-[#555]"><Loader2 size={32} className="animate-spin mx-auto" /></div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-[#333] rounded-xl text-[#555]">
                {lang === 'ar' ? 'لا توجد تقييمات حتى الآن.' : 'No reviews received yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {reviews.map(review => (
                  <div key={review._id} className="bg-[#0a0a0a] border border-[#333] rounded-lg p-5 flex flex-col relative group hover:border-[#555] transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-black text-white text-base leading-tight">{review.clientName}</h4>
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${review.memberType === 'VIP Member' ? 'text-[#d32f2f]' : 'text-[#a3a3a3]'}`}>
                          {review.memberType}
                        </span>
                      </div>
                      <div className="flex gap-1" dir="ltr">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={12} className={i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-[#333]"} />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-[#a3a3a3] leading-relaxed mb-4 flex-grow">"{review.text}"</p>
                    <div className="flex justify-between items-end mt-auto pt-3 border-t border-[#222]">
                      <span className="text-[9px] text-[#555] font-bold uppercase tracking-widest">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                      {admin?.role === 'Super Admin' && (
                        <button 
                          onClick={() => handleDeleteReview(review._id)} 
                          className="text-[10px] text-red-500 hover:text-red-400 font-bold uppercase tracking-widest flex items-center gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 size={12} /> {lang === 'ar' ? 'حذف' : 'Delete'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default StaffPortal;