import React, { useState } from 'react';
import axios from 'axios';
import { Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../utils/LanguageContext';

const SubmitReview = () => {
  const { t, lang } = useLanguage();
  const [step, setStep] = useState(1); 
  const [code, setCode] = useState('');
  const [formData, setFormData] = useState({ clientName: '', rating: 5, text: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const memberType = 'Customer'; 

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (code.length < 5) {
      setError(t('error_invalid_code_length'));
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/reviews/validate-code', { code });
      setStep(2); 
    } catch (err) {
      setError(t('error_invalid_code'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await axios.post('/api/reviews/submit', {
        code,
        ...formData,
        memberType
      });
      setStep(3);
    } catch (err) {
      setError(t('error_submit_failed'));
      if (err.response?.status === 400) setStep(1); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4 py-20 font-sans" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full bg-[#111] p-8 rounded-2xl border border-[#2a2a2a] shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2" dir="ltr">
            NAME <span className="text-[#d32f2f]">Salon</span>
          </h2>
          <p className="text-[#a3a3a3] text-sm">{t('feedback_portal')}</p>
        </div>

        {error && <div className="bg-[#d32f2f]/10 border border-[#d32f2f]/50 text-[#d32f2f] p-3 rounded-lg text-sm mb-6 text-center">{error}</div>}

        {/* STEP 1: Verification */}
        {step === 1 && (
          <form onSubmit={handleVerifyCode} className="space-y-6 animate-fade-in-up">
            <div className={`text-${lang === 'ar' ? 'right' : 'left'}`}>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-2">{t('enter_code')}</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="A4F8B2"
                className="w-full bg-[#141414] border border-[#333] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d32f2f] text-center tracking-[0.3em] font-mono text-lg uppercase"
                dir="ltr"
                required
              />
              <p className="text-[#555] text-xs text-center mt-3 leading-relaxed">{t('code_help')}</p>
            </div>
            <button disabled={loading} className="w-full bg-[#d32f2f] text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all border border-[#d32f2f]">
              {loading ? t('verifying') : t('verify_btn')}
            </button>
          </form>
        )}

        {/* STEP 2: Write Review */}
        {step === 2 && (
          <form onSubmit={handleSubmitReview} className="space-y-6 animate-fade-in-up">
            <div className={`text-${lang === 'ar' ? 'right' : 'left'}`}>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-2">{t('your_name')}</label>
              <input 
                type="text" 
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                className="w-full bg-[#141414] border border-[#333] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d32f2f]"
                required
              />
            </div>

            <div className="text-center">
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-2">{t('rating_label')}</label>
              <div className="flex gap-2 justify-center bg-[#141414] border border-[#333] p-4 rounded-lg" dir="ltr">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button"
                    onClick={() => setFormData({...formData, rating: star})}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star size={28} fill={star <= formData.rating ? "#eab308" : "none"} stroke={star <= formData.rating ? "#eab308" : "#555"} />
                  </button>
                ))}
              </div>
            </div>

            <div className={`text-${lang === 'ar' ? 'right' : 'left'}`}>
              <label className="block text-xs font-bold text-[#555] uppercase tracking-wider mb-2">{t('your_review')}</label>
              <textarea 
                rows="4"
                value={formData.text}
                onChange={(e) => setFormData({...formData, text: e.target.value})}
                placeholder={t('review_placeholder')}
                className="w-full bg-[#141414] border border-[#333] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-[#d32f2f] resize-none"
                required
              ></textarea>
            </div>

            <button disabled={loading} className="w-full bg-[#d32f2f] text-white py-3.5 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-black transition-all border border-[#d32f2f]">
              {loading ? t('submitting') : t('submit_review_btn')}
            </button>
          </form>
        )}

        {/* STEP 3: Success */}
        {step === 3 && (
          <div className="text-center py-6 animate-fade-in-up">
            <div className="w-16 h-16 bg-[#d32f2f]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star size={32} className="text-[#d32f2f]" fill="currentColor" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">{t('thank_you')}</h3>
            <p className="text-[#a3a3a3] text-sm mb-8">{t('review_success')}</p>
            <Link to="/" className="inline-block border border-[#333] text-white px-8 py-3 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-[#d32f2f] hover:border-[#d32f2f] transition-all">
              {t('return_home')}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitReview;